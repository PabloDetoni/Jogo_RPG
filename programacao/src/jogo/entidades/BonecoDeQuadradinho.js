import { armasDosBonecos, pecasDoBoneco, poseDosBonecos, receitasDosBonecos } from '../../dados/bonecos.js'
import { corDaClasse } from '../../dados/classes.js'
import { balancoDoBoneco, ladoDoCorpo, poseDoAtaque, poseDoBraco, puxadaDaCorda } from '../../regras/bonecos.js'
import { cargaAtual } from '../arco.js'

// Boneco de quadradinho de um personagem (RNF15, Parte 2 de 11/2026): cabeça grande, corpo, a saia na cor da classe,
// duas perninhas e dois bracinhos; uma mão segura a arma e a outra fica para baixo, balançando. Tudo num Graphics só,
// redesenhado a cada quadro dentro do container do personagem (visual): a posição, o tombo de quem cai e o piscar
// continuam com a Entidade. A hitbox não muda (corpo 32%; a área de golpe é o retângulo do tamanho).
// As contas da pose (o lado, o braço que segue a mira, a arma atrás ou na frente, o balanço e o golpe) ficam em
// regras/bonecos.js; as cores e medidas em dados/bonecos.js. Quando a imagem da classe existir (usarArte), ela
// substitui o boneco inteiro.

const { cabeca, corpo, saia, perna, braco, olho, contorno } = pecasDoBoneco

// Mistura uma cor com o preto (fracao 0 = igual, 1 = preto)
function escurecer(cor, fracao) {
  const r = (cor >> 16) & 0xff
  const g = (cor >> 8) & 0xff
  const b = cor & 0xff
  const f = 1 - fracao
  return (Math.round(r * f) << 16) | (Math.round(g * f) << 8) | Math.round(b * f)
}

export default class BonecoDeQuadradinho {
  constructor(cena, dono) {
    this.cena = cena
    this.dono = dono
    this.grafico = cena.add.graphics()
    this.fase = 0
    this.pose = { lado: 'direita', atras: false, anguloDoBraco: 0 }
    this.destaque = null // a cor do piscar (todo o boneco de uma cor só)
  }

  get receita() {
    return receitasDosBonecos[this.dono.classe] ?? receitasDosBonecos.guerreiro
  }

  // A cor de uma peça agora: o destaque (piscar), escurecida se caído, ou a normal
  cor(cor) {
    if (this.destaque !== null) return this.destaque
    return this.dono.caido ? escurecer(cor, poseDosBonecos.escurecerCaido) : cor
  }

  // Retângulo com o contorno escuro; x e y no canto de cima à esquerda (no sistema do corpo que olha para a direita)
  retangulo(x, y, largura, altura, cor, comContorno = true) {
    const g = this.grafico
    const xi = this.s > 0 ? x : -x - largura
    g.fillStyle(this.cor(cor), 1).fillRect(xi, y, largura, altura)
    if (comContorno) g.lineStyle(contorno.espessura, this.cor(contorno.cor), 1).strokeRect(xi, y, largura, altura)
  }

  // Polígono (pontos no sistema do corpo que olha para a direita)
  poligono(pontos, cor, comContorno = true) {
    const g = this.grafico
    const espelhados = pontos.map((p) => ({ x: p.x * this.s, y: p.y }))
    g.fillStyle(this.cor(cor), 1).fillPoints(espelhados, true)
    if (comContorno) g.lineStyle(contorno.espessura, this.cor(contorno.cor), 1).strokePoints(espelhados, true)
  }

  // Barra girada: de (x, y) na direção do ângulo (dentro do corpo: 0 = frente, π/2 = para baixo)
  barra(x, y, angulo, comprimento, largura, cor, comContorno = true) {
    const dx = Math.cos(angulo)
    const dy = Math.sin(angulo)
    const px = -dy * (largura / 2)
    const py = dx * (largura / 2)
    this.poligono(
      [
        { x: x + px, y: y + py },
        { x: x + dx * comprimento + px, y: y + dy * comprimento + py },
        { x: x + dx * comprimento - px, y: y + dy * comprimento - py },
        { x: x - px, y: y - py },
      ],
      cor,
      comContorno,
    )
    return { x: x + dx * comprimento, y: y + dy * comprimento }
  }

  // A cada quadro (Personagem.atualizarDesenho): andando, o vetor da velocidade; agora, o relógio da cena
  atualizar(agora, delta, andando, velocidade) {
    if (!this.grafico.visible || !this.dono.visual.visible) return
    const { dono } = this
    const arma = this.receita.arma
    this.fase += delta * (andando ? poseDosBonecos.faseAndando : poseDosBonecos.faseParado) * Math.PI * 2 * 0.1
    // Para onde olha: Tanque e Arqueiro sempre pela mira (o braço segue); os outros pela mira enquanto atacam e,
    // fora disso, pelo lado para onde andam
    const fracaoDoGolpe = dono.inicioDoGolpe !== undefined ? (agora - dono.inicioDoGolpe) / poseDosBonecos.msDoAtaque : 1
    const golpeando = fracaoDoGolpe >= 0 && fracaoDoGolpe < 1
    if (arma === 'escudo' || arma === 'arco') {
      this.pose = poseDoBraco(dono.anguloDaMira ?? 0, this.pose)
    } else {
      const angulo = golpeando ? dono.anguloDaMira : andando && Math.abs(velocidade.x) > 15 ? Math.atan2(velocidade.y, velocidade.x) : null
      const lado = angulo === null || angulo === undefined ? this.pose.lado : ladoDoCorpo(angulo, this.pose.lado)
      this.pose = { lado, atras: false, anguloDoBraco: 0 }
    }
    this.s = this.pose.lado === 'esquerda' ? -1 : 1
    this.desenhar(agora, andando && !dono.caido, golpeando ? fracaoDoGolpe : 1)
  }

  desenhar(agora, andando, fracaoDoGolpe) {
    const g = this.grafico
    g.clear()
    const receita = this.receita
    const mexe = balancoDoBoneco(this.fase, andando)
    const y0 = mexe.corpoY
    const golpe = poseDoAtaque(receita.arma, fracaoDoGolpe)

    // A capa (Guerreiro) atrás de tudo
    if (receita.capa) this.retangulo(-corpo.largura / 2 - 3, y0 - 3, corpo.largura - 2, corpo.altura + 8, receita.capa)
    // Pernas: a de trás e a da frente alternam
    this.retangulo(-perna.x - perna.largura / 2 + mexe.pernaDeTras, perna.y + y0 * 0.3, perna.largura, perna.altura, receita.pernas)
    this.retangulo(perna.x - perna.largura / 2 + mexe.pernaDaFrente, perna.y + y0 * 0.3, perna.largura, perna.altura, receita.pernas)
    // Braço livre (do lado de trás): para baixo, balançando; o Arqueiro puxando segura a corda com ele
    const ombroDeTras = { x: -braco.ombroX, y: braco.ombroY + y0 }
    const ombroDaFrente = { x: braco.ombroX, y: braco.ombroY + y0 }
    const corda = receita.arma === 'arco' ? this.pontoDaCorda(agora, ombroDaFrente) : null
    if (corda) {
      const ang = Math.atan2(corda.y - ombroDeTras.y, corda.x - ombroDeTras.x)
      const ate = Math.min(Math.hypot(corda.x - ombroDeTras.x, corda.y - ombroDeTras.y), braco.comprimento + 8)
      this.barra(ombroDeTras.x, ombroDeTras.y, ang, ate, braco.largura, receita.bracos)
    } else {
      this.barra(ombroDeTras.x, ombroDeTras.y, Math.PI / 2 + 0.15 + mexe.bracoLivre, braco.comprimento, braco.largura, receita.bracos)
    }
    // Arma atrás do corpo (mirando para cima)
    if (this.pose.atras) this.bracoDaArma(agora, ombroDaFrente, golpe, mexe, true)
    // Corpo, cinto e a saia na cor da classe
    this.retangulo(-corpo.largura / 2, corpo.y - corpo.altura / 2 + y0, corpo.largura, corpo.altura, receita.corpo)
    this.retangulo(-corpo.largura / 2, corpo.y + corpo.altura / 2 - 3 + y0, corpo.largura, 2, receita.detalhe, false)
    this.retangulo(-saia.largura / 2, saia.y - saia.altura / 2 + y0, saia.largura, saia.altura, corDaClasse(this.dono.classe))
    // Cabeça
    this.desenharCabeca(receita.cabeca, y0)
    // Arma na frente do corpo
    if (!this.pose.atras) this.bracoDaArma(agora, ombroDaFrente, golpe, mexe, false)
  }

  desenharCabeca(chapeu, y0) {
    const yTopo = cabeca.y - cabeca.altura / 2 + y0
    const x0 = -cabeca.largura / 2
    const { largura, altura } = cabeca
    if (chapeu.tipo === 'elmo') {
      // Elmo fechado: cabeça de metal, fenda em T e o penacho vermelho
      this.retangulo(-2, yTopo - 4, 4, 5, chapeu.penacho)
      this.retangulo(x0, yTopo, largura, altura, chapeu.cor)
      this.retangulo(x0 + 4 + olho.frente, olho.y - 1 + y0, largura - 8, 2, chapeu.fenda, false)
      this.retangulo(olho.frente + 1 - 1, olho.y - 1 + y0, 2, 7, chapeu.fenda, false)
      return
    }
    // Rosto
    this.retangulo(x0, yTopo, largura, altura, pecasDoBoneco.pele)
    if (chapeu.tipo === 'cabelo') {
      // Cabelo castanho: o alto da cabeça e a nuca (do lado de trás)
      this.retangulo(x0 + 0.75, yTopo + 0.75, largura - 1.5, 5, chapeu.cor, false)
      this.retangulo(x0 + 0.75, yTopo + 0.75, 5, altura - 7, chapeu.cor, false)
    } else if (chapeu.tipo === 'capuz') {
      // Capuz: cobre o alto e os lados, com a abertura do rosto para o lado que olha
      this.retangulo(x0 - 1, yTopo - 1, largura + 2, altura + 2, chapeu.cor)
      this.retangulo(x0 + 5, yTopo + 5, largura - 8, altura - 7, pecasDoBoneco.pele)
      this.retangulo(x0 + 4, yTopo + 4, largura - 6, 1.5, chapeu.borda, false)
    }
    this.olhos(y0)
    if (chapeu.tipo === 'chapeu') {
      // Chapéu pontudo do Mago: a aba, o cone (a ponta caída para trás) e a faixa dourada
      this.retangulo(x0 - 3, yTopo - 1, largura + 6, 4, chapeu.aba)
      this.poligono(
        [
          { x: x0 + 1, y: yTopo - 1 },
          { x: x0 + largura - 1, y: yTopo - 1 },
          { x: x0 + largura * 0.42, y: yTopo - 9 },
          { x: x0 - 6, y: yTopo - 7 },
        ],
        chapeu.cor,
      )
      this.retangulo(x0 + 1, yTopo - 4, largura - 2, 2, chapeu.faixa, false)
    }
  }

  olhos(y0) {
    const fechados = this.dono.caido
    for (const lado of [-1, 1]) {
      const x = olho.frente + lado * olho.x - olho.largura / 2
      if (fechados) this.retangulo(x - 0.5, olho.y + 1 + y0, olho.largura + 1, 1, pecasDoBoneco.olhos, false)
      else this.retangulo(x, olho.y + y0, olho.largura, olho.altura, pecasDoBoneco.olhos, false)
    }
  }

  // O ponto da corda puxada (Arqueiro puxando), ou null
  pontoDaCorda(agora, ombro) {
    if (!this.dono.puxando || this.dono.caido) return null
    const a = this.pose.anguloDoBraco
    const mao = { x: ombro.x + Math.cos(a) * braco.comprimento, y: ombro.y + Math.sin(a) * braco.comprimento }
    const puxada = puxadaDaCorda(cargaAtual(this.dono, agora))
    return { x: mao.x - Math.cos(a) * (2 + puxada), y: mao.y - Math.sin(a) * (2 + puxada) }
  }

  // O braço da arma e a arma, do ombro da frente
  bracoDaArma(agora, ombro, golpe, mexe, atras) {
    const receita = this.receita
    const arma = armasDosBonecos[receita.arma]
    const descanso = poseDosBonecos.descanso[receita.arma] ?? 0.9
    const seguindoAMira = receita.arma === 'escudo' || receita.arma === 'arco'
    const angulo = (seguindoAMira ? this.pose.anguloDoBraco : descanso + mexe.bracoLivre * 0.3) + golpe.giro
    const comprimento = braco.comprimento + golpe.avanco
    const mao = this.barra(ombro.x, ombro.y, angulo, comprimento, braco.largura, receita.bracos)
    if (receita.arma === 'espada') this.espada(mao, angulo - 1.2, arma)
    else if (receita.arma === 'cajado') this.cajado(mao, golpe, arma)
    else if (receita.arma === 'cetro') this.cetro(mao, golpe, arma, agora)
    else if (receita.arma === 'escudo') this.escudo(mao, angulo, arma, atras)
    else if (receita.arma === 'arco') this.arco(mao, angulo, arma, agora)
    // a mão
    this.retangulo(mao.x - 2, mao.y - 2, 4, 4, pecasDoBoneco.pele)
  }

  // Espada de verdade: cabo, guarda dourada, lâmina com brilho e ponta
  espada(mao, angulo, arma) {
    const dx = Math.cos(angulo)
    const dy = Math.sin(angulo)
    this.barra(mao.x - dx * arma.comprimentoDoCabo, mao.y - dy * arma.comprimentoDoCabo, angulo, arma.comprimentoDoCabo + 1, 3, arma.cabo)
    this.retangulo(mao.x - dx * (arma.comprimentoDoCabo + 1) - 1.5, mao.y - dy * (arma.comprimentoDoCabo + 1) - 1.5, 3, 3, arma.pomo, false)
    const inicio = { x: mao.x + dx * 2, y: mao.y + dy * 2 }
    this.barra(inicio.x - (-dy) * (arma.guardaLargura / 2), inicio.y - dx * (arma.guardaLargura / 2), angulo + Math.PI / 2, arma.guardaLargura, 2.5, arma.guarda)
    const fim = this.barra(inicio.x, inicio.y, angulo, arma.comprimento, arma.largura, arma.lamina)
    // ponta
    const px = -dy * (arma.largura / 2)
    const py = dx * (arma.largura / 2)
    this.poligono(
      [
        { x: fim.x + px, y: fim.y + py },
        { x: fim.x + dx * 5, y: fim.y + dy * 5 },
        { x: fim.x - px, y: fim.y - py },
      ],
      arma.lamina,
    )
    // brilho no meio da lâmina
    this.barra(inicio.x + dx * 2, inicio.y + dy * 2, angulo, arma.comprimento - 4, 1, arma.brilho, false)
  }

  // Cajado de madeira, em pé na mão (inclina para a frente no golpe), com a ponta mais grossa
  cajado(mao, golpe, arma) {
    const inclinacao = -Math.PI / 2 + golpe.giro * -0.5
    const baixo = { x: mao.x - Math.cos(inclinacao) * 10, y: mao.y - Math.sin(inclinacao) * 10 }
    const topo = this.barra(baixo.x, baixo.y, inclinacao, arma.comprimento, arma.largura, arma.madeira)
    this.retangulo(topo.x - 3, topo.y - 3, 6, 5, arma.ponta)
  }

  // Cetro dourado com a orbe em cima (que brilha de leve)
  cetro(mao, golpe, arma, agora) {
    const inclinacao = -Math.PI / 2 + golpe.giro * -0.5
    const baixo = { x: mao.x - Math.cos(inclinacao) * 7, y: mao.y - Math.sin(inclinacao) * 7 }
    const topo = this.barra(baixo.x, baixo.y, inclinacao, arma.comprimento, arma.largura, arma.haste)
    const r = arma.raioDaOrbe
    const centro = { x: topo.x + Math.cos(inclinacao) * r, y: topo.y + Math.sin(inclinacao) * r }
    this.retangulo(topo.x - 3, topo.y - 1.5, 6, 2.5, arma.aro, false)
    // octógono (a orbe não precisa ser esfera perfeita)
    const pontos = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8
      pontos.push({ x: centro.x + Math.cos(a) * r, y: centro.y + Math.sin(a) * r })
    }
    this.poligono(pontos, arma.orbe)
    const pulso = 0.6 + 0.4 * Math.sin(agora / 220)
    if (this.destaque === null && !this.dono.caido) this.grafico.fillStyle(arma.brilho, pulso).fillRect(centro.x * this.s - 2, centro.y - 2.5, 2, 2)
  }

  // Escudo em pé na mão do Tanque (o braço segue a mira); visto de trás quando a mira aponta para cima. A área que
  // bloqueia continua a do jogo/ataques/escudo.js; aqui é só o desenho (com o avanço do empurrão e o tremor).
  escudo(mao, angulo, arma, atras) {
    const doEscudo = this.dono.escudo
    const tremor = doEscudo?.tremor?.forca ?? 0
    const balanco = tremor > 0 ? Math.sin(this.cena.agora / 16) * tremor * 3 : 0
    const avanco = (doEscudo?.avanco?.distancia ?? 0) * 0.3
    const cx = mao.x + Math.cos(angulo) * (arma.distancia * 0.4 + avanco) + balanco
    const cy = mao.y + Math.sin(angulo) * (arma.distancia * 0.4 + avanco)
    const w = arma.largura
    const h = arma.altura
    const forma = [
      { x: cx - w / 2, y: cy - h / 2 },
      { x: cx + w / 2, y: cy - h / 2 },
      { x: cx + w / 2, y: cy + h * 0.1 },
      { x: cx, y: cy + h / 2 },
      { x: cx - w / 2, y: cy + h * 0.1 },
    ]
    const rompido = tremor > 0.05
    if (atras) {
      this.poligono(forma, rompido ? arma.rompido : arma.costas)
      this.retangulo(cx - 1, cy - h / 2 + 3, 2, h - 8, arma.borda, false)
      return
    }
    this.poligono(forma, arma.borda)
    const dentro = forma.map((p) => ({ x: cx + (p.x - cx) * 0.78, y: cy + (p.y - cy) * 0.8 }))
    this.poligono(dentro, rompido ? arma.rompido : arma.frente, false)
    // emblema: uma cruz dourada
    this.retangulo(cx - 1, cy - 6, 2, 10, arma.emblema, false)
    this.retangulo(cx - 4, cy - 3, 8, 2, arma.emblema, false)
  }

  // Arco do Arqueiro: perpendicular ao braço, curvado para a frente, com a corda que estica na carga (e a flecha)
  arco(mao, angulo, arma, agora) {
    const dx = Math.cos(angulo)
    const dy = Math.sin(angulo)
    const px = -dy
    const py = dx
    const metade = arma.altura / 2
    const pontos = []
    for (let i = 0; i <= 8; i++) {
      const t = i / 4 - 1
      const curva = arma.curva * (1 - t * t)
      pontos.push({ x: mao.x + px * t * metade + dx * curva, y: mao.y + py * t * metade + dy * curva })
    }
    // a madeira (uma linha grossa pelos pontos) com contorno
    const g = this.grafico
    const espelhados = pontos.map((p) => ({ x: p.x * this.s, y: p.y }))
    g.lineStyle(4.5, this.cor(contorno.cor), 1).strokePoints(espelhados, false)
    g.lineStyle(2.5, this.cor(arma.madeira), 1).strokePoints(espelhados, false)
    const ponta1 = espelhados[0]
    const ponta2 = espelhados[espelhados.length - 1]
    const corda = this.pontoDaCordaNoMundo(mao, dx, dy, agora)
    g.lineStyle(1, this.cor(arma.corda), 1)
    g.lineBetween(ponta1.x, ponta1.y, corda.x, corda.y)
    g.lineBetween(corda.x, corda.y, ponta2.x, ponta2.y)
    if (this.dono.puxando && !this.dono.caido) {
      // a flecha armada, da corda até a frente do arco
      const frente = { x: (mao.x + dx * (arma.curva + 5)) * this.s, y: mao.y + dy * (arma.curva + 5) }
      g.lineStyle(1.5, this.cor(arma.flecha), 1).lineBetween(corda.x, corda.y, frente.x, frente.y)
      g.fillStyle(this.cor(arma.ponta), 1).fillCircle(frente.x, frente.y, 1.6)
    }
  }

  pontoDaCordaNoMundo(mao, dx, dy, agora) {
    const puxada = this.dono.puxando && !this.dono.caido ? puxadaDaCorda(cargaAtual(this.dono, agora)) : 0
    return { x: (mao.x - dx * (1 + puxada)) * this.s, y: mao.y - dy * (1 + puxada) }
  }

  definirVisivel(visivel) {
    this.grafico.setVisible(visivel)
    if (!visivel) this.grafico.clear()
  }

  destruir() {
    this.grafico.destroy()
  }
}
