import { estiloPosicao } from './posicao.js'

// Área posicionada para textos e listas.
export default function Area({ em, className = '', children }) {
  return (
    <div className={`area posicionado ${className}`} style={estiloPosicao(em)}>
      {children}
    </div>
  )
}
