// INTERFACE (Fase 4.5): o padrão visual de todas as telas (documentacao/Guia_de_Interface.md).
// Cada ação tem uma cor e um símbolo, iguais no jogo todo; a raridade dá a cor da borda dos quadradinhos dos itens.
// Até a pixel art chegar, tudo é forma simples (quadrado, círculo, símbolo ou letra). Com a imagem da lista em
// src/assets/arte/ (nomes abaixo, também em dados/arte.js), ela aparece no lugar, sem mexer em código.

// Ações: cor (borda e símbolo dos botões) e símbolo (aparece num quadradinho da cor, antes do verbo)
// Tela de carregamento da partida (ajustes de 14/10): depois de msLimite sem o mapa pronto, avisa e oferece "Tentar de
// novo"; quando fica pronta, some num fade de msDoSumico
export const carregamentoDaPartida = { msLimite: 20000, msDoSumico: 350 }

export const acoes = {
  comprar: { nome: 'Comprar', cor: '#b8740a', simbolo: '⊖', significado: 'o ouro sai (moeda saindo)' },
  vender: { nome: 'Vender', cor: '#2b8a3e', simbolo: '⊕', significado: 'o ouro entra (moeda entrando)' },
  trocar: { nome: 'Trocar', cor: '#1971c2', simbolo: '⇄', significado: 'item por item, sem ouro' },
  fabricar: { nome: 'Fabricar', cor: '#d9480f', simbolo: '⚒', significado: 'materiais viram equipamento (martelo)' },
  equipar: { nome: 'Equipar', cor: '#6741d9', simbolo: '⛨', significado: 'vestir no personagem (escudo)' },
  tirar: { nome: 'Tirar', cor: '#6741d9', simbolo: '↩', significado: 'a peça volta para a Mochila' },
  contratar: { nome: 'Contratar', cor: '#a61e4d', simbolo: '✎', significado: 'assinar um contrato (pena)' },
  aceitar: { nome: 'Aceitar', cor: '#0b7285', simbolo: '!', significado: 'pegar uma missão do quadro' },
  entregar: { nome: 'Entregar', cor: '#0b7285', simbolo: '✓', significado: 'receber a recompensa da missão' },
  perder: { nome: 'Descartar ou abandonar', cor: '#c92a2a', simbolo: '✕', significado: 'algo some (item, missão, multa)' },
  usar: { nome: 'Usar', cor: '#d6336c', simbolo: '♥', significado: 'usar um item' },
  levar: { nome: 'Levar', cor: '#1098ad', simbolo: '→', significado: 'da Mochila do Reino para a da partida' },
  aplicar: { nome: 'Aplicar', cor: '#5c940d', simbolo: '+', significado: 'fixar pontos e escolhas' },
  jogar: { nome: 'Jogar', cor: '#4263eb', simbolo: '▶', significado: 'começar a partida ou a rodada' },
}

// Cor da borda de cada raridade (o nome fica no detalhe do item)
export const coresDasRaridades = {
  comum: '#868e96',
  incomum: '#2f9e44',
  raro: '#1c7ed6',
  especial: '#f08c00',
  teste: '#e64980',
}

// Nome de cada tipo de item (o selo no detalhe)
export const nomesDosTipos = { recurso: 'Recurso', material: 'Material', consumivel: 'Consumível', utilitario: 'Utilitário', equipamento: 'Equipamento' }

// Forma do quadradinho de cada tipo de item, até o ícone chegar (a inicial do nome vai dentro, na cor do item)
export const formasDosTipos = { consumivel: 'circulo', recurso: 'quadrado', material: 'losango', equipamento: 'escudo', utilitario: 'pergaminho' }

// Filtros das grades de itens: um item entra se o tipo ou a raridade estiver na lista
export const filtrosDeItens = [
  { id: 'todos', nome: 'Todos' },
  { id: 'consumiveis', nome: 'Consumíveis', tipos: ['consumivel'] },
  { id: 'materiais', nome: 'Materiais', tipos: ['material', 'recurso'] },
  { id: 'equipamentos', nome: 'Equipamentos', tipos: ['equipamento'] },
  { id: 'especiais', nome: 'Especiais', tipos: ['utilitario'], raridades: ['especial'] },
]

// Ordem dos itens nas grades: o que se usa primeiro, depois equipamento, materiais e recursos
export const ordemDosTipos = ['consumivel', 'utilitario', 'equipamento', 'material', 'recurso']

// Tamanho dos quadradinhos na tela (px): o ícone de 32 px aparece em tamanho inteiro (2× nas grades do Reino; 1× no
// boneco da Forja, nas receitas e trocas e na mochila da partida), sem borrar
export const ladoDoSlot = { grande: 72, medio: 56, pequeno: 44 }
export const ladoDoIconeNoSlot = { grande: 64, medio: 32, pequeno: 32 }

// Missões: símbolo e cor de cada tipo (o ícone do cartaz)
export const tiposDeMissaoNaTela = {
  matar: { nome: 'Matar', simbolo: '⚔', cor: '#c92a2a' },
  coletar: { nome: 'Coletar', simbolo: '✿', cor: '#2b8a3e' },
  entregar: { nome: 'Entregar', simbolo: '✉', cor: '#b8740a' },
  explorar: { nome: 'Explorar', simbolo: '⚑', cor: '#1971c2' },
}

// Lugares do Reino: símbolo e o que cada um é (uma linha embaixo do botão)
export const lugaresDoReino = {
  guilda: { simbolo: '♜', legenda: 'missões e contratos' },
  mercado: { simbolo: '⚖', legenda: 'comprar, vender e trocar' },
  forja: { simbolo: '⚒', legenda: 'equipar e fabricar' },
  mochila: { simbolo: '▣', legenda: 'os seus itens' },
  arvores: { simbolo: '♣', legenda: 'atributos e habilidades' },
  jogar: { simbolo: '▶', legenda: 'escolher o bioma' },
}

// Posições dos 7 espaços em volta do boneco na Forja (coluna e linha de uma grade 3 × 4; o boneco fica no meio)
export const espacosEmVoltaDoBoneco = {
  capacete: { coluna: 2, linha: 1 },
  arma: { coluna: 1, linha: 2 },
  escudo: { coluna: 3, linha: 2 },
  peitoral: { coluna: 1, linha: 3 },
  manoplas: { coluna: 3, linha: 3 },
  calcas: { coluna: 1, linha: 4 },
  botas: { coluna: 3, linha: 4 },
}

// Arte da interface (os nomes dos arquivos em src/assets/arte/). "fatia": quantos px de cada canto da imagem são a
// borda (molduras esticáveis, o jeito "9 pedaços": os cantos ficam do tamanho certo e o meio estica).
export const arteDaInterface = {
  moldura: { nome: 'moldura-painel', fatia: 12 },
  botao: { nome: 'botao', fatia: 8 },
  selo: { nome: 'selo', fatia: 6 },
  cartaz: { nome: 'cartaz', fatia: 12 },
  carta: { nome: 'carta', fatia: 12 },
  slot: { nome: 'slot' },
  slotEscolhido: { nome: 'slot-escolhido' },
  barraFundo: { nome: 'barra-fundo' },
  barraCheia: { nome: 'barra-cheia' },
  silhueta: { nome: 'silhueta-boneco' },
}
export const arteDaAcao = (id) => `acao-${id}`
export const arteDoTipoDeMissao = (id) => `tipo-${id}`
export const arteDoLugar = (id) => `lugar-${id}`

// Quanto tempo o aviso de uma conquista fica no canto antes de sumir sozinho (ms)
export const msDoAvisoDeConquista = 6000
