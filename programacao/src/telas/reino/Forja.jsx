import { useState } from 'react'
import { urlDaArte } from '../../arte/indice.js'
import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import GradeDeItens from '../../componentes/ui/GradeDeItens.jsx'
import Mudanca from '../../componentes/ui/Mudanca.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Simbolo from '../../componentes/ui/Simbolo.jsx'
import Slot from '../../componentes/ui/Slot.jsx'
import { atributos as listaDeAtributos, corDaClasseCss, nomeDaClasse } from '../../dados/classes.js'
import { aVendaNaForja, receitas } from '../../dados/forja.js'
import { acoes as acoesDaInterface, arteDaInterface, espacosEmVoltaDoBoneco } from '../../dados/interface.js'
import { itemDoCatalogo } from '../../dados/itens.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { atributosComEquipamento, bonusDoEquipamento, podeEquipar } from '../../regras/equipamento.js'
import { espacosDoPersonagem } from '../../regras/forja.js'
import { comparacaoDeEquipamento, ordenarItens } from '../../regras/interface.js'
import { quantidadeNaMochila } from '../../regras/mochila.js'
import { nomeDoItem } from '../../regras/reino.js'
import { Catalogo, ComprarNoBalcao, OuroAVista, VenderNoBalcao } from './Balcao.jsx'
import DetalheDoItem from './DetalheDoItem.jsx'
import { MensagemDoReino } from './MensagemDoReino.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.forja

// Forja (TASK-075, RF22, RF23, UC17, UC18; Fase 4.5): Equipar (o boneco com os 7 espaços em volta e a comparação antes de
// equipar), Comprar e Vender equipamento, Fabricar por receita (desenhada) e o Catálogo. As regras ficam em
// regras/forja.js e regras/equipamento.js.
export default function Forja() {
  const { acoes } = useJogo()
  const abas = [
    { id: 'equipar', nome: 'Equipar', conteudo: <Equipar /> },
    { id: 'comprar', nome: 'Comprar', conteudo: <Comprar /> },
    { id: 'vender', nome: 'Vender', conteudo: <Vender /> },
    { id: 'fabricar', nome: 'Fabricar', conteudo: <Fabricar /> },
    { id: 'catalogo', nome: 'Catálogo', conteudo: <Catalogo /> },
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

// O boneco do personagem com os 7 espaços em volta (capacete em cima; arma, peitoral e calças à esquerda; escudo,
// manoplas e botas à direita). Cada espaço mostra a peça equipada ou fica vazio, com o nome embaixo.
function Boneco({ personagem, espacoEscolhido, aoEscolher }) {
  const silhueta = urlDaArte(arteDaInterface.silhueta.nome)
  return (
    <div className="boneco-da-forja">
      <div className="boneco-silhueta" style={{ '--cor-da-classe': corDaClasseCss(personagem.classe) }} aria-hidden="true">
        {silhueta ? (
          <img src={silhueta} alt="" draggable={false} />
        ) : (
          <>
            <span className="boneco-cabeca" />
            <span className="boneco-corpo" />
          </>
        )}
      </div>
      {espacosDoPersonagem(personagem).map((espaco) => {
        const lugar = espacosEmVoltaDoBoneco[espaco.id]
        const descricao = `${espaco.nome}: ${espaco.item ? nomeDoItem(espaco.item) : 'vazio'}`
        return (
          <button
            key={espaco.id}
            type="button"
            className={`espaco-do-boneco${espaco.id === espacoEscolhido ? ' espaco-escolhido' : ''}`}
            style={{ gridColumn: lugar.coluna, gridRow: lugar.linha }}
            aria-pressed={espaco.id === espacoEscolhido}
            aria-label={descricao}
            title={descricao}
            onClick={() => aoEscolher(espaco.id)}
          >
            {espaco.item ? <Slot id={espaco.item} tamanho="medio" /> : <span className="espaco-vazio">vazio</span>}
            <span className="espaco-nome">{espaco.nome}</span>
          </button>
        )
      })}
    </div>
  )
}

// Os atributos com o equipamento de agora: "For 13 (+3)", a defesa e a recarga das peças
function ResumoDoPersonagem({ personagem }) {
  const comEquipamento = atributosComEquipamento(personagem.atributos, personagem.equipamento)
  const { defesa, reducaoDeRecarga } = bonusDoEquipamento(personagem.equipamento)
  return (
    <span className="nota">
      Com o equipamento:{' '}
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
  const [espacoEscolhido, setEspacoEscolhido] = useState('arma')
  const [itemEscolhido, setItemEscolhido] = useState(null)
  const personagem = progresso.personagens.find((um) => um.classe === classe) ?? progresso.personagens[0]
  if (!personagem) return <p className="vazio">Nenhum personagem permanente ainda: contrate um na Guilda.</p>
  const espacos = espacosDoPersonagem(personagem)
  const espaco = espacos.find((um) => um.id === espacoEscolhido) ?? espacos[0]
  const queServem = ordenarItens(progresso.mochila.filter((item) => itemDoCatalogo(item.id)?.espaco === espaco.id))
  const escolhido = queServem.find((item) => item.id === itemEscolhido) ?? null
  const comparacao = escolhido ? comparacaoDeEquipamento(personagem, espaco.id, escolhido.id) : espaco.item ? comparacaoDeEquipamento(personagem, espaco.id, null) : null
  const limpar = () => {
    setItemEscolhido(null)
    setMensagem(null)
  }

  return (
    <div className="balcao-com-mensagem">
      <div className="botoes-em-linha forja-personagens" role="group" aria-label="Personagem">
        {progresso.personagens.map((um) => (
          <Botao
            key={um.classe}
            selecionado={um.classe === personagem.classe}
            onClick={() => {
              setClasse(um.classe)
              limpar()
            }}
          >
            {nomeDaClasse(um.classe)}
          </Botao>
        ))}
        <ResumoDoPersonagem personagem={personagem} />
      </div>
      <div className="forja-equipar">
        <Painel titulo={nomeDaClasse(personagem.classe)} className="forja-boneco">
          <Boneco
            personagem={personagem}
            espacoEscolhido={espaco.id}
            aoEscolher={(id) => {
              setEspacoEscolhido(id)
              limpar()
            }}
          />
        </Painel>
        <Painel titulo={`Para o espaço ${espaco.nome}`} className="balcao-grade">
          <p className="nota">{espaco.armadura ? 'Armadura: serve para todas as classes.' : `${espaco.nome}: só da própria classe (as de outra classe ficam apagadas).`}</p>
          <GradeDeItens
            comFiltros={false}
            rotulo={`Itens para ${espaco.nome}`}
            itens={queServem.map((item) => {
              const serve = podeEquipar(itemDoCatalogo(item.id), personagem.classe)
              return { id: item.id, quantidade: item.quantidade, apagado: !serve.ok, titulo: `${nomeDoItem(item.id)}${serve.ok ? '' : ` (${serve.motivo})`}` }
            })}
            escolhido={escolhido?.id}
            aoEscolher={(id) => {
              setItemEscolhido(id)
              setMensagem(null)
            }}
            vazio={`Nada na Mochila para ${espaco.nome}. Compre ou fabrique nas outras abas.`}
          />
        </Painel>
        <Painel titulo="Antes e depois" className="balcao-detalhe">
          {escolhido ? (
            <>
              <DetalheDoItem id={escolhido.id} quantidade={escolhido.quantidade} compacto />
              <Comparacao comparacao={comparacao} />
              {comparacao.substitui && <p className="nota">{nomeDoItem(comparacao.substitui)} volta para a Mochila.</p>}
              <BotaoDeAcao
                acao="equipar"
                desativado={!comparacao.serve.ok}
                motivo={comparacao.serve.motivo}
                onClick={() => {
                  if (fazer('equipar', personagem.classe, escolhido.id)) setItemEscolhido(null)
                }}
              >
                Equipar {nomeDoItem(escolhido.id)}
              </BotaoDeAcao>
            </>
          ) : espaco.item ? (
            <>
              <p>
                Equipado: <strong>{nomeDoItem(espaco.item)}</strong>
              </p>
              <Comparacao comparacao={comparacao} />
              <BotaoDeAcao acao="tirar" onClick={() => fazer('desequipar', personagem.classe, espaco.id)}>
                Tirar {nomeDoItem(espaco.item)}
              </BotaoDeAcao>
              <p className="nota">A peça volta para a Mochila. Ou escolha outra na grade para trocar.</p>
            </>
          ) : (
            <p className="vazio">Escolha uma peça na grade para ver como ficam os atributos antes de equipar.</p>
          )}
        </Painel>
      </div>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}

// Os atributos, a defesa e a recarga antes e depois (verde sobe, vermelho desce); o que não muda fica apagado
function Comparacao({ comparacao }) {
  return (
    <ul className="lista-de-mudancas comparacao">
      {comparacao.linhas.map((linha) => (
        <li key={linha.id} className={linha.antes === linha.depois ? 'sem-mudanca' : ''}>
          <Mudanca nome={linha.nome} antes={linha.antes} depois={linha.depois} />
        </li>
      ))}
    </ul>
  )
}

function Comprar() {
  return (
    <ComprarNoBalcao
      titulo="Equipamento à venda"
      ofertas={aVendaNaForja.map((id) => ({ id, rotativa: false }))}
      operacao={(id) => ['comprarNaForja', id]}
      legenda="O preço fica embaixo de cada peça. O equipamento melhor (incomum e raro) sai das receitas: aba Fabricar."
    />
  )
}

function Vender() {
  const { progresso } = useNoReino()
  const equipamentos = progresso.mochila.filter((item) => itemDoCatalogo(item.id)?.tipo === 'equipamento')
  return (
    <VenderNoBalcao
      titulo="Equipamento na Mochila"
      itens={equipamentos}
      operacao={(id, quantidade) => ['venderNaForja', id, quantidade]}
      nota="A Forja paga metade do preço. O que está equipado precisa ser tirado antes (aba Equipar)."
      vazio="Nenhum equipamento na Mochila. O que está equipado precisa ser tirado antes, na aba Equipar."
    />
  )
}

// Fabricar: as receitas em grade (apagadas as que ainda não dá) e a escolhida desenhada: os materiais com
// "tem/precisa", o ouro, uma seta e o resultado. O botão só acende com tudo; apagado, diz o que falta.
function Fabricar() {
  const { progresso, mensagem, setMensagem, fazer, previa } = useNoReino()
  const [escolhido, setEscolhido] = useState(null)
  const atual = receitas.find((receita) => receita.resultado === escolhido) ?? receitas[0]
  const pode = previa('fabricar', atual.resultado)
  const { cor } = acoesDaInterface.fabricar

  return (
    <div className="balcao-com-mensagem">
      <div className="balcao">
        <Painel titulo="Receitas" className="balcao-grade">
          <div className="balcao-topo">
            <OuroAVista ouro={progresso.ouro} />
            <span className="nota">O ouro da receita embaixo. Apagadas: falta material ou ouro.</span>
          </div>
          <GradeDeItens
            comFiltros={false}
            rotulo="Receitas da Forja"
            itens={receitas.map((receita) => ({
              id: receita.resultado,
              rotulo: `${receita.ouro}`,
              apagado: !previa('fabricar', receita.resultado).ok,
              titulo: `${nomeDoItem(receita.resultado)}: ${receita.ouro} de ouro e materiais`,
            }))}
            escolhido={atual.resultado}
            aoEscolher={(id) => {
              setEscolhido(id)
              setMensagem(null)
            }}
          />
        </Painel>
        <Painel titulo="Receita" className="balcao-detalhe">
          <div className="receita" role="group" aria-label={`Receita de ${nomeDoItem(atual.resultado)}`}>
            <div className="receita-materiais">
              {Object.entries(atual.materiais).map(([id, quantidade]) => {
                const tem = quantidadeNaMochila(progresso.mochila, id)
                return (
                  <span key={id} className={`troca-item${tem >= quantidade ? '' : ' troca-item-falta'}`}>
                    <Slot id={id} quantidade={quantidade} tamanho="pequeno" />
                    <span className="troca-conta">tem {tem}</span>
                  </span>
                )
              })}
              <span className={`troca-item${progresso.ouro >= atual.ouro ? '' : ' troca-item-falta'}`}>
                <span className="ouro-da-receita">{atual.ouro}</span>
                <span className="troca-conta">de ouro</span>
              </span>
            </div>
            <Simbolo simbolo="→" cor={cor} grande />
            <Slot id={atual.resultado} />
          </div>
          <p className="nota">O número no canto é quanto a receita pede; embaixo, quanto você tem (em vermelho, o que falta).</p>
          {pode.ok && <Mudanca nome="Seu ouro:" antes={progresso.ouro} depois={progresso.ouro - atual.ouro} />}
          <BotaoDeAcao acao="fabricar" desativado={!pode.ok} motivo={pode.motivo} onClick={() => fazer('fabricar', atual.resultado)}>
            Fabricar {nomeDoItem(atual.resultado)}
          </BotaoDeAcao>
          <DetalheDoItem id={atual.resultado} />
        </Painel>
      </div>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}
