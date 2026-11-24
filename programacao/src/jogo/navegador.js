import { combateDeTeste } from '../dados/balanceamento.js'
import { velocidadeDoMovimento } from '../regras/combate.js'
import { caminhoNaGrade, criarGrade, linhaLivre, raioDoCorpo } from '../regras/movimento.js'
import { retangulosEntre, retangulosNaCaixa } from '../regras/vizinhanca.js'

const { caminho: config, personagem } = combateDeTeste

// Acha por onde cada um anda para chegar a um ponto, contornando as pedras (caminho na grade, regras/movimento.js).
// Se dá para ir reto, vai reto. Senão, guarda o caminho de cada um e só recalcula de tempos em tempos
// ou quando o alvo muda bastante de lugar.
export default class Navegador {
  // indice: a busca rápida dos obstáculos (regras/vizinhanca.js), para o mapa grande da Fase 3
  // Mapa pequeno (a arena): uma grade só, do mapa todo. Mapa grande (a Floresta, Parte 5): uma grade LOCAL a cada
  // busca, só em volta de quem anda e do alvo (com folga), com as paredes dali; buscar no mapa todo pesaria demais.
  constructor(area, paredes, indice) {
    this.area = area
    this.paredes = paredes
    this.indice = indice
    this.opcoes = { celula: config.celula, folga: raioDoCorpo(personagem.tamanho) + 2 }
    this.local = area.largura * area.altura > config.areaMaximaDaGradeUnica
    this.grade = this.local ? null : criarGrade(area, paredes, this.opcoes)
    this.caminhos = new Map()
  }

  // A grade para ir de a até b: a do mapa todo, ou uma local (a caixa dos dois pontos com folga, dentro do mapa)
  gradeEntre(a, b) {
    if (!this.local) return this.grade
    const { folgaDaGradeLocal } = config
    const esquerda = Math.max(this.area.x - this.area.largura / 2, Math.min(a.x, b.x) - folgaDaGradeLocal)
    const direita = Math.min(this.area.x + this.area.largura / 2, Math.max(a.x, b.x) + folgaDaGradeLocal)
    const topo = Math.max(this.area.y - this.area.altura / 2, Math.min(a.y, b.y) - folgaDaGradeLocal)
    const base = Math.min(this.area.y + this.area.altura / 2, Math.max(a.y, b.y) + folgaDaGradeLocal)
    const caixa = { x: (esquerda + direita) / 2, y: (topo + base) / 2, largura: direita - esquerda, altura: base - topo }
    return criarGrade(caixa, retangulosNaCaixa(this.indice, caixa), this.opcoes)
  }

  // A reta de a até b passa longe (folga) dos obstáculos?
  livre(a, b, folga) {
    const paredes = this.indice ? retangulosEntre(this.indice, a, b, folga + 2) : this.paredes
    return linhaLivre(a, b, paredes, folga)
  }

  // Próximo ponto para onde andar, a caminho do alvo
  proximoPonto(entidade, alvo, agora) {
    const folga = entidade.raio + 1
    if (this.livre(entidade, alvo, folga)) {
      this.caminhos.delete(entidade)
      return alvo
    }
    let guardado = this.caminhos.get(entidade)
    const alvoMudou = guardado && Math.hypot(alvo.x - guardado.alvo.x, alvo.y - guardado.alvo.y) > 40
    if (!guardado || alvoMudou || agora - guardado.quando >= config.msEntreRecalculos) {
      guardado = { alvo: { x: alvo.x, y: alvo.y }, quando: agora, pontos: caminhoNaGrade(this.gradeEntre(entidade, alvo), entidade, alvo) }
      this.caminhos.set(entidade, guardado)
    }
    const { pontos } = guardado
    // Pula os pontos já alcançados e os que não precisam mais (o seguinte já está à vista)
    while (
      pontos.length > 1 &&
      (Math.hypot(pontos[0].x - entidade.x, pontos[0].y - entidade.y) < 12 || this.livre(entidade, pontos[1], folga))
    ) {
      pontos.shift()
    }
    return pontos[0] ?? alvo
  }

  // Velocidade para ir até o alvo pelo caminho
  velocidadeAte(entidade, alvo, velocidade, agora) {
    const destino = this.proximoPonto(entidade, alvo, agora)
    return velocidadeDoMovimento(destino.x - entidade.x, destino.y - entidade.y, velocidade)
  }

  esquecer(entidade) {
    this.caminhos.delete(entidade)
  }
}
