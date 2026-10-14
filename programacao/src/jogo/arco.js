import { combateDeTeste } from '../dados/balanceamento.js'
import { cargaDaIA, cargaPeloTempo, flechaDaCarga, msDeRecargaDoArco, msParaCargaCheia } from '../regras/arco.js'
import { camadas } from './efeitos.js'

// O ARCO QUE CARREGA na partida (ajustes de 14/10/2026). As contas ficam em regras/arco.js; aqui, só o estado de quem
// está puxando e o desenho. Quem puxa guarda membro.puxando = { desde, msParaSoltar } (msParaSoltar: o aliado, que solta
// sozinho; o Líder solta quando larga o clique).

const { arco } = combateDeTeste
const corDaCarga = 0xffd43b
const corDaCargaCheia = 0xfff3a0

export const usaArco = (membro) => membro?.classe === 'arqueiro'

// Pode começar a puxar? (não caído, sem puxar já, e depois da recarga da última flecha)
export function podePuxar(membro, agora) {
  if (!membro || membro.caido || membro.puxando) return false
  return membro.ultimoAtaque == null || agora - membro.ultimoAtaque >= msDeRecargaDoArco(membro.agilidade)
}

export function comecarAPuxar(membro, agora, msParaSoltar = null) {
  membro.puxando = { desde: agora, msParaSoltar }
}

export function cargaAtual(membro, agora) {
  if (!membro?.puxando) return 0
  return cargaPeloTempo(agora - membro.puxando.desde, msParaCargaCheia(membro.agilidade))
}

// A flecha que sairia agora ({ dano, alcance, velocidade })
export function flechaAgora(membro, agora) {
  return flechaDaCarga(cargaAtual(membro, agora), membro.forca)
}

// O aliado começa a puxar o bastante para a distância do alvo, pelo nível da IA ('basica' | 'media' | 'avancada')
export function puxarParaADistancia(membro, agora, distancia, nivelDaIA) {
  const { carga, msAMais } = cargaDaIA(nivelDaIA, distancia)
  comecarAPuxar(membro, agora, carga * msParaCargaCheia(membro.agilidade) + msAMais)
}

// O aliado já puxou o que queria?
export function horaDeSoltar(membro, agora) {
  return Boolean(membro.puxando && membro.puxando.msParaSoltar !== null && agora - membro.puxando.desde >= membro.puxando.msParaSoltar)
}

// Recarga do ataque para o HUD: o Arqueiro usa a do arco
export function msDeRecargaDoAtaque(membro, recargaDaClasse) {
  return usaArco(membro) ? msDeRecargaDoArco(membro.agilidade) : recargaDaClasse
}

// Puxando, anda mais devagar
export function multiplicadorDaVelocidade(membro) {
  return membro?.puxando ? arco.multiplicadorDaVelocidadePuxando : 1
}

// O desenho de quem puxa: uma barra que enche acima da cabeça, o brilho na carga cheia e, para o Líder, a linha pontilhada
// até onde a flecha vai com a carga de agora
export class DesenhoDoArco {
  constructor(cena) {
    this.cena = cena
    this.grafico = cena.add.graphics().setDepth(camadas.textos - 10)
  }

  atualizar(membros, lider, angulo, agora) {
    const g = this.grafico
    g.clear()
    for (const membro of membros) {
      if (!membro.puxando || membro.caido) continue
      const carga = cargaAtual(membro, agora)
      const cheia = carga >= 1
      const largura = membro.lider ? 44 : 30
      const x = membro.x - largura / 2
      const y = membro.y - membro.tamanho * 0.95
      g.fillStyle(0x000000, 0.55).fillRect(x - 1, y - 1, largura + 2, 7)
      g.fillStyle(cheia ? corDaCargaCheia : corDaCarga, 1).fillRect(x, y, largura * carga, 5)
      // Brilho na carga cheia: um anel que pulsa em volta de quem puxa
      if (cheia) {
        const pulso = 0.55 + 0.35 * Math.sin(agora / 90)
        g.lineStyle(3, corDaCargaCheia, pulso).strokeCircle(membro.x, membro.y, membro.tamanho * 0.85)
      }
      if (membro === lider) this.linhaDoAlcance(membro, angulo, flechaDaCarga(carga, membro.forca).alcance, cheia)
    }
  }

  // Linha pontilhada do Líder até o alcance da flecha, com uma marca no fim
  linhaDoAlcance(membro, angulo, alcance, cheia) {
    const g = this.grafico
    const cos = Math.cos(angulo)
    const sen = Math.sin(angulo)
    const inicio = membro.tamanho * 0.7
    g.lineStyle(2, cheia ? corDaCargaCheia : 0xffffff, cheia ? 0.9 : 0.6)
    for (let d = inicio; d < alcance; d += 18) {
      const fim = Math.min(alcance, d + 9)
      g.lineBetween(membro.x + cos * d, membro.y + sen * d, membro.x + cos * fim, membro.y + sen * fim)
    }
    g.strokeCircle(membro.x + cos * alcance, membro.y + sen * alcance, 6)
  }

  destruir() {
    this.grafico.destroy()
  }
}
