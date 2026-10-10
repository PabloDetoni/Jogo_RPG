import { useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import ListaComDetalhe from '../../componentes/ListaComDetalhe.jsx'
import { missaoDoQuadro, nomeDoAlvo, quadroDeMissoes } from '../../dados/missoes.js'
import { missaoCumprida, missaoEmUmaLinha, multaDaMissao } from '../../regras/missoes.js'
import { useNoReino } from './useNoReino.js'

const nomesDosTipos = { matar: 'Matar', coletar: 'Coletar', entregar: 'Entregar', explorar: 'Explorar' }

// Aba Missões da Guilda (TASK-078; RF26 a RF28, UC21 a UC24): sem missão ativa, o quadro (aceitar); com missão ativa, o
// progresso, entregar (a recompensa só entra aqui) e abandonar (mostra a multa antes de confirmar).
export function MissoesDaGuilda() {
  const { progresso, mensagem, setMensagem, fazer } = useNoReino()
  const [escolhida, setEscolhida] = useState(null)
  const [confirmandoAbandono, setConfirmandoAbandono] = useState(false)
  const ativa = progresso.missaoAtiva

  if (ativa) {
    const doQuadro = missaoDoQuadro(ativa.id)
    const multa = multaDaMissao(ativa)
    const cumprida = missaoCumprida(progresso)
    return (
      <div className="contratos">
        <h3>Missão ativa: {doQuadro?.titulo ?? ativa.id}</h3>
        {doQuadro && <p className="nota">{doQuadro.descricao}</p>}
        <p>
          {missaoEmUmaLinha(progresso)}
          {cumprida ? ' — cumprida! Entregue para receber.' : ''}
        </p>
        {ativa.tipo === 'entregar' && <p className="nota">A entrega conta o que está na Mochila agora: vender os itens antes deixa a missão incompleta de novo.</p>}
        <p>
          Recompensa: <strong>{ativa.recompensa.ouro}</strong> de ouro e <strong>{ativa.recompensa.xp}</strong> XP (dividido entre os personagens permanentes)
        </p>
        <div className="botoes-em-linha">
          <Botao onClick={() => fazer('entregarMissaoNaGuilda')}>Entregar</Botao>
          {!confirmandoAbandono && (
            <Botao
              onClick={() => {
                setConfirmandoAbandono(true)
                setMensagem(null)
              }}
            >
              Abandonar…
            </Botao>
          )}
        </div>
        {confirmandoAbandono && (
          <div className="confirmacao">
            <p>
              Abandonar custa <strong>{multa}</strong> de ouro (10% da recompensa). Você tem {progresso.ouro}
              {progresso.ouro < multa ? ': o ouro vai ficar em zero.' : '.'}
            </p>
            <div className="botoes-em-linha">
              <Botao
                onClick={() => {
                  fazer('abandonarMissaoNaGuilda')
                  setConfirmandoAbandono(false)
                }}
              >
                Sim, abandonar
              </Botao>
              <Botao onClick={() => setConfirmandoAbandono(false)}>Cancelar</Botao>
            </div>
          </div>
        )}
        {mensagem && (
          <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino'} role="status">
            {mensagem.texto}
          </p>
        )}
      </div>
    )
  }

  const atual = quadroDeMissoes.find((missao) => missao.id === escolhida) ?? quadroDeMissoes[0]
  return (
    <ListaComDetalhe
      rotulo="Quadro de missões"
      topo={<span className="nota">Uma missão por vez. O progresso só conta depois de aceitar e soma entre as partidas.</span>}
      itens={quadroDeMissoes.map((missao) => ({ chave: missao.id, titulo: missao.titulo, direita: nomesDosTipos[missao.tipo] }))}
      escolhido={atual.id}
      aoEscolher={(id) => {
        setEscolhida(id)
        setMensagem(null)
      }}
      mensagem={mensagem}
      detalhe={
        <div className="detalhe-do-item">
          <h3>{atual.titulo}</h3>
          <p>{atual.descricao}</p>
          <p className="detalhe-do-item-funcao">
            {nomesDosTipos[atual.tipo]}: {atual.tipo === 'explorar' ? nomeDoAlvo(atual) : `${atual.quantidade} ${nomeDoAlvo(atual)}`}
          </p>
          <p className="nota">
            Recompensa: {atual.recompensa.ouro} de ouro e {atual.recompensa.xp} XP · abandonar custa {multaDaMissao(atual)} de ouro
          </p>
          <div className="botoes-em-linha">
            <Botao onClick={() => fazer('aceitarMissaoDoQuadro', atual.id)}>Aceitar</Botao>
          </div>
        </div>
      }
    />
  )
}

