import { biomas, pontosDePartida } from '../dados/biomas.js'
import { classes } from '../dados/classes.js'
import { nivelInicial, nivelMaximo } from '../dados/regras.js'
import { ehObjeto, inteiroEntre, inteiroNaoNegativo } from './validacao.js'

// Progresso do jogador: é tudo o que fica salvo (no navegador para o convidado; no Supabase
// para a conta, na etapa 8). As etapas seguintes preenchem os campos que hoje começam vazios.
//
// Durante a partida o progresso NÃO muda: o que se ganha fica na partida atual e só entra aqui
// ao encerrar. Assim, se a página fechar no meio, o progresso salvo é o do começo da partida (RF12).
export function progressoInicial() {
  return {
    personagens: [], // permanentes, um por classe: { classe, nivel, xp }
    contratosTemporarios: [], // { classe, partidasRestantes } (etapa 7)
    lider: null, // classe do Líder atual; sempre um personagem permanente (RF33)
    ouro: 0,
    mochila: [], // itens da Mochila do Reino (etapa 7)
    missaoAtiva: null, // uma por vez (etapa 7)
    regioesDescobertas: {}, // bioma → regiões já descobertas, ex.: { floresta: ['facil'] } (etapa 6)
    conquistas: {}, // conquista → progresso (etapa 9)
    estatisticas: { partidasJogadas: 0, monstrosDerrotados: 0 },
  }
}

export function novoPersonagem(classe) {
  return { classe, nivel: nivelInicial, xp: 0 }
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
    personagens.push({
      ...personagem,
      nivel: inteiroEntre(personagem.nivel, nivelInicial, nivelMaximo, nivelInicial),
      xp: inteiroNaoNegativo(personagem.xp),
    })
  }
  const temPermanente = (classe) => personagens.some((personagem) => personagem.classe === classe)

  // Contrato temporário só de classe que o jogador não tem como permanente (RF29)
  const contratosTemporarios = []
  for (const contrato of Array.isArray(dados.contratosTemporarios) ? dados.contratosTemporarios : []) {
    if (!ehObjeto(contrato) || !classesValidas.has(contrato.classe) || temPermanente(contrato.classe)) continue
    if (!Number.isInteger(contrato.partidasRestantes) || contrato.partidasRestantes < 1) continue
    if (contratosTemporarios.some((outro) => outro.classe === contrato.classe)) continue
    contratosTemporarios.push(contrato)
  }

  const regioesDescobertas = {}
  const regioesSalvas = ehObjeto(dados.regioesDescobertas) ? dados.regioesDescobertas : {}
  for (const bioma of biomasValidos) {
    const lista = Array.isArray(regioesSalvas[bioma]) ? regioesSalvas[bioma] : []
    const validas = [...new Set(lista.filter((regiao) => regioesValidas.has(regiao)))]
    if (validas.length > 0) regioesDescobertas[bioma] = validas
  }

  const estatisticas = ehObjeto(dados.estatisticas) ? dados.estatisticas : {}

  return {
    personagens,
    contratosTemporarios,
    lider: temPermanente(dados.lider) ? dados.lider : (personagens[0]?.classe ?? null),
    ouro: inteiroNaoNegativo(dados.ouro),
    mochila: Array.isArray(dados.mochila) ? dados.mochila.filter(ehObjeto) : [],
    missaoAtiva: ehObjeto(dados.missaoAtiva) ? dados.missaoAtiva : null,
    regioesDescobertas,
    conquistas: ehObjeto(dados.conquistas) ? dados.conquistas : {},
    estatisticas: {
      partidasJogadas: inteiroNaoNegativo(estatisticas.partidasJogadas),
      monstrosDerrotados: inteiroNaoNegativo(estatisticas.monstrosDerrotados),
    },
  }
}
