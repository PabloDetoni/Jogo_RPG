// Roteiro do Reino e do Mapa em camadas (pedido do Pablo em 20/10/2026; com as peças dele desde 21/10).
// Uso: npm run testar:camadas
// O clique pelo formato da peça: clicar no meio de cada prédio e de cada bioma abre o lugar certo; clicar entre dois
// objetos (ou no canto vazio do retângulo de uma peça) não abre nada; em 1366×768, em 1920×1080 e em tela cheia.
// Também: o contorno dourado e a placa acesa com o mouse em cima (sem a peça sair do lugar), o teclado, as animações
// (mexem, param com a opção desligada e com o "reduzir movimento" do sistema, e custam pouco) e os prints das
// animações para o relatório (testes-do-navegador/camadas/).
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'camadas')
const vite = await ligarVite(5201)
let navegador = null

async function desligar(codigo) {
  await navegador?.fechar()
  await vite.fechar()
  process.exit(codigo)
}
const { estado, conferir, parar } = criarConferencias(() => desligar(1))

// Pontos no meio do desenho de cada lugar (fora das placas), em pixels do fundo do Reino (1672 × 941) e do oceano do
// Mapa (1920 × 1080), conferidos com as peças do Pablo
const tamanhoDoReino = { largura: 1672, altura: 941 }
const tamanhoDoMapa = { largura: 1920, altura: 1080 }
const noReino = {
  guilda: { ponto: [760, 440], tela: 'Guilda' },
  mercado: { ponto: [641, 599], tela: 'Mercado' },
  forja: { ponto: [1120, 610], tela: 'Forja' },
  mochila: { ponto: [130, 670], tela: 'Mochila' },
  arvores: { ponto: [1540, 600], tela: 'Árvores de Habilidades' },
}
// Chão entre os objetos, o canto vazio do retângulo de uma peça e os enfeites: não abre nada
const vaziosDoReino = {
  'a praça da fonte (entre o Mercado e a Forja)': [830, 545],
  'as casas entre a Guilda e a Forja': [1010, 640],
  'o canto vazio do retângulo da Guilda': [700, 335],
  'o castelo (só enfeite)': [990, 200],
  'uma torre da muralha da frente (enfeite)': [476, 720],
  'a frente da Árvore (as pedras, enfeite)': [1620, 900],
}
const noMapa = {
  floresta: { ponto: [432, 733], tela: 'Preparação' },
  reino: { ponto: [972, 487], tela: 'Reino' },
  fazenda: { ponto: [801, 503], tela: 'Minijogo da Fazenda' },
  mina: { ponto: [1108, 495], tela: 'Minijogo da Mina' },
  lago: { ponto: [969, 410], tela: 'Minijogo do Lago' },
}
const bloqueadosDoMapa = { tundra: [327, 262], vulcanico: [1375, 327], deserto: [1441, 786] }
const vaziosDoMapa = { 'o oceano': [1886, 733], 'as montanhas do Planalto (entre a Floresta e o castelo)': [733, 550], 'o oceano entre a Floresta e o Deserto': [976, 1035] }

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
const fecharDica = async () => {
  await aba.avaliar(`([...document.querySelectorAll('.dica-da-tela button')].find((b) => b.textContent.trim() === 'Entendi')?.click(), true)`)
  await pausa(120)
}
const emTelaCheia = () => aba.avaliar(`!!document.fullscreenElement`)
const sairDaTelaCheia = () => aba.avaliar(`(document.fullscreenElement && document.exitFullscreen(), true)`)
// Um ponto da cena na tela (a cena tem a proporção do fundo)
const naTela = (x, y) =>
  aba.avaliar(`(() => {
    const cena = document.querySelector('.cena-em-camadas').getBoundingClientRect()
    const { largura, altura } = document.querySelector('.tela-reino') ? ${JSON.stringify(tamanhoDoReino)} : ${JSON.stringify(tamanhoDoMapa)}
    return { x: cena.left + (cena.width * ${x}) / largura, y: cena.top + (cena.height * ${y}) / altura }
  })()`)
const clicarNaImagem = async ([x, y]) => {
  const p = await naTela(x, y)
  await aba.clicarNaTela(p.x, p.y)
  await pausa(450)
}
const passarNaImagem = async ([x, y]) => {
  const p = await naTela(x, y)
  await aba.moverMouse(p.x, p.y)
  await pausa(250)
}
// As máscaras de todas as peças e a cena pronta (as peças aparecem juntas quando todas chegaram)
const esperarMascaras = (quantas) =>
  aba.esperar(`Number(document.querySelector('.cena-em-camadas')?.dataset.mascaras) >= ${quantas} && !!document.querySelector('.cena-pronta')`, `as máscaras das ${quantas} peças`, 20000)
const irAoReino = async () => {
  if ((await aba.titulo()) !== 'Reino') {
    if (await clicar('Voltar ao Reino')) await pausa(250)
    else if (await clicar('Voltar')) await pausa(250)
  }
  await aba.esperarTela('Reino')
  await fecharDica()
  await esperarMascaras(12)
}
const irAoMapa = async () => {
  await aba.clicarNoElemento('.lugar-desenhado-jogar .lugar-placa')
  await pausa(600)
  await aba.esperarTela('Mapa')
  await fecharDica()
  await esperarMascaras(10)
}
const canvasDeTras = `document.querySelector('.camada-animada')`

try {
  navegador = await abrirNavegador('camadas', PASTA)
  aba = await navegador.novaAba('aba1')
  console.log(`Site: ${vite.site}`)
  await aba.abrir(vite.site)
  await passo('Iniciar jogo')
  await passo('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await passo('Continuar')
  await passo('Arqueiro')
  await passo('Escolher Arqueiro')
  await irAoReino()
  await aba.avaliar(`(document.querySelector('[aria-label="Minimizar o painel"]')?.click(), true)`)
  await pausa(200)

  const camadas = await aba.avaliar(`({
    fundo: getComputedStyle(document.querySelector('.tela')).backgroundImage,
    pecas: [...document.querySelectorAll('.tela-reino .peca-da-cena')].map((p) => [...p.classList].find((c) => c.startsWith('peca-') && !['peca-da-cena', 'peca-acesa', 'peca-bloqueada'].includes(c)).slice(5)),
    placas: [...document.querySelectorAll('.placa-do-reino')].map((b) => b.textContent.trim()),
    canvas: document.querySelectorAll('.tela-reino .camada-animada').length,
  })`)
  const pecasDoReino = ['mochila', 'frenteDaArvore', 'arvores', 'estandarte', 'moinhoPas', 'moinhoCorpo', 'muralhasFrente', 'forja', 'mercado', 'guilda', 'muralhasTras', 'castelo']
  conferir(
    'o Reino em camadas: o fundo do Pablo, as 12 peças dele na ordem (de cima para baixo), as 8 placas em código e os 2 canvas das animações (com as nuvens)',
    camadas.fundo.includes('reino-fundo') && [...camadas.pecas].reverse().join() === pecasDoReino.join() && camadas.placas.length === 8 && camadas.canvas === 2,
    camadas,
  )

  for (const modo of ['1366×768', '1920×1080', 'tela cheia']) {
    console.log(`1. ${modo}: o Reino clica pelo desenho de cada peça`)
    if (modo === '1920×1080') await aba.cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false })
    if (modo === 'tela cheia') {
      await aba.cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })
      // a tela cheia entra no clique do JOGAR (o clique de verdade); o castelo do Mapa traz de volta ao Reino nela
      await irAoMapa()
      await clicarNaImagem(noMapa.reino.ponto)
      await irAoReino()
      conferir('tela cheia: o JOGAR entrou nela e o castelo do Mapa voltou ao Reino ainda nela', await emTelaCheia())
    }
    await pausa(400)
    const abriu = []
    for (const [id, { ponto, tela }] of Object.entries(noReino)) {
      await clicarNaImagem(ponto)
      const chegou = await aba.titulo()
      abriu.push({ id, chegou, certo: chegou === tela })
      await fecharDica()
      await irAoReino()
    }
    conferir(`${modo}: clicar no meio do desenho de cada prédio (fora da placa) abre o lugar certo`, abriu.every((a) => a.certo), abriu)
    const ficou = []
    for (const [onde, ponto] of Object.entries(vaziosDoReino)) {
      await clicarNaImagem(ponto)
      ficou.push({ onde, tela: await aba.titulo(), janela: await aba.avaliar(`document.querySelectorAll('[role=dialog]').length`) })
    }
    conferir(`${modo}: clicar entre os objetos, no canto vazio do retângulo da Guilda, no castelo, na muralha ou na frente da Árvore não abre nada`, ficou.every((f) => f.tela === 'Reino' && f.janela === 0), ficou)

    // Mouse em cima: o contorno dourado em volta do desenho, a placa acesa, a legenda e o cursor; nada sai do lugar
    const antes = await aba.avaliar(`(() => { const r = document.querySelector('.peca-forja').getBoundingClientRect(); return [r.x, r.y, r.width, r.height] })()`)
    await passarNaImagem(noReino.forja.ponto)
    const aceso = await aba.avaliar(`(() => {
      const peca = document.querySelector('.peca-forja')
      const r = peca.getBoundingClientRect()
      return {
        acesa: peca.classList.contains('peca-acesa'),
        contorno: getComputedStyle(peca).filter.includes('drop-shadow'),
        placa: !!document.querySelector('.lugar-desenhado-forja.lugar-aceso'),
        legenda: getComputedStyle(document.querySelector('.lugar-desenhado-forja .legenda-do-lugar')).opacity,
        cursor: document.querySelector('.cena-em-camadas').style.cursor,
        lugar: [r.x, r.y, r.width, r.height],
      }
    })()`)
    await pausa(200)
    conferir(
      `${modo}: o mouse na Forja acende o contorno dourado em volta do desenho, a placa e a legenda, com o cursor de clique; a peça não sai do lugar`,
      aceso.acesa && aceso.contorno && aceso.placa && aceso.legenda === '1' && aceso.cursor === 'pointer' && aceso.lugar.every((v, i) => v === antes[i]),
      aceso,
    )
    if (modo === '1366×768') await aba.print('reino-mouse-na-forja')
    await passarNaImagem(vaziosDoReino['a praça da fonte (entre o Mercado e a Forja)'])
    const apagado = await aba.avaliar(`({ acesas: document.querySelectorAll('.peca-acesa').length, cursor: document.querySelector('.cena-em-camadas').style.cursor })`)
    conferir(`${modo}: no chão entre os objetos, nada acende e o cursor é o normal`, apagado.acesas === 0 && apagado.cursor === '', apagado)

    console.log(`2. ${modo}: o Mapa clica pelo desenho de cada bioma e lugar do Planalto`)
    await irAoMapa()
    if (modo !== 'tela cheia') await sairDaTelaCheia()
    await pausa(300)
    const noMapaAbriu = []
    for (const [id, { ponto, tela }] of Object.entries(noMapa)) {
      await clicarNaImagem(ponto)
      const chegou = await aba.titulo()
      noMapaAbriu.push({ id, chegou, certo: chegou === tela })
      await fecharDica()
      if (chegou === 'Reino') await irAoMapa()
      else if (chegou !== 'Mapa') {
        await passo('Voltar ao Mapa')
        await aba.esperarTela('Mapa')
        await esperarMascaras(10)
      }
      if (modo !== 'tela cheia') await sairDaTelaCheia()
    }
    conferir(`${modo}: clicar no meio da Floresta, do castelo, da Fazenda, da Mina e do Lago abre o lugar certo`, noMapaAbriu.every((a) => a.certo), noMapaAbriu)
    const bloqueados = []
    for (const [id, ponto] of Object.entries(bloqueadosDoMapa)) {
      await passarNaImagem(ponto)
      // a placa aparece com uma transição curta: espera ela terminar (no máximo 1 s)
      await aba.esperar(`getComputedStyle(document.querySelector('.regiao-em-foco .placa-do-lugar')).opacity === '1'`, 'a placa do lugar aparecer', 1000).catch(() => {})
      const placa = await aba.avaliar(`(() => {
        const lugar = document.querySelector('.regiao-em-foco')
        return { nome: lugar?.querySelector('.so-leitor')?.textContent, cadeado: !!lugar?.querySelector('.cadeado'), emBreve: lugar?.textContent.includes('Em breve'), placa: lugar && getComputedStyle(lugar.querySelector('.placa-do-lugar')).opacity, cursor: document.querySelector('.cena-em-camadas').style.cursor }
      })()`)
      await clicarNaImagem(ponto)
      bloqueados.push({ id, ...placa, tela: await aba.titulo() })
    }
    conferir(
      `${modo}: Tundra, Vulcânico e Deserto mostram o cadeado e "Em breve" com o mouse em cima e não abrem`,
      bloqueados.every((b) => b.cadeado && b.emBreve && b.placa === '1' && b.cursor === 'not-allowed' && b.tela === 'Mapa'),
      bloqueados,
    )
    const noMapaFicou = []
    for (const [onde, ponto] of Object.entries(vaziosDoMapa)) {
      await clicarNaImagem(ponto)
      noMapaFicou.push({ onde, tela: await aba.titulo() })
    }
    conferir(`${modo}: clicar no oceano, nas montanhas do Planalto ou entre dois biomas não abre nada`, noMapaFicou.every((f) => f.tela === 'Mapa'), noMapaFicou)
    await passarNaImagem(noMapa.mina.ponto)
    const mina = await aba.avaliar(`({ acesa: document.querySelector('.peca-mina')?.classList.contains('peca-acesa'), rodadas: document.querySelector('.regiao-em-foco .rodadas-do-dia')?.textContent ?? '' })`)
    conferir(`${modo}: o mouse na Mina acende o contorno e mostra as rodadas de hoje`, mina.acesa && /Rodadas hoje/i.test(mina.rodadas), mina)
    if (modo === '1366×768') {
      await passarNaImagem(noMapa.floresta.ponto)
      await aba.print('mapa-mouse-na-floresta')
      await passarNaImagem(bloqueadosDoMapa.tundra)
      await aba.print('mapa-mouse-na-tundra')
    }
    await clicarNaImagem(noMapa.reino.ponto)
    await irAoReino()
    if (modo === 'tela cheia') await sairDaTelaCheia()
  }
  await aba.cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })
  await pausa(400)

  console.log('3. Teclado e leitor de tela')
  await aba.avaliar(`(document.querySelector('.lugar-desenhado-mercado .lugar-placa').focus(), true)`)
  await pausa(200)
  const comFoco = await aba.avaliar(`({ peca: document.querySelector('.peca-mercado').classList.contains('peca-acesa'), nome: document.activeElement.textContent.trim() })`)
  await aba.apertar('enter')
  await pausa(300)
  const peloTeclado = await aba.titulo()
  await irAoReino()
  conferir('com o foco do teclado na placa do Mercado, a peça acende; Enter abre o Mercado', comFoco.peca && comFoco.nome === 'Mercado' && peloTeclado === 'Mercado', { comFoco, peloTeclado })

  console.log('4. As animações do cenário: mexem, custam pouco e param quando pedem')
  // zera a contagem (o objeto é o mesmo que as camadas guardaram; as duas camadas do Reino contam juntas)
  await aba.avaliar(`(window.__cenario.quadros = 0, window.__cenario.ms = 0, true)`)
  const quadro = () => aba.avaliar(`${canvasDeTras}.toDataURL('image/png').length + ':' + ${canvasDeTras}.toDataURL('image/png').slice(-200)`)
  const q1 = await quadro()
  await pausa(2500)
  const q2 = await quadro()
  const pas = await aba.avaliar(`getComputedStyle(document.querySelector('.peca-moinhoPas')).animationName`)
  conferir('ligadas: as pás do moinho (a peça 08) giram', pas === 'girar-as-pas', { pas })
  const custo = await aba.avaliar(`({ quadros: window.__cenario.quadros, msPorQuadro: Math.round((window.__cenario.ms / Math.max(1, window.__cenario.quadros)) * 100) / 100 })`)
  conferir('ligadas: o cenário do Reino mexe (dois quadros diferentes em 2,5 s)', q1 !== q2 && (await aba.avaliar(`${canvasDeTras}.dataset.ligada`)) === 'sim')
  conferir('não pesa: no máximo uns 30 quadros por segundo em cada uma das 2 camadas e menos de 4 ms por quadro', custo.quadros > 30 && custo.quadros <= 2 * 2.5 * 32 && custo.msPorQuadro < 4, custo)
  // Um print do Reino animado (a sequência para o relatório sai do scripts/gravarAnimacoes.mjs: muitos prints seguidos
  // às vezes travam a conversa com o navegador escondido)
  await aba.print('reino-animado')
  await passo('Configurações')
  await passo('Animações do cenário', true)
  const botao = await aba.avaliar(`[...document.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.startsWith('Animações do cenário'))?.textContent`)
  await aba.apertar('esc')
  await pausa(500)
  const p1 = await quadro()
  await pausa(1500)
  const p2 = await quadro()
  const desligada = await aba.avaliar(`({ canvas: ${canvasDeTras}.dataset.ligada, pas: getComputedStyle(document.querySelector('.peca-moinhoPas')).animationName })`)
  conferir('Configurações › "Animações do cenário: desligadas": o cenário fica parado (o canvas não muda e as pás do moinho não giram)', botao === 'Animações do cenário: desligadas' && p1 === p2 && desligada.canvas === 'nao' && desligada.pas === 'none', { botao, desligada })
  await passo('Configurações')
  await passo('Animações do cenário', true)
  await aba.apertar('esc')
  await pausa(300)
  await aba.cdp.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await pausa(600)
  const r1 = await quadro()
  await pausa(1500)
  const r2 = await quadro()
  await passo('Configurações')
  const aviso = await aba.avaliar(`!!document.querySelector('.dica-das-configuracoes')`)
  await aba.apertar('esc')
  conferir('o "reduzir movimento" do sistema também para o cenário (com a opção ligada), e as Configurações explicam', r1 === r2 && (await aba.avaliar(`${canvasDeTras}.dataset.ligada`)) === 'nao' && aviso)
  await aba.cdp.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await pausa(400)

  console.log('5. As animações do Mapa')
  await irAoMapa()
  await sairDaTelaCheia()
  await pausa(400)
  const m1 = await aba.avaliar(`document.querySelector('.tela-mapa .camada-animada').toDataURL().slice(-300)`)
  await pausa(2000)
  const m2 = await aba.avaliar(`document.querySelector('.tela-mapa .camada-animada').toDataURL().slice(-300)`)
  const ondas = await aba.avaliar(`getComputedStyle(document.querySelector('.oceano-do-mapa')).animationName`)
  conferir('o Mapa mexe (a fumaça do vulcão, a lava, as cachoeiras, a neve e o vento no canvas; as ondas no oceano)', m1 !== m2 && ondas === 'ondas-do-oceano', { ondas })
  await aba.print('mapa-animado')
  const erros = await aba.avaliar(`window.__erros ?? []`)
  conferir('nenhum erro no console', erros.length === 0, erros)
} catch (erro) {
  conferir(`o roteiro chegou até o fim sem erro (${erro.message.split('\n')[0]})`, false)
}

parar()
console.log(`\n${estado.total - estado.falhas} de ${estado.total} conferências passaram. Prints em ${PASTA}`)
await desligar(estado.falhas === 0 ? 0 : 1)
