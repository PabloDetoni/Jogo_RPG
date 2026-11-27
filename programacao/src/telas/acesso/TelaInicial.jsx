import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { estiloPosicao } from '../../componentes/posicao.js'
import { pedirTelaCheia } from '../../componentes/telaCheia.js'
import { jogo } from '../../dados/jogo.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.telaInicial

export default function TelaInicial() {
  const { estado, acoes } = useJogo()

  return (
    // O nome do jogo grande no lugar do título da tela (Parte 13: o professor pede a Tela inicial com o nome)
    <Tela tituloOculto>
      <div className="nome-do-jogo posicionado" style={estiloPosicao(pos.nome)}>
        <p className="nome-do-jogo-titulo" role="heading" aria-level="2">
          {jogo.nome}
        </p>
        <p className="nome-do-jogo-frase">{jogo.frase}</p>
      </div>
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
