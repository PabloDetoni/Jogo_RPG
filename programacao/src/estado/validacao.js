// Checagens pequenas para dados que vêm de fora do jogo (o que estava salvo no navegador).

export function ehObjeto(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

export function inteiroEntre(valor, minimo, maximo, padrao) {
  return Number.isInteger(valor) && valor >= minimo && valor <= maximo ? valor : padrao
}

// Número inteiro maior ou igual a zero; qualquer outra coisa vira 0.
export function inteiroNaoNegativo(valor) {
  return Number.isFinite(valor) && valor >= 0 ? Math.floor(valor) : 0
}
