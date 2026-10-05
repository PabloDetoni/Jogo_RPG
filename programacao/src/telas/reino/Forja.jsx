import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.forja

const abas = [
  { id: 'equipar', nome: 'Equipar' },
  { id: 'comprar', nome: 'Comprar' },
  { id: 'vender', nome: 'Vender' },
  { id: 'fabricar', nome: 'Fabricar' },
]

export default function Forja() {
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
