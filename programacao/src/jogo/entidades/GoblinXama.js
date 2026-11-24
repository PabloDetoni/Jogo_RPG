import { podeUsar } from '../../regras/combate.js'
import { goblinParaCurar } from '../../regras/acampamento.js'
import { numeroFlutuante, particulas } from '../efeitos.js'
import Atirador from './Atirador.js'

// Goblin Xamã (Parte 6b de 11/2026): luta como o atirador (fica longe e atira fraco) e, a cada msEntreCuras, cura o
// goblin mais ferido do bando dele (o acampamento) que estiver a até config.cura.raio, ele mesmo também. A cura
// aparece como partículas verdes e o "+N" em cima de quem recebeu. Por isso a IA média e avançada dos aliados mira
// nele primeiro (config.prioridade).
export default class GoblinXama extends Atirador {
  constructor(cena, x, y, config, cor) {
    super(cena, x, y, config, cor)
    this.ultimaCura = null
  }

  atualizar(agora) {
    if (!this.morto && podeUsar(agora, this.ultimaCura, this.config.cura.msEntreCuras)) {
      const ferido = goblinParaCurar(this, this.bando ?? [this], this.config.cura.raio)
      if (ferido) this.curar(ferido, agora)
    }
    super.atualizar(agora)
  }

  curar(ferido, agora) {
    const antes = ferido.vida
    ferido.vida = Math.min(ferido.vidaMaxima, ferido.vida + this.config.cura.quanto)
    this.ultimaCura = agora
    particulas(this.cena, ferido.x, ferido.y, 0x7ee081, 10, 160)
    numeroFlutuante(this.cena, ferido.x, ferido.y - ferido.tamanho, `+${Math.round(ferido.vida - antes)}`, '#7ee081', 24)
  }
}
