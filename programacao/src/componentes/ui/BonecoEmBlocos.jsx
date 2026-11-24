// Um boneco (ou bicho) em blocos desenhado em SVG, fora da partida (Parte 9: os NPCs; Parte 10: a pesca). Recebe as
// mesmas formas que a partida desenha no Phaser (regras/bonecos.js: "ret", "poli", "circulo" e "linha"), com a origem
// no meio. "tamanho" é o lado do quadro, em unidades do desenho (o SVG escala para caber onde for posto).
const cor = (numero) => `#${numero.toString(16).padStart(6, '0')}`

export function FormasEmBlocos({ pecas }) {
  return pecas.map((p, i) => {
    const borda = p.contorno ? { stroke: cor(p.corDoContorno), strokeWidth: p.espessura } : {}
    if (p.forma === 'ret') {
      const raio = Math.max(0, Math.min(p.raio ?? 0, p.largura / 2, p.altura / 2))
      return <rect key={i} x={p.x} y={p.y} width={p.largura} height={p.altura} rx={raio} fill={cor(p.cor)} {...borda} />
    }
    if (p.forma === 'poli') return <polygon key={i} points={p.pontos.map((q) => `${q.x},${q.y}`).join(' ')} fill={cor(p.cor)} strokeLinejoin="round" {...borda} />
    if (p.forma === 'circulo') return <circle key={i} cx={p.x} cy={p.y} r={p.raio} fill={cor(p.cor)} {...borda} />
    if (p.forma === 'linha') return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={cor(p.cor)} strokeWidth={p.espessura} strokeLinecap="round" />
    return null
  })
}

export default function BonecoEmBlocos({ pecas, tamanho = 70, className = '', rotulo }) {
  const meio = tamanho / 2
  return (
    <svg className={`boneco-em-blocos ${className}`} viewBox={`${-meio} ${-meio} ${tamanho} ${tamanho}`} role={rotulo ? 'img' : undefined} aria-label={rotulo} aria-hidden={rotulo ? undefined : true}>
      <FormasEmBlocos pecas={pecas} />
    </svg>
  )
}
