// O que muda com uma ação (Fase 4.5): "Ouro 2000 → 1975", com o depois em verde (melhora) ou vermelho (piora).
// "maiorEhMelhor: false" inverte as cores (por exemplo, o peso).
export default function Mudanca({ nome, antes, depois, sufixo = '', maiorEhMelhor = true }) {
  const sobe = depois > antes
  const desce = depois < antes
  const boa = maiorEhMelhor ? sobe : desce
  const ruim = maiorEhMelhor ? desce : sobe
  return (
    <span className={`mudanca${boa ? ' mudanca-boa' : ''}${ruim ? ' mudanca-ruim' : ''}`}>
      <span className="mudanca-nome">{nome}</span>{' '}
      <span className="mudanca-antes">
        {antes}
        {sufixo}
      </span>
      {' → '}
      <span className="mudanca-depois">
        {depois}
        {sufixo}
        {sobe ? ' ▲' : desce ? ' ▼' : ''}
      </span>
    </span>
  )
}
