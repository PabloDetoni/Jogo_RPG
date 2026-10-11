import * as Phaser from 'phaser'
import { coresDaArena } from '../dados/arenaDeTeste.js'
import { arteDaFloresta } from '../dados/arte.js'
import { chaveDaArte, escolherPedra, gramaDaRegiao } from '../regras/arte.js'
import { criarSorteio } from '../regras/mundo.js'
import { imagemDaArte, texturaDaArte } from './arte.js'
import { camadas } from './efeitos.js'

// Desenho da Floresta (Fase 3). Só desenho: as hitboxes dos obstáculos ficam na cena (zonas invisíveis), como pede
// o CLAUDE.md, e trocar a arte depois não mexe no acerto. Até a arte chegar, cada região tem um tom de verde, a mata
// fechada é escura (o fundo da câmera) com copas na beira, as árvores são copas redondas e as pedras, retângulos cinza.
// Com a arte (dados/arte.js, arteDaFloresta), cada parte troca sozinha: o chão vira os tiles de grama (com o tom da
// região), a mata o tile dela, a beira e as árvores as imagens de árvore e arbusto, e as pedras as de pedra (ou um
// tronco caído, nas pedras compridas). As árvores soltas ficam na ordem certa com os bonecos (quem passa atrás some
// atrás da copa, que fica transparente na frente do Líder: CenaArena.atualizarCopas).
//
// Desempenho (TEST-005): cada enfeite é uma imagem feita uma vez só (textura) e só posicionada, o jeito mais barato
// de desenhar. O mapa é dividido em pedaços; a cena esconde os pedaços fora da tela (cena.pedacosDoChao). O chão com
// tiles é uma textura de 8 × 8 tiles sorteados uma vez, repetida (TileSprite), e não um objeto por tile.

const tamanhoDoPedaco = 1200

// Texturas dos enfeites, feitas uma vez por jogo: brancas (a cor vem do tint) ou já pintadas (a árvore)
function criarTexturasDaFloresta(cena, cores) {
  if (cena.textures.exists('floresta-copa')) return
  const desenho = cena.add.graphics()
  // Copa da beira da mata: círculo branco com contorno escuro (o tint dá o verde)
  desenho.fillStyle(0xffffff, 1).fillCircle(66, 66, 64)
  desenho.lineStyle(3, 0x000000, 0.35).strokeCircle(66, 66, 63)
  desenho.generateTexture('floresta-copa', 132, 132)
  desenho.clear()
  // Mancha do chão: elipse branca (o tint dá o verde da região)
  desenho.fillStyle(0xffffff, 1).fillEllipse(128, 64, 256, 128)
  desenho.generateTexture('floresta-mancha', 256, 128)
  desenho.clear()
  // Árvore solta: sombra, tronco, copa e um brilho (desenhada num quadrado de 100; a imagem é esticada ao tamanho)
  desenho.fillStyle(0x000000, 0.22).fillEllipse(56, 86, 112, 44)
  desenho.fillStyle(cores.tronco, 1).fillRect(38, 50, 24, 42)
  desenho.fillStyle(cores.arvore, 1).fillCircle(50, 42, 52)
  desenho.lineStyle(3, coresDaArena.contorno, 0.6).strokeCircle(50, 42, 51)
  desenho.fillStyle(cores.copaClara, 0.85).fillCircle(34, 26, 20)
  desenho.generateTexture('floresta-arvore', 116, 112)
  desenho.destroy()
}

// A textura grande do chão: 8 × 8 tiles sorteados entre as variações de grama (a primeira aparece mais), com flores de
// vez em quando. Feita uma vez por conjunto de variações; devolve o nome e o lado de um tile na imagem.
function texturaDoChao(cena, chaves, sorteio) {
  const fontes = chaves.map((chave) => cena.textures.get(texturaDaArte(chave)).getSourceImage())
  const lado = Math.max(1, fontes[0].height)
  const nome = `chao:${chaves.join('+')}`
  if (cena.textures.exists(nome)) return { nome, lado }
  const n = arteDaFloresta.tilesPorBloco
  const tela = cena.textures.createCanvas(nome, lado * n, lado * n)
  const pincel = tela.getContext()
  pincel.imageSmoothingEnabled = false
  const chaveDasFlores = chaveDaArte(arteDaFloresta.flores)
  const flores = cena.arte.disponiveis.has(chaveDasFlores) ? cena.textures.get(texturaDaArte(chaveDasFlores)).getSourceImage() : null
  for (let linha = 0; linha < n; linha++) {
    for (let coluna = 0; coluna < n; coluna++) {
      const fonte = sorteio() < 0.6 ? fontes[0] : fontes[Math.floor(sorteio() * fontes.length)]
      pincel.drawImage(fonte, coluna * lado, linha * lado, lado, lado)
      if (flores && sorteio() < arteDaFloresta.chanceDeFlores) pincel.drawImage(flores, coluna * lado, linha * lado, lado, lado)
    }
  }
  tela.refresh()
  tela.setFilter(Phaser.Textures.FilterMode.NEAREST)
  return { nome, lado }
}

export function desenharFloresta(cena, mapa) {
  const { cores } = mapa
  criarTexturasDaFloresta(cena, cores)
  const sorteio = criarSorteio(mapa.semente + 7)
  const entre = (min, max) => min + (max - min) * sorteio()
  const disponiveis = cena.arte?.disponiveis ?? new Set()
  const { tamanhoDoTile } = arteDaFloresta

  // A mata fechada: o tile dela no mapa todo, embaixo das regiões; sem ele, o fundo da câmera (a mesma cor, sem desenhar)
  const mata = imagemDaArte(cena, arteDaFloresta.mata)
  if (mata) {
    const { largura, altura } = mapa.tamanho
    cena.add
      .tileSprite(largura / 2, altura / 2, largura, altura, mata.textura)
      .setTileScale(tamanhoDoTile / mata.altura)
      .setDepth(camadas.manchas - 14)
  }

  // O chão de cada região: os tiles de grama com o tom dela, ou o tom de verde de hoje
  const comGrama = new Set()
  for (const regiao of mapa.regioes) {
    const { x0, x1, y0, y1 } = regiao
    const grama = gramaDaRegiao(disponiveis, regiao.id)
    if (grama) {
      comGrama.add(regiao.id)
      const chao = texturaDoChao(cena, grama.chaves, sorteio)
      cena.add
        .tileSprite((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, chao.nome)
        .setTileScale(tamanhoDoTile / chao.lado)
        .setTint(grama.tinta)
        .setDepth(camadas.manchas - 12)
    } else {
      cena.add.rectangle((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, regiao.chao).setDepth(camadas.manchas - 12)
    }
  }

  // Pedaços do chão: cada enfeite vai para o pedaço onde fica o centro dele
  const pedacos = new Map()
  const guardar = (objeto, x, y) => {
    const c = Math.floor(x / tamanhoDoPedaco)
    const l = Math.floor(y / tamanhoDoPedaco)
    const chave = `${c},${l}`
    if (!pedacos.has(chave)) {
      // Folga: um enfeite pode passar um pouco da beira do pedaço
      pedacos.set(chave, { objetos: [], visivel: true, x0: c * tamanhoDoPedaco - 200, y0: l * tamanhoDoPedaco - 200, x1: (c + 1) * tamanhoDoPedaco + 200, y1: (l + 1) * tamanhoDoPedaco + 200 })
    }
    pedacos.get(chave).objetos.push(objeto)
    return objeto
  }

  // Manchas de verde mais escuro no chão de cada região (só sem os tiles: a grama já tem as variações dela)
  for (const regiao of mapa.regioes.filter((uma) => !comGrama.has(uma.id))) {
    const area = (regiao.x1 - regiao.x0) * (regiao.y1 - regiao.y0)
    const quantas = Math.round(area / 110000)
    for (let i = 0; i < quantas; i++) {
      const x = entre(regiao.x0 + 60, regiao.x1 - 60)
      const y = entre(regiao.y0 + 60, regiao.y1 - 60)
      const mancha = cena.add.image(x, y, 'floresta-mancha').setTint(regiao.mancha).setDisplaySize(entre(120, 300), entre(60, 150))
      guardar(mancha.setDepth(camadas.manchas - 6), x, y)
    }
  }

  // Beira da mata: copas ao longo de toda borda entre uma região e a mata (com a arte, árvores e arbustos)
  const arvore = imagemDaArte(cena, arteDaFloresta.arvore)
  const arbusto = imagemDaArte(cena, arteDaFloresta.arbusto)
  const copa = (x, y) => {
    if (arvore || arbusto) {
      const imagem = arbusto && (!arvore || sorteio() < 0.35) ? arbusto : arvore
      const largura = entre(70, 110)
      const objeto = cena.add
        .image(x, y, imagem.textura)
        .setOrigin(0.5, 0.75)
        .setScale(largura / imagem.largura)
        .setFlipX(sorteio() < 0.5)
      guardar(objeto.setDepth(camadas.manchas - 4), x, y)
      return
    }
    const tamanho = entre(76, 132)
    const imagem = cena.add.image(x, y, 'floresta-copa').setTint(sorteio() < 0.5 ? cores.copa : cores.copaClara).setDisplaySize(tamanho, tamanho)
    guardar(imagem.setDepth(camadas.manchas - 4), x, y)
  }
  const linhaDeCopas = (xa, ya, xb, yb) => {
    const comprimento = Math.hypot(xb - xa, yb - ya)
    const passos = Math.max(1, Math.round(comprimento / 70))
    for (let i = 0; i <= passos; i++) copa(xa + ((xb - xa) * i) / passos + entre(-10, 10), ya + ((yb - ya) * i) / passos + entre(-10, 10))
  }
  mapa.regioes.forEach((regiao, indice) => {
    const anterior = mapa.regioes[indice - 1]
    const seguinte = mapa.regioes[indice + 1]
    if (regiao.y0 > 0) linhaDeCopas(regiao.x0, regiao.y0 - 18, regiao.x1, regiao.y0 - 18)
    if (regiao.y1 < mapa.tamanho.altura) linhaDeCopas(regiao.x0, regiao.y1 + 18, regiao.x1, regiao.y1 + 18)
    // Degraus entre regiões de alturas diferentes: a parede de lado
    const lado = (vizinha, x, deslocamento) => {
      if (!vizinha) {
        linhaDeCopas(x + deslocamento, regiao.y0, x + deslocamento, regiao.y1)
        return
      }
      if (vizinha.y0 > regiao.y0) linhaDeCopas(x + deslocamento, regiao.y0, x + deslocamento, vizinha.y0)
      if (vizinha.y1 < regiao.y1) linhaDeCopas(x + deslocamento, vizinha.y1, x + deslocamento, regiao.y1)
    }
    lado(anterior, regiao.x0, -18)
    lado(seguinte, regiao.x1, 18)
  })

  // Árvores e pedras soltas (as hitboxes são os retângulos; o desenho cabe neles)
  cena.copas = []
  const tronco = imagemDaArte(cena, arteDaFloresta.tronco)
  for (const obstaculo of mapa.obstaculos.filter((um) => um.tipo !== 'mata')) {
    const { x, y, largura, altura } = obstaculo
    if (obstaculo.tipo === 'arvore') {
      if (arvore) {
        // O tronco embaixo, na hitbox, e a copa crescendo para cima; a profundidade é a da base (como os bonecos)
        const base = y + altura / 2
        const imagem = cena.add
          .image(x, base + 4, arvore.textura)
          .setOrigin(0.5, 1)
          .setScale((largura * arteDaFloresta.larguraDaArvore) / arvore.largura)
          .setDepth(base)
        guardar(imagem, x, y)
        const meia = imagem.displayWidth * 0.42
        cena.copas.push({ imagem, x0: x - meia, x1: x + meia, topo: base - imagem.displayHeight, base, topoDaHitbox: y - altura / 2, atras: false, transparencia: arteDaFloresta.transparenciaDaCopa })
      } else {
        const imagem = cena.add.image(x + largura * 0.06, y, 'floresta-arvore').setDisplaySize(largura * 1.16, altura * 1.12)
        guardar(imagem.setDepth(camadas.manchas - 2), x, y)
      }
      continue
    }
    // Pedra comprida pode virar um tronco caído (só desenho; bloqueia do mesmo jeito)
    const comprida = largura >= altura * 1.8
    const chave = tronco && comprida && sorteio() < 0.5 ? chaveDaArte(arteDaFloresta.tronco) : escolherPedra(disponiveis, largura)
    if (chave) {
      const folga = arteDaFloresta.folgaDaPedra
      guardar(cena.add.image(x, y, texturaDaArte(chave)).setDisplaySize(largura * folga, altura * folga).setDepth(camadas.manchas - 2), x, y)
      continue
    }
    guardar(cena.add.rectangle(x + 6, y + 8, largura, altura, 0x000000, 0.22).setDepth(camadas.manchas - 3), x, y)
    guardar(cena.add.rectangle(x, y, largura, altura, cores.pedra).setStrokeStyle(2, coresDaArena.contorno).setDepth(camadas.manchas - 2), x, y)
    guardar(cena.add.rectangle(x, y - altura / 2 + 7, largura - 12, 6, 0xffffff, 0.25).setDepth(camadas.manchas - 1), x, y)
  }

  cena.pedacosDoChao = [...pedacos.values()]
}
