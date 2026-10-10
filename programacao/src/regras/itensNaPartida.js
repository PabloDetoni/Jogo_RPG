import { itemDoCatalogo, usavelNaPartida } from '../dados/itens.js'

// ITENS NA PARTIDA (Fase 4, TASK-047; RF41): Tab abre a mochila da partida sem pausar; E usa o item escolhido no Líder e
// R usa num aliado (PROVISÓRIO, decisão em aberto no card: o aliado mais perto da mira). A partida só aplica o que
// esta regra devolve.

// Quem recebe com R: o aliado de pé mais perto do ponto da mira (o mouse no mapa). Sem aliado de pé, ninguém.
export function aliadoPelaMira(aliados, ponto) {
  let melhor = null
  let menor = Infinity
  for (const aliado of aliados) {
    if (aliado.caido) continue
    const distancia = Math.hypot(aliado.x - ponto.x, aliado.y - ponto.y)
    if (distancia < menor) {
      menor = distancia
      melhor = aliado
    }
  }
  return melhor
}

// O que acontece ao usar o item em alguém ({ vida, vidaMaxima, mana, manaMaxima, caido }).
// Devolve { ok: true, mudancas, texto } ou { ok: false, motivo, texto }. Nada é gasto quando não dá:
// - poção não levanta quem desmaiou (RF41);
// - poção de vida com a vida cheia (ou de mana com a mana cheia) não é desperdiçada.
// mudancas: { vida } | { mana } | { efeito: { tipo: 'velocidade' | 'recarga', multiplicador, ate } }
export function usarItemEm(item, alvo, agora) {
  if (!usavelNaPartida(item)) return { ok: false, motivo: 'naoUsavel', texto: 'Este item não se usa na partida' }
  if (alvo.caido) return { ok: false, motivo: 'caido', texto: `${item.nome} não levanta quem desmaiou` }
  const { efeito } = item
  if (efeito.tipo === 'vida') {
    if (alvo.vida >= alvo.vidaMaxima) return { ok: false, motivo: 'vidaCheia', texto: 'A vida já está cheia' }
    const vida = Math.min(alvo.vidaMaxima, alvo.vida + Math.round(alvo.vidaMaxima * efeito.fracao))
    return { ok: true, mudancas: { vida }, texto: `+${vida - alvo.vida} de vida` }
  }
  if (efeito.tipo === 'mana') {
    if (alvo.mana >= alvo.manaMaxima) return { ok: false, motivo: 'manaCheia', texto: 'A mana já está cheia' }
    const mana = Math.min(alvo.manaMaxima, alvo.mana + Math.round(alvo.manaMaxima * efeito.fracao))
    return { ok: true, mudancas: { mana }, texto: `+${Math.round(mana - alvo.mana)} de mana` }
  }
  // Aceleradores: valem por um tempo; usar de novo renova o tempo
  const texto = efeito.tipo === 'velocidade' ? `Mais rápido por ${Math.round(efeito.ms / 1000)} s` : `Recargas mais rápidas por ${Math.round(efeito.ms / 1000)} s`
  return { ok: true, mudancas: { efeito: { tipo: efeito.tipo, multiplicador: efeito.multiplicador, ate: agora + efeito.ms } }, texto }
}

// O multiplicador de um efeito de acelerador que ainda vale (1 quando não há ou já acabou)
export function multiplicadorAtivo(efeitos, tipo, agora) {
  const efeito = efeitos?.[tipo]
  return efeito && agora < efeito.ate ? efeito.multiplicador : 1
}

// Recarga de uma habilidade com o Elixir do foco (multiplicador < 1) e a redução do equipamento (Fase 4, 4f)
export function recargaComEfeitos(recargaMs, multiplicador = 1, reducaoDoEquipamento = 0) {
  return Math.round(recargaMs * multiplicador * (1 - reducaoDoEquipamento))
}

// Os itens da mochila da partida na ordem da janela do Tab: primeiro os que se usam (poções e aceleradores), cada um
// com os dados do catálogo em "dado" (um id fora do catálogo não aparece)
export function itensDaJanela(itens) {
  const lista = (itens ?? []).map((item) => ({ ...item, dado: itemDoCatalogo(item.id) })).filter((item) => item.dado)
  return [...lista.filter((item) => usavelNaPartida(item.dado)), ...lista.filter((item) => !usavelNaPartida(item.dado))]
}
