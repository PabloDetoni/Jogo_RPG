import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { ContratosPermanentes, ContratosTemporarios } from './Contratos.jsx'
import { MissoesDaGuilda } from './Missoes.jsx'
import ComNpc from './ComNpc.jsx'

const pos = posicoes.guilda

// Guilda (UC21 a UC25): missões (TASK-078) e contratos (TASK-079).
export default function Guilda() {
  const { acoes } = useJogo()
  const abas = [
    { id: 'missoes', nome: 'Missões', conteudo: <MissoesDaGuilda /> },
    { id: 'contratoTemporario', nome: 'Contrato temporário', conteudo: <ContratosTemporarios /> },
    { id: 'contratoPermanente', nome: 'Contrato permanente', conteudo: <ContratosPermanentes /> },
  ]

  return (
    <Tela>
      <ComNpc lugar="guilda" pos={pos} abas={abas} noTopo />
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}
