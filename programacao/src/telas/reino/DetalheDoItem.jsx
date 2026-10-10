import { funcaoDoItem, itemDoCatalogo, nomesDasRaridades } from '../../dados/itens.js'

// Função, descrição, peso e raridade de um item (RF20), para a Mochila, o Mercado e a Forja.
// "children" fica embaixo (os botões de cada tela). Item fora do catálogo (save antigo) aparece pelo id.
export default function DetalheDoItem({ id, quantidade, children }) {
  const item = itemDoCatalogo(id)
  if (!item) {
    return (
      <div className="detalhe-do-item">
        <h3>{id}</h3>
        <p className="nota">Este item não existe mais no catálogo. Dá para descartar.</p>
        {children}
      </div>
    )
  }
  return (
    <div className="detalhe-do-item">
      <h3>
        {item.nome}
        {quantidade !== undefined && <span className="nota"> ×{quantidade}</span>}
      </h3>
      <p className="detalhe-do-item-funcao">{funcaoDoItem(item)}</p>
      <p className="nota">{item.descricao}</p>
      <p className="nota">
        Peso {item.peso} · {nomesDasRaridades[item.raridade]}
      </p>
      {children}
    </div>
  )
}
