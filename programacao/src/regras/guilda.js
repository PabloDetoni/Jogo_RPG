import { contratos } from '../dados/balanceamento.js'
import { classes } from '../dados/classes.js'
import { multaPorAbandonoPercentual } from '../dados/regras.js'
import { novoPersonagem } from '../estado/progresso.js'
import { dividirXp, ganharXp } from './xp.js'

// Regras da Guilda: missões (RF26 a RF28) e contratos (RF29, RF52). Diagrama de atividades 05.
// Cada função recebe o progresso e devolve { ok: true, progresso, ... } ou { ok: false, motivo },
// com o motivo pronto para mostrar ao jogador. Nada é alterado no lugar.

const recusar = (motivo) => ({ ok: false, motivo })

// ---------- Missões ----------

// Uma missão ativa por vez. O progresso só começa a contar depois de aceitar (RF26).
// "missao" vem do quadro da Guilda: { id, tipo, alvo, quantidade, recompensa: { ouro, xp } }.
export function aceitarMissao(progresso, missao) {
  if (progresso.missaoAtiva) return recusar('Você já tem uma missão ativa. Entregue ou abandone a atual primeiro.')
  return { ok: true, progresso: { ...progresso, missaoAtiva: { ...missao, progresso: 0 } } }
}

// Conta um acontecimento da partida na missão ativa. O progresso soma entre partidas (RF26).
// evento: { tipo: 'abate', alvo, quantidade } · { tipo: 'coleta', alvo, quantidade } · { tipo: 'exploracao', alvo }
// Missão de entrega não conta eventos: ela olha a mochila na hora de entregar.
export function registrarNaMissao(missao, evento) {
  if (!missao) return missao
  const combina =
    (missao.tipo === 'matar' && evento.tipo === 'abate') ||
    (missao.tipo === 'coletar' && evento.tipo === 'coleta') ||
    (missao.tipo === 'explorar' && evento.tipo === 'exploracao')
  if (!combina || evento.alvo !== missao.alvo) return missao
  const soma = missao.tipo === 'explorar' ? 1 : Math.max(0, Math.floor(evento.quantidade ?? 1))
  return { ...missao, progresso: Math.min(missao.quantidade, missao.progresso + soma) }
}

function quantidadeNaMochila(mochila, id) {
  return mochila.filter((item) => item.id === id).reduce((soma, item) => soma + item.quantidade, 0)
}

// Objetivo cumprido agora? Na entrega, é preciso ter os itens neste momento (RF27).
export function objetivoCumprido(missao, mochila) {
  if (!missao) return false
  if (missao.tipo === 'entregar') return quantidadeNaMochila(mochila, missao.alvo) >= missao.quantidade
  return missao.progresso >= missao.quantidade
}

// Tira "quantidade" unidades do item da mochila; pilhas que zeram somem
function consumirDaMochila(mochila, id, quantidade) {
  let falta = quantidade
  const resultado = []
  for (const item of mochila) {
    if (item.id !== id || falta === 0) {
      resultado.push(item)
      continue
    }
    const usado = Math.min(item.quantidade, falta)
    falta -= usado
    if (item.quantidade > usado) resultado.push({ ...item, quantidade: item.quantidade - usado })
  }
  return resultado
}

// Entregar na Guilda: só aqui a recompensa entra (RF27). Missão de entrega consome os itens.
// O XP é dividido entre todos os personagens permanentes (RF50).
// Devolve também niveisGanhos por classe, para as mensagens de "subiu de nível".
export function entregarMissao(progresso) {
  const missao = progresso.missaoAtiva
  if (!missao) return recusar('Não há missão ativa para entregar.')
  if (!objetivoCumprido(missao, progresso.mochila)) {
    const falta =
      missao.tipo === 'entregar'
        ? missao.quantidade - quantidadeNaMochila(progresso.mochila, missao.alvo)
        : missao.quantidade - missao.progresso
    return recusar(`A missão ainda não foi cumprida: faltam ${falta}.`)
  }

  const partesDeXp = dividirXp(
    missao.recompensa.xp,
    progresso.personagens.map((p) => p.classe),
    progresso.lider,
  )
  const niveisGanhos = {}
  const personagens = progresso.personagens.map((personagem) => {
    const { personagem: depois, niveisGanhos: niveis } = ganharXp(personagem, partesDeXp[personagem.classe] ?? 0)
    niveisGanhos[personagem.classe] = niveis
    return depois
  })

  const mochila =
    missao.tipo === 'entregar' ? consumirDaMochila(progresso.mochila, missao.alvo, missao.quantidade) : progresso.mochila

  return {
    ok: true,
    niveisGanhos,
    progresso: { ...progresso, personagens, mochila, ouro: progresso.ouro + missao.recompensa.ouro, missaoAtiva: null },
  }
}

// Multa por abandonar: 10% do ouro da recompensa, arredondado para baixo (RF28)
export function multaDaMissao(missao) {
  return Math.floor((missao.recompensa.ouro * multaPorAbandonoPercentual) / 100)
}

// Abandonar: paga a multa e encerra a missão. Se o ouro não der, fica em zero (RF28).
export function abandonarMissao(progresso) {
  const missao = progresso.missaoAtiva
  if (!missao) return recusar('Não há missão ativa para abandonar.')
  const multa = multaDaMissao(missao)
  return { ok: true, multa, progresso: { ...progresso, ouro: Math.max(0, progresso.ouro - multa), missaoAtiva: null } }
}

// ---------- Contratos ----------

const temPermanente = (progresso, classe) => progresso.personagens.some((p) => p.classe === classe)
const temTemporario = (progresso, classe) => progresso.contratosTemporarios.some((c) => c.classe === classe)

// Só aparecem classes que o jogador ainda não possui como permanente (RF29).
// O temporário de uma classe não aparece de novo enquanto o contrato dela estiver valendo.
export function classesParaContratar(progresso) {
  return classes
    .filter((classe) => !temPermanente(progresso, classe.id))
    .map((classe) => ({
      classe: classe.id,
      temporario: !temTemporario(progresso, classe.id),
      permanente: true,
    }))
}

// Temporário: paga ouro, dura algumas partidas, tem nível fixo, não ganha XP e não pode ser Líder (RF29)
export function contratarTemporario(progresso, classe) {
  if (temPermanente(progresso, classe)) return recusar('Você já tem um personagem permanente desta classe.')
  if (temTemporario(progresso, classe)) return recusar('Já existe um contrato temporário desta classe.')
  if (progresso.ouro < contratos.precoDoTemporario) return recusar('Ouro insuficiente para este contrato.')
  const contrato = { classe, partidasRestantes: contratos.partidasDoTemporario, nivel: contratos.nivelDoTemporario }
  return {
    ok: true,
    progresso: {
      ...progresso,
      ouro: progresso.ouro - contratos.precoDoTemporario,
      contratosTemporarios: [...progresso.contratosTemporarios, contrato],
    },
  }
}

// Permanente: paga ouro e cria um personagem no nível 1. O temporário da mesma classe vai embora na hora (RF29).
export function contratarPermanente(progresso, classe) {
  if (temPermanente(progresso, classe)) return recusar('Você já tem um personagem permanente desta classe.')
  if (progresso.ouro < contratos.precoDoPermanente) return recusar('Ouro insuficiente para este contrato.')
  return {
    ok: true,
    progresso: {
      ...progresso,
      ouro: progresso.ouro - contratos.precoDoPermanente,
      personagens: [...progresso.personagens, novoPersonagem(classe)],
      contratosTemporarios: progresso.contratosTemporarios.filter((c) => c.classe !== classe),
      lider: progresso.lider ?? classe,
    },
  }
}

// Ao fim de cada partida, cada contrato temporário perde uma partida; quem chega a zero vai embora (RF52).
// Partida interrompida não chega aqui, então não gasta contrato (RF12).
export function gastarPartidaDosContratos(contratosTemporarios) {
  return contratosTemporarios
    .map((contrato) => ({ ...contrato, partidasRestantes: contrato.partidasRestantes - 1 }))
    .filter((contrato) => contrato.partidasRestantes > 0)
}
