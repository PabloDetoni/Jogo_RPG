import { combateDeTeste } from './balanceamento.js'
import { habilidadesAtivasNoMaximo } from './regras.js'

// Habilidades ativas na partida (TASK-046): teclas 1, 2 e 3, com custo de mana e recarga (RF38).
// PROVISÓRIO: uma habilidade de TESTE por classe, na tecla 1, até o grupo definir as habilidades do beta
// (TASK-010, até 19/10). Para trocar, mude esta lista; os números ficam em balanceamento.js
// (combateDeTeste.habilidades). A Ressurreição do Sacerdote vem da documentação (Conceito §7),
// mas os números dela também são provisórios.
export const habilidadesDeTeste = {
  guerreiro: { id: 'giro', nome: 'Giro', descricao: 'Golpe em volta de si', provisoria: true },
  arqueiro: { id: 'tiroPerfurante', nome: 'Tiro perfurante', descricao: 'Atravessa os inimigos e cruza o mapa', provisoria: true },
  mago: { id: 'meteoro', nome: 'Meteoro', descricao: 'Explosão grande onde o mouse aponta', provisoria: true },
  tanque: { id: 'provocacao', nome: 'Provocação', descricao: 'Os mobs perto vão no Tanque, que leva metade do dano', provisoria: true },
  sacerdote: { id: 'ressurreicao', nome: 'Ressurreição', descricao: 'Levanta os caídos perto, com vida cheia', provisoria: false },
}

// As 3 teclas do personagem, na ordem 1, 2, 3 (null = vazia). Por enquanto: a habilidade de teste na 1.
export function habilidadesNasTeclas(classe) {
  const habilidade = habilidadesDeTeste[classe]
  const teclas = Array.from({ length: habilidadesAtivasNoMaximo }, () => null)
  if (habilidade) teclas[0] = { ...habilidade, ...combateDeTeste.habilidades[classe] }
  return teclas
}
