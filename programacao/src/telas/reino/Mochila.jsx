import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import Descartar from '../../componentes/ui/Descartar.jsx'
import GradeDeItens from '../../componentes/ui/GradeDeItens.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import { itemDoCatalogo } from '../../dados/itens.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { ordenarItens } from '../../regras/interface.js'
import DetalheDoItem from './DetalheDoItem.jsx'
import { MensagemDoReino } from './MensagemDoReino.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.mochila

// Mochila do Reino (TASK-072, RF20, UC15; Fase 4.5): a grade com tudo o que o jogador tem (ícone, quantidade no canto,
// borda da raridade), filtros por tipo e o detalhe ao lado; descartar escolhe a quantidade (1, várias ou todas) e pede
// confirmação (componentes/ui/Descartar.jsx, ajustes de 14/10). A equipada fica nos
// personagens (Forja).
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
  const itens = ordenarItens(progresso.mochila)
  const [escolhido, setEscolhido] = useState(null)
  const atual = itens.find((item) => item.id === escolhido) ?? itens[0]
  const pesoTotal = itens.reduce((soma, item) => soma + (itemDoCatalogo(item.id)?.peso ?? 0) * item.quantidade, 0)

  function escolher(id) {
    setEscolhido(id)
    setMensagem(null)
  }

  function descartar(quantidade) {
    fazer('descartar', atual.id, quantidade)
  }

  return (
    <div className="balcao-com-mensagem">
      <div className="balcao">
        <Painel titulo="Seus itens" className="balcao-grade">
          <p className="nota">
            {itens.length} {itens.length === 1 ? 'tipo de item' : 'tipos de item'} · peso total {pesoTotal} (a Mochila do Reino não tem limite)
          </p>
          <GradeDeItens
            rotulo="Itens da Mochila"
            itens={itens.map((item) => ({ id: item.id, quantidade: item.quantidade }))}
            escolhido={atual?.id}
            aoEscolher={escolher}
            vazio="Sua mochila está vazia. Itens vêm das partidas (aperte E perto deles), dos minijogos e do Mercado."
          />
        </Painel>
        <Painel titulo="Detalhe" className="balcao-detalhe">
          {atual ? (
            <DetalheDoItem id={atual.id} quantidade={atual.quantidade}>
              <Descartar
                key={atual.id}
                id={atual.id}
                tem={atual.quantidade}
                oQueAcontece={(quantidade) => `${quantidade > 1 ? 'Eles somem' : 'Ele some'} para sempre: não dá para desfazer.`}
                aoConfirmar={descartar}
              />
              <p className="nota">Descartar tira o item para sempre. Para ganhar ouro com ele, venda no Mercado (ou, se for equipamento, na Forja).</p>
            </DetalheDoItem>
          ) : (
            <p className="vazio">Escolha um item na grade para ver o que ele faz.</p>
          )}
        </Painel>
      </div>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}
