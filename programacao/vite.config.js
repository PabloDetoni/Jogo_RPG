import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { jogo } from './src/dados/jogo.js'

// https://vite.dev/config/
export default defineConfig({
  // o nome do jogo (src/dados/jogo.js) no título da aba e na tela de carregamento do index.html (Parte 13)
  plugins: [react(), { name: 'nome-do-jogo', transformIndexHtml: (html) => html.replaceAll('%NOME_DO_JOGO%', jogo.nome) }],
  build: {
    // O Phaser sozinho tem cerca de 1,4 MB e só carrega ao abrir a Partida (import dinâmico).
    // O limite fica um pouco acima disso para o aviso voltar se algo crescer demais.
    chunkSizeWarningLimit: 1500,
    // A arte e o som (src/assets/) viram arquivos separados, mesmo os pequenos: são centenas de imagens, que não
    // devem pesar no código que abre o jogo, e o navegador guarda cada uma no cache
    assetsInlineLimit: (caminho) => (/[\\/]src[\\/]assets[\\/]/.test(caminho) ? false : undefined),
  },
})
