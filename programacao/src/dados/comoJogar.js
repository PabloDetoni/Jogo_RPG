// "Como jogar" (RF13; ajustes de 14/10/2026): os controles e as regras que valem hoje. Abre na Tela inicial, na pausa e
// nas Configurações. Os números exatos (taxa, preços) ficam nas próprias telas; aqui, só o jeito de jogar.

export const controlesDoJogo = [
  { teclas: ['W', 'A', 'S', 'D'], acao: 'Andar' },
  { teclas: ['Mouse'], acao: 'Mirar' },
  { teclas: ['Clique'], acao: 'Atacar. Arqueiro: segure para puxar o arco (vai mais longe, mais rápido e bate mais forte) e solte para atirar' },
  { teclas: ['Espaço'], acao: 'Esquivar (só o Líder): para onde anda; parado, para a mira' },
  { teclas: ['1', '2', '3'], acao: 'Habilidades (gastam mana e têm recarga)' },
  { teclas: ['E'], acao: 'Pegar o item do chão perto do Líder' },
  { teclas: ['Tab'], acao: 'Abrir a mochila da partida (o jogo não pausa): E usa no Líder, R no aliado mais perto da mira' },
  { teclas: ['Q'], acao: 'Voltar ao Reino: 15 s de contagem fora de combate, só com a taxa normal (Q de novo cancela)' },
  { teclas: ['F'], acao: 'Fugir: 5 s, mesmo em combate, pagando uma parte do ouro (não se cancela)' },
  { teclas: ['Esc'], acao: 'Fechar a janela aberta; na partida, pausar (fora de combate); nas telas, voltar' },
  { teclas: ['M'], acao: 'Ligar e desligar o som' },
]

export const regrasDoJogo = [
  {
    titulo: 'O objetivo',
    texto: 'Saia do Reino com o seu grupo, derrote monstros, colete itens e volte com o ouro. A partida só termina quando você volta (Q ou F) ou quando todos desmaiam.',
  },
  {
    titulo: 'O grupo',
    texto: 'Você controla o Líder; os aliados lutam sozinhos, cada um com a IA do nível dele. O Sacerdote cura quem estiver ferido. Ninguém morre: quem fica sem vida desmaia e tem 30 s para ser levantado por alguém parado perto dele.',
  },
  {
    titulo: 'Voltar com o ouro',
    texto: 'Só o ouro paga taxa ao voltar; o XP nunca. Com Q você volta sem multa; com F foge na hora, pagando mais. Quanto mais longe do Reino, maior a taxa.',
  },
  {
    titulo: 'Itens no chão',
    texto: 'Os recursos do mapa (madeira, ervas, cogumelos) ficam até alguém pegar. O que um monstro deixa cair, ou o que você descarta, some em 30 s: o anel em volta mostra o tempo, e ele pisca nos últimos segundos.',
  },
  {
    titulo: 'Entre as partidas',
    texto: 'No Reino você compra, vende, equipa, distribui pontos de atributo, aprende habilidades e aceita missões. O nível ganho numa partida vale a partir da seguinte.',
  },
]
