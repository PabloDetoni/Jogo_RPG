import { minimoDaGrandeVitoria, pesosDaPontuacao } from '../dados/balanceamento.js'
import { bonusDaGrandeVitoriaPercentual } from '../dados/regras.js'
import { aplicarTaxa, calcularTaxa } from './taxa.js'

// Pontuação base (RF49): monstros + ouro ganho + recursos + bônus de Boss + tempo ativo, cada parte com o seu peso.
// Valores negativos contam como zero.
export function pontuacaoBase({ monstros = 0, ouroGanho = 0, recursos = 0, bonusDeBoss = 0, segundosAtivos = 0 }) {
  const pesos = pesosDaPontuacao
  const positivo = (valor) => Math.max(0, valor)
  return Math.floor(
    positivo(monstros) * pesos.porMonstro +
      positivo(ouroGanho) * pesos.porOuro +
      positivo(recursos) * pesos.porRecurso +
      positivo(bonusDeBoss) +
      positivo(segundosAtivos) * pesos.porSegundoAtivo,
  )
}

// Resultado da partida (RF47). como: 'retornoNormal', 'fuga', 'liderNaoLevantado' ou 'todosDesmaiaram'.
// Grande Vitória: retorno normal, nenhum desmaio na partida inteira e pontuação base acima do mínimo.
export function decidirResultado({ como, houveDesmaio, pontuacaoBase: base }) {
  if (como === 'todosDesmaiaram') return 'derrota'
  if (como === 'fuga' || como === 'liderNaoLevantado') return 'retornoForcado'
  return !houveDesmaio && base > minimoDaGrandeVitoria ? 'grandeVitoria' : 'vitoria'
}

// +10% da Grande Vitória, arredondado para baixo
function comBonusDaGrandeVitoria(valor) {
  return valor + Math.floor((valor * bonusDaGrandeVitoriaPercentual) / 100)
}

// Todas as contas do fim da partida (RF47, RF48, RF49), para o Resumo.
// fim = { como, houveDesmaio, perdidos, lider, ouroGanho, monstros, recursos, bonusDeBoss, segundosAtivos }
// perdidos e lider: { distancia, noDominioDeBoss } (ver taxa.js)
// fim.resultado (opcional) força o resultado: só os botões de teste usam.
export function calcularFimDaPartida(fim, distanciaAteABorda) {
  const base = pontuacaoBase(fim)
  const resultado = fim.resultado ?? decidirResultado({ como: fim.como, houveDesmaio: fim.houveDesmaio, pontuacaoBase: base })
  const grandeVitoria = resultado === 'grandeVitoria'

  const taxa = grandeVitoria ? 0 : calcularTaxa(fim, distanciaAteABorda)
  const { taxaEmOuro, ouroRecebido } = aplicarTaxa(fim.ouroGanho ?? 0, taxa)

  return {
    resultado,
    taxa, // em pontos percentuais
    taxaEmOuro,
    ouroRecebido: grandeVitoria ? comBonusDaGrandeVitoria(ouroRecebido) : ouroRecebido,
    pontuacaoBase: base,
    pontuacaoFinal: grandeVitoria ? comBonusDaGrandeVitoria(base) : Math.floor((base * (100 - taxa)) / 100),
  }
}

// Como a partida acabou quando um botão de teste força o resultado (a taxa segue o jeito de cada um)
export const comoPeloResultado = {
  grandeVitoria: 'retornoNormal',
  vitoria: 'retornoNormal',
  retornoForcado: 'fuga',
  derrota: 'todosDesmaiaram',
}

const distanciaEntre = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

// Monta as contas do fim a partir do que a partida contou, com as posições em pixels do mapa:
// dados = { como, resultado?, houveDesmaio, perdidos, caidosNoFim, lider, ouroGanho, monstros, recursos, segundosAtivos }
//   perdidos: quem a Pedra de Retorno levou durante a partida ({ classe, x, y }, onde caiu)
//   caidosNoFim: quem estava desmaiado no instante do fim (o Líder entra aqui quando não foi levantado)
//   lider: { x, y } (para a fuga e para todos desmaiam)
// lugar = { inicio, distanciaAteABorda }: o ponto inicial do bioma e a distância até a borda.
// Quem estava caído no fim conta como perdido (RF48); com o Líder não levantado, ele também (Conceito §12).
// Devolve as contas de calcularFimDaPartida, o "como" e as classes que contaram como perdidas.
export function montarFimDaPartida(dados, { inicio, distanciaAteABorda }) {
  const como = dados.como ?? comoPeloResultado[dados.resultado] ?? 'retornoNormal'
  const lugar = (ponto) => ({ distancia: distanciaEntre(inicio, ponto), noDominioDeBoss: Boolean(ponto.noDominioDeBoss) })
  const perdidos = [...(dados.perdidos ?? []), ...(dados.caidosNoFim ?? [])]
  const contas = calcularFimDaPartida(
    {
      como,
      resultado: dados.resultado,
      houveDesmaio: Boolean(dados.houveDesmaio) || perdidos.length > 0,
      perdidos: perdidos.map(lugar),
      lider: lugar(dados.lider ?? inicio),
      ouroGanho: dados.ouroGanho ?? 0,
      monstros: dados.monstros ?? 0,
      recursos: dados.recursos ?? 0,
      bonusDeBoss: dados.bonusDeBoss ?? 0,
      segundosAtivos: dados.segundosAtivos ?? 0,
    },
    distanciaAteABorda,
  )
  return { como, ...contas, perdidos: perdidos.map((perdido) => perdido.classe) }
}
