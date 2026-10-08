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

// COMBATE DE TESTE (Fase 1, parte 5a): a arena com quadrados. Tudo aqui é provisório.
// Distâncias em pixels da arena (1600 × 900), tempos em milissegundos, velocidades em pixels por segundo.
export const combateDeTeste = {
  // Vida máxima = Vitalidade do personagem × este valor (Guerreiro 120, Tanque 180, Arqueiro 60...)
  vidaPorPontoDeVitalidade: 10,
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
  // Tanque vão nele. O Sacerdote cura quem está abaixo de limiteParaCurar da vida (0,7 = 70%).
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
    limiteParaCurar: 0.7,
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
    formacaoDeCombate: { tanqueAteOMob: 60, guerreiroAoLado: 55, distanciaEntreArqueiroEMago: 120, sacerdoteAtras: 70 },
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
    sacerdote: { raio: 150, curaPorPulso: 8, msEntrePulsos: 500, msDeDuracao: 3000, recargaMs: 6000 },
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
  // Mob vermelho: persegue dentro do raio de detecção e desiste longe do raio de desistência
  mobVermelho: {
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
