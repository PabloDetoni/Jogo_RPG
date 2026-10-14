import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { iconeDoItem, tamanhoDoItemNoChao } from '../../dados/arte.js'
import { estaPiscando, expirou, fracaoRestante, itemNatural, tiposDeItemNoChao } from '../../regras/itensNoChao.js'
import { imagemDaArte } from '../arte.js'
import { camadas, particulas } from '../efeitos.js'

// Item no chão da partida (Fase 3, TASK-064; ajustes de 14/10). Não tem corpo: ninguém bate nele; o Líder pega com E,
// se estiver perto e se couber na mochila. Dois tipos (regras/itensNoChao.js):
// - natural (os recursos do mapa): fica até alguém pegar; desenho parado na sombra, com um brilho;
// - dropado (drop de mob e o que o jogador descartou): some 30 s depois de cair. Em volta, um anel mostra o tempo que
//   falta (cheio quando cai, vazio quando vai sumir), e ele pisca nos últimos 5 s.
// Com a arte, é o ícone do item (item-<id>, dados/arte.js); sem ela, um losango na cor do item. Os dois sobem e descem.
const raioDoAnel = 15

export default class ItemNoChao {
  // estado: o que a regra devolve (itemNatural, itemDropado ou itemDescartado)
  constructor(cena, x, y, item, quantidade, estado = itemNatural()) {
    this.cena = cena
    this.x = x
    this.y = y
    this.item = item
    this.quantidade = quantidade
    this.tipo = estado.tipo
    this.caiuEm = estado.caiuEm
    this.expiraEm = estado.expiraEm // null = natural, fica até alguém pegar
    this.jaColetado = estado.jaColetado // foi pego e descartado: pegar de novo não conta outra vez
    this.sombra = cena.add.ellipse(x, y + 12, 22, 8, 0x000000, 0.25).setDepth(camadas.sombras)
    const icone = imagemDaArte(cena, iconeDoItem(item.id))
    if (icone) {
      this.desenho = cena.add.image(x, y, icone.textura).setScale(tamanhoDoItemNoChao / Math.max(icone.largura, icone.altura)).setDepth(y)
      this.brilho = null
    } else {
      this.desenho = cena.add.rectangle(x, y, 16, 16, item.cor).setStrokeStyle(2, coresDaArena.contorno).setAngle(45).setDepth(y)
      this.brilho = cena.add.rectangle(x - 2, y - 2, 5, 5, 0xffffff, 0.7).setAngle(45).setDepth(y + 1)
    }
    // O anel do tempo, só no dropado (no chão, em volta da sombra)
    this.anel = this.tipo === tiposDeItemNoChao.dropado ? cena.add.graphics().setDepth(camadas.sombras + 1) : null
    this.fase = Math.random() * Math.PI * 2
  }

  get dropado() {
    return this.tipo === tiposDeItemNoChao.dropado
  }

  // Sobe e desce; o dropado desenha o anel e pisca nos últimos segundos. Devolve false quando o tempo acabou.
  atualizar(agora) {
    if (expirou(this, agora)) return false
    const flutuar = Math.sin(agora / 300 + this.fase) * 3
    const piscando = estaPiscando(this, agora)
    this.desenho.setPosition(this.x, this.y + flutuar).setAlpha(piscando ? 0.25 : 1)
    this.brilho?.setPosition(this.x - 2, this.y - 2 + flutuar).setAlpha(piscando ? 0.2 : 0.7)
    if (this.anel) this.desenharAnel(fracaoRestante(this, agora), piscando)
    return true
  }

  desenharAnel(fracao, piscando) {
    const { anel, x } = this
    const y = this.y + 6
    anel.clear()
    anel.lineStyle(3, 0x000000, 0.35).strokeCircle(x, y, raioDoAnel)
    if (fracao <= 0) return
    const cor = fracao < 0.2 ? 0xff6b6b : 0xffd43b
    const inicio = -Math.PI / 2
    anel.lineStyle(3, cor, piscando ? 0.45 : 0.95)
    anel.beginPath()
    anel.arc(x, y, raioDoAnel, inicio, inicio + Math.PI * 2 * fracao, false)
    anel.strokePath()
  }

  definirVisivel(visivel) {
    if (this.desenho.visible === visivel) return
    this.desenho.setVisible(visivel)
    this.brilho?.setVisible(visivel)
    this.sombra.setVisible(visivel)
    this.anel?.setVisible(visivel)
  }

  // Sumiu (pego ou com o tempo acabado): um "pop" pequeno
  destruir(comPop = false) {
    if (comPop) particulas(this.cena, this.x, this.y, this.item.cor, 6, 120)
    this.desenho.destroy()
    this.brilho?.destroy()
    this.sombra.destroy()
    this.anel?.destroy()
  }
}
