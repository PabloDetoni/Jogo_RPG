import * as Phaser from 'phaser'
import { poseDosBonecos } from '../dados/bonecos.js'
import { ladoDoCorpo, poseEmQuadros, socoDoAtaque } from '../regras/bonecos.js'

// Desenho em blocos na partida (RNF15; Parte 4 de 11/2026): uma imagem dentro do container da entidade (visual).
// DESEMPENHO: redesenhar as formas a cada quadro, para 25 bonecos e bichos, derrubava a Floresta de 56 para 35 FPS no
// pior cenário. Então cada pose é desenhada UMA vez numa textura (guardada pelo nome: a espécie, o lado, o quadro do
// balanço, o soquinho...) e o boneco só troca a textura da imagem quando a pose muda (regras/bonecos.js, poseEmQuadros).
// O piscar é um tint de preencher; o escurecer de quem caiu, um tint de multiplicar. A posição, o tombo de quem cai e as
// deformações continuam com a Entidade; a hitbox não muda. Fora da tela, não troca nada.
// opcoes: { gerarPecas(pose) → formas, chave(): o nome da espécie (ex.: 'boneco:mago'), escala, olharPelaMira }

// Pinta uma lista de formas num Graphics do Phaser, com a origem deslocada (dx, dy)
export function pintarPecas(grafico, pecas, escala, dx = 0, dy = 0) {
  const X = (x) => x * escala + dx
  const Y = (y) => y * escala + dy
  for (const p of pecas) {
    if (p.forma === 'ret') {
      const raio = Math.max(0, Math.min(p.raio ?? 0, p.largura / 2, p.altura / 2)) * escala
      grafico.fillStyle(p.cor, 1).fillRoundedRect(X(p.x), Y(p.y), p.largura * escala, p.altura * escala, raio)
      if (p.contorno) grafico.lineStyle(p.espessura, p.corDoContorno, 1).strokeRoundedRect(X(p.x), Y(p.y), p.largura * escala, p.altura * escala, raio)
    } else if (p.forma === 'poli') {
      const pontos = p.pontos.map((ponto) => ({ x: X(ponto.x), y: Y(ponto.y) }))
      grafico.fillStyle(p.cor, 1).fillPoints(pontos, true)
      if (p.contorno) grafico.lineStyle(p.espessura, p.corDoContorno, 1).strokePoints(pontos, true)
    } else if (p.forma === 'circulo') {
      grafico.fillStyle(p.cor, 1).fillCircle(X(p.x), Y(p.y), p.raio * escala)
      if (p.contorno) grafico.lineStyle(p.espessura, p.corDoContorno, 1).strokeCircle(X(p.x), Y(p.y), p.raio * escala)
    } else if (p.forma === 'linha') {
      grafico.lineStyle(p.espessura * escala, p.cor, 1).lineBetween(X(p.x1), Y(p.y1), X(p.x2), Y(p.y2))
    }
  }
}

// O tamanho (px) do quadro de cada textura: cabe o boneco inteiro com o chapéu e a folga do soquinho
const ladoDaTextura = (escala) => Math.ceil(poseDosBonecos.ladoDaTextura * escala)

export default class DesenhoEmBlocos {
  constructor(cena, dono, { gerarPecas, chave, escala = 1, olharPelaMira = false }) {
    this.cena = cena
    this.dono = dono
    this.gerarPecas = gerarPecas
    this.chave = chave
    this.escala = escala
    this.olharPelaMira = olharPelaMira
    // (o nome "grafico" ficou da primeira versão: é a imagem do desenho)
    this.grafico = cena.add.image(0, 0, '__DEFAULT')
    this.fase = Math.random() * Math.PI * 2 // cada um balança no seu tempo
    this.lado = 'direita'
    this.destaque = null // a cor do piscar (todo o desenho de uma cor só)
    this.nomeAtual = null
  }

  // A textura da pose: feita na primeira vez que aparece, guardada para sempre (o nome diz tudo o que muda o desenho)
  textura(pose) {
    const nome = `blocos:${this.chave()}:${this.escala.toFixed(2)}:${pose.nome}`
    if (!this.cena.textures.exists(nome)) {
      const lado = ladoDaTextura(this.escala)
      const pincel = this.cena.pincelDosBlocos ?? (this.cena.pincelDosBlocos = this.cena.make.graphics({}, false))
      pincel.clear()
      pintarPecas(pincel, this.gerarPecas(pose), this.escala, lado / 2, lado / 2)
      pincel.generateTexture(nome, lado, lado)
    }
    return nome
  }

  // A cada quadro (Entidade.atualizarDesenho): andando, o vetor da velocidade; agora, o relógio da cena
  atualizar(agora, delta, andando, velocidade) {
    const { dono } = this
    this.fase += delta * (andando ? poseDosBonecos.faseAndando : poseDosBonecos.faseParado) * Math.PI * 2
    if (!this.grafico.visible || !dono.visual.visible) return
    const fracaoDoGolpe = dono.inicioDoGolpe !== undefined ? (agora - dono.inicioDoGolpe) / poseDosBonecos.msDoAtaque : 1
    const atacando = this.olharPelaMira && ((fracaoDoGolpe >= 0 && fracaoDoGolpe < 1) || Boolean(dono.puxando))
    const angulo = atacando ? dono.anguloDaMira : andando && Math.abs(velocidade.x) > 15 ? Math.atan2(velocidade.y, velocidade.x) : null
    if (angulo !== null && angulo !== undefined) this.lado = ladoDoCorpo(angulo, this.lado)
    const pose = poseEmQuadros({
      lado: this.lado,
      fase: this.fase,
      andando: andando && !dono.caido,
      caido: Boolean(dono.caido),
      soco: this.olharPelaMira ? { angulo: dono.anguloDaMira ?? 0, avanco: socoDoAtaque(fracaoDoGolpe) } : null,
    })
    const nome = this.textura(pose)
    if (nome !== this.nomeAtual) {
      this.grafico.setTexture(nome)
      this.nomeAtual = nome
    }
    this.pintar()
  }

  // O piscar (preenche de uma cor) e o escurecer de quem caiu (multiplica)
  pintar() {
    if (this.destaque !== null) this.grafico.setTint(this.destaque).setTintMode(Phaser.TintModes.FILL)
    else if (this.dono.caido) this.grafico.setTint(poseDosBonecos.tintDoCaido).setTintMode(Phaser.TintModes.MULTIPLY)
    else this.grafico.clearTint()
  }

  definirVisivel(visivel) {
    this.grafico.setVisible(visivel)
  }

  destruir() {
    this.grafico.destroy()
  }
}
