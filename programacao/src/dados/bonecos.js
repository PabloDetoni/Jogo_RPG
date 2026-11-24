// Bonecos em blocos (RNF15; Parte 2 de 11/2026, refeitos na Parte 4 a pedido do Pablo). PROVISÓRIO até a pixel art
// (quando a imagem existir em src/assets/arte/, ela substitui o boneco inteiro: Entidade.usarArte).
// Pedido do Pablo (22/11): blocões coloridos e bonitinhos, sem armas nem roupas. Em cima, um quadrado grande de cantos
// arredondados (cabeça e corpo juntos, "cabeçudinho"); logo abaixo, um retângulo menor (o tronco); duas mãozinhas e
// dois pezinhos flutuando, soltos; olhinhos; tudo balançando de leve. Cor: a da classe (a do HUD, dados/classes.js),
// com o contorno escuro. No máximo um chapéu por classe.
// Medidas em px para um personagem de tamanho 40 (combateDeTeste.personagem.tamanho); o desenho escala junto.
// O centro (0, 0) é o centro da hitbox; y cresce para baixo; o boneco olha para a direita (o lado esquerdo espelha).

export const medidasDoBoneco = {
  cabeca: { largura: 26, altura: 24, y: -9, raio: 7 }, // y = centro
  tronco: { largura: 16, altura: 9, y: 7.5, raio: 3.5 },
  mao: { lado: 6.5, x: 14, y: 6, raio: 2.5 },
  pe: { largura: 7.5, altura: 5, x: 5, y: 17.5, raio: 2.5 },
  olho: { largura: 2.5, altura: 4.5, x: 3.8, y: -8, frente: 3 }, // frente: o quanto os olhos vão para o lado que olha
  contorno: { espessura: 1.5, cor: 0x2b1d1a },
  olhos: 0x2b1d1a,
}

// O chapéu de cada classe (o Tanque não usa) e as cores fixas de cada chapéu. O chapéu do Mago e o capuz do Arqueiro
// usam um tom mais escuro da cor da classe (escurecer em regras/bonecos.js).
export const chapeusDasClasses = { guerreiro: 'elmo', mago: 'chapeuDeMago', tanque: null, sacerdote: 'mitra', arqueiro: 'capuz' }
export const coresDosChapeus = {
  elmo: { metal: 0xc3cbd6, sombra: 0x8a94a3, fenda: 0x2b1d1a, penacho: 0xd8483e },
  chapeuDeMago: { escurecer: 0.35, estrela: 0xffd54a },
  mitra: { pano: 0xf7f4ec, ouro: 0xd4a017 },
  capuz: { escurecer: 0.35 },
}

// Mobs e animais em blocos (Parte 4b): cada espécie com forma e cor próprias, para nunca se confundirem. Os
// quadrúpedes são um bloco deitado com a cabeça na frente e quatro pezinhos flutuando; a aranha, um bloco redondo com
// patinhas. Medidas em px para o "tamanho" do mob (mundo.mobs, em dados/balanceamento.js): o desenho escala com ele.
export const bichosEmBlocos = {
  lobo: {
    forma: 'quadrupede',
    tamanhoDeReferencia: 34,
    cor: 0x8f949c, // cinza
    barriga: 0xc9ccd1,
    corpo: { largura: 30, altura: 16, y: 1, raio: 6 },
    cabeca: { largura: 15, altura: 13, x: 16, y: -6, raio: 4 },
    pes: { largura: 5, altura: 4.5, xs: [-11, -5, 6, 12], y: 12, raio: 2 },
    rabo: { largura: 8, altura: 4, x: -17, y: -2 },
    detalhe: 'orelhas',
    corDoDetalhe: 0x5e636b,
  },
  javali: {
    forma: 'quadrupede',
    tamanhoDeReferencia: 42,
    cor: 0x5a3a24, // marrom-escuro
    barriga: 0x7a5236,
    corpo: { largura: 38, altura: 18, y: 4, raio: 7 }, // baixo e largo
    cabeca: { largura: 15, altura: 14, x: 21, y: 2, raio: 4 },
    pes: { largura: 6, altura: 4.5, xs: [-13, -6, 7, 14], y: 16, raio: 2 },
    rabo: { largura: 5, altura: 3, x: -21, y: -1 },
    detalhe: 'presas',
    corDoDetalhe: 0xf2ead8,
  },
  cervo: {
    forma: 'quadrupede',
    tamanhoDeReferencia: 34,
    cor: 0xc89a66, // marrom-claro
    barriga: 0xe9d2b0,
    corpo: { largura: 26, altura: 15, y: -1, raio: 6 }, // mais alto: patas mais longas
    cabeca: { largura: 12, altura: 12, x: 15, y: -13, raio: 4 },
    pes: { largura: 4, altura: 7, xs: [-9, -4, 5, 10], y: 12, raio: 2 },
    rabo: { largura: 4, altura: 4, x: -14, y: -4 },
    detalhe: 'chifres',
    corDoDetalhe: 0x7a5236,
  },
  // Parte 6a: o Lobo Alfa (o lobo maior e mais escuro, com a juba clara no pescoço) e o coelho (pequeno, orelhas longas)
  loboAlfa: {
    forma: 'quadrupede',
    tamanhoDeReferencia: 34,
    cor: 0x5e636b, // cinza-escuro
    barriga: 0xa9adb3,
    corpo: { largura: 31, altura: 17, y: 1, raio: 6 },
    cabeca: { largura: 15, altura: 14, x: 17, y: -7, raio: 4 },
    pes: { largura: 5.5, altura: 4.5, xs: [-11, -5, 6, 12], y: 12.5, raio: 2 },
    rabo: { largura: 9, altura: 4.5, x: -18, y: -3 },
    detalhe: 'juba',
    corDoDetalhe: 0xd6d9dd,
  },
  coelho: {
    forma: 'quadrupede',
    tamanhoDeReferencia: 22,
    cor: 0xb9aea4, // pardo-claro
    barriga: 0xece6df,
    corpo: { largura: 18, altura: 13, y: 2, raio: 6 },
    cabeca: { largura: 11, altura: 10, x: 9, y: -4, raio: 4 },
    pes: { largura: 5, altura: 3.5, xs: [-6, -2, 3, 6], y: 9, raio: 1.5 },
    rabo: { largura: 5, altura: 5, x: -10, y: -1, cor: 0xf4f0ea }, // o pompom branco
    detalhe: 'orelhasLongas',
    corDoDetalhe: 0xe8b4b0,
  },
  aranha: {
    forma: 'aranha',
    tamanhoDeReferencia: 30,
    cor: 0x3a2a3d, // bem escura
    corpo: { raio: 11, y: 0 },
    cabeca: { raio: 6, x: 10, y: 2 },
    patas: { quantas: 4, comprimento: 13, espessura: 2.2, abertura: 0.55 }, // por lado
    olhos: 0xff5a5a,
  },
}

// Os números da pose e do balanço (regras/bonecos.js)
export const poseDosBonecos = {
  // cos da mira abaixo disso (perto da vertical): o corpo não vira (evita o pisca-pisca)
  histereseDoLado: 0.2,
  // ritmo do balanço (fase por milissegundo)
  faseAndando: 0.0105,
  faseParado: 0.0028,
  // parado: um sobe e desce suave; andando: os pés alternam e as mãos balançam ("balangandinho", nada exagerado)
  parado: { corpo: 0.8, mao: 0.7 },
  andando: { pe: 2.5, levanta: 1.6, corpo: 1.2, mao: 2 },
  // o "soquinho" do ataque: a mão do lado da mira vai na direção da mira e volta (sobe até "pico" do tempo do golpe)
  soco: { pico: 0.35, distancia: 9 },
  msDoAtaque: 320,
  // Desempenho (jogo/desenhoEmBlocos.js): cada pose vira uma textura feita uma vez. O balanço tem estes quadros por volta,
  // o soquinho estes níveis (e 8 direções); o quadro da textura tem este lado (px, no tamanho de referência)
  quadrosDoBalanco: 8,
  niveisDoSoco: 3,
  ladoDaTextura: 86,
  // caído: o desenho escurece (o tint multiplica as cores por este cinza)
  tintDoCaido: 0x8c8c8c,
}
