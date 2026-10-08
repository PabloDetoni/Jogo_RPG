import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Pentagono from '../../componentes/Pentagono.jsx'
import Tela from '../../componentes/Tela.jsx'
import { classes, corDaClasseCss } from '../../dados/classes.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'

const pos = posicoes.selecaoClasse
// Escala do pentágono: o maior atributo inicial, arredondado para cima de 5 em 5 (assim as classes se comparam)
const escala = Math.ceil(Math.max(...classes.flatMap((classe) => Object.values(classe.atributosIniciais))) / 5) * 5

// A classe escolhida é gratuita, permanente e vira o primeiro Líder (RF07). Clicar numa classe mostra a descrição e o
// pentágono dos atributos iniciais (TASK-071); "Escolher" confirma, porque a escolha não se desfaz.
export default function SelecaoClasse() {
  const { acoes } = useJogo()
  const [vendo, setVendo] = useState(classes[0].id)
  const classe = classes.find((c) => c.id === vendo)

  return (
    <Tela>
      <Area em={pos.instrucao}>Escolha sua classe inicial (gratuita, para sempre e o seu primeiro Líder)</Area>
      {classes.map((c) => (
        <Botao key={c.id} em={pos[c.id]} selecionado={c.id === vendo} onClick={() => setVendo(c.id)}>
          {c.nome}
        </Botao>
      ))}
      <Area em={pos.detalhe} className="detalhe-da-classe">
        <Pentagono valores={classe.atributosIniciais} maximo={escala} cor={corDaClasseCss(classe.id)} />
        <div className="texto-da-classe">
          <h2>{classe.nome}</h2>
          <p className="papel-da-classe">{classe.papel}</p>
          <p>{classe.descricao}</p>
        </div>
      </Area>
      <Botao em={pos.escolher} onClick={() => acoes.escolherClasseInicial(classe.id)}>
        Escolher {classe.nome}
      </Botao>
    </Tela>
  )
}
