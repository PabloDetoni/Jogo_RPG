import { coresDaArena } from '../dados/arenaDeTeste.js'
import { criarSorteio } from '../regras/mundo.js'
import { camadas } from './efeitos.js'

// Desenho da Floresta (Fase 3). Só desenho: as hitboxes dos obstáculos ficam na cena (zonas invisíveis), como pede
// o CLAUDE.md, e trocar a arte depois não mexe no acerto. Até a arte chegar, cada região tem um tom de verde, a mata
// fechada é escura (o fundo da câmera) com copas na beira, as árvores são copas redondas e as pedras, retângulos cinza.
//
// Desempenho (TEST-005): cada enfeite é uma imagem feita uma vez só (textura) e só posicionada, o jeito mais barato
// de desenhar. O mapa é dividido em pedaços; a cena esconde os pedaços fora da tela (cena.pedacosDoChao).

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

export function desenharFloresta(cena, mapa) {
  const { cores } = mapa
  criarTexturasDaFloresta(cena, cores)
  const sorteio = criarSorteio(mapa.semente + 7)
  const entre = (min, max) => min + (max - min) * sorteio()

  // O chão de cada região (o tom de verde dela). A mata fechada é o fundo da câmera (a mesma cor, sem desenhar).
  for (const regiao of mapa.regioes) {
    const { x0, x1, y0, y1 } = regiao
    cena.add.rectangle((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, regiao.chao).setDepth(camadas.manchas - 12)
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

  // Manchas de verde mais escuro no chão de cada região
  for (const regiao of mapa.regioes) {
    const area = (regiao.x1 - regiao.x0) * (regiao.y1 - regiao.y0)
    const quantas = Math.round(area / 110000)
    for (let i = 0; i < quantas; i++) {
      const x = entre(regiao.x0 + 60, regiao.x1 - 60)
      const y = entre(regiao.y0 + 60, regiao.y1 - 60)
      const mancha = cena.add.image(x, y, 'floresta-mancha').setTint(regiao.mancha).setDisplaySize(entre(120, 300), entre(60, 150))
      guardar(mancha.setDepth(camadas.manchas - 6), x, y)
    }
  }

  // Beira da mata: copas ao longo de toda borda entre uma região e a mata
  const copa = (x, y) => {
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
  for (const obstaculo of mapa.obstaculos.filter((um) => um.tipo !== 'mata')) {
    const { x, y, largura, altura } = obstaculo
    if (obstaculo.tipo === 'arvore') {
      const imagem = cena.add.image(x + largura * 0.06, y, 'floresta-arvore').setDisplaySize(largura * 1.16, altura * 1.12)
      guardar(imagem.setDepth(camadas.manchas - 2), x, y)
    } else {
      guardar(cena.add.rectangle(x + 6, y + 8, largura, altura, 0x000000, 0.22).setDepth(camadas.manchas - 3), x, y)
      guardar(cena.add.rectangle(x, y, largura, altura, cores.pedra).setStrokeStyle(2, coresDaArena.contorno).setDepth(camadas.manchas - 2), x, y)
      guardar(cena.add.rectangle(x, y - altura / 2 + 7, largura - 12, 6, 0xffffff, 0.25).setDepth(camadas.manchas - 1), x, y)
    }
  }

  cena.pedacosDoChao = [...pedacos.values()]
}
