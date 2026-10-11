import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import Barra from '../../componentes/ui/Barra.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import Mudanca from '../../componentes/ui/Mudanca.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Simbolo from '../../componentes/ui/Simbolo.jsx'
import { arteDoTipoDeMissao, tiposDeMissaoNaTela } from '../../dados/interface.js'
import { missaoDoQuadro, objetivoDaMissao, quadroDeMissoes } from '../../dados/missoes.js'
import { missaoEmUmaLinha, multaDaMissao, progressoAgora } from '../../regras/missoes.js'
import { MensagemDoReino } from './MensagemDoReino.jsx'
import { useNoReino } from './useNoReino.js'

// O símbolo do tipo da missão (matar, coletar, entregar, explorar), na cor do tipo
function SimboloDoTipo({ tipo, grande = false }) {
  const dados = tiposDeMissaoNaTela[tipo] ?? { simbolo: '?', cor: 'var(--borda)' }
  return <Simbolo simbolo={dados.simbolo} cor={dados.cor} arte={arteDoTipoDeMissao(tipo)} grande={grande} />
}

const Recompensa = ({ recompensa }) => (
  <span className="recompensa">
    <span className="recompensa-ouro">+{recompensa.ouro} de ouro</span> · <span className="recompensa-xp">+{recompensa.xp} XP</span>
  </span>
)

// Aba Missões da Guilda (TASK-078; RF26 a RF28, UC21 a UC24; Fase 4.5): o quadro de avisos, um cartaz por missão (o tipo,
// o objetivo e a recompensa). A missão ativa fica em destaque em cima, com a barra de progresso; Entregar diz o que ganha
// (a recompensa só entra aqui) e Abandonar diz a multa antes de confirmar. Só uma missão por vez.
export function MissoesDaGuilda() {
  const { progresso, mensagem, setMensagem, fazer, previa } = useNoReino()
  const [confirmandoAbandono, setConfirmandoAbandono] = useState(false)
  const ativa = progresso.missaoAtiva

  return (
    <div className="balcao-com-mensagem quadro-com-mensagem">
      {ativa && <MissaoAtiva ativa={ativa} progresso={progresso} fazer={fazer} previa={previa} confirmando={confirmandoAbandono} setConfirmando={setConfirmandoAbandono} setMensagem={setMensagem} />}
      <Painel titulo="Quadro de avisos" className="quadro-de-avisos">
        <p className="nota">
          {ativa ? 'Você já tem uma missão: entregue ou abandone a atual para pegar outra.' : 'Uma missão por vez. O progresso conta a partir de quando você aceita e soma entre as partidas.'}
        </p>
        <div className="cartazes">
          {quadroDeMissoes.map((missao) => {
            const tipo = tiposDeMissaoNaTela[missao.tipo]
            const resultado = previa('aceitarMissaoDoQuadro', missao.id)
            const eAtiva = ativa?.id === missao.id
            return (
              <article key={missao.id} className={`cartaz${eAtiva ? ' cartaz-ativo' : ''}`} aria-label={missao.titulo} style={{ '--cor-do-tipo': tipo?.cor }}>
                <div className="cartaz-cabeca">
                  <SimboloDoTipo tipo={missao.tipo} />
                  <span className="cartaz-tipo">{tipo?.nome}</span>
                </div>
                <h4>{missao.titulo}</h4>
                <p className="cartaz-objetivo">{objetivoDaMissao(missao)}</p>
                <Recompensa recompensa={missao.recompensa} />
                {eAtiva ? (
                  <span className="selo selo-forte" style={{ '--cor-do-selo': 'var(--destaque)' }}>
                    é a sua missão
                  </span>
                ) : (
                  <BotaoDeAcao acao="aceitar" desativado={!resultado.ok} onClick={() => fazer('aceitarMissaoDoQuadro', missao.id)}>
                    Aceitar
                  </BotaoDeAcao>
                )}
              </article>
            )
          })}
        </div>
      </Painel>
      <MensagemDoReino mensagem={mensagem} />
    </div>
  )
}

function MissaoAtiva({ ativa, progresso, fazer, previa, confirmando, setConfirmando, setMensagem }) {
  const doQuadro = missaoDoQuadro(ativa.id)
  const multa = multaDaMissao(ativa)
  const feito = progressoAgora(progresso)
  const entregar = previa('entregarMissaoNaGuilda')
  return (
    <Painel titulo={`Sua missão: ${doQuadro?.titulo ?? ativa.id}`} className="missao-ativa">
      <div className="missao-ativa-corpo">
        <SimboloDoTipo tipo={ativa.tipo} grande />
        <div className="missao-ativa-texto">
          <p className="missao-ativa-linha">{missaoEmUmaLinha(progresso)}</p>
          <Barra fracao={feito / Math.max(1, ativa.quantidade)} texto={`${Math.min(feito, ativa.quantidade)} de ${ativa.quantidade}`} rotulo="Progresso da missão" />
          {ativa.tipo === 'entregar' && <p className="nota">A entrega conta o que está na Mochila agora: vender os itens antes deixa a missão incompleta de novo.</p>}
        </div>
        <div className="missao-ativa-botoes">
          <BotaoDeAcao acao="entregar" desativado={!entregar.ok} motivo={entregar.motivo} onClick={() => fazer('entregarMissaoNaGuilda')}>
            Entregar: +{ativa.recompensa.ouro} de ouro e +{ativa.recompensa.xp} XP
          </BotaoDeAcao>
          {!confirmando && (
            <BotaoDeAcao
              acao="perder"
              onClick={() => {
                setConfirmando(true)
                setMensagem(null)
              }}
            >
              Abandonar (multa de {multa})…
            </BotaoDeAcao>
          )}
        </div>
      </div>
      {confirmando && (
        <div className="confirmacao">
          <p>
            Abandonar custa <strong>{multa}</strong> de ouro (10% da recompensa){progresso.ouro < multa ? ': o ouro vai ficar em zero' : ''}.{' '}
            <Mudanca nome="Seu ouro:" antes={progresso.ouro} depois={Math.max(0, progresso.ouro - multa)} />
          </p>
          <div className="botoes-em-linha">
            <BotaoDeAcao
              acao="perder"
              onClick={() => {
                fazer('abandonarMissaoNaGuilda')
                setConfirmando(false)
              }}
            >
              Sim, abandonar
            </BotaoDeAcao>
            <Botao onClick={() => setConfirmando(false)}>Cancelar</Botao>
          </div>
        </div>
      )}
    </Painel>
  )
}
