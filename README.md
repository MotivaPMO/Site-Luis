# Movimentação de Carga (CCR EngeMob)

Checklist e Plano de Içamento, com geração de PDF. Vite + React + TypeScript.

## Versão em arquivo único (para enviar por e-mail)

Gera **um só arquivo HTML** com tudo dentro (JS, CSS, imagens e gerador de PDF), que funciona com duplo clique, sem servidor e sem outros arquivos.

```bash
npm install
npm run build:arquivo
```

O arquivo fica em `dist-arquivo/index.html` (cerca de 2 MB). Não é versionado no git; gere de novo quando o código mudar.

### Como enviar

Anexe **somente** `dist-arquivo/index.html` ao e-mail ou coloque-o numa pasta compartilhada. Quem receber salva o arquivo e dá duplo clique (abre no navegador). Não envie a pasta `dist` do `npm run build`: ela não funciona fora de um servidor (as páginas ficam sem estilo).

### Limites

- **Salvar o PDF numa pasta escolhida** só funciona no Chrome ou Edge, no computador. Nos demais casos (celular, Firefox, Safari) o PDF é apenas baixado para a pasta Downloads.
- **Rascunhos ficam no navegador de cada pessoa** (localStorage). Não passam de um computador/navegador para outro, e limpar os dados do navegador apaga os rascunhos. Para o mesmo arquivo, manter o mesmo caminho/endereço: se o arquivo for movido ou renomeado, alguns navegadores tratam como outro site e os rascunhos (e a pasta escolhida) não aparecem.
- Ao atualizar o site, envie o arquivo novo; ele substitui o anterior.

## Desenvolvimento

```bash
npm run dev          # servidor local
npm test             # testes
npm run build        # build normal (pasta dist, precisa de servidor)
npm run build:arquivo  # arquivo único (dist-arquivo/index.html)
```
