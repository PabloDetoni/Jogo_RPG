// A Caravana (RF56, Parte 7 de 11/2026). Funções puras.
// Substitui o Ponto de partida (RF32): o grupo pode começar a partida no início do bioma (de graça) ou pagar para a
// Caravana levá-lo a uma zona neutra mais à frente (nunca dentro de uma região). O preço é alto e cresce com a
// distância ANDADA pelo caminho (a soma dos trechos entre os inícios das zonas, na ordem do caminho em "S"; a distância
// em linha reta não serve, porque o "S" volta para perto do começo). A Caravana está sempre disponível: só o preço
// barra. O ouro é reservado no "Começar partida" e só sai do progresso no fim da partida (como os itens levados da
// Mochila do Reino): se a partida cair, nada é cobrado (RF12).
import { caravana } from '../dados/balanceamento.js'

// A distância andada do começo do caminho até o início da zona "id" (px). ordem: os ids das zonas na ordem do caminho;
// regioes: [{ id, inicio: { x, y } }]. Zona fora do caminho: null.
export function distanciaPeloCaminho(regioes, ordem, id) {
  const fim = ordem.indexOf(id)
  if (fim < 0) return null
  const inicio = (idDaZona) => regioes.find((regiao) => regiao.id === idDaZona)?.inicio
  let soma = 0
  for (let i = 1; i <= fim; i++) {
    const a = inicio(ordem[i - 1])
    const b = inicio(ordem[i])
    if (!a || !b) return null
    soma += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return soma
}

// O preço de uma parada: o começo do caminho é de graça; as outras, base + porMilPx por 1.000 px andados, arredondado
// para múltiplos de "arredondar". Parada desconhecida (um ponto de partida antigo, de antes da Caravana): de graça.
export function precoDaParada(regioes, ordem, parada, config = caravana) {
  if (!parada || parada.regiao === ordem[0]) return 0
  const distancia = distanciaPeloCaminho(regioes, ordem, parada.regiao)
  if (distancia === null) return 0
  return Math.round((config.base + (config.porMilPx * distancia) / 1000) / config.arredondar) * config.arredondar
}

// As paradas do bioma com o preço de cada uma (na ordem do caminho)
export function paradasComPreco(bioma, config = caravana) {
  if (!bioma?.caravana) return []
  return bioma.caravana.map((parada) => ({ ...parada, preco: precoDaParada(bioma.regioes, bioma.ordemDoCaminho, parada, config) }))
}

// O preço da parada escolhida (pelo id), ou 0
export function custoDaCaravana(bioma, idDaParada, config = caravana) {
  return paradasComPreco(bioma, config).find((parada) => parada.id === idDaParada)?.preco ?? 0
}

// Dá para viajar? Só o preço barra. Devolve { ok, motivo }.
export function podeViajar(ouro, preco) {
  if (preco <= ouro) return { ok: true, motivo: null }
  return { ok: false, motivo: `Falta ${preco - ouro} de ouro` }
}
