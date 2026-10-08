import { progressoInicial } from '../estado/progresso.js'
import { escreverArquivoDeSave, lerArquivoDeSave, versaoDoArquivo } from './arquivoDeSave.js'

// Lê e grava um save no navegador (RF01, RF09, RF11, RF12, RNF06): o do convidado e, na Fase 2, a cópia local de
// cada conta. O formato do arquivo e a regra da partida não terminada ficam em arquivoDeSave.js.
//
// armazenamento: vem de armazenamento.js, ou é null quando o navegador não deixa guardar nada.
// chave e chaveCorrompida: onde o save fica (salvamento/chaves.js). perfil: quem este salvador grava
// ('convidado' ou 'conta'); um salvamento pedido para outro perfil é ignorado.
// agora: devolve a data atual (dá para trocar nos testes).
export function criarSalvadorLocal(armazenamento, { chave, chaveCorrompida, perfil }, agora = () => new Date()) {
  let versao = 0 // versão já gravada por esta aba
  let versaoNoBanco = 0 // só da conta: a versão do Supabase de onde esta cópia partiu (RF11)
  let ultimoConteudo = null // o que foi gravado por último, para não gravar de novo sem mudança
  let ultimosDados = null // o último save gravado, para regravar só o versaoNoBanco
  let bloqueado = false // true = esta aba não grava mais nada
  let info = { versao: null, salvoEm: null, problema: armazenamento ? null : 'indisponivel' }
  const ouvintes = new Set()

  function atualizarInfo(mudancas) {
    info = { ...info, ...mudancas }
    for (const ouvinte of ouvintes) ouvinte()
  }

  // Devolve o progresso para começar a jogar.
  // situacao: 'novo', 'carregado', 'corrompido', 'formatoNovo' ou 'indisponivel'.
  function carregar() {
    versao = 0
    versaoNoBanco = 0
    ultimoConteudo = null
    ultimosDados = null
    bloqueado = false
    const comecarDoZero = (situacao) => ({ situacao, progresso: progressoInicial(), partidaDescartada: false, versao: 0, versaoNoBanco: 0 })

    if (!armazenamento) return comecarDoZero('indisponivel')
    const lido = armazenamento.ler(chave)
    if (!lido.ok) {
      atualizarInfo({ problema: 'indisponivel' })
      return comecarDoZero('indisponivel')
    }

    const salvo = lerArquivoDeSave(lido.valor)
    switch (salvo.situacao) {
      case 'carregado':
        versao = salvo.versao
        versaoNoBanco = salvo.versaoNoBanco
        ultimoConteudo = JSON.stringify({ progresso: salvo.progresso, partidaEmAndamento: salvo.partidaEmAndamento })
        atualizarInfo({ versao, salvoEm: salvo.salvoEm, problema: null })
        return {
          situacao: 'carregado',
          progresso: salvo.progresso,
          partidaDescartada: salvo.partidaDescartada,
          partidaEmAndamento: salvo.partidaEmAndamento,
          versao,
          versaoNoBanco,
        }

      case 'vazio':
        atualizarInfo({ versao: null, salvoEm: null, problema: null })
        return comecarDoZero('novo')

      case 'corrompido':
        // Guarda uma cópia antes que um salvamento novo passe por cima. A numeração continua
        // de onde estava, senão o número antigo pareceria "mais novo" e travaria os salvamentos.
        armazenamento.gravar(chaveCorrompida, lido.valor)
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
    const lido = armazenamento.ler(chave)
    return lido.ok ? versaoDoArquivo(lido.valor) : 0
  }

  function gravar(dados) {
    const texto = escreverArquivoDeSave(dados)
    const gravado = armazenamento.gravar(chave, texto)
    if (!gravado.ok) {
      atualizarInfo({ problema: gravado.erro })
      return false
    }
    ultimosDados = dados
    atualizarInfo({ versao: dados.versao, salvoEm: dados.salvoEm, problema: null })
    return true
  }

  // Grava o progresso, se ele mudou desde o último salvamento. Recebe o resultado de dadosParaSalvar
  // (estado/estadoDoJogo.js). Devolve a versão que ficou gravada (ou null se nada foi gravado).
  function salvar({ perfil: deQuem, progresso, partidaEmAndamento }) {
    if (deQuem !== perfil || bloqueado || !armazenamento) return null
    const conteudo = JSON.stringify({ progresso, partidaEmAndamento })
    if (conteudo === ultimoConteudo) return versao

    // RNF06: se outra aba gravou uma versão mais nova, esta não passa por cima
    if (versaoNoNavegador() > versao) {
      bloqueado = true
      atualizarInfo({ problema: 'conflito' })
      return null
    }

    const novaVersao = versao + 1
    if (!gravar({ versao: novaVersao, salvoEm: agora().toISOString(), progresso, partidaEmAndamento, versaoNoBanco })) return null
    versao = novaVersao
    ultimoConteudo = conteudo
    return versao
  }

  // Conta: o banco aceitou esta versão; a cópia local passa a ter partido dela (sem subir a versão)
  function marcarNoBanco(versaoAceita) {
    versaoNoBanco = versaoAceita
    if (ultimosDados && !bloqueado && armazenamento) gravar({ ...ultimosDados, versaoNoBanco })
  }

  // Conta: no login, a cópia local passa a ser o progresso escolhido (do banco, do convidado...), com a versão dele
  function comecarCom({ progresso, versao: versaoInicial, versaoNoBanco: doBanco }) {
    if (!armazenamento) return
    bloqueado = false
    versao = versaoInicial
    versaoNoBanco = doBanco
    ultimoConteudo = JSON.stringify({ progresso, partidaEmAndamento: null })
    gravar({ versao, salvoEm: agora().toISOString(), progresso, partidaEmAndamento: null, versaoNoBanco })
  }

  // Painel de desenvolvimento (e a passagem do convidado para a conta): apaga o save e para de salvar nesta aba.
  function apagar() {
    bloqueado = true
    versao = 0
    ultimoConteudo = null
    ultimosDados = null
    if (armazenamento) {
      armazenamento.apagar(chave)
      armazenamento.apagar(chaveCorrompida)
    }
    atualizarInfo({ versao: null, salvoEm: null })
  }

  return {
    carregar,
    salvar,
    marcarNoBanco,
    comecarCom,
    apagar,
    get versao() {
      return versao
    },
    // O progresso da versão gravada por último (é ele que a conta envia ao banco com esta versão)
    get progresso() {
      return ultimosDados?.progresso ?? null
    },
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
