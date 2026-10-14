import { diferencaDoRelogio } from '../regras/rodadasDoDia.js'

// A hora do jogo (ajustes de 14/10/2026): para a conta, a hora do servidor (Supabase), para as rodadas diárias dos
// minijogos não dependerem do relógio do computador; para o convidado, a do navegador.
// A diferença entre o servidor e o navegador é medida ao entrar na conta e a cada sinal da sessão (1 minuto), pela
// função hora_do_servidor do banco (programacao/supabase/002_hora_do_servidor.sql). Enquanto ela não existir (SQL ainda
// não rodado), vale a hora em que o Supabase emitiu o token da sessão (o "iat", que vem do servidor); sem internet, fica
// a última medida; sem nenhuma, o relógio do navegador.

let diferenca = 0
let fonte = 'navegador' // 'servidor' | 'token' | 'navegador'

export function horaDoJogo() {
  return Date.now() + diferenca
}

export function fonteDaHora() {
  return fonte
}

// A hora que o servidor devolveu (texto ISO), com o relógio do navegador antes e depois do pedido
export function definirHoraDoServidor(hora, antes, depois) {
  if (!Number.isFinite(Date.parse(hora))) return false
  diferenca = diferencaDoRelogio(hora, antes, depois)
  fonte = 'servidor'
  return true
}

// Reserva: o token acabou de ser emitido pelo Supabase (no login); iat em segundos
export function definirHoraPeloToken(iatEmSegundos, agora = Date.now()) {
  if (fonte === 'servidor' || !Number.isFinite(iatEmSegundos)) return false
  diferenca = Math.round(iatEmSegundos * 1000 - agora)
  fonte = 'token'
  return true
}

// O "iat" de um token JWT (ou null)
export function iatDoToken(token) {
  try {
    const parte = String(token).split('.')[1]
    const json = JSON.parse(atob(parte.replace(/-/g, '+').replace(/_/g, '/')))
    return Number.isFinite(json.iat) ? json.iat : null
  } catch {
    return null
  }
}

// Saiu da conta: volta ao relógio do navegador
export function esquecerHoraDoServidor() {
  diferenca = 0
  fonte = 'navegador'
}
