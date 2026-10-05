import { estiloPosicao } from './posicao.js'

// Com "em", o botão fica na posição dada; sem "em", segue o fluxo normal (como dentro das janelas).
// "selecionado" marca botões de ligar/desligar e de escolha.
export default function Botao({ em, onClick, desativado = false, selecionado, children }) {
  const classes = ['botao']
  if (em) classes.push('posicionado')
  if (em?.grande) classes.push('botao-grande')

  return (
    <button
      type="button"
      className={classes.join(' ')}
      style={em && estiloPosicao(em)}
      onClick={onClick}
      disabled={desativado}
      aria-pressed={selecionado}
    >
      {children}
    </button>
  )
}
