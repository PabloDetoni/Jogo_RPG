// Roteiro do celular (Parte 14, 28/11/2026). Uso: npm run testar:celular (no npm run dev) ou
// npm run testar:celular:publicado (no jogo publicado, sem ligar o Vite).
// Liga um Edge escondido que finge ser um celular (o tamanho, a densidade e o toque pelo protocolo de depuração, sem
// biblioteca nova) e joga com o dedo: a tela "Gire o celular" em pé; deitado, entra como convidado, escolhe a classe,
// passa pelo Reino e por cada tela, joga um minijogo, começa uma partida, anda com o joystick, ataca com o toque (a mira
// automática), usa uma habilidade, esquiva, abre a mochila e mexe num item, abre o mapa, pausa, liga o mudo e volta com
// o Q. Dois aparelhos (Pixel 7 e iPhone 14, deitados) e, no fim, as telas em 640 × 360 e em 932 × 430: nada cortado
// nem encavalado e nenhuma letra menor que 12 px. No jogo publicado, as conferências por dentro da partida (que
// precisam do npm run dev) dão lugar às da tela. Prints em testes-do-navegador/celular/ (fora do git).
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PUBLICADO = process.argv.includes('--publicado')
const ENDERECO_PUBLICADO = (process.env.ENDERECO_DA_VERCEL || 'https://jogo-rpg-six.vercel.app').replace(/\/+$/, '')
const PASTA = resolve('testes-do-navegador', 'celular', PUBLICADO ? 'publicado' : 'local')
const vite = PUBLICADO ? null : await ligarVite(5199)
const SITE = PUBLICADO ? `${ENDERECO_PUBLICADO}/` : vite.site
let navegador = null
let aba = null

async function desligar(codigo) {
  await navegador?.fechar()
  await vite?.fechar()
  process.exit(codigo)
}
const { estado, conferir, parar } = criarConferencias(() => desligar(1))

// O tamanho de cada aparelho em px de CSS (o que o jogo vê). A densidade fica em 2 nos dois: com 2,625 ou 3, o Edge
// escondido não consegue tirar o print do Reino (a foto trava; o jogo continua a 60 quadros por segundo)
const aparelhos = [
  { nome: 'Pixel 7', largura: 915, altura: 412, densidade: 2, classe: 'Guerreiro' },
  { nome: 'iPhone 14', largura: 844, altura: 390, densidade: 2, classe: 'Arqueiro' },
]
const tamanhosDeConferir = [
  { nome: '640 × 360', largura: 640, altura: 360 },
  { nome: '932 × 430', largura: 932, altura: 430 },
]

// Por dentro da partida (só no npm run dev)
const CENA = `window.__jogoDaPartida.scene.getScene('arena')`
const cena = (expr) => aba.avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)
const tituloDaTela = () => aba.avaliar(`document.querySelector('.tela .titulo')?.textContent ?? ''`)

// Nada cortado, encavalado nem pequeno na tela de agora
async function telaInteira(nome) {
  await pausa(250)
  const problemas = await aba.problemasNaTela()
  const lista = Object.entries(problemas).filter(([, itens]) => itens.length)
  conferir(`${nome}: nada cortado nem encavalado, letra de 12 px ou mais`, lista.length === 0, lista.length ? Object.fromEntries(lista) : undefined)
  // A dica da primeira visita fica por cima da tela: o jogador toca em "Entendi"
  const entendi = await aba.centroDe('.dica-da-tela .botao')
  if (entendi) await aba.tocar(entendi.x, entendi.y)
}
// Toca num lugar do Reino (a placa) ou do Mapa (o desenho do lugar, onde fica o nome dele)
const tocarNoLugarDoReino = (id) => aba.tocarNoElemento(`.placa-do-reino[data-lugar="${id}"]`)
const tocarNoLugarDoMapa = async (id) => {
  const centro = await aba.avaliar(`(() => {
    const botao = document.querySelector('[data-lugar="${id}"]')
    const placa = botao?.closest('.regiao-do-mapa')?.querySelector('.placa-do-lugar')
    if (!placa) return null
    const r = placa.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  })()`)
  if (!centro) throw new Error(`não achei o lugar ${id} no Mapa`)
  await aba.tocar(centro.x, centro.y)
}
// O Mercado, a Forja e a Guilda começam pela conversa com o NPC: a primeira opção abre a tela
async function abrirLojaPeloNpc() {
  const centro = await aba.centroDe('.npc-menu .botao-de-acao')
  if (centro) await aba.tocar(centro.x, centro.y)
}
const tocarNoBotaoDoToque = (rotulo) => aba.tocarNoElemento(`.controles-de-toque [aria-label="${rotulo}"]`)
const erros = () => aba.avaliar(`(window.__erros ?? []).filter((e) => !/Failed to load resource|net::ERR|supabase|Supabase|fetch/.test(e))`)

// Uma aba nova já no tamanho do aparelho (o Edge escondido para de desenhar quando a emulação muda com a página aberta:
// cada tamanho ganha a sua aba)
let numeroDaAba = 0
async function abaNoCelular(aparelho) {
  // o jogo só deixa uma aba aberta por convidado: a anterior fecha antes
  if (aba) {
    await aba.fechar()
    await pausa(1500)
  }
  const nova = await navegador.novaAba(`aba${++numeroDaAba}`)
  await nova.simularTelaCheia()
  await nova.emularCelular(aparelho)
  return nova
}

// Um aparelho do começo ao fim
async function jogarNoAparelho(aparelho, primeiro) {
  console.log(`\n=== ${aparelho.nome} (${aparelho.largura} × ${aparelho.altura}) ===`)
  navegador = await abrirNavegador(`celular-${aparelho.nome.replace(/\W+/g, '')}`, PASTA)
  aba = null // a aba do aparelho anterior foi junto com o navegador dele
  const prefixo = aparelho.nome.replace(/\W+/g, '').toLowerCase()

  console.log('1. Em pé: "Gire o celular"; girando, ele some')
  aba = await abaNoCelular({ ...aparelho, emPe: true })
  await aba.abrir(SITE)
  await pausa(400)
  const emPe = await aba.avaliar(`({ gire: !!document.querySelector('.gire-o-celular'), texto: document.querySelector('.gire-o-celular h2')?.textContent ?? '', toque: document.documentElement.dataset.toque ?? null })`)
  conferir('em pé, a tela "Gire o celular" cobre o jogo', emPe.gire && emPe.texto === 'Gire o celular', emPe)
  conferir('o jogo sabe que está no toque (pelo jeito de apontar, não pelo tamanho)', emPe.toque === 'sim', emPe)
  await aba.print(`${prefixo}-01-gire-o-celular`)
  await aba.emularCelular(aparelho)
  await pausa(400)
  conferir('girando para deitado, o "Gire o celular" some', !(await aba.avaliar(`!!document.querySelector('.gire-o-celular')`)))
  await aba.fechar()

  console.log('2. Deitado: a tela inicial')
  aba = await abaNoCelular(aparelho)
  await aba.abrir(SITE)
  await pausa(400)
  conferir('deitado, sem o "Gire o celular"', !(await aba.avaliar(`!!document.querySelector('.gire-o-celular')`)))
  conferir('a moldura do jogo está no modo de toque', await aba.avaliar(`!!document.querySelector('.moldura[data-toque]')`))
  await telaInteira('Tela inicial')
  await aba.print(`${prefixo}-02-tela-inicial`)

  console.log('3. Entrar como convidado e escolher a classe, com o dedo')
  await aba.tocarNoBotao('Iniciar jogo')
  const telaCheia = await aba.avaliar(`window.__telaCheia ?? null`)
  conferir('a tela cheia entra junto com o toque em Iniciar jogo (no clique, como no computador)', telaCheia?.noClique >= 1 && telaCheia?.foraDoClique === 0, telaCheia)
  await aba.esperarTela('Login')
  await telaInteira('Login')
  await aba.tocarNoBotao('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await telaInteira('Narrativa inicial')
  await aba.tocarNoBotao('Continuar')
  await aba.esperarTela('Seleção de classe')
  await aba.tocarNoBotao(aparelho.classe)
  await telaInteira('Seleção de classe')
  await aba.tocarNoBotao(`Escolher ${aparelho.classe}`)
  await aba.esperar(`document.querySelector('.tela-reino')`, 'o Reino')
  await pausa(600)
  await telaInteira('Reino')
  await aba.print(`${prefixo}-03-reino`)

  console.log('4. Cada lugar do Reino pelo toque na placa')
  for (const [id, nome, loja] of [
    ['mercado', 'Mercado', true],
    ['forja', 'Forja', true],
    ['guilda', 'Guilda', true],
    ['mochila', 'Mochila', false],
    ['arvores', 'Árvores de Habilidades', false],
    ['salaoGloria', 'Salão da Glória', false],
  ]) {
    await tocarNoLugarDoReino(id)
    await aba.esperarTela(nome)
    await telaInteira(`${nome}${loja ? ' (o NPC)' : ''}`)
    if (loja) {
      await abrirLojaPeloNpc()
      await telaInteira(`${nome} (a loja)`)
    }
    if (primeiro) await aba.print(`${prefixo}-04-${id}`)
    await aba.tocarNoBotao(id === 'salaoGloria' ? 'Voltar' : 'Voltar ao Reino')
    await aba.esperar(`document.querySelector('.tela-reino')`, 'o Reino de novo')
    await pausa(300)
  }
  await tocarNoLugarDoReino('configuracoes')
  await aba.esperar(`[...document.querySelectorAll('.janela h2')].some((h) => h.textContent.includes('Configurações'))`, 'as Configurações')
  conferir('as Configurações têm a opção do Modo leve', await aba.temBotao('Modo leve'))
  await telaInteira('Configurações (janela)')
  await aba.tocarNoBotao('Fechar')

  console.log('5. Mapa e um minijogo (a Mina) com o toque')
  await tocarNoLugarDoReino('jogar')
  await aba.esperarTela('Mapa')
  await pausa(500)
  await telaInteira('Mapa')
  // no toque, os nomes dos lugares do Mapa aparecem sempre (não há "mouse em cima") e não se encavalam
  const placas = await aba.avaliar(`(() => {
    const r = [...document.querySelectorAll('.placa-do-lugar')].map((p) => ({ nome: p.querySelector('strong')?.textContent, ...p.getBoundingClientRect().toJSON(), opacidade: getComputedStyle(p).opacity }))
    const juntas = []
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
      const a = r[i], b = r[j]
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) juntas.push(a.nome + ' × ' + b.nome)
    }
    return { visiveis: r.filter((p) => p.opacidade === '1').length, total: r.length, juntas }
  })()`)
  conferir('no Mapa, os nomes de todos os lugares aparecem, sem um em cima do outro', placas.visiveis === placas.total && placas.total >= 8 && placas.juntas.length === 0, placas)
  if (primeiro) await aba.print(`${prefixo}-05-mapa`)
  await tocarNoLugarDoMapa('mina')
  await aba.esperarTela('Minijogo da Mina')
  conferir('no toque, a regra do minijogo fala em "toque"', await aba.avaliar(`document.body.innerText.includes('Toque 3 vezes')`))
  await telaInteira('Minijogo da Mina')
  await aba.tocarNoBotao('Começar rodada')
  await pausa(400)
  // 2 toques racham a pedra (faltam 1 golpe); o terceiro quebra e conta no placar
  const placarAntes = await aba.avaliar(`document.querySelector('.minijogo-placar')?.textContent ?? ''`)
  for (let i = 0; i < 2; i++) await aba.tocarNoElemento('.pedra-da-mina', 40)
  const rachada = await aba.avaliar(`document.querySelector('.pedra-da-mina')?.getAttribute('aria-label') ?? ''`)
  await aba.tocarNoElemento('.pedra-da-mina', 40)
  await pausa(200)
  const placarDepois = await aba.avaliar(`document.querySelector('.minijogo-placar')?.textContent ?? ''`)
  conferir('tocar na pedra da Mina dá os golpes e quebra a pedra (o minijogo funciona com o toque)', rachada.includes('faltam 1') && placarAntes !== placarDepois, { rachada, placarAntes, placarDepois })
  await aba.print(`${prefixo}-05-mina`)
  await aba.tocarNoBotao('Voltar ao Mapa')
  await aba.esperarTela('Mapa')
  await pausa(500)

  console.log('6. Floresta, Caravana, Preparação e a partida')
  await tocarNoLugarDoMapa('floresta')
  await aba.esperarTela('Caravana')
  await telaInteira('Caravana')
  await aba.tocarNoBotao('Começar no início')
  await aba.esperarTela('Preparação')
  await telaInteira('Preparação')
  await aba.tocarNoBotao('Começar partida')
  await aba.esperar(`!!document.querySelector('.controles-de-toque') && !document.querySelector('.carregando-a-partida')`, 'a partida com os controles de toque', 25000)
  await pausa(1200)
  if (!PUBLICADO) await aba.esperar(`!!${CENA}?.lider`, 'a cena', 10000)

  const controles = await aba.avaliar(`(() => {
    const tamanho = (e) => { const r = e.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)) }
    const botoes = [...document.querySelectorAll('.controles-de-toque button')].filter((b) => b.offsetParent !== null)
    return {
      joystick: !!document.querySelector('.toque-joystick-zona'),
      ataque: !!document.querySelector('.toque-ataque'),
      habilidades: document.querySelectorAll('.toque-habilidade').length,
      esquiva: !!document.querySelector('.toque-esquiva'),
      doTopo: [...document.querySelectorAll('.toque-botao-do-topo')].map((b) => b.getAttribute('aria-label')),
      menor: Math.min(...botoes.map(tamanho)),
      barraDoComputador: getComputedStyle(document.querySelector('.hud-barra-de-acoes') ?? document.body).display,
    }
  })()`)
  conferir('na partida aparecem o joystick, o ataque, as 3 habilidades, a esquiva e os botões do alto', controles.joystick && controles.ataque && controles.habilidades === 3 && controles.esquiva && controles.doTopo.join(',') === 'Mochila,Mapa,Pausa,Mais', controles)
  conferir('nenhum botão de toque menor que 44 px', controles.menor >= 44, controles.menor)
  conferir('a barra de ações do computador dá lugar aos botões de toque', controles.barraDoComputador === 'none', controles.barraDoComputador)
  await telaInteira('Partida')
  await aba.print(`${prefixo}-06-partida`)

  // O joystick: o polegar encosta à esquerda e arrasta para a direita
  const zona = await aba.avaliar(`(() => { const r = document.querySelector('.toque-joystick-zona').getBoundingClientRect(); return { x: r.x + r.width * 0.4, y: r.y + r.height * 0.6 } })()`)
  const antes = PUBLICADO ? null : await cena(`({ x: c.lider.x, y: c.lider.y })`)
  await aba.arrastarDedo(zona.x, zona.y, zona.x + 70, zona.y, { msParado: 900, soltar: false })
  const durante = await aba.avaliar(`!!document.querySelector('.toque-joystick:not(.toque-joystick-parado)')`)
  await aba.print(`${prefixo}-07-joystick`)
  await aba.dedos('touchEnd', [])
  await pausa(250)
  conferir('o joystick aparece onde o polegar encostou', durante)
  if (!PUBLICADO) {
    const depois = await cena(`({ x: c.lider.x, y: c.lider.y, parado: c.toque.mover.x === 0 && c.toque.mover.y === 0 })`)
    conferir('arrastando o joystick para a direita, o Líder anda para a direita', depois.x - antes.x > 60, { antes, depois })
    conferir('soltando o polegar, o Líder para', depois.parado, depois)
  }

  // O ataque com a mira automática: um mob perto, à direita e um pouco acima
  if (!PUBLICADO) {
    const classe = aparelho.classe.toLowerCase()
    const mob = await cena(`(() => { const m = c.criarInimigo('mobVermelho', { x: c.lider.x + 120, y: c.lider.y - 60 }); m.config = { ...m.config, dano: 0 }; return { x: m.x, y: m.y } })()`)
    await pausa(200)
    // a mira automática (antes do ataque, que pode derrubar o mob)
    const mira = await cena(`(() => { const m = c.alvoDoToque; const angulo = c.lider.anguloDaMira; const esperado = m ? Math.atan2(m.y - c.lider.y, m.x - c.lider.x) : null; return { tem: !!m, diferenca: esperado === null ? null : Math.abs(Math.atan2(Math.sin(angulo - esperado), Math.cos(angulo - esperado))) } })()`)
    conferir('a mira automática aponta para o inimigo mais perto dentro do alcance', mira.tem && mira.diferenca < 0.2, { mob, mira })
    const tiros = await cena(`c.contagemDeTiros.disparados[${JSON.stringify(classe)}] ?? 0`)
    if (classe === 'arqueiro') {
      // O arco: segurar puxa, soltar atira
      const centro = await aba.centroDe('.toque-ataque')
      await aba.dedos('touchStart', [{ x: centro.x, y: centro.y, id: 2 }])
      await pausa(700)
      const puxando = await cena(`!!c.lider.puxando`)
      await aba.dedos('touchEnd', [])
      await pausa(250)
      const depois = await cena(`({ tiros: c.contagemDeTiros.disparados.arqueiro ?? 0, carga: c.lider.ultimaCarga ?? 0, puxando: !!c.lider.puxando })`)
      conferir('Arqueiro: segurar o botão de ataque puxa o arco', puxando)
      conferir('Arqueiro: soltar atira a flecha com a carga do tempo segurado', depois.tiros === tiros + 1 && depois.carga > 0.3 && !depois.puxando, depois)
    } else {
      await aba.tocarNoElemento('.toque-ataque')
      await pausa(150)
      const depois = await cena(`c.contagemDeTiros.disparados[${JSON.stringify(classe)}] ?? 0`)
      conferir('tocar no ataque ataca', depois > tiros, { tiros, depois })
    }
    // Arrastar a partir do ataque mira para o lado do arraste (aqui, para a esquerda, longe do mob)
    const centro = await aba.centroDe('.toque-ataque')
    await aba.arrastarDedo(centro.x, centro.y, centro.x - 60, centro.y, { msParado: 150, soltar: false, id: 3 })
    const angulo = await cena(`c.lider.anguloDaMira`)
    await aba.dedos('touchEnd', [])
    await pausa(200)
    conferir('arrastar a partir do ataque mira na direção do arraste', Math.abs(Math.abs(angulo) - Math.PI) < 0.25, angulo)

    // Uma habilidade (a 1) e a esquiva
    await cena(`(c.lider.mana = c.lider.manaMaxima, true)`)
    await aba.tocarNoElemento('.toque-habilidade')
    await pausa(250)
    const usou = await cena(`c.lider.ultimoUsoDaHabilidade?.[0] ?? null`)
    conferir('tocar na habilidade 1 usa a habilidade (gasta a mana e começa a recarga)', usou !== null && usou !== undefined, usou)
    await aba.tocarNoElemento('.toque-esquiva')
    await pausa(200)
    conferir('tocar na esquiva esquiva', (await cena(`c.ultimaEsquiva`)) !== null)
    await cena(`(c.inimigos.filter((i) => !i.morto).forEach((i) => { if (Math.hypot(i.x - c.lider.x, i.y - c.lider.y) < 900) c.matarInimigo(i) }), true)`)
    await pausa(300)
  }

  console.log('7. A mochila no toque')
  if (!PUBLICADO) await cena(`(c.mochila.itens.push({ id: 'pocaoDeVida', quantidade: 4 }), c.lider.vida = Math.max(1, c.lider.vida - 20), true)`)
  await tocarNoBotaoDoToque('Mochila')
  await aba.esperar(`!!document.querySelector('.janela-mochila')`, 'a mochila')
  await pausa(300)
  await telaInteira('Mochila da partida')
  if (!PUBLICADO) {
    // Tocar pega a pilha; o botão "Usar no Líder" acende; segurar pega a metade; arrastar para fora joga no chão
    await aba.tocarNoElemento('.janela-mochila .celula-da-grade:has(.slot:not(.slot-vazio))')
    const naMao = await aba.avaliar(`!!document.querySelector('.item-na-mao')`)
    conferir('tocar no quadradinho pega a pilha (o item vai para a mão)', naMao)
    const usar = await aba.avaliar(`(() => { const b = [...document.querySelectorAll('.mochila-usar-no-toque button')].find((b) => b.textContent.startsWith('Usar no Líder')); return { existe: !!b, ativo: b ? !b.disabled : false, texto: b?.textContent } })()`)
    conferir('com um consumível na mão aparece "Usar no Líder" (o E)', usar.existe && usar.ativo, usar)
    const vidaAntes = await cena(`c.lider.vida`)
    await aba.tocarNoBotao('Usar no Líder')
    await pausa(300)
    const depoisDeUsar = await cena(`({ vida: c.lider.vida, pocoes: c.mochila.itens.find((i) => i.id === 'pocaoDeVida')?.quantidade ?? 0 })`)
    conferir('"Usar no Líder" usa a poção (a vida sobe, uma poção a menos)', depoisDeUsar.vida > vidaAntes && depoisDeUsar.pocoes === 3, { vidaAntes, depoisDeUsar })
    // devolve a pilha da mão para a grade (toque num quadradinho vazio)
    if (await aba.avaliar(`!!document.querySelector('.item-na-mao')`)) await aba.tocarNoElemento('.janela-mochila .celula-da-grade:has(.slot-vazio)')
    await pausa(200)
    const celula = await aba.centroDe('.janela-mochila .celula-da-grade:has(.slot:not(.slot-vazio))')
    await aba.dedos('touchStart', [{ x: celula.x, y: celula.y }])
    await pausa(700)
    await aba.dedos('touchEnd', [])
    await pausa(300)
    const metade = await aba.avaliar(`document.querySelector('.item-na-mao')?.textContent ?? null`)
    conferir('segurar 0,5 s no quadradinho pega a metade', metade !== null && /2/.test(metade), metade)
    if (await aba.avaliar(`!!document.querySelector('.item-na-mao')`)) await aba.tocarNoElemento('.janela-mochila .celula-da-grade:has(.slot:not(.slot-vazio))')
    await pausa(200)
    const noChaoAntes = await cena(`c.itensNoChao.length`)
    const origem = await aba.centroDe('.janela-mochila .celula-da-grade:has(.slot:not(.slot-vazio))')
    const fora = await aba.avaliar(`(() => { const r = document.querySelector('.janela-mochila').getBoundingClientRect(); return { x: Math.max(8, r.x - 30), y: r.y + 30 } })()`)
    await aba.arrastarDedo(origem.x, origem.y, fora.x, fora.y, { passos: 10 })
    await pausa(300)
    const noChaoDepois = await cena(`({ chao: c.itensNoChao.length, pocoes: c.mochila.itens.find((i) => i.id === 'pocaoDeVida')?.quantidade ?? 0 })`)
    conferir('arrastar a pilha para fora da janela joga no chão', noChaoDepois.chao === noChaoAntes + 1 && noChaoDepois.pocoes === 0, { noChaoAntes, noChaoDepois })
  }
  await aba.print(`${prefixo}-08-mochila`)
  await aba.tocarNoBotao('Fechar a mochila')
  await pausa(300)
  conferir('"Fechar a mochila" fecha a janela', !(await aba.avaliar(`!!document.querySelector('.janela-mochila')`)))

  // Desempenho (só no npm run dev, no primeiro aparelho): o FPS do celular emulado e, com o processador bem mais lento
  // (como um celular simples), o Modo leve automático
  if (!PUBLICADO && primeiro) {
    console.log('7b. Desempenho e o Modo leve automático')
    const medirFps = async (ms) => {
      const amostras = []
      for (let t = 0; t < ms; t += 500) {
        amostras.push(await cena(`Math.round(c.game.loop.actualFps)`))
        await pausa(500)
      }
      return Math.round(amostras.reduce((soma, fps) => soma + fps, 0) / amostras.length)
    }
    const normal = await medirFps(3000)
    await aba.cdp.enviar('Emulation.setCPUThrottlingRate', { rate: 8 })
    // o aviso do Modo leve fica só alguns segundos na tela: olha de pouco em pouco
    let avisou = false
    for (let t = 0; t < 12000 && !avisou; t += 400) {
      avisou = await aba.avaliar(`document.body.innerText.includes('Modo leve ligado')`)
      await pausa(400)
    }
    const lento = await medirFps(2000)
    const leve = await cena(`c.ponte.modoLeve`)
    const depoisDoLeve = await medirFps(2000)
    await aba.cdp.enviar('Emulation.setCPUThrottlingRate', { rate: 1 })
    const deVolta = await medirFps(3000)
    const medidas = { normal, lento, depoisDoLeve, deVolta, leve, avisou }
    console.log(`  FPS no celular emulado: ${JSON.stringify(medidas)}`)
    conferir('o FPS no celular emulado fica perto de 60 com o processador normal', normal >= 50, medidas)
    if (lento < 40) conferir('com o processador 8× mais lento (FPS abaixo de 40), o Modo leve liga sozinho e avisa', leve && avisou, medidas)
    else conferir('com o processador 8× mais lento o FPS continuou acima de 40 (o Modo leve não precisou ligar)', !leve, medidas)
  }

  console.log('8. O mapa, a pausa, o mudo e o Q')
  await tocarNoBotaoDoToque('Mapa')
  await pausa(300)
  conferir('o botão Mapa mostra o mapa inteiro sem pausar', await aba.avaliar(`!!document.querySelector('.mapa-inteiro-do-toque') && !document.querySelector('.janela')`))
  await telaInteira('Mapa da partida (botão Mapa)')
  await aba.tocarNoBotao('Fechar o mapa')
  await pausa(200)
  await tocarNoBotaoDoToque('Pausa')
  await pausa(300)
  const pausada = await aba.avaliar(`[...document.querySelectorAll('.janela h2')].some((h) => h.textContent.includes('Pausa'))`)
  conferir('o botão Pausa pausa (fora de combate)', pausada)
  if (pausada) {
    if (!PUBLICADO) conferir('com a pausa, a partida para', await cena(`c.ponte.pausado`))
    await telaInteira('Pausa')
    await aba.print(`${prefixo}-09-pausa`)
    await aba.tocarNoBotao('Continuar')
    await pausa(300)
  }
  await tocarNoBotaoDoToque('Mais')
  await pausa(200)
  const mudoAntes = await aba.avaliar(`document.querySelector('.toque-mais')?.textContent ?? ''`)
  await aba.tocarNoBotao(mudoAntes.includes('Ligar o som') ? 'Ligar o som' : 'Mudo')
  await pausa(200)
  const mudoDepois = await aba.avaliar(`document.querySelector('.toque-mais')?.textContent ?? ''`)
  conferir('"Mudo (M)" no "Mais" liga e desliga o mudo', mudoAntes.includes('Mudo (M)') !== mudoDepois.includes('Mudo (M)'), { mudoAntes, mudoDepois })
  await telaInteira('Partida com o "Mais" aberto')
  await aba.tocarNoBotao('Voltar ao Reino (Q)')
  await pausa(400)
  conferir('"Voltar ao Reino (Q)" começa a volta', await aba.avaliar(`document.body.innerText.includes('Voltando ao Reino em')`))
  await tocarNoBotaoDoToque('Mais')
  await pausa(200)
  await aba.tocarNoBotao('Cancelar a volta (Q)')
  await pausa(400)
  conferir('"Cancelar a volta (Q)" cancela, como o Q de novo', !(await aba.avaliar(`document.body.innerText.includes('Voltando ao Reino em')`)))
  await tocarNoBotaoDoToque('Mais')
  await pausa(200)
  await aba.tocarNoBotao('Voltar ao Reino (Q)')
  await aba.esperarTela('Resumo', 25000)
  await pausa(600)
  conferir('com o Q, a partida termina no Resumo', (await tituloDaTela()) === 'Resumo')
  await telaInteira('Resumo')
  await aba.print(`${prefixo}-10-resumo`)
  conferir('nenhum erro no console', (await erros()).length === 0, await erros())
}

// As telas de novo, em outro tamanho de celular (o convidado já existe: começa no Reino)
async function conferirTamanho(tamanho) {
  console.log(`\n=== As telas em ${tamanho.nome} ===`)
  aba = await abaNoCelular({ largura: tamanho.largura, altura: tamanho.altura, densidade: 2 })
  await aba.abrir(SITE)
  await pausa(500)
  await telaInteira(`${tamanho.nome}: Tela inicial`)
  await aba.tocarNoBotao('Iniciar jogo')
  await aba.esperarTela('Login')
  await telaInteira(`${tamanho.nome}: Login`)
  await aba.tocarNoBotao('Jogar como convidado')
  await aba.esperar(`document.querySelector('.tela-reino')`, 'o Reino')
  await pausa(600)
  await telaInteira(`${tamanho.nome}: Reino`)
  for (const [id, nome, loja] of [
    ['mercado', 'Mercado', true],
    ['forja', 'Forja', true],
    ['guilda', 'Guilda', true],
    ['mochila', 'Mochila', false],
    ['arvores', 'Árvores de Habilidades', false],
    ['salaoGloria', 'Salão da Glória', false],
  ]) {
    await tocarNoLugarDoReino(id)
    await aba.esperarTela(nome)
    if (loja) await abrirLojaPeloNpc()
    // cada aba da tela
    const abas = await aba.avaliar(`[...document.querySelectorAll('[role=tab]')].map((t) => t.textContent.trim())`)
    if (!abas.length) await telaInteira(`${tamanho.nome}: ${nome}`)
    for (const nomeDaAba of abas) {
      await aba.avaliar(`([...document.querySelectorAll('[role=tab]')].find((t) => t.textContent.trim() === ${JSON.stringify(nomeDaAba)})?.click(), true)`)
      await telaInteira(`${tamanho.nome}: ${nome} › ${nomeDaAba}`)
    }
    await aba.tocarNoBotao(id === 'salaoGloria' ? 'Voltar' : 'Voltar ao Reino')
    await aba.esperar(`document.querySelector('.tela-reino')`, 'o Reino de novo')
    await pausa(300)
  }
  await tocarNoLugarDoReino('jogar')
  await aba.esperarTela('Mapa')
  await pausa(500)
  await telaInteira(`${tamanho.nome}: Mapa`)
  for (const lugar of ['fazenda', 'lago']) {
    await tocarNoLugarDoMapa(lugar)
    await pausa(500)
    await telaInteira(`${tamanho.nome}: minijogo ${lugar}`)
    await aba.tocarNoBotao('Voltar ao Mapa')
    await aba.esperarTela('Mapa')
    await pausa(400)
  }
  await tocarNoLugarDoMapa('floresta')
  await aba.esperarTela('Caravana')
  await telaInteira(`${tamanho.nome}: Caravana`)
  await aba.tocarNoBotao('Começar no início')
  await aba.esperarTela('Preparação')
  await telaInteira(`${tamanho.nome}: Preparação`)
  await aba.tocarNoBotao('Começar partida')
  await aba.esperar(`!!document.querySelector('.controles-de-toque') && !document.querySelector('.carregando-a-partida')`, 'a partida', 25000)
  await pausa(1200)
  await telaInteira(`${tamanho.nome}: Partida`)
  await aba.print(`tamanho-${tamanho.largura}-partida`)
  await tocarNoBotaoDoToque('Mochila')
  await pausa(300)
  await telaInteira(`${tamanho.nome}: Mochila da partida`)
  await aba.tocarNoBotao('Fechar a mochila')
  await tocarNoBotaoDoToque('Pausa')
  await pausa(300)
  await telaInteira(`${tamanho.nome}: Pausa`)
  await aba.tocarNoBotao('Continuar')
  await pausa(200)
  await tocarNoBotaoDoToque('Mais')
  await pausa(200)
  await aba.tocarNoBotao('Voltar ao Reino (Q)')
  await aba.esperarTela('Resumo', 25000)
  await pausa(500)
  await telaInteira(`${tamanho.nome}: Resumo`)
}

try {
  console.log(`Site: ${SITE}`)
  for (const [indice, aparelho] of aparelhos.entries()) {
    await jogarNoAparelho(aparelho, indice === 0)
    if (indice < aparelhos.length - 1) {
      await navegador.fechar()
      navegador = null
    }
  }
  for (const tamanho of tamanhosDeConferir) await conferirTamanho(tamanho)
} catch (erro) {
  console.log(`\n  ERRO ${erro.message}`)
  estado.falhas++
  if (aba) await aba.print('erro').catch(() => {})
} finally {
  parar()
  console.log(`\n${estado.total} conferências, ${estado.falhas} falha(s). Prints em ${PASTA}`)
  await desligar(estado.falhas ? 1 : 0)
}
