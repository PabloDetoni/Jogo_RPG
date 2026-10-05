import { normalizarProgresso, progressoInicial } from '../estado/progresso.js'
import { ehObjeto } from '../estado/validacao.js'
import { chaves } from './chaves.js'
import { formatoAtual, migrarParaFormatoAtual } from './formato.js'

// Lê e grava o progresso do convidado no navegador (RF01, RF09, RF11, RF12, RNF06).
//
// O que fica salvo:
// { formato, versao, salvoEm, progresso, partidaEmAndamento }
// - formato: estrutura do arquivo (formato.js)
// - versao: sobe a cada salvamento; uma versão antiga nunca sobrescreve uma mais nova (RNF06)
// - partidaEmAndamento: preenchida entre "Começar partida" e o resultado; se a página fechar
//   no meio, a partida é descartada ao carregar (RF11, RF12)
//
// armazenamento: vem de armazenamento.js, ou é null quando o navegador não deixa guardar nada.
// agora: devolve a data atual (dá para trocar nos testes).
export function criarSalvadorDoConvidado(armazenamento, agora = () => new Date()) {
  let versao = 0 // versão já gravada por esta aba
  let ultimoConteudo = null // o que foi gravado por último, para não gravar de novo sem mudança
  let bloqueado = false // true = esta aba não grava mais nada
  let info = { versao: null, salvoEm: null, problema: armazenamento ? null : 'indisponivel' }
  const ouvintes = new Set()

  function atualizarInfo(mudancas) {
    info = { ...info, ...mudancas }
    for (const ouvinte of ouvintes) ouvinte()
  }

  function lerSalvo() {
    const lido = armazenamento.ler(chaves.convidado)
    if (!lido.ok) return { situacao: 'indisponivel' }
    if (lido.valor === null) return { situacao: 'vazio' }

    const estragado = { situacao: 'corrompido', texto: lido.valor }
    let dados
    try {
      dados = JSON.parse(lido.valor)
    } catch {
      return estragado
    }
    if (!ehObjeto(dados) || !Number.isInteger(dados.formato) || dados.formato < 1) return estragado
    if (dados.formato > formatoAtual) return { situacao: 'formatoNovo' }
    try {
      dados = migrarParaFormatoAtual(dados)
    } catch {
      return estragado
    }
    const progresso = normalizarProgresso(dados.progresso)
    if (!progresso) return estragado

    return {
      situacao: 'carregado',
      progresso,
      partidaEmAndamento: ehObjeto(dados.partidaEmAndamento) ? dados.partidaEmAndamento : null,
      versao: Number.isInteger(dados.versao) && dados.versao >= 0 ? dados.versao : 0,
      salvoEm: typeof dados.salvoEm === 'string' ? dados.salvoEm : null,
    }
  }

  // Ao entrar como convidado: devolve o progresso para começar a jogar.
  // situacao: 'novo', 'carregado', 'corrompido', 'formatoNovo' ou 'indisponivel'.
  function carregar() {
    versao = 0
    ultimoConteudo = null
    bloqueado = false
    const comecarDoZero = (situacao) => ({ situacao, progresso: progressoInicial(), partidaDescartada: false })

    if (!armazenamento) return comecarDoZero('indisponivel')

    const salvo = lerSalvo()
    switch (salvo.situacao) {
      case 'carregado':
        versao = salvo.versao
        ultimoConteudo = JSON.stringify({ progresso: salvo.progresso, partidaEmAndamento: salvo.partidaEmAndamento })
        atualizarInfo({ versao, salvoEm: salvo.salvoEm, problema: null })
        // O progresso salvo já é o do começo da partida: basta descartar a partida (RF11, RF12)
        return { situacao: 'carregado', progresso: salvo.progresso, partidaDescartada: salvo.partidaEmAndamento !== null }

      case 'vazio':
        atualizarInfo({ versao: null, salvoEm: null, problema: null })
        return comecarDoZero('novo')

      case 'corrompido':
        // Guarda uma cópia antes que um salvamento novo passe por cima. A numeração continua
        // de onde estava, senão o número antigo pareceria "mais novo" e travaria os salvamentos.
        armazenamento.gravar(chaves.convidadoCorrompido, salvo.texto)
        versao = versaoNoNavegador()
        atualizarInfo({ versao: null, salvoEm: null, problema: null })
        return comecarDoZero('corrompido')

      case 'formatoNovo':
        // Salvo por uma versão mais nova do jogo: esta aba não mexe nele
        bloqueado = true
        atualizarInfo({ versao: null, salvoEm: null, problema: 'formatoNovo' })
        return comecarDoZero('formatoNovo')

      default:
        atualizarInfo({ problema: 'indisponivel' })
        return comecarDoZero('indisponivel')
    }
  }

  function versaoNoNavegador() {
    const lido = armazenamento.ler(chaves.convidado)
    if (!lido.ok || lido.valor === null) return 0
    try {
      const dados = JSON.parse(lido.valor)
      return Number.isInteger(dados?.versao) ? dados.versao : 0
    } catch {
      return 0
    }
  }

  // Grava o progresso do convidado, se ele mudou desde o último salvamento.
  // Recebe o resultado de dadosParaSalvar (estado/estadoDoJogo.js).
  function salvar({ perfil, progresso, partidaEmAndamento }) {
    if (perfil !== 'convidado' || bloqueado || !armazenamento) return
    const conteudo = JSON.stringify({ progresso, partidaEmAndamento })
    if (conteudo === ultimoConteudo) return

    // RNF06: se outra aba gravou uma versão mais nova, esta não passa por cima
    if (versaoNoNavegador() > versao) {
      bloqueado = true
      atualizarInfo({ problema: 'conflito' })
      return
    }

    const novaVersao = versao + 1
    const salvoEm = agora().toISOString()
    const arquivo = { formato: formatoAtual, versao: novaVersao, salvoEm, progresso, partidaEmAndamento }
    const gravado = armazenamento.gravar(chaves.convidado, JSON.stringify(arquivo))
    if (!gravado.ok) {
      atualizarInfo({ problema: gravado.erro })
      return
    }
    versao = novaVersao
    ultimoConteudo = conteudo
    atualizarInfo({ versao, salvoEm, problema: null })
  }

  // Painel de desenvolvimento: apaga o progresso do convidado e para de salvar nesta aba.
  function apagar() {
    bloqueado = true
    versao = 0
    ultimoConteudo = null
    if (armazenamento) {
      armazenamento.apagar(chaves.convidado)
      armazenamento.apagar(chaves.convidadoCorrompido)
    }
    atualizarInfo({ versao: null, salvoEm: null })
  }

  return {
    carregar,
    salvar,
    apagar,
    // Para os componentes acompanharem o salvamento (useSyncExternalStore)
    inscrever(ouvinte) {
      ouvintes.add(ouvinte)
      return () => ouvintes.delete(ouvinte)
    },
    obterInfo() {
      return info
    },
  }
}
