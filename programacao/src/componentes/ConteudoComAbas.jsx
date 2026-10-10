import { useState } from 'react'
import Abas from './Abas.jsx'
import Area from './Area.jsx'

// Abas + o conteúdo da aba escolhida. Cada aba pode trazer o seu "conteudo" (um componente React já montado);
// sem ele, aparece o aviso de que ela ainda está vazia.
// Se a aba escolhida sumir ou ficar desativada, mostra a primeira disponível. "inicial" escolhe a aba do começo.
// noTopo: o conteúdo fica preso pelo topo (logo abaixo das abas) em vez de centralizado no ponto, para os conteúdos
// altos não subirem por cima das abas (Árvores, Fase 4).
export default function ConteudoComAbas({ pos, abas, semAbas = 'Nada para mostrar ainda.', inicial, noTopo = false }) {
  const [escolhida, setEscolhida] = useState(inicial ?? abas[0]?.id)
  const disponiveis = abas.filter((aba) => !aba.desativada)
  const ativa = disponiveis.find((aba) => aba.id === escolhida) ?? disponiveis[0]
  const conteudo = ativa ? (ativa.conteudo ?? `Aba ${ativa.nome} (vazia por enquanto)`) : semAbas

  return (
    <>
      <Abas em={pos.abas} abas={abas} ativa={ativa?.id} aoEscolher={setEscolhida} />
      <Area em={pos.conteudo} className={noTopo ? 'area-no-topo' : ''}>
        {conteudo}
      </Area>
    </>
  )
}
