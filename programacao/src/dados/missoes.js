import { itemDoCatalogo } from './itens.js'
import { floresta } from './mundo/floresta.js'

// Tipos de missão da Guilda (RF26).
// - matar: derrotar "quantidade" monstros do tipo "alvo"
// - coletar: pegar "quantidade" itens "alvo" (conta ao pegar, mesmo que depois venda)
// - entregar: ter "quantidade" itens "alvo" na hora de entregar; eles são consumidos
// - explorar: visitar o local "alvo" depois de aceitar
export const tiposDeMissao = ['matar', 'coletar', 'entregar', 'explorar']

// QUADRO DE MISSÕES DA GUILDA (Fase 4, TASK-078). PROVISÓRIO – substituir pelo do grupo (missões do beta: TASK-015).
// Só com o que existe no beta: os mobs, os itens e as áreas da Floresta. Para trocar, mude só esta lista.
// alvo: o tipo do mob (matar: lobo, aranha, javali, cervo, guardiao), o id do item (coletar, entregar) ou o id da
// área (explorar, dados/mundo/floresta.js).
export const quadroDeMissoes = [
  { id: 'cacarLobos', titulo: 'Caçar lobos', descricao: 'Os lobos da Fácil estão atacando quem passa pela trilha.', tipo: 'matar', alvo: 'lobo', quantidade: 8, recompensa: { ouro: 80, xp: 120 } },
  { id: 'aranhasNoCaminho', titulo: 'Aranhas no caminho', descricao: 'As aranhas da Média cobriram a trilha de teias.', tipo: 'matar', alvo: 'aranha', quantidade: 6, recompensa: { ouro: 110, xp: 180 } },
  { id: 'javalisBravos', titulo: 'Javalis bravos', descricao: 'Os javalis da Difícil derrubaram a cerca da fazenda.', tipo: 'matar', alvo: 'javali', quantidade: 4, recompensa: { ouro: 150, xp: 240 } },
  { id: 'oGuardiao', titulo: 'O Guardião da Floresta', descricao: 'Derrote o Guardião, no fundo da Floresta.', tipo: 'matar', alvo: 'guardiao', quantidade: 1, recompensa: { ouro: 400, xp: 600 } },
  { id: 'cogumelosParaPocoes', titulo: 'Cogumelos para poções', descricao: 'A curandeira precisa de cogumelos frescos.', tipo: 'coletar', alvo: 'cogumelo', quantidade: 6, recompensa: { ouro: 60, xp: 80 } },
  { id: 'lenhaParaOInverno', titulo: 'Lenha para o inverno', descricao: 'Junte madeira na Floresta.', tipo: 'coletar', alvo: 'madeira', quantidade: 8, recompensa: { ouro: 70, xp: 90 } },
  { id: 'pelesParaOCurtidor', titulo: 'Peles para o curtidor', descricao: 'Traga peles de lobo para a Guilda.', tipo: 'entregar', alvo: 'peleDeLobo', quantidade: 4, recompensa: { ouro: 90, xp: 100 } },
  { id: 'fiosParaATecela', titulo: 'Fios para a tecelã', descricao: 'Traga teias de aranha para a Guilda.', tipo: 'entregar', alvo: 'teiaDeAranha', quantidade: 5, recompensa: { ouro: 80, xp: 100 } },
  { id: 'coracaoDaMata', titulo: 'O coração da mata', descricao: 'Chegue ao Coração da Mata, na Difícil.', tipo: 'explorar', alvo: 'coracaoDaMata', quantidade: 1, recompensa: { ouro: 120, xp: 200 } },
  { id: 'clareiraDoGuardiao', titulo: 'A clareira do Guardião', descricao: 'Chegue à clareira onde o Guardião vive.', tipo: 'explorar', alvo: 'clareiraDoGuardiao', quantidade: 1, recompensa: { ouro: 150, xp: 250 } },
]

export function missaoDoQuadro(id) {
  return quadroDeMissoes.find((missao) => missao.id === id) ?? null
}

const nomesDosMobs = { lobo: 'lobo', aranha: 'aranha', javali: 'javali', cervo: 'cervo', guardiao: 'Guardião da Floresta' }

// O nome do alvo de uma missão: o mob, o item ou a área (um alvo desconhecido aparece como ele mesmo)
export function nomeDoAlvo(missao) {
  if (missao.tipo === 'matar') return nomesDosMobs[missao.alvo] ?? missao.alvo
  if (missao.tipo === 'explorar') return floresta.areas.find((area) => area.id === missao.alvo)?.nome ?? missao.alvo
  return itemDoCatalogo(missao.alvo)?.nome ?? missao.alvo
}

const verbos = { matar: 'Derrotar', coletar: 'Coletar', entregar: 'Entregar', explorar: 'Explorar' }

// Missão ativa em uma linha, para o HUD do Reino: "Derrotar 10 lobo (4/10)". null = nenhuma.
// Na de entrega, "progresso" é quanto há na Mochila agora (quem chama passa; sem ele, não mostra a conta).
export function descreverMissao(missao, progresso = missao?.progresso) {
  if (!missao) return null
  if (missao.tipo === 'explorar') return `Explorar ${nomeDoAlvo(missao)} (${progresso >= missao.quantidade ? 'feito' : 'a fazer'})`
  return `${verbos[missao.tipo]} ${missao.quantidade} ${nomeDoAlvo(missao)} (${Math.min(progresso ?? 0, missao.quantidade)}/${missao.quantidade})`
}
