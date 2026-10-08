import { useState } from 'react'
import Abas from './Abas.jsx'
import Area from './Area.jsx'

// Abas + o conteúdo da aba escolhida. Cada aba pode trazer o seu "conteudo" (um componente React já montado);
// sem ele, aparece o aviso de que ela ainda está vazia.
// Se a aba escolhida sumir ou ficar desativada, mostra a primeira disponível. "inicial" escolhe a aba do começo.
export default function ConteudoComAbas({ pos, abas, semAbas = 'Nada para mostrar ainda.', inicial }) {
  const [escolhida, setEscolhida] = useState(inicial ?? abas[0]?.id)
  const disponiveis = abas.filter((aba) => !aba.desativada)
  const ativa = disponiveis.find((aba) => aba.id === escolhida) ?? disponiveis[0]
  const conteudo = ativa ? (ativa.conteudo ?? `Aba ${ativa.nome} (vazia por enquanto)`) : semAbas

  return (
    <>
      <Abas em={pos.abas} abas={abas} ativa={ativa?.id} aoEscolher={setEscolhida} />
      <Area em={pos.conteudo}>{conteudo}</Area>
    </>
  )
}
