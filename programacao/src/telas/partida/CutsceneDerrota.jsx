import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.cutsceneDerrota

export default function CutsceneDerrota() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Area em={pos.mensagem}>Todos os personagens desmaiaram.</Area>
      <Botao em={pos.continuar} onClick={() => acoes.irPara('resumo')}>
        Continuar
      </Botao>
    </Tela>
  )
}
