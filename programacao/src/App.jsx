import { useEffect } from 'react'
import { aplicarPreferencias, prepararAudio, tocarMusica } from './audio/gerenciador.js'
import Avisos from './componentes/Avisos.jsx'
import PainelDev from './componentes/PainelDev.jsx'
import { useJogo } from './estado/contexto.js'
import ProvedorDoJogo from './estado/ProvedorDoJogo.jsx'
import { componentesDasJanelas } from './janelas/index.js'
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

function Jogo() {
  const { estado } = useJogo()
  const TelaAtual = componentesDasTelas[estado.tela]

  // Som (Fase 4, TASK-105): o áudio espera o primeiro clique; Música, Som e o mudo seguem as Configurações; a música
  // muda com a tela (a do Boss, a Partida pede quando ele está por perto)
  useEffect(() => prepararAudio(), [])
  useEffect(() => aplicarPreferencias(estado.preferencias), [estado.preferencias])
  useEffect(() => tocarMusica(musicaDaTela(estado.tela)), [estado.tela])

  return (
    <>
      {/* Caixa 16:9 que cabe na janela; o tema muda as cores dela */}
      <div className="moldura" data-tema={estado.preferencias.tema}>
        <TelaAtual key={estado.tela} />
        {estado.janelas.map((id) => {
          const JanelaAberta = componentesDasJanelas[id]
          return <JanelaAberta key={id} />
        })}
        <Avisos />
      </div>
      {import.meta.env.DEV && <PainelDev />}
    </>
  )
}
