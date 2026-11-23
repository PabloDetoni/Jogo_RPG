import { bichosEmBlocos, chapeusDasClasses, coresDosChapeus, medidasDoBoneco, poseDosBonecos } from '../dados/bonecos.js'

// Bonecos em blocos (RNF15; Parte 4 de 11/2026). Funções puras: devolvem a lista de formas de um boneco ou de um bicho
// numa pose. Quem desenha (o Phaser na partida, jogo/desenhoEmBlocos.js; o canvas do React nos NPCs e na pesca) só pinta
// a lista, na ordem (a primeira fica atrás). Uma forma é:
//   { forma: 'ret', x, y, largura, altura, raio, cor, contorno }   (x e y no canto de cima à esquerda)
//   { forma: 'poli', pontos: [{ x, y }], cor, contorno }
//   { forma: 'linha', x1, y1, x2, y2, espessura, cor }
//   { forma: 'circulo', x, y, raio, cor, contorno }
// Coordenadas em px no tamanho de referência, centro (0, 0), y para baixo. O lado esquerdo já vem espelhado.
// Ângulos em radianos, no sistema da tela: 0 = direita, -π/2 = para cima.

const normalizar = (angulo) => Math.atan2(Math.sin(angulo), Math.cos(angulo))

// Mistura uma cor com o preto (fracao 0 = igual, 1 = preto)
export function escurecer(cor, fracao) {
  const f = 1 - Math.min(1, Math.max(0, fracao))
  const r = Math.round(((cor >> 16) & 0xff) * f)
  const g = Math.round(((cor >> 8) & 0xff) * f)
  const b = Math.round((cor & 0xff) * f)
  return (r << 16) | (g << 8) | b
}

// Para que lado o corpo olha ('direita' ou 'esquerda'), pela direção (o cosseno). Perto da vertical (|cos| pequeno)
// fica como estava: a "viradinha" só acontece longe da vertical, sem pisca-pisca.
export function ladoDoCorpo(angulo, ladoAnterior = 'direita', histerese = poseDosBonecos.histereseDoLado) {
  const cosseno = Math.cos(angulo)
  if (cosseno > histerese) return 'direita'
  if (cosseno < -histerese) return 'esquerda'
  return ladoAnterior
}

// O ângulo da mira visto de dentro do corpo, que olha para a direita (no lado esquerdo, o desenho é espelhado)
export function anguloNoCorpo(angulo, lado) {
  return normalizar(lado === 'esquerda' ? Math.PI - angulo : angulo)
}

// Balanço: parado, um sobe e desce suave; andando, os pés alternam (vão e voltam, e o que vai sobe um pouco), o corpo
// sobe e desce e as mãos balançam. fase cresce com o tempo (mais depressa andando).
export function balancoDoBoneco(fase, andando, config = poseDosBonecos) {
  if (!andando) {
    const respira = Math.sin(fase)
    return { peDaFrente: 0, peDeTras: 0, levantaFrente: 0, levantaTras: 0, corpoY: respira * config.parado.corpo, maoY: Math.sin(fase + 0.8) * config.parado.mao, maoX: 0 }
  }
  const passo = Math.sin(fase)
  return {
    peDaFrente: passo * config.andando.pe,
    peDeTras: -passo * config.andando.pe,
    levantaFrente: Math.max(0, passo) * config.andando.levanta,
    levantaTras: Math.max(0, -passo) * config.andando.levanta,
    corpoY: -Math.abs(Math.cos(fase)) * config.andando.corpo,
    maoY: -Math.abs(Math.cos(fase)) * config.andando.corpo,
    maoX: passo * config.andando.mao,
  }
}

// O "soquinho" do ataque: quantos px a mão vai na direção da mira, pela fração do tempo do golpe (0 = começou,
// 1 = acabou). Vai depressa até o pico e volta devagar. Fora do golpe, 0.
export function socoDoAtaque(fracao, config = poseDosBonecos.soco) {
  if (!(fracao >= 0 && fracao < 1)) return 0
  const ida = fracao < config.pico ? fracao / config.pico : 1 - (fracao - config.pico) / (1 - config.pico)
  return config.distancia * ida
}

// A pose reduzida a poucos quadros (jogo/desenhoEmBlocos.js guarda uma textura por quadro): o balanço em
// quadrosDoBalanco passos por volta; o soquinho em niveisDoSoco níveis e 8 direções (durante o soquinho, o resto fica
// parado); caído, sem balanço. Devolve a pose para pecasDoBoneco/pecasDoBicho e o "nome" do quadro.
export function poseEmQuadros({ lado = 'direita', fase = 0, andando = false, caido = false, soco = null }, config = poseDosBonecos) {
  const volta = Math.PI * 2
  const q = config.quadrosDoBalanco
  const quadro = Math.floor(((((fase % volta) + volta) % volta) / volta) * q) % q
  let nivel = 0
  let direcao = 0
  if (!caido && soco && soco.avanco > 0) {
    nivel = Math.min(config.niveisDoSoco, Math.max(1, Math.round((soco.avanco / config.soco.distancia) * config.niveisDoSoco)))
    direcao = (((Math.round(soco.angulo / (Math.PI / 4)) % 8) + 8) % 8)
  }
  const parado = caido || nivel > 0
  return {
    lado,
    caido,
    andando: andando && !parado,
    fase: parado ? 0 : ((quadro + 0.5) * volta) / q,
    soco: nivel > 0 ? { angulo: (direcao * Math.PI) / 4, avanco: (nivel / config.niveisDoSoco) * config.soco.distancia } : null,
    nome: `${lado === 'esquerda' ? 'e' : 'd'}${caido ? 'c' : ''}${andando && !parado ? 'a' : 'p'}${parado ? '' : quadro}${nivel > 0 ? `s${nivel}d${direcao}` : ''}`,
  }
}

// ---------- O boneco (personagens; depois goblins, Orc, Ogro e NPCs no mesmo formato) ----------

// pose: { lado, fase, andando, caido, soco: { angulo, avanco } (angulo no sistema da tela), escala }
// boneco: { cor, chapeu } (chapeu: um id de coresDosChapeus ou null)
export function pecasDoBoneco({ cor, chapeu = null }, { lado = 'direita', fase = 0, andando = false, caido = false, soco = null } = {}, medidas = medidasDoBoneco) {
  const s = lado === 'esquerda' ? -1 : 1
  const { cabeca, tronco, mao, pe, olho, contorno } = medidas
  const mexe = balancoDoBoneco(fase, andando && !caido)
  const y0 = mexe.corpoY
  const pecas = []
  const ret = (x, y, largura, altura, raio, corDaPeca, comContorno = true) =>
    pecas.push({ forma: 'ret', x: s > 0 ? x : -x - largura, y, largura, altura, raio, cor: corDaPeca, contorno: comContorno })
  const poli = (pontos, corDaPeca, comContorno = true) => pecas.push({ forma: 'poli', pontos: pontos.map((p) => ({ x: p.x * s, y: p.y })), cor: corDaPeca, contorno: comContorno })

  // Pés flutuando (o de trás primeiro)
  ret(-pe.x - pe.largura / 2 + mexe.peDeTras, pe.y - mexe.levantaTras, pe.largura, pe.altura, pe.raio, cor)
  ret(pe.x - pe.largura / 2 + mexe.peDaFrente, pe.y - mexe.levantaFrente, pe.largura, pe.altura, pe.raio, cor)
  // Mão de trás (atrás do tronco)
  ret(-mao.x - mao.lado / 2 - mexe.maoX, mao.y + mexe.maoY, mao.lado, mao.lado, mao.raio, cor)
  // Tronco, encostado embaixo da cabeça
  ret(-tronco.largura / 2, tronco.y - tronco.altura / 2 + y0, tronco.largura, tronco.altura, tronco.raio, cor)
  // Cabeça e corpo juntos (o quadrado grande)
  const topo = cabeca.y - cabeca.altura / 2 + y0
  ret(-cabeca.largura / 2, topo, cabeca.largura, cabeca.altura, cabeca.raio, cor)
  // Olhos (fechados quando caído); o elmo cobre o rosto e tem a fenda no lugar dos olhos
  if (chapeu !== 'elmo') {
    for (const lado of [-1, 1]) {
      const x = olho.frente + lado * olho.x - olho.largura / 2
      if (caido) ret(x - 0.5, olho.y + 1.5 + y0, olho.largura + 1, 1.2, 0.5, medidas.olhos, false)
      else ret(x, olho.y - olho.altura / 2 + y0, olho.largura, olho.altura, 1, medidas.olhos, false)
    }
  }
  pecasDoChapeu(chapeu, cor, { topo, y0, ret, poli, medidas })
  // Mão da frente: o "soquinho" vai na direção da mira
  let mx = mao.x + mexe.maoX
  let my = mao.y + mexe.maoY
  if (soco && soco.avanco > 0) {
    const a = anguloNoCorpo(soco.angulo, lado)
    mx += Math.cos(a) * soco.avanco
    my += Math.sin(a) * soco.avanco
  }
  ret(mx - mao.lado / 2, my, mao.lado, mao.lado, mao.raio, cor)
  // contorno: quem pinta usa a espessura e a cor de medidas.contorno
  return pecas.map((p) => (p.contorno ? { ...p, espessura: contorno.espessura, corDoContorno: contorno.cor } : p))
}

function pecasDoChapeu(chapeu, cor, { topo, y0, ret, poli, medidas }) {
  if (!chapeu) return
  const { cabeca, olho } = medidas
  const x0 = -cabeca.largura / 2
  const largura = cabeca.largura
  if (chapeu === 'elmo') {
    // Elmo de cavaleiro: a calota de metal por cima da cabeça, a viseira com a fenda e um penachinho
    const c = coresDosChapeus.elmo
    ret(-1.5, topo - 5, 3, 6, 1.5, c.penacho)
    ret(x0 - 1, topo - 1, largura + 2, cabeca.altura * 0.72, cabeca.raio, c.metal)
    ret(x0 + 3, olho.y - 1.5 + y0, largura - 6, 3, 1.2, c.fenda, false)
    ret(olho.frente - 1, olho.y + 1 + y0, 2, 5, 0.8, c.sombra, false)
  } else if (chapeu === 'chapeuDeMago') {
    // Chapéu pontudo: a aba, o cone com a ponta caída para trás e uma estrelinha
    const c = coresDosChapeus.chapeuDeMago
    const escuro = escurecer(cor, c.escurecer)
    poli(
      [
        { x: x0 + 3, y: topo + 1 },
        { x: x0 + largura - 3, y: topo + 1 },
        { x: x0 + largura * 0.45, y: topo - 12 },
        { x: x0 - 3, y: topo - 15 },
      ],
      escuro,
    )
    ret(x0 - 3, topo - 1, largura + 6, 4, 2, escuro)
    ret(x0 + largura * 0.36, topo - 7, 3, 3, 1, c.estrela, false)
  } else if (chapeu === 'mitra') {
    // Mitra de clérigo: alta, branca, com a faixa e a cruz douradas
    const c = coresDosChapeus.mitra
    poli(
      [
        { x: x0 + 3, y: topo + 3 },
        { x: x0 + largura - 3, y: topo + 3 },
        { x: x0 + largura - 5, y: topo - 9 },
        { x: 0, y: topo - 14 },
        { x: x0 + 5, y: topo - 9 },
      ],
      c.pano,
    )
    ret(x0 + 3, topo, largura - 6, 3, 1, c.ouro, false)
    ret(-1, topo - 10, 2, 8, 0.5, c.ouro, false)
    ret(-3.5, topo - 7.5, 7, 2, 0.5, c.ouro, false)
  } else if (chapeu === 'capuz') {
    // Capuz: cobre o alto e a nuca (o lado de trás), deixando o rosto aberto para o lado que olha
    const escuro = escurecer(cor, coresDosChapeus.capuz.escurecer)
    ret(x0 - 1.5, topo - 1.5, largura + 3, 7, cabeca.raio, escuro)
    ret(x0 - 1.5, topo - 1.5, 7, cabeca.altura * 0.85, cabeca.raio, escuro)
    poli(
      [
        { x: x0 + 2, y: topo - 1 },
        { x: x0 - 6, y: topo + 3 },
        { x: x0 + 1, y: topo + 7 },
      ],
      escuro,
    )
  }
}

// O chapéu da classe (dados/bonecos.js)
export const chapeuDaClasse = (classe) => chapeusDasClasses[classe] ?? null

// ---------- Bichos (mobs e animais) ----------

// pose: { lado, fase, andando }
export function pecasDoBicho(tipo, { lado = 'direita', fase = 0, andando = false } = {}, receitas = bichosEmBlocos, medidas = medidasDoBoneco) {
  const receita = receitas[tipo]
  if (!receita) return []
  const s = lado === 'esquerda' ? -1 : 1
  const pecas = []
  const { contorno } = medidas
  const ret = (x, y, largura, altura, raio, cor, comContorno = true) =>
    pecas.push({ forma: 'ret', x: s > 0 ? x : -x - largura, y, largura, altura, raio, cor, contorno: comContorno })
  const poli = (pontos, cor, comContorno = true) => pecas.push({ forma: 'poli', pontos: pontos.map((p) => ({ x: p.x * s, y: p.y })), cor, contorno: comContorno })
  const passo = andando ? Math.sin(fase) : 0
  const respira = andando ? -Math.abs(Math.cos(fase)) * 1.2 : Math.sin(fase) * 0.6

  if (receita.forma === 'aranha') {
    const { corpo, cabeca, patas } = receita
    // Patinhas: 4 de cada lado, cada uma com um joelho, abertas para os lados; mexem andando (e de leve, parada)
    const corDasPatas = escurecer(receita.cor, 0.25)
    for (const ladoDaPata of [-1, 1]) {
      for (let i = 0; i < patas.quantas; i++) {
        const base = ladoDaPata > 0 ? -0.6 + i * patas.abertura * 0.75 : Math.PI + 0.6 - i * patas.abertura * 0.75
        const a = base + Math.sin(fase * (andando ? 1 : 0.4) + i * 1.7 + ladoDaPata) * (andando ? 0.3 : 0.08)
        const joelho = { x: Math.cos(a) * corpo.raio * 1.35, y: corpo.y + Math.sin(a) * corpo.raio * 0.8 - 5 + respira }
        const pe = { x: Math.cos(a) * (corpo.raio + patas.comprimento * 0.75), y: corpo.y + Math.sin(a) * corpo.raio * 0.6 + 7 }
        pecas.push({ forma: 'linha', x1: 0, y1: corpo.y + respira, x2: joelho.x * s, y2: joelho.y, espessura: patas.espessura, cor: corDasPatas })
        pecas.push({ forma: 'linha', x1: joelho.x * s, y1: joelho.y, x2: pe.x * s, y2: pe.y, espessura: patas.espessura, cor: corDasPatas })
      }
    }
    pecas.push({ forma: 'circulo', x: 0, y: corpo.y + respira, raio: corpo.raio, cor: receita.cor, contorno: true, espessura: contorno.espessura, corDoContorno: contorno.cor })
    pecas.push({ forma: 'circulo', x: cabeca.x * s, y: cabeca.y + respira, raio: cabeca.raio, cor: escurecer(receita.cor, 0.15), contorno: true, espessura: contorno.espessura, corDoContorno: contorno.cor })
    ret(cabeca.x + 1, cabeca.y - 2 + respira, 2, 2, 0.5, receita.olhos, false)
    ret(cabeca.x + 3.5, cabeca.y - 1 + respira, 2, 2, 0.5, receita.olhos, false)
    return pecas
  }

  // Quadrúpede: os pés de trás, o rabo, o corpo deitado, a barriga, a cabeça com o detalhe e o olho
  const { corpo, cabeca, pes, rabo, cor, barriga } = receita
  pes.xs.forEach((x, i) => {
    const alterna = i % 2 === 0 ? passo : -passo
    ret(x - pes.largura / 2 + alterna * 1.5, pes.y - Math.max(0, alterna) * 1.4, pes.largura, pes.altura, pes.raio, escurecer(cor, 0.12))
  })
  if (rabo) ret(rabo.x - rabo.largura / 2, rabo.y + respira - rabo.altura / 2, rabo.largura, rabo.altura, rabo.altura / 2, cor)
  ret(-corpo.largura / 2, corpo.y - corpo.altura / 2 + respira, corpo.largura, corpo.altura, corpo.raio, cor)
  ret(-corpo.largura / 2 + 4, corpo.y + corpo.altura / 2 - 5 + respira, corpo.largura - 8, 3, 1.5, barriga, false)
  const topoDaCabeca = cabeca.y - cabeca.altura / 2 + respira
  const xc = cabeca.x - cabeca.largura / 2
  if (receita.detalhe === 'orelhas') {
    poli([{ x: xc + 2, y: topoDaCabeca + 2 }, { x: xc + 4, y: topoDaCabeca - 5 }, { x: xc + 7, y: topoDaCabeca + 1 }], receita.corDoDetalhe)
  } else if (receita.detalhe === 'chifres') {
    pecas.push({ forma: 'linha', x1: (xc + 4) * s, y1: topoDaCabeca, x2: (xc + 2) * s, y2: topoDaCabeca - 8, espessura: 2, cor: receita.corDoDetalhe })
    pecas.push({ forma: 'linha', x1: (xc + 2.8) * s, y1: topoDaCabeca - 4, x2: (xc - 1) * s, y2: topoDaCabeca - 6, espessura: 1.6, cor: receita.corDoDetalhe })
    pecas.push({ forma: 'linha', x1: (xc + 8) * s, y1: topoDaCabeca, x2: (xc + 9) * s, y2: topoDaCabeca - 8, espessura: 2, cor: receita.corDoDetalhe })
  }
  ret(xc, topoDaCabeca, cabeca.largura, cabeca.altura, cabeca.raio, cor)
  if (receita.detalhe === 'presas') {
    ret(xc + cabeca.largura - 4, topoDaCabeca + cabeca.altura - 4, 2.5, 5, 1, receita.corDoDetalhe)
    ret(xc + cabeca.largura - 8.5, topoDaCabeca + cabeca.altura - 3, 2.5, 4, 1, receita.corDoDetalhe)
  }
  // focinho e olho
  ret(xc + cabeca.largura - 3, topoDaCabeca + cabeca.altura * 0.45, 3, 3, 1, escurecer(cor, 0.5), false)
  ret(xc + cabeca.largura * 0.5, topoDaCabeca + cabeca.altura * 0.28, 2.2, 3, 1, medidas.olhos, false)
  return pecas.map((p) => (p.contorno && p.espessura === undefined ? { ...p, espessura: contorno.espessura, corDoContorno: contorno.cor } : p))
}

// A escala de um bicho para o "tamanho" do mob (o desenho foi feito para o tamanho de referência)
export const escalaDoBicho = (tipo, tamanho, receitas = bichosEmBlocos) => (receitas[tipo] ? tamanho / receitas[tipo].tamanhoDeReferencia : 1)
