import { atributos } from '../dados/classes.js'

// Pentágono dos 5 atributos (RF07, TASK-071): uma ponta por atributo, na ordem de dados/classes.js (Vitalidade em
// cima, depois no sentido do relógio). Cada ponta vai do centro até valor ÷ maximo; a grade marca 25%, 50%, 75% e 100%.
// Desenhado em SVG, muda de forma com os valores. Usado na Seleção de classe e nas Árvores de Habilidades.
export default function Pentagono({ valores, maximo, cor = '#3d7bff', rotulo }) {
  const tamanho = 240
  const centro = tamanho / 2
  const raio = tamanho * 0.3
  const ponto = (indice, fracao) => {
    const angulo = -Math.PI / 2 + (indice * 2 * Math.PI) / atributos.length
    return [centro + Math.cos(angulo) * raio * fracao, centro + Math.sin(angulo) * raio * fracao]
  }
  const contorno = (fracao) => atributos.map((_, indice) => ponto(indice, fracao).map((n) => n.toFixed(1)).join(',')).join(' ')
  const fracaoDe = (id) => Math.min(1, Math.max(0, (valores[id] ?? 0) / maximo))
  const forma = atributos.map((atributo, indice) => ponto(indice, fracaoDe(atributo.id)).map((n) => n.toFixed(1)).join(',')).join(' ')
  const descricao = rotulo ?? `Atributos: ${atributos.map((atributo) => `${atributo.nome} ${valores[atributo.id] ?? 0}`).join(', ')}`

  return (
    <svg className="pentagono" viewBox={`0 0 ${tamanho} ${tamanho}`} role="img" aria-label={descricao}>
      {[0.25, 0.5, 0.75, 1].map((fracao) => (
        <polygon key={fracao} points={contorno(fracao)} className="pentagono-grade" />
      ))}
      {atributos.map((atributo, indice) => {
        const [x, y] = ponto(indice, 1)
        return <line key={atributo.id} x1={centro} y1={centro} x2={x} y2={y} className="pentagono-eixo" />
      })}
      <polygon points={forma} className="pentagono-forma" style={{ fill: cor, stroke: cor }} data-forma={forma} />
      {atributos.map((atributo, indice) => {
        const [x, y] = ponto(indice, 1.38)
        return (
          <text key={atributo.id} x={x} y={y} className="pentagono-rotulo" textAnchor="middle" dominantBaseline="middle">
            <tspan>{atributo.sigla}</tspan>
            <tspan x={x} dy="1.1em" className="pentagono-valor">
              {valores[atributo.id] ?? 0}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
