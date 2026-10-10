import { atributoMaximo } from '../dados/balanceamento.js'
import { atributos, atributosIniciaisDaClasse, nomeDaClasse } from '../dados/classes.js'
import { tirarDaMochila } from './mochila.js'

// ÁRVORES DE HABILIDADES (Fase 4): atributos e pergaminho (TASK-076; RF24, RF25, RF55, UC19, UC20).
// Os pontos de atributo vêm ao subir de nível (pontosDeAtributo do personagem). Distribuídos, ficam fixos: só o
// pergaminho de redefinição (comprado no Mercado) os devolve, e as habilidades não mudam com ele.

const idsDosAtributos = new Set(atributos.map((atributo) => atributo.id))
const nomeDoAtributo = (id) => atributos.find((atributo) => atributo.id === id)?.nome ?? id

function mudarPersonagem(progresso, classe, mudar) {
  return { ...progresso, personagens: progresso.personagens.map((personagem) => (personagem.classe === classe ? mudar(personagem) : personagem)) }
}

// Aplica uma distribuição ({ forca: 2, agilidade: 1 }) dos pontos livres. Nada passa do máximo de cada atributo.
export function distribuirPontos(progresso, classe, distribuicao) {
  const personagem = progresso.personagens.find((um) => um.classe === classe)
  if (!personagem) return { ok: false, motivo: 'Só os personagens permanentes têm árvore.' }
  const entradas = Object.entries(distribuicao ?? {}).filter(([, quantos]) => quantos !== 0)
  if (entradas.length === 0) return { ok: false, motivo: 'Escolha onde pôr os pontos.' }
  for (const [id, quantos] of entradas) {
    if (!idsDosAtributos.has(id) || !Number.isInteger(quantos) || quantos < 0) return { ok: false, motivo: 'Distribuição inválida.' }
    if (personagem.atributos[id] + quantos > atributoMaximo) return { ok: false, motivo: `${nomeDoAtributo(id)} não passa de ${atributoMaximo}.` }
  }
  const total = entradas.reduce((soma, [, quantos]) => soma + quantos, 0)
  if (total > personagem.pontosDeAtributo) {
    return { ok: false, motivo: `Pontos insuficientes: ${nomeDaClasse(classe)} tem ${personagem.pontosDeAtributo} livre${personagem.pontosDeAtributo === 1 ? '' : 's'}.` }
  }
  const novos = { ...personagem.atributos }
  for (const [id, quantos] of entradas) novos[id] += quantos
  return {
    ok: true,
    progresso: mudarPersonagem(progresso, classe, (um) => ({ ...um, atributos: novos, pontosDeAtributo: um.pontosDeAtributo - total })),
    mensagem: `${total} ponto${total === 1 ? '' : 's'} aplicado${total === 1 ? '' : 's'} em ${nomeDaClasse(classe)}.`,
  }
}

// Quantos pontos o personagem já pôs nos atributos (acima dos iniciais da classe): o que o pergaminho devolveria
export function pontosDistribuidos(personagem) {
  const iniciais = atributosIniciaisDaClasse(personagem.classe)
  return atributos.reduce((soma, { id }) => soma + Math.max(0, (personagem.atributos[id] ?? 0) - iniciais[id]), 0)
}

// O pergaminho de redefinição (RF25): os atributos voltam aos iniciais da classe, os pontos voltam a ficar livres e o
// pergaminho é consumido. As habilidades não mudam.
export function usarPergaminho(progresso, classe) {
  const personagem = progresso.personagens.find((um) => um.classe === classe)
  if (!personagem) return { ok: false, motivo: 'Só os personagens permanentes têm árvore.' }
  const devolvidos = pontosDistribuidos(personagem)
  if (devolvidos === 0) return { ok: false, motivo: `${nomeDaClasse(classe)} ainda não tem pontos distribuídos para devolver.` }
  const tirou = tirarDaMochila(progresso.mochila, { pergaminhoDeRedefinicao: 1 })
  if (!tirou.ok) return { ok: false, motivo: 'Você não tem o pergaminho de redefinição (ele é vendido no Mercado).' }
  return {
    ok: true,
    progresso: {
      ...mudarPersonagem(progresso, classe, (um) => ({ ...um, atributos: atributosIniciaisDaClasse(classe), pontosDeAtributo: um.pontosDeAtributo + devolvidos })),
      mochila: tirou.mochila,
    },
    mensagem: `${devolvidos} ponto${devolvidos === 1 ? '' : 's'} de ${nomeDaClasse(classe)} voltaram a ficar livres. O pergaminho foi usado.`,
  }
}
