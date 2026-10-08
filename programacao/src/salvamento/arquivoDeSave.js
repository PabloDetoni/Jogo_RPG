import { normalizarProgresso } from '../estado/progresso.js'
import { ehObjeto } from '../estado/validacao.js'
import { formatoAtual, migrarParaFormatoAtual } from './formato.js'

// O arquivo de save: o texto guardado no navegador. Serve para o convidado e, na etapa 8,
// para a cópia local da conta, que precisa da mesma regra de partida não terminada (RF11, RF12).
//
// { formato, versao, salvoEm, progresso, partidaEmAndamento, versaoNoBanco }
// - formato: estrutura do arquivo (formato.js)
// - versao: sobe a cada salvamento; uma versão antiga nunca sobrescreve uma mais nova (RNF06)
// - partidaEmAndamento: preenchida entre "Começar partida" e o resultado
// - versaoNoBanco (só na cópia local da conta, Fase 2): a versão do Supabase de onde esta cópia partiu; no login, se for
//   igual à do banco, vale a cópia do navegador (RF11). Campo novo e opcional: o formato continua o 1.

// Lê um texto salvo. situacao: 'vazio', 'carregado', 'corrompido' ou 'formatoNovo'.
// Quando há partida em andamento, ela é descartada: o progresso salvo já é o do começo
// da partida (o progresso não muda durante ela), então basta avisar com partidaDescartada.
export function lerArquivoDeSave(texto) {
  if (texto === null || texto === undefined) return { situacao: 'vazio' }

  const estragado = { situacao: 'corrompido' }
  let dados
  try {
    dados = JSON.parse(texto)
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

  const partidaEmAndamento = ehObjeto(dados.partidaEmAndamento) ? dados.partidaEmAndamento : null
  return {
    situacao: 'carregado',
    progresso,
    partidaEmAndamento,
    partidaDescartada: partidaEmAndamento !== null,
    versao: Number.isInteger(dados.versao) && dados.versao >= 0 ? dados.versao : 0,
    salvoEm: typeof dados.salvoEm === 'string' ? dados.salvoEm : null,
    versaoNoBanco: Number.isInteger(dados.versaoNoBanco) && dados.versaoNoBanco >= 0 ? dados.versaoNoBanco : 0,
  }
}

export function escreverArquivoDeSave({ versao, salvoEm, progresso, partidaEmAndamento, versaoNoBanco = 0 }) {
  return JSON.stringify({ formato: formatoAtual, versao, salvoEm, progresso, partidaEmAndamento, versaoNoBanco })
}

// Versão gravada num texto de save, mesmo que o resto esteja estragado; 0 quando não dá para ler.
export function versaoDoArquivo(texto) {
  if (texto === null || texto === undefined) return 0
  try {
    const dados = JSON.parse(texto)
    return Number.isInteger(dados?.versao) ? dados.versao : 0
  } catch {
    return 0
  }
}
