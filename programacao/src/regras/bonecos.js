import { poseDosBonecos } from '../dados/bonecos.js'

// Bonecos de quadradinho dos personagens (RNF15, Parte 2 de 11/2026). Funções puras: só contas da pose; o desenho fica
// em jogo/entidades/BonecoDeQuadradinho.js. Ângulos em radianos, no sistema da tela (y para baixo): 0 = direita,
// -π/2 = para cima, π/2 = para baixo.

const normalizar = (angulo) => Math.atan2(Math.sin(angulo), Math.cos(angulo))

// Para que lado o corpo olha ('direita' ou 'esquerda'), pela direção (o cosseno). Perto da vertical (|cos| pequeno)
// fica como estava: a "viradinha" só acontece quando o braço passaria na frente do corpo, sem pisca-pisca.
export function ladoDoCorpo(angulo, ladoAnterior = 'direita', histerese = poseDosBonecos.histereseDoLado) {
  const cosseno = Math.cos(angulo)
  if (cosseno > histerese) return 'direita'
  if (cosseno < -histerese) return 'esquerda'
  return ladoAnterior
}

// A arma vai para trás do corpo quando a mira aponta para cima (seno negativo) e para a frente quando aponta para baixo.
// Perto da horizontal fica como estava (histerese).
export function armaAtras(angulo, anterior = false, histerese = poseDosBonecos.histereseDaFrente) {
  const seno = Math.sin(angulo)
  if (seno < -histerese) return true
  if (seno > histerese) return false
  return anterior
}

// O ângulo da mira visto de dentro do corpo, que olha para a direita (no lado esquerdo, o desenho é espelhado)
export function anguloNoCorpo(angulo, lado) {
  return normalizar(lado === 'esquerda' ? Math.PI - angulo : angulo)
}

// A pose do braço da arma que segue a mira (Tanque e Arqueiro): o lado do corpo, a arma atrás ou na frente e o ângulo do
// braço dentro do corpo, limitado a uma faixa natural (o braço nunca dá a volta por dentro do corpo).
export function poseDoBraco(angulo, anterior = {}, config = poseDosBonecos) {
  const lado = ladoDoCorpo(angulo, anterior.lado, config.histereseDoLado)
  const atras = armaAtras(angulo, anterior.atras, config.histereseDaFrente)
  const limite = config.limiteDoBraco
  const anguloDoBraco = Math.min(limite, Math.max(-limite, anguloNoCorpo(angulo, lado)))
  return { lado, atras, anguloDoBraco }
}

// Balanço do corpo: parado, respira de leve; andando, as pernas alternam, o corpo sobe e desce e a mão livre balança.
// fase: cresce com o tempo (mais depressa andando). Devolve deslocamentos em px e ângulos em radianos.
export function balancoDoBoneco(fase, andando, config = poseDosBonecos) {
  if (!andando) {
    const respira = Math.sin(fase * config.parado.ritmo)
    return { pernaDaFrente: 0, pernaDeTras: 0, corpoY: respira * config.parado.corpo, bracoLivre: respira * config.parado.braco, armaY: respira * config.parado.corpo }
  }
  const passo = Math.sin(fase)
  return {
    pernaDaFrente: passo * config.andando.perna,
    pernaDeTras: -passo * config.andando.perna,
    corpoY: -Math.abs(Math.cos(fase)) * config.andando.corpo,
    bracoLivre: -passo * config.andando.braco,
    armaY: -Math.abs(Math.cos(fase)) * config.andando.corpo,
  }
}

// O golpe de cada arma, pela fração do tempo do ataque (0 = começou, 1 = acabou). giro: o quanto o braço da arma gira
// (radianos, somado à posição de descanso); avanco: o quanto a mão vai para a frente (px). Fora do golpe, nada.
export function poseDoAtaque(arma, fracao, config = poseDosBonecos.ataques) {
  if (!(fracao >= 0 && fracao < 1)) return { giro: 0, avanco: 0 }
  const golpe = config[arma]
  if (!golpe) return { giro: 0, avanco: 0 }
  // sobe depressa (até "pico") e volta devagar
  const ida = fracao < golpe.pico ? fracao / golpe.pico : 1 - (fracao - golpe.pico) / (1 - golpe.pico)
  if (arma === 'espada') {
    // varrida: de trás (giroInicial) até a frente (giroFinal), e volta ao descanso no fim
    const t = Math.min(1, fracao / golpe.pico)
    const varrida = golpe.giroInicial + (golpe.giroFinal - golpe.giroInicial) * t
    const volta = fracao < golpe.pico ? 1 : 1 - (fracao - golpe.pico) / (1 - golpe.pico)
    return { giro: varrida * volta, avanco: golpe.avanco * ida }
  }
  return { giro: golpe.giro * ida, avanco: golpe.avanco * ida }
}

// Quanto a corda do arco estica (px), pela carga de 0 a 1
export function puxadaDaCorda(carga, config = poseDosBonecos.arco) {
  return Math.min(1, Math.max(0, carga)) * config.puxadaMaxima
}
