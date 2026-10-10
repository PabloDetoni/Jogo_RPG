import { combateDeTeste } from './balanceamento.js'

// ÁRVORES DE HABILIDADES (Fase 4, TASK-077; RF24, Conceito §7 e §18).
// PROVISÓRIO – substituir pelo do grupo (habilidades do beta: TASK-010). Para trocar, mude só esta lista: o save guarda
// o id e o nível de cada habilidade aprendida, e a partida e as telas leem tudo daqui.
//
// Cada classe tem uma árvore de 10 habilidades, todas com a mesma forma (Conceito §7): uma raiz (gratuita, já vem no
// nível 1) e três ramos de três (camadas 2, 3 e 4). A próxima de um ramo libera quando a anterior chega ao nível 5; a
// primeira de cada ramo libera com a raiz no nível 5. Os ramos não são exclusivos.
// No beta (Conceito §18.1), 4 por classe: a raiz e a primeira de cada ramo ("noBeta"); as outras aparecem como
// "fora do beta".
//
// Campos: nome, descricao, tipo ('ativa' | 'passiva'), ramo ('raiz' | 'a' | 'b' | 'c'), camada (1 a 4) e noBeta.
// Ativa: efeito (o que faz na partida, jogo/habilidades/) e os números no nível 1 (custoDeMana, recargaMs, dano, raio...);
// os números sobem com o nível pela regra de balanceamento.js (evolucaoDasHabilidades).
// Passiva: efeito ('vida' | 'mana' | 'critico' | 'defesa' | 'cura') e porNivel (quanto soma a cada nível).

const foraDoBeta = (nome, descricao, tipo, ramo, camada) => ({ nome, descricao, tipo, ramo, camada, noBeta: false })
const { habilidades: raizes } = combateDeTeste

const arvoresPorClasse = {
  guerreiro: {
    giro: { nome: 'Giro', descricao: 'Golpe em volta de si que empurra quem estiver perto.', tipo: 'ativa', ramo: 'raiz', camada: 1, noBeta: true, efeito: 'giro', numeros: raizes.guerreiro },
    golpePesado: {
      nome: 'Golpe pesado',
      descricao: 'Um golpe forte e curto em volta: muito dano em quem está colado.',
      tipo: 'ativa',
      ramo: 'a',
      camada: 2,
      noBeta: true,
      efeito: 'giro',
      numeros: { custoDeMana: 25, recargaMs: 7000, dano: 70, raio: 75, empurrao: 420, cor: 0xffb347 },
    },
    terremoto: foraDoBeta('Terremoto', 'O chão treme em volta e derruba os inimigos.', 'ativa', 'a', 3),
    laminaGiratoria: foraDoBeta('Lâmina giratória', 'Vários giros seguidos enquanto anda.', 'ativa', 'a', 4),
    furia: {
      nome: 'Fúria',
      descricao: 'Berserk: o Guerreiro causa mais dano por alguns segundos.',
      tipo: 'ativa',
      ramo: 'b',
      camada: 2,
      noBeta: true,
      efeito: 'fortalecer',
      numeros: { custoDeMana: 30, recargaMs: 20000, msDeDuracao: 6000, bonusDeDano: 0.3, alvo: 'dono', cor: 0xff4d4d },
    },
    sedeDeSangue: foraDoBeta('Sede de sangue', 'Cada inimigo derrotado devolve um pouco de vida.', 'passiva', 'b', 3),
    gritoDeGuerra: foraDoBeta('Grito de guerra', 'O grupo inteiro causa mais dano por um tempo.', 'ativa', 'b', 4),
    peleGrossa: { nome: 'Pele grossa', descricao: 'Mais vida máxima.', tipo: 'passiva', ramo: 'c', camada: 2, noBeta: true, efeito: 'vida', porNivel: 0.04 },
    postura: foraDoBeta('Postura firme', 'Empurrões quase não movem o Guerreiro.', 'passiva', 'c', 3),
    ultimoSuspiro: foraDoBeta('Último suspiro', 'Com pouca vida, causa muito mais dano.', 'passiva', 'c', 4),
  },
  mago: {
    meteoro: { nome: 'Meteoro', descricao: 'Explosão grande onde o mouse aponta, depois do aviso no chão.', tipo: 'ativa', ramo: 'raiz', camada: 1, noBeta: true, efeito: 'meteoro', numeros: raizes.mago },
    descargaEletrica: {
      nome: 'Descarga elétrica',
      descricao: 'Um raio que atravessa os inimigos em linha reta.',
      tipo: 'ativa',
      ramo: 'a',
      camada: 2,
      noBeta: true,
      efeito: 'tiroPerfurante',
      numeros: { custoDeMana: 25, recargaMs: 5000, dano: 40, velocidade: 1100, raio: 10, alcance: 900, empurrao: 120, cor: 0x7fd8ff },
    },
    correnteEletrica: foraDoBeta('Corrente elétrica', 'O raio pula de um inimigo para outro.', 'ativa', 'a', 3),
    tempestade: foraDoBeta('Tempestade', 'Raios caem por toda a área por alguns segundos.', 'ativa', 'a', 4),
    explosaoDeFogo: {
      nome: 'Explosão de fogo',
      descricao: 'Fogo em volta do Mago, que afasta quem chega perto.',
      tipo: 'ativa',
      ramo: 'b',
      camada: 2,
      noBeta: true,
      efeito: 'giro',
      numeros: { custoDeMana: 30, recargaMs: 7000, dano: 45, raio: 140, empurrao: 300, cor: 0xff7b3a },
    },
    paredeDeFogo: foraDoBeta('Parede de fogo', 'Uma linha de fogo que queima quem passa.', 'ativa', 'b', 3),
    inferno: foraDoBeta('Inferno', 'Uma área enorme de fogo.', 'ativa', 'b', 4),
    menteClara: { nome: 'Mente clara', descricao: 'A mana volta mais rápido.', tipo: 'passiva', ramo: 'c', camada: 2, noBeta: true, efeito: 'mana', porNivel: 0.08 },
    escudoArcano: foraDoBeta('Escudo arcano', 'Parte do dano gasta mana em vez de vida.', 'passiva', 'c', 3),
    sabedoriaAntiga: foraDoBeta('Sabedoria antiga', 'As habilidades gastam menos mana.', 'passiva', 'c', 4),
  },
  tanque: {
    provocacao: { nome: 'Provocação', descricao: 'Os mobs perto vão no Tanque, que leva metade do dano.', tipo: 'ativa', ramo: 'raiz', camada: 1, noBeta: true, efeito: 'provocacao', numeros: raizes.tanque },
    golpeDeEscudo: {
      nome: 'Golpe de escudo',
      descricao: 'Empurra para longe todos os inimigos em volta.',
      tipo: 'ativa',
      ramo: 'a',
      camada: 2,
      noBeta: true,
      efeito: 'giro',
      numeros: { custoDeMana: 15, recargaMs: 6000, dano: 20, raio: 110, empurrao: 600, cor: 0xb0b8c4 },
    },
    investida: foraDoBeta('Investida', 'Corre até um inimigo e o derruba.', 'ativa', 'a', 3),
    tremorDeTerra: foraDoBeta('Tremor de terra', 'Atordoa os inimigos em volta.', 'ativa', 'a', 4),
    muralha: {
      nome: 'Muralha',
      descricao: 'O grupo perto do Tanque leva menos dano por alguns segundos.',
      tipo: 'ativa',
      ramo: 'b',
      camada: 2,
      noBeta: true,
      efeito: 'proteger',
      numeros: { custoDeMana: 30, recargaMs: 25000, msDeDuracao: 5000, reducaoDeDano: 0.3, raio: 250, cor: 0x9fc5ff },
    },
    guardiao: foraDoBeta('Guardião', 'Recebe parte do dano de um aliado.', 'ativa', 'b', 3),
    fortaleza: foraDoBeta('Fortaleza', 'Fica parado e quase não leva dano.', 'ativa', 'b', 4),
    peleDeFerro: { nome: 'Pele de ferro', descricao: 'Mais defesa: leva menos dano de todo golpe.', tipo: 'passiva', ramo: 'c', camada: 2, noBeta: true, efeito: 'defesa', porNivel: 2 },
    vigor: foraDoBeta('Vigor', 'A vida volta devagar fora de combate.', 'passiva', 'c', 3),
    inabalavel: foraDoBeta('Inabalável', 'Não pode ser empurrado.', 'passiva', 'c', 4),
  },
  sacerdote: {
    ressurreicao: { nome: 'Ressurreição', descricao: 'Levanta os caídos perto, com vida cheia.', tipo: 'ativa', ramo: 'raiz', camada: 1, noBeta: true, efeito: 'ressurreicao', numeros: raizes.sacerdote },
    curaEmArea: {
      nome: 'Cura em área',
      descricao: 'Cura todo o grupo perto do Sacerdote de uma vez.',
      tipo: 'ativa',
      ramo: 'a',
      camada: 2,
      noBeta: true,
      efeito: 'curar',
      numeros: { custoDeMana: 30, recargaMs: 8000, cura: 30, raio: 200, cor: 0x7dff9a },
    },
    renovacao: foraDoBeta('Renovação', 'Cura um pouco por segundo, durante um tempo.', 'ativa', 'a', 3),
    milagre: foraDoBeta('Milagre', 'Cura todo o grupo, em qualquer lugar do mapa.', 'ativa', 'a', 4),
    bencao: {
      nome: 'Bênção',
      descricao: 'O grupo perto causa mais dano por alguns segundos.',
      tipo: 'ativa',
      ramo: 'b',
      camada: 2,
      noBeta: true,
      efeito: 'fortalecer',
      numeros: { custoDeMana: 35, recargaMs: 20000, msDeDuracao: 6000, bonusDeDano: 0.2, raio: 250, alvo: 'grupo', cor: 0xffe08a },
    },
    escudoSagrado: foraDoBeta('Escudo sagrado', 'Um aliado fica imune por um instante.', 'ativa', 'b', 3),
    luzDivina: foraDoBeta('Luz divina', 'Feixe de luz que machuca os inimigos.', 'ativa', 'b', 4),
    fe: { nome: 'Fé', descricao: 'Todas as curas do Sacerdote curam mais.', tipo: 'passiva', ramo: 'c', camada: 2, noBeta: true, efeito: 'cura', porNivel: 0.08 },
    serenidade: foraDoBeta('Serenidade', 'A mana volta mais rápido.', 'passiva', 'c', 3),
    devocao: foraDoBeta('Devoção', 'A Ressurreição recarrega mais rápido.', 'passiva', 'c', 4),
  },
  arqueiro: {
    tiroPerfurante: { nome: 'Tiro perfurante', descricao: 'Atravessa os inimigos e cruza o mapa.', tipo: 'ativa', ramo: 'raiz', camada: 1, noBeta: true, efeito: 'tiroPerfurante', numeros: raizes.arqueiro },
    chuvaDeFlechas: {
      nome: 'Chuva de flechas',
      descricao: 'Flechas caem onde o mouse aponta, depois do aviso no chão.',
      tipo: 'ativa',
      ramo: 'a',
      camada: 2,
      noBeta: true,
      efeito: 'meteoro',
      numeros: { custoDeMana: 30, recargaMs: 9000, dano: 40, raio: 120, alcance: 700, msDeQueda: 500, empurrao: 150, cor: 0xd9c27a },
    },
    flechaExplosiva: foraDoBeta('Flecha explosiva', 'Explode ao acertar.', 'ativa', 'a', 3),
    tempestadeDeFlechas: foraDoBeta('Tempestade de flechas', 'Flechas sem parar por alguns segundos.', 'ativa', 'a', 4),
    flechaCerteira: {
      nome: 'Flecha certeira',
      descricao: 'Uma flecha muito forte e rápida, que para no primeiro inimigo.',
      tipo: 'ativa',
      ramo: 'b',
      camada: 2,
      noBeta: true,
      efeito: 'tiroPerfurante',
      numeros: { custoDeMana: 20, recargaMs: 4000, dano: 90, velocidade: 1900, raio: 7, alcance: 1400, empurrao: 300, perfura: false, cor: 0xffffff },
    },
    tiroDuplo: foraDoBeta('Tiro duplo', 'Duas flechas de uma vez.', 'ativa', 'b', 3),
    marcaDoCacador: foraDoBeta('Marca do caçador', 'O inimigo marcado leva mais dano do grupo.', 'ativa', 'b', 4),
    olhoDeAguia: { nome: 'Olho de águia', descricao: 'Mais chance de crítico.', tipo: 'passiva', ramo: 'c', camada: 2, noBeta: true, efeito: 'critico', porNivel: 0.02 },
    passosLeves: foraDoBeta('Passos leves', 'Anda mais rápido.', 'passiva', 'c', 3),
    precisao: foraDoBeta('Precisão', 'Os críticos causam ainda mais dano.', 'passiva', 'c', 4),
  },
}

// A árvore de uma classe, como lista, com o id dentro de cada habilidade
export function arvoreDaClasse(classe) {
  return Object.entries(arvoresPorClasse[classe] ?? {}).map(([id, habilidade]) => ({ id, ...habilidade }))
}

// A raiz (gratuita) da classe
export function raizDaClasse(classe) {
  return arvoreDaClasse(classe).find((habilidade) => habilidade.ramo === 'raiz') ?? null
}

export const nomesDosRamos = { raiz: 'Raiz', a: 'Ramo 1', b: 'Ramo 2', c: 'Ramo 3' }
