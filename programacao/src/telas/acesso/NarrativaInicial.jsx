import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.narrativaInicial

// Primeiro acesso (RF07). O texto de verdade ainda vai ser escrito.
export default function NarrativaInicial() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Area em={pos.texto}>Texto inicial da narrativa</Area>
      <Botao em={pos.continuar} onClick={() => acoes.irPara('selecaoClasse')}>
        Continuar
      </Botao>
    </Tela>
  )
}
