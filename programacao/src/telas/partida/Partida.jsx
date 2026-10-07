import { useEffect, useMemo, useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import ArenaDaPartida from '../../jogo/ArenaDaPartida.jsx'
import { criarPonte } from '../../jogo/ponte.js'
import { montarGrupoDaPartida } from '../../regras/grupoDaPartida.js'
import BarraDeTeste from './BarraDeTeste.jsx'
import HudDaPartida from './HudDaPartida.jsx'

const pos = posicoes.partida

// Partida (etapa 5): o Phaser desenha a arena embaixo; HUD, retorno e barra de teste ficam em React, por cima.
// Os dois lados conversam só pela ponte (src/jogo/ponte.js).
export default function Partida() {
  const { estado, acoes } = useJogo()
  const [ponte] = useState(criarPonte)
  const [situacao, setSituacao] = useState(null)
  const retornando = estado.segundosRetorno !== null
  const pausado = estado.janelas.includes('pausa')
  const contando = retornando && !pausado

  // O progresso não muda durante a partida (RF12), então o grupo é montado uma vez só
  const lider = estado.partidaAtual?.lider ?? null
  const grupo = useMemo(() => montarGrupoDaPartida(estado.progresso, lider), [estado.progresso, lider])

  useEffect(() => ponte.ouvir('situacao', setSituacao), [ponte])
  // Fim pelo desmaio (TASK-044): todos caídos → Derrota (com a cutscene); Líder não levantado em 30 s →
  // Retorno forçado. O motivo aparece no Resumo.
  useEffect(
    () => ponte.ouvir('fimDaPartida', ({ resultado, ...detalhes }) => acoes.encerrarPartida(resultado, detalhes)),
    [ponte, acoes],
  )
  // A pausa congela o jogo; as Configurações não pausam (Conceito §11.8)
  useEffect(() => ponte.definirPausa(pausado), [ponte, pausado])

  // A contagem do retorno anda de 1 em 1 segundo e para enquanto a pausa está aberta.
  // O jogo continua rodando durante a contagem.
  useEffect(() => {
    if (!contando) return
    const relogio = setInterval(acoes.contarRetorno, 1000)
    return () => clearInterval(relogio)
  }, [contando, acoes])

  return (
    <Tela className="tela-partida" semTitulo configuracoesEm={pos.configuracoes}>
      <ArenaDaPartida ponte={ponte} grupo={grupo} />
      <HudDaPartida situacao={situacao} />

      {retornando && (
        <>
          <Area em={pos.retorno} className="faixa-da-partida">
            Voltando ao Reino em {estado.segundosRetorno} s
          </Area>
          <Botao em={pos.cancelarRetorno} onClick={acoes.cancelarRetorno}>
            Cancelar retorno
          </Botao>
        </>
      )}

      <BarraDeTeste ponte={ponte} situacao={situacao} encerrarPartida={acoes.encerrarPartida} />
    </Tela>
  )
}
