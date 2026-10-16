# Plano Básico de Içamento — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tela `/icamento` que preenche o "Plano Básico de Içamento de Carga (Guindastes)" sobre o desenho do guindaste (campos nos lugares da folha) e gera um PDF idêntico à folha original.

**Architecture:** O desenho do guindaste (imagem extraída do PDF original, 2151×1200) é o formulário: caixas posicionadas por porcentagem sobre a imagem, definidas como dados em `pontos.ts`. Tocar numa caixa abre uma folha inferior com campo grande e "Próximo campo"; o esboço da carga usa um quadro de desenho em tela cheia. O FU é calculado. O PDF reproduz a folha desenhando os valores nas mesmas coordenadas. Reaproveita `CampoInput`, `SignaturePad`, `parseNumero`/`emKg` e o rascunho do checklist.

**Tech Stack:** Vite, React, TypeScript, react-router-dom (HashRouter), `@react-pdf/renderer`, Vitest (já instalados no sub-projeto 1).

**Spec:** `docs/superpowers/specs/2026-10-16-plano-icamento-design.md`

## Global Constraints

- Site estático, sem login, sem banco de dados, sem offline, sem backend.
- Todos os campos de preencher da folha existem no site e no PDF, inclusive as duas assinaturas.
- Uma única unidade de peso (Ton ou Kg, padrão Ton) vale para todo o desenho; Comprimento da Lança e Raio Máximo são em metros (`m`).
- FU = (Peso da Carga + Peso dos Acessórios Especiais + Peso do Moitão) ÷ Capacidade Momentânea × 100, uma casa decimal, vírgula decimal. Calcula quando Peso da Carga e Capacidade Momentânea estão preenchidos; Acessórios e Moitão **vazios** contam como 0; valor preenchido mas ambíguo (ex.: "5.000") deixa o FU em branco. Peso do Contrapeso e Capacidade do Moitão não entram na fórmula.
- FU acima de 75%: aviso "Solicite a emissão de um Plano de Rigging" (não bloqueia nada). As 3 caixas do FU só mostram resultado (não se digita nelas).
- No celular, tocar na caixa abre campo grande com botão **Próximo campo**; tocar na área tracejada abre o quadro de desenho do esboço.
- Revisão avisa pendências mas **não bloqueia** o PDF.
- Texto dos "Lembretes de medidas obrigatórias" copiado literalmente do `Plano básico 4.pdf`.
- Nome do arquivo: `plano-icamento-AAAA-MM-DD-<carga>.pdf` (data local; carga limpa com `/[^\w-]/g`, omitida se vazia).
- Números aceitam vírgula decimal e seguem `parseNumero` do checklist (entrada ambígua como "5.000" nunca é adivinhada).
- Se o `localStorage` falhar, funciona sem rascunho (mesmo aviso do checklist).
- Código e textos de interface em português; identificadores em português sem acentos.
- O Excel, o PDF e as fotos originais NÃO são versionados (`.gitignore`); a imagem `src/assets/esquema-icamento.png` É versionada (o site precisa dela).

## Estrutura de arquivos

```
src/
  assets/esquema-icamento.png        imagem do guindaste extraída do PDF (2151×1200)
  icamento/
    schema.ts        IcamentoData, linhaVazia, icamentoVazio
    pontos.ts        caixas do desenho (dados), área do esboço, ordem de edição
    campos.ts        campos do cabeçalho, responsáveis, rótulos fixos
    lembretes.ts     texto fixo dos lembretes
    calc.ts          unidadeDe, formatarPeso, fu, acimaDe75Fu, textoPonto
    nome.ts          nomeArquivoIcamento
    pessoa.ts        copiarOperador ("mesma pessoa")
    useIcamento.ts   estado + rascunho (chave própria)
    IcamentoPdf.tsx  documento PDF
    gerarPdf.tsx     gera e baixa o PDF
    *.test.ts(x)     testes Vitest
  components/
    DiagramaGuindaste.tsx   imagem + caixas sobrepostas
    FolhaCampo.tsx          folha inferior de edição de um campo
    QuadroEsboco.tsx        desenho em tela cheia
    TabelaAcessorios.tsx    linhas da lista de acessórios
  pages/Icamento.tsx        4 etapas: Dados, Esquema, Acessórios, Assinaturas
Modificados: checklist/storage.ts (funções genéricas), components/SignaturePad.tsx (props opcionais), pages/Home.tsx, App.tsx, index.css
```

---

### Task 1: Dados do Plano de Içamento (schema, pontos, textos, rascunho genérico, imagem)

**Files:**
- Create: `src/icamento/schema.ts`, `src/icamento/pontos.ts`, `src/icamento/campos.ts`, `src/icamento/lembretes.ts`, `src/assets/esquema-icamento.png`
- Modify: `src/checklist/storage.ts`, `src/checklist/storage.test.ts`
- Test: `src/icamento/pontos.test.ts`, `src/checklist/storage.test.ts`

**Interfaces:**
- Consumes: `Campo` de `src/checklist/definicao.ts`; `Store`, `getStore` de `storage.ts`.
- Produces:
  - `storage.ts`: `lerRascunho<T extends object>(store: Store | null, chave: string, vazio: () => T): T`; `salvarRascunho(store: Store | null, chave: string, d: object): boolean`; `limparRascunho(store: Store | null, chave: string): void`. `loadDraft`/`saveDraft`/`clearDraft` continuam existindo com a mesma assinatura (viram wrappers).
  - `schema.ts`: `interface LinhaAcessorio {descricao: string; capacidade: string; quantidade: string}`; `interface IcamentoData {campos: Record<string,string>; acessorios: LinhaAcessorio[]; esboco: string; assinaturas: Record<string,string>}`; `linhaVazia(): LinhaAcessorio`; `icamentoVazio(): IcamentoData` (4 linhas vazias de acessórios). Chaves de `campos`: ids de `pontos.ts` (valores das caixas), `unidade` (`'Ton'|'Kg'`), `comoPeso`, ids de `CAMPOS_CABECALHO`, `opNome`, `opDoc`, `respNome`, `respDoc`. Chaves de `assinaturas`: `opAss`, `respAss`.
  - `pontos.ts`: `LARGURA_IMG = 2151`, `ALTURA_IMG = 1200`, `type TipoPonto = 'metros'|'peso'|'inteiro'|'calculado'`, `interface Ponto {id; rotulo; x; y; w; h; tipo}`, `PONTOS: Ponto[]`, `AREA_ESBOCO: {x,y,w,h}`, `ID_ESBOCO = 'esboco'`, `ORDEM_EDICAO: string[]`.
  - `campos.ts`: `CAMPOS_CABECALHO: Campo[]`, `ROTULO_COMO_PESO`, `RESPONSAVEIS: {id; titulo; nome; doc; assinatura}[]`, `NOTA_ASSINATURA`.
  - `lembretes.ts`: `TITULO_LEMBRETES`, `LEMBRETES: string[]`, `LEMBRETE_FINAL`.

- [ ] **Step 1: Extrair a imagem do PDF original**

Run (raiz do projeto):
```bash
mkdir -p src/assets && PYTHONUTF8=1 python -I -c "
import pymupdf
d=pymupdf.open('Plano básico 4.pdf'); p=d[0]
i=p.get_images(full=True)[0]
pm=pymupdf.Pixmap(d,i[0])
if pm.n>4: pm=pymupdf.Pixmap(pymupdf.csRGB,pm)
pm.save('src/assets/esquema-icamento.png')
print(pm.width,pm.height)
"
ls -l src/assets/esquema-icamento.png
```
Expected: imprime `2151 1200`. Se o arquivo passar de 1,5 MB, reduza sem mudar as dimensões:
```bash
python -I -c "
from PIL import Image
im=Image.open('src/assets/esquema-icamento.png').convert('RGB')
im.convert('P',palette=Image.ADAPTIVE,colors=256).save('src/assets/esquema-icamento.png',optimize=True)
print(im.size)
"
```
Abra a imagem (Read) e confirme que é o desenho do guindaste com as caixas vazias.

- [ ] **Step 2: Escrever os testes que falham**

`src/icamento/pontos.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { ALTURA_IMG, AREA_ESBOCO, ID_ESBOCO, LARGURA_IMG, ORDEM_EDICAO, PONTOS } from './pontos'

const retangulos = [
  ...PONTOS.map((p) => ({ id: p.id, x: p.x, y: p.y, w: p.w, h: p.h })),
  { id: ID_ESBOCO, ...AREA_ESBOCO },
]
const sobrepoe = (a: (typeof retangulos)[number], b: (typeof retangulos)[number]) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

describe('pontos do desenho', () => {
  it('ids são únicos', () => {
    const ids = retangulos.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todas as caixas ficam dentro da imagem', () => {
    for (const r of retangulos) {
      expect(r.x, r.id).toBeGreaterThanOrEqual(0)
      expect(r.y, r.id).toBeGreaterThanOrEqual(0)
      expect(r.x + r.w, r.id).toBeLessThanOrEqual(LARGURA_IMG)
      expect(r.y + r.h, r.id).toBeLessThanOrEqual(ALTURA_IMG)
    }
  })

  it('nenhuma caixa se sobrepõe a outra', () => {
    for (let i = 0; i < retangulos.length; i++)
      for (let j = i + 1; j < retangulos.length; j++)
        expect(sobrepoe(retangulos[i], retangulos[j]), `${retangulos[i].id} x ${retangulos[j].id}`).toBe(false)
  })

  it('tem 9 caixas digitáveis e 3 calculadas', () => {
    expect(PONTOS.filter((p) => p.tipo !== 'calculado')).toHaveLength(9)
    expect(PONTOS.filter((p) => p.tipo === 'calculado').map((p) => p.id)).toEqual(['fuNumerador', 'fuDenominador', 'fuResultado'])
  })

  it('a ordem de edição tem cada caixa digitável uma vez e termina no esboço', () => {
    const digitaveis = PONTOS.filter((p) => p.tipo !== 'calculado').map((p) => p.id)
    expect([...ORDEM_EDICAO].sort()).toEqual([...digitaveis, ID_ESBOCO].sort())
    expect(ORDEM_EDICAO[ORDEM_EDICAO.length - 1]).toBe(ID_ESBOCO)
  })
})
```

Em `src/checklist/storage.test.ts`: troque a linha de import por
```ts
import { loadDraft, saveDraft, clearDraft, lerRascunho, salvarRascunho, limparRascunho, type Store } from './storage'
```
e acrescente ao final do arquivo:
```ts
describe('rascunho genérico', () => {
  const vazio = () => ({ a: 0, b: 0 })

  it('guarda cada chave separadamente e completa com os valores vazios', () => {
    const s = memoria()
    expect(salvarRascunho(s, 'k1', { a: 1 })).toBe(true)
    expect(lerRascunho(s, 'k1', vazio)).toEqual({ a: 1, b: 0 })
    expect(lerRascunho(s, 'k2', vazio)).toEqual({ a: 0, b: 0 })
  })

  it('limpa só a chave pedida', () => {
    const s = memoria()
    salvarRascunho(s, 'k1', { a: 1 })
    salvarRascunho(s, 'k2', { a: 2 })
    limparRascunho(s, 'k1')
    expect(lerRascunho(s, 'k1', vazio)).toEqual({ a: 0, b: 0 })
    expect(lerRascunho(s, 'k2', vazio)).toEqual({ a: 2, b: 0 })
  })

  it('sem storage, JSON inválido ou erro de cota não quebra', () => {
    expect(lerRascunho(null, 'k', vazio)).toEqual({ a: 0, b: 0 })
    expect(salvarRascunho(null, 'k', { a: 1 })).toBe(false)
    expect(() => limparRascunho(null, 'k')).not.toThrow()
    const s = memoria()
    s.setItem('k', '{quebrado')
    expect(lerRascunho(s, 'k', vazio)).toEqual({ a: 0, b: 0 })
    const cheio: Store = { getItem: () => null, setItem: () => { throw new Error('quota') }, removeItem: () => {} }
    expect(salvarRascunho(cheio, 'k', { a: 1 })).toBe(false)
  })

  it('o checklist continua gravando na chave antiga', () => {
    const s = memoria()
    saveDraft(s, dadosVazios())
    expect(s.getItem('site-luis:checklist:v1')).not.toBeNull()
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/icamento/pontos.test.ts src/checklist/storage.test.ts`
Expected: FAIL (`./pontos` não existe; `lerRascunho` não exportado).

- [ ] **Step 4: Generalizar `storage.ts` (mantendo os nomes antigos)**

Substitua o conteúdo de `src/checklist/storage.ts` por:
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

export function lerRascunho<T extends object>(store: Store | null, chave: string, vazio: () => T): T {
  if (!store) return vazio()
  try {
    const bruto = store.getItem(chave)
    if (!bruto) return vazio()
    return { ...vazio(), ...JSON.parse(bruto) }
  } catch {
    return vazio()
  }
}

export function salvarRascunho(store: Store | null, chave: string, d: object): boolean {
  if (!store) return false
  try {
    store.setItem(chave, JSON.stringify(d))
    return true
  } catch {
    return false
  }
}

export function limparRascunho(store: Store | null, chave: string): void {
  try {
    store?.removeItem(chave)
  } catch {
    /* sem storage: nada a limpar */
  }
}

export const loadDraft = (store: Store | null): ChecklistData => lerRascunho(store, CHAVE, dadosVazios)
export const saveDraft = (store: Store | null, d: ChecklistData): boolean => salvarRascunho(store, CHAVE, d)
export const clearDraft = (store: Store | null): void => limparRascunho(store, CHAVE)
```

- [ ] **Step 5: Criar `schema.ts`, `pontos.ts`, `campos.ts`, `lembretes.ts`**

`src/icamento/schema.ts`:
```ts
export interface LinhaAcessorio {
  descricao: string
  capacidade: string
  quantidade: string
}

export interface IcamentoData {
  campos: Record<string, string>
  acessorios: LinhaAcessorio[]
  esboco: string
  assinaturas: Record<string, string>
}

export const linhaVazia = (): LinhaAcessorio => ({ descricao: '', capacidade: '', quantidade: '' })

export const icamentoVazio = (): IcamentoData => ({
  campos: {},
  acessorios: Array.from({ length: 4 }, linhaVazia),
  esboco: '',
  assinaturas: {},
})
```

`src/icamento/pontos.ts`:
```ts
export const LARGURA_IMG = 2151
export const ALTURA_IMG = 1200

export type TipoPonto = 'metros' | 'peso' | 'inteiro' | 'calculado'

export interface Ponto {
  id: string
  rotulo: string
  x: number
  y: number
  w: number
  h: number
  tipo: TipoPonto
}

export const PONTOS: Ponto[] = [
  { id: 'lanca', rotulo: 'Comprimento da Lança', x: 952, y: 82, w: 240, h: 58, tipo: 'metros' },
  { id: 'capMoitao', rotulo: 'Capacidade do Moitão', x: 1538, y: 84, w: 130, h: 58, tipo: 'peso' },
  { id: 'passadas', rotulo: 'Nº de Passadas de Cabo no Moitão', x: 1594, y: 180, w: 128, h: 58, tipo: 'inteiro' },
  { id: 'pesoMoitao', rotulo: 'Peso do Moitão', x: 1248, y: 226, w: 126, h: 58, tipo: 'peso' },
  { id: 'pesoCarga', rotulo: 'Peso da Carga', x: 1792, y: 328, w: 258, h: 58, tipo: 'peso' },
  { id: 'pesoAcessorios', rotulo: 'Peso dos Acessórios Especiais (Balancins, Berços e Caixas)', x: 1810, y: 670, w: 266, h: 58, tipo: 'peso' },
  { id: 'pesoContrapeso', rotulo: 'Peso do Contrapeso, quando aplicável', x: 184, y: 702, w: 238, h: 58, tipo: 'peso' },
  { id: 'capMomentanea', rotulo: 'Capacidade Momentânea do Guindaste (Tabela de Carga)', x: 77, y: 997, w: 504, h: 91, tipo: 'peso' },
  { id: 'raioMax', rotulo: 'Raio Máximo atingido na movimentação', x: 946, y: 996, w: 264, h: 58, tipo: 'metros' },
  { id: 'fuNumerador', rotulo: 'FU: Peso da Carga + Peso dos Acessórios + Peso do Moitão', x: 228, y: 174, w: 220, h: 40, tipo: 'calculado' },
  { id: 'fuDenominador', rotulo: 'FU: Capacidade de acordo com a Tabela de Carga', x: 228, y: 240, w: 220, h: 42, tipo: 'calculado' },
  { id: 'fuResultado', rotulo: 'FU (%)', x: 628, y: 198, w: 172, h: 56, tipo: 'calculado' },
]

/** Região interna da área tracejada "Faça aqui o esboço da carga" (proporção 580:308 = 1160:616). */
export const AREA_ESBOCO = { x: 1155, y: 304, w: 580, h: 308 }

export const ID_ESBOCO = 'esboco'

export const ORDEM_EDICAO: string[] = [
  'lanca',
  'capMoitao',
  'pesoMoitao',
  'passadas',
  'pesoCarga',
  'pesoAcessorios',
  'pesoContrapeso',
  'capMomentanea',
  'raioMax',
  ID_ESBOCO,
]
```

`src/icamento/campos.ts`:
```ts
import type { Campo } from '../checklist/definicao'

export const CAMPOS_CABECALHO: Campo[] = [
  { kind: 'texto', id: 'local', label: 'Local' },
  { kind: 'texto', id: 'atividade', label: 'Atividade' },
  { kind: 'texto', id: 'equipamento', label: 'Equipamento de Guindar Utilizado (tipo e TAG)' },
  { kind: 'texto', id: 'carga', label: 'Carga/Peça' },
  { kind: 'texto', id: 'gerencia', label: 'Gerência' },
  { kind: 'data', id: 'data', label: 'Data' },
]

export const ROTULO_COMO_PESO = 'Como foi obtido o peso da carga?'

export const RESPONSAVEIS = [
  { id: 'op', titulo: 'Operador do Equipamento de Guindar', nome: 'opNome', doc: 'opDoc', assinatura: 'opAss' },
  { id: 'resp', titulo: 'Responsável pela Amarração da Carga', nome: 'respNome', doc: 'respDoc', assinatura: 'respAss' },
]

export const NOTA_ASSINATURA = '*Caso o operador também seja o responsável pela amarração da carga deverá assinar nos dois campos.'
```

`src/icamento/lembretes.ts`:
```ts
export const TITULO_LEMBRETES = 'LEMBRETES DE MEDIDAS OBRIGATÓRIAS:'

export const LEMBRETES: string[] = [
  'O MOITÃO DEVE SER SEMPRE POSICIONADO SOBRE O CENTRO DE GRAVIDADE DA CARGA;',
  'CONSULTE AS TABELAS DE CARGAS DOS ACESSÓRIOS QUE SERÃO UTILIZADOS NO IÇAMENTO PARA CERTIFICAR-SE DE SUAS CAPACIDADES EM CONFORMIDADE COM O PESO DA CARGA;',
  'VERIFIQUE A NECESSIDADE DE USO DE BASTÕES OU CORDAS GUIAS E PLANEJE A QUANTIDADE DE PONTOS, O COMPRIMENTO DAS CORDAS, A POSIÇÃO E A DIREÇÃO EM QUE SERÃO APLICADAS AS FORÇAS PARA CONTROLE DA CARGA IÇADA;',
  'APLIQUE PROTETORES DE CANTOS/QUINAS VIVAS NOS PONTOS DE CONTATO COM AS CINTAS, ESTROPOS OU CORRENTES;',
  'CONSULTE E ENVOLVA O OPERADOR DO EQUIPAMENTO DE GUINDAR PARA REALIZAR O PLANEJAMENTO;',
  'O PESO DA CARGA DEVE SER OBRIGATORIAMENTE CONHECIDO. PARA ISSO PROCEDA DAS SEGUINTES FORMAS:',
  'CONSULTE EM SUA OM ou OS O PESO DA CARGA; ou',
  'BUSQUE NA PRÓPRIA CARGA ALGUMA PLACA OU OUTRA REFERÊNCIA QUE POSSA INDICAR SEU PESO; ou',
  'CONSULTE O PROJETO DA CARGA/PEÇA/COMPONENTE PARA IDENTIFICAÇÃO DO SEU PESO; ou',
  'O PESO DA CARGA PODERÁ SER ESTIMADO POR MEIO DE CÁLCULO DE VOLUME x DENSIDADE DO MATERIAL (ref. ABNT NBR-13541-2);',
]

export const LEMBRETE_FINAL = 'NÃO REALIZE O IÇAMENTO CASO NÃO CONSIGA IDENTIFICAR O PESO DA CARGA OU NÃO SAIBA ESTIMAR SEU PESO POR MEIO DE CÁLCULO.'
```

- [ ] **Step 6: Conferir os lembretes contra o PDF original**

Run:
Crie o script temporário `tmp/conferir-lembretes.py` (a pasta `tmp` é ignorada pelo git):
```python
import re
import pymupdf

def norm(s):
    return re.sub(r"\s+", " ", s.replace("- ", " ")).strip().upper()

alvo = norm(pymupdf.open("Plano básico 4.pdf")[0].get_text())
for linha in open("src/icamento/lembretes.ts", encoding="utf-8"):
    linha = linha.strip().rstrip(",")
    if linha.startswith("'") and linha.endswith("'") and len(linha) > 30:
        texto = linha[1:-1]
        print("OK    " if norm(texto)[:60] in alvo else "DIFERE", texto[:70])
    elif linha.startswith("export const LEMBRETE_FINAL"):
        texto = linha.split("= '", 1)[1].rstrip("'")
        print("OK    " if norm(texto)[:60] in alvo else "DIFERE", texto[:70])
```
Run: `PYTHONUTF8=1 python -I tmp/conferir-lembretes.py`
Expected: todas as linhas `OK`. Qualquer `DIFERE`: compare literalmente com o PDF e corrija `lembretes.ts` (ignore diferenças só de espaço/hífen de lista).

- [ ] **Step 7: Rodar tudo e ver passar**

Run: `npx vitest run src/icamento/pontos.test.ts src/checklist/storage.test.ts && npm test && npx tsc --noEmit`
Expected: testes passam (os 35 antigos + novos) e tsc sem erros. Se `nenhuma caixa se sobrepõe a outra` falhar para a `AREA_ESBOCO`, ajuste só as bordas da `AREA_ESBOCO` (mantendo a proporção 580:308) para não encostar em outra caixa.

- [ ] **Step 8: Commit**
```bash
git add src/icamento src/checklist/storage.ts src/checklist/storage.test.ts src/assets/esquema-icamento.png
git commit -m "feat: dados do plano de içamento, rascunho genérico e imagem do guindaste"
```

---

### Task 2: Cálculo do FU, textos das caixas e utilidades

**Files:**
- Create: `src/icamento/calc.ts`, `src/icamento/nome.ts`, `src/icamento/pessoa.ts`
- Test: `src/icamento/calc.test.ts`, `src/icamento/nome.test.ts`, `src/icamento/pessoa.test.ts`

**Interfaces:**
- Consumes: `emKg` de `src/checklist/calc.ts`; `IcamentoData`, `icamentoVazio` de `schema.ts`; `Ponto` de `pontos.ts`.
- Produces:
  - `type Unidade = 'Ton' | 'Kg'`; `unidadeDe(d: IcamentoData): Unidade` (`campos.unidade === 'Kg'` → Kg, senão Ton)
  - `formatarPeso(kg: number, unidade: Unidade): string` (na unidade pedida, 2 casas no máximo, vírgula)
  - `interface Fu {numeradorKg: number | null; denominadorKg: number | null; percentual: number | null}`; `fu(d: IcamentoData): Fu`
  - `acimaDe75Fu(d: IcamentoData): boolean`
  - `textoPonto(d: IcamentoData, p: Ponto): string` (texto que aparece na caixa: peso com unidade, metros com ` m`, inteiro puro, calculados sem unidade; vazio → `''`)
  - `nomeArquivoIcamento(d: IcamentoData, hoje: string): string`
  - `copiarOperador(d: IcamentoData): IcamentoData`

- [ ] **Step 1: Escrever os testes que falham**

`src/icamento/calc.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { acimaDe75Fu, formatarPeso, fu, textoPonto, unidadeDe } from './calc'
import { PONTOS } from './pontos'
import { icamentoVazio } from './schema'

const com = (campos: Record<string, string>) => ({ ...icamentoVazio(), campos })
const ponto = (id: string) => PONTOS.find((p) => p.id === id)!

describe('unidade', () => {
  it('padrão é Ton; só "Kg" muda', () => {
    expect(unidadeDe(com({}))).toBe('Ton')
    expect(unidadeDe(com({ unidade: 'Kg' }))).toBe('Kg')
    expect(unidadeDe(com({ unidade: 'qualquer' }))).toBe('Ton')
  })
  it('formatarPeso na unidade pedida', () => {
    expect(formatarPeso(11500, 'Ton')).toBe('11,5')
    expect(formatarPeso(1500, 'Kg')).toBe('1500')
    expect(formatarPeso(333, 'Ton')).toBe('0,33')
  })
})

describe('fu', () => {
  it('soma carga + acessórios + moitão sobre a capacidade', () => {
    const d = com({ pesoCarga: '10', pesoAcessorios: '1', pesoMoitao: '0,5', capMomentanea: '20' })
    expect(fu(d)).toEqual({ numeradorKg: 11500, denominadorKg: 20000, percentual: 57.5 })
  })
  it('acessórios e moitão vazios contam como 0', () => {
    expect(fu(com({ pesoCarga: '10', capMomentanea: '20' })).percentual).toBe(50)
  })
  it('respeita a unidade Kg', () => {
    expect(fu(com({ unidade: 'Kg', pesoCarga: '5000', capMomentanea: '10000' })).percentual).toBe(50)
  })
  it('em branco sem peso da carga, sem capacidade ou com capacidade zero', () => {
    expect(fu(com({ capMomentanea: '20' })).percentual).toBeNull()
    expect(fu(com({ pesoCarga: '10' })).percentual).toBeNull()
    expect(fu(com({ pesoCarga: '10', capMomentanea: '0' })).percentual).toBeNull()
  })
  it('valor ambíguo em campo opcional deixa o FU em branco (nunca vira 0)', () => {
    const d = com({ pesoCarga: '10', pesoAcessorios: '5.000', capMomentanea: '20' })
    expect(fu(d).numeradorKg).toBeNull()
    expect(fu(d).percentual).toBeNull()
  })
  it('acima de 75% só com valor estritamente maior', () => {
    expect(acimaDe75Fu(com({ pesoCarga: '16', capMomentanea: '20' }))).toBe(true)
    expect(acimaDe75Fu(com({ pesoCarga: '15', capMomentanea: '20' }))).toBe(false)
    expect(acimaDe75Fu(com({}))).toBe(false)
  })
})

describe('textoPonto', () => {
  const d = com({ pesoCarga: '16', lanca: '30', passadas: '4', capMomentanea: '20', pesoAcessorios: '1', pesoMoitao: '0,5' })
  it('peso leva a unidade, metros leva m, inteiro vai puro', () => {
    expect(textoPonto(d, ponto('pesoCarga'))).toBe('16 Ton')
    expect(textoPonto({ ...d, campos: { ...d.campos, unidade: 'Kg' } }, ponto('pesoCarga'))).toBe('16 Kg')
    expect(textoPonto(d, ponto('lanca'))).toBe('30 m')
    expect(textoPonto(d, ponto('passadas'))).toBe('4')
  })
  it('calculados saem sem unidade', () => {
    expect(textoPonto(d, ponto('fuNumerador'))).toBe('17,5')
    expect(textoPonto(d, ponto('fuDenominador'))).toBe('20')
    expect(textoPonto(d, ponto('fuResultado'))).toBe('87,5')
  })
  it('vazio devolve texto vazio', () => {
    expect(textoPonto(com({}), ponto('pesoCarga'))).toBe('')
    expect(textoPonto(com({}), ponto('fuResultado'))).toBe('')
    expect(textoPonto(com({ lanca: '   ' }), ponto('lanca'))).toBe('')
  })
})
```

`src/icamento/nome.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { nomeArquivoIcamento } from './nome'
import { icamentoVazio } from './schema'

describe('nomeArquivoIcamento', () => {
  it('usa data e carga limpa', () => {
    const d = { ...icamentoVazio(), campos: { data: '2026-10-16', carga: 'Viga 12/B' } }
    expect(nomeArquivoIcamento(d, '2026-01-01')).toBe('plano-icamento-2026-10-16-Viga12B.pdf')
  })
  it('sem data usa hoje e sem carga omite o sufixo', () => {
    expect(nomeArquivoIcamento(icamentoVazio(), '2026-01-01')).toBe('plano-icamento-2026-01-01.pdf')
  })
})
```

`src/icamento/pessoa.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { copiarOperador } from './pessoa'
import { icamentoVazio } from './schema'

describe('copiarOperador', () => {
  it('copia nome, documento e assinatura do operador para o responsável', () => {
    const d = {
      ...icamentoVazio(),
      campos: { opNome: 'Ana', opDoc: '123', respNome: 'Outro' },
      assinaturas: { opAss: 'data:image/png;base64,AAA' },
    }
    const r = copiarOperador(d)
    expect(r.campos).toMatchObject({ opNome: 'Ana', opDoc: '123', respNome: 'Ana', respDoc: '123' })
    expect(r.assinaturas).toMatchObject({ opAss: 'data:image/png;base64,AAA', respAss: 'data:image/png;base64,AAA' })
  })
  it('operador vazio limpa o responsável e não altera outros campos', () => {
    const d = { ...icamentoVazio(), campos: { local: 'Pátio', respNome: 'Alguém' } }
    const r = copiarOperador(d)
    expect(r.campos.respNome).toBe('')
    expect(r.campos.local).toBe('Pátio')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/icamento`
Expected: FAIL (módulos `./calc`, `./nome`, `./pessoa` não existem).

- [ ] **Step 3: Implementar**

`src/icamento/calc.ts`:
```ts
import { emKg } from '../checklist/calc'
import type { Ponto } from './pontos'
import type { IcamentoData } from './schema'

export type Unidade = 'Ton' | 'Kg'

export const unidadeDe = (d: IcamentoData): Unidade => (d.campos.unidade === 'Kg' ? 'Kg' : 'Ton')

/** Campo opcional: vazio vale 0; preenchido porém inválido/ambíguo vale null (nunca vira 0). */
function opcional(valor: string | undefined, unidade: Unidade): number | null {
  if (!valor || valor.trim() === '') return 0
  return emKg(valor, unidade)
}

export function formatarPeso(kg: number, unidade: Unidade): string {
  const v = unidade === 'Kg' ? kg : kg / 1000
  return String(Math.round(v * 100) / 100).replace('.', ',')
}

export interface Fu {
  numeradorKg: number | null
  denominadorKg: number | null
  percentual: number | null
}

export function fu(d: IcamentoData): Fu {
  const u = unidadeDe(d)
  const carga = emKg(d.campos.pesoCarga, u)
  const acessorios = opcional(d.campos.pesoAcessorios, u)
  const moitao = opcional(d.campos.pesoMoitao, u)
  const cap = emKg(d.campos.capMomentanea, u)
  const numeradorKg = carga === null || acessorios === null || moitao === null ? null : carga + acessorios + moitao
  const denominadorKg = cap === null || cap === 0 ? null : cap
  const percentual =
    numeradorKg === null || denominadorKg === null ? null : Math.round((numeradorKg / denominadorKg) * 1000) / 10
  return { numeradorKg, denominadorKg, percentual }
}

export function acimaDe75Fu(d: IcamentoData): boolean {
  const p = fu(d).percentual
  return p !== null && p > 75
}

export function textoPonto(d: IcamentoData, p: Ponto): string {
  const u = unidadeDe(d)
  if (p.tipo === 'calculado') {
    const f = fu(d)
    if (p.id === 'fuNumerador') return f.numeradorKg === null ? '' : formatarPeso(f.numeradorKg, u)
    if (p.id === 'fuDenominador') return f.denominadorKg === null ? '' : formatarPeso(f.denominadorKg, u)
    return f.percentual === null ? '' : String(f.percentual).replace('.', ',')
  }
  const v = (d.campos[p.id] ?? '').trim()
  if (!v) return ''
  if (p.tipo === 'peso') return `${v} ${u}`
  if (p.tipo === 'metros') return `${v} m`
  return v
}
```

`src/icamento/nome.ts`:
```ts
import type { IcamentoData } from './schema'

export function nomeArquivoIcamento(d: IcamentoData, hoje: string): string {
  const data = d.campos.data || hoje
  const carga = (d.campos.carga ?? '').replace(/[^\w-]/g, '')
  return `plano-icamento-${data}${carga ? `-${carga}` : ''}.pdf`
}
```

`src/icamento/pessoa.ts`:
```ts
import type { IcamentoData } from './schema'

export function copiarOperador(d: IcamentoData): IcamentoData {
  return {
    ...d,
    campos: { ...d.campos, respNome: d.campos.opNome ?? '', respDoc: d.campos.opDoc ?? '' },
    assinaturas: { ...d.assinaturas, respAss: d.assinaturas.opAss ?? '' },
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/icamento && npm test && npx tsc --noEmit`
Expected: todos passam; tsc sem erros.

- [ ] **Step 5: Commit**
```bash
git add src/icamento
git commit -m "feat: cálculo do FU, textos das caixas e utilidades do plano de içamento"
```

---

### Task 3: Hook e componentes do desenho (sem página)

**Files:**
- Create: `src/icamento/useIcamento.ts`, `src/components/DiagramaGuindaste.tsx`, `src/components/FolhaCampo.tsx`, `src/components/QuadroEsboco.tsx`, `src/components/TabelaAcessorios.tsx`
- Modify: `src/components/SignaturePad.tsx`, `src/index.css`

**Interfaces:**
- Consumes: tudo de `src/icamento/*` (Task 1-2); `getStore` de `checklist/storage`.
- Produces:
  - `useIcamento(): IcamentoApi` com `IcamentoApi = {data: IcamentoData; storageOk: boolean; setCampo(chave: string, valor: string): void; setAcessorio(i: number, campo: keyof LinhaAcessorio, valor: string): void; addLinha(): void; removeLinha(i: number): void; setEsboco(url: string): void; setAssinatura(id: string, url: string): void; mesmaPessoa(): void; reset(): void}`
  - `DiagramaGuindaste({data: IcamentoData; onSelecionar(id: string): void})` — ids vindos de `PONTOS` (não calculados) e `ID_ESBOCO`
  - `FolhaCampo({ponto: Ponto; valor: string; unidade: string; posicao: string; onChange(v: string): void; onAnterior(): void; onProximo(): void; onFechar(): void})`
  - `QuadroEsboco({value: string; onChange(url: string): void; onAnterior(): void; onConcluir(): void})`
  - `TabelaAcessorios({linhas: LinhaAcessorio[]; onChange(i: number, campo: keyof LinhaAcessorio, valor: string): void; onAdd(): void; onRemove(i: number): void})`
  - `SignaturePad` ganha props opcionais `largura?: number` (padrão 600), `altura?: number` (padrão 200), `dica?: string` (padrão `'Assine com o dedo ou mouse'`); sem elas o comportamento atual não muda.

- [ ] **Step 1: Estender `SignaturePad` com props opcionais**

Em `src/components/SignaturePad.tsx`:
1. Troque a interface `Props` e a assinatura da função por:
```tsx
interface Props {
  label: string
  value: string
  onChange: (dataUrl: string) => void
  largura?: number
  altura?: number
  dica?: string
}

export function SignaturePad({ label, value, onChange, largura = 600, altura = 200, dica = 'Assine com o dedo ou mouse' }: Props) {
```
2. Em `iniciar`, troque `ctx.lineWidth = 3` e a declaração de `ctx` por:
```tsx
    const c = ref.current!
    const ctx = c.getContext('2d')!
    ctx.lineWidth = 3 * (c.width / 600)
```
(remova a linha antiga `const ctx = ref.current!.getContext('2d')!` e a antiga `ctx.lineWidth = 3`; mantenha `lineCap` e `strokeStyle`).
3. No JSX, troque `width={600}` e `height={200}` por `width={largura}`, `height={altura}` e acrescente `style={{ aspectRatio: \`${largura}/${altura}\` }}` ao `<canvas>`; troque `<small>Assine com o dedo ou mouse</small>` por `<small>{dica}</small>`.

Run: `npx tsc --noEmit`. Expected: sem erros.

- [ ] **Step 2: Criar `useIcamento.ts`**

```ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStore, lerRascunho, limparRascunho, salvarRascunho } from '../checklist/storage'
import { copiarOperador } from './pessoa'
import { icamentoVazio, linhaVazia, type IcamentoData, type LinhaAcessorio } from './schema'

const CHAVE = 'site-luis:icamento:v1'

export interface IcamentoApi {
  data: IcamentoData
  storageOk: boolean
  setCampo(chave: string, valor: string): void
  setAcessorio(i: number, campo: keyof LinhaAcessorio, valor: string): void
  addLinha(): void
  removeLinha(i: number): void
  setEsboco(url: string): void
  setAssinatura(id: string, url: string): void
  mesmaPessoa(): void
  reset(): void
}

export function useIcamento(): IcamentoApi {
  const store = useMemo(getStore, [])
  const [data, setData] = useState<IcamentoData>(() => lerRascunho(store, CHAVE, icamentoVazio))
  const [storageOk, setStorageOk] = useState(store !== null)

  useEffect(() => {
    if (store) setStorageOk(salvarRascunho(store, CHAVE, data))
  }, [data, store])

  const setCampo = useCallback((chave: string, valor: string) => {
    setData((d) => ({ ...d, campos: { ...d.campos, [chave]: valor } }))
  }, [])

  const setAcessorio = useCallback((i: number, campo: keyof LinhaAcessorio, valor: string) => {
    setData((d) => ({ ...d, acessorios: d.acessorios.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)) }))
  }, [])

  const addLinha = useCallback(() => {
    setData((d) => ({ ...d, acessorios: [...d.acessorios, linhaVazia()] }))
  }, [])

  const removeLinha = useCallback((i: number) => {
    setData((d) => (d.acessorios.length > 1 ? { ...d, acessorios: d.acessorios.filter((_, j) => j !== i) } : d))
  }, [])

  const setEsboco = useCallback((url: string) => {
    setData((d) => ({ ...d, esboco: url }))
  }, [])

  const setAssinatura = useCallback((id: string, url: string) => {
    setData((d) => ({ ...d, assinaturas: { ...d.assinaturas, [id]: url } }))
  }, [])

  const mesmaPessoa = useCallback(() => {
    setData((d) => copiarOperador(d))
  }, [])

  const reset = useCallback(() => {
    limparRascunho(store, CHAVE)
    setData(icamentoVazio())
  }, [store])

  return { data, storageOk, setCampo, setAcessorio, addLinha, removeLinha, setEsboco, setAssinatura, mesmaPessoa, reset }
}
```

- [ ] **Step 3: Criar `DiagramaGuindaste.tsx`**

```tsx
import esquema from '../assets/esquema-icamento.png'
import { textoPonto } from '../icamento/calc'
import { ALTURA_IMG, AREA_ESBOCO, ID_ESBOCO, LARGURA_IMG, PONTOS } from '../icamento/pontos'
import type { IcamentoData } from '../icamento/schema'

interface Props {
  data: IcamentoData
  onSelecionar: (id: string) => void
}

const pctL = (v: number) => `${(v / LARGURA_IMG) * 100}%`
const pctA = (v: number) => `${(v / ALTURA_IMG) * 100}%`

export function DiagramaGuindaste({ data, onSelecionar }: Props) {
  return (
    <div className="diagrama-rolagem">
      <div className="diagrama">
        <img src={esquema} alt="Esquema de içamento com guindaste" draggable={false} />
        {PONTOS.map((p) => {
          const texto = textoPonto(data, p)
          const estilo = {
            left: pctL(p.x),
            top: pctA(p.y),
            width: pctL(p.w),
            height: pctA(p.h),
            fontSize: `${((p.h * 0.42) / LARGURA_IMG) * 100}cqw`,
          }
          const rotulo = `${p.rotulo}: ${texto || 'em branco'}`
          return p.tipo === 'calculado' ? (
            <div key={p.id} className="ponto calculado" style={estilo} aria-label={rotulo}>
              <span className="ponto-texto">{texto}</span>
            </div>
          ) : (
            <button
              type="button"
              key={p.id}
              className={`ponto${texto ? ' preenchido' : ''}`}
              style={estilo}
              aria-label={rotulo}
              onClick={() => onSelecionar(p.id)}
            >
              <span className="ponto-texto">{texto}</span>
            </button>
          )
        })}
        <button
          type="button"
          className={`ponto esboco${data.esboco ? ' preenchido' : ''}`}
          style={{ left: pctL(AREA_ESBOCO.x), top: pctA(AREA_ESBOCO.y), width: pctL(AREA_ESBOCO.w), height: pctA(AREA_ESBOCO.h) }}
          aria-label="Esboço da carga"
          onClick={() => onSelecionar(ID_ESBOCO)}
        >
          {data.esboco ? <img src={data.esboco} alt="Esboço da carga" /> : <span>Toque para desenhar o esboço</span>}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar `FolhaCampo.tsx`, `QuadroEsboco.tsx`, `TabelaAcessorios.tsx`**

`src/components/FolhaCampo.tsx`:
```tsx
import type { Ponto } from '../icamento/pontos'

interface Props {
  ponto: Ponto
  valor: string
  unidade: string
  posicao: string
  onChange: (v: string) => void
  onAnterior: () => void
  onProximo: () => void
  onFechar: () => void
}

export function FolhaCampo({ ponto, valor, unidade, posicao, onChange, onAnterior, onProximo, onFechar }: Props) {
  const sufixo = ponto.tipo === 'peso' ? unidade : ponto.tipo === 'metros' ? 'm' : ''
  return (
    <div className="folha-fundo" onClick={onFechar}>
      <div className="folha" role="dialog" aria-modal="true" aria-label={ponto.rotulo} onClick={(e) => e.stopPropagation()}>
        <h3>{ponto.rotulo}</h3>
        <div className="posicao">Campo {posicao}</div>
        <span className="campo-linha">
          <input
            autoFocus
            type="text"
            inputMode={ponto.tipo === 'inteiro' ? 'numeric' : 'decimal'}
            value={valor}
            aria-label={ponto.rotulo}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onProximo()
            }}
          />
          {sufixo && <span className="sufixo">{sufixo}</span>}
        </span>
        <div className="acoes">
          <button type="button" className="btn" onClick={onAnterior}>Anterior</button>
          <button type="button" className="btn primario" onClick={onProximo}>Próximo campo</button>
        </div>
        <button type="button" className="btn" style={{ width: '100%', marginTop: 10 }} onClick={onFechar}>Fechar</button>
      </div>
    </div>
  )
}
```

`src/components/QuadroEsboco.tsx`:
```tsx
import { SignaturePad } from './SignaturePad'

interface Props {
  value: string
  onChange: (url: string) => void
  onAnterior: () => void
  onConcluir: () => void
}

export function QuadroEsboco({ value, onChange, onAnterior, onConcluir }: Props) {
  return (
    <div className="quadro-esboco" role="dialog" aria-modal="true" aria-label="Esboço da carga">
      <h3 style={{ margin: 0 }}>Esboço da carga</h3>
      <SignaturePad
        label="Faça aqui o esboço da carga e como ela será “amarrada”"
        value={value}
        onChange={onChange}
        largura={1160}
        altura={616}
        dica="Desenhe com o dedo ou mouse"
      />
      <div className="acoes">
        <button type="button" className="btn" onClick={onAnterior}>Anterior</button>
        <button type="button" className="btn primario" onClick={onConcluir}>Concluir</button>
      </div>
    </div>
  )
}
```

`src/components/TabelaAcessorios.tsx`:
```tsx
import type { LinhaAcessorio } from '../icamento/schema'

interface Props {
  linhas: LinhaAcessorio[]
  onChange: (i: number, campo: keyof LinhaAcessorio, valor: string) => void
  onAdd: () => void
  onRemove: (i: number) => void
}

export function TabelaAcessorios({ linhas, onChange, onAdd, onRemove }: Props) {
  return (
    <div>
      {linhas.map((l, i) => (
        <div className="linha-acessorio" key={i}>
          <label className="campo">
            <span className="rotulo">Acessório / Dimensão</span>
            <input type="text" value={l.descricao} onChange={(e) => onChange(i, 'descricao', e.target.value)} />
          </label>
          <label className="campo">
            <span className="rotulo">Capacidade</span>
            <input type="text" inputMode="decimal" value={l.capacidade} onChange={(e) => onChange(i, 'capacidade', e.target.value)} />
          </label>
          <label className="campo">
            <span className="rotulo">Quantidade</span>
            <input type="text" inputMode="numeric" value={l.quantidade} onChange={(e) => onChange(i, 'quantidade', e.target.value)} />
          </label>
          <button type="button" className="btn perigo remover" disabled={linhas.length <= 1} onClick={() => onRemove(i)}>
            Remover linha
          </button>
        </div>
      ))}
      <button type="button" className="btn" onClick={onAdd}>Adicionar linha</button>
    </div>
  )
}
```

- [ ] **Step 5: Acrescentar o CSS no fim de `src/index.css`**

```css
textarea { width: 100%; min-height: 90px; font-family: inherit; font-size: 1rem; padding: 8px 10px; border: 1px solid var(--borda); border-radius: 8px; background: #fff; }
.diagrama-rolagem { overflow-x: auto; margin: 0 -16px 12px; padding: 0 16px; }
.diagrama { position: relative; container-type: inline-size; aspect-ratio: 2151 / 1200; min-width: 720px; background: #fff; border: 1px solid var(--borda); }
.diagrama > img { width: 100%; height: 100%; display: block; user-select: none; }
.ponto { position: absolute; display: flex; align-items: center; padding: 0 .5cqw; margin: 0; border: 0; border-radius: .4cqw; background: transparent; color: #0b3d91; font: inherit; font-weight: 700; text-align: left; cursor: pointer; }
.ponto::after { content: ''; position: absolute; inset: -6px; }
.ponto-texto { display: block; max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ponto:not(.preenchido):not(.calculado) { background: rgba(0, 124, 122, .14); outline: .25cqw dashed var(--cor); }
.ponto.calculado { cursor: default; color: #1b1b1b; }
.ponto.esboco { padding: 0; background: transparent; border-radius: 1cqw; justify-content: center; }
.ponto.esboco img { width: 100%; height: 100%; object-fit: contain; }
.ponto.esboco span { font-size: 1.6cqw; font-weight: 600; color: var(--cor-escura); text-align: center; }
.ponto.esboco.preenchido { outline: none; background: transparent; }
.folha-fundo { position: fixed; inset: 0; background: rgba(0, 0, 0, .35); display: flex; align-items: flex-end; justify-content: center; z-index: 20; }
.folha { width: 100%; max-width: 720px; background: #fff; border-radius: 16px 16px 0 0; padding: 16px 16px 20px; }
.folha h3 { margin: 0 0 4px; font-size: 1rem; color: var(--cor-escura); }
.folha .posicao { font-size: .8rem; color: #555; margin-bottom: 10px; }
.folha .sufixo { align-self: center; min-width: 48px; font-weight: 600; }
.folha .acoes { display: flex; gap: 12px; margin-top: 14px; }
.folha .acoes .btn { flex: 1; }
.quadro-esboco { position: fixed; inset: 0; background: #fff; z-index: 30; display: flex; flex-direction: column; padding: 16px; gap: 12px; overflow: auto; }
.quadro-esboco .acoes { display: flex; gap: 12px; }
.quadro-esboco .acoes .btn { flex: 1; }
.linha-acessorio { background: #fff; border: 1px solid var(--borda); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
.linha-acessorio .remover { margin-top: 4px; }
.lembretes { background: #f0f3f3; border: 1px solid var(--borda); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; font-size: .85rem; line-height: 1.35; }
.lembretes ul { margin: 6px 0 0; padding-left: 18px; }
```

- [ ] **Step 6: Verificar e commitar**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: tsc sem erros, testes passam (os existentes), build ok. (Componentes de tela não têm teste unitário por decisão do plano — não há jsdom; a Task 4 monta a página e o controlador verifica no navegador.)
```bash
git add src
git commit -m "feat: hook e componentes do desenho do guindaste"
```

---

### Task 4: Página `/icamento`, rota e card da Home

**Files:**
- Create: `src/pages/Icamento.tsx`
- Modify: `src/App.tsx`, `src/pages/Home.tsx`
- Create (stub, substituído na Task 5): `src/icamento/gerarPdf.tsx`

**Interfaces:**
- Consumes: `useIcamento`, `DiagramaGuindaste`, `FolhaCampo`, `QuadroEsboco`, `TabelaAcessorios`, `SignaturePad`, `CampoInput`, `fu`/`acimaDe75Fu`/`unidadeDe`, `CAMPOS_CABECALHO`, `ROTULO_COMO_PESO`, `RESPONSAVEIS`, `NOTA_ASSINATURA`, `PONTOS`, `ORDEM_EDICAO`, `ID_ESBOCO`, `LEMBRETES`, `TITULO_LEMBRETES`, `LEMBRETE_FINAL`.
- Produces: rota `/icamento`; `gerarPdf(data: IcamentoData): Promise<void>` em `src/icamento/gerarPdf.tsx` (stub nesta tarefa, versão real na Task 5, mesma assinatura).

- [ ] **Step 1: Criar o stub de `src/icamento/gerarPdf.tsx`**

```tsx
import type { IcamentoData } from './schema'

export async function gerarPdf(_data: IcamentoData): Promise<void> {
  throw new Error('PDF ainda não implementado')
}
```

- [ ] **Step 2: Criar `src/pages/Icamento.tsx`**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CampoInput } from '../components/CampoInput'
import { DiagramaGuindaste } from '../components/DiagramaGuindaste'
import { FolhaCampo } from '../components/FolhaCampo'
import { QuadroEsboco } from '../components/QuadroEsboco'
import { SignaturePad } from '../components/SignaturePad'
import { TabelaAcessorios } from '../components/TabelaAcessorios'
import { acimaDe75Fu, unidadeDe } from '../icamento/calc'
import { CAMPOS_CABECALHO, NOTA_ASSINATURA, RESPONSAVEIS, ROTULO_COMO_PESO } from '../icamento/campos'
import { gerarPdf } from '../icamento/gerarPdf'
import { LEMBRETES, LEMBRETE_FINAL, TITULO_LEMBRETES } from '../icamento/lembretes'
import { ID_ESBOCO, ORDEM_EDICAO, PONTOS } from '../icamento/pontos'
import { useIcamento } from '../icamento/useIcamento'

const PASSOS = ['Dados', 'Esquema', 'Acessórios', 'Assinaturas'] as const
const OPCIONAIS = ['pesoAcessorios', 'pesoContrapeso']

export default function Icamento() {
  const api = useIcamento()
  const { data } = api
  const [passo, setPasso] = useState(0)
  const [editando, setEditando] = useState<number | null>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const unidade = unidadeDe(data)
  const idAtual = editando === null ? null : ORDEM_EDICAO[editando]
  const pontoAtual = idAtual && idAtual !== ID_ESBOCO ? PONTOS.find((p) => p.id === idAtual) : undefined

  const abrir = (id: string) => {
    const i = ORDEM_EDICAO.indexOf(id)
    if (i >= 0) setEditando(i)
  }
  const proximo = () => setEditando((i) => (i === null ? null : i + 1 < ORDEM_EDICAO.length ? i + 1 : null))
  const anterior = () => setEditando((i) => (i === null ? null : Math.max(0, i - 1)))

  const vazio = (chave: string) => !(data.campos[chave] ?? '').trim()
  const pendentes = [
    ...CAMPOS_CABECALHO.filter((c) => vazio(c.id)).map((c) => c.label),
    ...(vazio('comoPeso') ? [ROTULO_COMO_PESO] : []),
    ...PONTOS.filter((p) => p.tipo !== 'calculado' && !OPCIONAIS.includes(p.id) && vazio(p.id)).map((p) => p.rotulo),
    ...(data.esboco ? [] : ['Esboço da carga']),
    ...RESPONSAVEIS.flatMap((r) => [
      ...(vazio(r.nome) ? [`${r.titulo}: nome`] : []),
      ...(data.assinaturas[r.assinatura] ? [] : [`${r.titulo}: assinatura`]),
    ]),
  ]

  const baixar = async () => {
    setGerando(true)
    setErro('')
    try {
      await gerarPdf(data)
    } catch (e) {
      setErro(`Não foi possível gerar o PDF: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGerando(false)
    }
  }

  const novo = () => {
    if (window.confirm('Apagar tudo e começar um novo plano?')) {
      api.reset()
      setPasso(0)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" style={{ color: '#fff' }} aria-label="Início">⌂</Link>
        <h1>Plano Básico de Içamento de Carga</h1>
      </header>
      {!api.storageOk && <div className="aviso">Não foi possível salvar o rascunho automático neste navegador.</div>}

      <nav className="passos" aria-label="Etapas">
        {PASSOS.map((p, i) => (
          <button key={p} type="button" className={i === passo ? 'ativo' : ''} onClick={() => setPasso(i)}>
            {i + 1}. {p}
          </button>
        ))}
      </nav>

      {passo === 0 && (
        <section className="grupo">
          <h3>DADOS DA ATIVIDADE</h3>
          {CAMPOS_CABECALHO.map((c) => (
            <CampoInput key={c.id} campo={c} campos={data.campos} onChange={api.setCampo} />
          ))}
          <label className="campo">
            <span className="rotulo">{ROTULO_COMO_PESO}</span>
            <textarea value={data.campos.comoPeso ?? ''} onChange={(e) => api.setCampo('comoPeso', e.target.value)} />
          </label>
        </section>
      )}

      {passo === 1 && (
        <>
          <h2>ESQUEMA DE IÇAMENTO</h2>
          <label className="campo">
            <span className="rotulo">Unidade dos pesos e capacidades</span>
            <select value={unidade} onChange={(e) => api.setCampo('unidade', e.target.value)} style={{ width: 120 }}>
              <option>Ton</option>
              <option>Kg</option>
            </select>
          </label>
          <p>
            <button type="button" className="btn primario" onClick={() => setEditando(0)}>Preencher campos</button>
          </p>
          <DiagramaGuindaste data={data} onSelecionar={abrir} />
          {acimaDe75Fu(data) && (
            <div className="aviso">FU acima de 75%: solicite a emissão de um Plano de Rigging.</div>
          )}
          <p>
            <small>Nota: O dimensionamento da forma de amarração da carga e a definição dos acessórios é de responsabilidade do executante da atividade.</small>
          </p>
        </>
      )}

      {passo === 2 && (
        <>
          <h2>LISTA DOS ACESSÓRIOS UTILIZADOS</h2>
          <TabelaAcessorios linhas={data.acessorios} onChange={api.setAcessorio} onAdd={api.addLinha} onRemove={api.removeLinha} />
        </>
      )}

      {passo === 3 && (
        <>
          <h2>Assinaturas</h2>
          {RESPONSAVEIS.map((r) => (
            <section className="grupo" key={r.id}>
              <h3>{r.titulo}</h3>
              <label className="campo">
                <span className="rotulo">Nome do Empregado</span>
                <input type="text" value={data.campos[r.nome] ?? ''} onChange={(e) => api.setCampo(r.nome, e.target.value)} />
              </label>
              <label className="campo">
                <span className="rotulo">Matrícula / CPF</span>
                <input type="text" value={data.campos[r.doc] ?? ''} onChange={(e) => api.setCampo(r.doc, e.target.value)} />
              </label>
              <SignaturePad
                label="Assinatura"
                value={data.assinaturas[r.assinatura] ?? ''}
                onChange={(url) => api.setAssinatura(r.assinatura, url)}
              />
              {r.id === 'resp' && (
                <p>
                  <button type="button" className="btn" onClick={api.mesmaPessoa}>Mesma pessoa do operador</button>
                </p>
              )}
            </section>
          ))}
          <p><small>{NOTA_ASSINATURA}</small></p>

          <div className="lembretes">
            <strong>{TITULO_LEMBRETES}</strong>
            <ul>
              {LEMBRETES.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p><strong>{LEMBRETE_FINAL}</strong></p>
          </div>

          {pendentes.length > 0 ? (
            <>
              <div className="aviso">{pendentes.length} item(ns) pendente(s) (o PDF pode ser gerado assim mesmo):</div>
              <ul className="pendentes">
                {pendentes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Tudo preenchido.</p>
          )}
          {erro && <div className="aviso">{erro}</div>}
          <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn primario" onClick={baixar} disabled={gerando}>
              {gerando ? 'Gerando…' : 'Gerar PDF'}
            </button>
            <button type="button" className="btn perigo" onClick={novo}>Novo plano</button>
          </p>
        </>
      )}

      {pontoAtual && editando !== null && (
        <FolhaCampo
          ponto={pontoAtual}
          valor={data.campos[pontoAtual.id] ?? ''}
          unidade={unidade}
          posicao={`${editando + 1} de ${ORDEM_EDICAO.length}`}
          onChange={(v) => api.setCampo(pontoAtual.id, v)}
          onAnterior={anterior}
          onProximo={proximo}
          onFechar={() => setEditando(null)}
        />
      )}
      {idAtual === ID_ESBOCO && (
        <QuadroEsboco value={data.esboco} onChange={api.setEsboco} onAnterior={anterior} onConcluir={() => setEditando(null)} />
      )}

      <div className="rodape-nav">
        <button type="button" className="btn" disabled={passo === 0} onClick={() => setPasso(passo - 1)}>Voltar</button>
        <button type="button" className="btn primario" disabled={passo === PASSOS.length - 1} onClick={() => setPasso(passo + 1)}>
          Próximo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Ligar rota e card**

`src/App.tsx`: acrescente `import Icamento from './pages/Icamento'` e, dentro de `<Routes>`, a linha `<Route path="/icamento" element={<Icamento />} />`.

`src/pages/Home.tsx`: troque o bloco
```tsx
        <div className="card disabled" aria-disabled="true">
          <strong>Plano de Içamento</strong>
          <span>Em breve</span>
        </div>
```
por
```tsx
        <Link to="/icamento" className="card">
          <strong>Plano de Içamento</strong>
          <span>Plano Básico de Içamento de Carga</span>
        </Link>
```
(o card "Ferramentas" continua desabilitado).

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: sem erros; testes passam.
Start `npm run dev` em segundo plano; `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/` deve imprimir 200; pare o servidor. (A verificação visual no navegador é feita pelo controlador.)

- [ ] **Step 5: Commit**
```bash
git add src
git commit -m "feat: página do plano de içamento com desenho interativo"
```

---

### Task 5: Documento PDF e geração

**Files:**
- Create: `src/icamento/IcamentoPdf.tsx`
- Modify: `src/icamento/gerarPdf.tsx` (substitui o stub)
- Test: `src/icamento/IcamentoPdf.test.tsx`

**Interfaces:**
- Consumes: `IcamentoData`; `textoPonto`; `PONTOS`, `AREA_ESBOCO`, `LARGURA_IMG`, `ALTURA_IMG`; `CAMPOS_CABECALHO`, `ROTULO_COMO_PESO`, `RESPONSAVEIS`, `NOTA_ASSINATURA`; `LEMBRETES`, `LEMBRETE_FINAL`, `TITULO_LEMBRETES`; `formatarData`, `dataLocalISO` de `checklist/format`; `nomeArquivoIcamento`.
- Produces: `IcamentoPdf({data: IcamentoData; esquemaSrc: Fonte; logoSrc?: string})` onde `Fonte = ComponentProps<typeof Image>['src']` (do `@react-pdf/renderer`); `gerarPdf(data: IcamentoData): Promise<void>` baixa `nomeArquivoIcamento(...)`.

- [ ] **Step 1: Escrever o teste de fumaça que falha**

`src/icamento/IcamentoPdf.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { IcamentoPdf } from './IcamentoPdf'
import { CAMPOS_CABECALHO, RESPONSAVEIS } from './campos'
import { PONTOS } from './pontos'
import { icamentoVazio, linhaVazia, type IcamentoData } from './schema'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const esquema = { data: readFileSync('src/assets/esquema-icamento.png'), format: 'png' as const }

function dadosCheios(linhas = 4): IcamentoData {
  const d = icamentoVazio()
  for (const c of CAMPOS_CABECALHO) d.campos[c.id] = c.kind === 'data' ? '2026-10-16' : 'Texto de teste'
  d.campos.comoPeso = 'Consulta ao projeto da peça'
  for (const p of PONTOS) if (p.tipo !== 'calculado') d.campos[p.id] = '12,5'
  d.campos.pesoCarga = '10'
  d.campos.capMomentanea = '20'
  d.acessorios = Array.from({ length: linhas }, (_, i) => ({ ...linhaVazia(), descricao: `Cinta ${i + 1} / 6 m`, capacidade: '5 t', quantidade: '2' }))
  d.esboco = PIXEL
  for (const r of RESPONSAVEIS) {
    d.campos[r.nome] = 'Fulano de Tal'
    d.campos[r.doc] = '12345'
    d.assinaturas[r.assinatura] = PIXEL
  }
  return d
}

const paginas = (buf: Buffer) => Number(/\/Count (\d+)/.exec(buf.toString('latin1'))?.[1])

describe('IcamentoPdf', () => {
  it('gera um PDF válido com dados vazios', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={icamentoVazio()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('gera um PDF válido de 1 página com tudo preenchido e 4 acessórios', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(buf.length).toBeGreaterThan(20000)
    expect(paginas(buf)).toBe(1)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra-icamento.pdf', buf)
    }
  })

  it('aceita muitos acessórios (a tabela cresce)', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios(30)} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/icamento/IcamentoPdf.test.tsx`
Expected: FAIL (`./IcamentoPdf` não existe).

- [ ] **Step 3: Implementar `IcamentoPdf.tsx`**

```tsx
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ComponentProps } from 'react'
import { formatarData } from '../checklist/format'
import { textoPonto } from './calc'
import { CAMPOS_CABECALHO, NOTA_ASSINATURA, RESPONSAVEIS, ROTULO_COMO_PESO } from './campos'
import { LEMBRETES, LEMBRETE_FINAL, TITULO_LEMBRETES } from './lembretes'
import { ALTURA_IMG, AREA_ESBOCO, LARGURA_IMG, PONTOS } from './pontos'
import type { IcamentoData } from './schema'

type Fonte = ComponentProps<typeof Image>['src']

const PRETO = '#000'
const LARG = 547 // largura útil da página A4 (595 - 2×24)
const ESCALA = LARG / LARGURA_IMG
const ALT = (LARG * ALTURA_IMG) / LARGURA_IMG
const pctL = (v: number) => `${(v / LARGURA_IMG) * 100}%`
const pctA = (v: number) => `${(v / ALTURA_IMG) * 100}%`
const MIN_LINHAS = 4

const s = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: 'Helvetica' },
  linha: { flexDirection: 'row' },
  cel: { borderWidth: 1, borderColor: PRETO, padding: 3, marginLeft: -1, marginTop: -1 },
  rotulo: { fontSize: 6.5, fontFamily: 'Helvetica-Bold' },
  valor: { fontSize: 8, marginTop: 2 },
  logo: { width: 80, height: 30, objectFit: 'contain' },
  titulo: { textAlign: 'center', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  subtitulo: { textAlign: 'center', fontSize: 9 },
  banner: { backgroundColor: '#bfbfbf', borderWidth: 1, borderColor: PRETO, marginTop: -1, padding: 3, alignItems: 'center' },
  bannerTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  bannerSub: { fontSize: 5.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  diagrama: { width: LARG, height: ALT, borderWidth: 1, borderColor: PRETO, marginTop: -1 },
  tabelaTitulo: { backgroundColor: '#bfbfbf', borderWidth: 1, borderColor: PRETO, padding: 2, textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 8, marginTop: 6 },
  celTab: { borderWidth: 1, borderColor: PRETO, marginLeft: -1, marginTop: -1, padding: 2, minHeight: 12 },
  celTabCab: { backgroundColor: '#d9d9d9', fontFamily: 'Helvetica-Bold', fontSize: 6.5 },
  lembretes: { borderWidth: 1, borderColor: PRETO, marginTop: 6, padding: 4, fontSize: 6.5, backgroundColor: '#f2f2f2' },
  assinImg: { width: 80, height: 22, objectFit: 'contain' },
})

function Celula({ rotulo, valor, flex }: { rotulo: string; valor: string; flex: number }) {
  return (
    <View style={[s.cel, { flex }]}>
      <Text style={s.rotulo}>{rotulo}:</Text>
      <Text style={s.valor}>{valor}</Text>
    </View>
  )
}

export function IcamentoPdf({ data, esquemaSrc, logoSrc }: { data: IcamentoData; esquemaSrc: Fonte; logoSrc?: string }) {
  const campos = data.campos
  const cab = (id: string) => {
    const c = CAMPOS_CABECALHO.find((x) => x.id === id)!
    return { rotulo: c.label, valor: c.kind === 'data' ? formatarData(campos[id] ?? '') : (campos[id] ?? '') }
  }
  const linhas = [...data.acessorios]
  while (linhas.length < MIN_LINHAS) linhas.push({ descricao: '', capacidade: '', quantidade: '' })

  return (
    <Document title="Plano Básico de Içamento de Carga">
      <Page size="A4" style={s.page}>
        <View style={s.linha}>
          <View style={[s.cel, { flex: 193, justifyContent: 'center' }]}>{logoSrc && <Image src={logoSrc} style={s.logo} />}</View>
          <View style={[s.cel, { flex: 235 + 200, justifyContent: 'center' }]}>
            <Text style={s.titulo}>Plano Básico de Içamento de Carga</Text>
            <Text style={s.subtitulo}>(Guindastes)</Text>
          </View>
          <View style={[s.cel, { flex: 154 }]} />
        </View>
        <View style={s.linha}>
          <Celula {...cab('local')} flex={193} />
          <Celula {...cab('atividade')} flex={235 + 200 + 154} />
        </View>
        <View style={s.linha}>
          <Celula {...cab('equipamento')} flex={193} />
          <Celula {...cab('carga')} flex={235} />
          <Celula {...cab('gerencia')} flex={200} />
          <Celula {...cab('data')} flex={154} />
        </View>
        <View style={s.linha}>
          <Celula rotulo={ROTULO_COMO_PESO.replace(/\?$/, '')} valor={campos.comoPeso ?? ''} flex={1} />
        </View>

        <View style={s.banner}>
          <Text style={s.bannerTitulo}>ESQUEMA DE IÇAMENTO</Text>
          <Text style={s.bannerSub}>(FORMALIZE AQUI O DETALHAMENTO DO SEU IÇAMENTO CONFORME A SEQUÊNCIA DAS INFORMAÇÕES SOLICITADAS EM CADA CAMPO</Text>
          <Text style={s.bannerSub}>INCLUINDO O ESBOÇO DE COMO A CARGA SERÁ “AMARRADA”</Text>
        </View>
        <View style={s.diagrama}>
          <Image src={esquemaSrc} style={{ width: LARG - 2, height: ALT - 2 }} />
          {PONTOS.map((p) => {
            const texto = textoPonto(data, p)
            if (!texto) return null
            return (
              <View
                key={p.id}
                style={{ position: 'absolute', left: pctL(p.x), top: pctA(p.y), width: pctL(p.w), height: pctA(p.h), justifyContent: 'center', paddingLeft: 2 }}
              >
                <Text style={{ fontSize: p.h * 0.42 * ESCALA, fontFamily: 'Helvetica-Bold', color: '#0b3d91' }} maxLines={1}>
                  {texto}
                </Text>
              </View>
            )
          })}
          {data.esboco ? (
            <Image
              src={data.esboco}
              style={{ position: 'absolute', left: pctL(AREA_ESBOCO.x), top: pctA(AREA_ESBOCO.y), width: pctL(AREA_ESBOCO.w), height: pctA(AREA_ESBOCO.h), objectFit: 'contain' }}
            />
          ) : null}
        </View>

        <Text style={s.tabelaTitulo}>LISTA DOS ACESSÓRIOS UTILIZADOS</Text>
        <View style={s.linha}>
          <Text style={[s.celTab, s.celTabCab, { flex: 58 }]}>ACESSÓRIO / DIMENSÃO</Text>
          <Text style={[s.celTab, s.celTabCab, { flex: 21, textAlign: 'center' }]}>CAPACIDADE</Text>
          <Text style={[s.celTab, s.celTabCab, { flex: 21, textAlign: 'center' }]}>QUANTIDADE</Text>
        </View>
        {linhas.map((l, i) => (
          <View key={i} style={s.linha} wrap={false}>
            <Text style={[s.celTab, { flex: 58 }]}>{l.descricao}</Text>
            <Text style={[s.celTab, { flex: 21, textAlign: 'center' }]}>{l.capacidade}</Text>
            <Text style={[s.celTab, { flex: 21, textAlign: 'center' }]}>{l.quantidade}</Text>
          </View>
        ))}

        <View style={s.lembretes} wrap={false}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{TITULO_LEMBRETES}</Text>
          {LEMBRETES.map((t) => (
            <Text key={t}>- {t}</Text>
          ))}
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8 }}>- {LEMBRETE_FINAL}</Text>
        </View>

        <View style={{ marginTop: 6 }} wrap={false}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 6.5 }}>Assinaturas:</Text>
          <View style={s.linha}>
            <Text style={[s.celTab, s.celTabCab, { flex: 30, borderWidth: 0 }]} />
            <Text style={[s.celTab, s.celTabCab, { flex: 40, textAlign: 'center', borderWidth: 0 }]}>Nome do Empregado</Text>
            <Text style={[s.celTab, s.celTabCab, { flex: 14, textAlign: 'center', borderWidth: 0 }]}>Matrícula / CPF</Text>
            <Text style={[s.celTab, s.celTabCab, { flex: 16, textAlign: 'center', borderWidth: 0 }]}>Assinatura</Text>
          </View>
          {RESPONSAVEIS.map((r) => (
            <View key={r.id} style={s.linha}>
              <Text style={[s.celTab, { flex: 30, minHeight: 28 }]}>{r.titulo}</Text>
              <Text style={[s.celTab, { flex: 40 }]}>{campos[r.nome] ?? ''}</Text>
              <Text style={[s.celTab, { flex: 14 }]}>{campos[r.doc] ?? ''}</Text>
              <View style={[s.celTab, { flex: 16, justifyContent: 'center' }]}>
                {data.assinaturas[r.assinatura] ? <Image src={data.assinaturas[r.assinatura]} style={s.assinImg} /> : null}
              </View>
            </View>
          ))}
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 5.5, marginTop: 2 }}>{NOTA_ASSINATURA}</Text>
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/icamento/IcamentoPdf.test.tsx`
Expected: PASS (3 testes). Se `paginas(...)` for 2 com 4 acessórios, reduza espaçamentos/fontes (`lembretes`, `banner`, margens) até caber em 1 página sem mexer no teste. Se houver erro de runtime do react-pdf (estilo, imagem), corrija o componente e registre no relatório.

- [ ] **Step 5: Implementar `gerarPdf.tsx` (substitui o stub)**

```tsx
import logo from '../assets/logo-ccr-engemob.png'
import esquema from '../assets/esquema-icamento.png'
import { dataLocalISO } from '../checklist/format'
import { nomeArquivoIcamento } from './nome'
import type { IcamentoData } from './schema'

export async function gerarPdf(data: IcamentoData): Promise<void> {
  const [{ pdf }, { IcamentoPdf }] = await Promise.all([import('@react-pdf/renderer'), import('./IcamentoPdf')])
  const blob = await pdf(<IcamentoPdf data={data} esquemaSrc={esquema} logoSrc={logo} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivoIcamento(data, dataLocalISO(new Date()))
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

- [ ] **Step 6: Gerar amostra, rodar tudo e commitar**

Run: `SAVE_PDF=1 npx vitest run src/icamento/IcamentoPdf.test.tsx` (cria `tmp/amostra-icamento.pdf`, ignorado pelo git). Renderize a página para PNG e olhe:
```bash
python -I -c "
import pymupdf
d=pymupdf.open('tmp/amostra-icamento.pdf'); print('paginas',len(d))
d[0].get_pixmap(dpi=110).save('tmp/amostra-icamento.png')
"
```
Abra `tmp/amostra-icamento.png` (Read) e descreva no relatório: cabeçalho, valores dentro das caixas do desenho, lista, lembretes e assinaturas — e qualquer valor que caia fora da sua caixa.

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: tudo passa.
```bash
git add src
git commit -m "feat: PDF do plano de içamento"
```

---

### Task 6: Verificação final campo a campo (controlador, no navegador)

**Files:** nenhum arquivo novo (correções, se houver, nos arquivos existentes).

- [ ] **Step 1: Conferir o PDF contra a folha original**

Com `tmp/amostra-icamento.png` (Task 5) ao lado de `tmp/plano-basico.png` (render do `Plano básico 4.pdf` original), confira: cabeçalho (Local, Atividade, Equipamento, Carga/Peça, Gerência, Data, "Como foi obtido o peso da carga?"); as 9 caixas digitáveis e as 3 do FU com o valor dentro da caixa certa; esboço dentro da área tracejada; lista com ≥4 linhas; lembretes; as 2 assinaturas com nome, matrícula/CPF e imagem. Qualquer campo ausente ou fora da caixa → corrigir `pontos.ts`/`IcamentoPdf.tsx`, rodar `npm test` e repetir.

- [ ] **Step 2: Teste ponta a ponta no navegador (celular emulado 375×812 e desktop)**

Com `npm run dev`: em `http://localhost:5173/#/icamento`:
- etapa Dados: preencher os 6 campos e "Como foi obtido…";
- etapa Esquema: **Preencher campos** abre a folha no primeiro campo; **Próximo campo** percorre os 9 campos e termina no quadro de desenho; desenhar o esboço e **Concluir**; os valores aparecem dentro das caixas do desenho e o esboço dentro da área tracejada; Peso da Carga 16 e Capacidade 20 mostram FU 80 e o aviso do Plano de Rigging; trocar a unidade para Kg muda o texto das caixas; tocar diretamente numa caixa abre aquele campo;
- etapa Acessórios: adicionar e remover linhas;
- etapa Assinaturas: desenhar as duas assinaturas; "Mesma pessoa do operador" copia nome, matrícula e assinatura; pendentes aparecem para o que falta e o PDF ainda é gerado;
- recarregar a página mantém o que foi preenchido (inclusive esboço e assinaturas); "Novo plano" pede confirmação e limpa tudo;
- **Gerar PDF** baixa `plano-icamento-AAAA-MM-DD-<carga>.pdf` e o arquivo abre com logo, desenho e valores.
Capture o PDF gerado pela própria página (interceptando `URL.createObjectURL` para blobs `application/pdf`) e renderize para conferir.

- [ ] **Step 3: Rodar tudo uma última vez**

Run: `npm test && npm run build`
Expected: testes passam e `dist/` gerado sem erros.

**Fora deste plano (próximos ciclos):** publicar na Vercel (ação externa, só com seu pedido), ferramentas do Guia RAC 5 (sub-projeto 3).
