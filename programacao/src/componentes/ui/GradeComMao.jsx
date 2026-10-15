import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { acoes, arteDaAcao, coresDasRaridades, ladoDoSlot, nomesDosTipos } from '../../dados/interface.js'
import { funcaoDoItem, itemDoCatalogo, nomesDasRaridades } from '../../dados/itens.js'
import Simbolo from './Simbolo.jsx'
import Slot from './Slot.jsx'

// Grade com o item na mão (ajustes da partida, 14/10), como o inventário do Minecraft: a mochila da partida (Tab) e a
// Mochila do Reino. O estado vem do useGradeComMao (quem usa guarda a arrumação); aqui o desenho e o mouse:
// - clique esquerdo pega a pilha ou põe/junta/troca; botão direito pega a metade ou põe 1;
// - o item na mão segue o mouse, e passar o mouse num item mostra o nome, a raridade e o que ele faz;
// - lixeira (opcional, a do Reino): clicar nela com item na mão chama aoJogarNaLixeira.
// apagado(id): o quadradinho fica apagado (o filtro do Reino destaca só os do tipo); dica(item): uma linha a mais na
// caixinha do mouse (na partida, as teclas E e R); aoClicar(slot): o quadradinho clicado (o Reino mostra o detalhe dele).
// O item na mão e a caixinha ficam numa camada na moldura do jogo (a caixa 16:9), por cima de tudo, sem pegar o clique.
export default function GradeComMao({ grade, tamanho = 'medio', colunas, rotulo, apagado, dica, lixeira, aoClicar }) {
  const { estado, sobre, setSobre } = grade
  const [moldura, setMoldura] = useState(null)
  const [ponto, setPonto] = useState(null)
  const guardarRaiz = useCallback((elemento) => setMoldura(elemento?.closest('.moldura') ?? null), [])

  // O mouse em relação à moldura (o item na mão e a caixinha andam com ele)
  useEffect(() => {
    if (!moldura) return undefined
    function aoMover(evento) {
      const caixa = moldura.getBoundingClientRect()
      setPonto({ x: evento.clientX - caixa.left, y: evento.clientY - caixa.top, largura: caixa.width, altura: caixa.height })
    }
    window.addEventListener('mousemove', aoMover)
    return () => window.removeEventListener('mousemove', aoMover)
  }, [moldura])

  const lado = ladoDoSlot[tamanho]
  const estilo = colunas ? { gridTemplateColumns: `repeat(${colunas}, ${lado}px)` } : undefined
  const naMao = estado.mao
  const emCima = sobre !== null ? estado.slots[sobre] : null

  function clique(evento, indice, botao) {
    evento.preventDefault()
    evento.stopPropagation()
    aoClicar?.(estado.slots[indice])
    if (botao === 'direito') grade.direito(indice)
    else grade.esquerdo(indice)
  }

  return (
    <div className="grade-com-mao" ref={guardarRaiz}>
      <div className={`grade grade-${tamanho} grade-com-mao-quadradinhos${colunas ? ' grade-com-colunas' : ''}`} style={estilo} role="group" aria-label={rotulo} onMouseLeave={() => setSobre(null)}>
        {estado.slots.map((slot, indice) => {
          const nome = slot ? (itemDoCatalogo(slot.id)?.nome ?? slot.id) : null
          return (
            <button
              key={indice}
              type="button"
              className="celula-da-grade"
              aria-label={slot ? `${nome}${slot.quantidade > 1 ? ` ×${slot.quantidade}` : ''}` : 'Quadradinho vazio'}
              onClick={(evento) => clique(evento, indice, 'esquerdo')}
              onContextMenu={(evento) => clique(evento, indice, 'direito')}
              onMouseEnter={() => setSobre(indice)}
              onFocus={() => setSobre(indice)}
              onBlur={() => setSobre(null)}
            >
              {slot ? (
                <Slot id={slot.id} quantidade={slot.quantidade} tamanho={tamanho} apagado={apagado?.(slot.id)} escolhido={indice === sobre} semDica />
              ) : (
                <span className={`slot slot-${tamanho} slot-vazio${indice === sobre ? ' slot-escolhido' : ''}`} style={{ '--lado-do-slot': `${lado}px` }} aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
      {lixeira && (
        <button
          type="button"
          className={`lixeira${naMao ? ' lixeira-ativa' : ''}`}
          onClick={(evento) => {
            evento.stopPropagation()
            if (naMao) lixeira.aoJogarNaLixeira(grade.soltar())
          }}
          aria-label={naMao ? `Jogar ${itemDoCatalogo(naMao.id)?.nome ?? naMao.id} na lixeira` : 'Lixeira (pegue um item com o clique e clique aqui)'}
        >
          <Simbolo simbolo={acoes.perder.simbolo} cor={acoes.perder.cor} arte={arteDaAcao('perder')} />
          <span>{naMao ? 'Soltar aqui para descartar' : 'Lixeira · clique: pega a pilha · botão direito: a metade'}</span>
        </button>
      )}
      {moldura &&
        ponto &&
        createPortal(
          <div className="camada-do-mouse" aria-hidden="true">
            {naMao && (
              <div className="item-na-mao" style={{ left: ponto.x, top: ponto.y }}>
                <Slot id={naMao.id} quantidade={naMao.quantidade} tamanho={tamanho} semDica />
              </div>
            )}
            {!naMao && emCima && <CaixinhaDoItem slot={emCima} ponto={ponto} dica={dica} />}
          </div>,
          moldura,
        )}
    </div>
  )
}

// O nome (na cor da raridade), a raridade e o tipo, o que o item faz e a dica de quem usa; perto do mouse, virando para
// o outro lado perto da borda da moldura
function CaixinhaDoItem({ slot, ponto, dica }) {
  const item = itemDoCatalogo(slot.id)
  const paraEsquerda = ponto.x > ponto.largura * 0.62
  const paraCima = ponto.y > ponto.altura * 0.7
  const estilo = {
    left: paraEsquerda ? undefined : ponto.x + 18,
    right: paraEsquerda ? ponto.largura - ponto.x + 12 : undefined,
    top: paraCima ? undefined : ponto.y + 18,
    bottom: paraCima ? ponto.altura - ponto.y + 12 : undefined,
    '--cor-da-raridade': coresDasRaridades[item?.raridade],
  }
  const extra = dica?.(slot, item)
  return (
    <div className="caixinha-do-item" style={estilo}>
      <strong className="caixinha-do-item-nome">{item?.nome ?? slot.id}</strong>
      {item && (
        <span className="caixinha-do-item-tipo">
          {nomesDasRaridades[item.raridade] ?? item.raridade} · {nomesDosTipos[item.tipo] ?? item.tipo} · peso {item.peso}
        </span>
      )}
      <span>{item ? funcaoDoItem(item) : 'Item fora do catálogo.'}</span>
      {extra && <span className="caixinha-do-item-dica">{extra}</span>}
    </div>
  )
}
