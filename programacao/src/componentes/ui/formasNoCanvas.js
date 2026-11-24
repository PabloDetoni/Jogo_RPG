// Pinta as formas de um boneco em blocos (regras/bonecos.js: "ret", "poli", "circulo" e "linha") num canvas 2D, fora
// da partida (Parte 10: a pesca do Lago). É o mesmo desenho que a partida faz no Phaser (jogo/desenhoEmBlocos.js).
// escala: o tamanho do desenho; dx, dy: onde fica o meio do boneco.
const cor = (numero) => `#${numero.toString(16).padStart(6, '0')}`

export function pintarFormasNoCanvas(ctx, pecas, escala, dx = 0, dy = 0) {
  const X = (x) => x * escala + dx
  const Y = (y) => y * escala + dy
  ctx.lineJoin = 'round'
  for (const p of pecas) {
    ctx.beginPath()
    if (p.forma === 'ret') {
      const raio = Math.max(0, Math.min(p.raio ?? 0, p.largura / 2, p.altura / 2)) * escala
      ctx.roundRect(X(p.x), Y(p.y), p.largura * escala, p.altura * escala, raio)
    } else if (p.forma === 'poli') {
      p.pontos.forEach((ponto, i) => (i === 0 ? ctx.moveTo(X(ponto.x), Y(ponto.y)) : ctx.lineTo(X(ponto.x), Y(ponto.y))))
      ctx.closePath()
    } else if (p.forma === 'circulo') {
      ctx.arc(X(p.x), Y(p.y), p.raio * escala, 0, Math.PI * 2)
    } else if (p.forma === 'linha') {
      ctx.strokeStyle = cor(p.cor)
      ctx.lineWidth = p.espessura * escala
      ctx.lineCap = 'round'
      ctx.moveTo(X(p.x1), Y(p.y1))
      ctx.lineTo(X(p.x2), Y(p.y2))
      ctx.stroke()
      continue
    }
    ctx.fillStyle = cor(p.cor)
    ctx.fill()
    if (p.contorno) {
      ctx.strokeStyle = cor(p.corDoContorno)
      ctx.lineWidth = p.espessura * escala
      ctx.stroke()
    }
  }
}
