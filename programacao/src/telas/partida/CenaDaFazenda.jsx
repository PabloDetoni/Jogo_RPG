import { useEffect, useRef } from 'react'
import { pintarFormasNoCanvas } from '../../componentes/ui/formasNoCanvas.js'
import { fazendaDesenhada } from '../../dados/minijogos.js'
import { pecasDoBoneco } from '../../regras/bonecos.js'
import { etapaDoCanteiro, lugarDoCanteiro } from '../../regras/minijogos.js'

// A Fazenda desenhada (Parte 11b de 11/2026), como a pesca do Lago: um canvas com os 9 canteiros e o bonequinho em
// blocos do Líder. Cada canteiro cresce em etapas que dá para ver (broto, planta, maduro com brilho, murcho); clicando,
// o bonequinho anda até o canteiro e, se estava maduro, a planta pula do canteiro para ele. As regras são as de sempre
// (regras/minijogos.js): o canvas só desenha. Os botões de cada canteiro ficam por cima (Minijogo.jsx), nos lugares de
// lugarDoCanteiro. Com "reduzir movimento", o bonequinho vai direto e nada balança.
// canteiros: os da regra; inicio: o performance.now() do começo da rodada; colheita: { indice, quando, ponto } do
// último clique; boneco: { cor, chapeu }.
export default function CenaDaFazenda({ canteiros, inicio, colheita, boneco }) {
  const canvas = useRef(null)
  const atual = useRef({ canteiros, inicio, colheita, boneco })
  useEffect(() => {
    atual.current = { canteiros, inicio, colheita, boneco }
  }, [canteiros, inicio, colheita, boneco])

  useEffect(() => {
    const quadro = canvas.current
    const ctx = quadro?.getContext('2d')
    if (!ctx) return undefined
    const parado = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    // o que só o desenho guarda: onde o bonequinho está, para onde vai e as plantas pulando
    const mundo = { x: fazendaDesenhada.boneco.x, y: fazendaDesenhada.boneco.y, alvo: null, lado: 'direita', pulos: [], ultima: null, antes: null }
    let pedido = 0
    const desenhar = (tempo) => {
      const passo = mundo.antes === null ? 0 : Math.min(0.05, (tempo - mundo.antes) / 1000)
      mundo.antes = tempo
      andarDoBoneco(mundo, atual.current.colheita, passo, parado)
      pintarFazenda(ctx, tempo, atual.current, mundo, parado)
      pedido = requestAnimationFrame(desenhar)
    }
    pedido = requestAnimationFrame(desenhar)
    return () => cancelAnimationFrame(pedido)
  }, [])

  return <canvas ref={canvas} className="cena-do-minijogo" width={fazendaDesenhada.largura} height={fazendaDesenhada.altura} aria-hidden="true" />
}

// Onde o bonequinho fica para colher o canteiro: dentro dele, do lado esquerdo da planta (sem cobrir o vizinho)
function lugarParaColher(indice) {
  const lugar = lugarDoCanteiro(indice, fazendaDesenhada.canteiros)
  return { x: lugar.x + 26, y: lugar.y + lugar.altura / 2 + 2 }
}

function andarDoBoneco(mundo, colheita, passo, parado) {
  // um clique novo: o bonequinho vai até o canteiro; se colheu, a planta pula até ele
  if (colheita && colheita !== mundo.ultima) {
    mundo.ultima = colheita
    mundo.alvo = lugarParaColher(colheita.indice)
    if (colheita.ponto) mundo.pulos.push({ indice: colheita.indice, quando: colheita.quando, ate: mundo.alvo })
  }
  if (!mundo.alvo) return
  const dx = mundo.alvo.x - mundo.x
  const dy = mundo.alvo.y - mundo.y
  const distancia = Math.hypot(dx, dy)
  if (Math.abs(dx) > 2) mundo.lado = dx < 0 ? 'esquerda' : 'direita'
  const anda = parado ? distancia : fazendaDesenhada.boneco.velocidade * passo
  if (distancia <= anda) {
    mundo.x = mundo.alvo.x
    mundo.y = mundo.alvo.y
    mundo.andando = false
  } else {
    mundo.x += (dx / distancia) * anda
    mundo.y += (dy / distancia) * anda
    mundo.andando = true
  }
}

function pintarFazenda(ctx, tempo, { canteiros, inicio, boneco }, mundo, parado) {
  const { largura, altura, cores, msDaPlanta, msDaColheita } = fazendaDesenhada
  const t = parado ? 0 : tempo / 1000
  const agoraDaRodada = performance.now() - inicio
  ctx.clearRect(0, 0, largura, altura)
  // a grama, com tufos parados (sempre nos mesmos lugares)
  ctx.fillStyle = cores.grama
  ctx.fillRect(0, 0, largura, altura)
  ctx.fillStyle = cores.gramaEscura
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % largura
    const y = (i * 61 + 23) % altura
    ctx.fillRect(x, y, 10, 4)
    ctx.fillRect(x + 3, y - 3, 4, 3)
  }
  // a cerca da esquerda
  ctx.fillStyle = cores.cerca
  for (let y = 20; y < altura - 10; y += 46) ctx.fillRect(28, y, 8, 30)
  ctx.fillRect(24, 30, 16, 6)

  // os canteiros
  ;(canteiros ?? []).forEach((canteiro, indice) => {
    const lugar = lugarDoCanteiro(indice, fazendaDesenhada.canteiros)
    pintarCanteiro(ctx, lugar, etapaDoCanteiro(canteiro, agoraDaRodada, msDaPlanta), t)
  })

  // o bonequinho
  const { escala } = fazendaDesenhada.boneco
  const pecas = pecasDoBoneco({ cor: boneco.cor, chapeu: boneco.chapeu }, { lado: mundo.lado, fase: t * 6, andando: mundo.andando && !parado })
  pintarFormasNoCanvas(ctx, pecas, escala, mundo.x, mundo.y)

  // as plantas colhidas pulando do canteiro para o bonequinho (num arco, diminuindo)
  const agora = performance.now()
  mundo.pulos = mundo.pulos.filter((pulo) => agora - pulo.quando < msDaColheita)
  for (const pulo of mundo.pulos) {
    const fracao = parado ? 0.5 : (agora - pulo.quando) / msDaColheita
    const de = lugarDoCanteiro(pulo.indice, fazendaDesenhada.canteiros)
    const inicioDoPulo = { x: de.x + de.largura / 2, y: de.y + de.altura / 2 }
    const x = inicioDoPulo.x + (pulo.ate.x - inicioDoPulo.x) * fracao
    const y = inicioDoPulo.y + (pulo.ate.y - 18 - inicioDoPulo.y) * fracao - Math.sin(fracao * Math.PI) * 70
    pintarTrigo(ctx, x, y + 14, 1 - fracao * 0.4)
  }
}

function pintarCanteiro(ctx, { x, y, largura, altura }, etapa, t) {
  const { cores } = fazendaDesenhada
  // a terra com os sulcos
  ctx.fillStyle = etapa === 'murcho' ? cores.murcha : cores.terra
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(x, y, largura, altura, 10)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = cores.sulco
  ctx.lineWidth = 2
  for (let i = 1; i <= 3; i++) {
    const sy = y + (altura * i) / 4
    ctx.beginPath()
    ctx.moveTo(x + 10, sy)
    ctx.lineTo(x + largura - 10, sy)
    ctx.stroke()
  }
  const meio = { x: x + largura / 2, y: y + altura - 16 }
  if (etapa === 'broto') {
    folha(ctx, meio.x - 6, meio.y - 4, -0.6, 9, cores.broto)
    folha(ctx, meio.x + 6, meio.y - 4, 0.6, 9, cores.broto)
    return
  }
  if (etapa === 'planta') {
    caule(ctx, meio.x, meio.y, meio.x, meio.y - 40, cores.planta)
    folha(ctx, meio.x - 9, meio.y - 14, -0.7, 12, cores.planta)
    folha(ctx, meio.x + 9, meio.y - 22, 0.7, 12, cores.planta)
    folha(ctx, meio.x - 8, meio.y - 32, -0.5, 10, cores.planta)
    return
  }
  if (etapa === 'maduro') {
    // o brilho pulsando atrás do trigo dourado
    const pulso = 0.75 + Math.sin(t * 6) * 0.25
    const brilho = ctx.createRadialGradient(meio.x, meio.y - 26, 4, meio.x, meio.y - 26, 52 * pulso)
    brilho.addColorStop(0, cores.brilho)
    brilho.addColorStop(1, 'rgba(255, 243, 160, 0)')
    ctx.fillStyle = brilho
    ctx.fillRect(x, y, largura, altura)
    pintarTrigo(ctx, meio.x, meio.y, 1)
    return
  }
  // murcho: o caule caído e as folhas marrons
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(meio.x, meio.y)
  ctx.quadraticCurveTo(meio.x + 4, meio.y - 26, meio.x + 26, meio.y - 16)
  ctx.stroke()
  folha(ctx, meio.x + 26, meio.y - 12, 1.4, 10, cores.murcha)
  folha(ctx, meio.x - 10, meio.y - 2, -1.2, 9, cores.murcha)
}

// Três espigas de trigo (o maduro e o que pula colhido); "tamanho" de 0 a 1
function pintarTrigo(ctx, x, y, tamanho) {
  const { cores } = fazendaDesenhada
  for (const desvio of [-12, 0, 12]) {
    const topo = { x: x + desvio * 0.8 * tamanho, y: y - 46 * tamanho }
    caule(ctx, x + desvio * 0.3 * tamanho, y, topo.x, topo.y, cores.planta)
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = cores.trigo
      ctx.strokeStyle = cores.contorno
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(topo.x + (i % 2 === 0 ? -3 : 3) * tamanho, topo.y + i * 6 * tamanho, 3.6 * tamanho, 5.5 * tamanho, i % 2 === 0 ? -0.5 : 0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }
}

function caule(ctx, x1, y1, x2, y2, cor) {
  ctx.strokeStyle = fazendaDesenhada.cores.contorno
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.strokeStyle = cor
  ctx.lineWidth = 3
  ctx.stroke()
}

function folha(ctx, x, y, angulo, tamanho, cor) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angulo)
  ctx.fillStyle = cor
  ctx.strokeStyle = fazendaDesenhada.cores.contorno
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(0, 0, tamanho * 0.45, tamanho, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}
