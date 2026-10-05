import Botao from '../../componentes/Botao.jsx'
import ConteudoComAbas from '../../componentes/ConteudoComAbas.jsx'
import Tela from '../../componentes/Tela.jsx'
import { classes } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.arvores

// Uma aba por classe. Só os personagens permanentes têm árvore (Conceito §10.6).
export default function ArvoresHabilidades() {
  const { estado, acoes } = useJogo()
  const abas = classes.map((classe) => ({
    id: classe.id,
    nome: classe.nome,
    desativada: !estado.progresso.personagens.some((p) => p.classe === classe.id),
  }))

  return (
    <Tela>
      <ConteudoComAbas pos={pos} abas={abas} semAbas="Nenhum personagem permanente ainda." />
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
    </Tela>
  )
}
