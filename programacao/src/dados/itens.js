// CATÁLOGO DE ITENS (Fase 3, parte provisória da TASK-070).
// PROVISÓRIO – substituir pelo do grupo (catálogo e Mercado: TASK-014). Na Fase 4 este catálogo ganha o Mercado,
// a Forja e a Mochila do Reino; o save guarda só o id e a quantidade de cada item.
//
// Campos: nome, tipo ('recurso' | 'material' | 'consumivel' | 'equipamento'), raridade ('comum' | 'incomum' | 'raro' |
// 'especial' | 'teste'), peso (inteiro, por unidade, RF33), preco (ouro, para o Mercado) e descricao.
// Equipamento tem também: espaco (dados/equipamento.js), classes ('todas' para armadura, ou a lista das classes que
// podem usar: arma e escudo são da própria classe, RF22) e bonus (pontos somados aos atributos).
// "cor" é só o quadradinho que aparece no chão até a arte chegar.

const dados = {
  // Recursos do chão da Floresta (coletados com E)
  cogumelo: { nome: 'Cogumelo', tipo: 'recurso', raridade: 'comum', peso: 1, preco: 3, cor: 0xd9604c, descricao: 'Cresce na sombra das árvores. Usado em poções.' },
  ervaMedicinal: { nome: 'Erva medicinal', tipo: 'recurso', raridade: 'comum', peso: 1, preco: 4, cor: 0x8fe36b, descricao: 'Folhas que ajudam a curar ferimentos.' },
  madeira: { nome: 'Madeira', tipo: 'recurso', raridade: 'comum', peso: 3, preco: 2, cor: 0xa0703f, descricao: 'Galhos firmes, bons para a Forja.' },
  // Partes de monstros (drops)
  peleDeLobo: { nome: 'Pele de lobo', tipo: 'material', raridade: 'comum', peso: 2, preco: 8, cor: 0x9a8f86, descricao: 'Pele grossa de lobo da Floresta.' },
  teiaDeAranha: { nome: 'Teia de aranha', tipo: 'material', raridade: 'comum', peso: 1, preco: 6, cor: 0xf2f2f2, descricao: 'Fios resistentes e grudentos.' },
  presaDeJavali: { nome: 'Presa de javali', tipo: 'material', raridade: 'incomum', peso: 2, preco: 15, cor: 0xf0e6c8, descricao: 'Presa curva e afiada.' },
  chifreDeCervo: { nome: 'Chifre de cervo', tipo: 'material', raridade: 'incomum', peso: 3, preco: 18, cor: 0xc9a36b, descricao: 'Chifre que o cervo deixa ao fugir.' },
  cascaAntiga: { nome: 'Casca antiga', tipo: 'material', raridade: 'raro', peso: 4, preco: 60, cor: 0x5d4a2e, descricao: 'Pedaço da casca do Guardião da Floresta.' },
  // Consumíveis
  pocaoDeVida: { nome: 'Poção de vida', tipo: 'consumivel', raridade: 'comum', peso: 1, preco: 25, cor: 0xff4d6d, descricao: 'Recupera parte da vida. Não levanta quem desmaiou.' },
  // Equipamento de teste (pedido do Pablo em 09/10): um de cada espaço, para testar a Forja e o Painel do Mestre
  capaceteDeTeste: { nome: 'Capacete de teste', tipo: 'equipamento', raridade: 'teste', peso: 2, preco: 10, espaco: 'capacete', classes: 'todas', bonus: { vitalidade: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  peitoralDeTeste: { nome: 'Peitoral de teste', tipo: 'equipamento', raridade: 'teste', peso: 4, preco: 10, espaco: 'peitoral', classes: 'todas', bonus: { vitalidade: 2 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  calcasDeTeste: { nome: 'Calças de teste', tipo: 'equipamento', raridade: 'teste', peso: 3, preco: 10, espaco: 'calcas', classes: 'todas', bonus: { agilidade: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  botasDeTeste: { nome: 'Botas de teste', tipo: 'equipamento', raridade: 'teste', peso: 2, preco: 10, espaco: 'botas', classes: 'todas', bonus: { agilidade: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  manoplasDeTeste: { nome: 'Manoplas de teste', tipo: 'equipamento', raridade: 'teste', peso: 2, preco: 10, espaco: 'manoplas', classes: 'todas', bonus: { forca: 1 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  espadaDeTeste: { nome: 'Espada de teste', tipo: 'equipamento', raridade: 'teste', peso: 3, preco: 10, espaco: 'arma', classes: ['guerreiro'], bonus: { forca: 2 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  escudoDeTeste: { nome: 'Escudo de teste', tipo: 'equipamento', raridade: 'teste', peso: 4, preco: 10, espaco: 'escudo', classes: ['tanque'], bonus: { vitalidade: 2 }, cor: 0xb0b8c4, descricao: 'Equipamento de teste.' },
  // Equipamento especial do Boss da Floresta (pequena chance, RF39)
  coroaDeRaizes: { nome: 'Coroa de raízes', tipo: 'equipamento', raridade: 'especial', peso: 2, preco: 500, espaco: 'capacete', classes: 'todas', bonus: { vitalidade: 6, sabedoria: 4 }, cor: 0xffd23f, descricao: 'Raízes vivas que o Guardião da Floresta usava como coroa.' },
}

// O catálogo com o id dentro de cada item
export const itens = Object.fromEntries(Object.entries(dados).map(([id, item]) => [id, { id, ...item }]))

// Busca por id (TASK-070): um id que não existe (save antigo, item removido) devolve null, sem travar
export function itemDoCatalogo(id) {
  return Object.hasOwn(itens, id) ? itens[id] : null
}
