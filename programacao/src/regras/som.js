// SOM (Fase 4, TASK-105; RF18): as partes puras do áudio. O gerenciador (audio/gerenciador.js) só toca o que estas
// regras dizem.

// Quanto cada parte toca, pelas Configurações: Música e Som ligam e desligam cada uma; o mudo (tecla M) silencia tudo sem
// mudar a escolha de cada uma
export function volumesDasPreferencias({ musica, som, mudo }) {
  return { musica: !mudo && musica ? 1 : 0, efeitos: !mudo && som ? 1 : 0 }
}

// A música de cada momento (Parte 13): a calma na Tela inicial, no Reino e nas telas de conta; a de aventura no Mapa,
// na Caravana e na Preparação; a leve nos minijogos; na partida, a da Floresta (exploração), a do combate (em combate)
// e a do chefe (com ele por perto, mesmo em combate); a Derrota na cutscene; no Resumo, a fanfarra da vitória (Grande
// Vitória e Vitória), a da derrota (continua a da cutscene, sem recomeçar) ou a calma (Retorno forçado)
const musicasDasTelas = { mapa: 'aventura', pontoPartida: 'aventura', preparacao: 'aventura', fazenda: 'minijogo', mina: 'minijogo', lago: 'minijogo', cutsceneDerrota: 'derrota' }
export function musicaDaTela(tela, { bossPorPerto = false, emCombate = false, resultado = null } = {}) {
  if (tela === 'partida') return bossPorPerto ? 'boss' : emCombate ? 'combate' : 'floresta'
  if (tela === 'resumo') return resultado === 'grandeVitoria' || resultado === 'vitoria' ? 'vitoria' : resultado === 'derrota' ? 'derrota' : 'reino'
  return musicasDasTelas[tela] ?? 'reino'
}

// Quanto dura a troca de uma música para a outra: dentro da partida (Floresta, combate e chefe), devagar, para o
// combate entrar e sair sem susto; nas outras trocas, rápida
const daPartida = new Set(['floresta', 'combate', 'boss'])
export function msDaTroca(de, para, { msDaTrocaDeMusica, msDaTrocaDoCombate }) {
  return daPartida.has(de) && daPartida.has(para) ? msDaTrocaDoCombate : msDaTrocaDeMusica
}

// O efeito de uma ação do Reino que deu certo (comprar e vender: a moeda; fabricar: a bigorna...) ou null
export function efeitoDaOperacao(operacao, tabela) {
  return Object.hasOwn(tabela, operacao) ? tabela[operacao] : null
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
