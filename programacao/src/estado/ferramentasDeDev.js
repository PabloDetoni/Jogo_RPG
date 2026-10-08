import { classes } from '../dados/classes.js'
import { nivelInicial, nivelMaximo } from '../dados/regras.js'
import { xpParaSubir } from '../regras/xp.js'
import { novoPersonagem } from './progresso.js'

// SÓ PARA TESTAR (painel "</> DEV", que existe só no npm run dev). Mexem no progresso fora da partida, para ver a IA
// mudar com o nível sem jogar horas. O jogo de verdade nunca chama estas funções: a ação do estado que usa cada
// uma confere import.meta.env.DEV e se a partida acabou (estado/estadoDoJogo.js).

// Um personagem permanente de cada classe que falta, de graça (os temporários dessas classes vão embora, RF29)
export function contratarTodasAsClasses(progresso) {
  const faltam = classes.map((classe) => classe.id).filter((id) => !progresso.personagens.some((p) => p.classe === id))
  return {
    ...progresso,
    personagens: [...progresso.personagens, ...faltam.map((classe) => novoPersonagem(classe))],
    contratosTemporarios: progresso.contratosTemporarios.filter((contrato) => !faltam.includes(contrato.classe)),
    lider: progresso.lider ?? faltam[0] ?? null,
  }
}

function mudarPersonagem(progresso, classe, mudar) {
  return {
    ...progresso,
    personagens: progresso.personagens.map((personagem) => (personagem.classe === classe ? mudar(personagem) : personagem)),
  }
}

// Sobe ou desce níveis na hora (o XP dentro do nível volta a 0). Os pontos de atributo não mudam.
export function mudarNivel(progresso, classe, quantos) {
  return mudarPersonagem(progresso, classe, (personagem) => ({
    ...personagem,
    nivel: Math.min(nivelMaximo, Math.max(nivelInicial, personagem.nivel + quantos)),
    xp: 0,
  }))
}

// Deixa o personagem a 1 ponto de XP do próximo nível: o primeiro monstro da partida já o faz subir
export function quaseSubir(progresso, classe) {
  return mudarPersonagem(progresso, classe, (personagem) =>
    personagem.nivel >= nivelMaximo ? personagem : { ...personagem, xp: xpParaSubir(personagem.nivel) - 1 },
  )
}
