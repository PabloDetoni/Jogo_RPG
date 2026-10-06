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
export function calcularFimDaPartida(fim, distanciaAteABorda) {
  const base = pontuacaoBase(fim)
  const resultado = decidirResultado({ como: fim.como, houveDesmaio: fim.houveDesmaio, pontuacaoBase: base })
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
