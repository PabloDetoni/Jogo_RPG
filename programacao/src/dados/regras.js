// Números que a documentação já fixa. Os provisórios (balanceamento) ficam em balanceamento.js;
// as taxas, em taxas.js.

// Retorno normal ao Reino (tecla Q ou pausa): contagem fora de combate (RF45).
export const segundosRetornoNormal = 15

// Salvamento automático no navegador (RF09).
export const segundosEntreSalvamentosAutomaticos = 3 * 60

// Nível de cada personagem (RF55).
export const nivelInicial = 1
export const nivelMaximo = 100

// Grande Vitória: +10% no ouro e na pontuação (RF47, RF49).
export const bonusDaGrandeVitoriaPercentual = 10

// Habilidades: cada uma vai do nível 1 ao 5; no máximo 3 ativas por personagem (RF24).
export const nivelMaximoDaHabilidade = 5
export const habilidadesAtivasNoMaximo = 3

// Abandonar uma missão custa 10% do ouro da recompensa (RF28).
export const multaPorAbandonoPercentual = 10

// Desmaio (RF43, Conceito §11.7): quem fica sem vida tem 30 s para ser levantado. A ajuda de um aliado
// (ou do Líder) leva 5 s com a área limpa e devolve cerca de 10% da vida.
export const segundosParaLevantar = 30
export const segundosDaAjuda = 5
export const vidaAoSerAjudadoPercentual = 10
