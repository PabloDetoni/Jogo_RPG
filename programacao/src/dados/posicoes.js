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
  // Reino em camadas com as peças do Pablo (21/10; documentacao/Telas/reino_pixel_art): tudo em PIXELS DO FUNDO DELE
  // (reino-fundo, 1672 × 941; x, y = canto de cima à esquerda), que tem a proporção da tela: escala certo em qualquer
  // tamanho e em tela cheia. Cada peça no lugar e no tamanho do objeto na imagem principal (ReinoRPG.png), achados pela
  // menor diferença entre as duas (a imagem principal e o fundo quase coincidem: 1,001 × e 2 px para o lado).
  // De baixo para cima: o fundo, as animações de trás, as peças, as animações da frente e as placas (código).
  reino: {
    imagem: { largura: 1672, altura: 941 },
    faixa: { x: 836, y: 32 }, // apelido, Líder, ouro e missão (o centro)
    ajuda: { x: 1393.5, y: 43 }, // o "?", ao lado da engrenagem (o centro)
    // As peças, da de cima para a de baixo (o clique vale na de cima). Enfeite: não abre nada e tapa o que está atrás.
    // A muralha (04_muralhas) vem cortada em duas, sem mudar pixel: a de trás fica atrás dos prédios e a da frente (as
    // torres dos cantos, as paredes de baixo e o portão) na frente. As pás e o corpo do moinho usam o mesmo quadro.
    // A Árvore de Habilidades (11_arvore) é outra árvore, diferente da imagem principal: encaixada pelo contorno da de lá
    // (o alto da copa, a base do tronco e o meio); a frente dela (12_frente_arvore: cerca, moitas e pedras) pelo fundo.
    pecas: {
      mochila: { x: 38, y: 591.3, largura: 190.2, altura: 168.3 },
      frenteDaArvore: { x: 1140, y: 772, largura: 552.8, altura: 182.8, enfeite: true },
      arvores: { x: 1402.5, y: 502, largura: 288.1, altura: 288.1 },
      estandarte: { x: -97.9, y: 143.8, largura: 329, altura: 493.6, enfeite: true },
      moinhoPas: { x: 257.7, y: 299.7, largura: 87, altura: 87, enfeite: true, gira: true },
      moinhoCorpo: { x: 257.7, y: 299.7, largura: 87, altura: 87, enfeite: true },
      muralhasFrente: { x: 272, y: 348, largura: 1142.4, altura: 472.8, enfeite: true },
      forja: { x: 1080.8, y: 495.5, largura: 255.8, altura: 170.5 },
      mercado: { x: 333.6, y: 435.5, largura: 454.3, altura: 302.8 },
      guilda: { x: 689.2, y: 319.6, largura: 297.7, altura: 198.5 },
      muralhasTras: { x: 272, y: 348, largura: 1142.4, altura: 472.8, enfeite: true },
      castelo: { x: 825.1, y: 75.9, largura: 335.3, altura: 265.4, enfeite: true },
    },
    // As placas com os nomes (desenhadas em código no lugar das da imagem principal); "simbolo" é a plaquinha de cima
    placas: {
      salaoGloria: { x: 20, y: 77.9, largura: 249.7, altura: 53.9, simbolo: { nome: 'coroa', x: 79.9, y: 12, largura: 127.9, altura: 69.9 } },
      configuracoes: { x: 1440.4, y: 75.9, largura: 219.8, altura: 57.9, simbolo: { nome: 'engrenagem', x: 1514.3, y: 12, largura: 65.9, altura: 65.9 } },
      guilda: { x: 777.1, y: 369.6, largura: 121.9, altura: 38 },
      mercado: { x: 429.5, y: 551.4, largura: 123.9, altura: 40, simbolo: { nome: 'banca', x: 459.5, y: 507.4, largura: 65.9, altura: 45.9 } },
      forja: { x: 1180.7, y: 572.4, largura: 113.9, altura: 40, simbolo: { nome: 'bigorna', x: 1209.7, y: 525.4, largura: 49.9, altura: 49.9 } },
      mochila: { x: 57.9, y: 751.2, largura: 205.8, altura: 57.9 },
      jogar: { x: 647.3, y: 783.1, largura: 377.6, altura: 81.9, principal: true, simbolo: { nome: 'espadas', x: 809.1, y: 747.2, largura: 51.9, altura: 49.9 } },
      arvores: { x: 1426.4, y: 773.1, largura: 227.7, altura: 71.9, linhas: 2 },
    },
    // As animações (dados/animacoesDoCenario.js tem as velocidades). Bandeiras e árvores ficam paradas (o Pablo anima
    // depois).
    animacoes: {
      // As nuvens do Pablo (nuvem (1) a (3)), no tamanho e na altura das nuvens da imagem principal: andam devagar para
      // a direita, só onde é céu (o fundo, de cima para baixo em cada coluna até a primeira montanha, copa ou neve,
      // dentro da faixa "ceu"); saindo pela direita, voltam por trás da copa da árvore do canto (em "voltaEm")
      nuvens: {
        ceu: 200,
        voltaEm: 700,
        lista: [
          { x: 686.2, y: -1.4, largura: 206.7, altura: 206.7 },
          { x: 1286, y: 35.3, largura: 159.1, altura: 159.1 },
          { x: 1178.9, y: -4.2, largura: 122.8, altura: 122.8 },
        ],
      },
      lanterna: { x: 116.4, y: 294.2, raio: 30 }, // a luz da lanterna do estandarte
      chamines: [
        { x: 1269.8, y: 540.7, frente: true }, // a da Forja (na frente da peça)
        { x: 232, y: 327 },
        { x: 395, y: 269 },
        { x: 565, y: 305 },
      ],
      // Onde procurar a água no fundo (os brilhos caem só nos pixels azuis de água dentro destas áreas)
      agua: [
        { x: 560, y: 222, largura: 800, altura: 130, quantos: 22 }, // o lago
        { x: 800, y: 522, largura: 90, altura: 75, quantos: 6 }, // a fonte
      ],
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
  // Mapa em camadas com as peças do Pablo (21/10; documentacao/Telas/mapa_pixel_art): em PIXELS DO OCEANO DELE
  // (mapa-oceano, 1920 × 1080, a imagem principal MapaRPG.jpeg vezes 1920/1466). Cada peça no lugar e no tamanho da
  // imagem principal (pela menor diferença entre as duas); o chão do Planalto pelo buraco do anel de montanhas.
  // De baixo para cima: o oceano (com as ondas), os 4 biomas, o chão do Planalto e o anel de montanhas (enfeites), os
  // lugares do Planalto (o castelo volta ao Reino; Fazenda, Mina e Lago são os minijogos) e as animações.
  // "placa" é o centro de onde aparece o nome ao passar o mouse.
  mapa: {
    imagem: { largura: 1920, altura: 1080 },
    // Os lugares do Planalto ficam por cima de tudo (o clique vale no de cima)
    planalto: {
      reino: { x: 898.4, y: 413.9, largura: 146.4, altura: 130, peca: 'mapa-castelo', placa: { x: 971.8, y: 577.6 } },
      mina: { x: 1039.9, y: 432.2, largura: 164, altura: 120.4, peca: 'mapa-mina', placa: { x: 1126.3, y: 589.4 } },
      fazenda: { x: 707.2, y: 437.4, largura: 200.7, altura: 124.3, peca: 'mapa-fazenda', placa: { x: 805.5, y: 589.4 } },
      lago: { x: 835.6, y: 319.6, largura: 245.3, altura: 170, peca: 'mapa-lago', placa: { x: 962.6, y: 309.1 } },
    },
    // O anel de montanhas e o chão do Planalto (sem clique: tapam o que está atrás)
    enfeites: {
      montanhas: { x: 623.4, y: 267.2, largura: 692, altura: 533.9, peca: 'mapa-montanhas' },
      chao: { x: 707.5, y: 343.8, largura: 533.5, altura: 398, peca: 'mapa-planalto' },
    },
    biomas: {
      deserto: { x: 916.8, y: 508.2, largura: 925.8, altura: 525.5, peca: 'mapa-bioma-deserto', placa: { x: 1421, y: 778 } },
      floresta: { x: 52.4, y: 476.7, largura: 959, altura: 540.4, peca: 'mapa-bioma-floresta', placa: { x: 518.6, y: 757 } },
      vulcanico: { x: 948.2, y: 57.6, largura: 928.9, altura: 612.5, peca: 'mapa-bioma-vulcanico', placa: { x: 1459, y: 302.5 } },
      tundra: { x: 47.1, y: 15.7, largura: 891.9, altura: 542.9, peca: 'mapa-bioma-tundra', placa: { x: 461, y: 292.1 } },
    },
    animacoes: {
      // A fumaça do vulcão (a peça 12): sai da cratera e passa da borda de cima, como na imagem principal; nada dela
      // desce abaixo da cratera
      fumaca: { x: 1490.4, y: -149.3, largura: 178.9, altura: 205, cratera: 75.3, peca: 'mapa-fumaca-do-vulcao' },
      // Onde a água das cachoeiras desce (as faixas só aparecem nos pixels claros de água da peça)
      cachoeiras: [
        { peca: 'lago', x: 950.6, y: 346.5, largura: 17.1, altura: 35.9 },
        { peca: 'floresta', x: 243, y: 786.9, largura: 44.8, altura: 63.5 },
        { peca: 'floresta', x: 478.4, y: 865.4, largura: 37.4, altura: 82.2 },
        { peca: 'floresta', x: 829.7, y: 841.5, largura: 44.8, altura: 71 },
      ],
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
