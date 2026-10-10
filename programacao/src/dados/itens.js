// CATÁLOGO DE ITENS DO BETA (TASK-070, Fase 4).
// PROVISÓRIO – substituir pelo do grupo (catálogo, receitas e Mercado: TASK-014). Para trocar um item, mude só esta
// lista: o save guarda apenas o id e a quantidade de cada item, e as telas e a partida leem tudo daqui.
//
// Campos de todo item:
// - nome, descricao (uma frase), peso (inteiro, por unidade, RF33), preco (ouro, o valor de compra; quem vende recebe
//   uma parte, ver balanceamento.js, mercado.fracaoDaVenda) e raridade ('comum' | 'incomum' | 'raro' | 'especial' |
//   'teste');
// - tipo: 'recurso' (do chão), 'material' (partes de monstros e da mina), 'consumivel' (usado na partida com E ou R),
//   'utilitario' (usado no Reino, como o pergaminho) ou 'equipamento';
// - cor: só o quadradinho que aparece no chão até a arte chegar.
// Consumível e utilitário têm "efeito" (o que acontece ao usar). Equipamento tem espaco (dados/equipamento.js),
// classes ('todas' para armadura, ou a lista das classes que podem usar: arma e escudo são da própria classe, RF22),
// bonus (pontos somados aos atributos), defesa (dano físico a menos, regras/equipamento.js) e, às vezes,
// reducaoDeRecarga (fração a menos nas recargas das habilidades).
// A "função" que a Mochila mostra sai de funcaoDoItem (abaixo), a partir desses campos.

const dados = {
  // ---------- Recursos do chão da Floresta (coletados com E) ----------
  cogumelo: { nome: 'Cogumelo', tipo: 'recurso', raridade: 'comum', peso: 1, preco: 3, cor: 0xd9604c, descricao: 'Cresce na sombra das árvores. Usado em poções.' },
  ervaMedicinal: { nome: 'Erva medicinal', tipo: 'recurso', raridade: 'comum', peso: 1, preco: 4, cor: 0x8fe36b, descricao: 'Folhas que ajudam a curar ferimentos.' },
  madeira: { nome: 'Madeira', tipo: 'recurso', raridade: 'comum', peso: 3, preco: 2, cor: 0xa0703f, descricao: 'Galhos firmes, bons para a Forja.' },

  // ---------- Partes de monstros (drops) e materiais ----------
  peleDeLobo: { nome: 'Pele de lobo', tipo: 'material', raridade: 'comum', peso: 2, preco: 8, cor: 0x9a8f86, descricao: 'Pele grossa de lobo da Floresta.' },
  teiaDeAranha: { nome: 'Teia de aranha', tipo: 'material', raridade: 'comum', peso: 1, preco: 6, cor: 0xf2f2f2, descricao: 'Fios resistentes e grudentos.' },
  presaDeJavali: { nome: 'Presa de javali', tipo: 'material', raridade: 'incomum', peso: 2, preco: 15, cor: 0xf0e6c8, descricao: 'Presa curva e afiada.' },
  chifreDeCervo: { nome: 'Chifre de cervo', tipo: 'material', raridade: 'incomum', peso: 3, preco: 18, cor: 0xc9a36b, descricao: 'Chifre que o cervo deixa ao fugir.' },
  cascaAntiga: { nome: 'Casca antiga', tipo: 'material', raridade: 'raro', peso: 4, preco: 60, cor: 0x5d4a2e, descricao: 'Pedaço da casca do Guardião da Floresta.' },
  minerioDeFerro: { nome: 'Minério de ferro', tipo: 'material', raridade: 'comum', peso: 3, preco: 12, cor: 0x8a8f99, descricao: 'Pedra com ferro, vinda da mina do Planalto.' },

  // ---------- Consumíveis (na partida: Tab abre a mochila, E usa no Líder, R num aliado; RF41) ----------
  pocaoDeVida: { nome: 'Poção de vida', tipo: 'consumivel', raridade: 'comum', peso: 1, preco: 25, cor: 0xff4d6d, efeito: { tipo: 'vida', fracao: 0.4 }, descricao: 'Um frasco vermelho, morno ao toque.' },
  pocaoGrandeDeVida: { nome: 'Poção grande de vida', tipo: 'consumivel', raridade: 'incomum', peso: 2, preco: 60, cor: 0xd61f45, efeito: { tipo: 'vida', fracao: 0.75 }, descricao: 'O dobro do frasco, para as regiões difíceis.' },
  pocaoDeMana: { nome: 'Poção de mana', tipo: 'consumivel', raridade: 'comum', peso: 1, preco: 30, cor: 0x4d8dff, efeito: { tipo: 'mana', fracao: 0.5 }, descricao: 'Um líquido azul que clareia a mente.' },
  tonicoLigeiro: { nome: 'Tônico ligeiro', tipo: 'consumivel', raridade: 'incomum', peso: 1, preco: 40, cor: 0x7ff2c8, efeito: { tipo: 'velocidade', multiplicador: 1.25, ms: 20000 }, descricao: 'Acelerador: as pernas ficam leves por um tempo.' },
  elixirDoFoco: { nome: 'Elixir do foco', tipo: 'consumivel', raridade: 'incomum', peso: 1, preco: 50, cor: 0xc58cff, efeito: { tipo: 'recarga', multiplicador: 0.7, ms: 20000 }, descricao: 'Acelerador: as habilidades voltam mais depressa.' },

  // ---------- Utilitários (usados no Reino) ----------
  pergaminhoDeRedefinicao: { nome: 'Pergaminho de redefinição', tipo: 'utilitario', raridade: 'raro', peso: 1, preco: 300, cor: 0xf5e6b8, efeito: { tipo: 'redefinirAtributos' }, descricao: 'Devolve os pontos de atributo de um personagem (RF25).' },

  // ---------- Armas (uma por classe; só a própria classe usa) ----------
  espadaCurta: { nome: 'Espada curta', tipo: 'equipamento', raridade: 'comum', peso: 3, preco: 120, espaco: 'arma', classes: ['guerreiro'], bonus: { forca: 3 }, cor: 0xc7ccd6, descricao: 'Lâmina simples e bem equilibrada.' },
  laminaDePresa: { nome: 'Lâmina de presa', tipo: 'equipamento', raridade: 'incomum', peso: 3, preco: 260, espaco: 'arma', classes: ['guerreiro'], bonus: { forca: 6, agilidade: 2 }, cor: 0xf0e6c8, descricao: 'Presas de javali presas a uma lâmina de ferro.' },
  arcoDeCaca: { nome: 'Arco de caça', tipo: 'equipamento', raridade: 'comum', peso: 2, preco: 120, espaco: 'arma', classes: ['arqueiro'], bonus: { agilidade: 3 }, cor: 0xa0703f, descricao: 'Arco leve de madeira da Floresta.' },
  arcoDeTeia: { nome: 'Arco de teia', tipo: 'equipamento', raridade: 'incomum', peso: 2, preco: 260, espaco: 'arma', classes: ['arqueiro'], bonus: { agilidade: 6, forca: 2 }, cor: 0xf2f2f2, descricao: 'A corda de teia de aranha nunca arrebenta.' },
  cajadoDeCarvalho: { nome: 'Cajado de carvalho', tipo: 'equipamento', raridade: 'comum', peso: 3, preco: 120, espaco: 'arma', classes: ['mago'], bonus: { inteligencia: 3 }, cor: 0x7a5230, descricao: 'Madeira antiga que guarda um pouco de magia.' },
  cajadoDeChifre: { nome: 'Cajado de chifre', tipo: 'equipamento', raridade: 'incomum', peso: 3, preco: 260, espaco: 'arma', classes: ['mago'], bonus: { inteligencia: 6, sabedoria: 2 }, cor: 0xc9a36b, descricao: 'O chifre do cervo concentra a magia na ponta.' },
  marteloDeGuerra: { nome: 'Martelo de guerra', tipo: 'equipamento', raridade: 'comum', peso: 5, preco: 120, espaco: 'arma', classes: ['tanque'], bonus: { forca: 2, vitalidade: 1 }, cor: 0x8a8f99, descricao: 'Pesado, mas o Tanque nem sente.' },
  cetroDaAurora: { nome: 'Cetro da aurora', tipo: 'equipamento', raridade: 'comum', peso: 2, preco: 120, espaco: 'arma', classes: ['sacerdote'], bonus: { sabedoria: 3 }, cor: 0xffe08a, descricao: 'Brilha de leve ao amanhecer.' },
  cetroDeErvas: { nome: 'Cetro de ervas', tipo: 'equipamento', raridade: 'incomum', peso: 2, preco: 260, espaco: 'arma', classes: ['sacerdote'], bonus: { sabedoria: 6, vitalidade: 2 }, cor: 0x8fe36b, descricao: 'Ervas trançadas que reforçam as curas.' },

  // ---------- Escudos (só o Tanque) ----------
  escudoDeMadeira: { nome: 'Escudo de madeira', tipo: 'equipamento', raridade: 'comum', peso: 4, preco: 100, espaco: 'escudo', classes: ['tanque'], bonus: { vitalidade: 2 }, defesa: 3, cor: 0xa0703f, descricao: 'Tábuas grossas presas com tiras de couro.' },
  escudoDeCasca: { nome: 'Escudo de casca antiga', tipo: 'equipamento', raridade: 'raro', peso: 5, preco: 420, espaco: 'escudo', classes: ['tanque'], bonus: { vitalidade: 5, forca: 2 }, defesa: 7, cor: 0x5d4a2e, descricao: 'Feito da casca do Guardião: quase nada atravessa.' },

  // ---------- Armadura de couro (comum; todas as classes) ----------
  capuzDeCouro: { nome: 'Capuz de couro', tipo: 'equipamento', raridade: 'comum', peso: 1, preco: 60, espaco: 'capacete', classes: 'todas', bonus: { agilidade: 1 }, defesa: 1, cor: 0x9a6b45, descricao: 'Protege a cabeça sem atrapalhar a visão.' },
  coleteDeCouro: { nome: 'Colete de couro', tipo: 'equipamento', raridade: 'comum', peso: 3, preco: 90, espaco: 'peitoral', classes: 'todas', bonus: { vitalidade: 2 }, defesa: 2, cor: 0x9a6b45, descricao: 'Couro curtido em várias camadas.' },
  calcasDeCouro: { nome: 'Calças de couro', tipo: 'equipamento', raridade: 'comum', peso: 2, preco: 70, espaco: 'calcas', classes: 'todas', bonus: { agilidade: 1 }, defesa: 1, cor: 0x9a6b45, descricao: 'Firmes e flexíveis.' },
  botasDeCouro: { nome: 'Botas de couro', tipo: 'equipamento', raridade: 'comum', peso: 1, preco: 60, espaco: 'botas', classes: 'todas', bonus: { agilidade: 1 }, cor: 0x9a6b45, descricao: 'Leves, para andar o dia inteiro.' },
  luvasDeCouro: { nome: 'Luvas de couro', tipo: 'equipamento', raridade: 'comum', peso: 1, preco: 60, espaco: 'manoplas', classes: 'todas', bonus: { forca: 1 }, cor: 0x9a6b45, descricao: 'Firmam a mão na arma.' },

  // ---------- Armadura de ferro (incomum; só pela Forja, com receita; todas as classes) ----------
  elmoDeFerro: { nome: 'Elmo de ferro', tipo: 'equipamento', raridade: 'incomum', peso: 3, preco: 180, espaco: 'capacete', classes: 'todas', bonus: { vitalidade: 2 }, defesa: 3, cor: 0x8a8f99, descricao: 'Pesado e seguro.' },
  peitoralDeFerro: { nome: 'Peitoral de ferro', tipo: 'equipamento', raridade: 'incomum', peso: 6, preco: 260, espaco: 'peitoral', classes: 'todas', bonus: { vitalidade: 4 }, defesa: 5, cor: 0x8a8f99, descricao: 'Placas de ferro sobre couro.' },
  grevasDeFerro: { nome: 'Grevas de ferro', tipo: 'equipamento', raridade: 'incomum', peso: 4, preco: 200, espaco: 'calcas', classes: 'todas', bonus: { vitalidade: 2, forca: 1 }, defesa: 3, cor: 0x8a8f99, descricao: 'Protegem as pernas na linha de frente.' },
  botasDeVento: { nome: 'Botas de vento', tipo: 'equipamento', raridade: 'incomum', peso: 1, preco: 220, espaco: 'botas', classes: 'todas', bonus: { agilidade: 3 }, reducaoDeRecarga: 0.05, cor: 0x7ff2c8, descricao: 'Costuradas com teia: tudo fica um pouco mais rápido.' },
  manoplasDeFerro: { nome: 'Manoplas de ferro', tipo: 'equipamento', raridade: 'incomum', peso: 3, preco: 180, espaco: 'manoplas', classes: 'todas', bonus: { forca: 3 }, defesa: 2, cor: 0x8a8f99, descricao: 'Cada golpe pesa mais.' },

  // ---------- Equipamento especial do Boss da Floresta (pequena chance, RF39) ----------
  coroaDeRaizes: { nome: 'Coroa de raízes', tipo: 'equipamento', raridade: 'especial', peso: 2, preco: 500, espaco: 'capacete', classes: 'todas', bonus: { vitalidade: 6, sabedoria: 4 }, defesa: 4, cor: 0xffd23f, descricao: 'Raízes vivas que o Guardião da Floresta usava como coroa.' },

  // ---------- Equipamento de teste (pedido do Pablo em 09/10): um de cada espaço, para testar a Forja ----------
  capaceteDeTeste: { nome: 'Capacete de teste', tipo: 'equipamento', raridade: 'teste', peso: 2, preco: 10, espaco: 'capacete', classes: 'todas', bonus: { vitalidade: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  peitoralDeTeste: { nome: 'Peitoral de teste', tipo: 'equipamento', raridade: 'teste', peso: 4, preco: 10, espaco: 'peitoral', classes: 'todas', bonus: { vitalidade: 2 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  calcasDeTeste: { nome: 'Calças de teste', tipo: 'equipamento', raridade: 'teste', peso: 3, preco: 10, espaco: 'calcas', classes: 'todas', bonus: { agilidade: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  botasDeTeste: { nome: 'Botas de teste', tipo: 'equipamento', raridade: 'teste', peso: 2, preco: 10, espaco: 'botas', classes: 'todas', bonus: { agilidade: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  manoplasDeTeste: { nome: 'Manoplas de teste', tipo: 'equipamento', raridade: 'teste', peso: 2, preco: 10, espaco: 'manoplas', classes: 'todas', bonus: { forca: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  espadaDeTeste: { nome: 'Espada de teste', tipo: 'equipamento', raridade: 'teste', peso: 3, preco: 10, espaco: 'arma', classes: ['guerreiro'], bonus: { forca: 2 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  escudoDeTeste: { nome: 'Escudo de teste', tipo: 'equipamento', raridade: 'teste', peso: 4, preco: 10, espaco: 'escudo', classes: ['tanque'], bonus: { vitalidade: 2 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
}

// O catálogo com o id dentro de cada item
export const itens = Object.fromEntries(Object.entries(dados).map(([id, item]) => [id, { id, ...item }]))

// Busca por id (TASK-070): um id que não existe (save antigo, item removido) devolve null, sem travar
export function itemDoCatalogo(id) {
  return typeof id === 'string' && Object.hasOwn(itens, id) ? itens[id] : null
}

export const nomesDasRaridades = { comum: 'Comum', incomum: 'Incomum', raro: 'Raro', especial: 'Especial', teste: 'Teste' }

const nomesDosAtributos = { vitalidade: 'Vitalidade', forca: 'Força', sabedoria: 'Sabedoria', inteligencia: 'Inteligência', agilidade: 'Agilidade' }
const nomesDosEspacos = { capacete: 'Capacete', peitoral: 'Peitoral', calcas: 'Calças', botas: 'Botas', manoplas: 'Manoplas', arma: 'Arma', escudo: 'Escudo' }
const nomesDasClasses = { guerreiro: 'Guerreiro', mago: 'Mago', tanque: 'Tanque', sacerdote: 'Sacerdote', arqueiro: 'Arqueiro' }
const porcento = (fracao) => `${Math.round(fracao * 100)}%`
const segundos = (ms) => `${Math.round(ms / 1000)} s`

// O que o item faz, numa linha, para a Mochila, o Mercado e a Forja (RF20). Sai dos campos do item.
export function funcaoDoItem(item) {
  if (!item) return ''
  if (item.tipo === 'recurso') return 'Recurso da Floresta: vende no Mercado e entra em receitas.'
  if (item.tipo === 'material') return 'Material: entra nas receitas da Forja e nas trocas do Mercado.'
  const efeito = item.efeito
  if (efeito?.tipo === 'vida') return `Recupera ${porcento(efeito.fracao)} da vida. Não levanta quem desmaiou. Na partida: Tab, depois E (Líder) ou R (aliado).`
  if (efeito?.tipo === 'mana') return `Recupera ${porcento(efeito.fracao)} da mana. Na partida: Tab, depois E (Líder) ou R (aliado).`
  if (efeito?.tipo === 'velocidade') return `Anda ${porcento(efeito.multiplicador - 1)} mais rápido por ${segundos(efeito.ms)}. Na partida: Tab, depois E ou R.`
  if (efeito?.tipo === 'recarga') return `Recargas ${porcento(1 - efeito.multiplicador)} mais rápidas por ${segundos(efeito.ms)}. Na partida: Tab, depois E ou R.`
  if (efeito?.tipo === 'redefinirAtributos') return 'Devolve os pontos de atributo de um personagem (nas Árvores). Habilidades não mudam.'
  if (item.tipo === 'equipamento') {
    const partes = [nomesDosEspacos[item.espaco] ?? item.espaco]
    for (const [atributo, valor] of Object.entries(item.bonus ?? {})) partes.push(`${nomesDosAtributos[atributo] ?? atributo} +${valor}`)
    if (item.defesa) partes.push(`Defesa ${item.defesa}`)
    if (item.reducaoDeRecarga) partes.push(`Recarga −${porcento(item.reducaoDeRecarga)}`)
    partes.push(item.classes === 'todas' ? 'todas as classes' : `só ${item.classes.map((classe) => nomesDasClasses[classe] ?? classe).join(', ')}`)
    return partes.join(' · ')
  }
  return ''
}

// Itens que dá para usar na partida (Tab, depois E ou R): os consumíveis
export function usavelNaPartida(item) {
  return item?.tipo === 'consumivel' && Boolean(item.efeito)
}
