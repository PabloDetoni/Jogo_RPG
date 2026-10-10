import { coresDaArena } from '../../dados/arenaDeTeste.js'
import { camadas, particulas } from '../efeitos.js'

// Item no chão da partida (Fase 3, TASK-064): um recurso da Floresta ou o drop de um mob. Não tem corpo: ninguém
// bate nele; o Líder pega com E, se estiver perto e se couber na mochila. O drop (e o que não coube) some depois de um
// tempo, piscando nos últimos segundos. Até a arte chegar, é um losango na cor do item, subindo e descendo devagar.
export default class ItemNoChao {
  constructor(cena, x, y, item, quantidade, expiraEm = null) {
    this.cena = cena
    this.x = x
    this.y = y
    this.item = item
    this.quantidade = quantidade
    this.expiraEm = expiraEm // null = fica até alguém pegar (os recursos do chão)
    this.sombra = cena.add.ellipse(x, y + 12, 22, 8, 0x000000, 0.25).setDepth(camadas.sombras)
    this.desenho = cena.add.rectangle(x, y, 16, 16, item.cor).setStrokeStyle(2, coresDaArena.contorno).setAngle(45).setDepth(y)
    this.brilho = cena.add.rectangle(x - 2, y - 2, 5, 5, 0xffffff, 0.7).setAngle(45).setDepth(y + 1)
    this.fase = Math.random() * Math.PI * 2
  }

  // Sobe e desce; pisca nos últimos 5 s antes de sumir. Devolve false quando o tempo acabou.
  atualizar(agora) {
    if (this.expiraEm !== null && agora >= this.expiraEm) return false
    const flutuar = Math.sin(agora / 300 + this.fase) * 3
    const piscando = this.expiraEm !== null && this.expiraEm - agora < 5000 && Math.floor(agora / 150) % 2 === 0
    this.desenho.setPosition(this.x, this.y + flutuar).setAlpha(piscando ? 0.25 : 1)
    this.brilho.setPosition(this.x - 2, this.y - 2 + flutuar).setAlpha(piscando ? 0.2 : 0.7)
    return true
  }

  definirVisivel(visivel) {
    if (this.desenho.visible === visivel) return
    this.desenho.setVisible(visivel)
    this.brilho.setVisible(visivel)
    this.sombra.setVisible(visivel)
  }

  // Sumiu (pego ou com o tempo acabado): um "pop" pequeno
  destruir(comPop = false) {
    if (comPop) particulas(this.cena, this.x, this.y, this.item.cor, 6, 120)
    this.desenho.destroy()
    this.brilho.destroy()
    this.sombra.destroy()
  }
}
