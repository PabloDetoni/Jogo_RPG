import Selo from '../../componentes/ui/Selo.jsx'
import Slot from '../../componentes/ui/Slot.jsx'
import { nomeDaClasse } from '../../dados/classes.js'
import { coresDasRaridades, nomesDosTipos } from '../../dados/interface.js'
import { funcaoDoItem, itemDoCatalogo, nomesDasRaridades } from '../../dados/itens.js'

// O detalhe de um item (RF20; Fase 4.5): o quadradinho grande, o nome, os selos (raridade, tipo e, no equipamento, para
// quem serve), a função, a descrição, o peso e o valor. "children" fica embaixo (os botões de cada tela).
// silhueta: item ainda não encontrado (Catálogo). compacto: só o nome, os selos e a função (a comparação da Forja).
// Item fora do catálogo (save antigo) aparece pelo id.
export default function DetalheDoItem({ id, quantidade, silhueta = false, compacto = false, children }) {
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
  if (silhueta) {
    return (
      <div className="detalhe-do-item">
        <div className="detalhe-do-item-cabeca">
          <Slot id={id} silhueta />
          <h3>???</h3>
        </div>
        <p className="nota">Você ainda não encontrou este item.</p>
        {children}
      </div>
    )
  }
  const paraQuem = item.tipo === 'equipamento' ? (item.classes === 'todas' ? 'todas as classes' : `só ${item.classes.map(nomeDaClasse).join(', ')}`) : null
  return (
    <div className="detalhe-do-item">
      <div className="detalhe-do-item-cabeca">
        <Slot id={id} quantidade={quantidade} />
        <div className="detalhe-do-item-nome">
          <h3>
            {item.nome}
            {quantidade !== undefined && <span className="nota"> ×{quantidade}</span>}
          </h3>
          <div className="selos">
            <Selo cor={coresDasRaridades[item.raridade]}>{nomesDasRaridades[item.raridade]}</Selo>
            <Selo>{nomesDosTipos[item.tipo] ?? item.tipo}</Selo>
            {paraQuem && <Selo cor={item.classes === 'todas' ? 'var(--boa)' : 'var(--destaque)'}>{paraQuem}</Selo>}
          </div>
        </div>
      </div>
      <p className="detalhe-do-item-funcao">{funcaoDoItem(item)}</p>
      {!compacto && (
        <>
          <p className="nota">{item.descricao}</p>
          <p className="nota">
            Peso {item.peso} · vale {item.preco} de ouro
          </p>
        </>
      )}
      {children}
    </div>
  )
}
