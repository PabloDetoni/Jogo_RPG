import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.guilda

const abas = [
  { id: 'missoes', nome: 'Missões' },
  { id: 'contratoTemporario', nome: 'Contrato temporário' },
  { id: 'contratoPermanente', nome: 'Contrato permanente' },
]

export default function Guilda() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <ConteudoComAbas pos={pos} abas={abas} />
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}
