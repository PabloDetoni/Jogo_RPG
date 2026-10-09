// Roteiro de testes da partida no navegador (Fase 1). Uso: npm run testar:navegador
// Liga o Vite e um Edge (ou Chrome) escondido, joga a arena pelo protocolo de depuração (CDP)
// e confere o que um teste do Vitest não alcança: teclado, mouse, física, desenho e telas de verdade.
// Os prints ficam em testes-do-navegador/ (fora do git). Não instala nada: precisa do Edge ou do Chrome
// no computador (ou do caminho dele na variável NAVEGADOR). No fim, desliga o Vite e o navegador.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer as criarServidorDeRede } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'vite'
import { areaJogavel, inicio as INICIO, pedras } from '../src/dados/arenaDeTeste.js'
import { combateDeTeste } from '../src/dados/balanceamento.js'
import { aplicarTaxa, taxaNaDistancia } from '../src/regras/taxa.js'
import { xpTotalAteONivel } from '../src/regras/xp.js'

const PASTA = resolve('testes-do-navegador')
// Área jogável e pedras: os mesmos dados do jogo
const AREA = {
  topo: areaJogavel.y - areaJogavel.altura / 2,
  base: areaJogavel.y + areaJogavel.altura / 2,
  esquerda: areaJogavel.x - areaJogavel.largura / 2,
  direita: areaJogavel.x + areaJogavel.largura / 2,
}
const PEDRAS = pedras
// Taxa por distância na arena (5c): ponto inicial e borda, os mesmos do jogo
const BORDA = combateDeTeste.distanciaAteABorda
const distanciaAoInicio = (ponto) => Math.hypot(ponto.x - INICIO.x, ponto.y - INICIO.y)

mkdirSync(PASTA, { recursive: true })
const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

let falhas = 0
let total = 0
// Vigia: se nenhuma conferência acontecer em 4 minutos (o computador dormiu, o navegador travou), o roteiro para
// sozinho, avisa e fecha o navegador e o Vite, em vez de ficar parado para sempre
let ultimaAtividade = Date.now()
const vigia = setInterval(() => {
  if (Date.now() - ultimaAtividade < 4 * 60 * 1000) return
  clearInterval(vigia)
  console.log(`
  ERRO o roteiro ficou 4 minutos sem andar (depois de ${total} conferências): parado pelo vigia`)
  desligar(1)
}, 15000)
function conferir(nome, condicao, detalhe) {
  ultimaAtividade = Date.now()
  total++
  console.log(`${condicao ? '  ok   ' : '  FALHOU'} ${nome}${detalhe !== undefined ? ' → ' + JSON.stringify(detalhe) : ''}`)
  if (!condicao) falhas++
}

// ---------- Vite e navegador ----------

function acharNavegador() {
  const candidatos = [
    process.env.NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/microsoft-edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ]
  return candidatos.find((caminho) => caminho && existsSync(caminho))
}

const caminhoDoNavegador = acharNavegador()
if (!caminhoDoNavegador) {
  console.error('Não achei o Edge nem o Chrome. Diga onde está com a variável NAVEGADOR.')
  process.exit(1)
}

// Uma porta livre para cada rodada: assim o roteiro nunca conversa com um navegador antigo
async function portaLivre() {
  return new Promise((resolver, rejeitar) => {
    const servidorDeRede = criarServidorDeRede()
    servidorDeRede.on('error', rejeitar)
    servidorDeRede.listen(0, '127.0.0.1', () => {
      const { port } = servidorDeRede.address()
      servidorDeRede.close(() => resolver(port))
    })
  })
}
const PORTA_DO_NAVEGADOR = await portaLivre()

const servidor = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' })
await servidor.listen()
const SITE = servidor.resolvedUrls.local[0]
const perfil = mkdtempSync(join(tmpdir(), 'jogo-rpg-navegador-'))
const navegador = spawn(
  caminhoDoNavegador,
  [
    '--headless=new',
    `--remote-debugging-port=${PORTA_DO_NAVEGADOR}`,
    `--user-data-dir=${perfil}`,
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1366,768',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
console.log(`Site: ${SITE} · navegador: ${caminhoDoNavegador}`)

async function desligar(codigo) {
  // O navegador abre vários processos: fecha todos (no Windows, a árvore inteira)
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(navegador.pid), '/T', '/F'], { stdio: 'ignore' })
  else navegador.kill()
  await servidor.close()
  await pausa(500)
  try {
    rmSync(perfil, { recursive: true, force: true })
  } catch {
    // o navegador às vezes demora a soltar os arquivos do perfil temporário
  }
  process.exit(codigo)
}

async function esperarNavegador() {
  for (let i = 0; i < 100; i++) {
    try {
      const resposta = await fetch(`http://127.0.0.1:${PORTA_DO_NAVEGADOR}/json/version`)
      if (resposta.ok) return
    } catch {
      // ainda abrindo
    }
    await pausa(150)
  }
  throw new Error('o navegador não abriu a porta de depuração')
}

function conectar(urlWs) {
  const ws = new WebSocket(urlWs)
  let proximoId = 1
  const pendentes = new Map()
  ws.onmessage = (mensagem) => {
    const dados = JSON.parse(mensagem.data)
    if (dados.id && pendentes.has(dados.id)) {
      const { resolver, rejeitar } = pendentes.get(dados.id)
      pendentes.delete(dados.id)
      if (dados.error) rejeitar(new Error(JSON.stringify(dados.error)))
      else resolver(dados.result)
    }
  }
  const aberto = new Promise((resolver, rejeitar) => {
    ws.onopen = resolver
    ws.onerror = rejeitar
  })
  return {
    aberto,
    enviar(metodo, params = {}) {
      const id = proximoId++
      ws.send(JSON.stringify({ id, method: metodo, params }))
      return new Promise((resolver, rejeitar) => pendentes.set(id, { resolver, rejeitar }))
    },
  }
}

await esperarNavegador()
const alvo = await (await fetch(`http://127.0.0.1:${PORTA_DO_NAVEGADOR}/json/new?about:blank`, { method: 'PUT' })).json()
const cdp = conectar(alvo.webSocketDebuggerUrl)
await cdp.aberto
await cdp.enviar('Page.enable')
await cdp.enviar('Runtime.enable')
await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })

// ---------- Ajudantes ----------

const teclas = {
  w: { key: 'w', code: 'KeyW', vk: 87 },
  a: { key: 'a', code: 'KeyA', vk: 65 },
  s: { key: 's', code: 'KeyS', vk: 83 },
  d: { key: 'd', code: 'KeyD', vk: 68 },
  espaco: { key: ' ', code: 'Space', vk: 32 },
  esc: { key: 'Escape', code: 'Escape', vk: 27 },
  q: { key: 'q', code: 'KeyQ', vk: 81 },
  f: { key: 'f', code: 'KeyF', vk: 70 },
  m: { key: 'm', code: 'KeyM', vk: 77 },
  um: { key: '1', code: 'Digit1', vk: 49 },
  dois: { key: '2', code: 'Digit2', vk: 50 },
}

async function avaliar(js) {
  const r = await cdp.enviar('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(`erro no JS: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n${js}`)
  return r.result.value
}

async function esperar(condicao, oQue, ms = 8000) {
  const fim = Date.now() + ms
  while (Date.now() < fim) {
    if (await avaliar(`!!(${condicao})`).catch(() => false)) return true
    await pausa(80)
  }
  throw new Error(`cansou de esperar ${oQue}`)
}

async function clicar(texto, exato = true, espera = 150) {
  const achou = await avaliar(`(() => {
    const botoes = [...document.querySelectorAll('button')].filter(b => !b.disabled)
    const alvo = botoes.find(b => ${exato ? 'b.textContent.trim() === ' + JSON.stringify(texto) : 'b.textContent.trim().startsWith(' + JSON.stringify(texto) + ')'})
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
  if (!achou) throw new Error(`não achei o botão "${texto}"`)
  await pausa(espera)
}

async function tecla(nome, tipo) {
  const t = teclas[nome]
  await cdp.enviar('Input.dispatchKeyEvent', { type: tipo, key: t.key, code: t.code, windowsVirtualKeyCode: t.vk, nativeVirtualKeyCode: t.vk })
}

async function apertar(nome) {
  await tecla(nome, 'keyDown')
  await pausa(40)
  await tecla(nome, 'keyUp')
  await pausa(100)
}

async function segurar(nomes, ms) {
  for (const nome of nomes) await tecla(nome, 'keyDown')
  await pausa(ms)
  for (const nome of nomes) await tecla(nome, 'keyUp')
  await pausa(80)
}

async function moverMouse(x, y) {
  await cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await pausa(60)
}

async function clicarNaTela(x, y) {
  await moverMouse(x, y)
  await cdp.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
  await pausa(30)
  await cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
  await pausa(80)
}

async function print(nome) {
  await avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = 'hidden' })()`)
  const r = await cdp.enviar('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(PASTA, `${nome}.png`), Buffer.from(r.data, 'base64'))
  await avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = '' })()`)
}

// Olhar o jogo por dentro (window.__jogoDaPartida existe só no npm run dev)
const CENA = `window.__jogoDaPartida.scene.getScene('arena')`
const cena = (expr) => avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)

// Ponto da arena (1600 × 900) → ponto da tela, para o mouse
async function naTela(x, y) {
  const r = await avaliar(`(() => { const r = document.querySelector('.arena canvas').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height } })()`)
  return { x: r.l + (x * r.w) / 1600, y: r.t + (y * r.h) / 900 }
}

async function colocarLider(x, y) {
  await cena(`(c.lider.colocarEm(${x}, ${y}), true)`)
  await pausa(60)
}

async function mirarEm(x, y) {
  const p = await naTela(x, y)
  await moverMouse(p.x, p.y)
}

async function atacarEm(x, y) {
  const p = await naTela(x, y)
  await clicarNaTela(p.x, p.y)
}

const textoDe = (seletor) => avaliar(`document.querySelector(${JSON.stringify(seletor)})?.innerText ?? ''`)

// Quem está em cima de quem: pares de corpos (Líder, aliados, inimigos) que entram mais de "folga" px um no outro
const SOBREPOSTOS = `(folga => {
  const corpos = [...c.grupo.filter(p => !p.perdido), ...c.inimigos.filter(i => !i.morto)]
  const pares = []
  for (let i = 0; i < corpos.length; i++) for (let j = i + 1; j < corpos.length; j++) {
    const a = corpos[i], b = corpos[j], meio = (a.tamanho + b.tamanho) / 2 - folga
    if (Math.abs(a.x - b.x) < meio && Math.abs(a.y - b.y) < meio) pares.push([a.classe ?? a.constructor.name, b.classe ?? b.constructor.name, Math.round(a.x), Math.round(a.y), (a.deslizando || b.deslizando) ? 'deslizando' : '', Math.round(((a.tamanho + b.tamanho) / 2 - Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))) * 10) / 10])
  }
  return pares
})`
const sobrepostos = (folga = 4) => cena(`${SOBREPOSTOS}(${folga})`)

// Quem entrou numa pedra ou saiu da área jogável
const dentroDePedra = () =>
  cena(`(() => {
    const pedras = ${JSON.stringify(PEDRAS)}
    const area = ${JSON.stringify(AREA)}
    return [...c.grupo.filter(p => !p.perdido), ...c.inimigos.filter(i => !i.morto)].filter(e => {
      const m = e.tamanho / 2 - 2
      const naPedra = pedras.some(p => Math.abs(e.x - p.x) < p.largura / 2 + m && Math.abs(e.y - p.y) < p.altura / 2 + m)
      const fora = e.x < area.esquerda + m || e.x > area.direita - m || e.y < area.topo + m || e.y > area.base - m
      return naPedra || fora
    }).map(e => [e.constructor.name, Math.round(e.x), Math.round(e.y)])
  })()`)

const distanciasAoLider = () => cena(`c.aliados.filter(a => !a.caido && !a.perdido).map(a => Math.round(Math.hypot(a.x - c.lider.x, a.y - c.lider.y)))`)
const tirarInimigos = () => cena(`([...c.inimigos].forEach(i => c.matarInimigo(i)), true)`)

// Atalhos da 5b
const membro = (classe) => `c.grupo.find(m => m.classe === '${classe}')`
const textosNaTela = () => cena(`c.children.list.filter(o => o.type === 'Text' && o.visible).map(o => o.text)`)
const temTexto = async (texto) => (await textosNaTela()).includes(texto)
// Derruba um membro do grupo: deixa com 1 de vida e dá um golpe forte (passa pela regra de verdade)
const derrubar = (expr) =>
  cena(`(() => { const m = ${expr}; m.vida = 1; m.fimDaImunidade = 0; c.membroLevaGolpe(m, 999, { x: m.x - 10, y: m.y }, 0); return m.caido })()`)
const tituloDaTela = () => avaliar(`document.querySelector('.tela .titulo')?.textContent ?? ''`)

// Atalhos da 5c
const salvo = () => avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso`)
const preferenciasSalvas = () => avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:preferencias'))`)
const temJanela = (titulo) => avaliar(`!!document.querySelector('[role=dialog][aria-label=${JSON.stringify(titulo)}]')`)
const linhasDoResumo = () =>
  avaliar(`Object.fromEntries([...document.querySelectorAll('.detalhes dt')].map(dt => [dt.textContent, dt.nextElementSibling.textContent]))`)
const xpTotal = (personagem) => xpTotalAteONivel(personagem.nivel) + personagem.xp
const esperarResumo = (ms = 4000) => esperar(`document.querySelector('.tela .titulo')?.textContent === 'Resumo'`, 'o Resumo', ms)
// Volta com Q sem esperar os 15 s inteiros: o relógio da contagem é adiantado (a contagem de verdade é conferida na seção 23)
async function voltarComQ() {
  await esperar(`!${CENA}.emCombate`, 'o grupo sair de combate', 9000)
  await apertar('q')
  await cena(`(c.retorno.msRestantes = 400, true)`)
  await esperarResumo()
  await pausa(150)
}
// Como a arena está antes de acabar: perdidos, caídos e o Líder (posições como a arena manda) e o ouro ganho
const fotoDoFim = () =>
  cena(`({
    perdidos: c.perdidos.map(p => ({ x: p.x, y: p.y })),
    caidos: c.grupo.filter(m => m.caido).map(m => ({ x: Math.round(m.x), y: Math.round(m.y) })),
    lider: { x: Math.round(c.lider.x), y: Math.round(c.lider.y) },
    ouro: c.ganhos.ouro,
  })`)
// A taxa esperada sai aqui da mesma regra da etapa 4 (RF48), e o Resumo tem de mostrar a mesma conta
function conferirTaxa(nome, como, foto, linhas) {
  const taxa =
    como === 'fuga'
      ? taxaNaDistancia('fuga', distanciaAoInicio(foto.lider), BORDA)
      : como === 'todosDesmaiaram'
        ? taxaNaDistancia('todosDesmaiam', distanciaAoInicio(foto.lider), BORDA)
        : [...foto.perdidos, ...foto.caidos].reduce((soma, ponto) => soma + taxaNaDistancia('perdido', distanciaAoInicio(ponto), BORDA), 0)
  const { taxaEmOuro, ouroRecebido } = aplicarTaxa(foto.ouro, taxa)
  conferir(
    `${nome}: taxa ${taxa}% (−${taxaEmOuro} de ${foto.ouro} de ouro)`,
    linhas['Taxa'] === `${taxa}% (−${taxaEmOuro} de ouro)` && linhas['Ouro recebido'] === String(ouroRecebido) && linhas['Ouro ganho'] === String(foto.ouro),
    { esperado: { taxa, taxaEmOuro, ouroRecebido }, resumo: linhas },
  )
  return { taxa, taxaEmOuro, ouroRecebido }
}
// Clica num botão da linha de um personagem no painel DEV (Personagens do save)
async function botaoDoPersonagem(nome, texto, vezes = 1) {
  for (let i = 0; i < vezes; i++) {
    const ok = await avaliar(`(() => {
      const linha = [...document.querySelectorAll('.painel-dev-personagem')].find(l => l.textContent.startsWith(${JSON.stringify(nome)}))
      const botao = linha && [...linha.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(texto)})
      if (!botao || botao.disabled) return false
      botao.click()
      return true
    })()`)
    if (!ok) throw new Error(`não achei o botão "${texto}" de ${nome} no painel DEV`)
    await pausa(60)
  }
}
// O HUD cabe? Nenhuma linha estoura, os blocos não se encostam e nada fica embaixo do botão Configurações
const CABE_NO_HUD = `(() => {
  const hud = document.querySelector('.hud')
  const r = (el) => el.getBoundingClientRect()
  const estouradas = [...hud.querySelectorAll('.hud-linha')].filter(l => l.scrollWidth > l.clientWidth + 1).length
  const config = [...document.querySelectorAll('.tela-partida > .botao')].find(b => b.textContent === 'Configurações')
  const p = r(hud.querySelector('.hud-principal')), n = r(hud.querySelector('.hud-numeros')), m = r(hud.querySelector('.hud-minimapa')), c = r(config)
  return { estouradas, emOrdem: p.right <= n.left + 1 && n.right <= m.left + 1 && m.right <= c.left + 1, altura: hud.scrollHeight <= hud.clientHeight + 1 }
})()`
// Clica no botão da linha de uma lista (por exemplo, "Contratar" na linha do Arqueiro, na Guilda)
async function clicarNaLinha(textoDaLinha, textoDoBotao) {
  const ok = await avaliar(`(() => {
    const linha = [...document.querySelectorAll('li')].find(l => l.textContent.startsWith(${JSON.stringify(textoDaLinha)}))
    const botao = linha && [...linha.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(${JSON.stringify(textoDoBotao)}))
    if (!botao) return false
    botao.click()
    return true
  })()`)
  if (!ok) throw new Error(`não achei "${textoDoBotao}" na linha "${textoDaLinha}"`)
  await pausa(150)
}
// IA do aliado de uma classe, como a partida decide (pelo nível dele, sem o seletor da barra de teste)
const iaDoAliado = (classe) => cena(`c.perfilDaIA(${membro(classe)}).id`)

// Do Reino (ou, com doReino = false, do Mapa) até a arena
async function irAteAPartida(doReino = true) {
  if (doReino) await clicar('Jogar')
  // A arena de teste da Fase 1 (só no npm run dev): vai direto para a Preparação
  await clicar('Arena de teste')
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Preparação'`, 'Preparação')
  await clicar('Começar partida')
  await esperar(`!!document.querySelector('.arena canvas') && !!window.__jogoDaPartida?.scene?.getScene('arena')?.lider`, 'arena', 15000)
  await pausa(600)
}

// ---------- Roteiro ----------

try {
  await cdp.enviar('Page.navigate', { url: SITE })
  await esperar(`document.readyState === 'complete' && !!document.querySelector('.moldura')`, 'página')
  await avaliar(`localStorage.clear()`)
  await cdp.enviar('Page.reload', {})
  await pausa(400)
  await esperar(`document.readyState === 'complete' && !!document.querySelector('.moldura')`, 'página recarregar')
  await avaliar(`(() => {
    window.__erros = []
    window.addEventListener('error', (e) => window.__erros.push(String(e.message)))
    const erro = console.error.bind(console)
    console.error = (...a) => { window.__erros.push(a.map(String).join(' ')); erro(...a) }
  })()`)

  console.log('1. Caminho até a Partida (convidado novo, Mago)')
  await clicar('Iniciar jogo')
  // Tecla M (mudo) não vale enquanto se digita num campo de texto (o "m" de um e-mail)
  await avaliar(`document.querySelector('input')?.focus()`)
  await apertar('m')
  conferir('digitando "m" num campo de texto, o mudo não liga', (await preferenciasSalvas())?.mudo !== true, await preferenciasSalvas())
  await avaliar(`document.activeElement?.blur()`)
  await clicar('Jogar como convidado')
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Narrativa inicial'`, 'Narrativa')
  await clicar('Continuar')
  // Seleção de classe (TASK-071): clicar mostra a descrição e o pentágono; "Escolher" confirma
  const formaDoPentagono = () => avaliar(`document.querySelector('.pentagono-forma')?.getAttribute('data-forma')`)
  await clicar('Tanque')
  const formaDoTanque = await formaDoPentagono()
  await clicar('Arqueiro')
  const formaDoArqueiro = await formaDoPentagono()
  conferir('Seleção de classe: do Tanque para o Arqueiro, o pentágono muda de forma (TASK-071)', !!formaDoTanque && formaDoTanque !== formaDoArqueiro)
  conferir('Seleção de classe: mostra o papel e a descrição da classe', (await avaliar(`document.body.innerText`)).includes('Dano em alvo único'))
  conferir('clicar numa classe ainda não escolhe (ficamos na Seleção)', (await tituloDaTela()) === 'Seleção de classe')
  await clicar('Mago')
  await print('00-selecao-de-classe')
  await clicar('Escolher Mago')
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Reino'`, 'Reino')
  conferir('HUD do Reino: apelido, Líder, ouro e missão do save', (await avaliar(`document.body.innerText`)).includes('Convidado · Líder: Mago · Ouro: 0 · Missão: nenhuma'))
  await irAteAPartida()
  await pausa(200)
  conferir('um canvas só (StrictMode não cria dois jogos)', (await avaliar(`document.querySelectorAll('canvas').length`)) === 1)
  console.log(`  (renderizador: ${await avaliar(`window.__jogoDaPartida.renderer.type === 2 ? 'WebGL' : 'Canvas'`)})`)
  const hud = await textoDe('.hud')
  conferir('HUD mostra o Líder, a vida e a mana', hud.includes('Líder: Mago') && hud.includes('80 / 80') && hud.includes('Mana'), hud.split('\n').slice(0, 4))
  conferir('barra de teste marcada como TESTE', (await textoDe('.barra-de-teste')).includes('TESTE'))
  conferir(
    '3 mobs vermelhos e 1 atirador no começo',
    JSON.stringify(await cena(`c.inimigos.map(i => i.constructor.name).sort()`)) === JSON.stringify(['Atirador', 'MobVermelho', 'MobVermelho', 'MobVermelho']),
  )
  await pausa(2500) // tempo para todos passearem um pouco
  conferir('todo mundo tem posição válida depois de passear (sem NaN)', await cena(`[...c.grupo, ...c.inimigos].every(e => Number.isFinite(e.x) && Number.isFinite(e.y))`))
  await print('01-arena-inicio')

  console.log('2. HUD e barra de teste fora da área jogável')
  const faixas = await avaliar(`(() => {
    const canvas = document.querySelector('.arena canvas').getBoundingClientRect()
    const hud = document.querySelector('.hud').getBoundingClientRect()
    const barra = document.querySelector('.barra-de-teste').getBoundingClientRect()
    const config = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Configurações').getBoundingClientRect()
    const escala = canvas.height / 900
    return { topo: canvas.top + ${AREA.topo} * escala, base: canvas.top + ${AREA.base} * escala, hud: hud.bottom, barra: barra.top, config: config.bottom }
  })()`)
  conferir('o HUD acaba onde começa a área jogável', faixas.hud <= faixas.topo + 1, faixas)
  conferir('a barra de teste começa onde acaba a área jogável', faixas.barra >= faixas.base - 1, faixas)
  conferir('o botão Configurações fica dentro da faixa do HUD', faixas.config <= faixas.topo + 1, faixas)
  conferir('o conteúdo do HUD cabe na faixa', await avaliar(`(() => { const h = document.querySelector('.hud'); return h.scrollHeight <= h.clientHeight + 1 })()`))
  await colocarLider(300, AREA.topo + 60)
  await segurar(['w'], 600)
  conferir('o Líder não entra embaixo do HUD', (await cena(`c.lider.y`)) >= AREA.topo + 19, await cena(`Math.round(c.lider.y)`))
  await colocarLider(300, AREA.base - 40)
  await segurar(['s'], 600)
  conferir('o Líder não entra embaixo da barra de teste', (await cena(`c.lider.y`)) <= AREA.base - 19, await cena(`Math.round(c.lider.y)`))

  console.log('3. Movimento (WASD), diagonal e esquiva')
  await colocarLider(300, 430)
  let antes = await cena(`({ x: c.lider.x, y: c.lider.y })`)
  await segurar(['d'], 500)
  let depois = await cena(`({ x: c.lider.x, y: c.lider.y })`)
  conferir('D anda para a direita', depois.x - antes.x > 60 && Math.abs(depois.y - antes.y) < 3, { dx: Math.round(depois.x - antes.x), dy: Math.round(depois.y - antes.y) })
  // Velocidade lida no meio do movimento (não depende de quantos quadros o navegador escondido desenhou)
  const velocidadeSegurando = async (nomes) => {
    for (const nome of nomes) await tecla(nome, 'keyDown')
    await pausa(250)
    const velocidade = await cena(`Math.hypot(c.lider.corpo.body.velocity.x, c.lider.corpo.body.velocity.y)`)
    for (const nome of nomes) await tecla(nome, 'keyUp')
    await pausa(100)
    return velocidade
  }
  await colocarLider(300, 430)
  const reto = await velocidadeSegurando(['d'])
  const diagonal = await velocidadeSegurando(['d', 's'])
  conferir('na diagonal anda na mesma velocidade que reto (±5%)', Math.abs(diagonal / reto - 1) < 0.05, { reto: Math.round(reto), diagonal: Math.round(diagonal) })
  conferir('a página não rola com o Espaço', (await avaliar(`window.scrollY`)) === 0)
  await colocarLider(300, 430)
  await mirarEm(700, 430)
  antes = await cena(`({ x: c.lider.x })`)
  await apertar('espaco')
  await pausa(250)
  depois = await cena(`({ x: c.lider.x })`)
  conferir('parado, a esquiva avança na direção da mira (~160 px)', depois.x - antes.x > 100, Math.round(depois.x - antes.x))
  const recargaHud = await textoDe('.hud')
  conferir('o HUD mostra a esquiva', recargaHud.includes('Esquiva'))
  await colocarLider(800, 450)
  await mirarEm(1200, 450)
  conferir('mouse à direita → mira 0°', Math.abs(await cena(`c.anguloDaMira`)) < 0.05)
  await mirarEm(800, 150)
  conferir('mouse acima → mira -90°', Math.abs((await cena(`c.anguloDaMira`)) + Math.PI / 2) < 0.05)

  console.log('4. Ataques de teste no boneco (sem inimigos por perto)')
  await tirarInimigos()
  const vidaDoBoneco = () => cena(`c.boneco.vida`)
  await colocarLider(420, 520)
  await pausa(300)
  await atacarEm(420, 290)
  await pausa(180)
  await print('02-mago-bola')
  await pausa(900)
  conferir('Mago: a bola acerta o boneco', (await vidaDoBoneco()) < 300, await vidaDoBoneco())
  await clicar('Guerreiro')
  conferir('trocou o Líder para Guerreiro', (await cena(`c.lider.classe`)) === 'guerreiro')
  await pausa(3200)
  conferir('o boneco recupera a vida depois de 3 s', (await vidaDoBoneco()) === 300)
  await colocarLider(420, 350)
  await atacarEm(420, 290)
  await pausa(60)
  await print('03-guerreiro-espada')
  conferir('Guerreiro: a espada acerta o boneco', (await vidaDoBoneco()) < 300, await vidaDoBoneco())
  await clicar('Arqueiro')
  await pausa(3200)
  await colocarLider(420, 650)
  await atacarEm(420, 290)
  await pausa(40)
  await print('04-arqueiro-flecha')
  await pausa(500)
  conferir('Arqueiro: a flecha acerta o boneco', (await vidaDoBoneco()) < 300, await vidaDoBoneco())
  await clicar('Sacerdote')
  await cena(`(c.lider.vida = 30, true)`)
  await colocarLider(300, 430)
  await atacarEm(500, 430)
  await pausa(200)
  await print('05-sacerdote-aura')
  await pausa(1200)
  conferir('Sacerdote: a aura cura o Líder', (await cena(`c.lider.vida`)) > 30, await cena(`c.lider.vida`))
  await clicar('Tanque')
  conferir('Tanque tem escudo', await cena(`!!c.lider.escudo`))
  await colocarLider(420, 360)
  await mirarEm(420, 290)
  await pausa(3200)
  await atacarEm(420, 290)
  await pausa(60)
  await print('06-tanque-escudo')
  conferir('Tanque: o empurrão do escudo acerta o boneco', (await vidaDoBoneco()) < 300, await vidaDoBoneco())

  console.log('5. Inimigos com o Líder sozinho: mob vermelho e atirador')
  await clicar('Guerreiro')
  await colocarLider(700, 450)
  await clicar('Criar mob vermelho')
  const mob = `c.inimigos.find(i => i.constructor.name === 'MobVermelho')`
  const posicaoDoMob = await cena(`(() => { const m = ${mob}; return { x: m.x, y: m.y } })()`)
  await colocarLider(Math.max(80, posicaoDoMob.x - 250), Math.min(AREA.base - 40, Math.max(AREA.topo + 40, posicaoDoMob.y)))
  await pausa(400)
  conferir('dentro do raio, o mob persegue', (await cena(`${mob}.estado`)) !== 'passeando', await cena(`${mob}.estado`))
  await cena(`(c.lider.vida = c.lider.vidaMaxima, true)`)
  let viuAviso = false
  for (let i = 0; i < 40 && !viuAviso; i++) {
    viuAviso = (await cena(`${mob}.estado`)) === 'avisando'
    if (!viuAviso) await pausa(50)
  }
  conferir('antes de bater, o mob avisa (pisca e encolhe)', viuAviso)
  if (viuAviso) await print('07-mob-avisando')
  await pausa(900)
  const vidaDepoisDoBote = await cena(`c.lider.vida`)
  conferir('o bote acerta o Líder e tira vida', vidaDepoisDoBote < (await cena(`c.lider.vidaMaxima`)), vidaDepoisDoBote)
  const longe = await cena(`(() => { const m = ${mob}; return { x: m.x > 800 ? 80 : 1520, y: m.y > 440 ? ${AREA.topo + 40} : ${AREA.base - 40} } })()`)
  await colocarLider(longe.x, longe.y)
  await pausa(900)
  conferir('com o Líder longe, o mob desiste e volta a passear', (await cena(`${mob}.estado`)) === 'passeando', await cena(`${mob}.estado`))

  await tirarInimigos()
  await clicar('Tanque')
  await cena(`(c.lider.vida = c.lider.vidaMaxima, true)`)
  await clicar('Criar atirador')
  const atirador = `c.inimigos.find(i => i.constructor.name === 'Atirador')`
  const lugarDoAtirador = { x: 1300, y: 500 }
  const lugar = { x: 920, y: 420 }
  await cena(`(${atirador}.colocarEm(${lugarDoAtirador.x}, ${lugarDoAtirador.y}), true)`)
  await colocarLider(lugar.x, lugar.y)
  const vidaAntes = await cena(`c.lider.vida`)
  let bloqueios = 0
  let tiros = 0
  for (let i = 0; i < 50; i++) {
    const a = await cena(`(() => { const a = ${atirador}; return { x: a.x, y: a.y } })()`)
    await mirarEm(a.x, a.y)
    await colocarLider(lugar.x, lugar.y)
    tiros = Math.max(tiros, await cena(`c.projeteis.filter(p => p.constructor.name === 'TiroInimigo').length`))
    bloqueios = await cena(`c.children.list.filter(o => o.type === 'Text' && o.text === 'BLOQUEADO').length`)
    if (bloqueios > 0) break
    await pausa(100)
  }
  conferir('o atirador atira', tiros > 0, tiros)
  await print('08-atirador-bloqueado')
  conferir('o escudo bloqueia o tiro ("BLOQUEADO")', bloqueios > 0)
  conferir('com o escudo na frente, o Líder não perde vida', (await cena(`c.lider.vida`)) === vidaAntes, { antes: vidaAntes, depois: await cena(`c.lider.vida`) })

  const antesDeCriar = await cena(`c.inimigos.length`)
  await clicar('Criar mob vermelho')
  await clicar('Criar atirador')
  await clicar('Criar mob vermelho')
  conferir('os botões criam inimigos', (await cena(`c.inimigos.length`)) === antesDeCriar + 3)
  // Nascem com folga em volta (Fase 3); encostar depois, passeando, é contato normal da física (até 1 px), não nascer em cima
  conferir('inimigos criados nascem em lugar livre', (await sobrepostos(1)).length === 0 && (await dentroDePedra()).length === 0, { sobrepostos: await sobrepostos(1), pedra: await dentroDePedra() })
  await clicar('Invencível: não')
  conferir('Invencível liga', await cena(`c.invencivel`))
  await pausa(600)
  const vidaInvencivel = await cena(`c.lider.vida`)
  await cena(`(c.liderLevaGolpe(50, { x: c.lider.x - 10, y: c.lider.y }, 100), true)`)
  conferir('invencível não perde vida', (await cena(`c.lider.vida`)) === vidaInvencivel)
  await clicar('Invencível: sim')
  await cena(`(c.lider.fimDaImunidade = 0, c.liderLevaGolpe(10, { x: c.lider.x - 10, y: c.lider.y }, 100), true)`)
  conferir('desligado o Invencível, o golpe tira vida', (await cena(`c.lider.vida`)) === vidaInvencivel - 10, { antes: vidaInvencivel, depois: await cena(`c.lider.vida`) })
  await tirarInimigos()

  console.log('6. Habilidades do Líder (teclas 1 a 3), mana e recarga')
  await clicar('Guerreiro')
  await clicar('Recarregar habilidades')
  const hudDasHabilidades = await textoDe('.hud')
  conferir('o HUD mostra a mana e as teclas 1 a 3 (a 2 e a 3 vazias)', hudDasHabilidades.includes('Giro') && (hudDasHabilidades.match(/vazio/g) ?? []).length === 2, hudDasHabilidades.replace(/\n/g, ' · '))
  await colocarLider(800, 450)
  await clicar('Criar mob vermelho')
  await clicar('Criar mob vermelho')
  await cena(`(c.inimigos[0].colocarEm(860, 450), c.inimigos[1].colocarEm(740, 450), true)`)
  const manaAntesDoGiro = await cena(`c.lider.mana`)
  await apertar('um')
  const vidasDepoisDoGiro = await cena(`c.inimigos.map(i => i.vida)`)
  await print('09-giro')
  conferir('Giro (tecla 1): acerta os dois mobs em volta', vidasDepoisDoGiro.length === 2 && vidasDepoisDoGiro.every((vida) => vida < 60), vidasDepoisDoGiro)
  const gasto = manaAntesDoGiro - (await cena(`c.lider.mana`))
  conferir('o Giro gasta 20 de mana', Math.abs(gasto - 20) < 1.5, Math.round(gasto * 10) / 10)
  await apertar('um')
  conferir('logo de novo: aparece "EM RECARGA" e nada sai', await temTexto('EM RECARGA'))
  conferir('o HUD mostra a recarga da tecla 1', await avaliar(`!!document.querySelector('.hud-espaco:not(.hud-espaco-pronto):not(.hud-espaco-vazio) .hud-tecla')`))
  await apertar('dois')
  conferir('tecla 2: "TECLA VAZIA"', await temTexto('TECLA VAZIA'))
  await clicar('Recarregar habilidades')
  await cena(`(c.lider.mana = 5, true)`)
  await apertar('um')
  conferir('com 5 de mana e custo 20: "SEM MANA" e a mana não muda (critério do card)', (await temTexto('SEM MANA')) && (await cena(`c.lider.mana`)) < 6.5)
  await print('10-sem-mana')
  await tirarInimigos()

  await clicar('Arqueiro')
  await clicar('Recarregar habilidades')
  await colocarLider(300, 450)
  for (const x of [600, 800, 1000]) {
    await clicar('Criar mob vermelho')
    await cena(`(c.inimigos.at(-1).colocarEm(${x}, 450), true)`)
  }
  await mirarEm(1200, 450)
  await apertar('um')
  await pausa(100)
  await print('11-tiro-perfurante')
  await pausa(600)
  conferir('Tiro perfurante: atravessa e derruba os 3 mobs da linha', (await cena(`c.inimigos.length`)) === 0, await cena(`c.inimigos.map(i => i.vida)`))
  await tirarInimigos()

  await clicar('Mago')
  await clicar('Recarregar habilidades')
  await colocarLider(300, 450)
  await clicar('Criar mob vermelho')
  await cena(`(c.inimigos.at(-1).colocarEm(750, 410), true)`)
  await clicar('Criar mob vermelho')
  await cena(`(c.inimigos.at(-1).colocarEm(770, 470), true)`)
  await mirarEm(760, 440)
  await apertar('um')
  await pausa(300)
  conferir('Meteoro: o aviso aparece no chão antes de cair', await cena(`c.projeteis.some(p => p.constructor.name === 'Meteoro')`))
  await print('12-meteoro-aviso')
  await pausa(700)
  conferir('Meteoro: a explosão acerta os dois mobs', await cena(`c.inimigos.length === 0 || c.inimigos.every(i => i.vida < 60)`), await cena(`c.inimigos.map(i => i.vida)`))
  await tirarInimigos()

  await clicar('Sacerdote')
  await clicar('Recarregar habilidades')
  const manaDoSacerdote = await cena(`c.lider.mana`)
  await apertar('um')
  conferir('Ressurreição sem ninguém caído: "NINGUÉM CAÍDO PERTO" e não gasta mana', (await temTexto('NINGUÉM CAÍDO PERTO')) && (await cena(`c.lider.mana`)) >= manaDoSacerdote - 0.5)

  console.log('7. Grupo: Encher grupo, ninguém em cima de ninguém, seguindo o Líder')
  await colocarLider(240, 430)
  await clicar('Encher grupo')
  await pausa(200)
  conferir('o grupo fica com as 5 classes', (await cena(`c.grupo.length`)) === 5)
  conferir('o save não muda (só 1 personagem)', (await avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso.personagens.length`)) === 1)
  conferir('ao Encher grupo, ninguém nasce em cima de outro', (await sobrepostos(0)).length === 0, await sobrepostos(0))
  conferir('ao Encher grupo, ninguém nasce numa pedra', (await dentroDePedra()).length === 0, await dentroDePedra())
  const hudDoGrupo = await textoDe('.hud')
  conferir('o HUD mostra os 4 aliados', ['Guerreiro', 'Mago', 'Tanque', 'Arqueiro'].every((nome) => hudDoGrupo.includes(nome)), hudDoGrupo.split('\n').join(' · '))
  await colocarLider(300, 430)
  await segurar(['d'], 900)
  await pausa(900)
  conferir('os aliados seguem o Líder de perto (≤ 150 px)', Math.max(...(await distanciasAoLider())) <= 150, await distanciasAoLider())
  conferir('seguindo, ninguém fica em cima de ninguém', (await sobrepostos()).length === 0, await sobrepostos())
  await print('13-grupo')

  await colocarLider(1120, 560)
  await cena(`(c.aliados.forEach((a, i) => a.colocarEm(860, 470 + i * 45)), true)`)
  for (let i = 0; i < 14; i++) {
    await colocarLider(1120, 560)
    await pausa(250)
  }
  conferir('todos contornam a pedra e chegam perto do Líder (≤ 160 px)', (await distanciasAoLider()).every((d) => d <= 160), await distanciasAoLider())

  console.log('8. Canto das pedras coladas (L): ninguém fica preso')
  await colocarLider(380, AREA.base - 43)
  const noCanto = [
    [235, 630],
    [190, 635],
    [240, 585],
    [150, 625],
  ]
  await cena(`(c.aliados.forEach((a, i) => a.colocarEm(...${JSON.stringify(noCanto)}[i])), true)`)
  await pausa(100)
  await print('14-canto-antes')
  for (let i = 0; i < 24; i++) {
    await colocarLider(380, AREA.base - 43)
    await pausa(250)
  }
  conferir('saem do canto do L e chegam perto do Líder (≤ 170 px)', (await distanciasAoLider()).every((d) => d <= 170), await distanciasAoLider())
  conferir('no canto, ninguém entrou nas pedras', (await dentroDePedra()).length === 0, await dentroDePedra())
  await print('15-canto-depois')

  console.log('9. Espremer o grupo contra a pedra: eles saem do caminho sem entrar na pedra')
  // Pedra de (640, 210) a (760, 290). Um aliado encostado nela, o Líder logo atrás, empurrando para a direita.
  await colocarLider(560, 250)
  await cena(`(c.aliados[0].colocarEm(615, 250), c.aliados[1].colocarEm(615, 205), c.aliados[2].colocarEm(615, 295), c.aliados[3].colocarEm(570, 205), true)`)
  // Enquanto o Líder empurra, no máximo a borda de um encosta na do outro (até 6 px de 40); soltou, ninguém
  await tecla('d', 'keyDown')
  const durante = []
  for (let i = 0; i < 12; i++) {
    durante.push(...(await sobrepostos(6)))
    await pausa(100)
  }
  await tecla('d', 'keyUp')
  const aliadoDepois = await cena(`({ x: c.aliados[0].x, y: c.aliados[0].y })`)
  const liderDepois = await cena(`({ x: c.lider.x, y: c.lider.y })`)
  conferir('o Líder chegou à pedra: os aliados saíram da frente dele', liderDepois.x > 600, Math.round(liderDepois.x))
  conferir('o aliado que estava na frente foi para o lado ou para trás', Math.abs(aliadoDepois.y - liderDepois.y) >= 30 || aliadoDepois.x < liderDepois.x, { aliado: aliadoDepois, lider: liderDepois })
  conferir('apertando, ninguém entra mais que 6 px em ninguém (12 amostras)', durante.length === 0, durante)
  await pausa(400)
  conferir('depois do aperto, ninguém fica em cima de ninguém', (await sobrepostos(1)).length === 0, await sobrepostos(1))
  conferir('espremidos, ninguém entra na pedra', (await dentroDePedra()).length === 0, await dentroDePedra())
  await print('16-espremer')

  console.log('10. Juntar todos: a zona separa todo mundo aos poucos')
  await clicar('Invencível: não')
  await colocarLider(820, 440)
  await clicar('Criar mob vermelho')
  await clicar('Criar mob vermelho')
  await clicar('Criar atirador')
  // Mede no mesmo instante do comando (o botão manda o mesmo comando pela ponte)
  const juntos = await cena(`(c.ponte.avisar('comando', { tipo: 'juntarTodos' }), window.__juntouEm = c.relogio, Math.max(...[...c.aliados, ...c.inimigos].map(e => Math.hypot(e.x - c.lider.x, e.y - c.lider.y))))`)
  conferir('Juntar todos põe todos no mesmo ponto', juntos < 1, Math.round(juntos))
  // Exatamente 0,1 s de partida depois (pelo relógio do jogo; antes, um print no meio às vezes deixava passar 0,3 s)
  await esperar(`${CENA}.relogio >= window.__juntouEm + 100`, '0,1 s de partida', 3000)
  // Só os aliados: os mobs já levam empurrões de combate (o escudo do Tanque joga longe), o que não é pulo
  const logoDepois = await cena(`Math.max(...c.aliados.map(e => Math.hypot(e.x - c.lider.x, e.y - c.lider.y)))`)
  conferir('sem pulo: em 0,1 s nenhum aliado foi longe (≤ 120 px)', logoDepois <= 120, Math.round(logoDepois))
  await print('17-juntar-todos')
  await clicar('Juntar todos', true, 0)
  const peloBotao = await cena(`Math.max(...[...c.aliados, ...c.inimigos].map(e => Math.hypot(e.x - c.lider.x, e.y - c.lider.y)))`)
  conferir('o botão "Juntar todos" faz o mesmo', peloBotao < 60, Math.round(peloBotao))
  await pausa(1500)
  conferir('depois de 1,5 s, ninguém está em cima de ninguém', (await sobrepostos()).length === 0, await sobrepostos())
  conferir('e ninguém foi parar numa pedra ou fora da área', (await dentroDePedra()).length === 0, await dentroDePedra())
  await print('18-separados')
  await tirarInimigos()

  console.log('11. Aliados lutando (TASK-043), na IA avançada (5b.1)')
  await clicar('Mago') // o Líder vira o Mago e o Mago aliado vira o Sacerdote: o grupo tem as 5 classes
  await clicar('Recarregar habilidades')
  conferir('pelo nível, os aliados de nível 1 usam a IA básica (HUD)', (await textoDe('.hud')).includes('IA básica'))
  await clicar('IA: pelo nível')
  await clicar('IA: básica')
  await clicar('IA: média')
  conferir('o seletor da barra de teste troca a IA: pelo nível → básica → média → avançada', (await textoDe('.barra-de-teste')).includes('IA: avançada'))
  conferir('o HUD mostra a IA de cada aliado', (await textoDe('.hud')).includes('IA avançada'))
  await cena(`(c.grupo.forEach(m => { if (m.caido) c.levantar(m, { vida: m.vidaMaxima }); m.vida = m.vidaMaxima }), true)`)
  await colocarLider(420, 450)
  await pausa(1200)
  for (const [x, y] of [
    [700, 380],
    [720, 480],
    [760, 430],
  ]) {
    await clicar('Criar mob vermelho')
    await cena(`(c.inimigos.at(-1).colocarEm(${x}, ${y}), true)`)
  }
  // Vida que sobra nos mobs (os que morreram contam 0)
  const vidaDosMobs = () => cena(`c.inimigos.filter(i => !i.morto).reduce((soma, i) => soma + i.vida, 0)`)
  const vidaInicialDosMobs = await vidaDosMobs()
  let noTanque = 0
  let perseguindo = 0
  let arqueiroLonge = 0
  let amostras = 0
  let comSobreposicao = 0
  for (let i = 0; i < 30; i++) {
    await colocarLider(420, 450)
    const amostra = await cena(`(() => {
      const tanque = ${membro('tanque')}, arqueiro = ${membro('arqueiro')}
      const vivos = c.inimigos.filter(i => !i.morto)
      return {
        perseguindo: vivos.filter(i => i.alvo).length,
        noTanque: vivos.filter(i => i.alvo && i.alvo === tanque).length,
        arqueiro: arqueiro && !arqueiro.caido && vivos.length ? Math.min(...vivos.map(i => Math.hypot(i.x - arqueiro.x, i.y - arqueiro.y))) : null,
      }
    })()`)
    perseguindo += amostra.perseguindo
    noTanque += amostra.noTanque
    if (amostra.arqueiro !== null) {
      amostras++
      if (amostra.arqueiro > 70) arqueiroLonge++
    }
    if ((await sobrepostos(6)).length > 0) comSobreposicao++
    if (i === 6) await print('19-aliados-lutando')
    await pausa(200)
  }
  conferir('os mobs miram o Tanque na maior parte do tempo', perseguindo > 0 && noTanque / perseguindo >= 0.5, { noTanque, perseguindo })
  conferir('o Arqueiro não encosta nos mobs (≥ 90% do tempo a mais de 70 px)', amostras === 0 || arqueiroLonge / amostras >= 0.9, { arqueiroLonge, amostras })
  conferir('os aliados lutam: os mobs perdem vida', (await vidaDosMobs()) < vidaInicialDosMobs, { antes: vidaInicialDosMobs, depois: await vidaDosMobs() })
  conferir('lutando, quase nunca alguém fica em cima de alguém (≤ 10% das amostras)', comSobreposicao <= 3, comSobreposicao)
  await print('20-depois-da-luta')

  console.log('12. Se o Líder se afasta demais, todos voltam (corrente)')
  await clicar('Criar mob vermelho')
  await cena(`(c.inimigos.at(-1).colocarEm(560, 450), true)`)
  for (let i = 0; i < 20; i++) {
    await colocarLider(1350, 200)
    await pausa(250)
  }
  conferir('nenhum aliado fica para trás quando o Líder foge (≤ 220 px)', (await distanciasAoLider()).every((d) => d <= 220), await distanciasAoLider())
  await tirarInimigos()

  console.log('12b. Parados sem tremor, nos 3 níveis da IA (no canto, no L e encostado na pedra)')
  await cena(`(c.grupo.forEach(m => { if (m.caido) c.levantar(m, { vida: m.vidaMaxima }) }), true)`)
  const lugaresParados = [
    ['no canto', { x: AREA.esquerda + 45, y: AREA.topo + 45 }],
    ['no canto do L', { x: 230, y: 615 }],
    ['encostado na pedra', { x: 615, y: 250 }],
  ]
  for (const nivel of ['basica', 'media', 'avancada']) {
    await cena(`(c.trocarIA('${nivel}'), true)`)
    for (const [nome, lugar] of lugaresParados) {
      await colocarLider(lugar.x, lugar.y)
      // Aliados jogados em volta do Líder, cada um num lugar livre, todos com a vida cheia (com alguém ferido, o
      // Sacerdote anda até ele para curar, e isso não é tremor)
      await cena(`(() => {
        c.grupo.forEach(m => { if (!m.caido) m.vida = m.vidaMaxima })
        const desvios = [[-70, 0], [0, 70], [70, 0], [0, -70]]
        c.aliados.forEach((a, i) => { const p = c.lugarLivre(a.tamanho, { x: ${lugar.x} + desvios[i % 4][0], y: ${lugar.y} + desvios[i % 4][1] }, a); a.colocarEm(p.x, p.y) })
        return true
      })()`)
      await pausa(2000)
      const antes = await cena(`c.aliados.map(a => ({ x: a.x, y: a.y, classe: a.classe }))`)
      await pausa(1000)
      // Na falha, o estado de cada um que andou: plano, parado, voltando, desvio, distância ao Líder, velocidade pedida e travamento
      const depois = await cena(`c.aliados.map(a => ({
        x: a.x, y: a.y, plano: a.ia.ultimoPlano, parado: !!a.ia.parado, voltando: !!a.ia.voltando, desvio: !!a.ia.desvio,
        lider: Math.round(Math.hypot(a.x - c.lider.x, a.y - c.lider.y)), querida: Math.round(Math.hypot(a.querida.x, a.querida.y)),
        travou: a.travamento?.nivel ?? 0, quieto: (a.ia.quietoAte ?? 0) > c.agora, inimigos: c.inimigos.length,
      }))`)
      const andaram = antes.map((p, i) => ({ classe: p.classe, px: Math.round(Math.hypot(depois[i].x - p.x, depois[i].y - p.y) * 10) / 10, ...depois[i], x: Math.round(depois[i].x), y: Math.round(depois[i].y) }))
      const maior = Math.max(...andaram.map((a) => a.px))
      conferir(`IA ${nivel}, Líder parado ${nome}: ninguém treme (≤ 3 px em 1 s)`, maior <= 3, maior <= 3 ? maior : andaram.filter((a) => a.px > 3))
      if (nivel === 'media' && nome === 'encostado na pedra') await print('21-parados-encostados-na-pedra')
    }
  }

  console.log('12c. Linha de tiro: Mago e Arqueiro com uma pedra entre eles e o mob')
  await clicar('Guerreiro') // o Mago e o Arqueiro ficam como aliados
  for (const nivel of ['basica', 'media', 'avancada']) {
    await tirarInimigos()
    await cena(`(c.trocarIA('${nivel}'), c.invencivel = true, true)`)
    // Pedra de (940, 490) a (1040, 630) entre o grupo (à esquerda) e um mob parado (à direita)
    await colocarLider(830, 560)
    await cena(`(() => {
      const lugares = { arqueiro: [800, 515], mago: [800, 605], tanque: [720, 520], sacerdote: [720, 600] }
      c.aliados.forEach(a => { const l = lugares[a.classe]; if (l) a.colocarEm(l[0], l[1]) })
      return true
    })()`)
    await clicar('Criar mob vermelho')
    await cena(`(() => {
      const m = c.inimigos.at(-1)
      m.colocarEm(1130, 560)
      m.vida = m.vidaMaxima = 99999
      m.atualizar = function () { this.parar() }
      c.contagemDeTiros = { disparados: {}, naPedra: {} }
      return true
    })()`)
    for (let i = 0; i < 10; i++) {
      await colocarLider(830, 560)
      await pausa(400)
    }
    const contagem = await cena(`c.contagemDeTiros`)
    const naPedra = (contagem.naPedra.arqueiro ?? 0) + (contagem.naPedra.mago ?? 0)
    const disparados = (contagem.disparados.arqueiro ?? 0) + (contagem.disparados.mago ?? 0)
    if (nivel === 'basica') {
      console.log(`  (IA básica: ${naPedra} de ${disparados} tiros do Arqueiro e do Mago na pedra; a básica pode errar isso)`)
    } else {
      conferir(`IA ${nivel}: Arqueiro e Mago não atiram na pedra`, naPedra === 0, contagem)
      conferir(`IA ${nivel}: eles acham um lugar com linha livre e atiram`, disparados > 0, contagem)
    }
    if (nivel === 'avancada') await print('22-linha-de-tiro')
  }
  await tirarInimigos()
  await cena(`(c.invencivel = false, true)`)
  await clicar('IA: avançada')
  conferir('o seletor volta para "IA: pelo nível"', (await textoDe('.barra-de-teste')).includes('IA: pelo nível'))
  await clicar('Mago') // de volta: o Líder é o Mago, e os aliados são Guerreiro, Sacerdote, Tanque e Arqueiro

  console.log('13. Aliado desmaia e é levantado (TASK-044 e TASK-045)')
  await cena(`(c.grupo.forEach(m => { if (m.caido) c.levantar(m, { vida: m.vidaMaxima }); m.vida = m.vidaMaxima; m.fimDaFragilidade = 0 }), true)`)
  await colocarLider(500, 450)
  await pausa(1500)
  // Guarda com quanta vida cada um foi levantado (logo depois, a aura do Sacerdote já pode curar)
  await cena(`(() => {
    c.__levantados = []
    const levantar = c.levantar.bind(c)
    c.levantar = (m, opcoes) => { c.__levantados.push({ classe: m.classe, vida: opcoes.vida, maxima: m.vidaMaxima, caidoDesde: m.caidoDesde, quando: c.agora }); levantar(m, opcoes) }
    return true
  })()`)
  // Ressurreição em recarga: assim dá para ver a ajuda de 5 s
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  const derrubouGuerreiro = await derrubar(membro('guerreiro'))
  await pausa(200)
  conferir('o Guerreiro desmaia: tomba e mostra a contagem dos 30 s', derrubouGuerreiro && (await cena(`${membro('guerreiro')}.textoDoDesmaio.visible`)))
  conferir('o HUD mostra o aliado caído com a contagem', (await textoDe('.hud')).includes('Guerreiro') && /caído: (30|29) s/.test(await textoDe('.hud')))
  await print('21-aliado-caido')
  await esperar(`${CENA}.grupo.find(m => m.classe === 'guerreiro') && !${CENA}.grupo.find(m => m.classe === 'guerreiro').caido`, 'o Guerreiro ser levantado', 15000)
  // Pelo relógio do jogo (o mesmo que a regra usa), do desmaio até levantar
  const levouSegundos = await cena(`(() => { const l = c.__levantados.find(l => l.classe === 'guerreiro'); return (l.quando - l.caidoDesde) / 1000 })()`)
  // 0,01 s de folga: a soma dos quadros tem erro de arredondamento na décima casa
  conferir('um aliado vai até ele e o levanta com a ajuda de 5 s (a área estava limpa)', levouSegundos >= 4.99 && levouSegundos <= 14, Math.round(levouSegundos * 1000) / 1000)
  const levantado = await cena(`(() => { const g = ${membro('guerreiro')}; const l = c.__levantados.find(l => l.classe === 'guerreiro'); return { vida: l.vida, maxima: l.maxima, fragil: g.fragil } })()`)
  conferir('volta com 10% da vida e frágil', levantado.vida === Math.ceil(levantado.maxima * 0.1) && levantado.fragil, levantado)
  await print('22-aliado-levantado')

  // Área suja: com um mob a menos de 250 px de quem caiu, a ajuda não anda
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await derrubar(membro('arqueiro'))
  await clicar('Criar mob vermelho')
  await cena(`(() => { const a = ${membro('arqueiro')}; c.inimigos.at(-1).colocarEm(a.x + 150, a.y); return true })()`)
  await pausa(150) // o mob já no lugar
  const amostrasDaArea = []
  for (let i = 0; i < 8; i++) {
    amostrasDaArea.push(
      await cena(`(() => { const a = ${membro('arqueiro')}; const sujo = c.inimigos.some(i => !i.morto && Math.hypot(i.x - a.x, i.y - a.y) < 250); return { sujo, progresso: a.progressoDaAjuda } })()`),
    )
    await pausa(120)
  }
  // Um mob na beira dos 250 px pode deixar a área limpa por um quadro (a ajuda conta esse quadro e zera no seguinte)
  conferir(
    'com inimigo a menos de 250 px, a ajuda não anda (área suja)',
    amostrasDaArea.some((a) => a.sujo) && amostrasDaArea.every((a) => !a.sujo || a.progresso <= 50),
    amostrasDaArea,
  )
  await esperar(`!${CENA}.grupo.find(m => m.classe === 'arqueiro').caido`, 'o Arqueiro ser levantado depois de limparem a área', 20000)
  conferir('limpa a área, o Arqueiro é levantado', true)
  await tirarInimigos()

  // Ressurreição: o Sacerdote com a habilidade pronta levanta o Tanque com vida cheia
  await cena(`(() => { const s = ${membro('sacerdote')}; s.ultimoUsoDaHabilidade[0] = null; s.mana = s.manaMaxima; return true })()`)
  await derrubar(membro('tanque'))
  await esperar(`!${CENA}.grupo.find(m => m.classe === 'tanque').caido`, 'a Ressurreição do Tanque', 10000)
  const ressuscitado = await cena(`(() => { const t = ${membro('tanque')}; const l = c.__levantados.find(l => l.classe === 'tanque'); return { vida: l.vida, maxima: l.maxima, fortalecido: t.fortalecido } })()`)
  conferir('o Sacerdote usa a Ressurreição: o Tanque volta com vida cheia e fortalecido', ressuscitado.vida === ressuscitado.maxima && ressuscitado.fortalecido, ressuscitado)
  await print('23-ressurreicao')

  // Perdido: sem ajuda em 30 s, a Pedra de Retorno leva o aliado (aqui o relógio é adiantado)
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await derrubar(membro('arqueiro'))
  await cena(`(${membro('arqueiro')}.caidoDesde = c.agora - 29600, true)`)
  await pausa(900)
  conferir('sem ajuda em 30 s, vira perdido: some do mapa e o lugar onde caiu fica guardado', await cena(`!c.grupo.some(m => m.classe === 'arqueiro') && c.perdidos.some(p => p.classe === 'arqueiro' && Number.isFinite(p.x) && Number.isFinite(p.y))`))
  conferir('o HUD mostra o perdido', (await textoDe('.hud')).includes('Arqueiro: perdido'))
  await print('24-perdido')

  console.log('14. Pausa congela o jogo; Configurações não pausam')
  await colocarLider(300, 430)
  // Fora de combate (5 s sem dano e nenhum mob atrás do grupo), a pausa abre
  await esperar(`!${CENA}.emCombate`, 'o grupo sair de combate', 9000)
  await apertar('esc')
  conferir('Esc abre a pausa', (await avaliar(`document.body.innerText`)).includes('Continuar'))
  conferir('a cena está pausada', await cena(`c.sys.isPaused()`))
  antes = await cena(`({ x: c.lider.x })`)
  await segurar(['d'], 400)
  depois = await cena(`({ x: c.lider.x })`)
  conferir('pausado, o Líder não anda', depois.x === antes.x, { antes: antes.x, depois: depois.x })
  const relogioNaPausa = await cena(`c.agora`)
  await pausa(700)
  conferir('pausado, o relógio da partida não anda (os 30 s do desmaio, as recargas e as contagens param)', (await cena(`c.agora`)) === relogioNaPausa)
  await print('25-pausa')
  await apertar('esc')
  conferir('Esc de novo fecha a pausa e o jogo volta', !(await cena(`c.sys.isPaused()`)))
  await clicar('Configurações')
  conferir('Configurações abertas não pausam', !(await cena(`c.sys.isPaused()`)))
  await segurar(['d'], 300)
  depois = await cena(`({ x: c.lider.x })`)
  conferir('com as Configurações abertas o Líder anda', depois.x > antes.x, { antes: antes.x, depois: depois.x })
  await apertar('esc')

  console.log('15. Voltar ao Reino de 15 s com o jogo rodando')
  await apertar('esc')
  await clicar('Voltar ao Reino (15 s)')
  await pausa(300)
  conferir('a contagem aparece', (await avaliar(`document.body.innerText`)).includes('Voltando ao Reino em 15 s'))
  conferir('o jogo não fica pausado durante a contagem', !(await cena(`c.sys.isPaused()`)))
  await pausa(2100)
  const texto = await avaliar(`document.body.innerText`)
  conferir('a contagem anda (13 s)', texto.includes('Voltando ao Reino em 13 s') || texto.includes('Voltando ao Reino em 12 s'), texto.match(/Voltando ao Reino em \d+ s/)?.[0])
  await print('26-retorno')
  await apertar('q') // Q de novo cancela (o botão "Cancelar retorno" saiu na 5c)
  conferir('Q cancela o retorno', (await cena(`c.retorno`)) === null)

  console.log('16. Tamanho da janela: o jogo se ajusta e a mira continua certa')
  await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1000, height: 640, deviceScaleFactor: 1, mobile: false })
  await pausa(1200)
  const caixa = await avaliar(`(() => { const m = document.querySelector('.moldura').getBoundingClientRect(); const c = document.querySelector('.arena canvas').getBoundingClientRect(); return { m: [Math.round(m.width), Math.round(m.height)], c: [Math.round(c.width), Math.round(c.height)] } })()`)
  conferir('o canvas acompanha a caixa 16:9', Math.abs(caixa.m[0] - caixa.c[0]) <= 2 && Math.abs(caixa.m[1] - caixa.c[1]) <= 2, caixa)
  const cabeNaMenor = await avaliar(CABE_NO_HUD)
  conferir('na janela menor, o HUD ainda cabe (altura, linhas e o botão Configurações)', cabeNaMenor.estouradas === 0 && cabeNaMenor.emOrdem && cabeNaMenor.altura, cabeNaMenor)
  await colocarLider(800, 450)
  await mirarEm(800, 750)
  conferir('mouse abaixo → mira 90° no tamanho novo', Math.abs((await cena(`c.anguloDaMira`)) - Math.PI / 2) < 0.05)
  await print('27-janela-menor')
  await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })
  await pausa(800)

  console.log('17. Painel de desenvolvimento: minimiza e abre de novo')
  await avaliar(`document.querySelector('[aria-label="Minimizar o painel"]').click()`)
  await pausa(150)
  conferir('minimizado, vira o botãozinho "</> DEV"', (await avaliar(`document.querySelector('.painel-dev-mini')?.textContent`)) === '</> DEV' && !(await avaliar(`!!document.querySelector('.painel-dev')`)))
  await print('28-painel-minimizado')
  await avaliar(`document.querySelector('.painel-dev-mini').click()`)
  await pausa(150)
  conferir('o botãozinho abre o painel de novo', await avaliar(`!!document.querySelector('.painel-dev')`))

  console.log('18. FPS e tempo da lógica')
  await clicar('Criar mob vermelho')
  await clicar('Criar mob vermelho')
  await clicar('Criar atirador')
  const logica = await avaliar(`new Promise(resolver => {
    const c = ${CENA}
    const original = c.sys.sceneUpdate
    let soma = 0, quadros = 0
    c.sys.sceneUpdate = function (...argumentos) { const t = performance.now(); original.apply(this, argumentos); soma += performance.now() - t; quadros++ }
    setTimeout(() => { c.sys.sceneUpdate = original; resolver(soma / Math.max(1, quadros)) }, 2000)
  })`)
  console.log(`  (FPS no navegador escondido: ${await cena(`Math.round(window.__jogoDaPartida.loop.actualFps)`)})`)
  console.log(`  (lógica do jogo: ${logica.toFixed(2)} ms por quadro, com ${await cena(`c.grupo.length + c.inimigos.length`)} corpos)`)
  conferir('a lógica do jogo cabe folgada num quadro (< 4 ms)', logica < 4, Number(logica.toFixed(2)))
  conferir('a barra de teste mostra o FPS', /\d+ FPS/.test(await textoDe('.barra-de-teste')))
  conferir('no fim da sessão, todo mundo ainda tem posição válida', await cena(`[...c.grupo, ...c.inimigos].every(e => Number.isFinite(e.x) && Number.isFinite(e.y))`))
  await tirarInimigos()

  console.log('19. Líder desmaiado: os aliados levantam; sem ajuda em 30 s, Retorno forçado')
  await cena(`(c.invencivel = false, true)`)
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await colocarLider(500, 450)
  await pausa(1200)
  await derrubar('c.lider')
  await pausa(300)
  conferir('o Líder desmaia e o aviso abaixo do HUD mostra os 30 s', /O Líder desmaiou: (30|29) s/.test(await textoDe('.avisos-da-partida')), await textoDe('.avisos-da-partida'))
  await print('29-lider-caido')
  await pausa(1000)
  conferir('com aliados de pé, o Líder caído não é Derrota (o jogo continua)', !!(await avaliar(`document.querySelector('.arena canvas')`)))
  await esperar(`!${CENA}.lider.caido`, 'os aliados levantarem o Líder', 15000)
  conferir('os aliados levantam o Líder', true)
  // Barra de teste: com "Aliados ajudam: não", ninguém levanta o Líder (para ver os 30 s inteiros)
  await clicar('Aliados ajudam: sim')
  await clicar('Derrubar Líder')
  conferir('o botão "Derrubar Líder" derruba o Líder', await cena(`c.lider.caido`))
  await pausa(6500)
  conferir('com "Aliados ajudam: não", ninguém levanta o Líder (6,5 s depois ainda caído)', await cena(`c.lider.caido`))
  await print('30-lider-sem-ajuda')
  await cena(`(c.lider.caidoDesde = c.agora - 29600, true)`)
  const fotoDoLiderNaoLevantado = await fotoDoFim()
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Resumo'`, 'o Resumo', 4000)
  const resumoDoRetorno = await avaliar(`document.body.innerText`)
  conferir('Líder não levantado em 30 s: Retorno forçado', resumoDoRetorno.includes('Retorno forçado'))
  conferir('o Resumo mostra o motivo "Líder não levantado em 30 s"', resumoDoRetorno.includes('Líder não levantado em 30 s'))
  conferirTaxa('Líder não levantado: ele e os perdidos pagam pela distância', 'liderNaoLevantado', fotoDoLiderNaoLevantado, await linhasDoResumo())
  conferir('o jogo some ao sair da Partida', (await avaliar(`document.querySelectorAll('canvas').length`)) === 0 && (await avaliar(`!window.__jogoDaPartida`)))
  await print('31-resumo-retorno-forcado')

  console.log('20. Com um personagem só, cair é Derrota na hora')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  conferir('partida nova só com o Líder', (await cena(`c.grupo.length`)) === 1)
  await colocarLider(640, 430)
  const fotoDoSozinho = await fotoDoFim()
  await derrubar('c.lider')
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Cutscene de derrota'`, 'Cutscene de derrota', 2000)
  conferir('o único personagem caiu: Cutscene de derrota na hora', true)
  await clicar('Continuar')
  await pausa(200)
  const resumoSozinho = await avaliar(`document.body.innerText`)
  conferir('o Resumo mostra Derrota com o motivo', resumoSozinho.includes('Derrota') && resumoSozinho.includes('Todos os personagens desmaiaram'))
  conferirTaxa('Derrota só com o Líder: taxa de todos desmaiam pela posição dele', 'todosDesmaiaram', fotoDoSozinho, await linhasDoResumo())

  console.log('21. Todos caindo: Derrota')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  await clicar('Encher grupo')
  await pausa(300)
  for (let i = 0; i < 4; i++) await clicar('Derrubar aliado')
  await pausa(300)
  conferir('o botão "Derrubar aliado" derruba um aliado de pé por vez', await cena(`c.aliados.every(a => a.caido)`))
  conferir('com os aliados caídos e o Líder de pé, o jogo continua', (await tituloDaTela()) !== 'Cutscene de derrota' && !!(await avaliar(`document.querySelector('.arena canvas')`)))
  await print('32-todos-menos-o-lider')
  const fotoDoGrupoInteiro = await fotoDoFim()
  await clicar('Derrubar Líder', true, 0)
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Cutscene de derrota'`, 'Cutscene de derrota', 2000)
  conferir('o último de pé caiu: Derrota na hora', true)
  await clicar('Continuar')
  await pausa(200)
  conferir('o Resumo mostra Derrota', (await avaliar(`document.body.innerText`)).includes('Derrota'))
  conferirTaxa('Derrota com o grupo inteiro: taxa única pela posição do Líder (os caídos não somam)', 'todosDesmaiaram', fotoDoGrupoInteiro, await linhasDoResumo())
  await print('33-resumo-derrota')

  console.log('22. Em combate a pausa não abre (TASK-040) e o HUD completo cabe em 1366×768 (TASK-049)')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  const hudCompleto = await textoDe('.hud')
  conferir(
    'HUD: tempo, pontos, ouro, custo da fuga, "Fora de combate", som e o lugar do minimapa e da região',
    ['Tempo', 'Pontos', 'Ouro', 'Fuga (F)', 'Fora de combate', 'Som (M)', 'Minimapa', 'Região'].every((t) => hudCompleto.includes(t)),
    hudCompleto.replace(/\n/g, ' · '),
  )
  const cabeSozinho = await avaliar(CABE_NO_HUD)
  conferir('em 1366×768 nenhuma linha do HUD estoura, e nada fica embaixo do botão Configurações', cabeSozinho.estouradas === 0 && cabeSozinho.emOrdem && cabeSozinho.altura, cabeSozinho)
  await clicar('Invencível: não') // o Líder não leva dano nestes testes (o mob perseguindo já é combate)
  await cena(`(c.criarInimigo('mobVermelho', { x: c.lider.x + 200, y: c.lider.y }), true)`)
  await esperar(`${CENA}.emCombate`, 'o grupo entrar em combate', 4000)
  await pausa(250)
  conferir('com um mob perseguindo, o HUD mostra "Em combate"', (await textoDe('.hud')).includes('Em combate'))
  await apertar('esc')
  await pausa(150)
  conferir('Esc em combate: a pausa não abre e o jogo continua', !(await cena(`c.sys.isPaused()`)) && !(await temJanela('Pausa')))
  conferir('aparece "Você não pode pausar agora"', (await textoDe('.avisos-da-partida')).includes('Você não pode pausar agora'))
  await print('34-esc-em-combate')
  await clicar('Configurações')
  conferir('em combate, as Configurações abrem (sem pausar)', (await temJanela('Configurações')) && !(await cena(`c.sys.isPaused()`)))
  await apertar('esc')
  conferir('em combate, Esc fecha a janela aberta antes de tudo', !(await temJanela('Configurações')) && !(await temJanela('Pausa')))

  console.log('23. Retorno com Q: não começa em combate, volta a 15 s com o combate (a 1 s do fim) e Q cancela')
  await apertar('q')
  conferir('Q em combate não começa o retorno e avisa', (await cena(`c.retorno`)) === null && (await textoDe('.avisos-da-partida')).includes('não dá para voltar'))
  await tirarInimigos()
  await esperar(`!${CENA}.emCombate`, 'o grupo sair de combate', 9000)
  await apertar('q')
  await pausa(200)
  conferir('Q fora de combate começa os 15 s', (await textoDe('.avisos-da-partida')).includes('Voltando ao Reino em 15 s'))
  // A 1 s do fim, um mob aparece perto e vem atrás do grupo
  await cena(`(c.retorno.msRestantes = 1000, c.criarInimigo('mobVermelho', { x: c.lider.x + 180, y: c.lider.y }), true)`)
  await esperar(`${CENA}.retorno?.interrompido`, 'o combate interromper o retorno', 3000)
  await pausa(200)
  const retornoInterrompido = await cena(`({ ms: c.retorno.msRestantes, terminou: c.terminou })`)
  conferir('o combate a 1 s do fim faz o retorno voltar a 15 s e esperar (a partida não acaba)', retornoInterrompido.ms === 15000 && !retornoInterrompido.terminou, retornoInterrompido)
  const avisoDoRetorno = await textoDe('.avisos-da-partida')
  conferir('o aviso mostra que o retorno espera o combate', avisoDoRetorno.includes('Em combate: o retorno espera') && avisoDoRetorno.includes('voltou a 15 s'), avisoDoRetorno)
  await print('35-retorno-interrompido')
  await tirarInimigos()
  await esperar(`${CENA}.retorno && !${CENA}.retorno.interrompido && ${CENA}.retorno.msRestantes < 14700`, 'o retorno voltar a correr', 9000)
  conferir('fora de combate, a contagem volta a correr', true)
  await apertar('q')
  conferir('Q de novo cancela', (await cena(`c.retorno`)) === null && (await textoDe('.avisos-da-partida')).includes('cancelado'))

  console.log('24. Grande Vitória pelo Q: sem desmaio e acima do mínimo, taxa 0 e +10% (TEST-004)')
  const antesDaGrande = await salvo()
  for (let i = 0; i < 4; i++) await clicar('+300 de ouro')
  // Um mob derrotado de verdade: +12 de ouro, +20 de XP para o Mago (o único permanente) e 1 monstro
  await cena(`(() => { const m = c.criarInimigo('mobVermelho', { x: c.lider.x + 300, y: c.lider.y }); c.acertar(m, 999, c.lider, 0, c.lider); return true })()`)
  const ganhosDaGrande = await cena(`({ ouro: c.ganhos.ouro, monstros: c.ganhos.monstros, xp: c.ganhos.xpPorClasse })`)
  conferir('o mob derrotado dá 12 de ouro, 20 de XP e conta um monstro', ganhosDaGrande.ouro === 1212 && ganhosDaGrande.monstros === 1 && ganhosDaGrande.xp.mago === 20, ganhosDaGrande)
  await pausa(200)
  conferir('o HUD mostra o ouro ganho e a pontuação', /Ouro\s*1212/.test(await textoDe('.hud')) && /Pontos\s*\d{4}/.test(await textoDe('.hud')), (await textoDe('.hud')).replace(/\n/g, ' · '))
  await voltarComQ()
  const resumoDaGrande = await linhasDoResumo()
  conferir('Grande Vitória pelo Q (sem desmaio e pontuação acima de 1000)', (await textoDe('.resultado')) === 'Grande Vitória', await textoDe('.resultado'))
  conferir('taxa 0% e ouro recebido com +10% (1212 → 1333)', resumoDaGrande['Taxa'] === '0% (−0 de ouro)' && resumoDaGrande['Ouro recebido'] === '1333 (com +10%)', resumoDaGrande)
  conferir(
    'o Resumo vem cheio: motivo, ouro ganho, pontuação, monstros, tempos e o XP',
    resumoDaGrande['Motivo'] === 'Retorno normal ao Reino' &&
      resumoDaGrande['Ouro ganho'] === '1212' &&
      /^\d+ \(base \d+\)$/.test(resumoDaGrande['Pontuação']) &&
      resumoDaGrande['Monstros derrotados'] === '1' &&
      /^\d\d:\d\d$/.test(resumoDaGrande['Tempo total']) &&
      /^\d\d:\d\d$/.test(resumoDaGrande['Tempo ativo']) &&
      (await textoDe('.xp-do-resumo')).includes('Mago: +20'),
    { resumo: resumoDaGrande, xp: await textoDe('.xp-do-resumo') },
  )
  const depoisDaGrande = await salvo()
  conferir(
    'o save recebeu o ouro, o XP, o monstro e mais uma partida',
    depoisDaGrande.ouro === antesDaGrande.ouro + 1333 &&
      xpTotal(depoisDaGrande.personagens[0]) === xpTotal(antesDaGrande.personagens[0]) + 20 &&
      depoisDaGrande.estatisticas.monstrosDerrotados === antesDaGrande.estatisticas.monstrosDerrotados + 1 &&
      depoisDaGrande.estatisticas.partidasJogadas === antesDaGrande.estatisticas.partidasJogadas + 1,
    { antes: { ouro: antesDaGrande.ouro, estatisticas: antesDaGrande.estatisticas }, depois: { ouro: depoisDaGrande.ouro, estatisticas: depoisDaGrande.estatisticas } },
  )
  await print('36-resumo-grande-vitoria')

  console.log('24b. Guilda: contratos temporário e permanente (TASK-079)')
  await clicar('Voltar ao Reino')
  await clicar('Guilda')
  await clicar('Contrato temporário')
  const antesDoContrato = await salvo()
  await clicarNaLinha('Arqueiro', 'Contratar')
  const depoisDoTemporario = await salvo()
  conferir(
    'contrato temporário: o Arqueiro entra com 3 partidas e nível 5, e o ouro cai 200',
    JSON.stringify(depoisDoTemporario.contratosTemporarios) === JSON.stringify([{ classe: 'arqueiro', partidasRestantes: 3, nivel: 5 }]) &&
      depoisDoTemporario.ouro === antesDoContrato.ouro - 200,
    { contratos: depoisDoTemporario.contratosTemporarios, ouro: [antesDoContrato.ouro, depoisDoTemporario.ouro] },
  )
  const abaTemporaria = await textoDe('.contratos')
  conferir('a aba mostra o contrato ativo com as partidas restantes, e o Arqueiro sai da lista', abaTemporaria.includes('3 partidas restantes') && !/^Arqueiro\s*Contratar/m.test(abaTemporaria), abaTemporaria.split('\n').slice(0, 8))
  await print('48-guilda-temporario')
  await clicar('Contrato permanente')
  await clicarNaLinha('Guerreiro', 'Contratar')
  const depoisDoPermanente = await salvo()
  conferir(
    'contrato permanente: o Guerreiro entra no nível 1 e o ouro cai 1000',
    depoisDoPermanente.personagens.some((p) => p.classe === 'guerreiro' && p.nivel === 1) && depoisDoPermanente.ouro === depoisDoTemporario.ouro - 1000,
    { personagens: depoisDoPermanente.personagens.map((p) => p.classe), ouro: depoisDoPermanente.ouro },
  )
  if (depoisDoPermanente.ouro < 1000) {
    await clicarNaLinha('Tanque', 'Contratar')
    conferir('sem ouro: aparece "Ouro insuficiente" e nada muda', (await textoDe('.contratos')).includes('Ouro insuficiente') && (await salvo()).ouro === depoisDoPermanente.ouro)
  }
  await print('49-guilda-permanente')
  await clicar('Voltar ao Reino')
  await clicar('Jogar')
  await clicar('Arena de teste')
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Preparação'`, 'Preparação')
  const preparacao = await avaliar(`document.body.innerText`)
  const botoesDeLider = await avaliar(`[...document.querySelectorAll('.tela button')].map(b => b.textContent.trim())`)
  conferir('Preparação: o temporário vai junto, mas não aparece como opção de Líder', preparacao.includes('Também vão: Arqueiro (temporário, 3 partidas)') && !botoesDeLider.includes('Arqueiro') && botoesDeLider.includes('Guerreiro'), botoesDeLider)
  await clicar('Começar partida')
  await esperar(`!!document.querySelector('.arena canvas') && !!window.__jogoDaPartida?.scene?.getScene('arena')?.lider`, 'arena', 15000)
  await pausa(600)
  conferir('na partida, o grupo tem o Mago (Líder), o Guerreiro permanente e o Arqueiro temporário', JSON.stringify(await cena(`c.grupo.map(m => m.classe).sort()`)) === JSON.stringify(['arqueiro', 'guerreiro', 'mago']))
  await voltarComQ()
  await clicar('Voltar ao Reino')
  await clicar('Guilda')
  await clicar('Contrato temporário')
  conferir('depois de uma partida, o Arqueiro temporário fica com 2 partidas (critério do card)', (await textoDe('.contratos')).includes('2 partidas restantes'))
  await clicar('Voltar ao Reino')

  console.log('25. Vitória: um aliado perdido paga a taxa pela distância de onde caiu (TEST-004)')
  await clicar('Contratar todas as classes (permanentes, de graça)')
  conferir('painel DEV (fora da partida): as 5 classes viram permanentes no save', (await salvo()).personagens.length === 5)
  await irAteAPartida(true)
  conferir('a partida começa com os 5 permanentes, aliados na IA básica (nível 1)', (await cena(`c.grupo.length`)) === 5 && (await iaDoAliado('arqueiro')) === 'basica')
  await clicar('Aliados ajudam: sim') // agora "não": ninguém levanta o Arqueiro
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await colocarLider(500, 430)
  await pausa(1500)
  const cabeComOGrupo = await avaliar(CABE_NO_HUD)
  conferir('com os 4 aliados no HUD, ainda nada estoura em 1366×768', cabeComOGrupo.estouradas === 0 && cabeComOGrupo.emOrdem && cabeComOGrupo.altura, cabeComOGrupo)
  await derrubar(membro('arqueiro'))
  await cena(`(${membro('arqueiro')}.caidoDesde = c.agora - 29600, true)`)
  await esperar(`${CENA}.perdidos.some(p => p.classe === 'arqueiro')`, 'o Arqueiro virar perdido', 3000)
  conferir('as mensagens do HUD avisam o desmaio e o perdido', (await textoDe('.avisos-da-partida')).includes('perdido'), await textoDe('.avisos-da-partida'))
  await print('37-hud-grupo-e-perdido')
  await clicar('+300 de ouro')
  const fotoDaVitoria = await fotoDoFim()
  await voltarComQ()
  conferir('Vitória pelo Q com um perdido', (await textoDe('.resultado')) === 'Vitória')
  const resumoDaVitoria = await linhasDoResumo()
  conferirTaxa('Vitória: o Arqueiro perdido paga pela distância', 'retornoNormal', fotoDaVitoria, resumoDaVitoria)
  conferir('o Resumo lista o perdido', resumoDaVitoria['Perdidos'] === 'Arqueiro', resumoDaVitoria['Perdidos'])
  await print('38-resumo-vitoria')

  console.log('26. Fuga com F: aviso com o custo, Esc cancela, F F confirma, funciona em combate; o Líder cai e a fuga continua (TASK-041)')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  await clicar('+300 de ouro')
  await clicar('Invencível: não')
  await colocarLider(1100, 450)
  await pausa(300)
  const liderAntesDaFuga = await cena(`({ x: Math.round(c.lider.x), y: Math.round(c.lider.y) })`)
  const taxaAgora = taxaNaDistancia('fuga', distanciaAoInicio(liderAntesDaFuga), BORDA)
  conferir(`o HUD mostra o custo atual da fuga (${taxaAgora}%)`, (await textoDe('.hud')).includes(`Fuga (F): ${taxaAgora}%`), (await textoDe('.hud')).match(/Fuga \(F\):[^\n]*/)?.[0])
  await cena(`(c.criarInimigo('mobVermelho', { x: c.lider.x + 200, y: c.lider.y }), true)`)
  await esperar(`${CENA}.emCombate`, 'o grupo entrar em combate', 4000)
  await apertar('f')
  const avisoDaFuga = await textoDe('[role=dialog]')
  conferir(
    'F mostra o aviso com o custo atual (taxa e ouro)',
    avisoDaFuga.includes(`Custo agora: ${taxaAgora}%`) && avisoDaFuga.includes(`(${aplicarTaxa(300, taxaAgora).taxaEmOuro} de ouro)`),
    avisoDaFuga.split('\n').slice(0, 3),
  )
  conferir('o aviso da fuga não pausa o jogo', !(await cena(`c.sys.isPaused()`)))
  await print('39-aviso-da-fuga')
  await apertar('esc')
  conferir('Esc fecha o aviso e a fuga não começa', !(await temJanela('Fugir com a Pedra de Retorno?')) && (await cena(`c.fuga`)) === null)
  await apertar('f')
  await apertar('f')
  await pausa(150)
  conferir('F e F de novo: a fuga começa, mesmo em combate', (await cena(`!!c.fuga && c.emCombate`)) && (await textoDe('.avisos-da-partida')).includes('Fugindo com a Pedra de Retorno em'))
  await apertar('q')
  conferir('com a fuga correndo, o Q não faz nada', (await cena(`c.retorno`)) === null)
  // Daqui ao fim, nada muda o ouro nem tira o Líder do chão: sem mobs, sem ajuda e sem a Ressurreição
  await tirarInimigos()
  await clicar('Aliados ajudam: sim')
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await clicar('Derrubar Líder')
  const fotoDaFuga = await fotoDoFim()
  conferir('o Líder cai durante a fuga e ela continua', await cena(`c.lider.caido && !!c.fuga && !c.terminou`))
  await print('40-fuga-com-o-lider-caido')
  await esperarResumo(7000)
  await pausa(150)
  const resumoDaFuga = await linhasDoResumo()
  conferir('no fim dos 5 s: Retorno forçado (amarelo) com o motivo "Fuga com a Pedra de Retorno"', (await textoDe('.resultado')) === 'Retorno forçado' && resumoDaFuga['Motivo'] === 'Fuga com a Pedra de Retorno', resumoDaFuga['Motivo'])
  conferirTaxa('Retorno forçado por fuga: taxa única pela posição do Líder', 'fuga', fotoDaFuga, resumoDaFuga)
  await print('41-resumo-fuga')

  console.log('27. Retorno forçado pelo Líder não levantado, com os perdidos (TEST-004)')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  await tirarInimigos() // sem mobs: nenhum ouro novo entre a "foto" e o fim
  await clicar('+300 de ouro')
  await clicar('Aliados ajudam: sim')
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await colocarLider(900, 300)
  await pausa(1200)
  await derrubar(membro('tanque'))
  await cena(`(${membro('tanque')}.caidoDesde = c.agora - 29600, true)`)
  await esperar(`${CENA}.perdidos.some(p => p.classe === 'tanque')`, 'o Tanque virar perdido', 3000)
  await clicar('Derrubar Líder')
  await cena(`(c.lider.caidoDesde = c.agora - 29600, true)`)
  const fotoDoLider = await fotoDoFim()
  await esperarResumo()
  await pausa(150)
  const resumoDoLider = await linhasDoResumo()
  conferir('Retorno forçado com o motivo "Líder não levantado em 30 s"', (await textoDe('.resultado')) === 'Retorno forçado' && resumoDoLider['Motivo'] === 'Líder não levantado em 30 s')
  conferirTaxa('o Tanque perdido e o Líder caído pagam pela distância de cada um', 'liderNaoLevantado', fotoDoLider, resumoDoLider)
  conferir('o Resumo lista o Tanque e o Mago como perdidos', resumoDoLider['Perdidos'] === 'Tanque, Mago', resumoDoLider['Perdidos'])

  console.log('28. Todos caem durante a fuga: Derrota (TEST-004)')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  await clicar('+300 de ouro')
  // Ninguém levanta ninguém durante o teste (nem a Ressurreição): todos têm de estar caídos no fim
  await clicar('Aliados ajudam: sim')
  await cena(`(${membro('sacerdote')}.ultimoUsoDaHabilidade[0] = c.agora, true)`)
  await colocarLider(700, 430)
  await pausa(300)
  await apertar('f')
  await apertar('f')
  for (let i = 0; i < 4; i++) await clicar('Derrubar aliado')
  const fotoDaDerrotaNaFuga = await fotoDoFim()
  conferir('a fuga continua com os aliados caídos', await cena(`!!c.fuga && !c.terminou`))
  await clicar('Derrubar Líder', true, 0)
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Cutscene de derrota'`, 'Cutscene de derrota', 3000)
  conferir('todos caíram antes do fim da fuga: Derrota, com a cutscene', true)
  await clicar('Continuar')
  await pausa(200)
  conferir('o Resumo mostra Derrota', (await textoDe('.resultado')) === 'Derrota')
  conferirTaxa('Derrota na fuga: taxa de todos desmaiam pela posição do Líder', 'todosDesmaiaram', fotoDaDerrotaNaFuga, await linhasDoResumo())

  console.log('29. Recarregar a página no meio da partida não dá ganho nenhum (RF12)')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  const antesDoRecarregar = await salvo()
  await clicar('+300 de ouro')
  await cena(`(() => { const m = c.criarInimigo('mobVermelho', { x: c.lider.x + 300, y: c.lider.y }); c.acertar(m, 999, c.lider, 0, c.lider); return true })()`)
  conferir('a partida ganhou ouro e XP antes de recarregar', (await cena(`c.ganhos.ouro`)) === 312 && (await cena(`Object.keys(c.ganhos.xpPorClasse).length`)) > 0)
  await cdp.enviar('Page.reload', {})
  await pausa(500)
  await esperar(`document.readyState === 'complete' && !!document.querySelector('.moldura')`, 'a página recarregar')
  await avaliar(`(() => {
    window.__erros = []
    window.addEventListener('error', (e) => window.__erros.push(String(e.message)))
    const erro = console.error.bind(console)
    console.error = (...a) => { window.__erros.push(a.map(String).join(' ')); erro(...a) }
  })()`)
  await clicar('Iniciar jogo')
  await clicar('Jogar como convidado')
  await esperar(`document.querySelector('.tela .titulo')?.textContent === 'Reino'`, 'o Reino', 5000)
  conferir('ao voltar, aviso de que a partida foi descartada', (await avaliar(`document.body.innerText`)).includes('descartada'))
  const depoisDoRecarregar = await salvo()
  conferir(
    'nada foi ganho: ouro, XP, monstros e partidas iguais ao começo da partida',
    depoisDoRecarregar.ouro === antesDoRecarregar.ouro &&
      JSON.stringify(depoisDoRecarregar.personagens) === JSON.stringify(antesDoRecarregar.personagens) &&
      JSON.stringify(depoisDoRecarregar.estatisticas) === JSON.stringify(antesDoRecarregar.estatisticas),
    { antes: antesDoRecarregar.ouro, depois: depoisDoRecarregar.ouro },
  )
  await clicar('OK')

  console.log('30. Subir de nível muda a IA na partida seguinte (29 → 30 → média; 69 → 70 → avançada)')
  await botaoDoPersonagem('Guerreiro', '+10', 2)
  await botaoDoPersonagem('Guerreiro', '+1', 8)
  await botaoDoPersonagem('Guerreiro', 'Quase subir')
  const guerreiro29 = (await salvo()).personagens.find((p) => p.classe === 'guerreiro')
  conferir('painel DEV: Guerreiro no nível 29, a 1 XP do 30', guerreiro29.nivel === 29 && guerreiro29.xp === 2899, guerreiro29)
  await irAteAPartida(true)
  conferir('nível 29: o Guerreiro aliado usa a IA básica', (await iaDoAliado('guerreiro')) === 'basica')
  await cena(`(() => { const m = c.criarInimigo('mobVermelho', { x: c.lider.x + 300, y: c.lider.y }); c.acertar(m, 999, c.lider, 0, c.lider); return true })()`)
  await pausa(200)
  conferir('o mob derrotado faz o Guerreiro passar do nível: aviso na hora', (await textoDe('.avisos-da-partida')).includes('Guerreiro subiu para o nível 30'), await textoDe('.avisos-da-partida'))
  conferir('nesta partida a IA dele continua a básica (o nível novo vale na próxima)', (await iaDoAliado('guerreiro')) === 'basica')
  await print('42-subiu-de-nivel')
  await voltarComQ()
  conferir('o Resumo mostra quem subiu de nível', (await textoDe('.xp-do-resumo')).includes('Guerreiro: +4 · subiu para o nível 30!'), await textoDe('.xp-do-resumo'))
  await print('43-resumo-subiu-de-nivel')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  conferir('na partida seguinte, o Guerreiro (nível 30) usa a IA média', (await iaDoAliado('guerreiro')) === 'media')
  await pausa(300)
  conferir('o HUD mostra a IA média', (await textoDe('.hud')).includes('IA média'))
  await voltarComQ()
  await clicar('Jogar novamente')
  await botaoDoPersonagem('Guerreiro', '+10', 3)
  await botaoDoPersonagem('Guerreiro', '+1', 9)
  conferir('painel DEV: Guerreiro no nível 69', (await salvo()).personagens.find((p) => p.classe === 'guerreiro').nivel === 69)
  await irAteAPartida(false)
  conferir('nível 69: IA média', (await iaDoAliado('guerreiro')) === 'media')
  await clicar('Subir nível')
  await pausa(200)
  conferir('botão "Subir nível" (só no npm run dev): o aviso aparece', (await textoDe('.avisos-da-partida')).includes('Guerreiro subiu para o nível 70'))
  await voltarComQ()
  conferir('o save tem o Guerreiro no nível 70', (await salvo()).personagens.find((p) => p.classe === 'guerreiro').nivel === 70)
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  conferir('na partida seguinte, o Guerreiro (nível 70) usa a IA avançada', (await iaDoAliado('guerreiro')) === 'avancada')

  console.log('31. Momento de foco: botão "Testar foco" (pendência da 5b.1)')
  await clicar('Testar foco')
  await pausa(6000)
  const foco = await cena(`({ emFoco: c.focoAte > c.agora, ...c.contagemDoFoco, vida: c.lider.vida / c.lider.vidaMaxima, ia: c.iaForcada })`)
  conferir('Testar foco: IA avançada forçada, Líder com 25% da vida e o "Foco!" no HUD', foco.emFoco && foco.ia === 'avancada' && foco.vida <= 0.25 && (await textoDe('.hud')).includes('Foco!'), foco)
  conferir('a barra mostra as decisões do foco, e eles quase não erram (≤ 20%)', foco.decisoes >= 4 && foco.erros / foco.decisoes <= 0.2 && /Foco: \d+ erros? em \d+ decisões/.test(await textoDe('.barra-de-teste')), foco)
  await print('44-foco')

  console.log('32. Tecla M: mudo a qualquer momento, até em combate (RF18)')
  conferir('o teste do foco deixou o grupo em combate', await cena(`c.emCombate`))
  await apertar('m')
  await pausa(200)
  conferir('M liga o mudo: o HUD mostra "Mudo (M)" e a preferência fica salva', (await textoDe('.hud')).includes('Mudo (M)') && (await preferenciasSalvas()).mudo === true)
  await print('45-mudo')
  await apertar('m')
  await pausa(200)
  conferir('M de novo desliga', (await textoDe('.hud')).includes('Som (M)') && (await preferenciasSalvas()).mudo === false)

  console.log('33. Crítico: número amarelo e mensagem no HUD')
  await cena(`(c.lider.chanceDeCritico = 1, true)`)
  await colocarLider(300, 290)
  await pausa(300)
  await atacarEm(420, 290)
  await pausa(900)
  conferir('golpe crítico do Líder: "CRÍTICO" em cima do alvo e "Crítico!" no HUD', (await textosNaTela()).some((t) => t.startsWith('CRÍTICO')) || (await textoDe('.avisos-da-partida')).includes('Crítico!'), await textoDe('.avisos-da-partida'))
  await cena(`(c.lider.chanceDeCritico = 0.05, true)`)
  await voltarComQ().catch(async () => {
    await cena(`(c.terminar({ como: 'retornoNormal' }), true)`)
    await esperarResumo()
  })

  console.log('34. Sacerdote sempre curando, em todos os níveis (5d)')
  await clicar('Jogar novamente')
  await irAteAPartida(false)
  await clicar('Invencível: não')
  await tirarInimigos()
  // Todos com a vida cheia e longe de mobs; a aura do Sacerdote pronta
  const encherVidas = () => cena(`(c.grupo.forEach(m => { if (!m.caido) m.vida = m.vidaMaxima }), true)`)
  const auraAtiva = `c.projeteis.some(p => p.constructor.name === 'Aura')`
  for (const nivel of ['basica', 'media', 'avancada']) {
    await cena(`(c.trocarIA('${nivel}'), true)`)
    await colocarLider(700, 560)
    await encherVidas()
    await cena(`(() => {
      const s = ${membro('sacerdote')}, a = ${membro('arqueiro')}
      s.colocarEm(500, 450); s.ultimoAtaque = null
      a.colocarEm(850, 450); a.ia.parado = true; a.ia.quietoAte = c.agora + 8000
      return true
    })()`)
    await esperar(`!${CENA}.projeteis.some(p => p.constructor.name === 'Aura') && !${CENA}.emCombate`, 'a aura de antes acabar', 8000)
    await pausa(300)
    const inicioDaCura = await cena(`(() => { const a = ${membro('arqueiro')}; a.vida = Math.floor(a.vidaMaxima / 2); return c.agora })()`)
    await esperar(`${CENA}.projeteis.some(p => p.constructor.name === 'Aura')`, `a cura começar (IA ${nivel})`, 6000)
    const levou = ((await cena(`c.agora`)) - inicioDaCura) / 1000
    conferir(`IA ${nivel}: aliado ferido (fora de combate) e Sacerdote livre: a cura começa em até 3 s`, levou <= 3, Math.round(levou * 100) / 100)
    await esperar(`${CENA}.grupo.find(m => m.classe === 'arqueiro').vida === ${CENA}.grupo.find(m => m.classe === 'arqueiro').vidaMaxima`, `o Arqueiro ser curado até o fim (IA ${nivel})`, 9000)
    conferir(`IA ${nivel}: o Sacerdote cura até a vida ficar cheia`, true)
  }
  await print('46-sacerdote-curando')

  // Quanto tempo a aura fica ligada com alguém ferido o tempo todo (aura de 3 s, recarga de 6 s)
  await cena(`(c.trocarIA('media'), true)`)
  await encherVidas()
  await cena(`(() => { const t = ${membro('tanque')}; t.vida = Math.floor(t.vidaMaxima * 0.1); ${membro('sacerdote')}.ultimoAtaque = null; return true })()`)
  const amostrasDaAura = []
  for (let i = 0; i < 60; i++) {
    amostrasDaAura.push(await cena(`({ aura: ${auraAtiva}, ferido: c.grupo.some(m => !m.caido && m.vida < m.vidaMaxima), agora: c.agora })`))
    await pausa(200)
  }
  const comFerido = amostrasDaAura.filter((a) => a.ferido)
  const ligada = comFerido.filter((a) => a.aura).length / Math.max(1, comFerido.length)
  console.log(`  (com alguém ferido, a aura ficou ligada ${Math.round(ligada * 100)}% do tempo; ${comFerido.length} amostras)`)
  const comecos = amostrasDaAura.filter((a, i) => a.aura && i > 0 && !amostrasDaAura[i - 1].aura).map((a) => a.agora)
  // Regra do Pablo (08/10): com alguém ferido, a cura fica ligada praticamente sem pausa
  conferir('com alguém ferido o tempo todo, a aura do Sacerdote fica ligada sem pausa (≥ 90% do tempo)', ligada >= 0.9, { ligada: Math.round(ligada * 100), comecos: comecos.length })

  console.log('35. Cada nível sem ser atrapalhado pelos outros (5d)')
  // O Sacerdote avançado vai curar o Arqueiro; o Guerreiro, na IA básica, está parado no meio do caminho
  await cena(`(c.trocarIA(null), true)`)
  await encherVidas()
  await esperar(`!${CENA}.projeteis.some(p => p.constructor.name === 'Aura')`, 'a aura acabar', 8000)
  for (const [nivelDoSacerdote, nome] of [[80, 'avançada'], [40, 'média']]) {
    await cena(`(() => {
      const s = ${membro('sacerdote')}, g = ${membro('guerreiro')}, a = ${membro('arqueiro')}, t = ${membro('tanque')}
      s.nivel = ${nivelDoSacerdote}; g.nivel = 1
      c.lider.colocarEm(700, 560); t.colocarEm(760, 600)
      s.colocarEm(480, 450); s.ultimoAtaque = null
      g.colocarEm(650, 450); g.ia.parado = true; g.ia.quietoAte = c.agora + 9000
      a.colocarEm(860, 450); a.ia.parado = true; a.ia.quietoAte = c.agora + 9000
      a.vida = Math.floor(a.vidaMaxima / 2)
      s.travamento = null
      return true
    })()`)
    let menorFolga = Infinity
    let travou = 0
    const inicioDoDesvio = Date.now()
    while (Date.now() - inicioDoDesvio < 3500) {
      const amostra = await cena(`(() => { const s = ${membro('sacerdote')}, g = ${membro('guerreiro')}; return { folga: Math.max(Math.abs(s.x - g.x), Math.abs(s.y - g.y)) - (s.tamanho + g.tamanho) / 2, travou: s.travamento?.nivel ?? 0, aura: ${auraAtiva} } })()`)
      menorFolga = Math.min(menorFolga, amostra.folga)
      travou = Math.max(travou, amostra.travou)
      if (amostra.aura) break
      await pausa(50)
    }
    const curou = await cena(auraAtiva)
    conferir(`Sacerdote na IA ${nome} contorna o Guerreiro parado (IA básica) sem encostar`, menorFolga >= -2, Math.round(menorFolga * 10) / 10)
    conferir(`Sacerdote na IA ${nome}: não trava no Guerreiro e chega para curar em até 3,5 s`, travou === 0 && curou, { travou, curou })
    if (nome === 'avançada') await print('47-desvio-da-avancada')
    await encherVidas()
    await esperar(`!${CENA}.projeteis.some(p => p.constructor.name === 'Aura')`, 'a aura acabar', 8000)
  }

  // O Guerreiro avançado não fica esperando o Tanque básico que errou: vai proteger o Líder
  await cena(`(() => {
    const g = ${membro('guerreiro')}, t = ${membro('tanque')}
    g.nivel = 80; g.ia.errou = false; g.ia.proximaDecisao = c.agora + 20000
    t.nivel = 1; t.ia.errou = true; t.ia.tanqueErra = true; t.ia.proximaDecisao = c.agora + 20000
    c.lider.colocarEm(500, 430)
    // um mob que aguenta a luta (senão os outros aliados o derrubam em meio segundo e todos voltam a seguir)
    const m = c.criarInimigo('mobVermelho', { x: 760, y: 430 })
    m.vida = m.vidaMaxima = 100000
    return true
  })()`)
  await esperar(`${CENA}.grupo.find(m => m.classe === 'guerreiro').ia.ultimoPlano === 'corpoACorpo'`, 'o Guerreiro decidir', 2000).catch(() => {})
  const planoSemTanque = await cena(`({ guerreiro: ${membro('guerreiro')}.ia.ultimoPlano, tanque: ${membro('tanque')}.ia.ultimoPlano })`)
  conferir('Tanque básico errando (fica com o grupo): o Guerreiro avançado não espera e vai no mob, protegendo o Líder', planoSemTanque.guerreiro === 'corpoACorpo' && planoSemTanque.tanque === 'seguir', planoSemTanque)
  await cena(`(() => { const t = ${membro('tanque')}; t.nivel = 80; t.ia.errou = false; t.ia.proximaDecisao = 0; return true })()`)
  await esperar(`${CENA}.grupo.find(m => m.classe === 'guerreiro').ia.ultimoPlano === 'guerreiroComTanque'`, 'o Guerreiro ficar ao lado do Tanque', 5000).catch(() => {})
  const planoComTanque = await cena(`({ guerreiro: ${membro('guerreiro')}.ia.ultimoPlano, tanque: ${membro('tanque')}.ia.ultimoPlano })`)
  conferir('com o Tanque avançado na frente, o Guerreiro avançado fica ao lado dele', planoComTanque.guerreiro === 'guerreiroComTanque', planoComTanque)
  await tirarInimigos()

  const erros = await avaliar(`window.__erros`)
  conferir('nenhum erro no console', erros.length === 0, erros.slice(0, 5))
} catch (erro) {
  falhas++
  console.log('  ERRO', erro.message)
  await print('erro').catch(() => {})
}

console.log(`\n${total - falhas} de ${total} conferências passaram${falhas ? `; ${falhas} falharam` : ''}. Prints em ${PASTA}`)
await desligar(falhas ? 1 : 0)
