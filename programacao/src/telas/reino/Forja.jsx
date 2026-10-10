import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import ListaComDetalhe from '../../componentes/ListaComDetalhe.jsx'
import Tela from '../../componentes/Tela.jsx'
import { atributos as listaDeAtributos, nomeDaClasse } from '../../dados/classes.js'
import { aVendaNaForja, receitas } from '../../dados/forja.js'
import { itemDoCatalogo } from '../../dados/itens.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { atributosComEquipamento, bonusDoEquipamento, podeEquipar } from '../../regras/equipamento.js'
import { espacosDoPersonagem } from '../../regras/forja.js'
import { precoDeVenda } from '../../regras/mercado.js'
import { quantidadeNaMochila } from '../../regras/mochila.js'
import { nomeDoItem } from '../../regras/reino.js'
import DetalheDoItem from './DetalheDoItem.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.forja

// Forja (TASK-075, RF22, RF23, UC17, UC18): equipar os permanentes, comprar e vender equipamento e fabricar por
// receita. As regras ficam em regras/forja.js e regras/equipamento.js.
export default function Forja() {
  const { acoes } = useJogo()
  const abas = [
    { id: 'equipar', nome: 'Equipar', conteudo: <Equipar /> },
    { id: 'comprar', nome: 'Comprar', conteudo: <Comprar /> },
    { id: 'vender', nome: 'Vender', conteudo: <Vender /> },
    { id: 'fabricar', nome: 'Fabricar', conteudo: <Fabricar /> },
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

const comMensagemLimpa = (setEscolhido, setMensagem) => (chave) => {
  setEscolhido(chave)
  setMensagem(null)
}

// Atributos com o equipamento: "For 13 (+3)" e a defesa e a recarga das peças
function ResumoDoPersonagem({ personagem }) {
  const comEquipamento = atributosComEquipamento(personagem.atributos, personagem.equipamento)
  const { defesa, reducaoDeRecarga } = bonusDoEquipamento(personagem.equipamento)
  return (
    <span className="nota">
      {listaDeAtributos
        .map(({ id, sigla }) => {
          const extra = comEquipamento[id] - personagem.atributos[id]
          return `${sigla} ${comEquipamento[id]}${extra ? ` (+${extra})` : ''}`
        })
        .join(' · ')}
      {` · Defesa ${defesa}`}
      {reducaoDeRecarga ? ` · Recarga −${Math.round(reducaoDeRecarga * 100)}%` : ''}
    </span>
  )
}

function Equipar() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const [classe, setClasse] = useState(null)
  const [espacoEscolhido, setEspacoEscolhido] = useState(null)
  const personagem = progresso.personagens.find((um) => um.classe === classe) ?? progresso.personagens[0]
  if (!personagem) return <p>Nenhum personagem permanente ainda.</p>
  const espacos = espacosDoPersonagem(personagem)
  const espaco = espacos.find((um) => um.id === espacoEscolhido) ?? espacos[0]
  const naMochila = progresso.mochila.filter((item) => itemDoCatalogo(item.id)?.espaco === espaco.id)

  return (
    <ListaComDetalhe
      rotulo="Espaços de equipamento"
      topo={
        <>
          {progresso.personagens.map((um) => (
            <Botao
              key={um.classe}
              selecionado={um.classe === personagem.classe}
              onClick={() => {
                setClasse(um.classe)
                setMensagem(null)
              }}
            >
              {nomeDaClasse(um.classe)}
            </Botao>
          ))}
          <ResumoDoPersonagem personagem={personagem} />
        </>
      }
      itens={espacos.map((um) => ({ chave: um.id, titulo: um.nome, direita: um.item ? nomeDoItem(um.item) : '—', nota: !um.item }))}
      escolhido={espaco.id}
      aoEscolher={comMensagemLimpa(setEspacoEscolhido, setMensagem)}
      mensagem={mensagem}
      detalhe={
        <div className="detalhe-do-item">
          <h3>
            {espaco.nome} de {nomeDaClasse(personagem.classe)}
          </h3>
          {espaco.item ? (
            <DetalheDoItem id={espaco.item}>
              <div className="botoes-em-linha">
                <Botao onClick={() => fazer('desequipar', personagem.classe, espaco.id)}>Tirar (volta para a Mochila)</Botao>
              </div>
            </DetalheDoItem>
          ) : (
            <p className="nota">Nada equipado aqui.</p>
          )}
          <h3>Na Mochila para este espaço</h3>
          {naMochila.length === 0 && <p className="nota">Nenhum. Dá para comprar ou fabricar nas outras abas.</p>}
          <ul className="lista-de-contratos">
            {naMochila.map((item) => {
              const dado = itemDoCatalogo(item.id)
              const serve = podeEquipar(dado, personagem.classe).ok
              return (
                <li key={item.id}>
                  <span>
                    {dado.nome} ×{item.quantidade}
                    {!serve && <span className="nota"> (não serve para {nomeDaClasse(personagem.classe)})</span>}
                  </span>
                  <Botao onClick={() => fazer('equipar', personagem.classe, item.id)}>Equipar</Botao>
                </li>
              )
            })}
          </ul>
        </div>
      }
    />
  )
}

function Comprar() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const [escolhido, setEscolhido] = useState(null)
  const atual = aVendaNaForja.find((id) => id === escolhido) ?? aVendaNaForja[0]
  const preco = itemDoCatalogo(atual).preco

  return (
    <ListaComDetalhe
      rotulo="Equipamento à venda"
      topo={
        <span>
          Ouro: <strong>{progresso.ouro}</strong> <span className="nota">· o equipamento melhor sai das receitas (aba Fabricar)</span>
        </span>
      }
      itens={aVendaNaForja.map((id) => ({ chave: id, titulo: nomeDoItem(id), direita: `${itemDoCatalogo(id).preco} de ouro` }))}
      escolhido={atual}
      aoEscolher={comMensagemLimpa(setEscolhido, setMensagem)}
      mensagem={mensagem}
      detalhe={
        <DetalheDoItem id={atual}>
          <p className="nota">Você tem {quantidadeNaMochila(progresso.mochila, atual)} na Mochila.</p>
          <div className="botoes-em-linha">
            <Botao onClick={() => fazer('comprarNaForja', atual)}>Comprar ({preco})</Botao>
          </div>
        </DetalheDoItem>
      }
    />
  )
}

function Vender() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const equipamentos = progresso.mochila.filter((item) => itemDoCatalogo(item.id)?.tipo === 'equipamento')
  const [escolhido, setEscolhido] = useState(null)
  const atual = equipamentos.find((item) => item.id === escolhido) ?? equipamentos[0]

  return (
    <ListaComDetalhe
      rotulo="Equipamento para vender"
      topo={
        <span>
          Ouro: <strong>{progresso.ouro}</strong> <span className="nota">· a Forja paga metade do preço; o equipado precisa ser tirado antes</span>
        </span>
      }
      itens={equipamentos.map((item) => ({ chave: item.id, titulo: `${nomeDoItem(item.id)} ×${item.quantidade}`, direita: `${precoDeVenda(item.id)} cada` }))}
      escolhido={atual?.id}
      aoEscolher={comMensagemLimpa(setEscolhido, setMensagem)}
      vazio="Nenhum equipamento na Mochila."
      mensagem={mensagem}
      detalhe={
        atual && (
          <DetalheDoItem id={atual.id} quantidade={atual.quantidade}>
            <div className="botoes-em-linha">
              <Botao onClick={() => fazer('venderNaForja', atual.id, 1)}>Vender 1 ({precoDeVenda(atual.id)})</Botao>
            </div>
          </DetalheDoItem>
        )
      }
    />
  )
}

function Fabricar() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const [escolhido, setEscolhido] = useState(null)
  const atual = receitas.find((receita) => receita.resultado === escolhido) ?? receitas[0]
  const temTudo = (receita) =>
    Object.entries(receita.materiais).every(([id, quantidade]) => quantidadeNaMochila(progresso.mochila, id) >= quantidade) && progresso.ouro >= receita.ouro

  return (
    <ListaComDetalhe
      rotulo="Receitas da Forja"
      topo={
        <span>
          Ouro: <strong>{progresso.ouro}</strong> <span className="nota">· em cinza, as receitas que ainda não dá para fazer</span>
        </span>
      }
      itens={receitas.map((receita) => ({ chave: receita.resultado, titulo: nomeDoItem(receita.resultado), direita: `${receita.ouro} de ouro`, nota: !temTudo(receita) }))}
      escolhido={atual.resultado}
      aoEscolher={comMensagemLimpa(setEscolhido, setMensagem)}
      mensagem={mensagem}
      detalhe={
        <DetalheDoItem id={atual.resultado}>
          <h3>Materiais</h3>
          <ul className="lista-simples">
            {Object.entries(atual.materiais).map(([id, quantidade]) => {
              const tem = quantidadeNaMochila(progresso.mochila, id)
              return (
                <li key={id} className={tem >= quantidade ? '' : 'falta'}>
                  {quantidade} {nomeDoItem(id)} (tem {tem})
                </li>
              )
            })}
            <li className={progresso.ouro >= atual.ouro ? '' : 'falta'}>{atual.ouro} de ouro</li>
          </ul>
          <div className="botoes-em-linha">
            <Botao onClick={() => fazer('fabricar', atual.resultado)}>Fabricar</Botao>
          </div>
        </DetalheDoItem>
      }
    />
  )
}
