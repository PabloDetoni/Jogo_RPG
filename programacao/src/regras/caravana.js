// A Caravana (RF56, Parte 7 de 11/2026). Funções puras.
// Substitui o Ponto de partida (RF32): o grupo pode começar a partida no início do bioma (de graça) ou pagar para a
// Caravana levá-lo a uma zona neutra mais à frente (nunca dentro de uma região). Parte 11 (Pablo, 26/11): cada parada
// custa perto do ouro de uma partida inteira típica na região perto dela (o ouro das fichas de hoje, fichaDoMob). A
// Caravana está sempre disponível: só o preço barra. O ouro é reservado no "Começar partida" e só sai do progresso no
// fim da partida (como os itens levados da Mochila do Reino): se a partida cair, nada é cobrado (RF12).
import { caravana, mundo } from '../dados/balanceamento.js'
import { fichaDoMob } from './mobs.js'

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

// Os mobs de uma região do bioma, { tipo: quantos }: os soltos (com a matilha de cada Lobo Alfa), os dos acampamentos
// e do forte (com os arqueiros das torres) e, no domínio do chefe, o chefe
export function mobsDaRegiaoDoBioma(bioma, idDaRegiao, config = mundo) {
  const mobs = {}
  const somar = (tipo, n) => (mobs[tipo] = (mobs[tipo] ?? 0) + n)
  for (const [tipo, n] of Object.entries(bioma.populacao?.[idDaRegiao] ?? {})) {
    somar(tipo, n)
    const matilha = config.mobs[tipo]?.matilha
    if (matilha) somar('lobo', n * matilha.lobos)
  }
  for (const acampamento of (bioma.acampamentos ?? []).filter((um) => um.regiao === idDaRegiao)) {
    for (const [tipo, n] of Object.entries(acampamento.populacao)) somar(tipo, n)
    if (acampamento.arqueirosNasTorres) somar('goblinArqueiro', 4) // uma torre em cada canto
  }
  if (bioma.regioes?.find((regiao) => regiao.id === idDaRegiao)?.dificuldade === 'boss') somar('chefe', 1)
  return mobs
}

// O ouro de uma partida típica na região: "fracaoDosMobs" do ouro de todos os mobs dela (pela ficha na dificuldade da
// região) mais o chefe inteiro (quem vai ao domínio vai pelo chefe)
export function ouroDaPartidaTipica(bioma, idDaRegiao, config = caravana, configDoMundo = mundo) {
  const dificuldade = bioma.regioes?.find((regiao) => regiao.id === idDaRegiao)?.dificuldade ?? 'facil'
  let ouro = 0
  for (const [tipo, n] of Object.entries(mobsDaRegiaoDoBioma(bioma, idDaRegiao, configDoMundo))) {
    if (tipo === 'chefe') ouro += configDoMundo.ogro?.ouro ?? 0
    else ouro += fichaDoMob(tipo, dificuldade, configDoMundo).ouro * n * config.fracaoDosMobs
  }
  return ouro
}

// O preço de uma parada: o começo do caminho é de graça; as outras, o ouro de uma partida típica na região perto dela,
// arredondado para múltiplos de "arredondar". Parada desconhecida (um ponto de partida antigo, de antes da Caravana) ou
// sem região perto: de graça.
export function precoDaParada(bioma, parada, config = caravana, configDoMundo = mundo) {
  if (!parada || parada.regiao === bioma.ordemDoCaminho?.[0] || !parada.regiaoPerto) return 0
  return Math.round(ouroDaPartidaTipica(bioma, parada.regiaoPerto, config, configDoMundo) / config.arredondar) * config.arredondar
}

// As paradas do bioma com o preço de cada uma (na ordem do caminho); uma parada mais longe nunca custa menos que a de
// antes (senão começar mais à frente sairia mais barato)
export function paradasComPreco(bioma, config = caravana, configDoMundo = mundo) {
  if (!bioma?.caravana) return []
  let antes = 0
  return bioma.caravana.map((parada) => {
    const preco = Math.max(antes, precoDaParada(bioma, parada, config, configDoMundo))
    antes = preco
    return { ...parada, preco }
  })
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
