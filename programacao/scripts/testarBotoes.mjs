// Roteiro dos botões parados (pedido do Pablo em 20/10/2026). Uso: npm run testar:botoes
// Nenhum botão pode mudar de lugar: nem ao passar o mouse, nem com o foco, nem apertado (o clique), nem ao trocar de
// tela ou de tema, nem quando a fonte chega. Liga o Vite e um Edge escondido, joga como convidado e, em 1366×768 e em
// 1920×1080, passa por cada tela (pelo painel DEV) medindo cada botão antes e depois do mouse em cima, do foco pelo
// teclado e do botão do mouse apertado (solto fora dele, para não clicar). A diferença tem que ser 0.
// Também confere: os cantos (Salão da Glória, Configurações) no mesmo lugar em todas as telas; os botões da Tela inicial
// no mesmo lugar nos dois temas; e a primeira tela já com a fonte em pixel (nada muda depois que ela carrega).
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'botoes')
const vite = await ligarVite(5199)
let navegador = null

async function desligar(codigo) {
  await navegador?.fechar()
  await vite.fechar()
  process.exit(codigo)
}
const { estado, conferir, parar } = criarConferencias(() => desligar(1))

// A partida e a cutscene ficam de fora (canvas do Phaser e HUD que muda sozinho; a partida tem roteiros próprios)
const telasPuladas = new Set(['partida', 'cutsceneDerrota'])
// Até quantos botões por tela (as listas longas, como as do Mercado, repetem o mesmo botão)
const botoesPorTela = 28
// Peças de jogo dos minijogos andam de propósito; o painel DEV e a barra de teste só existem no npm run dev
const fora = '.painel-dev, .painel-dev-mini, .barra-de-teste, .minijogo-campo'

let aba = null
const clicar = (texto, comeco = false) =>
  aba.avaliar(`(() => {
    const botoes = [...document.querySelectorAll('button')].filter((b) => !b.disabled)
    const alvo = botoes.find((b) => ${comeco ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : `b.textContent.trim() === ${JSON.stringify(texto)}`})
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
const passo = async (texto, comeco = false) => {
  if (!(await clicar(texto, comeco))) throw new Error(`não achei o botão "${texto}"`)
  await pausa(220)
}
const irPara = async (tela) => {
  await aba.avaliar(`(() => {
    const select = document.querySelector('.painel-dev select')
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, ${JSON.stringify(tela)})
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  })()`)
  await pausa(400)
  // A dica da primeira visita cobre a tela: fecha (ela também tem botões, medidos na tela inicial do roteiro)
  await aba.avaliar(`([...document.querySelectorAll('.dica-da-tela button')].find((b) => b.textContent.trim() === 'Entendi')?.click(), true)`)
  await pausa(150)
}
const telasDoPainel = () => aba.avaliar(`[...document.querySelectorAll('.painel-dev select option')].map((o) => o.value)`)

// Marca os botões visíveis da tela (data-medir) e devolve o nome e o retângulo de cada um
const marcarBotoes = () =>
  aba.avaliar(`(() => {
    const visivel = (b) => {
      const r = b.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(b).visibility !== 'hidden'
    }
    const botoes = [...document.querySelectorAll('.moldura button')].filter((b) => !b.closest(${JSON.stringify(fora)}) && visivel(b))
    document.querySelectorAll('[data-medir]').forEach((b) => b.removeAttribute('data-medir'))
    return botoes.slice(0, ${botoesPorTela}).map((b, i) => {
      b.dataset.medir = i
      return { i, nome: (b.getAttribute('aria-label') || b.textContent.trim() || b.title || '?').slice(0, 40), desligado: b.disabled }
    })
  })()`)
const retangulo = (i) =>
  aba.avaliar(`(() => { const r = document.querySelector('[data-medir="${i}"]')?.getBoundingClientRect(); return r ? [r.x, r.y, r.width, r.height] : null })()`)
const centro = async (i) => {
  const r = await retangulo(i)
  return r && { x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 }
}
const diferenca = (a, b) => (a && b ? Math.max(...a.map((v, k) => Math.abs(v - b[k]))) : Infinity)
const longe = { x: 2, y: 2 }

// Um botão: antes, com o mouse em cima, com o foco do teclado e apertado. Devolve a maior diferença de cada estado.
async function medirBotao(i) {
  // Numa lista que rola, o foco rola a lista até o botão aparecer inteiro (o navegador faz isso, o botão não sai do
  // lugar dele): o botão aparece inteiro antes de medir
  await aba.avaliar(`(document.querySelector('[data-medir="${i}"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }), true)`)
  await pausa(60)
  const antes = await retangulo(i)
  const meio = await centro(i)
  await aba.moverMouse(meio.x, meio.y)
  await pausa(130)
  const emCima = await retangulo(i)
  await aba.moverMouse(longe.x, longe.y)
  // O foco "de teclado" (:focus-visible): uma tecla antes do focus()
  await aba.cdp.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 })
  await aba.cdp.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 })
  await aba.avaliar(`(document.querySelector('[data-medir="${i}"]')?.focus(), true)`)
  await pausa(130)
  const comFoco = await retangulo(i)
  await aba.avaliar(`(document.activeElement?.blur(), true)`)
  // Apertado: o botão do mouse desce em cima dele e sobe longe (sem clicar)
  let apertado = antes
  const desligado = await aba.avaliar(`!!document.querySelector('[data-medir="${i}"]')?.disabled`)
  if (!desligado) {
    await aba.moverMouse(meio.x, meio.y)
    await aba.cdp.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x: meio.x, y: meio.y, button: 'left', buttons: 1, clickCount: 1 })
    await pausa(130)
    apertado = await retangulo(i)
    await aba.cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x: longe.x, y: longe.y, button: 'left', buttons: 1 })
    await aba.cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x: longe.x, y: longe.y, button: 'left', buttons: 0, clickCount: 1 })
    await pausa(60)
  }
  return { emCima: diferenca(antes, emCima), foco: diferenca(antes, comFoco), apertado: diferenca(antes, apertado) }
}

// Os retângulos dos botões com estes nomes (os cantos e os da Tela inicial)
const lugaresDe = (nomes) =>
  aba.avaliar(`(() => {
    const achados = {}
    for (const b of document.querySelectorAll('.moldura button')) {
      if (b.closest(${JSON.stringify(fora)})) continue
      const nome = b.textContent.trim()
      if (${JSON.stringify(nomes)}.includes(nome) && !achados[nome]) { const r = b.getBoundingClientRect(); achados[nome] = [r.x, r.y, r.width, r.height] }
    }
    return achados
  })()`)

try {
  navegador = await abrirNavegador('botoes', PASTA)
  aba = await navegador.novaAba('aba1')
  console.log(`Site: ${vite.site}`)

  console.log('1. A primeira tela já vem com a fonte em pixel (nada muda de lugar quando ela termina de carregar)')
  await aba.abrir(vite.site)
  const naPrimeiraTela = await aba.avaliar(`({ fonte: document.fonts.check('16px "Pixelify Sans"'), lugares: [...document.querySelectorAll('.moldura button')].map((b) => { const r = b.getBoundingClientRect(); return [r.x, r.y, r.width, r.height] }) })`)
  await aba.avaliar(`document.fonts.ready.then(() => true)`)
  await pausa(1500)
  const depoisDaFonte = await aba.avaliar(`[...document.querySelectorAll('.moldura button')].map((b) => { const r = b.getBoundingClientRect(); return [r.x, r.y, r.width, r.height] })`)
  const mudouComAFonte = Math.max(0, ...naPrimeiraTela.lugares.map((r, k) => diferenca(r, depoisDaFonte[k])))
  conferir('a fonte em pixel já está pronta quando a Tela inicial aparece, e nenhum botão muda depois', naPrimeiraTela.fonte && mudouComAFonte === 0 && naPrimeiraTela.lugares.length === depoisDaFonte.length, { fonte: naPrimeiraTela.fonte, mudouComAFonte })

  console.log('2. Os botões da Tela inicial no mesmo lugar nos dois temas')
  const daTelaInicial = ['Iniciar jogo', 'Como jogar', 'Salão da Glória', 'Configurações']
  const noClaro = await lugaresDe(daTelaInicial)
  await passo('Configurações')
  await passo('Tema', true)
  await aba.apertar('esc')
  await pausa(300)
  const noEscuro = await lugaresDe(daTelaInicial)
  const entreTemas = Math.max(...daTelaInicial.map((nome) => diferenca(noClaro[nome], noEscuro[nome])))
  conferir('trocar o tema não move nenhum botão da Tela inicial', entreTemas === 0 && Object.keys(noClaro).length === daTelaInicial.length, { entreTemas, noClaro, noEscuro })
  await passo('Configurações')
  await passo('Tema', true)
  await aba.apertar('esc')
  await pausa(200)

  console.log('3. Convidado novo (para todas as telas abrirem com o que mostram)')
  await passo('Iniciar jogo')
  await passo('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await passo('Continuar')
  await passo('Arqueiro')
  await passo('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  const telas = (await telasDoPainel()).filter((tela) => !telasPuladas.has(tela))

  for (const [largura, altura] of [
    [1366, 768],
    [1920, 1080],
  ]) {
    const tamanho = `${largura}×${altura}`
    console.log(`4. ${tamanho}: cada botão de cada tela com o mouse em cima, com o foco e apertado`)
    await aba.cdp.enviar('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 1, mobile: false })
    await pausa(500)
    const cantos = {}
    for (const tela of telas) {
      await irPara(tela)
      const titulo = await aba.titulo()
      const botoes = await marcarBotoes()
      const moveram = []
      for (const botao of botoes) {
        const d = await medirBotao(botao.i)
        if (d.emCima !== 0 || d.foco !== 0 || d.apertado !== 0) moveram.push({ ...botao, ...d })
      }
      // Se o aperto mudou de tela por algum motivo, volta (a próxima tela vem pelo painel de qualquer jeito)
      conferir(`${tamanho} · ${titulo || tela}: ${botoes.length} botões parados com o mouse em cima, com o foco e apertados`, botoes.length > 0 && moveram.length === 0, moveram.length ? moveram : undefined)
      const lugares = await lugaresDe(['Salão da Glória', 'Configurações'])
      for (const [nome, r] of Object.entries(lugares)) (cantos[nome] ??= []).push({ tela, r })
    }
    // Os cantos no mesmo lugar em todas as telas que os têm (o Reino tem os desenhados, que não contam aqui)
    for (const [nome, lista] of Object.entries(cantos)) {
      const deCanto = lista.filter(({ tela }) => tela !== 'reino')
      const espalhado = Math.max(...deCanto.map(({ r }) => diferenca(r, deCanto[0].r)))
      conferir(`${tamanho}: "${nome}" no mesmo lugar em todas as ${deCanto.length} telas que o mostram no canto`, deCanto.length > 3 && espalhado === 0, espalhado === 0 ? undefined : deCanto.map(({ tela, r }) => `${tela}: ${r.map((v) => Math.round(v * 10) / 10).join(', ')}`))
    }
    await aba.print(`botoes-${largura}`)
  }
} catch (erro) {
  conferir(`o roteiro chegou até o fim sem erro (${erro.message.split('\n')[0]})`, false)
}

parar()
console.log(`\n${estado.total - estado.falhas} de ${estado.total} conferências passaram. Prints em ${PASTA}`)
await desligar(estado.falhas === 0 ? 0 : 1)
