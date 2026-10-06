// Taxa sobre o ouro ganho na partida (Conceito §12.2, RF48), em pontos percentuais.
// Entre o início e a borda do bioma a taxa cresce em linha reta com a distância:
//   taxa(d) = início + (borda − início) × d ÷ distância até a borda
// e cada taxa é truncada (3,5% vira 3%). O "meio" da tabela do Conceito sai dessa conta.
export const taxasDeReferencia = {
  perdido: { inicio: 1, borda: 6 }, // por personagem perdido
  fuga: { inicio: 7, borda: 30 }, // Pedra de Retorno, pela posição do Líder
  todosDesmaiam: { inicio: 10, borda: 40 }, // Derrota, pela posição do Líder
}

// Dentro do domínio de um Boss, soma-se ao valor acima
export const adicionalNoDominioDeBoss = { perdido: 2, fuga: 7, todosDesmaiam: 15 }
