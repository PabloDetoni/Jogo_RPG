import { mundo } from '../dados/balanceamento.js'

// ITENS NO CHÃO DA PARTIDA (ajustes de 14/10/2026). Dois tipos:
// - natural: os recursos do mapa (cogumelos, ervas, madeira...). Fica no lugar até alguém pegar e nunca some sozinho.
// - dropado: drop de monstro e item descartado. Some 30 s depois de cair (mundo.coleta.msDoItemDropado), piscando nos
//   últimos 5 s. Pegar e descartar de novo faz ele cair com um tempo novo.
// O que não coube na mochila fica como estava (o natural continua natural; o dropado continua com o tempo que tinha).
// No fim da partida, o que ficou no chão se perde: só a mochila da partida vai para o save (regras/ganhosDaPartida.js).
// jaColetado: o item já foi pego uma vez nesta partida (foi descartado depois); pegar de novo não conta outra vez para
// a missão nem para os recursos da pontuação.

export const tiposDeItemNoChao = { natural: 'natural', dropado: 'dropado' }

// O item natural do mapa: sem tempo
export function itemNatural() {
  return { tipo: tiposDeItemNoChao.natural, caiuEm: null, expiraEm: null, jaColetado: false }
}

// O drop de um monstro: some msDoItemDropado depois de cair
export function itemDropado(agora, ms = mundo.coleta.msDoItemDropado) {
  return { tipo: tiposDeItemNoChao.dropado, caiuEm: agora, expiraEm: agora + ms, jaColetado: false }
}

// O item que o jogador descartou da mochila da partida (natural ou não, ele já foi pego): vira dropado, com tempo novo
export function itemDescartado(agora, ms = mundo.coleta.msDoItemDropado) {
  return { ...itemDropado(agora, ms), jaColetado: true }
}

export function expirou(noChao, agora) {
  return noChao.expiraEm !== null && agora >= noChao.expiraEm
}

// Quanto tempo falta (ms; Infinity no natural)
export function tempoRestante(noChao, agora) {
  return noChao.expiraEm === null ? Infinity : Math.max(0, noChao.expiraEm - agora)
}

// A fração do tempo que falta, de 1 (acabou de cair) a 0 (vai sumir): o anel em volta do item dropado. 1 no natural.
export function fracaoRestante(noChao, agora) {
  if (noChao.expiraEm === null) return 1
  const total = noChao.expiraEm - noChao.caiuEm
  return total > 0 ? Math.min(1, Math.max(0, (noChao.expiraEm - agora) / total)) : 0
}

// Pisca nos últimos segundos (mundo.coleta.msPiscando), alternando a cada msDoPisca
export function estaPiscando(noChao, agora, { msPiscando, msDoPisca } = mundo.coleta) {
  const falta = tempoRestante(noChao, agora)
  return falta > 0 && falta <= msPiscando && Math.floor(agora / msDoPisca) % 2 === 0
}

// Pegar conta para a missão e para os recursos só na primeira vez
export function contaAoPegar(noChao) {
  return !noChao.jaColetado
}
