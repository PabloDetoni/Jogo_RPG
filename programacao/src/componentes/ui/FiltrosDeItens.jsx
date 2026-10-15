import { filtrosDeItens } from '../../dados/interface.js'
import { contarPorFiltro } from '../../regras/interface.js'

// Os botões de filtro por tipo (Fase 4.5), com quantos itens há em cada um; os sem nenhum item ficam apagados.
// Usados pela GradeDeItens (esconde os outros) e pela Mochila do Reino (apaga os outros, sem tirar do lugar).
export default function FiltrosDeItens({ itens, filtro, aoMudar }) {
  const contagem = contarPorFiltro(itens)
  return (
    <div className="filtros" role="group" aria-label="Filtrar por tipo">
      {filtrosDeItens.map((um) => (
        <button key={um.id} type="button" className="botao filtro" aria-pressed={um.id === filtro} disabled={um.id !== 'todos' && contagem[um.id] === 0} onClick={() => aoMudar(um.id)}>
          {um.nome} <span className="filtro-contagem">{contagem[um.id]}</span>
        </button>
      ))}
    </div>
  )
}
