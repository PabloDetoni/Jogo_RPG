import { minijogos } from '../dados/balanceamento.js'
import { dadosDosMinijogos } from '../dados/minijogos.js'
import { porNaMochila } from './mochila.js'
import { nomeDoItem } from './textosDosItens.js'
import { dividirXp, ganharXp } from './xp.js'

// MINIJOGOS DO PLANALTO (Fase 4, TASK-080 e TASK-081; RF54). As regras de cada um são passos puros (o tempo e o sorteio
// vêm de fora), para a tela só desenhar e para dar para testar. O resultado de uma rodada vai para o progresso por
// aplicarMinijogo: os recursos para a Mochila do Reino e o XP dividido entre todos os permanentes (RF50). Não é partida.

const entre = ([minimo, maximo], sorteio) => minimo + sorteio() * (maximo - minimo)

// ---------- Fazenda: canteiros que crescem, ficam maduros um tempo e murcham ----------
// canteiro = { estado: 'crescendo' | 'madura' | 'murcha', ate } (até quando fica nesse estado)
export function comecarFazenda(agora, sorteio) {
  const config = minijogos.fazenda
  return Array.from({ length: config.canteiros }, () => ({ estado: 'crescendo', ate: agora + entre(config.msCrescendo, sorteio) }))
}

export function avancarFazenda(canteiros, agora, sorteio) {
  const config = minijogos.fazenda
  return canteiros.map((canteiro) => {
    if (agora < canteiro.ate) return canteiro
    if (canteiro.estado === 'crescendo') return { estado: 'madura', ate: agora + config.msMadura }
    if (canteiro.estado === 'madura') return { estado: 'murcha', ate: agora + config.msMurcha }
    return { estado: 'crescendo', ate: agora + entre(config.msCrescendo, sorteio) }
  })
}

// Clicar num canteiro: só a planta madura dá ponto; o canteiro volta a crescer
export function colherNaFazenda(canteiros, indice, agora, sorteio) {
  if (canteiros[indice]?.estado !== 'madura') return { canteiros, ponto: false }
  const novos = canteiros.map((canteiro, i) => (i === indice ? { estado: 'crescendo', ate: agora + entre(minijogos.fazenda.msCrescendo, sorteio) } : canteiro))
  return { canteiros: novos, ponto: true }
}

// ---------- Mina: uma pedra por vez, num lugar sorteado, que quebra com alguns cliques ----------
export function novaPedra(sorteio) {
  return { x: 10 + sorteio() * 80, y: 15 + sorteio() * 70, golpes: minijogos.mina.cliquesPorPedra }
}

export function baterNaPedra(pedra, sorteio) {
  if (pedra.golpes > 1) return { pedra: { ...pedra, golpes: pedra.golpes - 1 }, ponto: false }
  return { pedra: novaPedra(sorteio), ponto: true }
}

// ---------- Lago: a boia espera, afunda (dá para fisgar por um instante) e, puxando antes, o peixe foge ----------
// boia = { estado: 'esperando' | 'fisgando' | 'assustado', ate }
export function comecarLago(agora, sorteio) {
  return { estado: 'esperando', ate: agora + entre(minijogos.lago.msEsperando, sorteio) }
}

export function avancarLago(boia, agora, sorteio) {
  if (agora < boia.ate) return boia
  if (boia.estado === 'esperando') return { estado: 'fisgando', ate: agora + minijogos.lago.msFisgando }
  return comecarLago(agora, sorteio) // passou o instante (ou acabou o susto): espera de novo
}

export function puxarNoLago(boia, agora, sorteio) {
  if (boia.estado === 'fisgando' && agora < boia.ate) return { boia: comecarLago(agora, sorteio), ponto: true }
  if (boia.estado === 'esperando') return { boia: { estado: 'assustado', ate: agora + minijogos.lago.msAssustado }, ponto: false }
  return { boia, ponto: false }
}

// ---------- Resultado ----------

// Cada ponto dá 1 do recurso do lugar e, com a chance do raro, também 1 do raro (sorteado ponto a ponto)
export function sortearRaros(jogo, pontos, sorteio) {
  let raros = 0
  for (let i = 0; i < pontos; i++) if (sorteio() < minijogos[jogo].chanceDoRaro) raros++
  return raros
}

// O que uma rodada rende: { itens: { id: quantidade }, xp }
export function recompensaDaRodada(jogo, pontos, raros) {
  const dados = dadosDosMinijogos[jogo]
  const certos = Math.max(0, Math.min(minijogos.pontosNoMaximo, Math.floor(pontos)))
  const extras = Math.max(0, Math.min(certos, Math.floor(raros)))
  const itens = {}
  if (certos > 0) itens[dados.item] = certos
  if (extras > 0) itens[dados.raro] = (itens[dados.raro] ?? 0) + extras
  return { itens, xp: certos * minijogos[jogo].xpPorPonto }
}

// Aplica a rodada no progresso (operação do Reino: só fora da partida). Recursos para a Mochila do Reino; XP dividido
// entre todos os permanentes, a sobra a partir do Líder (RF50). Não conta partida, não taxa, não gasta contrato.
export function aplicarMinijogo(progresso, jogo, pontos, raros) {
  if (!dadosDosMinijogos[jogo]) return { ok: false, motivo: 'Minijogo desconhecido.' }
  const { itens, xp } = recompensaDaRodada(jogo, pontos, raros)
  const partes = dividirXp(xp, progresso.personagens.map((personagem) => personagem.classe), progresso.lider)
  const personagens = progresso.personagens.map((personagem) => ganharXp(personagem, partes[personagem.classe] ?? 0).personagem)
  const lista = Object.entries(itens).map(([id, quantidade]) => `${quantidade} ${nomeDoItem(id)}`)
  return {
    ok: true,
    progresso: { ...progresso, personagens, mochila: porNaMochila(progresso.mochila, itens) },
    mensagem: lista.length > 0 ? `${dadosDosMinijogos[jogo].nome}: ${lista.join(' e ')} na Mochila e ${xp} XP divididos entre os personagens.` : 'Nada desta vez.',
  }
}
