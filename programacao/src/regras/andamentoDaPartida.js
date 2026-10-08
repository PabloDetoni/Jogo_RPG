// Andamento da partida (parte 5c: TASK-040, TASK-041, TASK-048). Funções puras.
// "Em combate", o retorno normal com Q (15 s), a fuga com F (5 s), o tempo ativo, o XP de cada abate e o custo da fuga.
// O tempo vem do relógio da partida, que para na pausa (CenaArena.agora), em milissegundos.

import { aplicarTaxa, taxaNaDistancia } from './taxa.js'
import { dividirXp, ganharXp, xpParaSubir } from './xp.js'

const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

// ---------- Em combate (RF37) e tempo ativo (RF49) ----------

// Alguém do grupo causou ou recebeu dano há menos de msDepoisDoDano? ultimoDano = null: ainda não houve dano.
export function danoRecente(agora, ultimoDano, msDepoisDoDano) {
  return ultimoDano !== null && agora - ultimoDano < msDepoisDoDano
}

// Em combate: dano recente ou algum mob hostil perseguindo o grupo
export function estaEmCombate({ agora, ultimoDano, perseguidores }, msDepoisDoDano) {
  return perseguidores > 0 || danoRecente(agora, ultimoDano, msDepoisDoDano)
}

// Tempo ativo (Conceito §12): só conta o tempo com dano nos últimos 5 s. Ficar parado ou correr de um mob
// sem levar dano não conta.
export function somarTempoAtivo(msAtivos, { agora, ultimoDano, ms }, msDepoisDoDano) {
  return danoRecente(agora, ultimoDano, msDepoisDoDano) ? msAtivos + ms : msAtivos
}

// ---------- Retorno normal com Q (RF45) ----------
// retorno: null (parado) ou { msRestantes, interrompido } (interrompido = o combate fez a contagem voltar).

// Q aperta: começa fora de combate e cancela se já está contando. A fuga em andamento manda mais que o Q.
// aviso (para o HUD): 'comecou', 'cancelado', 'emCombate' (não começa em combate) ou 'fugindo'.
export function alternarRetorno(retorno, { emCombate, fugindo }, msTotal) {
  if (fugindo) return { retorno, aviso: 'fugindo' }
  if (retorno) return { retorno: null, aviso: 'cancelado' }
  if (emCombate) return { retorno: null, aviso: 'emCombate' }
  return { retorno: { msRestantes: msTotal, interrompido: false }, aviso: 'comecou' }
}

// A cada quadro: em combate, a contagem volta ao começo e fica parada; fora dele, corre. terminou = chegou a 0.
export function avancarRetorno(retorno, { emCombate, ms }, msTotal) {
  if (!retorno) return { retorno, terminou: false }
  if (emCombate) return { retorno: { msRestantes: msTotal, interrompido: true }, terminou: false }
  const msRestantes = Math.max(0, retorno.msRestantes - ms)
  return { retorno: { msRestantes, interrompido: false }, terminou: msRestantes === 0 }
}

// ---------- Fuga com F (RF46) ----------
// fuga: null ou { msRestantes }. Só existe uma fuga por partida, e confirmada ela não se cancela (decisão de 07/10).

export function comecarFuga(fuga, msTotal) {
  return fuga ?? { msRestantes: msTotal }
}

// A contagem corre até em combate
export function avancarFuga(fuga, ms) {
  if (!fuga) return { fuga, terminou: false }
  const msRestantes = Math.max(0, fuga.msRestantes - ms)
  return { fuga: { msRestantes }, terminou: msRestantes === 0 }
}

// Segundos inteiros para mostrar numa contagem (14,2 s aparece como 15)
export function segundosDaContagem(ms) {
  return Math.ceil(ms / 1000)
}

// Custo da fuga agora (RF46): a taxa de fuga pela distância do Líder ao ponto inicial do bioma e quanto ela
// tira do ouro ganho até aqui
export function custoDaFuga({ lider, inicio, ouroGanho, noDominioDeBoss = false }, distanciaAteABorda) {
  const taxa = taxaNaDistancia('fuga', distancia(inicio, lider), distanciaAteABorda, noDominioDeBoss)
  return { taxa, ouro: aplicarTaxa(ouroGanho, taxa).taxaEmOuro }
}

// ---------- XP de cada monstro (RF50) ----------

// Quem recebe o XP de um monstro: os permanentes de pé. O temporário, quem está caído e o perdido não recebem.
// membros: [{ classe, temporario, caido, perdido }]
export function quemRecebeXp(membros) {
  return membros.filter((membro) => !membro.temporario && !membro.caido && !membro.perdido).map((membro) => membro.classe)
}

// Divide o XP de um abate (a sobra vai de 1 em 1, começando pelo Líder) e soma ao que cada um ganhou na partida.
// xpDaPartida: classe → XP ganho até agora. Devolve o novo e as partes deste abate.
export function somarXpDoAbate(xpDaPartida, xp, membros, lider) {
  const partes = dividirXp(xp, quemRecebeXp(membros), lider)
  const novo = { ...xpDaPartida }
  for (const [classe, parte] of Object.entries(partes)) novo[classe] = (novo[classe] ?? 0) + parte
  return { xpDaPartida: novo, partes }
}

// Nível que o personagem terá no fim com o XP ganho até agora. Serve para o aviso "subiu de nível" na hora;
// o nível novo só vale a partir da próxima partida, porque o progresso não muda durante a partida (RF12).
// personagem: { nivel, xp } como está no save.
export function nivelComOXpDaPartida(personagem, xpGanho) {
  return ganharXp(personagem, xpGanho).personagem.nivel
}

// XP que ainda falta para o próximo nível, contando o que já foi ganho na partida (botão de teste "Subir nível").
// No nível máximo, 0.
export function xpParaOProximoNivel(personagem, xpGanho) {
  const { personagem: agora } = ganharXp(personagem, xpGanho)
  const falta = xpParaSubir(agora.nivel)
  return Number.isFinite(falta) ? falta - agora.xp : 0
}
