import { useState } from 'react'
import Abas from './Abas.jsx'
import Area from './Area.jsx'

// Abas + o conteúdo da aba escolhida (vazio por enquanto).
// Se a aba escolhida sumir ou ficar desativada, mostra a primeira disponível.
export default function ConteudoComAbas({ pos, abas, semAbas = 'Nada para mostrar ainda.' }) {
  const [escolhida, setEscolhida] = useState(abas[0]?.id)
  const disponiveis = abas.filter((aba) => !aba.desativada)
  const ativa = disponiveis.find((aba) => aba.id === escolhida) ?? disponiveis[0]

  return (
    <>
      <Abas em={pos.abas} abas={abas} ativa={ativa?.id} aoEscolher={setEscolhida} />
      <Area em={pos.conteudo}>{ativa ? `Aba ${ativa.nome} (vazia por enquanto)` : semAbas}</Area>
    </>
  )
}
