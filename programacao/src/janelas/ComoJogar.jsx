import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { useJogo } from '../estado/contexto.js'

// Instruções do jogo (RF13). Abre na Tela inicial e na pausa. O texto ainda vai ser escrito.
export default function ComoJogar() {
  const { acoes } = useJogo()

  return (
    <Janela titulo="Como jogar">
      <p>Texto de como jogar</p>
      <Botao onClick={acoes.fecharJanela}>Fechar</Botao>
    </Janela>
  )
}
