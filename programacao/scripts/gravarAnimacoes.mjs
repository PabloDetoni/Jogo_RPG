// Grava as animações do cenário (camadas, 20/10/2026; com as peças do Pablo desde 21/10) em quadros, para o relatório:
// regiões do Reino e do Mapa em 1366×768, 10 quadros por segundo durante 6 s. Uso: node scripts/gravarAnimacoes.mjs
// Os quadros saem em testes-do-navegador/animacoes/<regiao>-NN.png (o relatório junta em GIF).
import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { abrirNavegador, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'animacoes')
const vite = await ligarVite(5203)
const navegador = await abrirNavegador('animacoes', PASTA)
const aba = await navegador.novaAba('aba1')
const clicar = (texto) => aba.avaliar(`([...document.querySelectorAll('button')].find((b) => !b.disabled && b.textContent.trim().startsWith(${JSON.stringify(texto)}))?.click(), true)`)
const quadros = 60
const regioes = {
  reino: {
    'reino-moinho-e-lanterna': { x: 0, y: 150, width: 330, height: 200 },
    'reino-nuvens': { x: 560, y: 0, width: 560, height: 170 },
    'reino-lago-e-fonte': { x: 480, y: 170, width: 360, height: 330 },
    'reino-forja': { x: 860, y: 360, width: 260, height: 200 },
  },
  mapa: {
    'mapa-vulcao': { x: 900, y: 0, width: 380, height: 260 },
    'mapa-tundra': { x: 60, y: 40, width: 420, height: 280 },
    'mapa-planalto': { x: 560, y: 200, width: 300, height: 200 },
    'mapa-cachoeiras-da-floresta': { x: 140, y: 480, width: 500, height: 220 },
  },
}

async function gravar(lista) {
  const nomes = Object.keys(lista)
  for (let q = 1; q <= quadros; q++) {
    const inicio = Date.now()
    for (const nome of nomes) {
      const r = await aba.cdp.enviar('Page.captureScreenshot', { format: 'png', clip: { ...lista[nome], scale: 1 } })
      writeFileSync(join(PASTA, `${nome}-${String(q).padStart(2, '0')}.png`), Buffer.from(r.data, 'base64'))
    }
    await pausa(Math.max(0, 100 - (Date.now() - inicio)))
  }
}

try {
  await aba.abrir(vite.site)
  await clicar('Iniciar jogo')
  await pausa(300)
  await clicar('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await clicar('Continuar')
  await pausa(300)
  await clicar('Arqueiro')
  await pausa(200)
  await clicar('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  await aba.avaliar(`([...document.querySelectorAll('.dica-da-tela button')].find((b) => b.textContent.trim() === 'Entendi')?.click(), document.querySelector('[aria-label="Minimizar o painel"]')?.click(), true)`)
  await aba.esperar(`!!document.querySelector('.cena-pronta')`, 'o Reino pronto', 20000)
  await pausa(1500)
  await aba.avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = 'hidden'; return true })()`)
  await gravar(regioes.reino)
  await aba.avaliar(`(document.querySelector('.lugar-desenhado-jogar .lugar-placa').click(), true)`)
  await aba.esperarTela('Mapa')
  await aba.avaliar(`([...document.querySelectorAll('.dica-da-tela button')].find((b) => b.textContent.trim() === 'Entendi')?.click(), true)`)
  await aba.esperar(`!!document.querySelector('.cena-pronta')`, 'o Mapa pronto', 20000)
  await pausa(1500)
  await gravar(regioes.mapa)
  console.log(`Quadros em ${PASTA}`)
} finally {
  await navegador.fechar()
  await vite.fechar()
}
