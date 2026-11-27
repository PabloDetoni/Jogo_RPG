import { useEffect, useRef } from 'react'
import { pintarFormasNoCanvas } from '../../componentes/ui/formasNoCanvas.js'
import { minaDesenhada } from '../../dados/minijogos.js'
import { pecasDoBoneco } from '../../regras/bonecos.js'
import { rachadurasDaPedra } from '../../regras/minijogos.js'

// A Mina desenhada (Parte 11b de 11/2026), como a pesca do Lago: um canvas com a caverna, a pedra e o bonequinho em
// blocos do Líder com a picareta. Cada clique é um golpe: a picareta desce, a pedra racha (uma rachadura por golpe) e
// saem faíscas; no último golpe, a pedra quebra em pedaços e o minério pula para o bonequinho, que anda até a pedra
// nova. As regras são as de sempre (regras/minijogos.js): o canvas só desenha. O botão da pedra fica por cima
// (Minijogo.jsx). Com "reduzir movimento", o bonequinho vai direto, sem faíscas nem pedaços voando.
// pedra: a da regra ({ x, y, golpes }, x e y em % do campo); golpe: { quando, ponto, onde } do último clique (onde: a
// pedra em que bateu); boneco: { cor, chapeu }.
export default function CenaDaMina({ pedra, golpe, boneco }) {
  const canvas = useRef(null)
  const atual = useRef({ pedra, golpe, boneco })
  useEffect(() => {
    atual.current = { pedra, golpe, boneco }
  }, [pedra, golpe, boneco])

  useEffect(() => {
    const quadro = canvas.current
    const ctx = quadro?.getContext('2d')
    if (!ctx) return undefined
    const parado = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const inicial = lugarDoMineiro(naCena(atual.current.pedra))
    // o que só o desenho guarda: onde o bonequinho está, os golpes e as faíscas e pedaços voando
    const mundo = { x: inicial.x, y: inicial.y, lado: inicial.lado, andando: false, ultimo: null, efeitos: [], antes: null, golpeEm: -Infinity }
    let pedido = 0
    const desenhar = (tempo) => {
      const passo = mundo.antes === null ? 0 : Math.min(0.05, (tempo - mundo.antes) / 1000)
      mundo.antes = tempo
      reagir(mundo, atual.current, passo, parado)
      pintarMina(ctx, tempo, atual.current, mundo, parado)
      pedido = requestAnimationFrame(desenhar)
    }
    pedido = requestAnimationFrame(desenhar)
    return () => cancelAnimationFrame(pedido)
  }, [])

  return <canvas ref={canvas} className="cena-do-minijogo" width={minaDesenhada.largura} height={minaDesenhada.altura} aria-hidden="true" />
}

// A pedra em unidades da cena
const naCena = (pedra) => ({ x: ((pedra?.x ?? 50) / 100) * minaDesenhada.largura, y: ((pedra?.y ?? 50) / 100) * minaDesenhada.altura })

// Onde o bonequinho fica para bater: à esquerda da pedra, virado para ela (perto da parede esquerda, do outro lado)
function lugarDoMineiro(centro) {
  const { distancia } = minaDesenhada.boneco
  const pelaEsquerda = centro.x - distancia > 40
  return { x: centro.x + (pelaEsquerda ? -distancia : distancia), y: centro.y + 4, lado: pelaEsquerda ? 'direita' : 'esquerda' }
}

function reagir(mundo, { pedra, golpe }, passo, parado) {
  const agora = performance.now()
  // um golpe novo: faíscas no ponto em que a picareta bateu; se quebrou, os pedaços e o minério
  if (golpe && golpe !== mundo.ultimo) {
    mundo.ultimo = golpe
    mundo.golpeEm = agora
    const onde = naCena(golpe.onde)
    const lado = mundo.x < onde.x ? -1 : 1
    const bate = { x: onde.x + lado * minaDesenhada.raioDaPedra * 0.7, y: onde.y - 6 }
    if (!parado) {
      for (let i = 0; i < minaDesenhada.faiscas; i++) {
        const angulo = -Math.PI / 2 + (Math.random() - 0.5) * 2.2 // um leque para cima
        const velocidade = 160 + Math.random() * 220
        mundo.efeitos.push({ tipo: 'faisca', quando: agora, x: bate.x, y: bate.y, vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade, ate: minaDesenhada.msDasFaiscas })
      }
    }
    if (golpe.ponto) {
      if (!parado) {
        for (let i = 0; i < 6; i++) {
          const angulo = (i / 6) * Math.PI * 2 + Math.random() * 0.5
          mundo.efeitos.push({ tipo: 'pedaco', quando: agora, x: onde.x, y: onde.y, vx: Math.cos(angulo) * 170, vy: Math.sin(angulo) * 170 - 120, giro: Math.random() * 6 - 3, ate: minaDesenhada.msDaQuebra })
        }
      }
      mundo.efeitos.push({ tipo: 'minerio', quando: agora, de: onde, ate: minaDesenhada.msDaQuebra })
    }
  }
  mundo.efeitos = mundo.efeitos.filter((efeito) => agora - efeito.quando < efeito.ate)
  // o bonequinho anda até a pedra de agora (depois de uma quebra, a pedra nova aparece noutro lugar)
  const alvo = lugarDoMineiro(naCena(pedra))
  const dx = alvo.x - mundo.x
  const dy = alvo.y - mundo.y
  const distancia = Math.hypot(dx, dy)
  const anda = parado ? distancia : minaDesenhada.boneco.velocidade * passo
  if (distancia <= anda) {
    mundo.x = alvo.x
    mundo.y = alvo.y
    mundo.lado = alvo.lado
    mundo.andando = false
  } else {
    mundo.x += (dx / distancia) * anda
    mundo.y += (dy / distancia) * anda
    if (Math.abs(dx) > 2) mundo.lado = dx < 0 ? 'esquerda' : 'direita'
    mundo.andando = true
  }
}

function pintarMina(ctx, tempo, { pedra, boneco }, mundo, parado) {
  const { largura, altura, cores, raioDaPedra } = minaDesenhada
  const t = parado ? 0 : tempo / 1000
  const agora = performance.now()
  ctx.clearRect(0, 0, largura, altura)
  // a caverna vista de cima: o chão com pedrinhas, as paredes de rocha em volta e a luz das lanternas
  ctx.fillStyle = cores.fundo
  ctx.fillRect(0, 0, largura, altura)
  ctx.fillStyle = cores.chao
  for (let i = 0; i < 34; i++) {
    const x = (i * 113 + 37) % largura
    const y = (i * 71 + 19) % altura
    ctx.beginPath()
    ctx.ellipse(x, y, 5 + (i % 3) * 2, 3 + (i % 2) * 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = cores.parede
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let x = 0; x <= largura; x += 32) ctx.lineTo(x, 10 + ((x / 32) % 3) * 5)
  for (let y = 0; y <= altura; y += 32) ctx.lineTo(largura - 10 - ((y / 32) % 3) * 5, y)
  for (let x = largura; x >= 0; x -= 32) ctx.lineTo(x, altura - 10 - ((x / 32) % 3) * 5)
  for (let y = altura; y >= 0; y -= 32) ctx.lineTo(10 + ((y / 32) % 3) * 5, y)
  ctx.closePath()
  ctx.rect(largura, 0, -largura, altura)
  ctx.fill('evenodd')
  for (const [lx, ly] of [
    [40, 40],
    [largura - 40, altura - 40],
  ]) {
    const luz = ctx.createRadialGradient(lx, ly, 6, lx, ly, 190)
    luz.addColorStop(0, cores.lanterna)
    luz.addColorStop(1, 'rgba(255, 214, 120, 0)')
    ctx.fillStyle = luz
    ctx.fillRect(0, 0, largura, altura)
    ctx.fillStyle = '#ffd43b'
    ctx.fillRect(lx - 6, ly - 7, 12, 14)
  }

  // a pedra de agora, com as rachaduras de cada golpe dado
  const centro = naCena(pedra)
  pintarPedra(ctx, centro, raioDaPedra, rachadurasDaPedra(pedra), sementeDa(centro))

  // o bonequinho e a picareta (desce no golpe e volta)
  const { escala } = minaDesenhada.boneco
  const pecas = pecasDoBoneco({ cor: boneco.cor, chapeu: boneco.chapeu }, { lado: mundo.lado, fase: t * 6, andando: mundo.andando && !parado })
  pintarFormasNoCanvas(ctx, pecas, escala, mundo.x, mundo.y)
  const desde = agora - mundo.golpeEm
  const descida = desde < minaDesenhada.msDoGolpe ? Math.sin((desde / minaDesenhada.msDoGolpe) * Math.PI) : 0
  pintarPicareta(ctx, mundo, escala, descida)

  // as faíscas, os pedaços da pedra quebrada e o minério pulando para o bonequinho
  for (const efeito of mundo.efeitos) {
    const s = (agora - efeito.quando) / 1000
    const fracao = (agora - efeito.quando) / efeito.ate
    if (efeito.tipo === 'faisca') {
      ctx.globalAlpha = 1 - fracao
      ctx.fillStyle = cores.faisca
      ctx.fillRect(efeito.x + efeito.vx * s - 2, efeito.y + efeito.vy * s + 400 * s * s - 2, 4, 4)
      ctx.globalAlpha = 1
    } else if (efeito.tipo === 'pedaco') {
      ctx.save()
      ctx.globalAlpha = 1 - fracao
      ctx.translate(efeito.x + efeito.vx * s, efeito.y + efeito.vy * s + 500 * s * s)
      ctx.rotate(efeito.giro * s)
      ctx.fillStyle = cores.pedra
      ctx.strokeStyle = cores.contorno
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-9, -6)
      ctx.lineTo(8, -8)
      ctx.lineTo(10, 6)
      ctx.lineTo(-6, 9)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    } else if (efeito.tipo === 'minerio') {
      const f = parado ? 0.5 : fracao
      // vai até o bonequinho, onde ele estiver (ele já anda para a pedra nova)
      const para = { x: mundo.x, y: mundo.y - 30 }
      const x = efeito.de.x + (para.x - efeito.de.x) * f
      const y = efeito.de.y + (para.y - efeito.de.y) * f - Math.sin(f * Math.PI) * 80
      pintarMinerio(ctx, x, y, 1 - f * 0.3)
    }
  }
}

// Um número fixo por pedra (para o contorno não mudar a cada quadro)
const sementeDa = ({ x, y }) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1

function pintarPedra(ctx, centro, raio, rachaduras, semente) {
  const { cores } = minaDesenhada
  const pontos = Array.from({ length: 9 }, (_, i) => {
    const angulo = (i / 9) * Math.PI * 2
    const r = raio * (0.82 + (((semente * 1000 + i * 37) % 10) / 10) * 0.22)
    return { x: centro.x + Math.cos(angulo) * r, y: centro.y + Math.sin(angulo) * r * 0.85 }
  })
  // a sombra no chão
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.beginPath()
  ctx.ellipse(centro.x, centro.y + raio * 0.8, raio, raio * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = cores.pedra
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 3
  ctx.beginPath()
  pontos.forEach((ponto, i) => (i === 0 ? ctx.moveTo(ponto.x, ponto.y) : ctx.lineTo(ponto.x, ponto.y)))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // o lado escuro e os pontinhos de minério
  ctx.fillStyle = cores.pedraEscura
  ctx.beginPath()
  ctx.ellipse(centro.x + raio * 0.25, centro.y + raio * 0.3, raio * 0.5, raio * 0.3, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = cores.minerio
  for (const [dx, dy] of [
    [-0.4, -0.2],
    [0.2, -0.45],
    [0.35, 0.1],
  ]) ctx.fillRect(centro.x + dx * raio - 3, centro.y + dy * raio - 3, 6, 6)
  // as rachaduras: uma a cada golpe, sempre nos mesmos caminhos
  const caminhos = [
    [
      [-0.1, -0.85],
      [0, -0.4],
      [-0.2, -0.1],
      [-0.05, 0.25],
    ],
    [
      [0.8, -0.2],
      [0.4, -0.05],
      [0.25, 0.3],
      [0.4, 0.6],
    ],
    [
      [-0.85, 0.2],
      [-0.45, 0.1],
      [-0.25, 0.45],
    ],
  ]
  ctx.strokeStyle = cores.racha
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  for (const caminho of caminhos.slice(0, rachaduras)) {
    ctx.beginPath()
    caminho.forEach(([dx, dy], i) => (i === 0 ? ctx.moveTo(centro.x + dx * raio, centro.y + dy * raio) : ctx.lineTo(centro.x + dx * raio, centro.y + dy * raio)))
    ctx.stroke()
  }
}

// A picareta na mão da frente: levantada atrás da cabeça e, no golpe, descendo na direção da pedra
function pintarPicareta(ctx, mundo, escala, descida) {
  const { cores } = minaDesenhada
  const s = mundo.lado === 'esquerda' ? -1 : 1
  const mao = { x: mundo.x + 14 * escala * s, y: mundo.y + 6 * escala }
  const angulo = -2.2 + descida * 2.3 // de cima (atrás da cabeça) até a frente, um pouco para baixo
  const cabo = 44
  const ponta = { x: mao.x + Math.cos(angulo) * cabo * s, y: mao.y + Math.sin(angulo) * cabo }
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(mao.x, mao.y)
  ctx.lineTo(ponta.x, ponta.y)
  ctx.stroke()
  ctx.strokeStyle = cores.cabo
  ctx.lineWidth = 4
  ctx.stroke()
  // a cabeça de ferro, de través no fim do cabo
  const perpendicular = angulo + Math.PI / 2
  const meia = 18
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(ponta.x - Math.cos(perpendicular) * meia * s, ponta.y - Math.sin(perpendicular) * meia)
  ctx.lineTo(ponta.x + Math.cos(perpendicular) * meia * s, ponta.y + Math.sin(perpendicular) * meia)
  ctx.stroke()
  ctx.strokeStyle = cores.ferro
  ctx.lineWidth = 5
  ctx.stroke()
}

function pintarMinerio(ctx, x, y, tamanho) {
  const { cores } = minaDesenhada
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(tamanho, tamanho)
  ctx.fillStyle = cores.minerio
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(-12, -4)
  ctx.lineTo(-4, -12)
  ctx.lineTo(10, -8)
  ctx.lineTo(13, 4)
  ctx.lineTo(2, 12)
  ctx.lineTo(-10, 8)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = cores.brilhoDoMinerio
  ctx.fillRect(-5, -6, 5, 4)
  ctx.restore()
}
