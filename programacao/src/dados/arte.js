// ARTE DO JOGO (TASK-110 a TASK-116; Lista de Arte e Som em documentacao/Lista_de_Arte_e_Som.md).
// Para pôr uma imagem no jogo: salve o arquivo em programacao/src/assets/arte/ (pode usar subpastas) com o nome desta
// lista. O jogo encontra sozinho o que estiver lá (arte/indice.js); não precisa mexer em código. O que não tiver imagem
// continua como hoje (quadrados coloridos e telas cinza). Para conferir o que foi achado: npm run conferir:arte.
//
// O nome do arquivo não liga para maiúsculas, acentos, hífen, sublinhado nem espaço: "Guerreiro_Andando-Baixo.png" vale
// o mesmo que "guerreiro-andando-baixo.png". Formatos: PNG com fundo transparente (WEBP também; JPG só nos fundos).
//
// Animação: uma imagem por animação e direção, com os quadros (quadrados, todos do mesmo tamanho) lado a lado, sem
// espaço entre eles ("guerreiro-andando-baixo.png", 4 quadros de 48 × 48 = 192 × 48). Também valem os quadros soltos,
// numerados: "guerreiro-andando-baixo-1.png", "-2"... Os nomes em inglês do PixelLab também valem (south, north, west,
// east; idle, walk, attack...). Faltou uma direção ou uma animação: o jogo usa a mais parecida (regras/arte.js).
// Os tamanhos são proposta até o grupo decidir (TASK-110); o tamanho na tela é este, qualquer que seja o da imagem.

import { atributos, classes } from './classes.js'
import { arvoreDaClasse } from './arvores.js'
import { acoes, arteDaAcao, arteDaInterface, arteDoLugar, arteDoTipoDeMissao, lugaresDoReino, tiposDeMissaoNaTela } from './interface.js'
import { itens } from './itens.js'
import { posicoes } from './posicoes.js'

export const direcoes = ['baixo', 'cima', 'esquerda', 'direita']

// Outros nomes aceitos para cada direção e animação (os do PixelLab, em inglês)
export const apelidosDasDirecoes = {
  baixo: ['frente', 'south', 'down'],
  cima: ['costas', 'north', 'up'],
  esquerda: ['west', 'left'],
  direita: ['east', 'right'],
}
export const apelidosDasAnimacoes = {
  parado: ['parada', 'idle', 'breathing'],
  andando: ['andar', 'walk', 'walking', 'run', 'running'],
  aviso: ['avisando', 'warning', 'charge'],
  atacando: ['ataque', 'atacar', 'golpe', 'mordida', 'tiro', 'attack'],
  desmaiado: ['caido', 'desmaio', 'dead', 'death', 'die'],
}

// Velocidade de cada animação (quadros por segundo) e se repete; sem a animação, o jogo usa a da lista "reserva"
// (por ordem). O desmaiado sem imagem usa a parada, cinza e deitada (como o quadrado hoje).
export const animacoes = {
  parado: { quadrosPorSegundo: 3, repetir: true, reserva: [] },
  andando: { quadrosPorSegundo: 8, repetir: true, reserva: ['parado'] },
  aviso: { quadrosPorSegundo: 8, repetir: true, reserva: ['atacando', 'parado'] },
  atacando: { quadrosPorSegundo: 14, repetir: false, reserva: ['parado'] },
  desmaiado: { quadrosPorSegundo: 4, repetir: false, reserva: [] },
}

// Por quanto tempo o boneco mostra a animação de ataque depois de atacar (ms)
export const msDoAtaqueNaTela = 280

// Quem tem desenho na partida: o tamanho na tela (px, o lado do quadro desenhado; a hitbox não muda) e as animações que a
// lista pede (o desmaiado só numa direção). "usa": desenho emprestado de outro (os mobs da arena de teste).
// Personagens (Guia de Arte, 15/10): o PixelLab põe o boneco de 48 px num quadro de 68 × 68 (sobra para a animação), e o
// jogo desenha o quadro 1:1, sem esticar (pixel art esticada em 1,4× ou 0,7× borra).
const animacoesDasClasses = ['parado', 'andando', 'atacando', 'desmaiado']
export const quadroDosPersonagens = 68
export const bonecos = {
  ...Object.fromEntries(classes.map((classe) => [classe.id, { nome: classe.nome, tamanhoNaTela: quadroDosPersonagens, animacoes: animacoesDasClasses }])),
  // Mobs da Floresta (PROVISÓRIO até a TASK-012) e o Boss
  lobo: { nome: 'Lobo', tamanhoNaTela: 48, animacoes: ['andando', 'aviso', 'atacando'] },
  aranha: { nome: 'Aranha', tamanhoNaTela: 44, animacoes: ['andando', 'aviso', 'atacando'] },
  javali: { nome: 'Javali', tamanhoNaTela: 56, animacoes: ['andando', 'aviso', 'atacando'] },
  cervo: { nome: 'Cervo', tamanhoNaTela: 48, animacoes: ['andando', 'atacando'] },
  guardiao: { nome: 'Guardião da Floresta (Boss)', tamanhoNaTela: 128, animacoes: ['parado', 'andando', 'aviso', 'atacando'] },
  // Arena de teste (só no npm run dev): sem arte própria, usam a do lobo e a da aranha
  mobVermelho: { usa: 'lobo' },
  atirador: { usa: 'aranha' },
}

// Chão e obstáculos da Floresta. Os tiles são juntados uma vez numa textura grande (as variações de grama sorteadas), e
// cada região ganha o seu tom: a grama pronta da região ("grama-facil"...) ou a grama comum com a tinta abaixo.
export const arteDaFloresta = {
  tamanhoDoTile: 32, // px na tela de cada tile, qualquer que seja o tamanho da imagem
  tilesPorBloco: 8, // a textura grande tem 8 × 8 tiles sorteados (repetida pelo chão todo)
  grama: ['grama-1', 'grama-2', 'grama-3', 'grama'],
  flores: 'flores',
  chanceDeFlores: 0.05, // a cada tile do bloco
  mata: 'mata', // tile da mata fechada (a parede em volta); sem ele, a cor escura de hoje
  tomDaRegiao: { zonaSegura: 0xffffff, facil: 0xf0fff0, media: 0xd8f0d0, dificil: 0xbcd8b4, dominioDoBoss: 0xa8bcae },
  arvore: 'arvore',
  arbusto: 'arbusto',
  tronco: 'tronco',
  // A pedra pela largura da hitbox (px): até "media" é a pequena, até "grande" a média, daí para cima a grande
  pedras: { pequena: 'pedra-pequena', media: 'pedra-media', grande: 'pedra-grande' },
  larguraDaPedra: { media: 82, grande: 106 },
  // Quanto a imagem passa da hitbox (a árvore cresce para cima: a copa fica acima do tronco)
  folgaDaPedra: 1.08,
  larguraDaArvore: 1.35,
  // A copa na frente do Líder fica transparente (para ninguém sumir atrás dela)
  transparenciaDaCopa: 0.45,
  // Marcas de aviso do Boss no chão (o jogo estica a imagem)
  avisos: { pisao: 'aviso-circulo', investida: 'aviso-faixa', espinhos: 'aviso-linha' },
}

// Itens no chão (a partida) e nas listas (Mochila, Mercado, Forja): o ícone do item
export const tamanhoDoItemNoChao = 28
export const iconeDoItem = (id) => `item-${id}`
export const iconeDoAtributo = (id) => `atributo-${id}`
export const iconeDaHabilidade = (id) => `habilidade-${id}`
export const retratoDaClasse = (classe) => `retrato-${classe}`
// O emblema da classe (Guia de Arte, 15/10; como os da Seleção de classe do protótipo): nos lugares pequenos (o HUD da
// partida, as listas), no lugar do quadradinho da cor; nos grandes fica o retrato
export const iconeDaClasse = (classe) => `classe-${classe}`
export const iconeDoOuro = 'ouro'
export const iconeDaPedraDeRetorno = 'pedra-de-retorno'

// Fundo de cada tela: primeiro "fundo-<id da tela>" (por exemplo fundo-mercado), depois o da lista abaixo. A Partida
// não tem fundo (o jogo ocupa tudo).
export const fundosDasTelas = {
  telaInicial: 'fundo-inicio',
  narrativaInicial: 'fundo-inicio',
  login: 'fundo-acesso',
  criarConta: 'fundo-acesso',
  confirmeEmail: 'fundo-acesso',
  esqueciSenha: 'fundo-acesso',
  novaSenha: 'fundo-acesso',
  escolherApelido: 'fundo-acesso',
  selecaoClasse: 'fundo-selecao',
  reino: 'fundo-reino',
  mapa: 'fundo-mapa',
  resumo: 'fundo-resumo',
}

// O Reino e o Mapa em camadas, com as peças do Pablo (21/10; posições em dados/posicoes.js). Cada peça é um arquivo
// próprio, cópia sem perda dos originais de documentacao/Telas (a Lista de Arte e Som diz de qual veio cada uma):
// trocando uma pela mesma imagem com outro desenho, só ela muda. Sem o fundo (reino-fundo), o Reino usa a imagem
// inteira (fundo-reino) e o clique vale no retângulo de cada lugar; sem o oceano, o Mapa usa a dele (fundo-mapa).
export const camadasDoReino = {
  fundo: 'reino-fundo',
  peca: (id) => `reino-${id}`, // moinhoPas → reino-moinho-pas (o nome não liga para maiúsculas e hífen)
  nuvem: (i) => `reino-nuvem-${i + 1}`,
}
export const camadasDoMapa = {
  oceano: 'mapa-oceano',
}

// Cutscene de derrota: as imagens em sequência e quanto tempo cada uma fica (ms)
export const cutsceneDeDerrota = { imagens: ['derrota-1', 'derrota-2', 'derrota-3'], msPorImagem: 2200 }

// Tamanho sugerido de cada grupo (para o npm run conferir:arte avisar de imagem estranha)
export const tamanhosSugeridos = {
  personagem: quadroDosPersonagens,
  mob: 48,
  boss: 128,
  tile: 32,
  icone: 32,
  retrato: 128,
  fundo: { largura: 1920, altura: 1080 },
}

// Tudo o que a lista pede, por grupo, para o npm run conferir:arte mostrar o que já chegou e o que falta
export function arteEsperada() {
  const grupos = []
  const nomesDoBoneco = (id) => {
    const boneco = bonecos[id]
    return boneco.animacoes.flatMap((animacao) => (animacao === 'desmaiado' ? [`${id}-desmaiado`] : direcoes.map((direcao) => `${id}-${animacao}-${direcao}`)))
  }
  grupos.push({ grupo: 'Personagens (faixas de animação)', tipo: 'personagem', nomes: classes.flatMap((classe) => nomesDoBoneco(classe.id)) })
  grupos.push({ grupo: 'Retratos das classes', tipo: 'retrato', nomes: classes.map((classe) => retratoDaClasse(classe.id)) })
  grupos.push({ grupo: 'Ícones das classes (emblemas)', tipo: 'icone', nomes: classes.map((classe) => iconeDaClasse(classe.id)) })
  grupos.push({ grupo: 'Monstros da Floresta (faixas de animação)', tipo: 'mob', nomes: ['lobo', 'aranha', 'javali', 'cervo'].flatMap(nomesDoBoneco) })
  grupos.push({ grupo: 'Boss: Guardião da Floresta', tipo: 'boss', nomes: [...nomesDoBoneco('guardiao'), ...Object.values(arteDaFloresta.avisos)] })
  grupos.push({
    grupo: 'Floresta: chão e obstáculos',
    tipo: 'tile',
    nomes: ['grama-1', 'grama-2', 'grama-3', arteDaFloresta.flores, arteDaFloresta.mata, arteDaFloresta.arvore, arteDaFloresta.arbusto, arteDaFloresta.tronco, ...Object.values(arteDaFloresta.pedras)],
  })
  grupos.push({ grupo: 'Telas (fundos)', tipo: 'fundo', nomes: [...new Set([...Object.values(fundosDasTelas), ...cutsceneDeDerrota.imagens])] })
  const reino = posicoes.reino
  grupos.push({
    grupo: 'Reino em camadas (as peças do Pablo)',
    tipo: 'camada',
    nomes: [camadasDoReino.fundo, ...Object.keys(reino.pecas).map(camadasDoReino.peca), ...reino.animacoes.nuvens.lista.map((_, i) => camadasDoReino.nuvem(i))],
  })
  const mapa = posicoes.mapa
  grupos.push({
    grupo: 'Mapa em camadas (as peças do Pablo)',
    tipo: 'camada',
    nomes: [
      camadasDoMapa.oceano,
      ...Object.values(mapa.biomas).map((bioma) => bioma.peca),
      ...Object.values(mapa.enfeites).map((enfeite) => enfeite.peca),
      ...Object.values(mapa.planalto).map((lugar) => lugar.peca),
      mapa.animacoes.fumaca.peca,
    ],
  })
  grupos.push({ grupo: 'Ícones: atributos, ouro e Pedra de Retorno', tipo: 'icone', nomes: [...atributos.map((atributo) => iconeDoAtributo(atributo.id)), iconeDoOuro, iconeDaPedraDeRetorno] })
  grupos.push({
    grupo: 'Ícones: habilidades do beta',
    tipo: 'icone',
    nomes: classes.flatMap((classe) => arvoreDaClasse(classe.id).filter((habilidade) => habilidade.noBeta).map((habilidade) => iconeDaHabilidade(habilidade.id))),
  })
  grupos.push({ grupo: 'Interface: molduras, botões, quadradinhos, barras e selos (Fase 4.5)', tipo: 'interface', nomes: Object.values(arteDaInterface).map((parte) => parte.nome) })
  grupos.push({
    grupo: 'Interface: símbolos das ações, dos tipos de missão e dos lugares do Reino',
    tipo: 'icone',
    nomes: [...Object.keys(acoes).map(arteDaAcao), ...Object.keys(tiposDeMissaoNaTela).map(arteDoTipoDeMissao), ...Object.keys(lugaresDoReino).map(arteDoLugar)],
  })
  grupos.push({
    grupo: 'Ícones: itens',
    tipo: 'icone',
    nomes: Object.values(itens)
      .filter((item) => item.raridade !== 'teste')
      .map((item) => iconeDoItem(item.id)),
  })
  return grupos
}
