import { descreverMissao, missaoDoQuadro, nomeDoAlvo } from '../dados/missoes.js'
import { abandonarMissao, aceitarMissao, entregarMissao, multaDaMissao, objetivoCumprido, registrarNaMissao } from './guilda.js'
import { quantidadeNaMochila } from './mochila.js'

// MISSÕES DA GUILDA NO JOGO (Fase 4, TASK-078; RF26 a RF28). As regras de cada missão são as de regras/guilda.js (etapa 4,
// com testes); aqui ficam o que liga o quadro (dados/missoes.js), as telas do Reino e a partida.

// Quanto da missão já foi feito agora: na de entrega, o que há na Mochila (RF27); nas outras, o progresso salvo
export function progressoAgora(progresso) {
  const missao = progresso.missaoAtiva
  if (!missao) return 0
  return missao.tipo === 'entregar' ? Math.min(missao.quantidade, quantidadeNaMochila(progresso.mochila, missao.alvo)) : missao.progresso
}

// A missão ativa em uma linha (HUD do Reino), com a conta certa também na de entrega
export function missaoEmUmaLinha(progresso) {
  return descreverMissao(progresso.missaoAtiva, progressoAgora(progresso))
}

export function missaoCumprida(progresso) {
  return objetivoCumprido(progresso.missaoAtiva, progresso.mochila)
}

// ---------- Operações do Reino (regras/reino.js), com a mensagem para a tela ----------

export function aceitarMissaoDoQuadro(progresso, id) {
  const missao = missaoDoQuadro(id)
  if (!missao) return { ok: false, motivo: 'Esta missão não está no quadro.' }
  const { id: idDaMissao, tipo, alvo, quantidade, recompensa } = missao // o save guarda só isso (o título vem do quadro)
  const resultado = aceitarMissao(progresso, { id: idDaMissao, tipo, alvo, quantidade, recompensa })
  return resultado.ok ? { ...resultado, mensagem: `Missão aceita: ${missao.titulo}. O progresso conta a partir de agora.` } : resultado
}

export function entregarMissaoNaGuilda(progresso) {
  const missao = progresso.missaoAtiva
  const resultado = entregarMissao(progresso)
  if (!resultado.ok) return resultado
  const subiram = Object.values(resultado.niveisGanhos).filter((niveis) => niveis > 0).length
  const estatisticas = resultado.progresso.estatisticas
  return {
    ok: true,
    progresso: { ...resultado.progresso, estatisticas: { ...estatisticas, missoesEntregues: (estatisticas.missoesEntregues ?? 0) + 1 } },
    mensagem: `Missão entregue: +${missao.recompensa.ouro} de ouro e ${missao.recompensa.xp} XP divididos entre os personagens${subiram ? ` (${subiram} subiu de nível)` : ''}.`,
  }
}

export function abandonarMissaoNaGuilda(progresso) {
  const resultado = abandonarMissao(progresso)
  if (!resultado.ok) return resultado
  return { ok: true, progresso: resultado.progresso, mensagem: `Missão abandonada. Multa: ${resultado.multa} de ouro.` }
}

export { multaDaMissao }

// ---------- Na partida ----------

// O que a partida conta para as missões (só entra no save no fim, RF12):
// eventos = { abates: { tipoDoMob: quantos }, coletados: { idDoItem: quantos }, areasVisitadas: [ids] }
export function avancarComEventos(missao, eventos) {
  if (!missao || !eventos) return missao
  let atual = missao
  for (const [alvo, quantidade] of Object.entries(eventos.abates ?? {})) atual = registrarNaMissao(atual, { tipo: 'abate', alvo, quantidade })
  for (const [alvo, quantidade] of Object.entries(eventos.coletados ?? {})) atual = registrarNaMissao(atual, { tipo: 'coleta', alvo, quantidade })
  for (const alvo of eventos.areasVisitadas ?? []) atual = registrarNaMissao(atual, { tipo: 'exploracao', alvo })
  return atual
}

// O aviso do HUD da partida quando um acontecimento conta para a missão ("Missão: 5/8 lobo"), ou null.
// missao = a do começo da partida; progressoAntes = o progresso antes deste acontecimento; eventos = tudo o que a
// partida já juntou, com ele. Só avisa quando o progresso sobe (cumprida, não avisa de novo).
export function avisoDaMissao(missao, progressoAntes, eventos) {
  if (!missao || missao.tipo === 'entregar') return null
  const depois = avancarComEventos(missao, eventos)
  if (depois.progresso <= progressoAntes) return null
  if (depois.progresso >= depois.quantidade) return `Missão cumprida: ${nomeDoAlvo(missao)}! Entregue na Guilda.`
  return `Missão: ${depois.progresso}/${depois.quantidade} ${nomeDoAlvo(missao)}`
}
