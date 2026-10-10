import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import ListaComDetalhe from '../../componentes/ListaComDetalhe.jsx'
import Tela from '../../componentes/Tela.jsx'
import { itemDoCatalogo } from '../../dados/itens.js'
import { trocas } from '../../dados/mercado.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { ofertasDoMomento, precoDeVenda, situacaoDaTroca } from '../../regras/mercado.js'
import { quantidadeNaMochila } from '../../regras/mochila.js'
import { listarItens, nomeDoItem } from '../../regras/reino.js'
import DetalheDoItem from './DetalheDoItem.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.mercado

// Mercado (TASK-074, RF21, UC16): comprar (ofertas fixas e rotativas), vender (tudo menos equipamento, que é na Forja)
// e trocar item por item. As regras ficam em regras/mercado.js; a mensagem embaixo diz o que aconteceu ou o motivo.
export default function Mercado() {
  const { acoes } = useJogo()
  const abas = [
    { id: 'comprar', nome: 'Comprar', conteudo: <Comprar /> },
    { id: 'vender', nome: 'Vender', conteudo: <Vender /> },
    { id: 'trocar', nome: 'Trocar', conteudo: <Trocar /> },
  ]

  return (
    <Tela>
      <ConteudoComAbas pos={pos} abas={abas} />
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}

function Ouro({ progresso }) {
  return (
    <span>
      Ouro: <strong>{progresso.ouro}</strong>
    </span>
  )
}

function Comprar() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const { fixas, rotativas, partidasParaMudar } = ofertasDoMomento(progresso.estatisticas.partidasJogadas)
  const ofertas = [...fixas.map((id) => ({ id, rotativa: false })), ...rotativas.map((id) => ({ id, rotativa: true }))]
  const [escolhido, setEscolhido] = useState(null)
  const atual = ofertas.find((oferta) => oferta.id === escolhido) ?? ofertas[0]
  const preco = atual ? itemDoCatalogo(atual.id).preco : 0

  return (
    <ListaComDetalhe
      rotulo="Ofertas do Mercado"
      topo={
        <>
          <Ouro progresso={progresso} />
          <span className="nota">
            As ofertas ★ mudam em {partidasParaMudar} {partidasParaMudar === 1 ? 'partida' : 'partidas'}.
          </span>
        </>
      }
      itens={ofertas.map((oferta) => ({
        chave: oferta.id,
        titulo: `${nomeDoItem(oferta.id)}${oferta.rotativa ? ' ★' : ''}`,
        direita: `${itemDoCatalogo(oferta.id).preco} de ouro`,
      }))}
      escolhido={atual?.id}
      aoEscolher={(id) => {
        setEscolhido(id)
        setMensagem(null)
      }}
      mensagem={mensagem}
      detalhe={
        atual && (
          <DetalheDoItem id={atual.id}>
            <p className="nota">
              {atual.rotativa ? '★ Oferta que muda com as partidas. ' : ''}Você tem {quantidadeNaMochila(progresso.mochila, atual.id)} na Mochila.
            </p>
            <div className="botoes-em-linha">
              <Botao onClick={() => fazer('comprarNoMercado', atual.id, 1)}>Comprar 1 ({preco})</Botao>
              <Botao onClick={() => fazer('comprarNoMercado', atual.id, 5)}>Comprar 5 ({preco * 5})</Botao>
            </div>
          </DetalheDoItem>
        )
      }
    />
  )
}

function Vender() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const vendaveis = progresso.mochila.filter((item) => itemDoCatalogo(item.id) && itemDoCatalogo(item.id).tipo !== 'equipamento')
  const [escolhido, setEscolhido] = useState(null)
  const atual = vendaveis.find((item) => item.id === escolhido) ?? vendaveis[0]

  return (
    <ListaComDetalhe
      rotulo="Itens para vender"
      topo={
        <>
          <Ouro progresso={progresso} />
          <span className="nota">O Mercado paga metade do preço. Equipamento se vende na Forja.</span>
        </>
      }
      itens={vendaveis.map((item) => ({ chave: item.id, titulo: `${nomeDoItem(item.id)} ×${item.quantidade}`, direita: `${precoDeVenda(item.id)} cada` }))}
      escolhido={atual?.id}
      aoEscolher={(id) => {
        setEscolhido(id)
        setMensagem(null)
      }}
      vazio="Nada para vender: os itens coletados nas partidas aparecem aqui."
      mensagem={mensagem}
      detalhe={
        atual && (
          <DetalheDoItem id={atual.id} quantidade={atual.quantidade}>
            <div className="botoes-em-linha">
              <Botao onClick={() => fazer('venderNoMercado', atual.id, 1)}>Vender 1 ({precoDeVenda(atual.id)})</Botao>
              {atual.quantidade > 1 && (
                <Botao onClick={() => fazer('venderNoMercado', atual.id, atual.quantidade)}>
                  Vender todos ({precoDeVenda(atual.id) * atual.quantidade})
                </Botao>
              )}
            </div>
          </DetalheDoItem>
        )
      }
    />
  )
}

function Trocar() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const [escolhido, setEscolhido] = useState(null)
  const atual = trocas.find((troca) => troca.id === escolhido) ?? trocas[0]
  const situacao = atual ? situacaoDaTroca(progresso, atual) : []
  const temTudo = situacao.every((item) => item.tem >= item.quantidade)

  return (
    <ListaComDetalhe
      rotulo="Trocas do Mercado"
      topo={<span className="nota">Troca item por item, sem ouro.</span>}
      itens={trocas.map((troca) => ({
        chave: troca.id,
        titulo: `${listarItens(troca.dar)} → ${listarItens(troca.receber)}`,
        nota: !situacaoDaTroca(progresso, troca).every((item) => item.tem >= item.quantidade),
      }))}
      escolhido={atual?.id}
      aoEscolher={(id) => {
        setEscolhido(id)
        setMensagem(null)
      }}
      mensagem={mensagem}
      detalhe={
        atual && (
          <div className="detalhe-do-item">
            <h3>Você dá</h3>
            <ul className="lista-simples">
              {situacao.map((item) => (
                <li key={item.id} className={item.tem >= item.quantidade ? '' : 'falta'}>
                  {item.quantidade} {nomeDoItem(item.id)} (tem {item.tem})
                </li>
              ))}
            </ul>
            <h3>Você recebe</h3>
            <p>{listarItens(atual.receber)}</p>
            <div className="botoes-em-linha">
              <Botao onClick={() => fazer('trocarNoMercado', atual.id)}>{temTudo ? 'Trocar' : 'Trocar (faltam itens)'}</Botao>
            </div>
          </div>
        )
      }
    />
  )
}
