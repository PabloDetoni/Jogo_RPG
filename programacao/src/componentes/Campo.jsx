import { estiloPosicao } from './posicao.js'

// Campo de texto posicionado. Por enquanto nada é validado nem guardado.
export default function Campo({ em, rotulo, tipo = 'text' }) {
  return (
    <label className="campo posicionado" style={estiloPosicao(em)}>
      <span>{rotulo}</span>
      <input type={tipo} />
    </label>
  )
}
