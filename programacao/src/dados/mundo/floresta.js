// FLORESTA grande e fixa (Parte 5 de 11/2026; antes, Fase 3).
// PROVISÓRIO – substituir pelo do grupo (layout: TASK-013). Trocar aqui não mexe no código.
//
// Mapa em px. O caminho faz um "S": três faixas (ida, volta, ida) ligadas por curvas nas pontas. Na velocidade de um
// personagem do começo (~190 px/s), atravessar de ponta a ponta leva cerca de 3 minutos (~33.000 px).
// Ordem: zona segura (perto do Reino), zona neutra, Fácil, a curva (zona neutra), Média, a outra curva (zona neutra),
// Difícil, zona neutra e o domínio do chefe no fim. Fora das zonas é mata fechada: ninguém atravessa.
// Cada zona é um POLÍGONO escrito à mão (pontos [x, y], com as bordas onduladas de forma natural). Onde duas zonas se
// sobrepõem (as curvas entram um pouco nas faixas), vale a que vem primeiro na lista. As zonas neutras (dificuldade
// 'neutra') não têm mobs: são as paradas da Caravana (Parte 7) e o lugar dos animais pacíficos.
// "inicio" é onde o grupo chega naquela zona; "chao" e "mancha" são os tons de verde do chão até a arte chegar.
// "versaoDoMapa": muda quando o desenho muda; a névoa salva de outra versão é descartada (as áreas ficam).

export const floresta = {
  id: 'floresta',
  nome: 'Floresta',
  versaoDoMapa: 'grande-1',
  tamanho: { largura: 10400, altura: 8000 },
  // Sorteio das árvores e pedras (regras/mundo.js): a mesma semente, o mesmo mapa toda vez
  semente: 2026,
  // A grade do terreno (regras/terreno.js): o tamanho de cada casa, em px
  celulaDoTerreno: 80,
  regioes: [
    {
      id: 'zonaSegura',
      nome: 'Zona segura',
      dificuldade: 'segura',
      pontoDePartida: 'inicio',
      inicio: { x: 600, y: 1450 },
      chao: 0x86d873,
      mancha: 0x77c965,
      poligono: [[250, 555], [825, 466], [1400, 483], [1324, 963], [1302, 1443], [1441, 1922], [1400, 2402], [825, 2391], [250, 2420], [138, 1954], [197, 1488], [278, 1021]],
    },
    {
      id: 'facil',
      nome: 'Fácil',
      dificuldade: 'facil',
      pontoDePartida: 'facil',
      inicio: { x: 2700, y: 1450 },
      chao: 0x5cc85a,
      mancha: 0x4fb84e,
      poligono: [[2200, 393], [2750, 286], [3300, 379], [3850, 539], [4400, 538], [4950, 482], [5500, 516], [6050, 493], [6600, 339], [7150, 290], [7700, 432], [8250, 525], [8800, 489], [8793, 952], [8791, 1416], [8823, 1879], [8800, 2342], [8250, 2324], [7700, 2220], [7150, 2244], [6600, 2422], [6050, 2487], [5500, 2395], [4950, 2363], [4400, 2382], [3850, 2285], [3300, 2186], [2750, 2289], [2200, 2446], [2245, 2035], [2260, 1625], [2154, 1214], [2081, 804]],
    },
    {
      id: 'media',
      nome: 'Média',
      dificuldade: 'media',
      pontoDePartida: 'media',
      inicio: { x: 8300, y: 4200 },
      chao: 0x43a54c,
      mancha: 0x3a9643,
      poligono: [[1900, 3229], [2431, 3094], [2962, 3149], [3492, 3262], [4023, 3265], [4554, 3265], [5085, 3361], [5615, 3382], [6146, 3228], [6677, 3109], [7208, 3169], [7738, 3241], [8269, 3220], [8800, 3256], [8779, 3702], [8711, 4149], [8760, 4595], [8800, 5041], [8269, 5094], [7738, 5112], [7208, 5073], [6677, 5147], [6146, 5296], [5615, 5287], [5085, 5137], [4554, 5077], [4023, 5117], [3492, 5086], [2962, 5039], [2431, 5145], [1900, 5298], [1868, 4884], [1886, 4470], [1832, 4057], [1819, 3643]],
    },
    {
      id: 'dificil',
      nome: 'Difícil',
      dificuldade: 'dificil',
      pontoDePartida: 'dificil',
      inicio: { x: 2450, y: 6850 },
      chao: 0x2f8a40,
      mancha: 0x287a37,
      poligono: [[1900, 5988], [2440, 5953], [2980, 6013], [3520, 5992], [4060, 5978], [4600, 6111], [5140, 6220], [5680, 6126], [6220, 5993], [6760, 5999], [7300, 6015], [7324, 6432], [7358, 6848], [7319, 7265], [7300, 7681], [6760, 7656], [6220, 7711], [5680, 7793], [5140, 7702], [4600, 7533], [4060, 7529], [3520, 7628], [2980, 7636], [2440, 7632], [1900, 7744], [1860, 7305], [1904, 6866], [1891, 6427]],
    },
    {
      id: 'dominioDoBoss',
      nome: 'Domínio do Boss',
      dificuldade: 'boss',
      pontoDePartida: 'muitoDificil',
      dominioDeBoss: true,
      inicio: { x: 8550, y: 6850 },
      chao: 0x2c6448,
      mancha: 0x24563d,
      poligono: [[8200, 5941], [8688, 6062], [9175, 6199], [9663, 6179], [10150, 6062], [10042, 6482], [10140, 6902], [10176, 7321], [10150, 7741], [9663, 7756], [9175, 7631], [8688, 7498], [8200, 7526], [8118, 7130], [8235, 6734], [8261, 6337]],
    },
    {
      id: 'neutraDaEntrada',
      nome: 'Clareira da Entrada',
      dificuldade: 'neutra',
      inicio: { x: 1800, y: 1450 },
      chao: 0x9bd47a,
      mancha: 0x8cc56b,
      poligono: [[1400, 483], [1800, 475], [2200, 393], [2081, 804], [2154, 1214], [2260, 1625], [2245, 2035], [2200, 2446], [1800, 2455], [1400, 2402], [1441, 1922], [1302, 1443], [1324, 963]],
    },
    {
      id: 'neutraDaCurva1',
      nome: 'Vau do Riacho',
      dificuldade: 'neutra',
      inicio: { x: 9550, y: 2800 },
      chao: 0x8fcb72,
      mancha: 0x80bc63,
      poligono: [[8500, 985], [9083, 883], [9667, 788], [10250, 849], [10307, 1375], [10272, 1850], [10307, 2325], [10272, 2800], [10150, 3275], [10193, 3750], [10281, 4225], [10250, 4705], [9667, 4695], [9083, 4692], [8500, 4612], [8564, 4225], [8508, 3750], [8518, 3275], [8475, 2800], [8414, 2325], [8497, 1850], [8560, 1375]],
    },
    {
      id: 'neutraDaCurva2',
      nome: 'Campo dos Cervos',
      dificuldade: 'neutra',
      inicio: { x: 1150, y: 5600 },
      chao: 0x84c068,
      mancha: 0x75b159,
      poligono: [[300, 3782], [933, 3740], [1567, 3603], [2200, 3627], [2168, 4150], [2187, 4600], [2178, 5050], [2254, 5500], [2280, 5950], [2184, 6400], [2150, 6850], [2200, 7292], [1567, 7300], [933, 7263], [300, 7194], [234, 6850], [270, 6400], [263, 5950], [255, 5500], [366, 5050], [399, 4600], [291, 4150]],
    },
    {
      id: 'neutraDoFim',
      nome: 'Pouso do Caçador',
      dificuldade: 'neutra',
      inicio: { x: 7750, y: 6850 },
      chao: 0x78b260,
      mancha: 0x69a351,
      poligono: [[7300, 6015], [7750, 5958], [8200, 5941], [8261, 6337], [8235, 6734], [8118, 7130], [8200, 7526], [7750, 7635], [7300, 7681], [7319, 7265], [7358, 6848], [7324, 6432]],
    },
  ],
  // Áreas com nome dentro das regiões (círculos: centro e raio): a primeira vez que o grupo entra em cada uma dá XP (RF40)
  areas: [
    { id: 'trilhaDoReino', nome: 'Trilha do Reino', regiao: 'zonaSegura', x: 800, y: 1450, raio: 650 },
    { id: 'clareiraDasFlores', nome: 'Clareira das Flores', regiao: 'facil', x: 3700, y: 1400, raio: 900 },
    { id: 'bosqueDosLobos', nome: 'Bosque dos Lobos', regiao: 'facil', x: 6600, y: 1400, raio: 900 },
    { id: 'riachoSeco', nome: 'Riacho Seco', regiao: 'media', x: 7000, y: 4200, raio: 900 },
    { id: 'valeDasAranhas', nome: 'Vale das Aranhas', regiao: 'media', x: 4700, y: 4200, raio: 900 },
    { id: 'matagal', nome: 'Matagal', regiao: 'media', x: 2700, y: 4200, raio: 800 },
    { id: 'pedrasAltas', nome: 'Pedras Altas', regiao: 'dificil', x: 3300, y: 6850, raio: 900 },
    { id: 'coracaoDaMata', nome: 'Coração da Mata', regiao: 'dificil', x: 5900, y: 6850, raio: 900 },
    { id: 'clareiraDoGuardiao', nome: 'Clareira do Chefe', regiao: 'dominioDoBoss', x: 9300, y: 6850, raio: 800 },
  ],
  // Onde o chefe fica (o Ogro, Parte 6d): no fundo do domínio dele, longe da entrada. O Guardião da Floresta saiu do mapa
  // (continua no código, fora do beta).
  lugarDoChefe: { x: 9600, y: 6850 },
  // Quantos mobs de cada tipo em cada região, a cada partida (as fichas ficam em balanceamento.js, mundo.mobs).
  // PROVISÓRIO – substituir pelo do grupo (TASK-012); os mobs novos e os números entram nas Partes 6 e 8. As zonas
  // neutras só têm os animais que não atacam.
  populacao: {
    // Parte 6a: na Fácil, lobos soltos e 3 Lobos Alfa (cada um nasce com a matilha em volta: + 2 lobos)
    facil: { lobo: 10, loboAlfa: 3, aranha: 5 },
    // Parte 6b: a Média ganhou dois acampamentos goblin (em "acampamentos", abaixo); menos lobos soltos
    media: { lobo: 6, aranha: 10, javali: 6 },
    dificil: { lobo: 12, aranha: 10, javali: 10 },
    dominioDoBoss: { lobo: 3 },
    // Zonas neutras: só os animais pacíficos (Parte 6a: fogem do grupo e dos mobs, XP quase nada)
    neutraDaEntrada: { cervo: 2, coelho: 3 },
    neutraDaCurva1: { cervo: 3, coelho: 3 },
    neutraDaCurva2: { cervo: 3, coelho: 2 },
    neutraDoFim: { cervo: 2, coelho: 2 },
  },
  // Acampamentos goblin (Parte 6b; PROVISÓRIO – substituir pelo do grupo): um círculo com a paliçada (raio) e as
  // entradas (ângulos: 0 = leste, π = oeste, π/2 = sul), dentro da região; a população nasce dentro, em volta da
  // fogueira. Os lugares foram escolhidos com um círculo de 560 px que cabe inteiro na Média.
  acampamentos: [
    { id: 'acampamentoDoRiacho', nome: 'Acampamento do Riacho', regiao: 'media', centro: { x: 5900, y: 4370 }, raio: 360, entradas: [0, Math.PI], populacao: { goblinLanceiro: 3, goblinArqueiro: 2, goblinXama: 1 } },
    { id: 'acampamentoDaPedra', nome: 'Acampamento da Pedra', regiao: 'media', centro: { x: 3260, y: 4450 }, raio: 380, entradas: [0], populacao: { goblinLanceiro: 4, goblinArqueiro: 3, goblinXama: 1 } },
  ],
  // Recursos no chão de cada região, a cada partida (coletados com E). PROVISÓRIO – substituir pelo do grupo (TASK-012).
  recursos: {
    zonaSegura: { ervaMedicinal: 2 },
    facil: { cogumelo: 14, ervaMedicinal: 10, madeira: 8 },
    media: { cogumelo: 12, ervaMedicinal: 10, madeira: 12 },
    dificil: { cogumelo: 10, ervaMedicinal: 12, madeira: 14 },
    neutraDaCurva1: { ervaMedicinal: 3 },
    neutraDaCurva2: { ervaMedicinal: 3 },
  },
  cores: {
    mata: 0x1d4425, // a mata fechada (parede)
    copa: 0x2a6532, // as copas desenhadas na beira da mata
    copaClara: 0x357a3b,
    arvore: 0x2e6e36, // as árvores soltas no caminho
    tronco: 0x6b4a2b,
    pedra: 0x9aa3ad,
    // acampamento goblin (Parte 6b): os troncos da paliçada vistos de cima, as pedras da fogueira e o fogo
    palicada: 0x7a5230,
    palicadaClara: 0xa57a4a,
    fogueiraPedra: 0x8b8f96,
    fogo: 0xff8a2a,
    fogoClaro: 0xffd54a,
  },
}
