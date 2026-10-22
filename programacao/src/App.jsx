import { useEffect } from 'react'
import { aplicarPreferencias, prepararAudio, tocarMusica } from './audio/gerenciador.js'
import Avisos from './componentes/Avisos.jsx'
import ControleDaTelaCheia from './componentes/ControleDaTelaCheia.jsx'
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
  const { estado } = useJogo()
  const TelaAtual = componentesDasTelas[estado.tela]

  // Som (Fase 4, TASK-105): o áudio espera o primeiro clique; Música, Som e o mudo seguem as Configurações; a música
  // muda com a tela (a do Boss, a Partida pede quando ele está por perto)
  useEffect(() => prepararAudio(), [])
  useEffect(() => aplicarPreferencias(estado.preferencias), [estado.preferencias])
  useEffect(() => tocarMusica(musicaDaTela(estado.tela)), [estado.tela])
  // As imagens grandes do Reino e do Mapa chegam antes de a tela abrir (componentes/cenario/preCarregar.js)
  useEffect(() => preCarregarCenario(estado.tela), [estado.tela])

  return (
    <>
      {/* Caixa 16:9 que cabe na janela; o tema muda as cores dela */}
      <div className={`moldura ${arteDaInterface.classes}`} style={arteDaInterface.estilo} data-tema={estado.preferencias.tema}>
        <TelaAtual key={estado.tela} />
        {estado.janelas.map((id) => {
          const JanelaAberta = componentesDasJanelas[id]
          return <JanelaAberta key={id} />
        })}
        <Avisos />
        <ControleDaTelaCheia />
      </div>
      {import.meta.env.DEV && <PainelDev />}
    </>
  )
}
