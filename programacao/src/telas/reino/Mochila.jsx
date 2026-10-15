import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import Descartar from '../../componentes/ui/Descartar.jsx'
import FiltrosDeItens from '../../componentes/ui/FiltrosDeItens.jsx'
import GradeComMao from '../../componentes/ui/GradeComMao.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Slot from '../../componentes/ui/Slot.jsx'
import { useGradeComMao } from '../../componentes/ui/useGradeComMao.js'
import { gradeComMao } from '../../dados/interface.js'
import { itemDoCatalogo } from '../../dados/itens.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { filtrarItens, ordenarItens } from '../../regras/interface.js'
import DetalheDoItem from './DetalheDoItem.jsx'
import { MensagemDoReino } from './MensagemDoReino.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.mochila
const { tamanho } = gradeComMao.reino

// Mochila do Reino (TASK-072, RF20, UC15; Fase 4.5; ajustes da partida, 14/10): a mesma grade da mochila da partida, com
// o item na mão (componentes/ui/GradeComMao.jsx): clique pega a pilha, botão direito a metade, clique noutro quadradinho
// põe ou troca. Sem chão no Reino: o item da mão vai para a LIXEIRA, que pede confirmação (cancelar guarda de volta).
// A arrumação vale enquanto a tela está aberta (o save guarda os itens, não os lugares). O filtro apaga os de outros
// tipos, sem tirar ninguém do lugar. O detalhe mostra o último item clicado, com o "Descartar…" (para quem usa o
// teclado). A equipada fica nos personagens (Forja).
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

function ConteudoDaMochila() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const itens = ordenarItens(progresso.mochila).map(({ id, quantidade }) => ({ id, quantidade }))
  const grade = useGradeComMao(itens, gradeComMao.reino)
  const [filtro, setFiltro] = useState('todos')
  const [escolhido, setEscolhido] = useState(null)
  const [naLixeira, setNaLixeira] = useState(null) // { id, quantidade } esperando a confirmação
  const atual = itens.find((item) => item.id === escolhido) ?? itens[0]
  const pesoTotal = itens.reduce((soma, item) => soma + (itemDoCatalogo(item.id)?.peso ?? 0) * item.quantidade, 0)
  const doFiltro = new Set(filtrarItens(itens, filtro).map((item) => item.id))

  function clicou(slot) {
    if (slot) setEscolhido(slot.id)
    setMensagem(null)
  }

  function confirmarLixeira() {
    fazer('descartar', naLixeira.id, naLixeira.quantidade)
    setNaLixeira(null)
  }

  function cancelarLixeira() {
    grade.guardar(naLixeira)
    setNaLixeira(null)
  }

  return (
    <div className="balcao-com-mensagem">
      <div className="balcao">
        <Painel titulo="Seus itens" className="balcao-grade">
          <p className="nota">
            {itens.length} {itens.length === 1 ? 'tipo de item' : 'tipos de item'} · peso total {pesoTotal} (a Mochila do Reino não tem limite)
          </p>
          {itens.length === 0 && !naLixeira ? (
            <p className="vazio">Sua mochila está vazia. Itens vêm das partidas (aperte E perto deles), dos minijogos e do Mercado.</p>
          ) : (
            <>
              <FiltrosDeItens itens={itens} filtro={filtro} aoMudar={setFiltro} />
              <GradeComMao
                grade={grade}
                tamanho={tamanho}
                rotulo="Itens da Mochila"
                apagado={(id) => !doFiltro.has(id)}
                aoClicar={clicou}
                lixeira={{ aoJogarNaLixeira: (item) => item && setNaLixeira(item) }}
              />
            </>
          )}
        </Painel>
        <Painel titulo="Detalhe" className="balcao-detalhe">
          {naLixeira && <ConfirmarLixeira item={naLixeira} aoConfirmar={confirmarLixeira} aoCancelar={cancelarLixeira} />}
          {atual ? (
            <DetalheDoItem id={atual.id} quantidade={atual.quantidade}>
              <Descartar
                key={atual.id}
                id={atual.id}
                tem={atual.quantidade}
                oQueAcontece={(quantidade) => `${quantidade > 1 ? 'Eles somem' : 'Ele some'} para sempre: não dá para desfazer.`}
                aoConfirmar={(quantidade) => fazer('descartar', atual.id, quantidade)}
              />
              <p className="nota">Descartar tira o item para sempre. Para ganhar ouro com ele, venda no Mercado (ou, se for equipamento, na Forja).</p>
            </DetalheDoItem>
          ) : (
            !naLixeira && <p className="vazio">Clique num item da grade para ver o que ele faz.</p>
          )}
        </Painel>
      </div>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}

// O item que foi para a lixeira, esperando o "Sim": mostra o item, quantos e que some para sempre
function ConfirmarLixeira({ item, aoConfirmar, aoCancelar }) {
  const nome = itemDoCatalogo(item.id)?.nome ?? item.id
  return (
    <div className="descartar confirmacao-lixeira" role="group" aria-label={`Lixeira: ${nome}`}>
      <div className="confirmacao descartar-confirmacao">
        <Slot id={item.id} quantidade={item.quantidade} tamanho="pequeno" />
        <p>
          Descartar <strong>
            {item.quantidade} {nome}
          </strong>
          ? {item.quantidade > 1 ? 'Eles somem' : 'Ele some'} para sempre: não dá para desfazer.
        </p>
      </div>
      <div className="botoes-em-linha">
        <BotaoDeAcao acao="perder" onClick={aoConfirmar}>
          Sim, descartar {item.quantidade}
        </BotaoDeAcao>
        <Botao onClick={aoCancelar}>Cancelar (volta para a grade)</Botao>
      </div>
    </div>
  )
}
