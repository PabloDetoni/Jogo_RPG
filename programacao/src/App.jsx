import Avisos from './componentes/Avisos.jsx'
import PainelDev from './componentes/PainelDev.jsx'
import { useJogo } from './estado/contexto.js'
import ProvedorDoJogo from './estado/ProvedorDoJogo.jsx'
import { componentesDasJanelas } from './janelas/index.js'
import { componentesDasTelas } from './telas/index.js'

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
