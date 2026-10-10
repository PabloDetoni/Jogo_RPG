import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import ListaComDetalhe from '../../componentes/ListaComDetalhe.jsx'
import Tela from '../../componentes/Tela.jsx'
import { itemDoCatalogo } from '../../dados/itens.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { nomeDoItem } from '../../regras/reino.js'
import DetalheDoItem from './DetalheDoItem.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.mochila

// Ordem da lista: o que se usa primeiro, depois equipamento, materiais e recursos
const ordemDosTipos = ['consumivel', 'utilitario', 'equipamento', 'material', 'recurso']
const posicaoDoTipo = (id) => {
  const indice = ordemDosTipos.indexOf(itemDoCatalogo(id)?.tipo)
  return indice < 0 ? ordemDosTipos.length : indice
}

// Mochila do Reino (TASK-072, RF20, UC15): tudo o que o jogador tem, com quantidade; o detalhe mostra função,
// descrição e peso, e dá para descartar (com confirmação). A equipada fica nos personagens (Forja).
export default function Mochila() {
  const { acoes } = useJogo()
  return (
    <Tela>
      <Area em={pos.conteudo}>
        <ConteudoDaMochila />
      </Area>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}

export function ConteudoDaMochila() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const itens = [...progresso.mochila].sort((a, b) => posicaoDoTipo(a.id) - posicaoDoTipo(b.id) || nomeDoItem(a.id).localeCompare(nomeDoItem(b.id)))
  const [escolhido, setEscolhido] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // quantos descartar, esperando o "Sim"
  const atual = itens.find((item) => item.id === escolhido) ?? itens[0]
  const pesoTotal = itens.reduce((soma, item) => soma + (itemDoCatalogo(item.id)?.peso ?? 0) * item.quantidade, 0)

  function escolher(id) {
    setEscolhido(id)
    setConfirmando(null)
    setMensagem(null)
  }

  function descartar(quantidade) {
    fazer('descartar', atual.id, quantidade)
    setConfirmando(null)
  }

  return (
    <ListaComDetalhe
      rotulo="Itens da Mochila"
      topo={
        <span>
          {itens.length} {itens.length === 1 ? 'item' : 'itens'} · peso total {pesoTotal} (a Mochila do Reino não tem limite)
        </span>
      }
      itens={itens.map((item) => ({ chave: item.id, titulo: nomeDoItem(item.id), direita: `×${item.quantidade}` }))}
      escolhido={atual?.id}
      aoEscolher={escolher}
      vazio="A Mochila está vazia. Os itens coletados nas partidas e os comprados no Mercado aparecem aqui."
      mensagem={mensagem}
      detalhe={
        atual ? (
          <DetalheDoItem id={atual.id} quantidade={atual.quantidade}>
            {confirmando ? (
              <div className="confirmacao">
                <p>
                  Descartar {confirmando} {nomeDoItem(atual.id)}? Não dá para desfazer.
                </p>
                <div className="botoes-em-linha">
                  <Botao onClick={() => descartar(confirmando)}>Sim, descartar</Botao>
                  <Botao onClick={() => setConfirmando(null)}>Cancelar</Botao>
                </div>
              </div>
            ) : (
              <div className="botoes-em-linha">
                <Botao onClick={() => setConfirmando(1)}>Descartar 1</Botao>
                {atual.quantidade > 1 && <Botao onClick={() => setConfirmando(atual.quantidade)}>Descartar todos ({atual.quantidade})</Botao>}
              </div>
            )}
          </DetalheDoItem>
        ) : null
      }
    />
  )
}
