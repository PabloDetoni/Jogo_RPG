import ComoJogar from './ComoJogar.jsx'
import ConfirmarFuga from './ConfirmarFuga.jsx'
import Configuracoes from './Configuracoes.jsx'
import Pausa from './Pausa.jsx'

// A mochila da partida (Tab, Fase 4) é desenhada pela própria Partida, que tem a ponte com o jogo; aqui ela só existe para o
// Esc fechá-la como as outras janelas (antes de pausar)
const desenhadaPelaPartida = () => null

// Qual componente desenhar para cada janela aberta
export const componentesDasJanelas = {
  configuracoes: Configuracoes,
  pausa: Pausa,
  comoJogar: ComoJogar,
  confirmarFuga: ConfirmarFuga,
  mochilaDaPartida: desenhadaPelaPartida,
}
