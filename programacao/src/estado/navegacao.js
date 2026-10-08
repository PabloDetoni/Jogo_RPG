import { telas } from '../dados/telas.js'
import { controleInicialDaPartida } from './controleDaPartida.js'

// Troca de tela e fecha as janelas abertas.
// Numa tela raiz, o caminho é esquecido. Numa tela que já está no caminho, o caminho é cortado até ela.
export function navegar(estado, destino) {
  let anteriores = []
  if (!telas[destino].raiz) {
    const caminho = [...estado.anteriores, estado.tela]
    const posicao = caminho.indexOf(destino)
    anteriores = posicao >= 0 ? caminho.slice(0, posicao) : caminho
  }

  // Sair da tela da Partida sem resultado (só acontece pelo painel de desenvolvimento)
  // descarta a partida, como numa interrupção (RF12).
  const naPartida = destino === 'partida'

  return {
    ...estado,
    tela: destino,
    anteriores,
    janelas: [],
    controleDaPartida: naPartida ? estado.controleDaPartida : controleInicialDaPartida(),
    partidaAtual: naPartida ? estado.partidaAtual : null,
  }
}
