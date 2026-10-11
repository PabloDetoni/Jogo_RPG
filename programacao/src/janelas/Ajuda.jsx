import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { ajudaDasTelas } from '../dados/ajuda.js'
import { telas } from '../dados/telas.js'
import { useJogo } from '../estado/contexto.js'

// "Como funciona" (Fase 4.5): o "?" no canto de cada tela abre esta explicação curta (dados/ajuda.js). Esc fecha.
export default function Ajuda() {
  const { estado, acoes } = useJogo()
  const linhas = ajudaDasTelas[estado.tela] ?? ['Nada para explicar nesta tela.']

  return (
    <Janela titulo={`Como funciona: ${telas[estado.tela]?.nome ?? ''}`}>
      <div className="texto-da-ajuda">
        {linhas.map((linha) => (
          <p key={linha}>{linha}</p>
        ))}
      </div>
      <Botao onClick={acoes.fecharJanela}>Entendi</Botao>
    </Janela>
  )
}
