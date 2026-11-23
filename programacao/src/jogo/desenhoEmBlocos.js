import { poseDosBonecos } from '../dados/bonecos.js'
import { escurecer, ladoDoCorpo, socoDoAtaque } from '../regras/bonecos.js'

// Desenho em blocos na partida (RNF15; Parte 4 de 11/2026): um Graphics dentro do container da entidade (visual),
// redesenhado a cada quadro com as formas que a regra pura devolve (regras/bonecos.js: pecasDoBoneco, pecasDoBicho).
// A posição, o tombo de quem cai e as deformações continuam com a Entidade; a hitbox não muda. Fora da tela, não desenha.
// gerarPecas(pose) → lista de formas; escala: px da tela por px da receita.

// Pinta uma lista de formas num Graphics do Phaser. corFinal(cor) aplica o piscar e o escurecer de quem caiu.
export function pintarPecas(grafico, pecas, escala, corFinal = (cor) => cor) {
  for (const p of pecas) {
    if (p.forma === 'ret') {
      const raio = Math.max(0, Math.min(p.raio ?? 0, p.largura / 2, p.altura / 2)) * escala
      grafico.fillStyle(corFinal(p.cor), 1).fillRoundedRect(p.x * escala, p.y * escala, p.largura * escala, p.altura * escala, raio)
      if (p.contorno) grafico.lineStyle(p.espessura, corFinal(p.corDoContorno), 1).strokeRoundedRect(p.x * escala, p.y * escala, p.largura * escala, p.altura * escala, raio)
    } else if (p.forma === 'poli') {
      const pontos = p.pontos.map((ponto) => ({ x: ponto.x * escala, y: ponto.y * escala }))
      grafico.fillStyle(corFinal(p.cor), 1).fillPoints(pontos, true)
      if (p.contorno) grafico.lineStyle(p.espessura, corFinal(p.corDoContorno), 1).strokePoints(pontos, true)
    } else if (p.forma === 'circulo') {
      grafico.fillStyle(corFinal(p.cor), 1).fillCircle(p.x * escala, p.y * escala, p.raio * escala)
      if (p.contorno) grafico.lineStyle(p.espessura, corFinal(p.corDoContorno), 1).strokeCircle(p.x * escala, p.y * escala, p.raio * escala)
    } else if (p.forma === 'linha') {
      grafico.lineStyle(p.espessura * escala, corFinal(p.cor), 1).lineBetween(p.x1 * escala, p.y1 * escala, p.x2 * escala, p.y2 * escala)
    }
  }
}

export default class DesenhoEmBlocos {
  // olharPelaMira: Líder e aliados olham para a mira quando atacam (e o "soquinho" vai para lá); os bichos, só para onde andam
  constructor(cena, dono, { gerarPecas, escala = 1, olharPelaMira = false }) {
    this.cena = cena
    this.dono = dono
    this.gerarPecas = gerarPecas
    this.escala = escala
    this.olharPelaMira = olharPelaMira
    this.grafico = cena.add.graphics()
    this.fase = Math.random() * Math.PI * 2 // cada um balança no seu tempo
    this.lado = 'direita'
    this.destaque = null // a cor do piscar (todo o desenho de uma cor só)
  }

  corFinal = (cor) => {
    if (this.destaque !== null) return this.destaque
    return this.dono.caido ? escurecer(cor, poseDosBonecos.escurecerCaido) : cor
  }

  // A cada quadro (Entidade.atualizarDesenho): andando, o vetor da velocidade; agora, o relógio da cena
  atualizar(agora, delta, andando, velocidade) {
    if (!this.grafico.visible || !this.dono.visual.visible) return
    const { dono } = this
    this.fase += delta * (andando ? poseDosBonecos.faseAndando : poseDosBonecos.faseParado) * Math.PI * 2
    const fracaoDoGolpe = dono.inicioDoGolpe !== undefined ? (agora - dono.inicioDoGolpe) / poseDosBonecos.msDoAtaque : 1
    const atacando = this.olharPelaMira && ((fracaoDoGolpe >= 0 && fracaoDoGolpe < 1) || Boolean(dono.puxando))
    const angulo = atacando ? dono.anguloDaMira : andando && Math.abs(velocidade.x) > 15 ? Math.atan2(velocidade.y, velocidade.x) : null
    if (angulo !== null && angulo !== undefined) this.lado = ladoDoCorpo(angulo, this.lado)
    const soco = this.olharPelaMira ? { angulo: dono.anguloDaMira ?? 0, avanco: socoDoAtaque(fracaoDoGolpe) } : null
    const pecas = this.gerarPecas({ lado: this.lado, fase: this.fase, andando: andando && !dono.caido, caido: Boolean(dono.caido), soco })
    this.grafico.clear()
    pintarPecas(this.grafico, pecas, this.escala, this.corFinal)
  }

  definirVisivel(visivel) {
    this.grafico.setVisible(visivel)
    if (!visivel) this.grafico.clear()
  }

  destruir() {
    this.grafico.destroy()
  }
}
