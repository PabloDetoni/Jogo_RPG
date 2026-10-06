import { curvaDeXp, pontosDeAtributoPorNivel, pontosDeHabilidadePorNivel } from '../dados/balanceamento.js'
import { nivelInicial, nivelMaximo } from '../dados/regras.js'

// XP para passar do nível "nivel" para o seguinte (RF55). No nível máximo não há próximo.
export function xpParaSubir(nivel) {
  if (nivel >= nivelMaximo) return Infinity
  return Math.round(curvaDeXp.base * nivel ** curvaDeXp.expoente)
}

// XP somado desde o nível inicial até chegar ao nível pedido
export function xpTotalAteONivel(nivel) {
  let total = 0
  for (let n = nivelInicial; n < Math.min(nivel, nivelMaximo); n++) total += xpParaSubir(n)
  return total
}

// Divide o XP igualmente entre quem recebe (RF50), em números inteiros.
// A sobra vai um a um para os primeiros, começando pelo Líder; assim nada se perde.
// quemRecebe: classes dos permanentes que recebem (sem desmaiados, perdidos nem contratados temporários).
export function dividirXp(xp, quemRecebe, lider = null) {
  const ordem = quemRecebe.includes(lider) ? [lider, ...quemRecebe.filter((classe) => classe !== lider)] : [...quemRecebe]
  const partes = {}
  if (ordem.length === 0) return partes
  const total = Math.max(0, Math.floor(xp))
  const cadaUm = Math.floor(total / ordem.length)
  let sobra = total - cadaUm * ordem.length
  for (const classe of ordem) {
    partes[classe] = cadaUm + (sobra > 0 ? 1 : 0)
    if (sobra > 0) sobra--
  }
  return partes
}

// Dá XP a um personagem: sobe quantos níveis der e soma os pontos ganhos (RF55).
// "xp" do personagem é o que ele já juntou dentro do nível atual. No nível máximo, o XP a mais é descartado.
export function ganharXp(personagem, xp) {
  let nivel = personagem.nivel
  let acumulado = personagem.xp + Math.max(0, Math.floor(xp))
  let niveisGanhos = 0
  while (nivel < nivelMaximo && acumulado >= xpParaSubir(nivel)) {
    acumulado -= xpParaSubir(nivel)
    nivel++
    niveisGanhos++
  }
  if (nivel >= nivelMaximo) acumulado = 0

  return {
    niveisGanhos,
    personagem: {
      ...personagem,
      nivel,
      xp: acumulado,
      pontosDeAtributo: (personagem.pontosDeAtributo ?? 0) + niveisGanhos * pontosDeAtributoPorNivel,
      pontosDeHabilidade: (personagem.pontosDeHabilidade ?? 0) + niveisGanhos * pontosDeHabilidadePorNivel,
    },
  }
}
