import { useEffect, useRef } from 'react'
import { pesca } from '../../dados/minijogos.js'
import { pecasDoBoneco } from '../../regras/bonecos.js'
import { pintarFormasNoCanvas } from '../../componentes/ui/formasNoCanvas.js'

// A pesca visual do Lago (Parte 10 de 11/2026): um canvas com o bonequinho em blocos (na cor e com o chapéu da classe
// do Líder) segurando a vara, a linha e a boia balançando na água. As regras são as de sempre (regras/minijogos.js):
// esperando, a boia boia; fisgando, ela afunda e aparece o "!"; assustado (puxou cedo), ela treme e aparece o "…". No
// puxão certo, a vara sobe e o peixe pula fora d'água; no errado, a linha só balança. Nada aqui muda a regra: o canvas
// só desenha o estado que vem de fora. Com "reduzir movimento", o balanço fica parado (os estados continuam visíveis).
// estado: o da boia; puxao: { quando (performance.now()), ponto } do último clique; boneco: { cor, chapeu }.
export default function CenaDaPesca({ estado, puxao, boneco }) {
  const canvas = useRef(null)
  const atual = useRef({ estado, puxao, boneco })
  // o laço do desenho lê sempre o estado mais novo
  useEffect(() => {
    atual.current = { estado, puxao, boneco }
  }, [estado, puxao, boneco])

  useEffect(() => {
    const quadro = canvas.current
    if (!quadro) return undefined
    const ctx = quadro.getContext('2d')
    if (!ctx) return undefined
    const parado = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let pedido = 0
    const desenhar = (tempo) => {
      pintarCena(ctx, tempo, atual.current, parado)
      pedido = requestAnimationFrame(desenhar)
    }
    pedido = requestAnimationFrame(desenhar)
    return () => cancelAnimationFrame(pedido)
  }, [])

  return <canvas ref={canvas} className="cena-da-pesca" width={pesca.largura} height={pesca.altura} aria-hidden="true" />
}

// Um quadro da cena (o desenho é em unidades da cena: pesca.largura × pesca.altura)
function pintarCena(ctx, tempo, { estado, puxao, boneco }, parado) {
  const { largura, altura, nivelDaAgua, cores } = pesca
  const t = parado ? 0 : tempo / 1000
  ctx.clearRect(0, 0, largura, altura)
  // céu, água (com as ondinhas) e a margem de grama com o bonequinho
  ctx.fillStyle = cores.ceu
  ctx.fillRect(0, 0, largura, nivelDaAgua)
  ctx.fillStyle = cores.agua
  ctx.fillRect(0, nivelDaAgua, largura, altura - nivelDaAgua)
  ctx.strokeStyle = cores.onda
  ctx.lineWidth = 2
  for (let i = 0; i < 6; i++) {
    const y = nivelDaAgua + 22 + i * 28
    ctx.beginPath()
    for (let x = pesca.margem.largura; x <= largura; x += 16) ctx.lineTo(x, y + Math.sin(x / 30 + t * 1.6 + i) * 2.5)
    ctx.stroke()
  }
  ctx.fillStyle = cores.margem
  ctx.beginPath()
  ctx.roundRect(-20, pesca.margem.y, pesca.margem.largura + 20, altura - pesca.margem.y + 20, 28)
  ctx.fill()

  // o puxão: 0 → 1 durante pesca.msDoPuxao depois do clique
  const desde = puxao ? performance.now() - puxao.quando : Infinity
  const fracao = desde < pesca.msDoPuxao ? desde / pesca.msDoPuxao : null
  const levanta = fracao === null ? 0 : Math.sin(fracao * Math.PI) * (puxao.ponto ? 1 : 0.35)

  // o bonequinho (a mão da frente segura a vara) e a vara
  const { x: bx, y: by, escala } = pesca.boneco
  const pecas = pecasDoBoneco({ cor: boneco.cor, chapeu: boneco.chapeu }, { lado: 'direita', fase: t * 2, andando: false })
  pintarFormasNoCanvas(ctx, pecas, escala, bx, by)
  const mao = { x: bx + 15 * escala, y: by + 8 * escala }
  const ponta = { x: pesca.vara.x - levanta * 30, y: pesca.vara.y - levanta * 55 }
  ctx.strokeStyle = cores.vara
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(mao.x, mao.y)
  ctx.lineTo(ponta.x, ponta.y)
  ctx.stroke()

  // a boia: balança esperando, afunda fisgando, treme assustada; no puxão certo, sai da água
  const balanco = Math.sin(t * 2.4) * 4
  let boia = { x: pesca.boia.x + Math.sin(t * 0.9) * 6, y: nivelDaAgua + 30 + balanco }
  if (estado === 'fisgando') boia = { x: pesca.boia.x, y: nivelDaAgua + 44 + Math.sin(t * 14) * 2 }
  if (estado === 'assustado') boia = { x: pesca.boia.x + Math.sin(t * 40) * 3, y: nivelDaAgua + 28 }
  if (fracao !== null && puxao.ponto) boia = { x: pesca.boia.x - levanta * 40, y: nivelDaAgua + 30 - levanta * 70 }

  // a linha, da ponta da vara à boia (um pouco caída no meio)
  ctx.strokeStyle = cores.linha
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(ponta.x, ponta.y)
  ctx.quadraticCurveTo((ponta.x + boia.x) / 2, Math.max(ponta.y, boia.y) + 30 * (1 - levanta), boia.x, boia.y)
  ctx.stroke()
  // a boia (metade vermelha, metade branca) e a ondinha em volta
  ctx.fillStyle = cores.boiaBaixo
  ctx.beginPath()
  ctx.arc(boia.x, boia.y, 9, 0, Math.PI)
  ctx.fill()
  ctx.fillStyle = cores.boiaCima
  ctx.beginPath()
  ctx.arc(boia.x, boia.y, 9, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = cores.contorno
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(boia.x, boia.y, 9, 0, Math.PI * 2)
  ctx.stroke()
  if (estado === 'fisgando' || estado === 'assustado') {
    ctx.strokeStyle = cores.onda
    ctx.lineWidth = 2
    const r = 16 + ((t * 30) % 18)
    ctx.beginPath()
    ctx.ellipse(boia.x, nivelDaAgua + 40, r, r / 3, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // o peixe pulando (só no puxão certo): sai da água atrás da boia num arco
  if (fracao !== null && puxao.ponto) {
    const px = pesca.boia.x + 30 - fracao * 120
    const py = nivelDaAgua + 20 - Math.sin(fracao * Math.PI) * 120
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(-0.6 + fracao * 1.2)
    ctx.fillStyle = cores.peixe
    ctx.strokeStyle = cores.contorno
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(16, 0)
    ctx.lineTo(30, -10)
    ctx.lineTo(30, 10)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = cores.contorno
    ctx.beginPath()
    ctx.arc(-11, -3, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // o aviso em cima da boia: "!" na hora de puxar, "…" quando o peixe se assustou
  const aviso = estado === 'fisgando' ? '!' : estado === 'assustado' ? '…' : null
  if (aviso && !(fracao !== null && puxao.ponto)) {
    ctx.font = `700 ${pesca.tamanhoDoAviso}px "Pixelify Sans", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = estado === 'fisgando' ? cores.avisoFisgando : cores.avisoAssustado
    ctx.strokeStyle = cores.contorno
    ctx.lineWidth = 4
    ctx.strokeText(aviso, boia.x, boia.y - 26)
    ctx.fillText(aviso, boia.x, boia.y - 26)
  }
}
