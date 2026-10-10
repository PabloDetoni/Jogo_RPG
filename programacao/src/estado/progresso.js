import { atributoMaximo } from '../dados/balanceamento.js'
import { biomas, pontosDePartida } from '../dados/biomas.js'
import { atributos, atributosIniciaisDaClasse, classes } from '../dados/classes.js'
import { espacosDeEquipamento } from '../dados/equipamento.js'
import { tiposDeMissao } from '../dados/missoes.js'
import {
  habilidadesAtivasNoMaximo,
  nivelInicial,
  nivelMaximo,
  nivelMaximoDaHabilidade,
} from '../dados/regras.js'
import { juntarItens } from '../regras/mochila.js'
import { ehObjeto, inteiroEntre, inteiroNaoNegativo } from './validacao.js'

// Progresso do jogador: é tudo o que fica salvo (no navegador para o convidado; no Supabase
// para a conta, na etapa 8). As etapas seguintes preenchem os campos que hoje começam vazios.
//
// Durante a partida o progresso NÃO muda: o que se ganha fica na partida atual e só entra aqui
// ao encerrar. Assim, se a página fechar no meio, o progresso salvo é o do começo da partida (RF12).
export function progressoInicial() {
  return {
    personagens: [], // permanentes, um por classe (ver novoPersonagem)
    contratosTemporarios: [], // { classe, partidasRestantes, nivel } (regras/guilda.js)
    lider: null, // classe do Líder atual; sempre um personagem permanente (RF33)
    ouro: 0,
    mochila: [], // Mochila do Reino: { id, quantidade } (o catálogo entra na etapa 7)
    missaoAtiva: null, // uma por vez: { id, tipo, alvo, quantidade, progresso, recompensa: { ouro, xp } }
    regioesDescobertas: {}, // bioma → regiões já descobertas, ex.: { floresta: ['facil'] } (etapa 6)
    // bioma → { nevoa, areas }: o minimapa já revelado (texto hexadecimal, regras/mundo.js) e as áreas que já deram
    // o XP da primeira descoberta (RF40). Fase 3.
    mapasDescobertos: {},
    conquistas: {}, // conquista → progresso (etapa 9)
    estatisticas: { partidasJogadas: 0, monstrosDerrotados: 0 },
  }
}

// xp: o que o personagem já juntou dentro do nível atual (regras/xp.js).
// pontosDeAtributo e pontosDeHabilidade: ganhos ao subir de nível e ainda não usados (RF55).
// habilidades: habilidade → nível (1 a 5); ativas: até 3 delas (RF24). A lista de habilidades
// do beta (TASK-010) ainda não existe; a primeira de cada classe, gratuita, entra com ela.
// equipamento: espaço → item (RF22).
export function novoPersonagem(classe) {
  return {
    classe,
    nivel: nivelInicial,
    xp: 0,
    atributos: atributosIniciaisDaClasse(classe),
    pontosDeAtributo: 0,
    pontosDeHabilidade: 0,
    habilidades: {},
    ativas: [],
    equipamento: {},
  }
}

function normalizarHabilidades(salvas) {
  const resultado = {}
  for (const [id, nivel] of Object.entries(ehObjeto(salvas) ? salvas : {})) {
    if (Number.isInteger(nivel) && nivel >= 1) resultado[id] = Math.min(nivel, nivelMaximoDaHabilidade)
  }
  return resultado
}

// Só habilidades que o personagem tem, sem repetir, no máximo 3
function normalizarAtivas(salvas, habilidades) {
  const lista = Array.isArray(salvas) ? salvas : []
  return [...new Set(lista.filter((id) => typeof id === 'string' && id in habilidades))].slice(
    0,
    habilidadesAtivasNoMaximo,
  )
}

const espacosValidos = new Set(espacosDeEquipamento.map((espaco) => espaco.id))

function normalizarEquipamento(salvo) {
  const resultado = {}
  for (const [espaco, item] of Object.entries(ehObjeto(salvo) ? salvo : {})) {
    if (espacosValidos.has(espaco) && typeof item === 'string' && item) resultado[espaco] = item
  }
  return resultado
}

// Atributo que falta ou não é número volta ao inicial da classe; o resto fica entre 0 e o máximo.
function normalizarAtributos(salvos, classe) {
  const iniciais = atributosIniciaisDaClasse(classe)
  const dados = ehObjeto(salvos) ? salvos : {}
  const resultado = {}
  for (const { id } of atributos) {
    const valor = dados[id]
    resultado[id] = Number.isInteger(valor) ? Math.min(Math.max(valor, 0), atributoMaximo) : iniciais[id]
  }
  return resultado
}

// Missão salva com formato errado é descartada (o jogador pode aceitar outra na Guilda)
function normalizarMissao(missao) {
  if (!ehObjeto(missao) || !tiposDeMissao.includes(missao.tipo)) return null
  if (typeof missao.id !== 'string' || typeof missao.alvo !== 'string') return null
  if (!Number.isInteger(missao.quantidade) || missao.quantidade < 1) return null
  const recompensa = ehObjeto(missao.recompensa) ? missao.recompensa : {}
  return {
    id: missao.id,
    tipo: missao.tipo,
    alvo: missao.alvo,
    quantidade: missao.quantidade,
    progresso: Math.min(inteiroNaoNegativo(missao.progresso), missao.quantidade),
    recompensa: { ouro: inteiroNaoNegativo(recompensa.ouro), xp: inteiroNaoNegativo(recompensa.xp) },
  }
}

const classesValidas = new Set(classes.map((classe) => classe.id))
const biomasValidos = biomas.map((bioma) => bioma.id)
const regioesValidas = new Set(pontosDePartida.filter((ponto) => !ponto.sempreLiberado).map((ponto) => ponto.id))

// Confere um progresso que veio de fora (do navegador) e devolve um progresso válido:
// campos que faltam ganham o valor inicial e valores errados são corrigidos ou descartados.
// Devolve null quando não dá nem para reconhecer um progresso.
export function normalizarProgresso(dados) {
  if (!ehObjeto(dados)) return null

  const personagens = []
  for (const personagem of Array.isArray(dados.personagens) ? dados.personagens : []) {
    if (!ehObjeto(personagem) || !classesValidas.has(personagem.classe)) continue
    if (personagens.some((outro) => outro.classe === personagem.classe)) continue // um por classe
    const habilidades = normalizarHabilidades(personagem.habilidades)
    personagens.push({
      ...personagem,
      nivel: inteiroEntre(personagem.nivel, nivelInicial, nivelMaximo, nivelInicial),
      xp: inteiroNaoNegativo(personagem.xp),
      atributos: normalizarAtributos(personagem.atributos, personagem.classe),
      pontosDeAtributo: inteiroNaoNegativo(personagem.pontosDeAtributo),
      pontosDeHabilidade: inteiroNaoNegativo(personagem.pontosDeHabilidade),
      habilidades,
      ativas: normalizarAtivas(personagem.ativas, habilidades),
      equipamento: normalizarEquipamento(personagem.equipamento),
    })
  }
  const temPermanente = (classe) => personagens.some((personagem) => personagem.classe === classe)

  // Contrato temporário só de classe que o jogador não tem como permanente (RF29)
  const contratosTemporarios = []
  for (const contrato of Array.isArray(dados.contratosTemporarios) ? dados.contratosTemporarios : []) {
    if (!ehObjeto(contrato) || !classesValidas.has(contrato.classe) || temPermanente(contrato.classe)) continue
    if (!Number.isInteger(contrato.partidasRestantes) || contrato.partidasRestantes < 1) continue
    if (contratosTemporarios.some((outro) => outro.classe === contrato.classe)) continue
    contratosTemporarios.push({
      classe: contrato.classe,
      partidasRestantes: contrato.partidasRestantes,
      nivel: inteiroEntre(contrato.nivel, nivelInicial, nivelMaximo, nivelInicial),
    })
  }

  // Itens da Mochila do Reino: id e quantidade inteira maior que zero
  const mochila = (Array.isArray(dados.mochila) ? dados.mochila : []).filter(
    (item) => ehObjeto(item) && typeof item.id === 'string' && item.id && Number.isInteger(item.quantidade) && item.quantidade > 0,
  )

  const regioesDescobertas = {}
  const regioesSalvas = ehObjeto(dados.regioesDescobertas) ? dados.regioesDescobertas : {}
  for (const bioma of biomasValidos) {
    const lista = Array.isArray(regioesSalvas[bioma]) ? regioesSalvas[bioma] : []
    const validas = [...new Set(lista.filter((regiao) => regioesValidas.has(regiao)))]
    if (validas.length > 0) regioesDescobertas[bioma] = validas
  }

  // Mapa descoberto de cada bioma: névoa em hexadecimal (até 4096 caracteres) e ids das áreas
  const mapasDescobertos = {}
  const mapasSalvos = ehObjeto(dados.mapasDescobertos) ? dados.mapasDescobertos : {}
  for (const bioma of biomasValidos) {
    const mapa = ehObjeto(mapasSalvos[bioma]) ? mapasSalvos[bioma] : null
    if (!mapa) continue
    const nevoa = typeof mapa.nevoa === 'string' && /^[0-9a-f]{0,4096}$/.test(mapa.nevoa) ? mapa.nevoa : ''
    const areas = [...new Set((Array.isArray(mapa.areas) ? mapa.areas : []).filter((area) => typeof area === 'string' && area.length > 0 && area.length <= 40))].slice(0, 200)
    if (nevoa || areas.length > 0) mapasDescobertos[bioma] = { nevoa, areas }
  }

  const estatisticas = ehObjeto(dados.estatisticas) ? dados.estatisticas : {}

  return {
    personagens,
    contratosTemporarios,
    lider: temPermanente(dados.lider) ? dados.lider : (personagens[0]?.classe ?? null),
    ouro: inteiroNaoNegativo(dados.ouro),
    mochila: juntarItens(mochila.map((item) => ({ id: item.id, quantidade: item.quantidade }))),
    missaoAtiva: normalizarMissao(dados.missaoAtiva),
    regioesDescobertas,
    mapasDescobertos,
    conquistas: ehObjeto(dados.conquistas) ? dados.conquistas : {},
    estatisticas: {
      partidasJogadas: inteiroNaoNegativo(estatisticas.partidasJogadas),
      monstrosDerrotados: inteiroNaoNegativo(estatisticas.monstrosDerrotados),
    },
  }
}
