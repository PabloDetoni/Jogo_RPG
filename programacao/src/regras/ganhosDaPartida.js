import { gastarPartidaDosContratos } from './guilda.js'
import { juntarNevoas } from './mundo.js'
import { ganharXp } from './xp.js'

// O que a partida deixa no progresso quando termina (TASK-048), em qualquer resultado (RF50: XP e itens ficam):
// - o ouro recebido (já com a taxa e com o bônus da Grande Vitória);
// - o XP de cada personagem permanente, com os níveis e os pontos de atributo e de habilidade ganhos (RF55);
// - os monstros derrotados e mais uma partida jogada (RF34);
// - cada contrato temporário perde uma partida (RF52);
// - o mapa descoberto (Fase 3, RF40): a névoa revelada e as áreas somam às de antes, e as regiões descobertas
//   liberam o Ponto de partida (RF32);
// - os itens da mochila da partida vão para a Mochila do Reino (RF50: ficam em todos os resultados).
// Vida e mana não ficam no progresso: toda partida começa com elas cheias (RF52).
// fim = { ouroRecebido, xpPorClasse: { classe: xp }, monstros, descobertas: { bioma, nevoa, areas, regioes } | null,
//         itens: [{ id, quantidade }] }
// Devolve o progresso novo e, para o Resumo, o XP de cada permanente com o nível de antes e o de depois.
export function aplicarFimNoProgresso(progresso, { ouroRecebido = 0, xpPorClasse = {}, monstros = 0, descobertas = null, itens = [] }) {
  const xpDosPersonagens = []
  const personagens = progresso.personagens.map((personagem) => {
    const xp = Math.max(0, Math.floor(xpPorClasse[personagem.classe] ?? 0))
    const { personagem: depois, niveisGanhos } = ganharXp(personagem, xp)
    xpDosPersonagens.push({ classe: personagem.classe, xp, nivelAntes: personagem.nivel, nivel: depois.nivel, niveisGanhos })
    return depois
  })
  const { estatisticas } = progresso

  return {
    progresso: {
      ...progresso,
      personagens,
      ouro: progresso.ouro + Math.max(0, Math.floor(ouroRecebido)),
      estatisticas: {
        ...estatisticas,
        partidasJogadas: estatisticas.partidasJogadas + 1,
        monstrosDerrotados: estatisticas.monstrosDerrotados + Math.max(0, Math.floor(monstros)),
      },
      contratosTemporarios: gastarPartidaDosContratos(progresso.contratosTemporarios),
      mochila: juntarNaMochila(progresso.mochila, itens),
      ...juntarDescobertas(progresso, descobertas),
    },
    personagens: xpDosPersonagens,
  }
}

// Itens da partida somados aos da Mochila do Reino (iguais ficam juntos; quantidade quebrada ou zero não entra)
function juntarNaMochila(mochila, itens) {
  const resultado = mochila.map((item) => ({ ...item }))
  for (const item of itens ?? []) {
    const quantidade = Math.floor(item?.quantidade ?? 0)
    if (typeof item?.id !== 'string' || !item.id || quantidade <= 0) continue
    const igual = resultado.find((outro) => outro.id === item.id)
    if (igual) igual.quantidade += quantidade
    else resultado.push({ id: item.id, quantidade })
  }
  return resultado
}

// O mapa descoberto da partida somado ao de antes (nada se perde, nem em Derrota: RF50 mantém o que se ganhou)
function juntarDescobertas(progresso, descobertas) {
  if (!descobertas?.bioma) return {}
  const { bioma } = descobertas
  const antes = progresso.mapasDescobertos?.[bioma] ?? { nevoa: '', areas: [] }
  const nevoaNova = descobertas.nevoa ?? ''
  const tamanho = Math.max(antes.nevoa.length, nevoaNova.length) * 4
  const regioesAntes = progresso.regioesDescobertas?.[bioma] ?? []
  return {
    mapasDescobertos: {
      ...progresso.mapasDescobertos,
      [bioma]: { nevoa: juntarNevoas(antes.nevoa, nevoaNova, tamanho), areas: [...new Set([...antes.areas, ...(descobertas.areas ?? [])])] },
    },
    regioesDescobertas: {
      ...progresso.regioesDescobertas,
      [bioma]: [...new Set([...regioesAntes, ...(descobertas.regioes ?? [])])],
    },
  }
}
