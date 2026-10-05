import { estiloPosicao } from './posicao.js'

// Barra de abas. A barra inteira tem uma posição só.
export default function Abas({ em, abas, ativa, aoEscolher }) {
  return (
    <div className="abas posicionado" style={estiloPosicao(em)} role="tablist">
      {abas.map((aba) => (
        <button
          key={aba.id}
          type="button"
          role="tab"
          className="botao"
          aria-selected={aba.id === ativa}
          disabled={aba.desativada}
          onClick={() => aoEscolher(aba.id)}
        >
          {aba.nome}
        </button>
      ))}
    </div>
  )
}
