// Segundos → "mm:ss" (HUD e Resumo da partida)
export function relogio(segundos) {
  const total = Math.max(0, Math.floor(segundos))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
