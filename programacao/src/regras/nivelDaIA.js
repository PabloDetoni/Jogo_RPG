import { combateDeTeste } from '../dados/balanceamento.js'
import { nivelInicial } from '../dados/regras.js'

// Níveis da IA dos aliados (5b.1). Funções puras.
// A IA de cada aliado vem do nível do próprio personagem: o grupo é novato e aprende a lutar.
// Básica (níveis baixos), média e avançada. Nenhuma é perfeita: todas erram às vezes, cada vez menos.
// O jogador nunca escolhe a IA; só a barra de teste força um nível, para testar.

const { niveisDaIA, ia } = combateDeTeste

export const idsDosNiveisDaIA = niveisDaIA.map((faixa) => faixa.id)

function faixaDoNivel(nivelDoPersonagem) {
  return niveisDaIA.find((faixa) => nivelDoPersonagem <= faixa.ateONivel) ?? niveisDaIA.at(-1)
}

// 'basica' | 'media' | 'avancada'
export function nivelDaIA(nivelDoPersonagem) {
  return faixaDoNivel(nivelDoPersonagem).id
}

export function nomeDoNivelDaIA(id) {
  return niveisDaIA.find((faixa) => faixa.id === id)?.nome ?? id
}

// Primeiro e último nível de personagem de cada faixa
function limitesDaFaixa(faixa) {
  const indice = niveisDaIA.indexOf(faixa)
  const primeiro = indice === 0 ? nivelInicial : niveisDaIA[indice - 1].ateONivel + 1
  return { primeiro, ultimo: faixa.ateONivel }
}

// Um nível de personagem que representa a faixa (o do meio), para a barra de teste forçar um nível da IA
export function nivelParaTestar(id) {
  const faixa = niveisDaIA.find((outra) => outra.id === id) ?? niveisDaIA[0]
  const { primeiro, ultimo } = limitesDaFaixa(faixa)
  return Math.round((primeiro + ultimo) / 2)
}

// Chance de errar a decisão do momento. Cai de erroNoComeco a erroNoFim dentro da faixa.
// Em foco (só na avançada), quase não erra. "comoBasica": o erro que a básica teria no fim da faixa dela
// (o Tanque da IA média ainda erra como na básica).
export function chanceDeErro(nivelDoPersonagem, { emFoco = false, comoBasica = false } = {}) {
  if (comoBasica) return niveisDaIA[0].erroNoFim
  const faixa = faixaDoNivel(nivelDoPersonagem)
  if (emFoco && faixa.id === 'avancada') return ia.foco.erro
  const { primeiro, ultimo } = limitesDaFaixa(faixa)
  const fracao = ultimo > primeiro ? (Math.min(Math.max(nivelDoPersonagem, primeiro), ultimo) - primeiro) / (ultimo - primeiro) : 1
  return faixa.erroNoComeco + (faixa.erroNoFim - faixa.erroNoComeco) * fracao
}

// Sorteio com a chance dada. "sorteio" devolve um número de 0 a 1 (Math.random no jogo; fixo nos testes).
export function sortear(chance, sorteio = Math.random) {
  return sorteio() < chance
}

// Momento de foco (avançada): começa quando o Líder fica com pouca vida ou alguém do grupo cai, e dura
// msDeDuracao. Devolve até quando o foco vai (0 = sem foco).
export function atualizarFoco({ focoAte, agora, fracaoDaVidaDoLider, alguemCaido }) {
  const motivo = fracaoDaVidaDoLider < ia.foco.vidaDoLider || alguemCaido
  if (motivo) return Math.max(focoAte, agora + ia.foco.msDeDuracao)
  return focoAte > agora ? focoAte : 0
}
