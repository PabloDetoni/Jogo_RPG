// Dicas sorteadas na tela de carregamento da partida (ajustes de 14/10/2026). Uma frase curta cada, sobre o jeito de
// jogar. PROVISÓRIO: o grupo pode trocar ou acrescentar.
export const dicasDoCarregamento = [
  'Segure o clique com o Arqueiro: a flecha carregada vai mais longe e bate mais forte.',
  'Espaço esquiva: durante o avanço, o Líder não leva dano.',
  'Q volta ao Reino só com a taxa normal; F foge na hora, mas custa mais.',
  'Quem desmaia tem 30 s: fique parado perto dele, sem inimigos em volta, para levantá-lo.',
  'O que um monstro deixa cair some em 30 s. Os recursos do mapa ficam até alguém pegar.',
  'Tab abre a mochila sem pausar. Com o mouse num consumível, E usa no Líder e R no aliado que mais precisa.',
  'Quanto mais longe do Reino, maior a taxa do ouro. O XP nunca paga taxa.',
  'Em combate não dá para pausar nem começar o retorno com Q.',
  'O Sacerdote cura sozinho quem estiver ferido, ele mesmo também.',
  'A primeira visita a cada área do mapa dá XP.',
  'Dentro do domínio do Boss, a taxa sobe. Cada golpe dele é avisado no chão antes.',
  'O nível ganho na partida vale a partir da próxima.',
]

// Sorteia uma dica (sorteio: de 0 a 1)
export function dicaSorteada(sorteio = Math.random) {
  return dicasDoCarregamento[Math.min(dicasDoCarregamento.length - 1, Math.floor(sorteio() * dicasDoCarregamento.length))]
}
