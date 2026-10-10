// SOM (Fase 4, TASK-105; RF18): as partes puras do áudio. O gerenciador (audio/gerenciador.js) só toca o que estas
// regras dizem.

// Quanto cada parte toca, pelas Configurações: Música e Som ligam e desligam cada uma; o mudo (tecla M) silencia tudo sem
// mudar a escolha de cada uma
export function volumesDasPreferencias({ musica, som, mudo }) {
  return { musica: !mudo && musica ? 1 : 0, efeitos: !mudo && som ? 1 : 0 }
}

// A música de cada momento: a Derrota na cutscene, a da Floresta na partida (a do Boss com ele por perto) e a do Reino no
// resto (Tela inicial, Reino, Mapa, telas de conta...)
export function musicaDaTela(tela, { bossPorPerto = false } = {}) {
  if (tela === 'cutsceneDerrota') return 'derrota'
  if (tela === 'partida') return bossPorPerto ? 'boss' : 'floresta'
  return 'reino'
}

// O efeito do ataque básico de cada classe
export function efeitoDoAtaque(classe) {
  return { guerreiro: 'ataqueGuerreiro', arqueiro: 'ataqueArqueiro', mago: 'ataqueMago', tanque: 'ataqueTanque', sacerdote: 'ataqueSacerdote' }[classe] ?? null
}

// Pode tocar este efeito agora? (não repete o mesmo em menos de msEntreIguais)
export function podeTocarDeNovo(ultimoPorEfeito, id, agora, msEntreIguais) {
  const ultimo = ultimoPorEfeito[id]
  return ultimo === undefined || agora - ultimo >= msEntreIguais
}

// O arquivo de cada nome, entre os que existem: "musica-reino" → a url de musica-reino.ogg (ou .mp3, .wav)
export function arquivoDoSom(nome, encontrados) {
  return encontrados[nome] ?? null
}
