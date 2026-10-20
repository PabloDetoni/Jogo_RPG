// Posições de tudo o que aparece nas telas, em porcentagem da caixa 16:9.
// x vai de 0 (esquerda) a 100 (direita); y vai de 0 (topo) a 100 (base).
// O número é o CENTRO do elemento. "grande: true" deixa o botão maior; "principal: true" pinta a ação principal da tela
// (o vermelho e dourado do JOGAR, visual novo de 20/10; o "grande" também é principal).
// Quando a arte entrar, ajuste só os números daqui.
// Dentro das janelas (Configurações, Pausa, Como jogar) os botões ficam em coluna, sem posição.

export const posicoes = {
  // Valem para todas as telas
  titulo: { x: 50, y: 11 },
  trilha: { x: 50, y: 3.6 }, // "Reino › Forja › Equipar" (ajustes de 14/10)
  dica: { x: 50, y: 22 }, // a dica da primeira visita, logo abaixo do título
  cantos: {
    salaoGloria: { x: 9, y: 11 },
    configuracoes: { x: 93, y: 11 },
    ajuda: { x: 83.6, y: 11 }, // o "?" (Fase 4.5): como a tela funciona
  },
  avisos: { x: 50, y: 30 }, // mensagens por cima da tela (partida descartada, aba ocupada...)
  avisosDeConquista: { x: 86, y: 22 }, // conquista nova (Fase 4.5): no canto, some sozinha, não tapa as abas

  // ---------- Acesso ----------
  telaInicial: {
    iniciarJogo: { x: 50, y: 55, grande: true }, // o botão principal (vermelho e dourado, como o JOGAR)
    comoJogar: { x: 50, y: 67 },
  },
  // Fase 2: as mensagens (e-mail confirmado, senha errada, conta em uso...) ficam logo abaixo do título
  login: {
    mensagem: { x: 50, y: 19 },
    continuar: { x: 50, y: 27 }, // "Continuar como ...": a conta que o Supabase lembra neste navegador
    email: { x: 50, y: 36 },
    senha: { x: 50, y: 47 },
    entrar: { x: 50, y: 57, principal: true },
    reenviar: { x: 72, y: 57 }, // só com o e-mail ainda não confirmado (RF04)
    criarConta: { x: 38, y: 67 },
    esqueciSenha: { x: 62, y: 67 },
    jogarComoConvidado: { x: 50, y: 78 },
    avisoConvidado: { x: 50, y: 86 },
    voltar: { x: 10, y: 90 },
  },
  criarConta: {
    mensagem: { x: 50, y: 19 },
    email: { x: 50, y: 29 },
    senha: { x: 50, y: 41 },
    apelido: { x: 50, y: 53 },
    regras: { x: 50, y: 63 },
    criarConta: { x: 50, y: 73, principal: true },
    voltarAoLogin: { x: 10, y: 90 },
  },
  confirmeEmail: {
    mensagem: { x: 50, y: 38 },
    resposta: { x: 50, y: 52 },
    reenviar: { x: 50, y: 62 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  esqueciSenha: {
    email: { x: 50, y: 36 },
    enviar: { x: 50, y: 50 },
    mensagem: { x: 50, y: 62 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  // Aberta pelo link de senha nova do e-mail (RF06)
  novaSenha: {
    explicacao: { x: 50, y: 22 },
    senha: { x: 50, y: 34 },
    repetir: { x: 50, y: 46 },
    salvar: { x: 50, y: 58 },
    mensagem: { x: 50, y: 69 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  // Conta sem apelido (criada fora do jogo, ou o apelido foi tomado entre o cadastro e a confirmação)
  escolherApelido: {
    explicacao: { x: 50, y: 24 },
    apelido: { x: 50, y: 38 },
    confirmar: { x: 50, y: 50 },
    mensagem: { x: 50, y: 61 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  narrativaInicial: {
    texto: { x: 50, y: 45 },
    continuar: { x: 50, y: 75 },
  },
  // Clicar numa classe mostra a descrição e o pentágono dela; "Escolher" confirma (TASK-071)
  selecaoClasse: {
    instrucao: { x: 50, y: 21 },
    guerreiro: { x: 18, y: 31 },
    mago: { x: 34, y: 31 },
    tanque: { x: 50, y: 31 },
    sacerdote: { x: 66, y: 31 },
    arqueiro: { x: 82, y: 31 },
    detalhe: { x: 50, y: 61 },
    escolher: { x: 50, y: 89, grande: true },
  },

  // ---------- Reino ----------
  // Reino em camadas (20/10): tudo em PIXELS DA IMAGEM ORIGINAL do Pablo (1670 × 942; x, y = canto de cima à esquerda),
  // que tem a proporção da tela: escala certo em qualquer tamanho e em tela cheia. De baixo para cima: o fundo limpo
  // (reino-fundo), as animações de trás, as peças (cada uma um arquivo reino-<peça>, no lugar e no tamanho do objeto da
  // imagem), as animações da frente e as placas (código). Trocando uma peça por outra do mesmo tamanho, nada muda aqui.
  reino: {
    imagem: { largura: 1670, altura: 942 },
    faixa: { x: 835, y: 32 }, // apelido, Líder, ouro e missão (o centro)
    ajuda: { x: 1393, y: 43 }, // o "?", ao lado da engrenagem (o centro)
    // As peças, da de cima para a de baixo (o clique vale na de cima). O castelo é só enfeite (sem clique).
    pecas: {
      guilda: { x: 724, y: 293, largura: 219, altura: 215 },
      mercado: { x: 546, y: 536, largura: 233, altura: 122 },
      forja: { x: 1113, y: 505, largura: 211, altura: 155 },
      mochila: { x: 8, y: 593, largura: 216, altura: 158 },
      arvores: { x: 1415, y: 523, largura: 255, altura: 248 },
      castelo: { x: 842, y: 74, largura: 299, altura: 256 },
    },
    // As placas com os nomes (desenhadas em código no lugar das da imagem); "simbolo" é a plaquinha de cima (a coroa...)
    placas: {
      salaoGloria: { x: 18, y: 78, largura: 250, altura: 54, simbolo: { nome: 'coroa', x: 78, y: 12, largura: 128, altura: 70 } },
      configuracoes: { x: 1440, y: 76, largura: 220, altura: 58, simbolo: { nome: 'engrenagem', x: 1514, y: 12, largura: 66, altura: 66 } },
      guilda: { x: 776, y: 370, largura: 122, altura: 38 },
      mercado: { x: 428, y: 552, largura: 124, altura: 40, simbolo: { nome: 'banca', x: 458, y: 508, largura: 66, altura: 46 } },
      forja: { x: 1180, y: 573, largura: 114, altura: 40, simbolo: { nome: 'bigorna', x: 1209, y: 526, largura: 50, altura: 50 } },
      mochila: { x: 56, y: 752, largura: 206, altura: 58 },
      jogar: { x: 646, y: 784, largura: 378, altura: 82, principal: true, simbolo: { nome: 'espadas', x: 808, y: 748, largura: 52, altura: 50 } },
      arvores: { x: 1426, y: 774, largura: 228, altura: 72, linhas: 2 },
    },
    // As animações (recortadas da imagem; dados/animacoesDoCenario.js tem as velocidades)
    animacoes: {
      nuvens: [
        { x: 993, y: 46, largura: 136, altura: 41 },
        { x: 1031, y: 118, largura: 42, altura: 18 },
        { x: 1057, y: 184, largura: 37, altura: 18 },
        { x: 1097, y: 94, largura: 67, altura: 20 },
      ],
      // O grande do poste e os das muralhas (presos em cima)
      estandartes: [
        { x: 15, y: 253, largura: 63, altura: 226 },
        { x: 1164, y: 419, largura: 32, altura: 65 },
        { x: 438, y: 420, largura: 33, altura: 65 },
        { x: 287, y: 504, largura: 35, altura: 74 },
        { x: 1341, y: 506, largura: 34, altura: 73 },
        { x: 726, y: 683, largura: 36, altura: 66 },
        { x: 901, y: 683, largura: 37, altura: 68 },
        { x: 459, y: 687, largura: 36, altura: 75 },
        { x: 1214, y: 689, largura: 37, altura: 74 },
      ],
      // As bandeirinhas do castelo (presas no mastro, à esquerda)
      flamulas: [
        { x: 996, y: 81, largura: 29, altura: 21 },
        { x: 1044, y: 116, largura: 28, altura: 14 },
        { x: 1043, y: 121, largura: 30, altura: 20 },
        { x: 959, y: 153, largura: 17, altura: 12 },
        { x: 871, y: 174, largura: 22, altura: 22 },
        { x: 1088, y: 185, largura: 27, altura: 11 },
      ],
      pasDoMoinho: { x: 262, y: 282, largura: 78, altura: 76, eixo: { x: 300, y: 320 } },
      copa: { x: 0, y: 0, largura: 570, altura: 216, ancora: { x: 40, y: 216 } }, // a árvore grande do canto
      lanterna: { x: 115, y: 294, raio: 30 },
      chamines: [
        { x: 1281, y: 528, frente: true }, // a da Forja (na frente da peça)
        { x: 393, y: 270 },
        { x: 239, y: 335 },
      ],
      fonte: { x: 832, y: 532 },
    },
  },
  guilda: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 29.5 }, // preso pelo topo (ConteudoComAbas noTopo): as cartas e o quadro não sobem nas abas
    voltarAoReino: { x: 10, y: 90 },
  },
  mercado: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 57 },
    voltarAoReino: { x: 10, y: 90 },
  },
  forja: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 57 },
    voltarAoReino: { x: 10, y: 90 },
  },
  mochila: {
    conteudo: { x: 50, y: 53 },
    voltarAoReino: { x: 10, y: 90 },
  },
  arvores: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 30 }, // preso pelo topo (ConteudoComAbas noTopo)
    voltarAoReino: { x: 10, y: 90 },
  },
  salaoGloria: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 52 },
    voltar: { x: 10, y: 90 },
  },

  // ---------- Mapa e partida ----------
  // Mapa em camadas (20/10): em PIXELS DA IMAGEM ORIGINAL do mapa do Pablo (1466 × 825). De baixo para cima: o oceano
  // (mapa-oceano, com as ondas), o Planalto (a base, sem clique), os 4 biomas (recortados da imagem, cada um no lugar
  // exato), os lugares do Planalto (o castelo volta ao Reino; Fazenda, Mina e Lago são os minijogos) e as animações.
  // "placa" é o centro de onde aparece o nome ao passar o mouse.
  mapa: {
    imagem: { largura: 1466, altura: 825 },
    // Os lugares do Planalto ficam por cima dos biomas (o clique vale no de cima)
    planalto: {
      reino: { x: 695, y: 316, largura: 94, altura: 96, peca: 'mapa-castelo', placa: { x: 742, y: 441 } },
      lago: { x: 664, y: 251, largura: 142, altura: 90, peca: 'mapa-lago', placa: { x: 735, y: 236 } },
      fazenda: { x: 563, y: 337, largura: 123, altura: 76, peca: 'mapa-fazenda', placa: { x: 590, y: 450 } },
      mina: { x: 805, y: 334, largura: 99, altura: 87, peca: 'mapa-mina', placa: { x: 868, y: 450 } },
    },
    base: { x: 496, y: 200, largura: 519, altura: 407, peca: 'mapa-planalto' }, // o Planalto (sem clique)
    biomas: {
      floresta: { x: 27, y: 368, largura: 770, altura: 418, peca: 'mapa-bioma-floresta', placa: { x: 396, y: 578 } },
      tundra: { x: 35, y: 15, largura: 692, altura: 386, peca: 'mapa-bioma-tundra', placa: { x: 352, y: 223 } },
      vulcanico: { x: 718, y: 0, largura: 720, altura: 437, peca: 'mapa-bioma-vulcanico', placa: { x: 1114, y: 231 } },
      deserto: { x: 774, y: 388, largura: 674, altura: 402, peca: 'mapa-bioma-deserto', placa: { x: 1085, y: 594 } },
    },
    animacoes: {
      lava: { x: 718, y: 0, largura: 720, altura: 437 },
      cachoeiras: [
        { x: 724, y: 248, largura: 26, altura: 52 },
        { x: 195, y: 580, largura: 28, altura: 66 },
        { x: 373, y: 652, largura: 25, altura: 68 },
        { x: 635, y: 640, largura: 32, altura: 58 },
      ],
      cratera: { x: 1140, y: 58 },
    },
    arenaDeTeste: { x: 8, y: 93 }, // só no npm run dev (em % da tela, como os botões)
  },
  // Usada pelas telas de Fazenda, Mina e Lago
  minijogo: {
    mensagem: { x: 50, y: 45 },
    voltarAoMapa: { x: 10, y: 90 },
  },
  pontoPartida: {
    bioma: { x: 50, y: 21 },
    inicio: { x: 50, y: 32 },
    facil: { x: 50, y: 43 },
    media: { x: 50, y: 53 },
    dificil: { x: 50, y: 63 },
    muitoDificil: { x: 50, y: 73 },
    voltarAoMapa: { x: 10, y: 90 },
  },
  preparacao: {
    tituloLider: { x: 25, y: 25 },
    lideres: { x: 25, y: 50 },
    mochila: { x: 70, y: 48 },
    comecarPartida: { x: 80, y: 88, grande: true },
    voltarAoReino: { x: 10, y: 90 },
    voltarAoMapa: { x: 27, y: 90 },
  },
  // HUD (faixa de cima) e barra de teste (faixa de baixo) têm a altura de dados/arenaDeTeste.js.
  // Configurações fica dentro da faixa do HUD, no canto direito (menor que nas outras telas), para não cobrir a área
  // jogável. As contagens do Q e da fuga e as mensagens ficam logo abaixo do HUD (HudDaPartida.jsx).
  partida: {
    configuracoes: { x: 92.4, y: 3.2 }, // em cima à direita, logo acima do minimapa (ajustes de 14/10)
    dica: { x: 50, y: 68 }, // a dica da primeira partida, em cima da barra de ações
  },
  cutsceneDerrota: {
    mensagem: { x: 50, y: 45 },
    continuar: { x: 50, y: 75 },
  },
  resumo: {
    resultado: { x: 50, y: 25 },
    detalhes: { x: 50, y: 55 },
    jogarNovamente: { x: 38, y: 88 },
    voltarAoReino: { x: 62, y: 88, principal: true },
  },
}
