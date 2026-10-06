import { adicionalNoDominioDeBoss, taxasDeReferencia } from '../dados/taxas.js'

// Folga para conta com número quebrado não cair um ponto abaixo (ex.: 2,9999999 em vez de 3)
const folga = 1e-9

// Taxa de uma situação ('perdido', 'fuga' ou 'todosDesmaiam') a uma distância do ponto inicial
// do bioma, em pontos percentuais inteiros (RF48). Depois da borda, vale a taxa da borda.
export function taxaNaDistancia(situacao, distancia, distanciaAteABorda, noDominioDeBoss = false) {
  if (!(distanciaAteABorda > 0)) throw new Error('A distância até a borda precisa ser maior que zero')
  const { inicio, borda } = taxasDeReferencia[situacao]
  const fracao = Math.min(Math.max(distancia / distanciaAteABorda, 0), 1)
  const taxa = Math.floor(inicio + (borda - inicio) * fracao + folga) // truncada: 3,5% vira 3%
  return taxa + (noDominioDeBoss ? adicionalNoDominioDeBoss[situacao] : 0)
}

// Taxa final da partida, pela situação do fim (RF48). Cada lugar é { distancia, noDominioDeBoss }.
// - como 'fuga' ou 'todosDesmaiaram': uma taxa só, pela posição do Líder, no lugar das dos perdidos;
// - nos outros casos: soma das taxas de cada perdido, cada uma já truncada.
// Quem estiver desmaiado no instante do fim conta como perdido: quem chama já o coloca na lista.
export function calcularTaxa({ como, perdidos = [], lider }, distanciaAteABorda) {
  if (como === 'fuga') return taxaNaDistancia('fuga', lider.distancia, distanciaAteABorda, lider.noDominioDeBoss)
  if (como === 'todosDesmaiaram') {
    return taxaNaDistancia('todosDesmaiam', lider.distancia, distanciaAteABorda, lider.noDominioDeBoss)
  }
  return perdidos.reduce(
    (soma, perdido) => soma + taxaNaDistancia('perdido', perdido.distancia, distanciaAteABorda, perdido.noDominioDeBoss),
    0,
  )
}

// Desconta a taxa só do ouro ganho na partida; o que o jogador já tinha não é tocado.
// A taxa em moedas é arredondada para baixo, a favor do jogador.
// Ouro ganho negativo conta como zero.
export function aplicarTaxa(ouroGanho, taxaPercentual) {
  const ganho = Math.max(0, Math.floor(ouroGanho))
  const taxaEmOuro = Math.floor((ganho * taxaPercentual) / 100)
  return { taxaEmOuro, ouroRecebido: ganho - taxaEmOuro }
}
