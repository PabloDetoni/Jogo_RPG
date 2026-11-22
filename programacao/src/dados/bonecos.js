// Bonecos de quadradinho dos 5 personagens (RNF15, Parte 2 de 11/2026). PROVISÓRIO até a pixel art (quando a imagem da
// classe existir em src/assets/arte/, ela substitui o boneco inteiro: Entidade.usarArte).
// Pedido do Pablo (20/11): ainda é quadradinho, mas com corpo grande, cabeça grande ("cabeçudinho"), um retângulo
// embaixo, duas perninhas e dois bracinhos, balançando de leve; uma mão segura a arma e a outra fica para baixo.
// As roupas seguem a referência própria do Pablo (Guia de Arte, seção 3); o retângulo embaixo do corpo (a saia/faixa)
// tem a cor-assinatura da classe, a mesma do HUD.
// Medidas em px para um personagem de tamanho 40 (combateDeTeste.personagem.tamanho); o desenho escala junto.
// O centro (0, 0) é o centro da hitbox; y cresce para baixo.

export const pecasDoBoneco = {
  cabeca: { largura: 22, altura: 18, y: -12 }, // y = centro
  corpo: { largura: 18, altura: 12, y: 2 },
  saia: { largura: 20, altura: 5, y: 9.5 },
  perna: { largura: 5, altura: 8, x: 4.5, y: 12 }, // y = topo da perna
  braco: { largura: 4.5, comprimento: 11, ombroX: 9, ombroY: -2 },
  olho: { largura: 2, altura: 3, x: 3.5, y: -11, frente: 3 }, // frente: o quanto os olhos vão para o lado que olha
  contorno: { espessura: 1.5, cor: 0x2b1d1a },
  pele: 0xf2c79a,
  olhos: 0x2b1d1a,
}

// Cada classe: as cores das peças, o acessório da cabeça e a arma
export const receitasDosBonecos = {
  guerreiro: {
    corpo: 0x9aa4b0, // armadura cinza
    detalhe: 0xd4a017, // dourado
    pernas: 0x5a6170,
    bracos: 0x9aa4b0,
    cabeca: { tipo: 'elmo', cor: 0xb7c0cb, fenda: 0x2b1d1a, penacho: 0xc0392b },
    capa: 0xc0392b, // capa vermelha atrás do corpo
    arma: 'espada',
  },
  mago: {
    corpo: 0x4b3bb0, // manto azul-arroxeado
    detalhe: 0xd4a017,
    pernas: 0x2e2470,
    bracos: 0x4b3bb0,
    cabeca: { tipo: 'chapeu', cor: 0x3a2d8f, aba: 0x2e2470, faixa: 0xd4a017 },
    arma: 'cajado',
  },
  tanque: {
    corpo: 0x2f4f9c, // armadura azul
    detalhe: 0xd4a017,
    pernas: 0x22396f,
    bracos: 0x2f4f9c,
    cabeca: { tipo: 'cabelo', cor: 0x6b3f1f },
    arma: 'escudo',
  },
  sacerdote: {
    corpo: 0xf1ede4, // túnica branca
    detalhe: 0x3d6fd1, // faixa azul
    pernas: 0xd9d3c4,
    bracos: 0xf1ede4,
    cabeca: { tipo: 'capuz', cor: 0xf7f4ec, borda: 0xd4a017 },
    arma: 'cetro',
  },
  arqueiro: {
    corpo: 0x7a4a2a, // couro marrom
    detalhe: 0x3f8f3a, // verde
    pernas: 0x5a361e,
    bracos: 0x7a4a2a,
    cabeca: { tipo: 'capuz', cor: 0x3f8f3a, borda: 0x2c6a28 },
    arma: 'arco',
  },
}

// As armas (desenhadas com poucos retângulos e polígonos; a espada parece espada de verdade)
export const armasDosBonecos = {
  espada: { lamina: 0xdfe6ee, brilho: 0xffffff, guarda: 0xd4a017, cabo: 0x6b3f1f, pomo: 0xd4a017, comprimento: 20, largura: 4, guardaLargura: 10, comprimentoDoCabo: 5 },
  cajado: { madeira: 0x8b5a2b, veio: 0x6b4220, ponta: 0x6b4220, comprimento: 30, largura: 3.5, nos: 2 },
  cetro: { haste: 0xd4a017, orbe: 0x8fd3ff, brilho: 0xffffff, aro: 0xb8860b, comprimento: 22, largura: 3, raioDaOrbe: 4.5 },
  escudo: { frente: 0x2f4f9c, borda: 0xd4a017, emblema: 0xd4a017, costas: 0x6b4a2a, rompido: 0xd9534f, largura: 16, altura: 21, distancia: 9 },
  arco: { madeira: 0x8b5a2b, corda: 0xf5f0e0, flecha: 0xc9a46a, ponta: 0xb7c0cb, altura: 26, curva: 6 },
}

// Os números da pose (regras/bonecos.js)
export const poseDosBonecos = {
  // cos da mira abaixo disso (perto da vertical): o corpo não vira (evita o pisca-pisca)
  histereseDoLado: 0.2,
  // sen da mira entre -isso e +isso (perto da horizontal): a arma fica onde estava (atrás ou na frente)
  histereseDaFrente: 0.25,
  // o braço da arma gira até este ângulo para cima ou para baixo, a partir da frente (radianos)
  limiteDoBraco: 1.75,
  // ritmo do balanço: fase por milissegundo
  faseAndando: 0.016,
  faseParado: 0.004,
  parado: { ritmo: 1, corpo: 0.7, braco: 0.06 },
  andando: { perna: 3, corpo: 1.5, braco: 0.45 },
  // ângulo de descanso do braço da arma (radianos, dentro do corpo: 0 = frente, π/2 = para baixo)
  descanso: { espada: 0.9, cajado: 1.25, cetro: 1.2 },
  // o golpe de cada arma (regras/bonecos.js, poseDoAtaque): giro em radianos e avanço em px
  ataques: {
    espada: { pico: 0.45, giroInicial: -2.1, giroFinal: 0.6, avanco: 3 },
    cajado: { pico: 0.35, giro: -1.0, avanco: 4 },
    cetro: { pico: 0.35, giro: -0.9, avanco: 3 },
    escudo: { pico: 0.4, giro: 0, avanco: 7 },
    arco: { pico: 0.3, giro: 0, avanco: -2 },
  },
  msDoAtaque: 320,
  arco: { puxadaMaxima: 9 },
  // caído: as cores escurecem por esta fração
  escurecerCaido: 0.45,
}
