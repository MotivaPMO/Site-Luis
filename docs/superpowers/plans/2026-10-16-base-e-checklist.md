# Base do Site + Checklist de Movimentação — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site (celular e PC) que preenche o "Plano para Movimentação de Carga" com todos os campos do Excel original, inclusive as 4 assinaturas, e gera um PDF no layout do original.

**Architecture:** SPA estática em Vite + React + TypeScript, sem backend. As definições de campos e itens são **dados** (`grupos.ts`, `itens.ts`); a tela e o PDF percorrem as mesmas definições, então todo campo que existe na tela também sai no PDF. Estado único (`ChecklistData`) salvo como rascunho no `localStorage`.

**Tech Stack:** Vite, React 18+, TypeScript, react-router-dom (HashRouter), `@react-pdf/renderer`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-16-base-e-checklist-design.md`

## Global Constraints

- Site estático, sem login, sem banco de dados, sem offline, sem backend.
- Rótulos e textos dos itens copiados **literalmente** do `Plano de Movimentação de Carga Checklist.xlsx`; a numeração do original pula a seção "3" e é mantida (seções: 1, 2, 4).
- **Todos** os campos de preencher do Excel existem na tela e no PDF, incluindo as assinaturas (especialista ×2, Segurança do Trabalho, Operador).
- Cada item de verificação é S / N / NA, escolha única, botões grandes de toque.
- PDF: A4 retrato, mesmo layout do Excel, logo CCR EngeMob, nome `checklist-AAAA-MM-DD-<PT>.pdf`.
- Revisão avisa itens sem resposta mas **não bloqueia** o PDF.
- Relação Peso/Capacidade: calculada a partir do peso (item 13 da seção 2) e da capacidade da máquina; editável; acima de 75% só avisa no item "Plano de Rigging" (não marca sozinho).
- Visual verde-água, botões grandes, campos numéricos aceitam vírgula decimal.
- Se o `localStorage` estiver indisponível, funciona sem rascunho.
- Código e textos de interface em português; identificadores em português sem acentos.

## Estrutura de arquivos

```
package.json, tsconfig.json, vite.config.ts, index.html, .gitignore
src/
  main.tsx                      entrada, HashRouter
  App.tsx                       rotas / e /checklist
  index.css                     todo o estilo
  assets/logo-ccr-engemob.png   logo (copiado de assets-origem/)
  pages/Home.tsx                cards
  pages/Checklist.tsx           formulário em etapas + revisão
  components/
    CampoInput.tsx              renderiza um Campo (texto/data/hora/escolha, unidade opcional)
    SimNaoNa.tsx                botões S / N / NA
    SignaturePad.tsx            assinatura desenhada (canvas → PNG dataURL)
    GrupoView.tsx               renderiza um Grupo (campos + assinaturas)
    ItemView.tsx                renderiza um Item do checklist
  checklist/
    definicao.ts                tipos: Campo, Grupo, Item, Secao
    grupos.ts                   GRUPOS_MAQUINA, GRUPOS_LIBERACAO, TITULO_LIBERACAO
    itens.ts                    SECOES (equipe 4 itens, liberação 16 itens)
    schema.ts                   ChecklistData, dadosVazios
    calc.ts                     parseNumero, emKg, relacaoAuto, relacaoEfetiva, acimaDe75
    format.ts                   formatarData, formatarHora, nomeArquivo
    storage.ts                  getStore, loadDraft, saveDraft, clearDraft
    useChecklist.ts             hook de estado + rascunho
    ChecklistPdf.tsx            documento PDF
    gerarPdf.tsx                gera e baixa o PDF
    *.test.ts                   testes Vitest
```

---

### Task 1: Esqueleto do projeto, tema e Home

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/pages/Home.tsx`, `src/pages/Checklist.tsx` (placeholder), `src/assets/logo-ccr-engemob.png`

**Interfaces:**
- Produces: rotas `/` (Home) e `/checklist`; classes CSS usadas pelas tarefas seguintes (`.app`, `.topbar`, `.home-grid`, `.card`, `.grupo`, `.campo`, `.rotulo`, `.campo-linha`, `.escolha`, `.btn`, `.btn.primario`, `.btn.perigo`, `.item`, `.item-texto`, `.snn`, `.marcas`, `.assinatura`, `.aviso`, `.passos`, `.rodape-nav`, `.pendentes`).

- [ ] **Step 1: Inicializar git e instalar dependências**

Run (na raiz `C:\Repositorio\site-luis`):
```bash
git init
npm init -y
npm install react react-dom react-router-dom @react-pdf/renderer
npm install -D vite @vitejs/plugin-react typescript vitest @types/react @types/react-dom
```
Expected: `node_modules/` criado, sem erros.

- [ ] **Step 2: Ajustar `package.json`**

Substitua os campos `name`, `type`, `scripts` (mantenha `dependencies`/`devDependencies` gerados):
```json
{
  "name": "site-luis",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Criar arquivos de configuração**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node' },
})
```

`.gitignore`:
```
node_modules
dist
tmp
```

`index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#007c7a" />
    <title>Movimentação de Carga</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Copiar o logo**

Run:
```bash
mkdir -p src/assets && cp assets-origem/logo-ccr-engemob.png src/assets/logo-ccr-engemob.png
```

- [ ] **Step 5: Criar `src/main.tsx`, `src/App.tsx`, páginas e CSS**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
```

`src/App.tsx`:
```tsx
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Checklist from './pages/Checklist'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checklist" element={<Checklist />} />
    </Routes>
  )
}
```

`src/pages/Home.tsx`:
```tsx
import { Link } from 'react-router-dom'
import logo from '../assets/logo-ccr-engemob.png'

export default function Home() {
  return (
    <div className="app">
      <header className="topbar">
        <img src={logo} alt="CCR EngeMob" height={32} />
        <h1>Movimentação de Carga</h1>
      </header>
      <main className="home-grid">
        <Link to="/checklist" className="card">
          <strong>Checklist</strong>
          <span>Plano para Movimentação de Carga</span>
        </Link>
        <div className="card disabled" aria-disabled="true">
          <strong>Plano de Içamento</strong>
          <span>Em breve</span>
        </div>
        <div className="card disabled" aria-disabled="true">
          <strong>Ferramentas</strong>
          <span>Em breve</span>
        </div>
      </main>
    </div>
  )
}
```

`src/pages/Checklist.tsx` (placeholder, substituído na Task 6):
```tsx
export default function Checklist() {
  return <div className="app">Checklist</div>
}
```

`src/index.css`:
```css
:root {
  --cor: #007c7a;
  --cor-escura: #005a58;
  --cor-clara: #e0f2f1;
  --texto: #1b1b1b;
  --borda: #b8c4c4;
  --erro: #c62828;
  --aviso: #b26a00;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, Segoe UI, Roboto, sans-serif; color: var(--texto); background: #f4f7f7; font-size: 17px; }
.app { max-width: 720px; margin: 0 auto; padding: 0 16px 96px; }
.topbar { display: flex; align-items: center; gap: 12px; background: var(--cor); color: #fff; margin: 0 -16px 16px; padding: 12px 16px; }
.topbar img { background: #fff; border-radius: 6px; padding: 2px 6px; }
.topbar h1 { font-size: 1.1rem; margin: 0; }
.home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.card { display: flex; flex-direction: column; gap: 6px; background: #fff; border: 2px solid var(--cor); border-radius: 12px; padding: 20px; text-decoration: none; color: var(--texto); min-height: 110px; }
.card strong { color: var(--cor-escura); font-size: 1.15rem; }
.card.disabled { border-color: var(--borda); opacity: .6; }
.passos { display: flex; gap: 6px; overflow-x: auto; margin: 0 -16px 16px; padding: 0 16px; }
.passos button { flex: 0 0 auto; border: 1px solid var(--cor); background: #fff; color: var(--cor-escura); border-radius: 999px; padding: 8px 14px; font-size: .9rem; }
.passos button.ativo { background: var(--cor); color: #fff; }
.grupo { background: #fff; border: 1px solid var(--borda); border-radius: 12px; padding: 14px; margin-bottom: 14px; }
.grupo h3 { margin: 0 0 10px; color: var(--cor-escura); font-size: 1rem; }
.campo { display: block; margin-bottom: 12px; }
.rotulo { display: block; font-size: .85rem; color: #444; margin-bottom: 4px; }
.campo-linha { display: flex; gap: 8px; }
input[type=text], input[type=date], input[type=time], select { width: 100%; min-height: 46px; font-size: 1rem; padding: 8px 10px; border: 1px solid var(--borda); border-radius: 8px; background: #fff; }
.campo-linha select { width: 90px; flex: 0 0 90px; }
.escolha { display: flex; gap: 8px; }
.escolha button, .snn button { flex: 1; min-height: 48px; border: 2px solid var(--cor); background: #fff; color: var(--cor-escura); border-radius: 10px; font-size: 1rem; font-weight: 600; }
.escolha button.ativo, .snn button.ativo { background: var(--cor); color: #fff; }
.item { background: #fff; border: 1px solid var(--borda); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.item-texto { margin: 0 0 10px; line-height: 1.35; }
.snn { display: flex; gap: 8px; margin-bottom: 8px; }
.marcas label { display: flex; align-items: center; gap: 10px; min-height: 40px; }
.marcas input { width: 22px; height: 22px; }
.assinatura canvas { width: 100%; height: 150px; border: 2px dashed var(--borda); border-radius: 8px; background: #fff; touch-action: none; display: block; }
.assinatura .acoes { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.aviso { background: #fff4e0; border-left: 4px solid var(--aviso); padding: 8px 10px; margin: 8px 0; border-radius: 4px; color: #6b4000; }
.pendentes { margin: 8px 0 16px; padding-left: 20px; }
.btn { min-height: 48px; padding: 0 20px; border-radius: 10px; border: 2px solid var(--cor); background: #fff; color: var(--cor-escura); font-size: 1rem; font-weight: 600; cursor: pointer; }
.btn.primario { background: var(--cor); color: #fff; }
.btn.perigo { border-color: var(--erro); color: var(--erro); }
.btn:disabled { opacity: .5; }
.rodape-nav { position: fixed; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; gap: 12px; padding: 10px 16px; background: #fff; border-top: 1px solid var(--borda); }
.rodape-nav .btn { flex: 1; max-width: 340px; }
```

- [ ] **Step 6: Verificar build e abrir no navegador**

Run: `npm run build`
Expected: termina sem erros de TypeScript e gera `dist/`.

Run: `npm run dev` (em segundo plano) e abra `http://localhost:5173/`.
Expected: topo verde-água com o logo, 3 cards (Checklist ativo, dois "Em breve").

- [ ] **Step 7: Commit**
```bash
git add -A
git commit -m "chore: esqueleto Vite+React, tema e Home"
```

---

### Task 2: Definições de campos e itens (dados do Excel)

**Files:**
- Create: `src/checklist/definicao.ts`, `src/checklist/grupos.ts`, `src/checklist/itens.ts`, `src/checklist/schema.ts`
- Test: `src/checklist/definicao.test.ts`

**Interfaces:**
- Produces:
  - `type Campo = {kind:'texto'; id; label; inputMode?; unidades?: string[]; calculado?: boolean} | {kind:'data'|'hora'; id; label} | {kind:'escolha'; id; label; opcoes: string[]}`
  - `interface Assinatura {id: string; label: string}`
  - `interface Grupo {id; titulo; campos: Campo[]; assinaturas?: Assinatura[]}`
  - `interface Item {id; texto; marcas?: {id; label}[]; campos?: Campo[]; assinatura?: Assinatura}`
  - `interface Secao {id; titulo; itens: Item[]}`
  - `GRUPOS_MAQUINA: Grupo[]`, `GRUPOS_LIBERACAO: Grupo[]`, `TITULO_LIBERACAO: string`, `SECOES: Secao[]`
  - `type Resp = 'S'|'N'|'NA'`; `interface ChecklistData {campos: Record<string,string>; respostas: Record<string,Resp>; marcas: Record<string,boolean>; assinaturas: Record<string,string>}`; `dadosVazios(): ChecklistData`
  - Chaves de dados: campo → `campos[campo.id]`; unidade → `campos[campo.id + '.unidade']`; marca → `marcas[item.id + '.' + marca.id]`; assinatura → `assinaturas[assinatura.id]`; resposta → `respostas[item.id]`.
  - IDs fixos usados por outras tarefas: `capacidadeRaio`, `relacao`, `lib13.peso` (peso, item 13 da seção 2), `lib2` (Plano de Rigging), `numeroPT`, `data`.

- [ ] **Step 1: Escrever o teste que falha**

`src/checklist/definicao.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { GRUPOS_MAQUINA, GRUPOS_LIBERACAO } from './grupos'
import { SECOES } from './itens'

const grupos = [...GRUPOS_MAQUINA, ...GRUPOS_LIBERACAO]
const itens = SECOES.flatMap((s) => s.itens)

describe('definição do checklist', () => {
  it('tem 4 itens de equipe e 16 de liberação', () => {
    expect(SECOES.map((s) => s.itens.length)).toEqual([4, 16])
  })

  it('todo item tem texto', () => {
    for (const i of itens) expect(i.texto.length).toBeGreaterThan(10)
  })

  it('ids de campos, itens e assinaturas são únicos', () => {
    const ids = [
      ...grupos.flatMap((g) => [...g.campos.map((c) => c.id), ...(g.assinaturas ?? []).map((a) => a.id)]),
      ...itens.flatMap((i) => [i.id, ...(i.campos ?? []).map((c) => c.id), ...(i.assinatura ? [i.assinatura.id] : [])]),
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('existem as 4 assinaturas do original', () => {
    const n =
      grupos.reduce((t, g) => t + (g.assinaturas?.length ?? 0), 0) +
      itens.filter((i) => i.assinatura).length
    expect(n).toBe(4)
  })

  it('campos usados pelos cálculos existem', () => {
    const ids = [...grupos.flatMap((g) => g.campos), ...itens.flatMap((i) => i.campos ?? [])].map((c) => c.id)
    for (const id of ['capacidadeRaio', 'relacao', 'lib13.peso', 'numeroPT', 'data']) expect(ids).toContain(id)
    expect(itens.map((i) => i.id)).toContain('lib2')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/checklist/definicao.test.ts`
Expected: FAIL (módulos `./grupos` e `./itens` não existem).

- [ ] **Step 3: Criar tipos e schema**

`src/checklist/definicao.ts`:
```ts
export type Campo =
  | { kind: 'texto'; id: string; label: string; inputMode?: 'text' | 'decimal' | 'numeric'; unidades?: string[]; calculado?: boolean }
  | { kind: 'data' | 'hora'; id: string; label: string }
  | { kind: 'escolha'; id: string; label: string; opcoes: string[] }

export interface Assinatura {
  id: string
  label: string
}

export interface Grupo {
  id: string
  titulo: string
  campos: Campo[]
  assinaturas?: Assinatura[]
}

export interface Marca {
  id: string
  label: string
}

export interface Item {
  id: string
  texto: string
  marcas?: Marca[]
  campos?: Campo[]
  assinatura?: Assinatura
}

export interface Secao {
  id: string
  titulo: string
  itens: Item[]
}
```

`src/checklist/schema.ts`:
```ts
export type Resp = 'S' | 'N' | 'NA'

export interface ChecklistData {
  campos: Record<string, string>
  respostas: Record<string, Resp>
  marcas: Record<string, boolean>
  assinaturas: Record<string, string>
}

export const dadosVazios = (): ChecklistData => ({
  campos: {},
  respostas: {},
  marcas: {},
  assinaturas: {},
})
```

- [ ] **Step 4: Criar `grupos.ts`**

`src/checklist/grupos.ts`:
```ts
import type { Grupo } from './definicao'

export const GRUPOS_MAQUINA: Grupo[] = [
  {
    id: 'maquina',
    titulo: 'MÁQUINA',
    campos: [
      { kind: 'texto', id: 'modelo', label: 'Modelo' },
      { kind: 'texto', id: 'raio', label: 'Raio de operação (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'capacidadeRaio', label: 'Capacidade da máquina p/ o raio (m)', inputMode: 'decimal', unidades: ['Ton', 'Kg'] },
      { kind: 'escolha', id: 'quadrante', label: 'Quadrante da operação', opcoes: ['Frontal', 'Lateral'] },
      { kind: 'texto', id: 'lanca', label: 'Comprimento da lança (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'jib', label: 'Comprimento do Jib (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'relacao', label: 'Relação Peso/Capacidade da máquina p/ o raio', inputMode: 'decimal', calculado: true },
    ],
  },
  {
    id: 'lingada',
    titulo: 'LINGADA',
    campos: [
      { kind: 'escolha', id: 'lingadaTipo', label: 'Tipo', opcoes: ['Cabo', 'Cinta'] },
      { kind: 'texto', id: 'lingadaDiametro', label: 'Diâmetro (mm)', inputMode: 'decimal' },
      { kind: 'texto', id: 'lingadaComprimento', label: 'Comprimento (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'lingadaPernas', label: 'Quantidade de pernas', inputMode: 'numeric' },
      { kind: 'texto', id: 'lingadaCapacidadePerna', label: 'Capacidade por perna', inputMode: 'decimal' },
    ],
  },
  {
    id: 'acessorios',
    titulo: 'ACESSÓRIOS',
    campos: [
      { kind: 'texto', id: 'manilhas', label: 'Manilhas' },
      { kind: 'texto', id: 'manilhaQtd', label: 'Quantidade', inputMode: 'numeric' },
      { kind: 'texto', id: 'manilhaDiametro', label: 'Diâmetro (mm)', inputMode: 'decimal' },
      { kind: 'texto', id: 'manilhaCapacidade', label: 'Capac. p/ manilha (kg)', inputMode: 'decimal' },
      { kind: 'texto', id: 'separadorDimensoes', label: 'Separadores de Cabo – Dimensões (mm)' },
      { kind: 'texto', id: 'separadorCapacidade', label: 'Separadores de Cabo – Capac. do cabo (kg)', inputMode: 'decimal' },
    ],
  },
]

export const TITULO_LIBERACAO = '4. DADOS DA LIBERAÇÃO'

export const GRUPOS_LIBERACAO: Grupo[] = [
  {
    id: 'dataHora',
    titulo: 'DATA E HORA',
    campos: [
      { kind: 'data', id: 'data', label: 'Data' },
      { kind: 'hora', id: 'hora', label: 'Hora' },
      { kind: 'texto', id: 'numeroPT', label: 'Número da PT' },
    ],
  },
  {
    id: 'segurancaTrabalho',
    titulo: 'SEGURANÇA DO TRABALHO',
    campos: [
      { kind: 'texto', id: 'segNome', label: 'Nome' },
      { kind: 'texto', id: 'segMatricula', label: 'Matrícula' },
    ],
    assinaturas: [{ id: 'segAssinatura', label: 'Assinatura' }],
  },
  {
    id: 'operador',
    titulo: 'OPERADOR',
    campos: [
      { kind: 'texto', id: 'opNome', label: 'Nome' },
      { kind: 'texto', id: 'opMatricula', label: 'Matrícula' },
    ],
    assinaturas: [{ id: 'opAssinatura', label: 'Assinatura' }],
  },
]
```

- [ ] **Step 5: Criar `itens.ts`**

`src/checklist/itens.ts`:
```ts
import type { Secao } from './definicao'

const especialista = (n: number) => ({
  campos: [{ kind: 'texto' as const, id: `lib${n}.especialista`, label: 'Nome Especialista' }],
  assinatura: { id: `lib${n}.assinatura`, label: 'Assinatura' },
})

export const SECOES: Secao[] = [
  {
    id: 'equipe',
    titulo: '1. EQUIPE – VERIFICAÇÕES GERAIS',
    itens: [
      {
        id: 'eq1',
        texto: 'Acessórios de movimentação de carga, inspecionados e em boas condições? (capacidade de carga deve ser conhecida).',
        marcas: [
          { id: 'cintas', label: 'Cintas' },
          { id: 'cabos', label: 'Cabos' },
          { id: 'manilhas', label: 'Manilhas' },
          { id: 'ganchos', label: 'Ganchos (com trava)' },
          { id: 'estropos', label: 'Estropos' },
        ],
      },
      { id: 'eq2', texto: 'Material para sinalização e isolamento disponível?' },
      { id: 'eq3', texto: 'Realizado check list do equipamento antes do inicio da atividade diária? (Empresa terceira ou área dono da máquina)' },
      { id: 'eq4', texto: 'Rádio comunicação disponivel quando não há visualização entre sinaleiro e operador?' },
    ],
  },
  {
    id: 'liberacao',
    titulo: '2. LIBERAÇÃO DO SERVIÇO E AMBIENTE',
    itens: [
      { id: 'lib1', texto: 'PT e APR de movimentação de carga está disponível e conhecida pela equipe executante?' },
      {
        id: 'lib2',
        texto: 'Plano de Rigging está disponível?',
        marcas: [
          { id: 'relacao75', label: 'Relação Peso/Capacidade da máquina p/ o raio maior que 75%' },
          { id: 'duasMaquinas', label: 'Movimentação que envolva mais de uma máquina de carga simultaneamente' },
          { id: 'cotaNegativa', label: 'Içamento ocorra em cota negativa (abaixo do nível zero onde está localizado o guindaste)' },
          { id: 'cinquentaTon', label: 'Movimentação de carga maior ou igual a 50 ton' },
        ],
      },
      { id: 'lib3', texto: 'Operador autorizado certificado?' },
      { id: 'lib4', texto: 'Sinaleiro autorizado certificado?' },
      { id: 'lib5', texto: 'Definida área para isolamento físico?' },
      {
        id: 'lib6',
        texto: 'Se no local de patolamento for identificado solos de brita, grama sem compactação, galerias ou caixas de águas pluviais e industriais, envelopes elétricos, tampas de caixas de passagem e canaletas, foi avaliado por especialista?',
        ...especialista(6),
      },
      {
        id: 'lib7',
        texto: 'Para movimentações sobre pontilhões, pieres e próximas a cristas de taludes foi consultado a área especialista de civil?',
        ...especialista(7),
      },
      { id: 'lib8', texto: 'Indicação da Carga Máxima de Trabalho Permitida e Tabela de Cargas disponíveis?' },
      { id: 'lib9', texto: 'Equipamentos de combate a incêndio, saídas de emergências e rotas de fugas desobstruídas?' },
      { id: 'lib10', texto: 'Solicitada a “AUTORIZAÇÃO DE INTERDIÇÃO DE RUAS” junto a área responsável, caso a movimentação de carga necessite interromper alguma via?' },
      {
        id: 'lib11',
        texto: 'Condições Meteorológicas favoráveis conforme? (Caso negativo a liberação nesta condição será do líder da especialidade de equipe de movimentação de carga ou alguém delegado por este)',
        marcas: [
          { id: 'visibilidade', label: 'Boa Visibilidade' },
          { id: 'semChuva', label: 'Sem chuva/descarga atmosférica' },
          { id: 'iluminacao', label: 'Boa Iluminação' },
          { id: 'semVento', label: 'Sem fortes rajadas de Ventos' },
        ],
      },
      { id: 'lib12', texto: 'Lança distante de linhas energizadas ou subestações conforme tabela do procedimento? (Caso negativo envolver as áreas de sistema e SGI para validar a continuidade dos serviços)' },
      {
        id: 'lib13',
        texto: 'Peso da peça a movimentar conhecido? (no caso de múltiplas peças considerar o mais pesado)',
        campos: [{ kind: 'texto', id: 'lib13.peso', label: 'Informar o Peso', inputMode: 'decimal', unidades: ['Ton', 'Kg'] }],
      },
      { id: 'lib14', texto: 'A máquina de carga foi aterrada em local adequado? (Superfícies que receberam tratamento e pintura, não devem ser utilizadas)' },
      { id: 'lib15', texto: 'O seccionamento, o bloqueio e a instalação do aterramento da rede aérea foram realizados antes do início das atividades de movimentações de cargas?' },
      { id: 'lib16', texto: 'Existem equipamentos, tubulações, instrumentos, equipamentos de emergência, que possam ser atingidos durante a movimentação?' },
    ],
  },
]
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run src/checklist/definicao.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 7: Conferir textos contra o Excel**

Run:
```bash
python -I -c "
import openpyxl,re
ws=openpyxl.load_workbook('Plano de Movimentação de Carga Checklist.xlsx').active
src=open('src/checklist/itens.ts',encoding='utf-8').read()
norm=lambda s:re.sub(r'\s+',' ',s).strip()
for r in range(14,38):
    v=ws.cell(r,2).value
    if not v or v.strip().startswith('(') or len(v)<20: continue
    t=norm(v.split('\n')[0].replace('\u201c','').replace('\u201d','')).split(' Nome Especialista')[0].rstrip()
    print('OK ' if norm(t)[:45] in norm(src.replace('\u201c','').replace('\u201d','')) else 'DIFERE', r, t[:60])
"
```
Expected: todas as linhas `OK`. Qualquer `DIFERE` → corrigir o texto em `itens.ts` copiando literalmente do Excel.

- [ ] **Step 8: Commit**
```bash
git add src/checklist
git commit -m "feat: definições de campos e itens do checklist"
```

---

### Task 3: Cálculo da relação Peso/Capacidade

**Files:**
- Create: `src/checklist/calc.ts`
- Test: `src/checklist/calc.test.ts`

**Interfaces:**
- Consumes: `ChecklistData` de `schema.ts`.
- Produces:
  - `parseNumero(s: string | undefined): number | null`
  - `emKg(valor: string | undefined, unidade: string | undefined): number | null` (unidade ausente = `'Ton'`)
  - `relacaoAutoTexto(d: ChecklistData): string` (percentual com vírgula, `''` se não calculável)
  - `relacaoEfetiva(d: ChecklistData): string` (valor manual de `campos.relacao` se preenchido, senão o automático)
  - `acimaDe75(d: ChecklistData): boolean`

- [ ] **Step 1: Escrever os testes que falham**

`src/checklist/calc.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { parseNumero, emKg, relacaoAutoTexto, relacaoEfetiva, acimaDe75 } from './calc'
import { dadosVazios } from './schema'

const com = (campos: Record<string, string>) => ({ ...dadosVazios(), campos })

describe('parseNumero', () => {
  it('aceita vírgula e ponto decimais', () => {
    expect(parseNumero('1,5')).toBe(1.5)
    expect(parseNumero(' 2.25 ')).toBe(2.25)
  })
  it('retorna null para vazio, indefinido ou texto', () => {
    expect(parseNumero('')).toBeNull()
    expect(parseNumero(undefined)).toBeNull()
    expect(parseNumero('abc')).toBeNull()
  })
})

describe('emKg', () => {
  it('converte Ton para kg e mantém Kg', () => {
    expect(emKg('2', 'Ton')).toBe(2000)
    expect(emKg('500', 'Kg')).toBe(500)
  })
  it('sem unidade assume Ton', () => {
    expect(emKg('1,5', undefined)).toBe(1500)
  })
  it('retorna null para valor inválido', () => {
    expect(emKg('', 'Kg')).toBeNull()
  })
})

describe('relação peso/capacidade', () => {
  it('calcula percentual com uma casa decimal e vírgula', () => {
    const d = com({ 'lib13.peso': '9,04', capacidadeRaio: '20' })
    expect(relacaoAutoTexto(d)).toBe('45,2')
  })
  it('respeita unidades diferentes', () => {
    const d = com({ 'lib13.peso': '5000', 'lib13.peso.unidade': 'Kg', capacidadeRaio: '10' })
    expect(relacaoAutoTexto(d)).toBe('50')
  })
  it('vazio quando falta peso, capacidade ou capacidade é zero', () => {
    expect(relacaoAutoTexto(com({ capacidadeRaio: '20' }))).toBe('')
    expect(relacaoAutoTexto(com({ 'lib13.peso': '5' }))).toBe('')
    expect(relacaoAutoTexto(com({ 'lib13.peso': '5', capacidadeRaio: '0' }))).toBe('')
  })
  it('valor manual vence o automático', () => {
    const d = com({ 'lib13.peso': '9', capacidadeRaio: '20', relacao: '60' })
    expect(relacaoEfetiva(d)).toBe('60')
  })
  it('sem manual usa o automático', () => {
    expect(relacaoEfetiva(com({ 'lib13.peso': '10', capacidadeRaio: '20' }))).toBe('50')
  })
})

describe('acimaDe75', () => {
  it('só é verdadeiro acima de 75%', () => {
    expect(acimaDe75(com({ 'lib13.peso': '16', capacidadeRaio: '20' }))).toBe(true)
    expect(acimaDe75(com({ 'lib13.peso': '15', capacidadeRaio: '20' }))).toBe(false)
    expect(acimaDe75(com({}))).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/checklist/calc.test.ts`
Expected: FAIL (`./calc` não existe).

- [ ] **Step 3: Implementar `calc.ts`**

`src/checklist/calc.ts`:
```ts
import type { ChecklistData } from './schema'

export function parseNumero(s: string | undefined): number | null {
  if (!s) return null
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function emKg(valor: string | undefined, unidade: string | undefined): number | null {
  const n = parseNumero(valor)
  if (n === null) return null
  return unidade === 'Kg' ? n : n * 1000
}

function relacaoAuto(d: ChecklistData): number | null {
  const peso = emKg(d.campos['lib13.peso'], d.campos['lib13.peso.unidade'])
  const cap = emKg(d.campos.capacidadeRaio, d.campos['capacidadeRaio.unidade'])
  if (peso === null || cap === null || cap === 0) return null
  return Math.round((peso / cap) * 1000) / 10
}

export function relacaoAutoTexto(d: ChecklistData): string {
  const n = relacaoAuto(d)
  return n === null ? '' : String(n).replace('.', ',')
}

export function relacaoEfetiva(d: ChecklistData): string {
  const manual = d.campos.relacao?.trim()
  return manual ? manual : relacaoAutoTexto(d)
}

export function acimaDe75(d: ChecklistData): boolean {
  const n = parseNumero(relacaoEfetiva(d))
  return n !== null && n > 75
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/checklist/calc.test.ts`
Expected: PASS (todos).

- [ ] **Step 5: Commit**
```bash
git add src/checklist/calc.ts src/checklist/calc.test.ts
git commit -m "feat: cálculo da relação peso/capacidade"
```

---

### Task 4: Formatação e rascunho (storage + hook)

**Files:**
- Create: `src/checklist/format.ts`, `src/checklist/storage.ts`, `src/checklist/useChecklist.ts`
- Test: `src/checklist/format.test.ts`, `src/checklist/storage.test.ts`

**Interfaces:**
- Consumes: `ChecklistData`, `Resp`, `dadosVazios` de `schema.ts`.
- Produces:
  - `formatarData(iso: string): string` (`'2026-10-16'` → `'16/10/2026'`, vazio → `''`)
  - `formatarHora(hhmm: string): string` (`'09:05'` → `'09 h : 05 min'`, vazio → `''`)
  - `nomeArquivo(d: ChecklistData, hoje: string): string` → `checklist-<data ou hoje>-<PT>.pdf` (sem `-<PT>` se vazio; PT limpo com `/[^\w-]/g`)
  - `interface Store {getItem; setItem; removeItem}`; `getStore(): Store | null`; `loadDraft(store: Store | null): ChecklistData`; `saveDraft(store: Store | null, d: ChecklistData): boolean`; `clearDraft(store: Store | null): void`
  - `interface ChecklistApi {data: ChecklistData; storageOk: boolean; setCampo(chave: string, valor: string): void; setResposta(id: string, r: Resp | null): void; setMarca(chave: string, v: boolean): void; setAssinatura(id: string, url: string): void; reset(): void}`; `useChecklist(): ChecklistApi`

- [ ] **Step 1: Escrever os testes que falham**

`src/checklist/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatarData, formatarHora, nomeArquivo } from './format'
import { dadosVazios } from './schema'

describe('format', () => {
  it('formata data e hora', () => {
    expect(formatarData('2026-10-16')).toBe('16/10/2026')
    expect(formatarData('')).toBe('')
    expect(formatarHora('09:05')).toBe('09 h : 05 min')
    expect(formatarHora('')).toBe('')
  })
  it('nome do arquivo usa data e PT limpa', () => {
    const d = { ...dadosVazios(), campos: { data: '2026-10-16', numeroPT: 'PT 123/45' } }
    expect(nomeArquivo(d, '2026-01-01')).toBe('checklist-2026-10-16-PT12345.pdf')
  })
  it('sem data usa hoje e sem PT omite o sufixo', () => {
    expect(nomeArquivo(dadosVazios(), '2026-01-01')).toBe('checklist-2026-01-01.pdf')
  })
})
```

`src/checklist/storage.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { loadDraft, saveDraft, clearDraft, type Store } from './storage'
import { dadosVazios } from './schema'

const memoria = (): Store & { m: Map<string, string> } => {
  const m = new Map<string, string>()
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) }
}

describe('rascunho', () => {
  it('salva e recarrega', () => {
    const s = memoria()
    const d = { ...dadosVazios(), campos: { modelo: 'Liebherr' }, respostas: { eq1: 'S' as const } }
    expect(saveDraft(s, d)).toBe(true)
    expect(loadDraft(s)).toEqual(d)
  })
  it('sem rascunho ou JSON inválido devolve dados vazios', () => {
    const s = memoria()
    expect(loadDraft(s)).toEqual(dadosVazios())
    s.setItem('site-luis:checklist:v1', '{quebrado')
    expect(loadDraft(s)).toEqual(dadosVazios())
  })
  it('completa chaves que faltam no rascunho antigo', () => {
    const s = memoria()
    s.setItem('site-luis:checklist:v1', JSON.stringify({ campos: { modelo: 'X' } }))
    expect(loadDraft(s)).toEqual({ ...dadosVazios(), campos: { modelo: 'X' } })
  })
  it('limpa o rascunho', () => {
    const s = memoria()
    saveDraft(s, dadosVazios())
    clearDraft(s)
    expect(s.m.size).toBe(0)
  })
  it('sem storage não quebra', () => {
    expect(saveDraft(null, dadosVazios())).toBe(false)
    expect(loadDraft(null)).toEqual(dadosVazios())
    expect(() => clearDraft(null)).not.toThrow()
  })
  it('erro de cota ao salvar devolve false', () => {
    const s: Store = { getItem: () => null, setItem: () => { throw new Error('quota') }, removeItem: () => {} }
    expect(saveDraft(s, dadosVazios())).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/checklist/format.test.ts src/checklist/storage.test.ts`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Implementar `format.ts` e `storage.ts`**

`src/checklist/format.ts`:
```ts
import type { ChecklistData } from './schema'

export function formatarData(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

export function formatarHora(hhmm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm)
  return m ? `${m[1]} h : ${m[2]} min` : ''
}

export function nomeArquivo(d: ChecklistData, hoje: string): string {
  const data = d.campos.data || hoje
  const pt = (d.campos.numeroPT ?? '').replace(/[^\w-]/g, '')
  return `checklist-${data}${pt ? `-${pt}` : ''}.pdf`
}
```

`src/checklist/storage.ts`:
```ts
import { dadosVazios, type ChecklistData } from './schema'

const CHAVE = 'site-luis:checklist:v1'

export interface Store {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

export function getStore(): Store | null {
  try {
    const s = window.localStorage
    s.setItem('__teste', '1')
    s.removeItem('__teste')
    return s
  } catch {
    return null
  }
}

export function loadDraft(store: Store | null): ChecklistData {
  if (!store) return dadosVazios()
  try {
    const bruto = store.getItem(CHAVE)
    if (!bruto) return dadosVazios()
    return { ...dadosVazios(), ...JSON.parse(bruto) }
  } catch {
    return dadosVazios()
  }
}

export function saveDraft(store: Store | null, d: ChecklistData): boolean {
  if (!store) return false
  try {
    store.setItem(CHAVE, JSON.stringify(d))
    return true
  } catch {
    return false
  }
}

export function clearDraft(store: Store | null): void {
  try {
    store?.removeItem(CHAVE)
  } catch {
    /* sem storage: nada a limpar */
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/checklist/format.test.ts src/checklist/storage.test.ts`
Expected: PASS.

- [ ] **Step 5: Implementar o hook `useChecklist.ts`** (sem teste unitário: só orquestra funções já testadas; coberto na verificação manual da Task 8)

`src/checklist/useChecklist.ts`:
```ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { dadosVazios, type ChecklistData, type Resp } from './schema'
import { clearDraft, getStore, loadDraft, saveDraft } from './storage'

export interface ChecklistApi {
  data: ChecklistData
  storageOk: boolean
  setCampo(chave: string, valor: string): void
  setResposta(id: string, r: Resp | null): void
  setMarca(chave: string, v: boolean): void
  setAssinatura(id: string, url: string): void
  reset(): void
}

export function useChecklist(): ChecklistApi {
  const store = useMemo(getStore, [])
  const [data, setData] = useState<ChecklistData>(() => loadDraft(store))
  const [storageOk, setStorageOk] = useState(store !== null)

  useEffect(() => {
    if (store) setStorageOk(saveDraft(store, data))
  }, [data, store])

  const setCampo = useCallback((chave: string, valor: string) => {
    setData((d) => ({ ...d, campos: { ...d.campos, [chave]: valor } }))
  }, [])

  const setResposta = useCallback((id: string, r: Resp | null) => {
    setData((d) => {
      const respostas = { ...d.respostas }
      if (r === null) delete respostas[id]
      else respostas[id] = r
      return { ...d, respostas }
    })
  }, [])

  const setMarca = useCallback((chave: string, v: boolean) => {
    setData((d) => ({ ...d, marcas: { ...d.marcas, [chave]: v } }))
  }, [])

  const setAssinatura = useCallback((id: string, url: string) => {
    setData((d) => ({ ...d, assinaturas: { ...d.assinaturas, [id]: url } }))
  }, [])

  const reset = useCallback(() => {
    clearDraft(store)
    setData(dadosVazios())
  }, [store])

  return { data, storageOk, setCampo, setResposta, setMarca, setAssinatura, reset }
}
```

- [ ] **Step 6: Verificar tipos e commit**

Run: `npx tsc --noEmit`
Expected: sem erros.
```bash
git add src/checklist
git commit -m "feat: formatação, rascunho local e hook useChecklist"
```

---

### Task 5: Componentes de campo (CampoInput, SimNaoNa, SignaturePad)

**Files:**
- Create: `src/components/CampoInput.tsx`, `src/components/SimNaoNa.tsx`, `src/components/SignaturePad.tsx`

**Interfaces:**
- Consumes: `Campo` de `definicao.ts`; `Resp` de `schema.ts`.
- Produces:
  - `CampoInput({campo: Campo; campos: Record<string,string>; onChange(chave: string, valor: string): void; dica?: string})`
  - `SimNaoNa({value?: Resp; onChange(r: Resp | null): void})` (clicar no selecionado limpa)
  - `SignaturePad({label: string; value: string; onChange(dataUrl: string): void})` (`''` = vazio)

- [ ] **Step 1: Criar `CampoInput.tsx`**

```tsx
import type { Campo } from '../checklist/definicao'

interface Props {
  campo: Campo
  campos: Record<string, string>
  onChange: (chave: string, valor: string) => void
  dica?: string
}

export function CampoInput({ campo, campos, onChange, dica }: Props) {
  const v = campos[campo.id] ?? ''

  if (campo.kind === 'escolha') {
    return (
      <div className="campo">
        <span className="rotulo">{campo.label}</span>
        <div className="escolha" role="group" aria-label={campo.label}>
          {campo.opcoes.map((o) => (
            <button
              type="button"
              key={o}
              className={v === o ? 'ativo' : ''}
              aria-pressed={v === o}
              onClick={() => onChange(campo.id, v === o ? '' : o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const type = campo.kind === 'data' ? 'date' : campo.kind === 'hora' ? 'time' : 'text'
  return (
    <label className="campo">
      <span className="rotulo">{campo.label}</span>
      <span className="campo-linha">
        <input
          type={type}
          inputMode={campo.kind === 'texto' ? campo.inputMode : undefined}
          value={v}
          placeholder={dica}
          onChange={(e) => onChange(campo.id, e.target.value)}
        />
        {campo.kind === 'texto' && campo.unidades && (
          <select
            aria-label={`${campo.label} – unidade`}
            value={campos[`${campo.id}.unidade`] ?? campo.unidades[0]}
            onChange={(e) => onChange(`${campo.id}.unidade`, e.target.value)}
          >
            {campo.unidades.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        )}
      </span>
    </label>
  )
}
```

- [ ] **Step 2: Criar `SimNaoNa.tsx`**

```tsx
import type { Resp } from '../checklist/schema'

const OPCOES: Resp[] = ['S', 'N', 'NA']

export function SimNaoNa({ value, onChange }: { value?: Resp; onChange: (r: Resp | null) => void }) {
  return (
    <div className="snn" role="group" aria-label="Resposta">
      {OPCOES.map((o) => (
        <button
          type="button"
          key={o}
          className={value === o ? 'ativo' : ''}
          aria-pressed={value === o}
          onClick={() => onChange(value === o ? null : o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Criar `SignaturePad.tsx`**

```tsx
import { useEffect, useRef } from 'react'

interface Props {
  label: string
  value: string
  onChange: (dataUrl: string) => void
}

export function SignaturePad({ label, value, onChange }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ultimo = useRef('')
  const desenhando = useRef(false)

  useEffect(() => {
    if (value === ultimo.current) return
    ultimo.current = value
    const c = ref.current!
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height)
      img.src = value
    }
  }, [value])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height }
  }

  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    desenhando.current = true
    const ctx = ref.current!.getContext('2d')!
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#111'
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + 0.1, p.y)
    ctx.stroke()
  }

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!desenhando.current) return
    const ctx = ref.current!.getContext('2d')!
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const terminar = () => {
    if (!desenhando.current) return
    desenhando.current = false
    const url = ref.current!.toDataURL('image/png')
    ultimo.current = url
    onChange(url)
  }

  const limpar = () => {
    const c = ref.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    ultimo.current = ''
    onChange('')
  }

  return (
    <div className="assinatura">
      <span className="rotulo">{label}</span>
      <canvas
        ref={ref}
        width={600}
        height={200}
        aria-label={label}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
      />
      <div className="acoes">
        <small>Assine com o dedo ou mouse</small>
        <button type="button" className="btn" onClick={limpar}>Limpar</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar tipos e commit**

Run: `npx tsc --noEmit`
Expected: sem erros.
```bash
git add src/components
git commit -m "feat: componentes CampoInput, SimNaoNa e SignaturePad"
```

---

### Task 6: Página do Checklist (etapas, itens, revisão)

**Files:**
- Create: `src/components/GrupoView.tsx`, `src/components/ItemView.tsx`
- Modify: `src/pages/Checklist.tsx` (substitui o placeholder)

**Interfaces:**
- Consumes: `ChecklistApi` (`useChecklist.ts`); `CampoInput`, `SimNaoNa`, `SignaturePad`; `GRUPOS_MAQUINA`, `GRUPOS_LIBERACAO`, `SECOES`; `relacaoAutoTexto`, `acimaDe75`.
- Produces: `GrupoView({grupo: Grupo; api: ChecklistApi})`, `ItemView({item: Item; numero: number; api: ChecklistApi})`; botão "Gerar PDF" chama `gerarPdf(data)` de `src/checklist/gerarPdf.tsx` (criado na Task 7 — nesta tarefa importe com `import { gerarPdf } from '../checklist/gerarPdf'`; para o build passar já, crie o stub abaixo no Step 4).

- [ ] **Step 1: Criar `GrupoView.tsx`**

```tsx
import type { Grupo } from '../checklist/definicao'
import type { ChecklistApi } from '../checklist/useChecklist'
import { relacaoAutoTexto } from '../checklist/calc'
import { CampoInput } from './CampoInput'
import { SignaturePad } from './SignaturePad'

export function GrupoView({ grupo, api }: { grupo: Grupo; api: ChecklistApi }) {
  const { data } = api
  return (
    <section className="grupo">
      <h3>{grupo.titulo}</h3>
      {grupo.campos.map((c) => (
        <CampoInput
          key={c.id}
          campo={c}
          campos={data.campos}
          onChange={api.setCampo}
          dica={c.kind === 'texto' && c.calculado ? relacaoAutoTexto(data) || 'automático (%)' : undefined}
        />
      ))}
      {grupo.assinaturas?.map((a) => (
        <SignaturePad
          key={a.id}
          label={a.label}
          value={data.assinaturas[a.id] ?? ''}
          onChange={(url) => api.setAssinatura(a.id, url)}
        />
      ))}
    </section>
  )
}
```

- [ ] **Step 2: Criar `ItemView.tsx`**

```tsx
import type { Item } from '../checklist/definicao'
import type { ChecklistApi } from '../checklist/useChecklist'
import { acimaDe75 } from '../checklist/calc'
import { CampoInput } from './CampoInput'
import { SimNaoNa } from './SimNaoNa'
import { SignaturePad } from './SignaturePad'

export function ItemView({ item, numero, api }: { item: Item; numero: number; api: ChecklistApi }) {
  const { data } = api
  return (
    <div className="item">
      <p className="item-texto">
        <strong>{numero}.</strong> {item.texto}
      </p>
      <SimNaoNa value={data.respostas[item.id]} onChange={(r) => api.setResposta(item.id, r)} />
      {item.marcas && (
        <div className="marcas">
          {item.marcas.map((m) => {
            const chave = `${item.id}.${m.id}`
            return (
              <label key={m.id}>
                <input
                  type="checkbox"
                  checked={!!data.marcas[chave]}
                  onChange={(e) => api.setMarca(chave, e.target.checked)}
                />
                {m.label}
              </label>
            )
          })}
        </div>
      )}
      {item.id === 'lib2' && acimaDe75(data) && (
        <div className="aviso">Relação peso/capacidade acima de 75%: o Plano de Rigging é necessário.</div>
      )}
      {item.campos?.map((c) => (
        <CampoInput key={c.id} campo={c} campos={data.campos} onChange={api.setCampo} />
      ))}
      {item.assinatura && (
        <SignaturePad
          label={item.assinatura.label}
          value={data.assinaturas[item.assinatura.id] ?? ''}
          onChange={(url) => api.setAssinatura(item.assinatura!.id, url)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Substituir `src/pages/Checklist.tsx`**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GRUPOS_LIBERACAO, GRUPOS_MAQUINA, TITULO_LIBERACAO } from '../checklist/grupos'
import { SECOES } from '../checklist/itens'
import { useChecklist } from '../checklist/useChecklist'
import { gerarPdf } from '../checklist/gerarPdf'
import { GrupoView } from '../components/GrupoView'
import { ItemView } from '../components/ItemView'

const PASSOS = ['Máquina', 'Equipe', 'Liberação', 'Dados', 'Revisar'] as const

export default function Checklist() {
  const api = useChecklist()
  const [passo, setPasso] = useState(0)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const pendentes = SECOES.flatMap((s) =>
    s.itens.filter((i) => !api.data.respostas[i.id]).map((i) => `${s.titulo.split(' ')[0]} ${i.texto.slice(0, 70)}…`),
  )

  const baixar = async () => {
    setGerando(true)
    setErro('')
    try {
      await gerarPdf(api.data)
    } catch (e) {
      setErro(`Não foi possível gerar o PDF: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGerando(false)
    }
  }

  const novo = () => {
    if (window.confirm('Apagar tudo e começar um novo checklist?')) {
      api.reset()
      setPasso(0)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" style={{ color: '#fff' }} aria-label="Início">⌂</Link>
        <h1>Plano para Movimentação de Carga</h1>
      </header>
      {!api.storageOk && <div className="aviso">Rascunho automático indisponível neste navegador.</div>}

      <nav className="passos" aria-label="Etapas">
        {PASSOS.map((p, i) => (
          <button key={p} type="button" className={i === passo ? 'ativo' : ''} onClick={() => setPasso(i)}>
            {i + 1}. {p}
          </button>
        ))}
      </nav>

      {passo === 0 && (
        <>
          <h2>DIMENSIONAMENTO DA MÁQUINA E ACESSÓRIOS</h2>
          {GRUPOS_MAQUINA.map((g) => (
            <GrupoView key={g.id} grupo={g} api={api} />
          ))}
        </>
      )}

      {(passo === 1 || passo === 2) && (
        <>
          <h2>{SECOES[passo - 1].titulo}</h2>
          {SECOES[passo - 1].itens.map((item, i) => (
            <ItemView key={item.id} item={item} numero={i + 1} api={api} />
          ))}
        </>
      )}

      {passo === 3 && (
        <>
          <h2>{TITULO_LIBERACAO}</h2>
          {GRUPOS_LIBERACAO.map((g) => (
            <GrupoView key={g.id} grupo={g} api={api} />
          ))}
        </>
      )}

      {passo === 4 && (
        <>
          <h2>Revisar e gerar PDF</h2>
          {pendentes.length > 0 ? (
            <>
              <div className="aviso">{pendentes.length} item(ns) sem resposta (o PDF pode ser gerado assim mesmo):</div>
              <ul className="pendentes">
                {pendentes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Todos os itens foram respondidos.</p>
          )}
          {erro && <div className="aviso">{erro}</div>}
          <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn primario" onClick={baixar} disabled={gerando}>
              {gerando ? 'Gerando…' : 'Gerar PDF'}
            </button>
            <button type="button" className="btn perigo" onClick={novo}>Novo checklist</button>
          </p>
        </>
      )}

      <div className="rodape-nav">
        <button type="button" className="btn" disabled={passo === 0} onClick={() => setPasso(passo - 1)}>
          Voltar
        </button>
        <button type="button" className="btn primario" disabled={passo === PASSOS.length - 1} onClick={() => setPasso(passo + 1)}>
          Próximo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar stub de `gerarPdf.tsx` para o build passar**

`src/checklist/gerarPdf.tsx`:
```tsx
import type { ChecklistData } from './schema'

export async function gerarPdf(_data: ChecklistData): Promise<void> {
  throw new Error('PDF ainda não implementado')
}
```

- [ ] **Step 5: Verificar build e navegação**

Run: `npx tsc --noEmit`
Expected: sem erros.

Com `npm run dev` rodando, abra `http://localhost:5173/#/checklist` e confira:
- 5 etapas navegáveis (Voltar/Próximo e botões do topo);
- Máquina: Modelo, Raio, Capacidade (com seletor Ton/Kg), Quadrante (Frontal/Lateral), Lança, Jib, Relação; Lingada (Tipo Cabo/Cinta + 4 campos); Acessórios (6 campos);
- Equipe: 4 itens S/N/NA; item 1 com 5 caixas de marcar;
- Liberação: 16 itens; itens 6 e 7 com nome + assinatura; item 2 com 4 marcas; item 11 com 4 marcas; item 13 com peso + Ton/Kg;
- Dados: data, hora, PT, Segurança (nome/matrícula/assinatura), Operador (nome/matrícula/assinatura);
- Digitar Peso 16 e Capacidade 20 mostra o aviso de 75% no item 2 e preenche a Relação (placeholder `80`);
- Recarregar a página mantém o que foi preenchido (inclusive assinatura).

- [ ] **Step 6: Commit**
```bash
git add src
git commit -m "feat: página do checklist com etapas, itens e revisão"
```

---

### Task 7: Documento PDF

**Files:**
- Create: `src/checklist/ChecklistPdf.tsx`
- Modify: `src/checklist/gerarPdf.tsx` (substitui o stub)
- Test: `src/checklist/ChecklistPdf.test.tsx`

**Interfaces:**
- Consumes: `ChecklistData`; `GRUPOS_MAQUINA`, `GRUPOS_LIBERACAO`, `TITULO_LIBERACAO`; `SECOES`; `Campo`, `Grupo`, `Item`; `relacaoEfetiva`; `formatarData`, `formatarHora`, `nomeArquivo`.
- Produces: `ChecklistPdf({data: ChecklistData; logoSrc?: string})` (componente `<Document>`); `gerarPdf(data: ChecklistData): Promise<void>` baixa `nomeArquivo(data, hoje)`.

- [ ] **Step 1: Escrever o teste de fumaça que falha**

`src/checklist/ChecklistPdf.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { ChecklistPdf } from './ChecklistPdf'
import { GRUPOS_LIBERACAO, GRUPOS_MAQUINA } from './grupos'
import { SECOES } from './itens'
import { dadosVazios, type ChecklistData } from './schema'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function dadosCheios(): ChecklistData {
  const d = dadosVazios()
  const campos = [...GRUPOS_MAQUINA, ...GRUPOS_LIBERACAO].flatMap((g) => g.campos)
  for (const c of [...campos, ...SECOES.flatMap((s) => s.itens.flatMap((i) => i.campos ?? []))]) {
    d.campos[c.id] = c.kind === 'escolha' ? c.opcoes[0] : c.kind === 'data' ? '2026-10-16' : c.kind === 'hora' ? '09:05' : '12,5'
  }
  for (const s of SECOES)
    for (const i of s.itens) {
      d.respostas[i.id] = 'S'
      for (const m of i.marcas ?? []) d.marcas[`${i.id}.${m.id}`] = true
      if (i.assinatura) d.assinaturas[i.assinatura.id] = PIXEL
    }
  for (const g of [...GRUPOS_MAQUINA, ...GRUPOS_LIBERACAO]) for (const a of g.assinaturas ?? []) d.assinaturas[a.id] = PIXEL
  return d
}

describe('ChecklistPdf', () => {
  it('gera um PDF válido com dados vazios', async () => {
    const buf = await renderToBuffer(<ChecklistPdf data={dadosVazios()} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('gera um PDF válido com todos os campos preenchidos', async () => {
    const buf = await renderToBuffer(<ChecklistPdf data={dadosCheios()} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(buf.length).toBeGreaterThan(3000)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra.pdf', buf)
    }
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/checklist/ChecklistPdf.test.tsx`
Expected: FAIL (`./ChecklistPdf` não existe).

- [ ] **Step 3: Implementar `ChecklistPdf.tsx`**

```tsx
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Campo, Grupo, Item } from './definicao'
import { GRUPOS_LIBERACAO, GRUPOS_MAQUINA, TITULO_LIBERACAO } from './grupos'
import { SECOES } from './itens'
import { relacaoEfetiva } from './calc'
import { formatarData, formatarHora } from './format'
import type { ChecklistData } from './schema'

const LINHA = '________________'
const PRETO = '#000'

const s = StyleSheet.create({
  page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: PRETO },
  logo: { width: 90, height: 34, margin: 4, objectFit: 'contain' },
  titulo: { flex: 1, textAlign: 'center', fontSize: 12, fontFamily: 'Helvetica-Bold' },
  banner: { flexDirection: 'row', backgroundColor: '#d9d9d9', borderWidth: 1, borderTopWidth: 0, borderColor: PRETO, padding: 3, fontFamily: 'Helvetica-Bold' },
  bannerTexto: { flex: 1 },
  cols: { flexDirection: 'row' },
  col: { flex: 1, borderWidth: 1, borderTopWidth: 0, borderColor: PRETO, padding: 4 },
  colTitulo: { fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  linha: { marginBottom: 3 },
  row: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: PRETO },
  rowTexto: { flex: 1, padding: 3 },
  snn: { width: 26, borderLeftWidth: 1, borderColor: PRETO, alignItems: 'center', justifyContent: 'center' },
  snnTitulo: { width: 26, textAlign: 'center' },
  assin: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  assinImg: { width: 90, height: 26, objectFit: 'contain' },
})

function textoCampo(c: Campo, d: ChecklistData): string {
  if (c.kind === 'escolha') {
    const v = d.campos[c.id]
    return c.opcoes.map((o) => `(${v === o ? 'X' : '   '}) ${o}`).join('    ')
  }
  if (c.kind === 'data') return formatarData(d.campos[c.id] ?? '') || LINHA
  if (c.kind === 'hora') return formatarHora(d.campos[c.id] ?? '') || LINHA
  const v = c.calculado ? relacaoEfetiva(d) : (d.campos[c.id] ?? '')
  if (!v.trim()) return LINHA
  const un = c.unidades ? ` ${d.campos[`${c.id}.unidade`] ?? c.unidades[0]}` : ''
  return `${v}${un}${c.calculado && !v.includes('%') ? '%' : ''}`
}

function AssinaturaPdf({ label, src }: { label: string; src?: string }) {
  return (
    <View style={s.assin}>
      <Text>{label}: </Text>
      {src ? <Image src={src} style={s.assinImg} /> : <Text>{LINHA}</Text>}
    </View>
  )
}

function GrupoPdf({ g, d }: { g: Grupo; d: ChecklistData }) {
  return (
    <View style={s.col} wrap={false}>
      <Text style={s.colTitulo}>{g.titulo}</Text>
      {g.campos.map((c) => (
        <Text key={c.id} style={s.linha}>
          {c.label}: {textoCampo(c, d)}
        </Text>
      ))}
      {g.assinaturas?.map((a) => (
        <AssinaturaPdf key={a.id} label={a.label} src={d.assinaturas[a.id]} />
      ))}
    </View>
  )
}

function ItemPdf({ item, d }: { item: Item; d: ChecklistData }) {
  const curtas = item.marcas?.every((m) => m.label.length < 28)
  const marcadas = item.marcas?.map((m) => `(${d.marcas[`${item.id}.${m.id}`] ? 'X' : '   '}) ${m.label}`)
  return (
    <View style={s.row} wrap={false}>
      <View style={s.rowTexto}>
        <Text>{item.texto}</Text>
        {marcadas && (curtas ? <Text>{marcadas.join('     ')}</Text> : marcadas.map((t) => <Text key={t}>{t}</Text>))}
        {item.campos?.map((c) => (
          <Text key={c.id}>
            {c.label}: {textoCampo(c, d)}
          </Text>
        ))}
        {item.assinatura && <AssinaturaPdf label={item.assinatura.label} src={d.assinaturas[item.assinatura.id]} />}
      </View>
      {(['S', 'N', 'NA'] as const).map((r) => (
        <View key={r} style={s.snn}>
          <Text>{d.respostas[item.id] === r ? 'X' : ''}</Text>
        </View>
      ))}
    </View>
  )
}

export function ChecklistPdf({ data, logoSrc }: { data: ChecklistData; logoSrc?: string }) {
  return (
    <Document title="Plano para Movimentação de Carga">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {logoSrc && <Image src={logoSrc} style={s.logo} />}
          <Text style={s.titulo}>PLANO PARA MOVIMENTAÇÃO DE CARGA</Text>
        </View>
        <View style={s.banner}>
          <Text style={s.bannerTexto}>DIMENSIONAMENTO DA MÁQUINA E ACESSÓRIOS</Text>
        </View>
        <View style={s.cols}>
          {GRUPOS_MAQUINA.map((g) => (
            <GrupoPdf key={g.id} g={g} d={data} />
          ))}
        </View>

        {SECOES.map((sec) => (
          <View key={sec.id}>
            <View style={s.banner} wrap={false}>
              <Text style={s.bannerTexto}>{sec.titulo}</Text>
              <Text style={s.snnTitulo}>S</Text>
              <Text style={s.snnTitulo}>N</Text>
              <Text style={s.snnTitulo}>NA</Text>
            </View>
            {sec.itens.map((i) => (
              <ItemPdf key={i.id} item={i} d={data} />
            ))}
          </View>
        ))}

        <View style={s.banner} wrap={false}>
          <Text style={s.bannerTexto}>{TITULO_LIBERACAO}</Text>
        </View>
        <View style={s.cols} wrap={false}>
          {GRUPOS_LIBERACAO.map((g) => (
            <GrupoPdf key={g.id} g={g} d={data} />
          ))}
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/checklist/ChecklistPdf.test.tsx`
Expected: PASS (2 testes). Se o teste falhar por erro de fonte/imagem do react-pdf, corrija o componente (não o teste).

- [ ] **Step 5: Implementar `gerarPdf.tsx` (substitui o stub)**

```tsx
import logo from '../assets/logo-ccr-engemob.png'
import { nomeArquivo } from './format'
import type { ChecklistData } from './schema'

export async function gerarPdf(data: ChecklistData): Promise<void> {
  const [{ pdf }, { ChecklistPdf }] = await Promise.all([import('@react-pdf/renderer'), import('./ChecklistPdf')])
  const blob = await pdf(<ChecklistPdf data={data} logoSrc={logo} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo(data, new Date().toISOString().slice(0, 10))
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

- [ ] **Step 6: Rodar todos os testes e o build**

Run: `npm test && npm run build`
Expected: todos os testes passam; build sem erros.

- [ ] **Step 7: Commit**
```bash
git add src
git commit -m "feat: geração do PDF do checklist"
```

---

### Task 8: Verificação final campo a campo

**Files:** nenhum arquivo novo (correções, se houver, nos arquivos já existentes).

- [ ] **Step 1: Gerar PDF de amostra com todos os campos**

Run: `SAVE_PDF=1 npx vitest run src/checklist/ChecklistPdf.test.tsx`
Expected: PASS e arquivo `tmp/amostra.pdf` criado.

- [ ] **Step 2: Conferir o PDF contra o Excel**

Abra `tmp/amostra.pdf` (navegador ou leitor de PDF) ao lado do `Plano de Movimentação de Carga Checklist.xlsx` e confira, marcando cada linha:
- Logo + título; banner "DIMENSIONAMENTO…"; 3 colunas MÁQUINA / LINGADA / ACESSÓRIOS com todos os campos do inventário (Modelo … Relação; Tipo/Diâmetro/Comprimento/Pernas/Capacidade por perna; Manilhas/Quantidade/Diâmetro/Capac. p/ manilha/Separadores).
- Seção 1: 4 itens, marcas (Cintas…Estropos), colunas S/N/NA com X.
- Seção 2: 16 itens; marcas dos itens 2 e 11; "Nome Especialista" + Assinatura nos itens 6 e 7; "Informar o Peso" no item 13.
- Seção 4: Data/Hora/PT, Segurança do Trabalho (nome, matrícula, assinatura), Operador (nome, matrícula, assinatura).
- Nenhuma linha cortada entre páginas.
Qualquer campo ausente ou fora do lugar → corrigir `grupos.ts`/`itens.ts`/`ChecklistPdf.tsx`, rodar `npm test` e repetir.

- [ ] **Step 3: Teste ponta a ponta no navegador (celular emulado e desktop)**

Com `npm run dev`: em largura 375px e em desktop, preencher **todos** os campos pelo site (incluindo as 4 assinaturas desenhadas), clicar "Gerar PDF" na etapa Revisar e abrir o arquivo baixado. Conferir:
- nome do arquivo `checklist-AAAA-MM-DD-<PT>.pdf`;
- assinaturas aparecem como imagem nos 4 lugares;
- a Relação % calculada aparece no PDF; digitar um valor manual na Relação o substitui;
- com itens sem resposta, a revisão lista os pendentes e o PDF ainda é gerado;
- "Novo checklist" pede confirmação e limpa tudo (inclusive recarregando a página).

- [ ] **Step 4: Rodar tudo uma última vez**

Run: `npm test && npm run build`
Expected: testes passam e `dist/` gerado sem erros.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "chore: verificação final do checklist"
```

**Fora deste plano (próximos ciclos):** publicar na Vercel (ação externa, só com seu pedido), Plano Básico de Içamento (Anexo A da spec) e ferramentas do Guia RAC 5 (Anexo B).
