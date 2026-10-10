import { atributoMaximo, equipamentoNaPartida } from '../dados/balanceamento.js'
import { nomeDaClasse } from '../dados/classes.js'
import { itemDoCatalogo } from '../dados/itens.js'

// EQUIPAMENTO (Fase 4, TASK-075; RF22): quem pode usar cada peça e o que ela soma na partida.
// equipamento de um personagem = { espaco: id do item } (estado/progresso.js).

// Armadura serve para todas as classes; arma e escudo, só para as da lista do item
export function podeEquipar(item, classe) {
  if (!item || item.tipo !== 'equipamento') return { ok: false, motivo: 'Isso não é equipamento.' }
  if (item.classes !== 'todas' && !item.classes.includes(classe)) {
    return { ok: false, motivo: `${item.nome} é só para ${item.classes.map(nomeDaClasse).join(', ')}.` }
  }
  return { ok: true }
}

// A soma das peças equipadas: pontos de atributo, defesa e redução de recarga (com teto). Id fora do catálogo não conta.
export function bonusDoEquipamento(equipamento) {
  const atributos = {}
  let defesa = 0
  let reducaoDeRecarga = 0
  for (const id of Object.values(equipamento ?? {})) {
    const item = itemDoCatalogo(id)
    if (item?.tipo !== 'equipamento') continue
    for (const [atributo, valor] of Object.entries(item.bonus ?? {})) atributos[atributo] = (atributos[atributo] ?? 0) + valor
    defesa += item.defesa ?? 0
    reducaoDeRecarga += item.reducaoDeRecarga ?? 0
  }
  return { atributos, defesa, reducaoDeRecarga: Math.min(equipamentoNaPartida.reducaoDeRecargaMaxima, reducaoDeRecarga) }
}

// Os atributos do personagem com os do equipamento somados (cada um até o máximo)
export function atributosComEquipamento(atributos, equipamento) {
  const { atributos: bonus } = bonusDoEquipamento(equipamento)
  return Object.fromEntries(Object.entries(atributos).map(([id, valor]) => [id, Math.min(atributoMaximo, valor + (bonus[id] ?? 0))]))
}

// Quanto do dano a defesa tira (uma fração, com teto)
export function reducaoPelaDefesa(defesa) {
  return Math.min(equipamentoNaPartida.reducaoMaximaPelaDefesa, Math.max(0, defesa) * equipamentoNaPartida.reducaoPorPontoDeDefesa)
}
