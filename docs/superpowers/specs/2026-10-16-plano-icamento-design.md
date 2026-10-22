# Plano Básico de Içamento — sub-projeto 2

Data: 2026-10-16
Base: sub-projeto 1 (`2026-10-16-base-e-checklist-design.md`). Mesma pilha: Vite + React + TypeScript, `@react-pdf/renderer`, sem backend, sem login, rascunho em `localStorage`.

## Objetivo

Preencher o "Plano Básico de Içamento de Carga (Guindastes)" (`Plano básico 4.pdf`) no site e gerar um PDF idêntico à folha original. O centro do formulário é o **desenho do guindaste**: os campos ficam nos mesmos lugares da folha.

## Decisões aprovadas

- O desenho do guindaste é o próprio formulário. No celular, **tocar numa caixa abre um campo grande** (folha inferior) com botão **Próximo campo**.
- Esboço da carga: tocar na área tracejada abre um quadro de desenho em tela cheia; o desenho volta reduzido para dentro da área tracejada.
- Uma única unidade de peso (Ton ou Kg, padrão Ton) vale para todo o desenho.
- PDF idêntico à folha, com a imagem do guindaste em alta resolução.
- Todos os campos de preencher da folha existem no site e no PDF, inclusive as duas assinaturas.

## Inventário de campos

**Cabeçalho** (formulário comum, fora do desenho)
- Local; Atividade; Equipamento de Guindar Utilizado (tipo e TAG); Carga/Peça; Gerência; Data
- Como foi obtido o peso da carga? (texto livre, várias linhas)

**Sobre o desenho** (caixas, coordenadas na imagem `2151×1200` px)

| id | Rótulo (da imagem) | x | y | larg. | alt. | Tipo |
|---|---|---|---|---|---|---|
| `lanca` | Comprimento da Lança | 952 | 82 | 240 | 58 | digitável (m) |
| `capMoitao` | Capacidade do Moitão | 1538 | 84 | 130 | 58 | digitável (peso) |
| `passadas` | Nº de Passadas de Cabo no Moitão | 1594 | 180 | 128 | 58 | digitável (inteiro) |
| `pesoMoitao` | Peso do Moitão | 1248 | 226 | 126 | 58 | digitável (peso) |
| `pesoCarga` | Peso da Carga | 1792 | 328 | 258 | 58 | digitável (peso) |
| `pesoAcessorios` | Peso dos Acessórios Especiais (Balancins, Berços e Caixas) | 1810 | 670 | 266 | 58 | digitável (peso) |
| `pesoContrapeso` | Peso do Contrapeso, quando aplicável | 184 | 702 | 238 | 58 | digitável (peso) |
| `raioMax` | Raio Máximo atingido na movimentação | 946 | 996 | 264 | 58 | digitável (m) |
| `capMomentanea` | Capacidade Momentânea do Guindaste (Tabela de Carga) | ≈68 | ≈994 | ≈521 | ≈100 | digitável (peso) |
| `fuNumerador` | FU: Peso da Carga + Peso dos Acessórios + Peso do Moitão | 228 | 174 | 220 | 40 | calculado |
| `fuDenominador` | FU: Capacidade de acordo com a Tabela de Carga | 228 | 240 | 220 | 42 | calculado |
| `fuResultado` | FU (%) | 628 | 198 | 172 | 56 | calculado |
| (esboço) | Faça aqui o esboço da carga | ≈1147 | ≈296 | ≈596 | ≈324 | desenho |

As coordenadas com ≈ serão remedidas na implementação com a mesma técnica usada aqui (detecção das caixas na imagem); a tabela vai para `src/icamento/pontos.ts` como dados.

**FU (fator de utilização)** = (Peso da Carga + Peso dos Acessórios Especiais + Peso do Moitão) ÷ Capacidade Momentânea × 100, uma casa decimal, vírgula decimal.
- Calcula quando Peso da Carga e Capacidade Momentânea estão preenchidos. Acessórios e Moitão vazios contam como 0.
- Acima de 75%: aviso "Solicite a emissão de um Plano de Rigging" sobre o desenho. O aviso não bloqueia nada.
- As três caixas do FU só mostram o resultado (não se digita nelas).

**Lista dos acessórios utilizados**
- Linhas com Acessório/Dimensão, Capacidade, Quantidade. Começa com 4 linhas, como a folha; botão "Adicionar linha" e remover linha.

**Rodapé**
- "Lembretes de medidas obrigatórias": texto fixo, copiado literalmente do PDF original (aparece na tela na etapa de revisão e no PDF).
- Assinaturas: **Operador do Equipamento de Guindar** e **Responsável pela Amarração da Carga**, cada um com Nome do Empregado, Matrícula/CPF e Assinatura (desenhada).
- Nota "Caso o operador também seja o responsável pela amarração, deverá assinar nos dois campos": botão **Mesma pessoa** que copia nome, matrícula/CPF e assinatura do Operador para o Responsável.

## Arquitetura

```
src/
  pages/Icamento.tsx            etapas: Dados → Esquema → Acessórios → Assinaturas e revisar
  icamento/
    schema.ts                   IcamentoData, dadosVazios
    pontos.ts                   tabela de caixas (id, rótulo, x,y,w,h, tipo) e a área do esboço
    calc.ts                     fu(), usa parseNumero/emKg de checklist/calc
    lembretes.ts                texto fixo literal
    useIcamento.ts              estado + rascunho (chave própria)
    IcamentoPdf.tsx             documento PDF
    gerarPdf.tsx                gera e baixa
  components/
    DiagramaGuindaste.tsx       imagem + caixas sobrepostas (posição em %), toque abre o editor
    FolhaCampo.tsx              folha inferior com campo grande + Anterior/Próximo
    QuadroEsboco.tsx            desenho em tela cheia (reaproveita a lógica do SignaturePad)
    TabelaAcessorios.tsx        linhas editáveis
  assets/esquema-icamento.png   imagem extraída do PDF original (2151×1200)
```

**Mudanças em código já existente (pequenas):**
- `checklist/storage.ts`: `loadDraft`/`saveDraft`/`clearDraft` passam a receber a chave (hoje fixa); o checklist continua usando a chave atual. Os testes existentes são ajustados.
- `Home.tsx`: o card "Plano de Içamento" vira link para `/icamento`; `App.tsx` ganha a rota.
- `components/SignaturePad.tsx`: o desenho em canvas é reaproveitado pelo `QuadroEsboco` (extrai-se a parte comum só se ficar simples; senão o quadro replica o necessário).

**Desenho na tela:** o container tem `aspect-ratio: 2151/1200`, a imagem ocupa 100% e cada caixa é um elemento posicionado por porcentagem (`x/2151`, `y/1200`, …). O valor aparece dentro da caixa, com fonte proporcional à largura do container. A mesma folha de edição (bottom sheet) abre em qualquer tamanho de tela, no PC e no celular (decisão registrada em 2026-10-16).

**PDF:** página A4 retrato em `react-pdf` que reproduz a folha: cabeçalho (logo à esquerda, título "Plano Básico de Içamento de Carga (Guindastes)" ao centro, caixa em branco à direita como no original), linhas de Local/Atividade/Equipamento/Carga/Gerência/Data, "Como foi obtido o peso da carga?", faixa "ESQUEMA DE IÇAMENTO", a imagem com os valores desenhados nas mesmas coordenadas (texto com posição absoluta, `x/2151`) e o esboço dentro da área tracejada, tabela de acessórios, lembretes e assinaturas com imagens. Se houver mais de 4 acessórios, a tabela cresce e a folha passa para duas páginas sem cortar linhas.

## Comportamento

- Rascunho automático no navegador (chave própria), botão "Novo plano" com confirmação.
- Revisão lista campos de peso/capacidade vazios e assinaturas em branco; avisa mas não bloqueia o PDF.
- Campos numéricos aceitam vírgula decimal e seguem as regras de `parseNumero` do checklist (entrada ambígua como "5.000" não é adivinhada).
- Se Peso da Carga e Capacidade Momentânea estão preenchidos mas o FU não pode ser calculado (valor ambíguo como 5.000, ou capacidade 0), a tela e a revisão avisam em vez de deixar o FU em branco sem explicação.
- Nome do arquivo: `plano-icamento-AAAA-MM-DD-<carga>.pdf` (data local; carga limpa com `/[^\w-]/g`, omitida se vazia).
- Se o `localStorage` falhar, funciona sem rascunho, com o mesmo aviso do checklist.

## Testes

- Vitest: `fu()` (soma, arredondamento, vazio, capacidade zero, unidades Ton/Kg, acima de 75%); `pontos.ts` (ids únicos, todas as caixas dentro de 2151×1200, existem os 9 campos digitáveis e os 3 calculados); `storage` com chave parametrizada; fumaça do `IcamentoPdf` (PDF válido com dados vazios e cheios).
- Verificação manual no navegador (celular emulado e PC): preencher tudo, gerar o PDF, renderizá-lo e **comparar com a folha original** campo a campo; conferir que cada valor cai dentro da sua caixa.
- Critério de pronto: cada campo do inventário existe na tela **e** aparece no PDF, no lugar da folha original.

## Fora do escopo

Ferramentas do Guia RAC 5 (sub-projeto 3), login, histórico, exportar `.xlsx`, uso offline, tradução do desenho para outro idioma.

## Pontos para o usuário confirmar

1. A imagem do guindaste (extraída do seu PDF) entra no repositório do GitHub, como o logo já entrou.
2. A caixa em branco no canto superior direito do cabeçalho fica vazia, como no original.
3. Acessórios e Moitão vazios contam como 0 no FU; o Peso do Contrapeso e a Capacidade do Moitão não entram na fórmula (como na folha).

---

## Atualização (2026-10-21): dados e assinaturas vêm do Checklist

Os campos de cabeçalho (Local, Atividade, Equipamento, Carga/Peça, Gerência, Data, "Como foi obtido o peso da carga"), Responsável pela atividade, Projeto e as pessoas (Operador e Responsável pela Amarração, com Nome, **Empresa** e Assinatura) passaram a ser preenchidos **uma única vez, na tela Dados do Checklist**. O Plano de Içamento tem só 3 etapas (Esquema, Acessórios, Revisar), lê esses dados do rascunho do checklist e a coluna "Matrícula / CPF" da tabela de assinaturas virou "Empresa". A revisão lista o que falta no Checklist. "Novo plano" apaga só o esquema e os acessórios.
