// Prints das telas do jogo (Fase 4.5: antes e depois da interface; Fase 5: protótipos atualizados, TASK-121 a 123).
// Uso: npm run prints -- [pasta] [escuro]
//   pasta: subpasta de testes-do-navegador/telas/ (padrão: "atual"); escuro: tira os prints no tema escuro.
// Liga o Vite e um Edge escondido (1366 × 768), joga como convidado com os itens de teste do painel DEV e passa por
// cada tela e aba: a Tela inicial e o acesso, o Reino, o Mapa, os minijogos, o Ponto de partida, a Preparação, a partida
// (HUD e mochila com Tab) e o Resumo. O painel DEV some nos prints.
// As abas que não existirem (numa versão mais antiga) são puladas.
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { abrirNavegador, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const [pastaPedida = 'atual', tema = 'claro'] = process.argv.slice(2)
const PASTA = resolve('testes-do-navegador', 'telas', pastaPedida)
rmSync(PASTA, { recursive: true, force: true })
const vite = await ligarVite(5197)
let navegador = null
let aba = null
let numero = 0
const tirados = []

const clicar = (texto, comeco = false, seletor = 'button') =>
  aba.avaliar(`(() => {
    const botoes = [...document.querySelectorAll(${JSON.stringify(seletor)})].filter((b) => !b.disabled)
    const alvo = botoes.find((b) => ${comeco ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : `b.textContent.trim() === ${JSON.stringify(texto)}`})
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
const passo = async (texto, comeco = false) => {
  if (!(await clicar(texto, comeco))) throw new Error(`não achei o botão "${texto}"`)
  await pausa(250)
}
// Uma aba pelo nome (pula se não existir)
const abaChamada = async (nome) => {
  const achou = await clicar(nome, false, '[role=tab]')
  await pausa(250)
  return achou
}
// Pula para uma tela pelo painel DEV (a lista "Pular para")
const irPara = async (tela) => {
  await aba.avaliar(`(() => {
    const select = document.querySelector('.painel-dev select')
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, ${JSON.stringify(tela)})
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  })()`)
  await pausa(350)
}
async function print(nome, { manterDica = false } = {}) {
  numero += 1
  const arquivo = `${String(numero).padStart(2, '0')}-${nome}`
  // Sem o painel DEV, sem os avisos (conquistas) e sem a dica da primeira visita (ajustes de 14/10; a não ser no print
  // que mostra a dica), para o print mostrar só a tela
  if (!manterDica) await aba.avaliar(`(() => { [...document.querySelectorAll('.dica-da-tela button')].find((b) => b.textContent.trim() === 'Entendi')?.click(); return true })()`)
  await aba.avaliar(`(() => { document.querySelectorAll('.avisos .aviso button').forEach((b) => b.click()); const p = document.querySelector('.painel-dev, .painel-dev-mini'); if (p) p.style.visibility = 'hidden'; return true })()`)
  await pausa(120)
  await aba.print(arquivo)
  await aba.avaliar(`(() => { const p = document.querySelector('.painel-dev, .painel-dev-mini'); if (p) p.style.visibility = ''; return true })()`)
  tirados.push(arquivo)
}
// Todas as abas de uma tela, uma por print
async function abasDaTela(prefixo, nomes) {
  for (const nome of nomes) if (await abaChamada(nome)) await print(`${prefixo}-${nome.toLowerCase().replace(/[^a-z0-9à-ú]+/g, '-')}`)
}

try {
  navegador = await abrirNavegador('prints', PASTA)
  aba = await navegador.novaAba('aba1')
  await aba.abrir(vite.site)
  if (tema === 'escuro') {
    await passo('Configurações')
    await passo('Tema', true)
    await aba.apertar('esc')
  }
  await print('tela-inicial')
  if (await clicar('Como jogar')) {
    await pausa(250)
    await print('como-jogar')
    await aba.apertar('esc')
  }
  await passo('Iniciar jogo')
  await print('login')
  await passo('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await print('narrativa')
  await passo('Continuar')
  await passo('Arqueiro')
  await print('selecao-de-classe')
  await passo('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  // O Catálogo de quem acabou de começar: quase tudo ainda apagado (silhueta)
  await irPara('mercado')
  if (await abaChamada('Catálogo')) await print('catalogo-no-comeco')
  await irPara('reino')
  await passo('Itens de teste', true)
  await passo('Itens de teste', true)
  await pausa(300)
  await print('reino')

  await irPara('mochila')
  await print('mochila')

  await irPara('mercado')
  await abasDaTela('mercado', ['Comprar', 'Vender', 'Trocar', 'Catálogo'])
  // O "?" (Fase 4.5): a explicação da tela
  if (await clicar('?')) {
    await pausa(250)
    await print('mercado-ajuda')
    await aba.apertar('esc')
  }

  await irPara('forja')
  await print('forja-dica-da-primeira-visita', { manterDica: true })
  // Na aba Equipar, uma peça escolhida (para o print mostrar o antes e depois)
  await abaChamada('Equipar')
  // A grade com o item na mão: o clique pega e o segundo põe de volta (o detalhe fica no item)
  for (let vez = 0; vez < 2; vez++) {
    await aba.avaliar(`(() => { document.querySelector('.balcao-grade .celula-da-grade:first-child')?.click(); return true })()`)
    await pausa(150)
  }
  await pausa(250)
  await abasDaTela('forja', ['Equipar', 'Comprar', 'Vender', 'Fabricar', 'Catálogo'])

  await irPara('guilda')
  await abasDaTela('guilda', ['Missões', 'Contrato temporário', 'Contrato permanente', 'Contratos'])
  // Um temporário ativo e uma missão aceita, para os prints com conteúdo
  if (await abaChamada('Contrato temporário')) {
    await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.lista-de-contratos li, .carta-de-contrato')].find((l) => l.textContent.includes('Guerreiro')); const b = li?.querySelector('button'); b?.click(); return !!b })()`)
    await pausa(300)
    await clicar('Assinar', true)
    await pausa(300)
    await print('guilda-temporario-ativo')
  }
  await abaChamada('Missões')
  await clicar('Caçar lobos', true)
  await pausa(200)
  await clicar('Aceitar', true)
  await pausa(300)
  await print('guilda-missao-ativa')

  await irPara('arvores')
  await print('arvores')

  await irPara('salaoGloria')
  await pausa(1500) // o ranking vem do banco
  await print('salao-ranking')
  if (await abaChamada('Conquistas')) await print('salao-conquistas')

  await irPara('reino')
  await passo('Jogar')
  await aba.esperarTela('Mapa')
  await print('mapa')
  for (const lugar of ['Fazenda', 'Mina', 'Lago']) {
    if (await clicar(lugar, true)) {
      await pausa(400)
      await print(`minijogo-${lugar.toLowerCase()}`)
      await irPara('mapa')
    }
  }
  await irPara('pontoPartida')
  await print('ponto-de-partida')
  await irPara('mapa')
  await passo('Floresta')
  await aba.esperarTela('Preparação')
  // Duas poções na mochila da partida (a grade da direita e a da partida, com Tab)
  for (let i = 0; i < 2; i++) {
    await aba.avaliar(`(() => { [...document.querySelectorAll('.mochila-da-preparacao button.slot')].find((b) => (b.getAttribute('aria-label') ?? '').startsWith('Poção de vida'))?.click(); return true })()`)
    await pausa(200)
  }
  await print('preparacao')
  await passo('Começar partida')
  await aba.esperar(`!!window.__jogoDaPartida?.scene?.getScene('arena')?.lider`, 'a partida', 20000)
  await pausa(1200)
  await aba.apertar('tab')
  await pausa(400)
  await print('mochila-da-partida')
  await aba.apertar('tab')
  await pausa(300)
  await print('partida')
  // O Resumo: a barra de teste termina a partida com Vitória
  if (await clicar('Vitória')) {
    await aba.esperarTela('Resumo', 15000).catch(() => {})
    await pausa(600)
    await print('resumo')
  }
  console.log(`${tirados.length} prints em ${PASTA}`)
} catch (erro) {
  console.log(`ERRO ${erro.message} (depois de ${tirados.length} prints)`)
  if (aba) await aba.print('erro')
  process.exitCode = 1
} finally {
  await navegador?.fechar()
  await vite.fechar()
  process.exit(process.exitCode ?? 0)
}
