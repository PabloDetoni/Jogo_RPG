import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { pedirTelaCheia } from '../../componentes/telaCheia.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.telaInicial

export default function TelaInicial() {
  const { estado, acoes } = useJogo()

  return (
    <Tela>
      {/* A tela cheia entra neste clique (ajustes de 14/10; o navegador só deixa no momento de um clique) */}
      <Botao
        em={pos.iniciarJogo}
        onClick={() => {
          pedirTelaCheia(estado.preferencias.telaCheia)
          acoes.irPara('login')
        }}
      >
        Iniciar jogo
      </Botao>
      <Botao em={pos.comoJogar} onClick={() => acoes.abrirJanela('comoJogar')}>
        Como jogar
      </Botao>
    </Tela>
  )
}
