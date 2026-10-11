import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Selo from '../../componentes/ui/Selo.jsx'
import Simbolo from '../../componentes/ui/Simbolo.jsx'
import Slot from '../../componentes/ui/Slot.jsx'
import { acoes as acoesDaInterface, arteDaAcao } from '../../dados/interface.js'
import { itemDoCatalogo } from '../../dados/itens.js'
import { trocas } from '../../dados/mercado.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { ofertasDoMomento, situacaoDaTroca } from '../../regras/mercado.js'
import { quantidadeNaMochila } from '../../regras/mochila.js'
import { Catalogo, ComprarNoBalcao, VenderNoBalcao } from './Balcao.jsx'
import { MensagemDoReino } from './MensagemDoReino.jsx'
import { useNoReino } from './useNoReino.js'

const pos = posicoes.mercado

// Mercado (TASK-074, RF21, UC16; Fase 4.5): um balcão com Comprar (ofertas fixas e rotativas ★), Vender (tudo menos
// equipamento, que é na Forja), Trocar item por item e o Catálogo. As regras ficam em regras/mercado.js.
export default function Mercado() {
  const { acoes } = useJogo()
  const abas = [
    { id: 'comprar', nome: 'Comprar', conteudo: <Comprar /> },
    { id: 'vender', nome: 'Vender', conteudo: <Vender /> },
    { id: 'trocar', nome: 'Trocar', conteudo: <Trocar /> },
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

function Comprar() {
  const { progresso } = useNoReino()
  const { fixas, rotativas, partidasParaMudar } = ofertasDoMomento(progresso.estatisticas.partidasJogadas)
  const ofertas = [...fixas.map((id) => ({ id, rotativa: false })), ...rotativas.map((id) => ({ id, rotativa: true }))]
  return (
    <ComprarNoBalcao
      titulo="Ofertas do Mercado"
      ofertas={ofertas}
      operacao={(id, quantidade) => ['comprarNoMercado', id, quantidade]}
      quantidades={[1, 5]}
      topo={
        <Selo cor="var(--destaque)">
          ofertas ★ mudam em {partidasParaMudar} {partidasParaMudar === 1 ? 'partida' : 'partidas'}
        </Selo>
      }
      legenda="O preço fica embaixo de cada item. Apagado: falta ouro."
    />
  )
}

function Vender() {
  const { progresso } = useNoReino()
  const vendaveis = progresso.mochila.filter((item) => itemDoCatalogo(item.id) && itemDoCatalogo(item.id).tipo !== 'equipamento')
  return (
    <VenderNoBalcao
      titulo="Sua Mochila"
      itens={vendaveis}
      operacao={(id, quantidade) => ['venderNoMercado', id, quantidade]}
      nota="O Mercado paga metade do preço (o valor embaixo de cada item). Equipamento se vende na Forja."
      vazio="Nada para vender aqui. Os itens das partidas e dos minijogos aparecem aqui; equipamento se vende na Forja."
    />
  )
}

// Trocar: cada troca numa linha, "você dá" à esquerda, ⇄ e "você recebe" à direita; embaixo de cada item dado, quanto
// você tem e quanto precisa (em vermelho o que falta)
function Trocar() {
  const { progresso, mensagem, fazer, previa } = useNoReino()
  const { cor, simbolo } = acoesDaInterface.trocar

  return (
    <div className="balcao-com-mensagem">
      <Painel titulo="Trocas do Mercado (item por item, sem ouro)" className="painel-das-trocas">
        <p className="nota">O número no canto de cada item é quanto a troca pede ou dá; embaixo, quanto você tem (em vermelho, o que falta).</p>
        <ul className="lista-de-trocas">
          {trocas.map((troca) => {
            const situacao = situacaoDaTroca(progresso, troca)
            const resultado = previa('trocarNoMercado', troca.id)
            return (
              <li key={troca.id} className="troca" aria-label={`Troca: ${troca.id}`}>
                <div className="troca-lado">
                  <span className="troca-rotulo">Você dá</span>
                  <div className="troca-itens">
                    {situacao.map((item) => (
                      <span key={item.id} className={`troca-item${item.tem >= item.quantidade ? '' : ' troca-item-falta'}`}>
                        <Slot id={item.id} quantidade={item.quantidade} tamanho="pequeno" />
                        <span className="troca-conta">tem {item.tem}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <Simbolo simbolo={simbolo} cor={cor} arte={arteDaAcao('trocar')} grande />
                <div className="troca-lado">
                  <span className="troca-rotulo">Você recebe</span>
                  <div className="troca-itens">
                    {Object.entries(troca.receber).map(([id, quantidade]) => (
                      <span key={id} className="troca-item">
                        <Slot id={id} quantidade={quantidade} tamanho="pequeno" />
                        <span className="troca-conta">tem {quantidadeNaMochila(progresso.mochila, id)}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <BotaoDeAcao acao="trocar" desativado={!resultado.ok} motivo={resultado.motivo} onClick={() => fazer('trocarNoMercado', troca.id)}>
                  Trocar
                </BotaoDeAcao>
              </li>
            )
          })}
        </ul>
      </Painel>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}
