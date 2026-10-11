// O "?" de cada tela (Fase 4.5): uma explicação curta de como ela funciona. A tela sem texto aqui não mostra o "?".
// Os números (preços, partidas, multa) aparecem na própria tela; aqui fica só o jeito de usar.

export const ajudaDasTelas = {
  reino: [
    'O Reino é a sua base entre as partidas. Cada lugar faz uma coisa:',
    'Guilda: aceitar missões e contratar personagens. Mercado: comprar, vender e trocar itens. Forja: equipar os personagens e fabricar equipamento.',
    'Mochila: tudo o que você tem. Árvores: distribuir pontos de atributo e aprender habilidades. Jogar: abrir o mapa e começar uma partida.',
    'Em cima ficam o seu Líder, o ouro e a missão que você está fazendo.',
  ],
  mochila: [
    'Aqui ficam todos os itens que você tem no Reino. Cada quadradinho é um item: o número no canto é a quantidade, e a cor da borda é a raridade (cinza comum, verde incomum, azul raro, laranja especial).',
    'Os botões de cima filtram por tipo. Clique num item para ver o que ele faz.',
    'Descartar tira o item para sempre (o jogo pergunta antes). Para ganhar ouro com ele, venda no Mercado.',
  ],
  mercado: [
    'Comprar: escolha uma oferta e veja quanto ouro fica depois. As ofertas com ★ mudam com as partidas jogadas.',
    'Vender: a sua Mochila, com quanto o Mercado paga por cada item (metade do preço). Equipamento se vende na Forja.',
    'Trocar: você dá os itens da esquerda e recebe os da direita, sem ouro. O que falta aparece em vermelho.',
    'Catálogo: tudo o que existe no beta e de onde vem. O que você ainda não encontrou aparece apagado.',
  ],
  forja: [
    'Equipar: escolha o personagem e clique num dos 7 espaços em volta do boneco. Ao lado aparecem os itens da Mochila que servem ali; antes de equipar, o jogo mostra os atributos antes e depois (verde sobe, vermelho desce).',
    'Arma e escudo são só da própria classe; capacete, peitoral, calças, botas e manoplas servem para todas.',
    'Comprar e Vender: equipamento comum à venda, e a Forja paga metade do preço pelo que você vende.',
    'Fabricar: a receita mostra os materiais (tem/precisa), o ouro e o resultado. O botão só acende quando você tem tudo.',
  ],
  guilda: [
    'Missões: o quadro tem um cartaz por missão. Aceite uma (só uma por vez); o progresso conta a partir daí e soma entre as partidas. Cumprida, Entregar dá a recompensa; Abandonar custa uma multa.',
    'Contrato temporário: o personagem vai junto por algumas partidas, com nível e equipamento fixos; não ganha XP nem pode ser Líder.',
    'Contrato permanente: o personagem fica para sempre, começa no nível 1, ganha XP e pode ser Líder.',
  ],
  arvores: [
    'Cada personagem tem os seus pontos. Em Atributos, use + e − (o pentágono mostra como fica) e Aplicar para fixar; só o pergaminho de redefinição devolve os pontos.',
    'Em Habilidades, cada ponto evolui uma habilidade até o nível 5; a próxima do ramo libera quando a anterior chega ao 5. Até 3 ativas vão nas teclas 1 a 3.',
  ],
  salaoGloria: [
    'O ranking mostra só jogadores com conta. Os 3 primeiros ficam em destaque, e a sua linha também (com conta).',
    'Minhas partidas (com conta) é o seu histórico. Conquistas mostra o progresso de cada uma e o que ela dá.',
  ],
  mapa: [
    'Escolha onde ir. No beta, só a Floresta está aberta; os outros biomas aparecem bloqueados.',
    'No Planalto, a Fazenda, a Mina e o Lago são minijogos rápidos: dão recursos e XP, sem taxa e sem contar como partida.',
  ],
  pontoPartida: ['Escolha onde o grupo começa. Só as regiões que você já descobriu ficam liberadas; quanto mais longe, mais difícil e maior a taxa da fuga.'],
  preparacao: [
    'Escolha o Líder (só personagens permanentes) e o que vai na mochila da partida.',
    'À esquerda, o que dá para levar da Mochila do Reino; clique para passar 1 para a direita (a mochila da partida). Clique na direita para devolver.',
    'A barra mostra o peso: a capacidade vem da Força do grupo, e o que você coletar na partida também ocupa. Os itens só saem da Mochila do Reino no fim da partida, e só o que foi usado.',
  ],
  selecaoClasse: ['Clique numa classe para ver o papel dela e o pentágono dos atributos. Escolher é para sempre: ela vira o seu primeiro personagem e o Líder.'],
  resumo: ['O resultado da partida, o tempo, a pontuação e o que você ganhou. Só o ouro paga taxa; o XP nunca.'],
  fazenda: ['Clique nas plantas maduras (douradas) antes que murchem. Cada uma dá trigo e XP; às vezes vem algo raro.'],
  mina: ['Clique 3 vezes em cada pedra para quebrar. Cada pedra dá minério de ferro e XP; às vezes vem um cristal.'],
  lago: ['Quando a boia afundar, clique rápido. Antes da hora, o peixe foge. Cada peixe dá XP; às vezes vem uma pérola.'],
}
