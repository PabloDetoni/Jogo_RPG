import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.telaInicial

export default function TelaInicial() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Botao em={pos.iniciarJogo} onClick={() => acoes.irPara('login')}>
        Iniciar jogo
      </Botao>
      <Botao em={pos.comoJogar} onClick={() => acoes.abrirJanela('comoJogar')}>
        Como jogar
      </Botao>
    </Tela>
  )
}
