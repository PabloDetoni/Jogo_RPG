// Ferramentas dos roteiros no navegador (Fase 3 em diante): ligar o Vite, abrir um Edge (ou Chrome) escondido e
// controlar uma aba pelo protocolo de depuração (CDP): clicar, digitar, apertar teclas, mover o mouse e tirar prints.
// Não instala nada: precisa do Edge ou do Chrome no computador (ou do caminho dele na variável NAVEGADOR).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer as criarServidorDeRede } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'

export const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

export function acharNavegador() {
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

export async function portaLivre() {
  return new Promise((resolver, rejeitar) => {
    const servidorDeRede = criarServidorDeRede()
    servidorDeRede.on('error', rejeitar)
    servidorDeRede.listen(0, '127.0.0.1', () => {
      const { port } = servidorDeRede.address()
      servidorDeRede.close(() => resolver(port))
    })
  })
}

// Contador das conferências, com o vigia que para tudo se o roteiro ficar 4 minutos sem andar
export function criarConferencias(aoTravar) {
  const estado = { total: 0, falhas: 0, ultimaAtividade: Date.now() }
  const vigia = setInterval(() => {
    if (Date.now() - estado.ultimaAtividade < 4 * 60 * 1000) return
    clearInterval(vigia)
    console.log(`\n  ERRO o roteiro ficou 4 minutos sem andar (depois de ${estado.total} conferências): parado pelo vigia`)
    aoTravar()
  }, 15000)
  return {
    estado,
    conferir(nome, condicao, detalhe) {
      estado.ultimaAtividade = Date.now()
      estado.total++
      console.log(`${condicao ? '  ok   ' : '  FALHOU'} ${nome}${detalhe !== undefined ? ' → ' + JSON.stringify(detalhe) : ''}`)
      if (!condicao) estado.falhas++
    },
    parar: () => clearInterval(vigia),
  }
}

// Liga o Vite (npm run dev) numa porta e devolve { site, fechar }
export async function ligarVite(porta) {
  const servidor = await createServer({ server: { port: porta, strictPort: false }, logLevel: 'error' })
  await servidor.listen()
  return { site: servidor.resolvedUrls.local[0], fechar: () => servidor.close() }
}

const teclas = {
  w: { key: 'w', code: 'KeyW', vk: 87 },
  a: { key: 'a', code: 'KeyA', vk: 65 },
  s: { key: 's', code: 'KeyS', vk: 83 },
  d: { key: 'd', code: 'KeyD', vk: 68 },
  e: { key: 'e', code: 'KeyE', vk: 69 },
  f: { key: 'f', code: 'KeyF', vk: 70 },
  q: { key: 'q', code: 'KeyQ', vk: 81 },
  r: { key: 'r', code: 'KeyR', vk: 82 },
  setaCima: { key: 'ArrowUp', code: 'ArrowUp', vk: 38 },
  setaBaixo: { key: 'ArrowDown', code: 'ArrowDown', vk: 40 },
  m: { key: 'm', code: 'KeyM', vk: 77 },
  tab: { key: 'Tab', code: 'Tab', vk: 9 },
  espaco: { key: ' ', code: 'Space', vk: 32 },
  esc: { key: 'Escape', code: 'Escape', vk: 27 },
  um: { key: '1', code: 'Digit1', vk: 49 },
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

// Um navegador de verdade (processo e perfil próprios). Devolve { novaAba(rotulo), fechar() }.
export async function abrirNavegador(nome, pastaDosPrints) {
  const caminho = acharNavegador()
  if (!caminho) throw new Error('Não achei o Edge nem o Chrome. Diga onde está com a variável NAVEGADOR.')
  const porta = await portaLivre()
  const perfil = mkdtempSync(join(tmpdir(), `jogo-rpg-${nome}-`))
  const processo = spawn(
    caminho,
    [
      '--headless=new',
      `--remote-debugging-port=${porta}`,
      `--user-data-dir=${perfil}`,
      // O navegador escondido usa a placa de vídeo, para medir o FPS como num computador de verdade (TEST-005). Com
      // NAVEGADOR_GPU=0, desenha no processador (SwiftShader): funciona em qualquer máquina, mas fica bem mais lento
      // (a Floresta cai para uns 25 FPS só por causa disso)
      ...(process.env.NAVEGADOR_GPU === '0' ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] : ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=default']),
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1366,768',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${porta}/json/version`)).ok) break
    } catch {
      // ainda abrindo
    }
    await pausa(150)
  }
  mkdirSync(pastaDosPrints, { recursive: true })
  return {
    async novaAba(rotulo) {
      const alvo = await (await fetch(`http://127.0.0.1:${porta}/json/new?about:blank`, { method: 'PUT' })).json()
      const cdp = conectar(alvo.webSocketDebuggerUrl)
      await cdp.aberto
      await cdp.enviar('Page.enable')
      await cdp.enviar('Runtime.enable')
      await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })
      return criarAba(cdp, `${nome}/${rotulo}`, pastaDosPrints)
    },
    async fechar() {
      if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(processo.pid), '/T', '/F'], { stdio: 'ignore' })
      else processo.kill()
      await pausa(400)
      try {
        rmSync(perfil, { recursive: true, force: true })
      } catch {
        // o navegador às vezes demora a soltar os arquivos do perfil temporário
      }
    },
  }
}

function criarAba(cdp, nome, pastaDosPrints) {
  const aba = {
    nome,
    cdp,
    async avaliar(js) {
      const r = await cdp.enviar('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(`erro no JS (${nome}): ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n${js}`)
      return r.result.value
    },
    async esperar(condicao, oQue, ms = 10000) {
      const fim = Date.now() + ms
      while (Date.now() < fim) {
        if (await aba.avaliar(`!!(${condicao})`).catch(() => false)) return true
        await pausa(80)
      }
      throw new Error(`(${nome}) cansou de esperar ${oQue}`)
    },
    titulo: () => aba.avaliar(`document.querySelector('.tela .titulo')?.textContent ?? ''`),
    texto: () => aba.avaliar(`document.body.innerText`),
    esperarTela: (titulo, ms = 10000) => aba.esperar(`document.querySelector('.tela .titulo')?.textContent === ${JSON.stringify(titulo)}`, `a tela ${titulo}`, ms),
    async clicar(texto, exato = true) {
      const achou = await aba.avaliar(`(() => {
        const botoes = [...document.querySelectorAll('button')].filter(b => !b.disabled)
        const alvo = botoes.find(b => ${exato ? 'b.textContent.trim() === ' + JSON.stringify(texto) : 'b.textContent.trim().startsWith(' + JSON.stringify(texto) + ')'})
        if (!alvo) return false
        alvo.click()
        return true
      })()`)
      if (!achou) throw new Error(`(${nome}) não achei o botão "${texto}"`)
      await pausa(180)
    },
    temBotao: (texto) => aba.avaliar(`[...document.querySelectorAll('button')].some(b => b.textContent.trim().startsWith(${JSON.stringify(texto)}))`),
    async abrir(endereco) {
      await cdp.enviar('Page.navigate', { url: 'about:blank' })
      await pausa(150)
      await cdp.enviar('Page.navigate', { url: endereco })
      await pausa(300)
      await aba.esperar(`document.readyState === 'complete' && !!document.querySelector('.moldura')`, 'a página abrir', 15000)
      await aba.avaliar(`(() => {
        if (window.__erros) return true
        window.__erros = []
        window.addEventListener('error', (e) => window.__erros.push(String(e.message)))
        const erro = console.error.bind(console)
        console.error = (...a) => { window.__erros.push(a.map(String).join(' ')); erro(...a) }
        return true
      })()`)
    },
    async tecla(nomeDaTecla, tipo) {
      const t = teclas[nomeDaTecla]
      await cdp.enviar('Input.dispatchKeyEvent', { type: tipo, key: t.key, code: t.code, windowsVirtualKeyCode: t.vk, nativeVirtualKeyCode: t.vk })
    },
    async apertar(nomeDaTecla) {
      await aba.tecla(nomeDaTecla, 'keyDown')
      await pausa(40)
      await aba.tecla(nomeDaTecla, 'keyUp')
      await pausa(100)
    },
    async segurar(nomes, ms) {
      for (const nomeDaTecla of nomes) await aba.tecla(nomeDaTecla, 'keyDown')
      await pausa(ms)
      for (const nomeDaTecla of nomes) await aba.tecla(nomeDaTecla, 'keyUp')
      await pausa(80)
    },
    async moverMouse(x, y) {
      await cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
      await pausa(50)
    },
    async clicarNaTela(x, y) {
      await aba.moverMouse(x, y)
      await cdp.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
      await pausa(30)
      await cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
      await pausa(60)
    },
    async print(arquivo) {
      await aba.avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = 'hidden' })()`)
      const r = await cdp.enviar('Page.captureScreenshot', { format: 'png' })
      writeFileSync(join(pastaDosPrints, `${arquivo}.png`), Buffer.from(r.data, 'base64'))
      await aba.avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = '' })()`)
    },
  }
  return aba
}
