import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // O Phaser sozinho tem cerca de 1,4 MB e só carrega ao abrir a Partida (import dinâmico).
    // O limite fica um pouco acima disso para o aviso voltar se algo crescer demais.
    chunkSizeWarningLimit: 1500,
    // A arte e o som (src/assets/) viram arquivos separados, mesmo os pequenos: são centenas de imagens, que não
    // devem pesar no código que abre o jogo, e o navegador guarda cada uma no cache
    assetsInlineLimit: (caminho) => (/[\\/]src[\\/]assets[\\/]/.test(caminho) ? false : undefined),
  },
})
