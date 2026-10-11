// Roteiro da arte no navegador (TASK-110 a TASK-116). Uso: npm run testar:arte
// Cria imagens de teste (quadrados e círculos coloridos, com os nomes da Lista de Arte e Som) na pasta
// src/assets/arte-de-teste/ (fora do git), liga o Vite e um Edge escondido e confere que cada parte do jogo troca o
// quadrado ou o cinza pela imagem: fundos, retratos, ícones, bonecos animados (direção, espelho, ataque, desmaiado),
// chão, árvores com a copa transparente, pedras, itens no chão, marcas do Boss e a cutscene. Também confere que quem não
// tem imagem continua como antes. No fim (mesmo com erro), apaga a pasta de teste. Prints em testes-do-navegador/arte/.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classes, corDaClasse } from '../src/dados/classes.js'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'
import { criarPng } from './imagens.mjs'

const PASTA = resolve('testes-do-navegador', 'arte')
const ARTE = fileURLToPath(new URL('../src/assets/arte-de-teste/', import.meta.url))

// ---------- As imagens de teste ----------

const rgb = (cor) => [(cor >> 16) & 255, (cor >> 8) & 255, cor & 255]
const transparente = [0, 0, 0, 0]

// Uma faixa de quadros quadrados: um círculo da cor, com contorno e um pontinho branco que anda a cada quadro
function faixa(quadros, lado, cor) {
  const [r, g, b] = rgb(cor)
  return criarPng(quadros * lado, lado, (x, y) => {
    const quadro = Math.floor(x / lado)
    const px = x % lado
    const meio = lado / 2
    const distancia = Math.hypot(px - meio + 0.5, y - meio + 0.5)
    const marca = Math.abs(px - (lado * (quadro + 1)) / (quadros + 1)) < lado * 0.08 && Math.abs(y - lado * 0.3) < lado * 0.08
    if (marca) return [255, 255, 255, 255]
    if (distancia < lado * 0.38) return [r, g, b, 255]
    if (distancia < lado * 0.45) return [20, 24, 32, 255]
    return transparente
  })
}

// Quadrado cheio com uma borda (tiles, ícones, retratos, fundos)
function placa(largura, altura, cor, { borda = 2, xadrez = 0 } = {}) {
  const [r, g, b] = rgb(cor)
  return criarPng(largura, altura, (x, y) => {
    if (x < borda || y < borda || x >= largura - borda || y >= altura - borda) return [20, 24, 32, 255]
    const escuro = xadrez && (Math.floor(x / xadrez) + Math.floor(y / xadrez)) % 2 === 0
    return escuro ? [r * 0.85, g * 0.85, b * 0.85, 255].map(Math.round) : [r, g, b, 255]
  })
}

// Árvore em pé (64 × 96): copa redonda em cima e o tronco embaixo
function arvore() {
  return criarPng(64, 96, (x, y) => {
    if (Math.hypot(x - 32, y - 34) < 30) return [40, 120, 50, 255]
    if (x >= 26 && x < 38 && y >= 60 && y < 94) return [110, 75, 40, 255]
    return transparente
  })
}

function criarArteDeTeste() {
  rmSync(ARTE, { recursive: true, force: true })
  mkdirSync(join(ARTE, 'bonecos'), { recursive: true })
  const salvar = (nome, dados) => writeFileSync(join(ARTE, nome), dados)
  // As 5 classes: parado e andando para baixo e para a direita (a esquerda é a direita espelhada); ataque para baixo;
  // só o Arqueiro com a imagem de desmaiado (os outros deitam e escurecem)
  for (const classe of classes) {
    const cor = corDaClasse(classe.id)
    salvar(`bonecos/${classe.id}-parado-baixo.png`, faixa(2, 48, cor))
    salvar(`bonecos/${classe.id}-andando-baixo.png`, faixa(4, 48, cor))
    salvar(`bonecos/${classe.id}-andando-direita.png`, faixa(4, 48, cor))
    salvar(`bonecos/${classe.id}-atacando-baixo.png`, faixa(3, 48, 0xffffff))
  }
  salvar('bonecos/Arqueiro_Desmaiado.png', faixa(1, 48, 0x555555)) // nome com maiúsculas e sublinhado: vale igual
  // Lobo com animação; aranha com uma imagem só; javali e cervo sem imagem (continuam quadrados)
  salvar('bonecos/lobo-walk-south.png', faixa(4, 48, 0x8a8a8a)) // nome do PixelLab em inglês
  for (let i = 1; i <= 3; i++) salvar(`bonecos/lobo-atacando-baixo-${i}.png`, faixa(1, 48, 0xff8080)) // quadros soltos
  salvar('bonecos/aranha.png', faixa(1, 48, 0x402040))
  salvar('bonecos/guardiao-andando-baixo.png', faixa(4, 128, 0x6e3b1f))
  salvar('aviso-circulo.png', placa(64, 64, 0xff3b3b, { borda: 6 }))
  // Floresta
  salvar('grama-1.png', placa(32, 32, 0x7cc86a, { borda: 0, xadrez: 8 }))
  salvar('grama-2.png', placa(32, 32, 0x6ab858, { borda: 0, xadrez: 4 }))
  salvar('mata.png', placa(32, 32, 0x1d4425, { borda: 0, xadrez: 16 }))
  salvar('arvore.png', arvore())
  salvar('pedra-media.png', placa(64, 48, 0x9aa3ad, { borda: 3 }))
  // Ícones, retrato e fundos
  salvar('item-cogumelo.png', placa(32, 32, 0xd06030))
  salvar('item-pocaoDeVida.png', placa(32, 32, 0xff3050))
  salvar('item-ervaMedicinal.png', placa(32, 32, 0x40c040))
  salvar('ouro.png', placa(32, 32, 0xffd23f))
  salvar('atributo-forca.png', placa(32, 32, 0xc04040))
  salvar('habilidade-tiroPerfurante.png', placa(32, 32, 0x60a0ff))
  salvar('pedra-de-retorno.png', placa(32, 48, 0x5ab4ff))
  salvar('retrato-arqueiro.png', placa(128, 128, corDaClasse('arqueiro'), { borda: 4 }))
  salvar('fundo-acesso.png', placa(640, 360, 0x3a5a8a, { borda: 0, xadrez: 40 }))
  salvar('fundo-reino.png', placa(640, 360, 0x6a8a4a, { borda: 0, xadrez: 40 }))
  salvar('derrota-1.png', placa(640, 360, 0x401010, { borda: 0, xadrez: 40 }))
  salvar('derrota-2.png', placa(640, 360, 0x102040, { borda: 0, xadrez: 40 }))
  // Interface (Fase 4.5): moldura de 9 pedaços (36 × 36, cantos de 12), quadradinho, barra e o símbolo de comprar
  salvar('moldura-painel.png', placa(36, 36, 0x7a5c3a, { borda: 6 }))
  salvar('slot.png', placa(32, 32, 0x5c4a36, { borda: 3 }))
  salvar('barra-fundo.png', placa(32, 8, 0x303030, { borda: 1 }))
  salvar('barra-cheia.png', placa(8, 8, 0x40c057, { borda: 0 }))
  salvar('acao-comprar.png', placa(16, 16, 0xf2c230, { borda: 2 }))
}

// ---------- O roteiro ----------

criarArteDeTeste()
const vite = await ligarVite(5196)
let navegador = null

async function desligar(codigo) {
  await navegador?.fechar()
  await vite.fechar()
  rmSync(ARTE, { recursive: true, force: true })
  process.exit(codigo)
}
const { estado, conferir, parar } = criarConferencias(() => desligar(1))

const CENA = `window.__jogoDaPartida?.scene?.getScene('arena')`
let aba = null
const cena = (expr) => aba.avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)
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
const fundoDaTela = () => aba.avaliar(`(() => { const t = document.querySelector('.tela'); return t?.classList.contains('tela-com-fundo') ? t.style.backgroundImage : '' })()`)
const icones = (seletor) => aba.avaliar(`document.querySelectorAll(${JSON.stringify(seletor)} + ' img.icone').length`)
const animacaoDe = (expr) => cena(`(() => { const s = ${expr}.boneco?.sprite; return s ? { chave: s.anims.currentAnim?.key ?? null, quadro: s.anims.currentFrame?.index ?? null, espelhado: s.flipX, tocando: s.anims.isPlaying } : null })()`)

try {
  navegador = await abrirNavegador('arte', PASTA)
  aba = await navegador.novaAba('aba1')
  console.log(`Site: ${vite.site}`)
  await aba.abrir(vite.site)

  console.log('1. Telas: fundos, retrato e ícones')
  conferir('a Tela inicial sem imagem continua cinza', (await fundoDaTela()) === '')
  await passo('Iniciar jogo')
  conferir('a tela de acesso ganha o fundo (fundo-acesso)', (await fundoDaTela()).includes('url('), await fundoDaTela())
  await aba.print('01-acesso')
  await passo('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await passo('Continuar')
  await passo('Arqueiro')
  conferir('a Seleção mostra o retrato do Arqueiro', (await aba.avaliar(`!!document.querySelector('.detalhe-da-classe img.retrato-da-classe')`)))
  await passo('Mago')
  conferir('o Mago, sem retrato, continua só com o texto', !(await aba.avaliar(`!!document.querySelector('.detalhe-da-classe img.retrato-da-classe')`)))
  await passo('Arqueiro')
  await passo('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  conferir('o Reino ganha o fundo (fundo-reino)', (await fundoDaTela()).includes('url('))
  conferir('o HUD do Reino mostra o ícone do ouro', (await icones('.tela')) >= 1)
  await aba.print('02-reino')
  await passo('Itens de teste', true)
  await pausa(300)
  await passo('Mochila')
  const iconesNaGrade = await aba.avaliar(`document.querySelectorAll('.balcao-grade .slot img.slot-icone').length`)
  conferir('a Mochila mostra o ícone (em tamanho inteiro) nos quadradinhos dos itens que têm imagem', iconesNaGrade >= 3, iconesNaGrade)
  conferir(
    'o ícone do quadradinho tem 64 px (32 × 2) e fica nítido',
    await aba.avaliar(`(() => { const i = document.querySelector('.balcao-grade .slot img.slot-icone'); return i.getBoundingClientRect().width === 64 && getComputedStyle(i).imageRendering === 'pixelated' })()`),
  )
  await aba.avaliar(`(() => { [...document.querySelectorAll('button.slot')].find((b) => b.getAttribute('aria-label').startsWith('Poção de vida')).click(); return true })()`)
  await pausa(200)
  conferir('o detalhe do item mostra o ícone', (await aba.avaliar(`document.querySelectorAll('.detalhe-do-item .slot img.slot-icone').length`)) === 1)
  // A arte da interface: a moldura dos painéis e o fundo dos quadradinhos vêm das imagens de teste
  const interfaceComArte = await aba.avaliar(`(() => {
    const raiz = document.querySelector('.moldura')
    const painel = getComputedStyle(document.querySelector('.painel'))
    const slot = getComputedStyle(document.querySelector('.slot'))
    return { classes: raiz.className, moldura: painel.borderImageSource, slot: slot.backgroundImage }
  })()`)
  conferir(
    'interface: a moldura dos painéis e o fundo dos quadradinhos usam as imagens (moldura-painel, slot)',
    interfaceComArte.classes.includes('com-arte-moldura-painel') && interfaceComArte.moldura.includes('moldura-painel') && interfaceComArte.slot.includes('slot.png'),
    interfaceComArte,
  )
  await aba.print('03-mochila')
  await passo('Voltar ao Reino')
  await passo('Mercado')
  conferir('interface: o botão Comprar usa o símbolo da imagem (acao-comprar)', await aba.avaliar(`!!document.querySelector('.botao-de-acao img.simbolo-com-arte')`))
  await aba.print('03b-mercado')
  await passo('Voltar ao Reino')
  await passo('Árvores', true)
  conferir('Árvores: o ícone da Força ao lado do nome', (await icones('.atributos-da-arvore')) === 1)
  await passo('Habilidades')
  conferir('Árvores: o ícone do Tiro perfurante na árvore', (await icones('.no-da-arvore')) === 1)
  await passo('Voltar ao Reino')

  console.log('2. Preparação e partida na Floresta')
  await passo('Jogar')
  await passo('Floresta')
  await aba.esperarTela('Preparação')
  conferir(
    'Preparação: o retrato no botão do Líder e o ícone da poção no quadradinho; a barra de peso usa as imagens',
    (await icones('.tela')) >= 1 &&
      (await aba.avaliar(`document.querySelectorAll('.mochila-da-preparacao .slot img.slot-icone').length`)) >= 1 &&
      (await aba.avaliar(`getComputedStyle(document.querySelector('.barra')).backgroundImage.includes('barra-fundo')`)),
  )
  await passo('Começar partida')
  await aba.esperar(`!!${CENA}?.lider`, 'a partida', 20000)
  await pausa(1200)
  conferir('o Líder virou a imagem (o quadrado some)', await cena(`!!c.lider.boneco && !c.lider.quadrado.visible`))
  conferir('o HUD mostra o retrato do Líder e o ícone da habilidade da tecla 1', (await aba.avaliar(`!!document.querySelector('.hud img.hud-cor.com-retrato')`)) && (await icones('.hud')) >= 1)
  const parado = await animacaoDe('c.lider')
  conferir('parado: a animação parada, de frente (2 quadros)', parado?.chave === 'arte:arqueiroparadobaixo' && parado.tocando, parado)
  await aba.tecla('d', 'keyDown')
  await pausa(450)
  const direita = await animacaoDe('c.lider')
  await pausa(250)
  const direitaDepois = await animacaoDe('c.lider')
  await aba.tecla('d', 'keyUp')
  conferir('andando para a direita: a faixa da direita, sem espelho, mudando de quadro', direita?.chave === 'arte:arqueiroandandodireita' && !direita.espelhado && direita.quadro !== direitaDepois?.quadro, [direita, direitaDepois])
  await aba.tecla('a', 'keyDown')
  await pausa(400)
  const esquerda = await animacaoDe('c.lider')
  await aba.tecla('a', 'keyUp')
  conferir('andando para a esquerda (sem imagem própria): a da direita espelhada', esquerda?.chave === 'arte:arqueiroandandodireita' && esquerda.espelhado, esquerda)
  await aba.tecla('w', 'keyDown')
  await pausa(400)
  const cima = await animacaoDe('c.lider')
  await aba.tecla('w', 'keyUp')
  conferir('andando para cima (sem imagem): a de baixo', cima?.chave === 'arte:arqueiroandandobaixo', cima)
  await pausa(300)
  await cena(`(c.lider.ultimoAtaque = null, c.usarAtaque(c.lider, Math.PI / 2), true)`)
  await pausa(60)
  const ataque = await animacaoDe('c.lider')
  conferir('atacando: a animação de ataque', ataque?.chave === 'arte:arqueiroatacandobaixo', ataque)
  await aba.print('04-floresta')

  console.log('3. Mobs, Boss e itens no chão')
  const mobs = await cena(`(() => {
    const um = (tipo) => c.inimigos.find((i) => i.tipo === tipo)
    const desenho = (i) => (i ? { imagem: !!i.boneco, quadrado: i.quadrado.visible, anim: i.boneco?.sprite.anims.currentAnim?.key ?? null } : null)
    return { lobo: desenho(um('lobo')), aranha: desenho(um('aranha')), javali: desenho(um('javali')), cervo: desenho(um('cervo')), boss: desenho(c.boss) }
  })()`)
  conferir('o lobo virou imagem (nome em inglês do PixelLab)', mobs.lobo?.imagem && !mobs.lobo.quadrado, mobs.lobo)
  conferir('a aranha usa a imagem única', mobs.aranha?.imagem && mobs.aranha.anim === 'arte:aranha', mobs.aranha)
  conferir('o javali e o cervo, sem imagem, continuam quadrados', !mobs.javali?.imagem && mobs.javali?.quadrado && !mobs.cervo?.imagem && mobs.cervo?.quadrado, [mobs.javali, mobs.cervo])
  conferir('o Boss virou imagem e a coroa de quadradinho sumiu', mobs.boss?.imagem && !(await cena(`c.boss.coroa.visible`)), mobs.boss)
  const boteDoLobo = await cena(`(() => {
    const lobo = c.inimigos.find((i) => i.tipo === 'lobo')
    lobo.alvo = c.lider
    lobo.avisar(c.agora)
    lobo.darBote(c.agora)
    lobo.atualizarDesenho(c.agora, 16)
    return lobo.boneco.sprite.anims.currentAnim.key
  })()`)
  conferir('o bote do lobo usa os quadros soltos do ataque', boteDoLobo === 'arte:loboatacandobaixo1+loboatacandobaixo2+loboatacandobaixo3', boteDoLobo)
  const avisoDoBoss = await cena(`(() => { c.boss.alvo = c.lider; c.boss.comecarAtaque('pisao', c.agora); const tipo = c.boss.aviso.type; const textura = c.boss.aviso.texture?.key; c.boss.apagarAviso(); c.boss.estado = 'passeando'; return { tipo, textura } })()`)
  conferir('a marca do pisão do Boss usa a imagem (aviso-circulo)', avisoDoBoss.tipo === 'Image' && avisoDoBoss.textura === 'arte:avisocirculo', avisoDoBoss)
  const itens = await cena(`(() => {
    const por = (id) => c.itensNoChao.find((i) => i.item.id === id)
    return { cogumelo: por('cogumelo')?.desenho.type, madeira: por('madeira')?.desenho.type }
  })()`)
  conferir('o cogumelo no chão usa o ícone; a madeira (sem ícone) continua o losango', itens.cogumelo === 'Image' && itens.madeira === 'Rectangle', itens)

  console.log('4. Chão, árvores e pedras')
  const chao = await cena(`(() => ({
    grama: c.children.list.filter((o) => o.type === 'TileSprite' && o.texture.key.startsWith('chao:')).length,
    mata: c.children.list.some((o) => o.type === 'TileSprite' && o.texture.key === 'arte:mata'),
    arvores: c.copas.length,
    pedras: c.children.list.filter((o) => o.type === 'Image' && o.texture.key === 'arte:pedramedia').length,
  }))()`)
  conferir('o chão de cada região usa os tiles de grama, e a mata o tile dela', chao.grama === 5 && chao.mata, chao)
  conferir('as árvores e as pedras usam as imagens', chao.arvores > 10 && chao.pedras > 5, chao)
  // Uma árvore com lugar livre logo acima do tronco (atrás da copa)
  const copa = await cena(`(() => {
    for (const copa of c.copas) {
      const ponto = c.lugarLivre(40, { x: (copa.x0 + copa.x1) / 2, y: copa.topoDaHitbox - 26 })
      if (ponto.x > copa.x0 && ponto.x < copa.x1 && ponto.y > copa.topo && ponto.y < copa.base) {
        c.lider.colocarEm(ponto.x, ponto.y)
        return { indice: c.copas.indexOf(copa), base: copa.base }
      }
    }
    return null
  })()`)
  await pausa(300)
  const transparente = copa ? await cena(`c.copas[${copa.indice}].imagem.alpha`) : undefined
  conferir('o Líder atrás de uma árvore: a copa fica transparente', transparente !== undefined && transparente < 1, { copa, transparente })
  await aba.print('05-atras-da-arvore')
  await cena(`(() => { const p = c.lugarLivre(40, { x: c.lider.x, y: ${copa?.base ?? 0} + 70 }); c.lider.colocarEm(p.x, p.y); return true })()`)
  await pausa(300)
  conferir('saindo de trás, a copa volta ao normal', (await cena(`c.copas.filter((um) => um.imagem.alpha < 1).length`)) === 0)

  console.log('5. HUD: item perto e Pedra de Retorno')
  await cena(`(() => {
    for (const item of c.itensNoChao.filter((i) => i.item.id === 'cogumelo')) {
      const ponto = c.lugarLivre(40, { x: item.x + 30, y: item.y })
      if (Math.hypot(ponto.x - item.x, ponto.y - item.y) < 60) {
        c.lider.colocarEm(ponto.x, ponto.y)
        return true
      }
    }
    return false
  })()`)
  await pausa(400)
  conferir('o aviso "E: pegar" mostra o ícone do item', (await icones('.avisos-da-partida')) === 1)
  await cena(`([...c.inimigos].forEach((i) => c.matarInimigo(i)), c.ultimoDano = null, true)`)
  // Um tiro inimigo ainda no ar pode acertar e deixar o grupo em combate (aí o Q não começa): espera sair
  await aba.esperar(`!${CENA}.emCombate`, 'o grupo sair de combate', 9000).catch(() => {})
  await aba.apertar('q')
  await pausa(400)
  conferir('o retorno com Q mostra a Pedra de Retorno', (await aba.avaliar(`!!document.querySelector('.avisos-da-partida img.icone')`)) && (await aba.texto()).includes('Voltando ao Reino'))
  await aba.apertar('q')

  console.log('6. Desmaio com e sem imagem')
  await passo('Encher grupo')
  await pausa(600)
  const caidos = await cena(`(() => {
    const derrubar = (m) => { m.vida = 1; m.fimDaImunidade = 0; c.membroLevaGolpe(m, 999, { x: m.x - 10, y: m.y }, 0) }
    const arqueiro = c.lider
    const mago = c.grupo.find((m) => m.classe === 'mago')
    // Ninguém levanta ninguém durante a conferência (sem ajuda e sem mana para a Ressurreição)
    c.invencivel = false
    c.aliadosAjudam = false
    for (const m of c.grupo) m.mana = 0
    derrubar(mago)
    derrubar(arqueiro)
    return true
  })()`)
  await pausa(600)
  const desmaio = await cena(`(() => {
    const ver = (m) => ({ anim: m.boneco.sprite.anims.currentAnim?.key, angulo: Math.round(m.visual.angle), tinta: m.boneco.escuro })
    return { arqueiro: ver(c.lider), mago: ver(c.grupo.find((m) => m.classe === 'mago')) }
  })()`)
  conferir('o Arqueiro (com imagem de desmaiado) mostra ela, sem tombar', caidos && desmaio.arqueiro.anim === 'arte:arqueirodesmaiado' && desmaio.arqueiro.angulo === 0 && desmaio.arqueiro.tinta === null, desmaio.arqueiro)
  conferir('o Mago (sem imagem de desmaiado) tomba e escurece', desmaio.mago.angulo === 90 && desmaio.mago.tinta !== null, desmaio.mago)
  await aba.print('06-desmaio')

  console.log('7. Cutscene de derrota com as imagens')
  await passo('Derrota')
  await aba.esperarTela('Cutscene de derrota', 8000)
  const primeira = await fundoDaTela()
  conferir('a cutscene mostra a primeira imagem (derrota-1)', primeira.includes('url('), primeira)
  await aba.print('07-cutscene-1')
  await pausa(2600)
  const segunda = await fundoDaTela()
  conferir('depois de um tempo, passa para a segunda (derrota-2) e fica nela', segunda.includes('url(') && segunda !== primeira)
  await aba.print('08-cutscene-2')
  await passo('Continuar')
  await aba.esperarTela('Resumo', 8000)

  const erros = await aba.avaliar(`window.__erros ?? []`)
  conferir('nenhum erro no console', erros.length === 0, erros.slice(0, 3))
} catch (erro) {
  console.log(`\n  ERRO ${erro.message}`)
  estado.falhas++
} finally {
  parar()
  console.log(`\n${estado.total - estado.falhas} de ${estado.total} conferências passaram. Prints em ${PASTA}`)
  await desligar(estado.falhas ? 1 : 0)
}
