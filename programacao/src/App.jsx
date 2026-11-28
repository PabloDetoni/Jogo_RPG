import { useEffect } from 'react'
import { aplicarPreferencias, prepararAudio, tocarMusica } from './audio/gerenciador.js'
import Avisos from './componentes/Avisos.jsx'
import ControleDaTelaCheia from './componentes/ControleDaTelaCheia.jsx'
import GireOCelular from './componentes/GireOCelular.jsx'
import { useToque } from './componentes/useToque.js'
import { preCarregarCenario } from './componentes/cenario/preCarregar.js'
import PainelDev from './componentes/PainelDev.jsx'
import { useJogo } from './estado/contexto.js'
import ProvedorDoJogo from './estado/ProvedorDoJogo.jsx'
import { componentesDasJanelas } from './janelas/index.js'
import { arteDaInterfaceNaRaiz } from './componentes/ui/arteDaInterface.js'
import { componentesDasTelas } from './telas/index.js'
import { musicaDaTela } from './regras/som.js'

// Sem React Router: a tela atual fica no estado do jogo (estado/estadoDoJogo.js).
export default function App() {
  return (
    <ProvedorDoJogo>
      <Jogo />
    </ProvedorDoJogo>
  )
}

// A arte da interface que já chegou (Fase 4.5): molduras, botões e quadradinhos de pixel art, por variáveis de CSS
const arteDaInterface = arteDaInterfaceNaRaiz()

function Jogo() {
  const { estado, acoes } = useJogo()
  const TelaAtual = componentesDasTelas[estado.tela]
  // Toque (Parte 14): com o dedo como jeito de apontar, a moldura ganha data-toque (letra mínima, botões maiores, os
  // controles da partida); com mouse e teclado, nada muda. Em pé, a tela "Gire o celular" cobre tudo.
  const { toque, girar } = useToque()
  useEffect(() => {
    if (toque) document.documentElement.dataset.toque = 'sim'
    else delete document.documentElement.dataset.toque
  }, [toque])
  // Girou para em pé no meio da partida, sem janela aberta: pausa (se puder; em combate, a partida segue)
  const semJanela = estado.janelas.length === 0
  useEffect(() => {
    if (girar && estado.tela === 'partida' && semJanela) acoes.esc()
  }, [girar]) // eslint-disable-line react-hooks/exhaustive-deps

  // Som (Fase 4, TASK-105): o áudio espera o primeiro clique; Música, Som e o mudo seguem as Configurações; a música
  // muda com a tela (na partida, a Partida pede a do combate e a do chefe; no Resumo, a fanfarra pelo resultado)
  useEffect(() => prepararAudio(), [])
  useEffect(() => aplicarPreferencias(estado.preferencias), [estado.preferencias])
  useEffect(() => tocarMusica(musicaDaTela(estado.tela, { resultado: estado.ultimoResultado?.resultado })), [estado.tela]) // eslint-disable-line react-hooks/exhaustive-deps
  // As imagens grandes do Reino e do Mapa chegam antes de a tela abrir (componentes/cenario/preCarregar.js)
  useEffect(() => preCarregarCenario(estado.tela), [estado.tela])

  return (
    <>
      {/* Caixa 16:9 que cabe na janela; o tema muda as cores dela */}
      <div className={`moldura ${arteDaInterface.classes}`} style={arteDaInterface.estilo} data-tema={estado.preferencias.tema} data-toque={toque ? 'sim' : undefined}>
        <TelaAtual key={estado.tela} />
        {estado.janelas.map((id) => {
          const JanelaAberta = componentesDasJanelas[id]
          return <JanelaAberta key={id} />
        })}
        <Avisos />
        <ControleDaTelaCheia />
      </div>
      {girar && <GireOCelular />}
      {import.meta.env.DEV && <PainelDev />}
    </>
  )
}
