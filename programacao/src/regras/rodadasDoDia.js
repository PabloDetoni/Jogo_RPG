import { minijogos } from '../dados/balanceamento.js'

// MINIJOGOS DIÁRIOS (ajustes de 14/10/2026; RF54): cada minijogo (Fazenda, Mina, Lago) tem um número de rodadas por dia
// (minijogos.rodadasPorDia, PROVISÓRIO), que renova à meia-noite de Brasília. O contador fica no save:
// minijogosDoDia = { dia: 'AAAA-MM-DD' (o dia de Brasília), rodadas: { fazenda, mina, lago } }.
// "agora" vem da hora do servidor para a conta (para não dar para burlar mudando o relógio) e da do navegador para o
// convidado; aqui chega só o número (ms desde 1970), já corrigido.
// Brasília não tem horário de verão desde 2019: o dia vira às 03:00 UTC.

const msPorHora = 60 * 60 * 1000
export const fusoDeBrasilia = -3 // horas em relação ao UTC

// O dia de Brasília de um instante ('AAAA-MM-DD')
export function diaDeBrasilia(agora) {
  return new Date(agora + fusoDeBrasilia * msPorHora).toISOString().slice(0, 10)
}

// Quanto falta para a próxima meia-noite de Brasília (ms)
export function msAteRenovar(agora) {
  const local = agora + fusoDeBrasilia * msPorHora
  const meiaNoite = Math.floor(local / (24 * msPorHora) + 1) * 24 * msPorHora
  return meiaNoite - local
}

// "05:12" (horas e minutos até renovar; o último minuto aparece como 00:01)
export function textoAteRenovar(agora) {
  const minutos = Math.max(1, Math.ceil(msAteRenovar(agora) / 60000))
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
}

// O contador de hoje: de outro dia (ou estragado) começa do zero
export function contadorDeHoje(salvo, agora) {
  const dia = diaDeBrasilia(agora)
  if (!salvo || salvo.dia !== dia || typeof salvo.rodadas !== 'object' || salvo.rodadas === null) return { dia, rodadas: {} }
  return { dia, rodadas: { ...salvo.rodadas } }
}

// Quantas rodadas já foram jogadas hoje e quantas sobram
export function rodadasDoMinijogo(salvo, jogo, agora, porDia = minijogos.rodadasPorDia) {
  const { rodadas } = contadorDeHoje(salvo, agora)
  const jogadas = Math.max(0, Math.floor(Number(rodadas[jogo]) || 0))
  return { jogadas: Math.min(jogadas, porDia), porDia, sobram: Math.max(0, porDia - jogadas) }
}

// Pode começar uma rodada? { ok } ou { ok: false, motivo }
export function podeJogarRodada(salvo, jogo, agora, porDia = minijogos.rodadasPorDia) {
  const { sobram } = rodadasDoMinijogo(salvo, jogo, agora, porDia)
  if (sobram > 0) return { ok: true }
  return { ok: false, motivo: `Sem rodadas hoje: as ${porDia} já foram jogadas. Renova em ${textoAteRenovar(agora)} (meia-noite de Brasília).` }
}

// Conta uma rodada (ao começar): devolve o contador novo para o save
export function contarRodada(salvo, jogo, agora) {
  const hoje = contadorDeHoje(salvo, agora)
  return { dia: hoje.dia, rodadas: { ...hoje.rodadas, [jogo]: (Math.floor(Number(hoje.rodadas[jogo]) || 0)) + 1 } }
}

// O texto da tela: "Rodadas hoje: 2 de 3 · renova em 05:12"
export function textoDasRodadas(salvo, jogo, agora, porDia = minijogos.rodadasPorDia) {
  const { sobram } = rodadasDoMinijogo(salvo, jogo, agora, porDia)
  return `Rodadas hoje: ${sobram} de ${porDia} · renova em ${textoAteRenovar(agora)}`
}

// Confere o contador que veio do save (normalizarProgresso): o que estiver estragado vira null
export function normalizarMinijogosDoDia(dados) {
  if (!dados || typeof dados !== 'object' || typeof dados.dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dados.dia)) return null
  const rodadas = {}
  for (const [jogo, valor] of Object.entries(dados.rodadas ?? {})) {
    const numero = Math.floor(Number(valor))
    if (typeof jogo === 'string' && Number.isFinite(numero) && numero > 0) rodadas[jogo] = Math.min(numero, 999)
  }
  return { dia: dados.dia, rodadas }
}

// A diferença entre a hora do servidor e a do navegador (ms), medida ao ler a hora do servidor. Sem ela, 0.
export function diferencaDoRelogio(horaDoServidor, antesDoPedido, depoisDoPedido) {
  const servidor = Date.parse(horaDoServidor)
  if (!Number.isFinite(servidor)) return 0
  return Math.round(servidor - (antesDoPedido + depoisDoPedido) / 2)
}
