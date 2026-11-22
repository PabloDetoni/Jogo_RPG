import { combateDeTeste } from '../dados/balanceamento.js'
import { saltoMaximoPorQuadro } from './movimento.js'

// Opções de desenvolvedor na partida (RF61, Parte 1 de 11/2026). Funções puras. Só valem no npm run dev: quem chama
// passa "dev" (import.meta.env.DEV); no jogo publicado, tudo volta ao normal sozinho.

const { superVelocidade } = combateDeTeste.testes

// Os multiplicadores da super velocidade (1×, 3×, 6×)
export const multiplicadoresDaSuperVelocidade = superVelocidade.multiplicadores

// O próximo multiplicador do botão (1× → 3× → 6× → 1×). Um valor fora da lista volta ao primeiro.
export function proximoMultiplicador(atual, lista = multiplicadoresDaSuperVelocidade) {
  const indice = lista.indexOf(atual)
  return lista[(indice + 1) % lista.length]
}

// O multiplicador que vale de verdade: no jogo publicado (dev = false) é sempre 1, seja o que for que chegue
export function multiplicadorQueVale(multiplicador, dev) {
  if (!dev) return 1
  return multiplicadoresDaSuperVelocidade.includes(multiplicador) ? multiplicador : 1
}

// A trava "nunca teletransportar" (regras/movimento.js) com a exceção da super velocidade: só no dev, o maior passo de
// um quadro cresce junto com a velocidade. No jogo de verdade (dev = false), é exatamente o saltoMaximoPorQuadro.
export function saltoMaximoComDev(ms, { dev = false, multiplicador = 1 } = {}, config = combateDeTeste.movimento) {
  const vale = multiplicadorQueVale(multiplicador, dev)
  if (vale === 1) return saltoMaximoPorQuadro(ms, config)
  return saltoMaximoPorQuadro(ms, { ...config, velocidadeMaxima: config.velocidadeMaxima * vale })
}

// O ponto do mapa que corresponde a um clique no minimapa. clique: { x, y } dentro da caixa do minimapa (em px da
// tela); caixa: { largura, altura } dela; tamanho: { largura, altura } do mapa. Fica sempre dentro do mapa.
export function pontoDoMinimapa(clique, caixa, tamanho) {
  if (!caixa?.largura || !caixa?.altura) return null
  const fracaoX = Math.min(1, Math.max(0, clique.x / caixa.largura))
  const fracaoY = Math.min(1, Math.max(0, clique.y / caixa.altura))
  return { x: Math.round(fracaoX * tamanho.largura), y: Math.round(fracaoY * tamanho.altura) }
}
