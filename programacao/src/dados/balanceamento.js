// VALORES PROVISÓRIOS de balanceamento (Conceito §19). Nenhum deles muda uma regra, só o tamanho dos números.
// Depois de mudar algo aqui:
//   npm run balanceamento → atualiza o documentacao/Balanceamento.md com as tabelas (XP até o nível 100, taxas, etc.)
//   npm test              → os testes de limite avisam se algum valor ficou absurdo
// Os atributos iniciais de cada classe ficam em dados/classes.js.

// Distância do ponto inicial até a borda de cada bioma (a unidade do mapa se define na etapa 6)
export const distanciaAteABorda = { floresta: 1000, deserto: 1000, tundra: 1000, vulcanico: 1000 }

// XP para passar do nível n para o n + 1 = base × n ^ expoente (arredondado).
// Expoente 1: cresce em linha reta (100, 200, 300...). Acima de 1, cresce cada vez mais rápido.
export const curvaDeXp = { base: 100, expoente: 1 }

// Pontos ganhos a cada nível (RF55)
export const pontosDeAtributoPorNivel = 3
export const pontosDeHabilidadePorNivel = 1

// Maior valor que um atributo pode ter
export const atributoMaximo = 100

// Força do efeito de um atributo: efeito = atributoMaximo × (valor ÷ atributoMaximo) ^ expoente.
// Expoente 1: atributo 100 vale o dobro do 50. Acima de 1, os valores altos valem cada vez mais.
// Nada usa isso ainda; o combate entra na etapa 5.
export const curvaDosAtributos = { expoente: 1.5 }

// Mochila da partida: capacidade = soma da Força do grupo × este valor (RF33)
export const capacidadePorPontoDeForca = 2

// Crítico (Conceito §6: a Agilidade dá a chance de crítico). Aprovado pelo Pablo em 07/10:
// chance = chanceBase + Agilidade × chancePorPontoDeAgilidade (Arqueiro inicial, Agilidade 22: 16%; Agilidade 100: 55%).
// O golpe crítico causa o dano × multiplicador.
export const critico = { chanceBase: 0.05, chancePorPontoDeAgilidade: 0.005, multiplicador: 1.5 }

// Pontuação base (RF49) = soma de cada parte × o seu peso, mais o bônus de Boss
export const pesosDaPontuacao = { porMonstro: 10, porOuro: 1, porRecurso: 5, porSegundoAtivo: 1 }

// Pontuação base mínima para a Grande Vitória (RF47); alta de propósito
export const minimoDaGrandeVitoria = 1000

// Contratos da Guilda (RF29). O temporário tem nível fixo e dura algumas partidas;
// o permanente cria um personagem no nível 1 que evolui normalmente.
export const contratos = {
  precoDoTemporario: 200,
  partidasDoTemporario: 3,
  nivelDoTemporario: 5,
  precoDoPermanente: 1000,
}

// MERCADO E FORJA (Fase 4, TASK-074 e TASK-075). Provisório até o catálogo do grupo (TASK-014).
// - fracaoDaVenda: quem vende um item (no Mercado, ou equipamento na Forja) recebe esta parte do preço, para baixo;
// - rotação das ofertas rotativas (dados/mercado.js): mudam a cada "partidasPorRotacao" partidas jogadas, e aparecem
//   "rotativasAVenda" de cada vez (a regra da rotação é a decisão em aberto da TASK-014).
export const mercado = { fracaoDaVenda: 0.5, partidasPorRotacao: 3, rotativasAVenda: 3 }

// MUNDO (Fase 3): a Floresta maior que a tela (layout em dados/mundo/floresta.js). Tudo provisório até o layout do
// grupo (TASK-013). Distâncias em px do mapa, tempos em ms.
export const mundo = {
  // Árvores e pedras espalhadas (regras/mundo.js, gerarObstaculos): uma casa a cada "espacamento" px, com desvio;
  // "densidade" é a chance de cada casa ter um obstáculo, por região
  obstaculos: {
    espacamento: 300,
    desvio: 55,
    densidade: { zonaSegura: 0.25, facil: 0.45, media: 0.55, dificil: 0.62, dominioDoBoss: 0.22 },
    arvore: { min: 56, max: 96 },
    pedra: { largura: [70, 120], altura: [50, 90] },
    chanceDePedra: 0.3,
    margem: 40, // distância mínima da mata fechada
    passagemMinima: 90, // px livres entre dois obstáculos (um corpo tem 40)
    raioLivreDoInicio: 260, // nada em volta do início de cada região
    raioLivreDoBoss: 420, // nem no meio do domínio do Boss
  },
  // Câmera: segue o Líder com esta suavidade (1 = colada, perto de 0 = bem atrasada)
  camera: { suavidade: 0.12 },
  // Longe do Líder (e fora da tela), os mobs dormem: não pensam nem andam (60 FPS, TEST-005)
  raioAtivo: 1500,
  // Mobs da Floresta (TASK-062). PROVISÓRIO – substituir pelo do grupo (TASK-012). Os campos são os do mob vermelho e
  // do atirador da arena; "comportamento" diz qual dos dois ele é, "hostil: false" = só reage se for atacado, e
  // "raioDoTerritorio" é até onde ele persegue, contando da casa dele (onde nasceu). Os drops vêm com a coleta (3f).
  mobs: {
    // Lobo: corpo a corpo, o mais comum
    lobo: {
      comportamento: 'corpoACorpo',
      hostil: true,
      cor: 0xd8483e,
      xp: 18,
      ouro: 10,
      vida: 55,
      tamanho: 34,
      velocidade: 150,
      dano: 10,
      raioDeDeteccao: 340,
      raioDeDesistencia: 520,
      raioDoTerritorio: 650,
      alcanceDoBote: 90,
      msDeAviso: 500,
      msDeBote: 200,
      distanciaDoBote: 120,
      recargaMs: 1300,
      empurrao: 340,
      raioDoPasseio: 140,
      drops: [{ item: 'peleDeLobo', chance: 0.6, quantidade: [1, 2] }],
    },
    // Aranha: fica longe e atira teia (como o atirador da arena)
    aranha: {
      comportamento: 'atirador',
      hostil: true,
      cor: 0x9e1b2b,
      xp: 22,
      ouro: 12,
      vida: 38,
      tamanho: 30,
      velocidade: 105,
      raioDeDeteccao: 560,
      raioDeDesistencia: 760,
      raioDoTerritorio: 800,
      distanciaMinima: 280,
      distanciaMaxima: 430,
      msEntreTiros: 1900,
      msDeAviso: 320,
      velocidadeDoTiro: 230,
      raioDoTiro: 7,
      alcanceDoTiro: 650,
      dano: 8,
      empurrao: 160,
      raioDoPasseio: 100,
      drops: [{ item: 'teiaDeAranha', chance: 0.7, quantidade: [1, 2] }],
    },
    // Javali: mais forte e mais lento, golpe pesado e bem avisado
    javali: {
      comportamento: 'corpoACorpo',
      hostil: true,
      cor: 0xb5502e,
      xp: 35,
      ouro: 18,
      vida: 110,
      tamanho: 42,
      velocidade: 125,
      dano: 18,
      raioDeDeteccao: 300,
      raioDeDesistencia: 480,
      raioDoTerritorio: 600,
      alcanceDoBote: 100,
      msDeAviso: 650,
      msDeBote: 240,
      distanciaDoBote: 150,
      recargaMs: 1700,
      empurrao: 480,
      raioDoPasseio: 110,
      drops: [{ item: 'presaDeJavali', chance: 0.5, quantidade: [1, 1] }],
    },
    // Cervo: não hostil (passa ao lado do grupo sem atacar; atacado, revida)
    cervo: {
      comportamento: 'corpoACorpo',
      hostil: false,
      cor: 0xd9b48a,
      xp: 12,
      ouro: 6,
      vida: 45,
      tamanho: 34,
      velocidade: 160,
      dano: 7,
      raioDeDeteccao: 0,
      raioDeDesistencia: 500,
      raioDoTerritorio: 700,
      alcanceDoBote: 85,
      msDeAviso: 450,
      msDeBote: 200,
      distanciaDoBote: 110,
      recargaMs: 1400,
      empurrao: 260,
      raioDoPasseio: 180,
      drops: [{ item: 'chifreDeCervo', chance: 0.4, quantidade: [1, 1] }],
    },
  },
  // O Boss da Floresta (TASK-065). PROVISÓRIO – substituir pelo do grupo (TASK-012). Fica no domínio dele
  // (raioDoTerritorio a partir do lugar do Boss) e tem três ataques avisados no chão antes do golpe:
  // pisão (área em volta), investida (faixa reta até o alvo) e espinhos (leque de tiros). "bonus" entra na
  // pontuação (RF49); "especial" é a pequena chance de deixar o equipamento especial (RF39).
  boss: {
    nome: 'Guardião da Floresta',
    cor: 0x6e3b1f,
    tamanho: 92,
    vida: 2400,
    velocidade: 95,
    dano: 26,
    xp: 400,
    ouro: 250,
    bonus: 500,
    raioDeDeteccao: 620,
    raioDeDesistencia: 900,
    raioDoTerritorio: 720,
    raioDoPasseio: 60,
    msEntreAtaques: 1500,
    pisao: { alcance: 230, raio: 190, msDeAviso: 900, dano: 26, empurrao: 520 },
    investida: { alcance: 520, comprimento: 440, largura: 80, msDeAviso: 800, msDaInvestida: 380, dano: 22, empurrao: 480 },
    espinhos: { quantos: 5, abertura: 0.7, msDeAviso: 600, velocidadeDoTiro: 300, raioDoTiro: 9, alcanceDoTiro: 760, dano: 12, empurrao: 200 },
    drops: [{ item: 'cascaAntiga', chance: 1, quantidade: [1, 2] }],
    especial: { item: 'coroaDeRaizes', chance: 0.08 },
  },
  // Vida, dano, XP e ouro dos mobs × este valor, pela dificuldade da região (regras/mobs.js)
  forcaDaRegiao: { segura: 1, facil: 1, media: 1.5, dificil: 2.2, boss: 2.6 },
  // Onde os mobs nascem: longe dos inícios das regiões (o grupo nunca nasce com mob perto), longe uns dos outros e
  // longe da mata; "folga" é o espaço livre em volta de cada um ao nascer (ninguém nasce encostado em ninguém)
  nascimento: { longeDosInicios: 700, distanciaEntreMobs: 140, margem: 90, folga: 24 },
  // Mob que desistiu volta para casa sem olhar para o grupo por este tempo (dá para fugir dele)
  msVoltandoParaCasa: 3500,
  // Atacado, o mob persegue mesmo fora do território por este tempo (um tiro de longe não fica sem resposta)
  msProvocado: 5000,
  // Coleta (TASK-064): E pega o item mais perto a até "alcance" px do Líder. O drop de um mob fica no chão por
  // msDoDrop; o que não coube na mochila, por msQuandoNaoCabe (os dois piscam nos últimos 5 s e somem). Os recursos do
  // chão (cogumelo, erva, madeira) ficam até alguém pegar.
  coleta: { alcance: 80, msDoDrop: 60000, msQuandoNaoCabe: 30000 },
  // Minimapa (RF40): o mapa é dividido em células de "celula" px; o grupo revela tudo a até "raioRevelado" px do Líder
  minimapa: { celula: 200, raioRevelado: 450 },
  // XP da primeira descoberta de cada área (RF40), pela dificuldade da região; dividido como o dos monstros (RF50)
  xpPorArea: { segura: 0, facil: 30, media: 50, dificil: 80, boss: 120 },
  // Aliado longe ou preso: fora da tela e a mais de "distancia" px do Líder (ou travado) por "ms", reaparece fora da
  // tela, logo além da borda do lado em que estava, e entra andando (o jogador não vê sumiço nem salto)
  aliadoLonge: { distancia: 1100, ms: 3000, alemDaBorda: 70 },
}

// COMBATE DE TESTE (Fase 1, parte 5a): a arena com quadrados. Tudo aqui é provisório.
// Distâncias em pixels da arena (1600 × 900), tempos em milissegundos, velocidades em pixels por segundo.
export const combateDeTeste = {
  // Vida máxima = Vitalidade do personagem × este valor (Guerreiro 120, Tanque 180, Arqueiro 60...)
  vidaPorPontoDeVitalidade: 10,
  // Taxa por distância na arena (5c): o ponto inicial do bioma é onde o Líder nasce, e a "borda" fica a esta
  // distância dele (px da arena; o canto mais longe da arena fica a ~1400 px). Muda na etapa 6, com o mapa de verdade.
  distanciaAteABorda: 1400,
  // HUD (5c): quanto tempo cada mensagem curta fica na tela e quantas aparecem juntas
  hud: { msDaMensagem: 2500, mensagensNoMaximo: 4 },
  // Botões de teste (5c). "+ouro" soma ao ouro ganho na partida (para chegar à Grande Vitória sem jogar horas).
  // Teste do foco: o Líder fica com esta fração da vida (abaixo do limite do foco) por msPreso, com mobs perto.
  testes: { ouroDoBotao: 300, foco: { vidaDoLider: 0.25, msPreso: 20000, mobs: 3, distancia: 300 } },
  // Líder e aliados. Imunidade: tempo sem levar dano depois de apanhar (RF36)
  personagem: { tamanho: 40, velocidade: 220, msDeImunidade: 500, msDeEmpurrao: 150 },
  // Esquiva (Espaço): avanço curto, sem gastar mana e sem levar dano durante o avanço
  esquiva: { distancia: 160, ms: 150, recargaMs: 800 },
  // Desmaio e resgate (TASK-044). Os 30 s, os 5 s e os 10% da vida vêm de dados/regras.js (RF43).
  // Área limpa (aprovada pelo Pablo em 06/10): nenhum inimigo vivo a menos de raioDaAreaLimpa de quem caiu.
  // Ajuda: alguém de pé, parado (sem tentar andar), a até raioDaAjuda de quem caiu. Sem tecla.
  // Quem é levantado pela ajuda fica frágil: leva danoExtraFragil a mais (0,5 = +50%) por msDeFragilidade.
  desmaio: { raioDaAreaLimpa: 250, raioDaAjuda: 60, msDeFragilidade: 10000, danoExtraFragil: 0.5 },
  // Mana (TASK-046): máxima = base + Inteligência × porInteligencia; volta sozinha:
  // regeneracaoBase + Sabedoria × regeneracaoPorSabedoria por segundo. A vida não volta sozinha.
  mana: { base: 20, porInteligencia: 5, regeneracaoBase: 0.5, regeneracaoPorSabedoria: 0.15 },
  // IA dos aliados (TASK-043). Corrente: se o Líder passa de raioDaCorrente, todos largam a luta e voltam
  // até ficarem a raioDeVolta dele. Só lutam com inimigos a até raioDeCombate do Líder.
  // Arqueiro e Mago atacam de longe, dentro da faixa de distância. Mobs a até raioDeAtracaoDoTanque do
  // Tanque vão nele.
  ia: {
    raioDaCorrente: 420,
    raioDeVolta: 160,
    raioDeCombate: 380,
    distanciaDoArqueiro: { minima: 220, maxima: 320 },
    distanciaDoMago: { minima: 260, maxima: 420 },
    // IA básica: Arqueiro e Mago ficam mais perto da luta ("todo mundo vai para o meio")
    distanciaCurtaDoArqueiro: { minima: 120, maxima: 180 },
    distanciaCurtaDoMago: { minima: 150, maxima: 230 },
    raioDeAtracaoDoTanque: 260,
    // Sacerdote (regra do Pablo de 08/10): cura sempre que alguém não está com a vida cheia, o mais ferido primeiro.
    // empate: diferença de vida (em fração) que conta como empate (aí vai o Líder). urgenciaPorAtacante: na avançada,
    // cada inimigo mirando num ferido conta como essa fração a menos de vida. distanciaParaCurar: na avançada, fica
    // atrás do ferido, a essa fração do raio da aura (protegido do mob).
    sacerdote: { empate: 0.05, urgenciaPorAtacante: 0.1, distanciaParaCurar: 0.55 },
    // Desvio de quem está parado no caminho (08/10): a média vê o corpo parado só quando quase encosta e dá um passo
    // para o lado; a avançada vê de longe e contorna. A básica não desvia (escorrega e destrava). Em px.
    desvio: { media: { alcance: 45, folga: 6 }, avancada: { alcance: 140, folga: 10 } },
    // Parados (5b.1): cada aliado para em qualquer ponto entre a distância mínima e a máxima do Líder e só
    // volta a andar quando o Líder passa da máxima + folga. Na IA média e na avançada, para a até
    // toleranciaDaVaga px da vaga do X (posição mais arrumada).
    zonaConfortavel: { minima: 50, maxima: 130, folga: 50, toleranciaDaVaga: 40 },
    // Tremor: se numa janela anda mais que "razao" vezes o que sai do lugar (e sai menos que
    // deslocamentoMaximo), fica quieto por msQuieto (parado na formação: até o Líder sair da zona)
    tremor: { msDaJanela: 600, razao: 3, deslocamentoMaximo: 12, caminhoMinimo: 15, msQuieto: 1200 },
    // A cada msEntreDecisoes, cada aliado sorteia se vai errar "a decisão do momento" (não muda a cada quadro)
    msEntreDecisoes: 3000,
    // Linha de tiro: folga em volta do tiro (px) e quantos pontos em volta do alvo testar para achar um livre
    folgaDaLinhaDeTiro: { arqueiro: 6, mago: 16 },
    pontosParaLinhaDeTiro: 16,
    // IA avançada: formação de combate (distâncias em px)
    // tanqueNoPosto: o Tanque está "na frente" se estiver a até essa distância do lugar dele; senão o Guerreiro avançado
    // não fica esperando (vai proteger o Líder)
    formacaoDeCombate: { tanqueAteOMob: 60, guerreiroAoLado: 55, distanciaEntreArqueiroEMago: 120, sacerdoteAtras: 70, tanqueNoPosto: 90 },
    // Média: chance de o Sacerdote ficar mais para trás em cada decisão
    chanceDoSacerdoteAtras: 0.5,
    // Avançada: chance de recuar andando ao ver o aviso de golpe (os aliados não esquivam: a esquiva é só do Líder)
    chanceDeRecuarDoAviso: 0.5,
    // Momento de foco (avançada): quando o Líder fica abaixo de vidaDoLider ou alguém cai, por msDeDuracao
    // os aliados quase não erram (erro) e recuam mais do aviso (chanceDeRecuar)
    foco: { msDeDuracao: 8000, vidaDoLider: 0.3, erro: 0.02, chanceDeRecuar: 0.9 },
  },
  // Níveis da IA dos aliados (5b.1), pelo nível do próprio personagem. A chance de errar uma decisão cai de
  // erroNoComeco (primeiro nível da faixa) a erroNoFim (último). Nunca chega a 0: ninguém é perfeito.
  niveisDaIA: [
    { id: 'basica', nome: 'básica', ateONivel: 29, erroNoComeco: 0.45, erroNoFim: 0.3 },
    { id: 'media', nome: 'média', ateONivel: 69, erroNoComeco: 0.3, erroNoFim: 0.15 },
    { id: 'avancada', nome: 'avançada', ateONivel: 100, erroNoComeco: 0.15, erroNoFim: 0.05 },
  ],
  // Habilidades de TESTE (tecla 1), uma por classe, até a TASK-010. Nomes em dados/habilidades.js.
  habilidades: {
    // Giro: golpe em volta de si
    guerreiro: { custoDeMana: 20, recargaMs: 5000, dano: 35, raio: 100, empurrao: 320 },
    // Tiro perfurante: atravessa os inimigos e cruza o mapa (para em pedra e na borda)
    arqueiro: { custoDeMana: 25, recargaMs: 6000, dano: 60, velocidade: 1400, raio: 8, alcance: 1800, empurrao: 220 },
    // Meteoro: cai onde o mouse aponta (até o alcance) depois do aviso no chão
    mago: { custoDeMana: 35, recargaMs: 8000, dano: 50, raio: 130, alcance: 600, msDeQueda: 700, empurrao: 400 },
    // Provocação: os mobs no raio vão no Tanque, que leva (1 - reducaoDeDano) do dano enquanto dura
    tanque: { custoDeMana: 15, recargaMs: 10000, raio: 300, msDeDuracao: 4000, reducaoDeDano: 0.5 },
    // Ressurreição (Conceito §7): levanta os caídos no raio com vida cheia, imunidade e fortalecimento
    sacerdote: {
      custoDeMana: 60,
      recargaMs: 180000,
      raio: 120,
      msDeImunidade: 2000,
      msDeFortalecimento: 8000,
      bonusDeDano: 0.2,
    },
  },
  // Grupo: distância das vagas em volta do Líder
  raioDaFormacao: 80,
  // Zona em volta de cada corpo (ninguém fica em cima de ninguém). A zona de dois corpos vai até a soma das
  // metades + folga; dentro dela, os dois se afastam aos poucos, até "forca" px/s quando um está em cima do outro.
  // O Líder é mais pesado: quando ele esbarra, quem sai do caminho são os aliados.
  // 5b.1: folga de 1 px = a separação só age quando dois corpos se encostam de verdade (nunca para "arrumar")
  separacao: { folga: 1, forca: 320, pesoDoLider: 4, pesoDoInimigo: 1.5 },
  // Quem anda sozinho e quase não sai do lugar: a cada janela, se andou menos que a fração do que queria,
  // o travamento sobe um nível (escorrega, escorrega para o outro lado, dá a volta e, no último nível,
  // desliza depressa até o ponto livre mais próximo, com essa folga em volta).
  // Abaixo da velocidade mínima (px/s) ele não está "tentando andar" (por exemplo, freando ao chegar na vaga).
  travamento: {
    msDaJanela: 600,
    fracaoMinima: 0.25,
    velocidadeMinima: 60,
    nivelDoPontoLivre: 4,
    msDoDeslize: 150,
    folgaDoPontoLivre: 12,
  },
  // Caminho em volta das pedras: a arena vira uma grade de quadradinhos deste tamanho (px)
  caminho: { celula: 20, msEntreRecalculos: 500 },
  // Ataque de teste de cada classe (clique esquerdo). "empurrao" = velocidade do empurrão no alvo
  ataques: {
    guerreiro: { dano: 25, alcance: 70, aberturaGraus: 120, recargaMs: 400, empurrao: 260 },
    arqueiro: { dano: 18, velocidade: 900, alcance: 700, raio: 5, recargaMs: 350, empurrao: 140 },
    mago: {
      dano: 30,
      velocidade: 350,
      alcance: 500,
      raioInicial: 10,
      raioFinal: 26,
      raioDaExplosao: 90,
      recargaMs: 1500,
      empurrao: 320,
    },
    // Aura de cura (regra do Pablo de 08/10: cura sem pausa enquanto alguém estiver ferido): a recarga é igual à
    // duração, então uma aura nova sai assim que a anterior acaba, sem pausa e sem duas ao mesmo tempo. 5 por pulso a
    // cada 0,5 s = 10 de vida por segundo. Não gasta mana (é o ataque de clique, RF36).
    sacerdote: { raio: 150, curaPorPulso: 5, msEntrePulsos: 500, msDeDuracao: 3000, recargaMs: 3000 },
    tanque: {
      larguraDoEscudo: 70,
      espessuraDoEscudo: 16,
      distanciaDoEscudo: 40,
      aberturaDoBloqueioGraus: 100,
      dano: 8,
      alcanceDoEmpurrao: 90,
      recargaMs: 600,
      empurrao: 560,
    },
  },
  // Mob vermelho: persegue dentro do raio de detecção e desiste longe do raio de desistência.
  // xp e ouro: o que ele dá ao ser derrotado (5c; aprovado pelo Pablo em 07/10)
  mobVermelho: {
    xp: 20,
    ouro: 12,
    vida: 60,
    tamanho: 36,
    velocidade: 140,
    dano: 12,
    raioDeDeteccao: 350,
    raioDeDesistencia: 550,
    alcanceDoBote: 90,
    msDeAviso: 500,
    msDeBote: 200,
    distanciaDoBote: 120,
    recargaMs: 1200,
    empurrao: 380,
    raioDoPasseio: 120,
  },
  // Atirador: fica entre a distância mínima e a máxima do Líder e atira bolinhas lentas
  atirador: {
    xp: 25,
    ouro: 15,
    vida: 40,
    tamanho: 34,
    velocidade: 110,
    raioDeDeteccao: 600,
    raioDeDesistencia: 800,
    distanciaMinima: 300,
    distanciaMaxima: 450,
    msEntreTiros: 1800,
    msDeAviso: 300,
    velocidadeDoTiro: 220,
    raioDoTiro: 7,
    alcanceDoTiro: 700,
    dano: 8,
    empurrao: 180,
    raioDoPasseio: 100,
  },
  // Boneco de treino: não ataca e recupera toda a vida depois de um tempo sem apanhar
  boneco: { vida: 300, tamanho: 44, msParaRecuperar: 3000 },
}
