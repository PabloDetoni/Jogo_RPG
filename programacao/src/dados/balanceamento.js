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
  // Provisório até a TASK-044: Líder sem vida → Derrota depois deste tempo
  msAteADerrota: 2000,
  // Grupo: distância das vagas em volta do Líder
  raioDaFormacao: 80,
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
