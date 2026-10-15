import { urlDaArte } from '../../arte/indice.js'
import { iconeDoItem } from '../../dados/arte.js'
import { coresDasRaridades, formasDosTipos, ladoDoIconeNoSlot, ladoDoSlot } from '../../dados/interface.js'
import { itemDoCatalogo } from '../../dados/itens.js'
import { corCss } from '../../regras/interface.js'

// Um quadradinho de item (Fase 4.5): o ícone (src/assets/arte/item-<id>.png, em tamanho inteiro) ou, até ele chegar,
// uma forma simples pelo tipo com a inicial, na cor do item; a quantidade no canto e a borda na cor da raridade.
// rotulo: uma faixa embaixo (o preço). apagado: não dá para usar agora. silhueta: item ainda não encontrado (Catálogo).
// Com onClick vira botão (escolher); o nome do item fica no aria-label e na dica do mouse. semDica: sem a dica do
// navegador (a grade com o item na mão mostra a dela).
export default function Slot({ id, quantidade, escolhido = false, apagado = false, silhueta = false, rotulo, onClick, tamanho = 'grande', titulo, semDica = false }) {
  const item = itemDoCatalogo(id)
  const nome = item?.nome ?? id
  const icone = silhueta ? null : urlDaArte(iconeDoItem(id))
  const lado = ladoDoIconeNoSlot[tamanho]
  const descricao = titulo ?? (silhueta ? 'Item ainda não encontrado' : `${nome}${quantidade > 1 ? ` ×${quantidade}` : ''}`)
  const classes = ['slot', `slot-${tamanho}`, apagado && 'slot-apagado', silhueta && 'slot-silhueta', escolhido && 'slot-escolhido'].filter(Boolean).join(' ')
  const estilo = { '--cor-da-raridade': silhueta ? undefined : coresDasRaridades[item?.raridade], '--lado-do-slot': `${ladoDoSlot[tamanho]}px` }
  const forma = silhueta ? 'silhueta' : (formasDosTipos[item?.tipo] ?? 'quadrado')
  const conteudo = (
    <>
      {icone ? (
        <img className="slot-icone" src={icone} alt="" draggable={false} style={{ width: lado, height: lado }} />
      ) : (
        <span className={`slot-forma slot-forma-${forma}`} style={{ '--cor-do-item': silhueta ? undefined : corCss(item?.cor) }} aria-hidden="true">
          <span className="slot-inicial">{silhueta ? '?' : nome.charAt(0)}</span>
        </span>
      )}
      {quantidade > 1 && (
        <span className="slot-quantidade" aria-hidden="true">
          {quantidade}
        </span>
      )}
      {rotulo !== undefined && (
        <span className="slot-rotulo" aria-hidden="true">
          {rotulo}
        </span>
      )}
    </>
  )
  if (!onClick) {
    return (
      <span className={classes} style={estilo} title={semDica ? undefined : descricao} role="img" aria-label={descricao}>
        {conteudo}
      </span>
    )
  }
  return (
    <button type="button" className={classes} style={estilo} title={descricao} aria-label={descricao} aria-pressed={escolhido} onClick={onClick}>
      {conteudo}
    </button>
  )
}
