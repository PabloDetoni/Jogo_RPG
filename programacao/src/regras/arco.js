import { combateDeTeste } from '../dados/balanceamento.js'

// ARCO QUE CARREGA (Arqueiro; ajustes de 14/10/2026). Segurar o clique puxa o arco; soltar atira. Quanto mais carregado,
// até a carga cheia: mais longe (até o alcance máximo), mais rápida e mais dano. Clique rápido: flecha curta, lenta e
// fraca. Depois de soltar, uma recarga curta antes de puxar de novo. Números em combateDeTeste.arco (PROVISÓRIOS).
// - Força: o dano da carga cheia; a carga parcial dá uma parte dele (fracaoMinimaDoDano na carga zero).
// - Agilidade: o tempo para a carga cheia, quase linear e suave, nunca abaixo de msMinimoParaCarregar. Continua dando o
//   crítico (regras/combate.js). A recarga depois de soltar é uma fração desse tempo: assim nenhum valor de Agilidade
//   deixa "spammar" flechas fortes, e carregar cheio rende sempre mais dano por segundo que clicar rápido.
// carga: de 0 (soltou na hora) a 1 (cheia).

const config = () => combateDeTeste.arco

// Tempo para a carga cheia (ms) pela Agilidade (0 a 100; acima de 100 conta como 100)
export function msParaCargaCheia(agilidade, arco = config()) {
  const agi = Math.min(Math.max(Number(agilidade) || 0, 0), 100)
  const { msParaCarregarSemAgilidade: maximo, msMinimoParaCarregar: minimo, curvaDaAgilidade } = arco
  return minimo + (maximo - minimo) * (1 - agi / 100) ** curvaDaAgilidade
}

// A carga depois de segurar msSegurando
export function cargaPeloTempo(msSegurando, msCargaCheia) {
  if (!(msCargaCheia > 0)) return 1
  return Math.min(1, Math.max(0, msSegurando / msCargaCheia))
}

const entre = (minimo, maximo, carga) => minimo + (maximo - minimo) * Math.min(1, Math.max(0, carga))

// Dano da carga cheia pela Força
export function danoDaCargaCheia(forca, arco = config()) {
  return arco.danoBase + arco.danoPorForca * Math.max(0, Number(forca) || 0)
}

// A flecha com esta carga: { dano, alcance, velocidade } (o dano ainda sem o crítico)
export function flechaDaCarga(carga, forca, arco = config()) {
  const cheio = danoDaCargaCheia(forca, arco)
  // O dano entra inteiro (regras/combate.js, aplicarDano): a carga parcial arredonda para baixo, a cheia para o mais perto,
  // para o arredondamento nunca fazer a parcial render mais que a cheia
  const dano = carga >= 1 ? Math.round(cheio) : Math.floor(cheio * entre(arco.fracaoMinimaDoDano, 1, carga))
  return {
    dano: Math.max(1, dano),
    alcance: Math.round(arco.alcanceMaximo * entre(arco.fracaoMinimaDoAlcance, 1, carga)),
    velocidade: Math.round(entre(arco.velocidadeMinima, arco.velocidadeMaxima, carga)),
  }
}

// A recarga depois de soltar (ms): uma fração do tempo da carga cheia
export function msDeRecargaDoArco(agilidade, arco = config()) {
  return Math.round(msParaCargaCheia(agilidade, arco) * arco.fracaoDaRecarga)
}

// Dano por segundo de quem solta sempre com msSegurando (contando a recarga depois de cada flecha)
export function danoPorSegundo(msSegurando, agilidade, forca, arco = config()) {
  const cheia = msParaCargaCheia(agilidade, arco)
  const segurando = Math.max(0, Math.min(msSegurando, cheia))
  const ciclo = segurando + msDeRecargaDoArco(agilidade, arco)
  return (flechaDaCarga(cargaPeloTempo(segurando, cheia), forca, arco).dano * 1000) / Math.max(1, ciclo)
}

// A menor carga que leva a flecha até a distância (1 se nem a carga cheia chega)
export function cargaParaAlcance(distancia, arco = config()) {
  const minimo = arco.alcanceMaximo * arco.fracaoMinimaDoAlcance
  if (distancia <= minimo) return 0
  return Math.min(1, (distancia - minimo) / (arco.alcanceMaximo - minimo))
}

// Quanto o Arqueiro aliado carrega, pelo nível da IA (regras/nivelDaIA.js): 'basica' | 'media' | 'avancada'.
// - avançada: o suficiente para a distância do alvo, com uma folga;
// - média: o suficiente, com um erro pequeno para mais ou para menos;
// - básica: às vezes pouco (a flecha pode cair antes do alvo), às vezes demais (segura além da carga cheia).
// Devolve { carga, msAMais } (msAMais: o tempo segurando depois da carga cheia, só a básica). sorteio: de 0 a 1.
export function cargaDaIA(nivel, distancia, sorteio = Math.random, arco = config()) {
  const precisa = cargaParaAlcance(distancia * arco.ia.folgaDoAlcance, arco)
  if (nivel === 'avancada') return { carga: precisa, msAMais: 0 }
  if (nivel === 'media') {
    const erro = (sorteio() * 2 - 1) * arco.ia.erroDaMedia
    return { carga: Math.min(1, Math.max(0, precisa + erro)), msAMais: 0 }
  }
  if (sorteio() < arco.ia.chanceDePoucoDaBasica) return { carga: precisa * entre(arco.ia.poucoDaBasica[0], arco.ia.poucoDaBasica[1], sorteio()), msAMais: 0 }
  return { carga: 1, msAMais: Math.round(entre(arco.ia.msDemaisDaBasica[0], arco.ia.msDemaisDaBasica[1], sorteio())) }
}
