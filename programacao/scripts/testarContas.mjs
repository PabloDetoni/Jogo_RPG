// Roteiro de testes das contas no navegador (TEST-007, Fase 2). Uso: npm run testar:contas
// Precisa do Supabase pronto (documentacao/Supabase_passo_a_passo.md, parte 2): o SQL rodado e duas contas de teste
// confirmadas no .env.local (TESTE_CONTA_A_EMAIL/SENHA e TESTE_CONTA_B_EMAIL/SENHA).
// Liga o Vite e DOIS Edges escondidos (dois navegadores de verdade, cada um com o seu armazenamento) e confere:
// ranking sem login, sessão única (dois navegadores e duas abas), save no banco com versão (inclusive o save antigo
// recusado), histórico, uma conta tentando ler ou alterar a outra, a queda de internet no meio do salvamento, o Supabase
// fora do ar, o link de e-mail expirado e (enquanto a conta B não tiver save) a passagem do convidado para a conta.
// Fala com o Supabase de verdade, como um jogador: só com a chave publicável. Prints em testes-do-navegador/contas/.
// Com `npm run testar:contas:publicado`, roda no jogo publicado (o endereço principal da Vercel), sem ligar o Vite: lá não
// existe a barra de teste, então a partida termina voltando com Q, e confere também que a Floresta abre no site.
import { createClient } from '@supabase/supabase-js'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer as criarServidorDeRede } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer, loadEnv } from 'vite'

const PASTA = resolve('testes-do-navegador', 'contas')
mkdirSync(PASTA, { recursive: true })
const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

// ---------- Configuração (.env.local) ----------

const env = loadEnv('development', process.cwd(), '')
const URL_DO_SUPABASE = env.VITE_SUPABASE_URL
const CHAVE = env.VITE_SUPABASE_PUBLISHABLE_KEY
// Jogo publicado (--publicado): o endereço principal da Vercel, o mesmo do conferir:configuracao
const PUBLICADO = process.argv.includes('--publicado')
const ENDERECO_PUBLICADO = (process.env.ENDERECO_DA_VERCEL || env.ENDERECO_DA_VERCEL || 'https://jogo-rpg-six.vercel.app').replace(/\/+$/, '')
const contaA = { nome: 'A', email: env.TESTE_CONTA_A_EMAIL, senha: env.TESTE_CONTA_A_SENHA, apelido: 'TesteA' }
const contaB = { nome: 'B', email: env.TESTE_CONTA_B_EMAIL, senha: env.TESTE_CONTA_B_SENHA, apelido: 'TesteB' }
if (!URL_DO_SUPABASE || !CHAVE || !contaA.email || !contaA.senha || !contaB.email || !contaB.senha) {
  console.error(
    'Faltam variáveis no programacao/.env.local: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY e as duas contas de teste\n' +
      '(TESTE_CONTA_A_EMAIL, TESTE_CONTA_A_SENHA, TESTE_CONTA_B_EMAIL, TESTE_CONTA_B_SENHA). Veja documentacao/Supabase_passo_a_passo.md, passo D.',
  )
  process.exit(1)
}

let falhas = 0
let total = 0
let ultimaAtividade = Date.now()
function conferir(nome, condicao, detalhe) {
  ultimaAtividade = Date.now()
  total++
  console.log(`${condicao ? '  ok   ' : '  FALHOU'} ${nome}${detalhe !== undefined ? ' → ' + JSON.stringify(detalhe) : ''}`)
  if (!condicao) falhas++
}

// ---------- Supabase pelo Node (como um jogador: só a chave publicável) ----------

const novoCliente = () => createClient(URL_DO_SUPABASE, CHAVE, { auth: { persistSession: false, autoRefreshToken: false } })
const anonimo = novoCliente()
async function clienteDa(conta) {
  const cliente = novoCliente()
  const { data, error } = await cliente.auth.signInWithPassword({ email: conta.email, password: conta.senha })
  if (error) throw new Error(`a conta de teste ${conta.nome} não entrou (${error.message}). Confira o e-mail, a senha e se ela está confirmada.`)
  return { cliente, id: data.user.id }
}
const saveNoBanco = async (cliente) => (await cliente.from('saves').select('versao, progresso').maybeSingle()).data
const partidasNoBanco = async (cliente) => (await cliente.from('partidas').select('*', { count: 'exact', head: true })).count ?? 0
async function esperarNoBanco(ler, condicao, oQue, ms = 12000) {
  const fim = Date.now() + ms
  let valor
  while (Date.now() < fim) {
    valor = await ler()
    if (condicao(valor)) return valor
    await pausa(400)
  }
  return valor
}

// ---------- Vite e navegadores ----------

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

const servidor = PUBLICADO ? null : await createServer({ server: { port: 5198, strictPort: false }, logLevel: 'error' })
await servidor?.listen()
const SITE = PUBLICADO ? `${ENDERECO_PUBLICADO}/` : servidor.resolvedUrls.local[0]
const processos = []

async function desligar(codigo) {
  for (const { processo, perfil } of processos) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(processo.pid), '/T', '/F'], { stdio: 'ignore' })
    else processo.kill()
    await pausa(300)
    try {
      rmSync(perfil, { recursive: true, force: true })
    } catch {
      // o navegador às vezes demora a soltar os arquivos do perfil temporário
    }
  }
  await servidor?.close()
  process.exit(codigo)
}

// Vigia: 4 minutos sem nenhuma conferência (o computador dormiu, o navegador travou) → para tudo
const vigia = setInterval(() => {
  if (Date.now() - ultimaAtividade < 4 * 60 * 1000) return
  clearInterval(vigia)
  console.log(`\n  ERRO o roteiro ficou 4 minutos sem andar (depois de ${total} conferências): parado pelo vigia`)
  desligar(1)
}, 15000)

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

// Um navegador de verdade (processo e perfil próprios): o armazenamento e a trava das abas são só dele
async function abrirNavegador(nome) {
  const porta = await portaLivre()
  const perfil = mkdtempSync(join(tmpdir(), `jogo-rpg-contas-${nome}-`))
  const processo = spawn(
    caminhoDoNavegador,
    [
      '--headless=new',
      `--remote-debugging-port=${porta}`,
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
  processos.push({ processo, perfil })
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${porta}/json/version`)).ok) break
    } catch {
      // ainda abrindo
    }
    await pausa(150)
  }
  return {
    nome,
    async novaAba(rotulo) {
      const alvo = await (await fetch(`http://127.0.0.1:${porta}/json/new?about:blank`, { method: 'PUT' })).json()
      const cdp = conectar(alvo.webSocketDebuggerUrl)
      await cdp.aberto
      await cdp.enviar('Page.enable')
      await cdp.enviar('Runtime.enable')
      await cdp.enviar('Network.enable')
      await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })
      return criarAba(cdp, `${nome}/${rotulo}`, () => fetch(`http://127.0.0.1:${porta}/json/close/${alvo.id}`))
    },
  }
}

function criarAba(cdp, nome, fecharAlvo) {
  const aba = {
    nome,
    async avaliar(js) {
      const r = await cdp.enviar('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(`erro no JS (${nome}): ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}\n${js}`)
      return r.result.value
    },
    async esperar(condicao, oQue, ms = 10000) {
      const fim = Date.now() + ms
      while (Date.now() < fim) {
        if (await aba.avaliar(`!!(${condicao})`).catch(() => false)) return true
        await pausa(100)
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
      await pausa(200)
    },
    temBotao: (texto, exato = false) =>
      aba.avaliar(`[...document.querySelectorAll('button')].some(b => ${exato ? 'b.textContent.trim() === ' + JSON.stringify(texto) : 'b.textContent.trim().startsWith(' + JSON.stringify(texto) + ')'})`),
    // Escreve num campo pelo rótulo dele, do jeito que o React percebe
    async digitar(rotulo, valor) {
      const achou = await aba.avaliar(`(() => {
        const campo = [...document.querySelectorAll('label.campo')].find(l => l.querySelector('span')?.textContent === ${JSON.stringify(rotulo)})
        const input = campo?.querySelector('input')
        if (!input) return false
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(valor)})
        input.dispatchEvent(new Event('input', { bubbles: true }))
        return true
      })()`)
      if (!achou) throw new Error(`(${nome}) não achei o campo "${rotulo}"`)
      await pausa(60)
    },
    async abrir(endereco = SITE) {
      // Primeiro uma página em branco: trocar só o "#" do endereço não recarrega o jogo (o link do e-mail abre do zero)
      await cdp.enviar('Page.navigate', { url: 'about:blank' })
      await pausa(200)
      await cdp.enviar('Page.navigate', { url: endereco })
      await pausa(300)
      await aba.esperar(`document.readyState === 'complete' && !!document.querySelector('.moldura')`, 'a página abrir', 15000)
      await aba.vigiarErros()
    },
    async recarregou() {
      await pausa(800)
      await aba.esperar(`document.readyState === 'complete' && !!document.querySelector('.moldura')`, 'a página recarregar', 15000)
      await aba.vigiarErros()
    },
    vigiarErros: () =>
      aba.avaliar(`(() => {
        if (window.__erros) return true
        window.__erros = []
        window.addEventListener('error', (e) => window.__erros.push(String(e.message)))
        const erro = console.error.bind(console)
        console.error = (...a) => { window.__erros.push(a.map(String).join(' ')); erro(...a) }
        return true
      })()`),
    async print(arquivo) {
      await aba.avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = 'hidden' })()`)
      const r = await cdp.enviar('Page.captureScreenshot', { format: 'png' })
      writeFileSync(join(PASTA, `${arquivo}.png`), Buffer.from(r.data, 'base64'))
      await aba.avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini')) p.style.visibility = '' })()`)
    },
    // Sem internet: nenhum pedido sai desta aba
    semInternet: (sim) =>
      cdp.enviar('Network.emulateNetworkConditions', { offline: sim, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }),
    // Supabase fora do ar: os pedidos para ele falham, o resto da página funciona
    bloquear: (padroes) => cdp.enviar('Network.setBlockedURLs', { urls: padroes }),
    // Põe a aba na frente: o relógio da partida para com a aba escondida (a contagem do Q também)
    aFrente: () => cdp.enviar('Page.bringToFront'),
    fechar: fecharAlvo,
  }
  return aba
}

// ---------- Ajudantes do jogo ----------

const mensagemDoAcesso = (aba) => aba.avaliar(`document.querySelector('.mensagem-do-acesso')?.innerText ?? ''`)

async function irAoLogin(aba) {
  if ((await aba.titulo()) !== 'Tela inicial') await aba.abrir()
  await aba.clicar('Iniciar jogo')
  await aba.esperarTela('Login')
}

// Clica num botão de conta e espera o pedido terminar (o botão mostra "Aguarde..." enquanto isso)
async function esperarPedido(aba, ms = 20000) {
  await pausa(250)
  await aba.esperar(`![...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Aguarde...')`, 'o pedido à conta terminar', ms)
  await pausa(300)
}

// Entra com a conta (o Login já aberto). Se a conta pedir apelido, narrativa ou classe, segue até o Reino.
// Devolve o título da tela em que parou (Reino, ou Login com a mensagem de erro).
async function entrar(aba, conta, comoEntrar = 'senha') {
  if (comoEntrar === 'senha') {
    await aba.digitar('E-mail', conta.email)
    await aba.digitar('Senha', conta.senha)
    await aba.clicar('Entrar')
  } else {
    await aba.clicar('Continuar como', false)
  }
  await esperarPedido(aba)
  if ((await aba.titulo()) === 'Escolha seu apelido') {
    await aba.digitar('Apelido', conta.apelido)
    await aba.clicar('Confirmar apelido')
    await esperarPedido(aba)
  }
  if ((await aba.titulo()) === 'Narrativa inicial') {
    await aba.clicar('Continuar')
    await aba.esperarTela('Seleção de classe')
    await aba.clicar('Mago')
    await aba.clicar('Escolher Mago')
    await aba.esperarTela('Reino')
    await pausa(800) // o primeiro personagem vai para o banco
  }
  return aba.titulo()
}

// Do Reino até a partida na Floresta. noMapa (opcional) roda com o Mapa aberto.
async function irAteAPartida(aba, noMapa) {
  await aba.aFrente()
  await aba.clicar('Jogar')
  if (noMapa) await noMapa()
  await aba.clicar('Floresta')
  // A tela Ponto de partida só aparece quando a conta já descobriu outra região da Floresta (Fase 3)
  await aba.esperar(
    `document.querySelector('.tela .titulo')?.textContent === 'Preparação' || [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Início do bioma')`,
    'o Ponto de partida ou a Preparação',
  )
  if ((await aba.titulo()) !== 'Preparação') await aba.clicar('Início do bioma')
  await aba.esperarTela('Preparação')
  await aba.clicar('Começar partida')
}
// A partida aberta: o desenho do Phaser e o HUD com a região, que só aparece quando a cena já manda a situação
// (no npm run dev, confere também o Líder dentro do jogo)
const esperarArena = (aba) =>
  aba.esperar(
    `!!document.querySelector('.arena canvas') && !(document.querySelector('.hud-regiao')?.textContent ?? 'Região: —').endsWith('—') && (!window.__jogoDaPartida || !!window.__jogoDaPartida.scene?.getScene('arena')?.lider)`,
    'a partida',
    20000,
  )

// Termina a partida voltando ao Reino. No npm run dev, pelo botão "Vitória" da barra de teste; no jogo publicado (sem a
// barra), com Q: o grupo nasce na zona segura, sem mob perto, e depois da contagem de 15 s vem o Resumo (Vitória)
async function terminarComVitoria(aba) {
  if (!PUBLICADO) return aba.clicar('Vitória')
  await aba.aFrente()
  await aba.avaliar(`(window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true })), true)`)
  await aba.esperarTela('Resumo', 30000)
}

async function abrirConfiguracoes(aba) {
  await aba.clicar('Configurações')
  await aba.esperar(`!!document.querySelector('[role=dialog][aria-label="Configurações"]')`, 'as Configurações')
}

const copiaLocal = (aba, id) => aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:conta:${id}') ?? 'null')`)
const fecharAvisos = (aba) =>
  aba.avaliar(`(() => { for (const b of [...document.querySelectorAll('.aviso button')]) b.click(); return true })()`)

// ---------- Roteiro ----------

const abasAbertas = new Set() // para conferir os erros do console no fim

try {
  console.log(`Site: ${SITE} · navegador: ${caminhoDoNavegador}`)

  console.log('0. Preparação: o banco existe e as contas de teste entram')
  const teste = await anonimo.rpc('ranking', { p_aba: 'ouro' })
  if (teste.error?.code === 'PGRST202') {
    throw new Error('o SQL ainda não foi rodado no Supabase (documentacao/Supabase_passo_a_passo.md, passo A)')
  }
  conferir('o ranking responde sem login (a função ranking existe)', !teste.error, teste.error?.message)
  const a = await clienteDa(contaA)
  const b = await clienteDa(contaB)
  conferir('as duas contas de teste entram', Boolean(a.id && b.id))
  const saveDaBAntes = await saveNoBanco(b.cliente)
  const partidasDaBAntes = await partidasNoBanco(b.cliente)
  const passarConvidadoParaB = !saveDaBAntes

  console.log('1. Ranking sem login (RF15)')
  const nav1 = await abrirNavegador('um')
  const aba1 = await nav1.novaAba('aba1')
  abasAbertas.add(aba1)
  await aba1.abrir()
  await aba1.clicar('Salão da Glória')
  await aba1.esperarTela('Salão da Glória')
  for (const nomeDaAba of ['Melhores pontuações', 'Nível total', 'Por classe', 'Ouro', 'Monstros', 'Maior duração']) {
    await aba1.clicar(nomeDaAba)
    await aba1.esperar(`!document.body.innerText.includes('Carregando o ranking')`, `a aba ${nomeDaAba} carregar`, 15000)
    const texto = await aba1.texto()
    conferir(`aba "${nomeDaAba}" carrega sem login`, (texto.includes('Jogador') || texto.includes('Ninguém no ranking')) && !texto.includes('Tentar de novo'))
    if (nomeDaAba === 'Por classe') {
      conferir('a aba "Por classe" tem a escolha da classe', await aba1.temBotao('Sacerdote', true))
      await aba1.clicar('Sacerdote')
      await aba1.esperar(`!document.body.innerText.includes('Carregando o ranking')`, 'o ranking do Sacerdote', 15000)
      conferir('trocar a classe carrega o ranking dela', !(await aba1.texto()).includes('Tentar de novo'))
    }
  }
  conferir('sem login não há "Minhas partidas" nem Conquistas', !(await aba1.temBotao('Minhas partidas')) && !(await aba1.temBotao('Conquistas')))
  await aba1.print('01-ranking-sem-login')
  const linhas = (await anonimo.rpc('ranking', { p_aba: 'melhoresPontuacoes' })).data ?? []
  conferir('o ranking público só tem posição, apelido e números', linhas.every((linha) => Object.keys(linha).sort().join() === 'apelido,desempate,posicao,valor'), linhas[0])
  const semLogin = {
    perfis: (await anonimo.from('perfis').select('*')).data?.length ?? 0,
    saves: (await anonimo.from('saves').select('*')).data?.length ?? 0,
    partidas: (await anonimo.from('partidas').select('*')).data?.length ?? 0,
  }
  conferir('sem login, ninguém lê perfis, saves nem partidas direto', semLogin.perfis + semLogin.saves + semLogin.partidas === 0, semLogin)

  console.log('2. Login e sessão única entre dois navegadores (RF04, RF05)')
  await aba1.clicar('Voltar')
  await irAoLogin(aba1)
  const telaDaA = await entrar(aba1, contaA)
  if (telaDaA === 'Login' && (await mensagemDoAcesso(aba1)).includes('Conta em uso')) {
    throw new Error('a conta A já estava em uso (uma rodada anterior caiu no meio?). Espere 3 minutos e rode de novo.')
  }
  conferir('a conta A entrou e chegou ao Reino', telaDaA === 'Reino', { tela: telaDaA, mensagem: await mensagemDoAcesso(aba1) })
  const apelidoDaA = (await a.cliente.from('perfis').select('apelido').maybeSingle()).data?.apelido
  conferir('o HUD do Reino mostra o apelido da conta', Boolean(apelidoDaA) && (await aba1.texto()).includes(`${apelidoDaA} · Líder:`), apelidoDaA)
  await aba1.print('02-reino-da-conta')

  const nav2 = await abrirNavegador('dois')
  const aba2 = await nav2.novaAba('aba1')
  abasAbertas.add(aba2)
  await aba2.abrir()
  await irAoLogin(aba2)
  const telaNoSegundo = await entrar(aba2, contaA)
  const emUso = await mensagemDoAcesso(aba2)
  conferir('outro navegador na mesma conta: fica no Login com "Conta em uso"', telaNoSegundo === 'Login' && emUso.includes('Conta em uso'), emUso)
  await aba2.print('03-conta-em-uso')

  console.log('3. Duas abas do mesmo navegador (RF05)')
  const aba1b = await nav1.novaAba('aba2')
  await aba1b.abrir()
  await irAoLogin(aba1b)
  await aba1b.esperar(`[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Continuar como'))`, 'o "Continuar como"', 8000).catch(() => {})
  conferir('a segunda aba lembra a conta ("Continuar como ...")', await aba1b.temBotao('Continuar como'))
  await entrar(aba1b, contaA, 'continuar')
  const outraAba = await mensagemDoAcesso(aba1b)
  conferir('a segunda aba não entra: o jogo já está aberto com a conta em outra aba', outraAba.includes('outra aba'), outraAba)
  await aba1b.fechar()

  console.log('4. Save no banco nos momentos de salvamento (RF10, TASK-096)')
  const versaoAntes = (await saveNoBanco(a.cliente))?.versao ?? 0
  await irAteAPartida(aba1, async () =>
    conferir(
      PUBLICADO ? 'no jogo publicado, o Mapa não tem a "Arena de teste" (só no npm run dev)' : 'no npm run dev, o Mapa tem a "Arena de teste"',
      (await aba1.temBotao('Arena de teste')) === !PUBLICADO,
    ),
  )
  await esperarArena(aba1)
  if (PUBLICADO) {
    await pausa(1500)
    const hud = await aba1.avaliar(`({
      regiao: document.querySelector('.hud-regiao')?.textContent ?? '',
      minimapa: !!document.querySelector('.hud-minimapa-ativo canvas.minimapa'),
      barraDeTeste: [...document.querySelectorAll('button')].some(b => ['Vitória', 'Encher grupo', 'Encher mochila'].includes(b.textContent.trim())),
    })`)
    conferir('no jogo publicado, a Floresta abre: desenho, minimapa e "Região: Zona segura" no HUD', hud.minimapa && hud.regiao.includes('Zona segura'), hud)
    conferir('no jogo publicado, a partida não tem a barra de teste', !hud.barraDeTeste)
    await aba1.print('04a-floresta-publicada')
  }
  const depoisDeComecar = await esperarNoBanco(() => saveNoBanco(a.cliente), (save) => (save?.versao ?? 0) > versaoAntes, 'o save subir')
  conferir('começar a partida envia o save ao banco, com versão maior', (depoisDeComecar?.versao ?? 0) > versaoAntes, { antes: versaoAntes, depois: depoisDeComecar?.versao })
  const local = await copiaLocal(aba1, a.id)
  conferir('a cópia local da conta e o banco ficam na mesma versão', local?.versao === depoisDeComecar?.versao && local?.versaoNoBanco === depoisDeComecar?.versao, {
    local: local && { versao: local.versao, versaoNoBanco: local.versaoNoBanco },
    banco: depoisDeComecar?.versao,
  })
  const partidasAntes = await partidasNoBanco(a.cliente)
  await terminarComVitoria(aba1)
  await aba1.esperarTela('Resumo')
  const partidasDepois = await esperarNoBanco(() => partidasNoBanco(a.cliente), (n) => n === partidasAntes + 1, 'a partida ser registrada')
  conferir('o fim da partida vai para o histórico (TASK-100)', partidasDepois === partidasAntes + 1, { antes: partidasAntes, depois: partidasDepois })
  const ultima = (await a.cliente.from('partidas').select('bioma, resultado').order('jogada_em', { ascending: false }).limit(1)).data?.[0]
  conferir('a partida registrada é a Vitória na Floresta', ultima?.resultado === 'vitoria' && ultima?.bioma === 'floresta', ultima)
  const depoisDoFim = await esperarNoBanco(() => saveNoBanco(a.cliente), (save) => save.versao > depoisDeComecar.versao, 'o save subir no fim')
  conferir('o fim da partida também envia o save', depoisDoFim.versao > depoisDeComecar.versao, depoisDoFim.versao)

  console.log('5. Histórico e ranking com conta (RF15, RF16)')
  await aba1.clicar('Salão da Glória')
  await aba1.esperarTela('Salão da Glória')
  await aba1.clicar('Minhas partidas')
  await aba1.esperar(`!document.body.innerText.includes('Carregando o histórico')`, 'o histórico', 15000)
  const historico = await aba1.texto()
  conferir('Minhas partidas mostra a partida, com data, bioma, resultado, tempo, pontuação e ouro', ['Vitória', 'Floresta', 'Tempo ativo', 'Pontuação', 'Página 1 de'].every((t) => historico.includes(t)))
  await aba1.print('04-minhas-partidas')
  await aba1.clicar('Melhores pontuações')
  await aba1.esperar(`!document.body.innerText.includes('Carregando o ranking')`, 'o ranking', 15000)
  const destaque = await aba1.avaliar(`document.querySelector('.linha-minha')?.innerText ?? ''`)
  conferir('o ranking destaca a própria conta', destaque.includes(apelidoDaA), destaque)
  await aba1.print('05-ranking-com-conta')

  console.log('6. Save antigo recusado (RF10, RNF06)')
  // Os pedidos saem pelo Node, com a mesma conta A e a sessão desta aba (o jogo publicado não expõe o cliente do Supabase)
  const sessaoDaAba = await aba1.avaliar(`sessionStorage.getItem('jogo-rpg:sessao-da-aba')`)
  const guardado = await saveNoBanco(a.cliente)
  const recusa = await a.cliente.rpc('salvar_progresso', { p_sessao: sessaoDaAba, p_versao: 1, p_formato: 1, p_progresso: guardado.progresso })
  const antigo = { resposta: recusa.data, erro: recusa.error?.message ?? null, guardada: guardado.versao }
  conferir('uma versão antiga é recusada pelo banco (motivo: versão)', antigo.resposta?.aceito === false && antigo.resposta?.motivo === 'versao', antigo)
  // Outro lugar gravou uma versão mais nova (simulado com a sessão desta aba): o próximo salvamento do jogo é recusado,
  // e o jogo carrega o progresso mais novo do banco, com aviso, em vez de passar por cima
  const versaoMaisNova = guardado.versao + 5
  const gravouMaisNova = await a.cliente.rpc('salvar_progresso', {
    p_sessao: sessaoDaAba,
    p_versao: versaoMaisNova,
    p_formato: 1,
    p_progresso: { ...guardado.progresso, ouro: 4242 },
  })
  const maisNova = { aceito: gravouMaisNova.data?.aceito, versao: versaoMaisNova }
  conferir('(preparação) o banco aceitou uma versão mais nova vinda de "outro lugar"', maisNova.aceito === true, maisNova)
  await aba1.clicar('Voltar')
  await aba1.esperarTela('Resumo')
  await aba1.clicar('Voltar ao Reino')
  await aba1.esperarTela('Reino')
  await irAteAPartida(aba1)
  await aba1.esperar(`document.body.innerText.includes('mais novo')`, 'o aviso do progresso mais novo', 15000).catch(() => {})
  const telaRecusa = await aba1.titulo()
  const textoRecusa = await aba1.texto()
  conferir('o salvamento recusado traz o progresso mais novo do banco, com aviso, e volta ao Reino', telaRecusa === 'Reino' && textoRecusa.includes('mais novo') && textoRecusa.includes('Ouro: 4242'), {
    tela: telaRecusa,
  })
  conferir('a cópia local passa a ser a versão do banco', (await copiaLocal(aba1, a.id))?.versao === maisNova.versao)
  await aba1.print('06-save-mais-novo-do-banco')
  await fecharAvisos(aba1)

  console.log('7. Uma conta não lê nem altera o que é da outra (RLS)')
  const versaoDaBAgora = (await saveNoBanco(b.cliente))?.versao ?? null
  // Logado como A (como o jogo, só com a chave publicável), tentando ler e mexer no que é da B
  const invasao = await (async (cliente, B) => {
    const contar = (r) => (r.data ?? []).length
    const saves = await cliente.from('saves').select('conta')
    const perfis = await cliente.from('perfis').select('id')
    const partidas = await cliente.from('partidas').select('conta')
    return {
      saves: (saves.data ?? []).map((l) => l.conta),
      perfis: (perfis.data ?? []).map((l) => l.id),
      partidas: [...new Set((partidas.data ?? []).map((l) => l.conta))],
      saveDaB: contar(await cliente.from('saves').select('conta').eq('conta', B)),
      sessoes: contar(await cliente.from('sessoes').select('*')),
      inserirPartidaNaB:
        (await cliente.from('partidas').insert({ conta: B, bioma: 'floresta', resultado: 'vitoria', pontuacao: 999999, ouro: 0, monstros: 0, tempo_ativo: 0, tempo_total: 0 })).error
          ?.code ?? 'passou',
      inserirSaveNaB: (await cliente.from('saves').insert({ conta: B, versao: 999999, formato: 1, progresso: {} })).error?.code ?? 'passou',
      alterarSaveDaB: contar(await cliente.from('saves').update({ versao: 999999 }).eq('conta', B).select()),
      alterarMeuSave: contar(await cliente.from('saves').update({ versao: 999999 }).eq('conta', a.id).select()),
      apagarPartidasDaB: contar(await cliente.from('partidas').delete().eq('conta', B).select()),
      mudarApelidoDaB: contar(await cliente.from('perfis').update({ apelido: 'Invasor' }).eq('id', B).select()),
      apagarSessaoDaB: contar(await cliente.from('sessoes').delete().eq('conta', B).select()),
    }
  })(a.cliente, b.id)
  conferir('A lê só o próprio save, o próprio perfil e as próprias partidas', invasao.saves.every((c) => c === a.id) && invasao.perfis.every((c) => c === a.id) && invasao.partidas.every((c) => c === a.id) && invasao.saveDaB === 0, invasao)
  conferir('A não vê nenhuma sessão (só as funções mexem nela)', invasao.sessoes === 0)
  conferir('A não registra partida nem cria save no nome da B', invasao.inserirPartidaNaB !== 'passou' && invasao.inserirSaveNaB !== 'passou', invasao)
  conferir('A não altera o save da B nem escreve direto no próprio (só pela função)', invasao.alterarSaveDaB === 0 && invasao.alterarMeuSave === 0)
  conferir('A não apaga partidas da B, não muda o apelido da B nem derruba a sessão da B', invasao.apagarPartidasDaB === 0 && invasao.mudarApelidoDaB === 0 && invasao.apagarSessaoDaB === 0)
  conferir('do lado da B, nada mudou (save e partidas)', ((await saveNoBanco(b.cliente))?.versao ?? null) === versaoDaBAgora && (await partidasNoBanco(b.cliente)) === partidasDaBAntes)

  console.log('8. Queda de internet durante o salvamento (RNF09)')
  const bancoAntesDaQueda = (await saveNoBanco(a.cliente)).versao
  const partidasAntesDaQueda = await partidasNoBanco(a.cliente)
  await aba1.semInternet(true)
  await irAteAPartida(aba1)
  await esperarArena(aba1)
  conferir('sem internet, a partida começa normal', (await aba1.titulo()) !== 'Reino')
  await terminarComVitoria(aba1)
  await aba1.esperarTela('Resumo')
  conferir('sem internet, o fim da partida mostra o Resumo normal', true)
  await aba1.clicar('Voltar ao Reino')
  await aba1.esperarTela('Reino')
  await abrirConfiguracoes(aba1)
  await pausa(500)
  conferir('as Configurações avisam que o progresso espera neste navegador', (await aba1.texto()).includes('Sem conexão com a nuvem agora'))
  await aba1.print('07-sem-internet')
  const localSemInternet = await copiaLocal(aba1, a.id)
  conferir('a cópia local guardou tudo (versão nova, ainda não confirmada pela nuvem)', localSemInternet.versao > localSemInternet.versaoNoBanco, {
    versao: localSemInternet.versao,
    versaoNoBanco: localSemInternet.versaoNoBanco,
  })
  conferir('nada chegou ao banco enquanto estava sem internet', (await saveNoBanco(a.cliente)).versao === bancoAntesDaQueda)
  await aba1.semInternet(false)
  await aba1.avaliar(`(window.dispatchEvent(new Event('online')), true)`)
  const voltou = await esperarNoBanco(() => saveNoBanco(a.cliente), (save) => save.versao === localSemInternet.versao, 'o save subir depois da volta')
  conferir('a internet voltou: o save sobe sozinho', voltou.versao === localSemInternet.versao, { banco: voltou.versao, local: localSemInternet.versao })
  const partidasDepoisDaVolta = await esperarNoBanco(() => partidasNoBanco(a.cliente), (n) => n === partidasAntesDaQueda + 1, 'a partida subir')
  conferir('...e a partida jogada sem internet também', partidasDepoisDaVolta === partidasAntesDaQueda + 1, { antes: partidasAntesDaQueda, depois: partidasDepoisDaVolta })

  console.log('9. Sair da conta (RF08) e fechar a aba liberam a conta na hora (RF05)')
  await aba1.clicar('Sair da conta')
  await aba1.recarregou()
  conferir('Sair da conta recarrega e volta à Tela inicial', (await aba1.titulo()) === 'Tela inicial')
  await irAoLogin(aba1)
  await pausa(800)
  conferir('o navegador esqueceu a conta (sem "Continuar como")', !(await aba1.temBotao('Continuar como')))
  await irAoLogin(aba2)
  const telaDepoisDeSair = await entrar(aba2, contaA)
  conferir('logo depois de sair, o outro navegador entra (a sessão fechou na hora)', telaDepoisDeSair === 'Reino', await mensagemDoAcesso(aba2))
  // Agora fechando a aba sem sair: a sessão também acaba na hora (o pedido sai enquanto a página fecha)
  await aba2.fechar()
  abasAbertas.delete(aba2)
  await pausa(2000)
  const telaDepoisDeFechar = await entrar(aba1, contaA)
  conferir('fechar a aba sem sair também libera a conta na hora', telaDepoisDeFechar === 'Reino', await mensagemDoAcesso(aba1))
  await abrirConfiguracoes(aba1)
  await aba1.clicar('Sair da conta')
  await aba1.recarregou()
  await irAoLogin(aba1)

  console.log('10. Passagem do convidado para a conta nova (RF03)')
  if (!passarConvidadoParaB) {
    console.log('  (pulado: a conta B já tem save no banco; a passagem só é testada enquanto a conta é nova. Está no roteiro manual.)')
  } else {
    await aba1.clicar('Jogar como convidado')
    await aba1.esperarTela('Narrativa inicial')
    await aba1.clicar('Continuar')
    await aba1.clicar('Arqueiro')
    await aba1.clicar('Escolher Arqueiro')
    await aba1.esperarTela('Reino')
    // Como se a conta B tivesse sido criada pelas Configurações deste convidado (o e-mail de confirmação não dá para
    // automatizar): a marca que o cadastro grava neste navegador
    await aba1.avaliar(`(localStorage.setItem('jogo-rpg:transferir-convidado', JSON.stringify({ conta: ${JSON.stringify(b.id)} })), true)`)
    await abrirConfiguracoes(aba1)
    await aba1.clicar('Criar conta')
    await aba1.esperarTela('Criar conta')
    await aba1.clicar('Voltar ao Login')
    await aba1.esperarTela('Login')
    const telaDaB = await entrar(aba1, contaB)
    const textoDaB = await aba1.texto()
    conferir('a conta B entra com o progresso do convidado (Líder Arqueiro) e o aviso', telaDaB === 'Reino' && textoDaB.includes('Líder: Arqueiro') && textoDaB.includes('progresso do convidado'), telaDaB)
    await aba1.print('08-convidado-virou-conta')
    conferir('o save do convidado sai deste navegador', (await aba1.avaliar(`localStorage.getItem('jogo-rpg:convidado')`)) === null)
    const saveDaB = await esperarNoBanco(() => saveNoBanco(b.cliente), (save) => Boolean(save), 'o save da B')
    conferir('o banco recebeu o progresso do convidado na conta B', saveDaB?.progresso?.lider === 'arqueiro', saveDaB?.progresso?.lider)
    await fecharAvisos(aba1)
    await abrirConfiguracoes(aba1)
    await aba1.clicar('Sair da conta')
    await aba1.recarregou()
  }

  console.log('11. Link de e-mail expirado, senha nova sem link e Supabase fora do ar')
  // Num navegador novo: o 2 fechou a aba sem sair e ainda lembra a conta A (a "Senha nova" trocaria a senha dela)
  const nav3 = await abrirNavegador('tres')
  const aba3 = await nav3.novaAba('aba1')
  abasAbertas.add(aba3)
  await aba3.abrir(`${SITE}#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`)
  await pausa(500)
  conferir('link expirado: o jogo abre no Login explicando', (await aba3.titulo()) === 'Login' && (await mensagemDoAcesso(aba3)).includes('expirou ou já foi usado'))
  await aba3.abrir(`${SITE}#type=recovery`)
  await aba3.esperarTela('Senha nova')
  await aba3.digitar('Senha nova', 'senhanova123')
  await aba3.digitar('Repita a senha nova', 'senhanova123')
  await aba3.clicar('Salvar senha nova')
  await esperarPedido(aba3)
  conferir('senha nova sem um link válido: explica onde pedir outro link, sem travar', (await aba3.titulo()) === 'Senha nova' && (await mensagemDoAcesso(aba3)).includes('Esqueci minha senha'), await mensagemDoAcesso(aba3))
  await aba3.bloquear(['*supabase.co*'])
  await aba3.abrir()
  await irAoLogin(aba3)
  const foraDoAr = await entrar(aba3, contaA)
  const mensagemForaDoAr = await mensagemDoAcesso(aba3)
  conferir('Supabase fora do ar: o Login explica e oferece o convidado', foraDoAr === 'Login' && mensagemForaDoAr.includes('convidado'), mensagemForaDoAr)
  await aba3.print('09-supabase-fora-do-ar')
  await aba3.clicar('Jogar como convidado')
  await aba3.esperarTela('Narrativa inicial')
  conferir('...e o convidado continua jogando', true)

  const erros = []
  for (const aba of abasAbertas) {
    const daAba = (await aba.avaliar(`window.__erros ?? []`)).filter((erro) => !/fetch|network|ERR_|Failed to load/i.test(erro))
    erros.push(...daAba.map((erro) => `${aba.nome}: ${erro}`))
  }
  conferir('nenhum erro no console (fora as falhas de rede de propósito)', erros.length === 0, erros.slice(0, 5))
} catch (erro) {
  falhas++
  console.log('  ERRO', erro.message)
}

console.log(`\n${total - falhas} de ${total} conferências passaram${falhas ? `; ${falhas} falharam` : ''}. Prints em ${PASTA}`)
await desligar(falhas ? 1 : 0)
