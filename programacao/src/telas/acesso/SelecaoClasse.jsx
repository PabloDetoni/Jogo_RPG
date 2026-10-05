import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { classes } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.selecaoClasse

// A classe escolhida é gratuita, permanente e vira o primeiro Líder (RF07).
export default function SelecaoClasse() {
  const { acoes } = useJogo()

  return (
    <Tela>
      <Area em={pos.instrucao}>Escolha sua classe inicial</Area>
      {classes.map((classe) => (
        <Botao key={classe.id} em={pos[classe.id]} onClick={() => acoes.escolherClasseInicial(classe.id)}>
          {classe.nome}
        </Botao>
      ))}
    </Tela>
  )
}
