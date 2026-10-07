import { combateDeTeste } from '../dados/balanceamento.js'

// Mana e habilidades ativas na partida (TASK-046, RF38). Funções puras.
// A mana volta sozinha (a Sabedoria define a velocidade); a vida não volta sozinha.

const { mana: configDaMana } = combateDeTeste

// Mana máxima pela Inteligência (Tanque, Guerreiro e Arqueiro começam com bem menos)
export function manaMaxima(inteligencia) {
  return Math.round(configDaMana.base + Math.max(0, inteligencia) * configDaMana.porInteligencia)
}

// Quanto de mana volta por segundo, pela Sabedoria
export function manaPorSegundo(sabedoria) {
  return configDaMana.regeneracaoBase + Math.max(0, sabedoria) * configDaMana.regeneracaoPorSabedoria
}

export function regenerarMana(mana, maxima, porSegundo, segundos) {
  return Math.min(maxima, mana + porSegundo * Math.max(0, segundos))
}

// Dá para usar a habilidade da tecla agora? Sem habilidade na tecla, em recarga, sem mana ou (como a
// Ressurreição sem ninguém caído por perto) sem alvo: não usa, e o motivo vira o aviso para o jogador.
// ultimoUso = null quer dizer que nunca foi usada.
export function podeUsarHabilidade({ habilidade, mana, agora, ultimoUso, temAlvo = true }) {
  if (!habilidade) return { ok: false, motivo: 'vazio' }
  if (ultimoUso !== null && agora - ultimoUso < habilidade.recargaMs) return { ok: false, motivo: 'recarga' }
  if (mana < habilidade.custoDeMana) return { ok: false, motivo: 'semMana' }
  if (!temAlvo) return { ok: false, motivo: 'semAlvo' }
  return { ok: true }
}

export const avisoDoMotivo = {
  vazio: 'TECLA VAZIA',
  recarga: 'EM RECARGA',
  semMana: 'SEM MANA',
  semAlvo: 'NINGUÉM CAÍDO PERTO',
}

export function gastarMana(mana, custo) {
  return Math.max(0, mana - custo)
}
