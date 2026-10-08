import { gastarPartidaDosContratos } from './guilda.js'
import { ganharXp } from './xp.js'

// O que a partida deixa no progresso quando termina (TASK-048), em qualquer resultado (RF50: XP e itens ficam):
// - o ouro recebido (já com a taxa e com o bônus da Grande Vitória);
// - o XP de cada personagem permanente, com os níveis e os pontos de atributo e de habilidade ganhos (RF55);
// - os monstros derrotados e mais uma partida jogada (RF34);
// - cada contrato temporário perde uma partida (RF52).
// Vida e mana não ficam no progresso: toda partida começa com elas cheias (RF52).
// fim = { ouroRecebido, xpPorClasse: { classe: xp }, monstros }
// Devolve o progresso novo e, para o Resumo, o XP de cada permanente com o nível de antes e o de depois.
export function aplicarFimNoProgresso(progresso, { ouroRecebido = 0, xpPorClasse = {}, monstros = 0 }) {
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
    },
    personagens: xpDosPersonagens,
  }
}
