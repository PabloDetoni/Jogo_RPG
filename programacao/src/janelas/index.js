import ComoJogar from './ComoJogar.jsx'
import ConfirmarFuga from './ConfirmarFuga.jsx'
import Configuracoes from './Configuracoes.jsx'
import Pausa from './Pausa.jsx'

// Qual componente desenhar para cada janela aberta
export const componentesDasJanelas = {
  configuracoes: Configuracoes,
  pausa: Pausa,
  comoJogar: ComoJogar,
  confirmarFuga: ConfirmarFuga,
}
