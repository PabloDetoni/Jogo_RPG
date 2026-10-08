// Ponte entre o React (telas, HUD, barra de teste) e o Phaser (a partida). Os dois só conversam por aqui.
// Phaser → React:
//   'situacao' (8 vezes por segundo: vida, mana, recargas, grupo, tempo, pontuação, ouro, custo da fuga, contagens)
//   'andamento' ({ emCombate, retornando, fugindo }, na hora em que muda: o Esc depende disso)
//   'mensagem' ({ texto, tipo }: crítico, nível, desmaio, perdido, retorno...)
//   'fimDaPartida' (como acabou e os números para o Resumo: CenaArena.terminar)
// React → Phaser: 'comando' ({ tipo, ... }: Q, fuga confirmada, Voltar ao Reino da pausa e a barra de teste) e a pausa.
export function criarPonte() {
  const ouvintes = new Map()
  let pausado = false

  function avisar(evento, dados) {
    for (const funcao of ouvintes.get(evento) ?? []) funcao(dados)
  }

  return {
    // Devolve a função que para de ouvir
    ouvir(evento, funcao) {
      if (!ouvintes.has(evento)) ouvintes.set(evento, new Set())
      ouvintes.get(evento).add(funcao)
      return () => ouvintes.get(evento).delete(funcao)
    },
    avisar,
    // A pausa é um estado, não só um aviso: a cena, que carrega depois do React, lê o valor atual
    get pausado() {
      return pausado
    },
    definirPausa(valor) {
      if (valor === pausado) return
      pausado = valor
      avisar('pausa', valor)
    },
  }
}
