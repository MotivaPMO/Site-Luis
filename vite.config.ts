import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode arquivo` gera um único HTML autocontido (dist-arquivo/index.html).
export default defineConfig(({ mode }) => {
  const arquivo = mode === 'arquivo'
  return {
    plugins: [react(), ...(arquivo ? [viteSingleFile()] : [])],
    build: arquivo ? { outDir: 'dist-arquivo' } : {},
    test: { environment: 'node' },
  }
})
