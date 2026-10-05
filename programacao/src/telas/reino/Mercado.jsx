import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.mercado

const abas = [
  { id: 'comprar', nome: 'Comprar' },
  { id: 'vender', nome: 'Vender' },
  { id: 'trocar', nome: 'Trocar' },
]

export default function Mercado() {
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
