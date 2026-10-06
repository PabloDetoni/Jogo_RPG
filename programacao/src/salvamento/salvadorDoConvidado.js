import { progressoInicial } from '../estado/progresso.js'
import { escreverArquivoDeSave, lerArquivoDeSave, versaoDoArquivo } from './arquivoDeSave.js'
import { chaves } from './chaves.js'

// Lê e grava o progresso do convidado no navegador (RF01, RF09, RF11, RF12, RNF06).
// O formato do arquivo e a regra da partida não terminada ficam em arquivoDeSave.js.
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

  // Ao entrar como convidado: devolve o progresso para começar a jogar.
  // situacao: 'novo', 'carregado', 'corrompido', 'formatoNovo' ou 'indisponivel'.
  function carregar() {
    versao = 0
    ultimoConteudo = null
    bloqueado = false
    const comecarDoZero = (situacao) => ({ situacao, progresso: progressoInicial(), partidaDescartada: false })

    if (!armazenamento) return comecarDoZero('indisponivel')
    const lido = armazenamento.ler(chaves.convidado)
    if (!lido.ok) {
      atualizarInfo({ problema: 'indisponivel' })
      return comecarDoZero('indisponivel')
    }

    const salvo = lerArquivoDeSave(lido.valor)
    switch (salvo.situacao) {
      case 'carregado':
        versao = salvo.versao
        ultimoConteudo = JSON.stringify({ progresso: salvo.progresso, partidaEmAndamento: salvo.partidaEmAndamento })
        atualizarInfo({ versao, salvoEm: salvo.salvoEm, problema: null })
        return { situacao: 'carregado', progresso: salvo.progresso, partidaDescartada: salvo.partidaDescartada }

      case 'vazio':
        atualizarInfo({ versao: null, salvoEm: null, problema: null })
        return comecarDoZero('novo')

      case 'corrompido':
        // Guarda uma cópia antes que um salvamento novo passe por cima. A numeração continua
        // de onde estava, senão o número antigo pareceria "mais novo" e travaria os salvamentos.
        armazenamento.gravar(chaves.convidadoCorrompido, lido.valor)
        versao = versaoDoArquivo(lido.valor)
        atualizarInfo({ versao: null, salvoEm: null, problema: null })
        return comecarDoZero('corrompido')

      default: // 'formatoNovo': salvo por uma versão mais nova do jogo; esta aba não mexe nele
        bloqueado = true
        atualizarInfo({ versao: null, salvoEm: null, problema: 'formatoNovo' })
        return comecarDoZero('formatoNovo')
    }
  }

  function versaoNoNavegador() {
    const lido = armazenamento.ler(chaves.convidado)
    return lido.ok ? versaoDoArquivo(lido.valor) : 0
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
    const texto = escreverArquivoDeSave({ versao: novaVersao, salvoEm, progresso, partidaEmAndamento })
    const gravado = armazenamento.gravar(chaves.convidado, texto)
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
