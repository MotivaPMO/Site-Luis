# Site de Movimentação de Carga — Base + Checklist (sub-projeto 1)

Data: 2026-10-16

## Contexto e decomposição

O usuário preenche à mão três materiais e quer um site rápido para celular e PC (sempre com internet):

1. **Checklist "Plano para Movimentação de Carga"** (`Plano de Movimentação de Carga Checklist.xlsx`)
2. **"Plano Básico de Içamento de Carga (Guindastes)"** (`Plano básico 4.pdf`)
3. **Ferramentas do app "Guia RAC 5"** (prints `shared image*.jpg`): Disol, FU, Cinta/ângulo, Cores, Sinais, CMTE, CINSP, Mataco

Cada parte tem seu ciclo spec → plano → implementação. **Esta spec cobre o sub-projeto 1: base do site + Checklist.** Os sub-projetos 2 e 3 reaproveitam a base. O inventário de campos do sub-projeto 2 está no Anexo A para que nada se perca.

## Decisões já aprovadas

- Uso: celular e computador, sempre com internet. Sem login, sem banco de dados, sem offline.
- Saída: **PDF no mesmo layout do original**, com assinaturas desenhadas na tela.
- Requisito do usuário: **todos os campos de preencher dos documentos originais existem no site**, inclusive as assinaturas.
- Stack: Vite + React + TypeScript, `@react-pdf/renderer` para o PDF, deploy estático (Vercel).

## Arquitetura

Site estático (SPA). Sem backend.

```
src/
  main.tsx, App.tsx          rotas: / (home), /checklist
  pages/Home.tsx             cards: Checklist (ativo), Plano de Içamento e Ferramentas ("em breve")
  pages/Checklist.tsx        formulário em etapas
  components/                campos reutilizáveis (sub-projetos 2 e 3 usam os mesmos)
    TextField, NumberField, Checkbox/CheckGroup, SimNaoNa, SignaturePad, StepNav
  lib/
    useDraft.ts              rascunho em localStorage (por formulário)
    ...
  checklist/
    schema.ts                tipos e valores iniciais do checklist
    items.ts                 lista de itens (texto, opções, campos extras) — dados, não JSX
    calc.ts                  relação peso/capacidade
    ChecklistPdf.tsx         documento PDF (react-pdf)
  assets/logo-ccr-engemob.png
```

Unidades isoladas: `items.ts` é só dados (editar o texto de um item não mexe em lógica); `calc.ts` é função pura e testável; `ChecklistPdf` só lê o objeto do formulário.

## Inventário de campos do Checklist (do Excel)

Cabeçalho: logo CCR EngeMob + título "PLANO PARA MOVIMENTAÇÃO DE CARGA".

**Dimensionamento da máquina e acessórios — Máquina**
- Modelo (texto)
- Raio de operação (m)
- Capacidade da máquina p/ o raio (m) *(rótulo literal do original; o site acrescenta um seletor Ton/Kg, padrão Ton, para o cálculo da relação)*
- Quadrante da operação: Frontal / Lateral (escolha única)
- Comprimento da lança (m)
- Comprimento do Jib (m)
- Relação Peso/Capacidade da máquina p/ o raio (calculada, editável)

**Lingada**
- Tipo: Cabo / Cinta (escolha única)
- Diâmetro (mm)
- Comprimento (m)
- Quantidade de pernas
- Capacidade por perna

**Acessórios**
- Manilhas (texto), quantidade, diâmetro (mm), capacidade p/ manilha (kg)
- Separadores de cabo: dimensões (mm), capacidade do cabo (kg)

**1. Equipe — verificações gerais** (cada item: S / N / NA)
1. Acessórios de movimentação de carga inspecionados e em boas condições? (capacidade de carga deve ser conhecida) — **+ marcar tipos:** Cintas, Cabos, Manilhas, Ganchos (com trava), Estropos
2. Material para sinalização e isolamento disponível?
3. Realizado check list do equipamento antes do início da atividade diária? (empresa terceira ou área dona da máquina)
4. Rádio comunicação disponível quando não há visualização entre sinaleiro e operador?

**2. Liberação do serviço e ambiente** (cada item: S / N / NA)
1. PT e APR de movimentação de carga disponível e conhecida pela equipe executante?
2. Plano de Rigging disponível? — **+ marcar motivos:** relação peso/capacidade > 75%; mais de uma máquina simultaneamente; içamento em cota negativa; carga ≥ 50 ton
3. Operador autorizado certificado?
4. Sinaleiro autorizado certificado?
5. Definida área para isolamento físico?
6. Solos de brita/grama sem compactação/galerias/caixas/envelopes elétricos/tampas/canaletas avaliados por especialista? — **+ Nome do especialista, Assinatura do especialista**
7. Movimentações sobre pontilhões, píeres e cristas de taludes: consultada área civil? — **+ Nome do especialista, Assinatura do especialista**
8. Indicação da Carga Máxima de Trabalho Permitida e Tabela de Cargas disponíveis?
9. Equipamentos de combate a incêndio, saídas de emergência e rotas de fuga desobstruídas?
10. Solicitada "Autorização de Interdição de Ruas", se necessário?
11. Condições meteorológicas favoráveis? — **+ marcar:** Boa visibilidade, Sem chuva/descarga atmosférica, Boa iluminação, Sem fortes rajadas de vento
12. Lança distante de linhas energizadas ou subestações conforme tabela do procedimento?
13. Peso da peça conhecido? — **+ Peso (valor) com unidade Ton / Kg**
14. Máquina de carga aterrada em local adequado?
15. Seccionamento, bloqueio e aterramento da rede aérea realizados antes do início?
16. Existem equipamentos, tubulações, instrumentos ou equipamentos de emergência que possam ser atingidos?

**4. Dados da liberação** *(a numeração do original pula o "3"; será mantida igual ao original)*
- Data e hora (data, hora, minuto)
- Número da PT
- Segurança do Trabalho: nome, matrícula, **assinatura**
- Operador: nome, matrícula, **assinatura**

Os textos exatos de cada item serão copiados literalmente do `.xlsx` para `items.ts` (os acentos aparecem corretos no arquivo; o texto acima é resumo).

## Comportamento

- **Formulário em etapas** (uma seção por tela no celular; no PC pode mostrar mais por tela): Máquina e acessórios → 1. Equipe → 2. Liberação → 4. Dados da liberação → Revisar e gerar PDF.
- **S/N/NA** são botões grandes de toque, uma escolha por item.
- **Relação Peso/Capacidade** = peso da peça (convertido para kg conforme a unidade) ÷ capacidade da máquina para o raio × 100. Preenche sozinho quando os dois valores existem; o usuário pode sobrescrever. Se passar de 75%, o item "Plano de Rigging" ganha um aviso sugerindo marcar o motivo (não marca sozinho).
- **Assinatura**: área de desenho com dedo/mouse, botão "limpar"; salva como imagem PNG e vai no PDF.
- **Rascunho automático** no navegador (localStorage), com botão "Limpar tudo / novo checklist".
- **Revisão**: lista itens sem resposta. Mostra aviso, mas **não bloqueia** o PDF (o papel original também pode ficar parcialmente em branco).
- **PDF**: A4 retrato, mesmo layout do Excel (logo, tabelas, checkboxes marcadas, S/N/NA com X, assinaturas como imagens). Baixa com nome `checklist-AAAA-MM-DD-<PT>.pdf`. Tenta caber em 1 página; se não couber, quebra em 2 sem cortar linhas.
- Visual: verde-água, no estilo do app de referência; botões grandes para uso com luva/sol.

## Erros e limites

- Campos numéricos aceitam vírgula decimal.
- Se o localStorage estiver indisponível, o site funciona sem rascunho (aviso discreto).
- Assinatura em branco = campo vazio no PDF (sem erro).

## Testes

- Vitest: `calc.ts` (relação, conversão Ton/Kg, arredondamento, divisão por zero/campo vazio), `items.ts` (nenhum item sem texto/opções; contagem 4 + 16 itens).
- Verificação manual no navegador (celular emulado e desktop): preencher todos os campos, gerar PDF e **comparar campo a campo com o inventário acima e com o Excel**.
- Critério de pronto: cada campo do inventário existe na tela **e** aparece no PDF.

## Fora do escopo deste sub-projeto

Plano Básico de Içamento (Anexo A), ferramentas do Guia RAC 5, login, histórico, exportar `.xlsx`, uso offline.

---

## Anexo A — Inventário do Plano Básico de Içamento de Carga (sub-projeto 2)

Título: "Plano Básico de Içamento de Carga (Guindastes)".

- Local; Atividade; Equipamento de guindar utilizado (tipo e TAG); Carga/Peça; Gerência; Data
- Como foi obtido o peso da carga? (texto livre)
- **Esquema de içamento**: área para desenho/esboço de como a carga será amarrada (canvas de desenho)
- **Lista dos acessórios utilizados**: tabela com linhas de Acessório/Dimensão, Capacidade, Quantidade (linhas adicionáveis)
- **Assinaturas**: Operador do Equipamento de Guindar e Responsável pela Amarração da Carga — cada um com Nome, Matrícula/CPF, Assinatura. Nota: se o operador também for o responsável pela amarração, assina nos dois campos (botão "mesma pessoa" copia nome/matrícula/assinatura)
- Texto fixo no PDF: nota sobre responsabilidade do executante e "Lembretes de medidas obrigatórias" (texto literal do original)

## Anexo B — Sub-projeto 3 (ferramentas do app de referência)

Precisarão dos dados que não temos: tabelas de capacidade (CMTE), cores de cintas, sinais, Disol, FU, CINSP, Mataco. O usuário fornecerá antes dessa etapa.

---

## Atualização (2026-10-21)

- **Máquina:** saíram Comprimento da lança, Comprimento do Jib e o campo Relação Peso/Capacidade. O aviso de 75% continua na pergunta 2 de Liberação, calculado pelo peso da peça e pela capacidade da máquina.
- **Equipe, pergunta 1:** cada tipo de acessório (Cintas, Cabos, Manilhas, Ganchos com trava, Estropos) tem seu nível **Bom / Regular / Ruim**.
- **Liberação:** a pergunta 2 ficou só com S/N/NA; as perguntas 6 e 7 perderam Nome do especialista e Assinatura. As assinaturas passam a ser 3: Segurança do Trabalho, Operador e Responsável pela Amarração.
- **Dados:** tela única com Responsável pela atividade, Projeto, Local, Atividade, Equipamento, Carga/Peça, Gerência, "Como foi obtido o peso da carga", Data/Hora, Nº da PT e as pessoas (Segurança do Trabalho, Operador, Responsável pela Amarração) com Nome, **Empresa** e Assinatura ("Matrícula" virou "Empresa"). O Plano de Içamento usa os mesmos dados. O PDF do checklist continua com o layout do Excel (cabeçalho com Responsável e Projeto; seção 4 com Empresa).
