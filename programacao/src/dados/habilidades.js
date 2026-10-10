import { raizDaClasse } from './arvores.js'
import { classes } from './classes.js'

// Habilidades (TASK-046 e TASK-077). Desde a Fase 4, cada classe tem a sua árvore em dados/arvores.js (PROVISÓRIO até a
// TASK-010); as teclas 1, 2 e 3 de cada personagem e os números de cada nível saem de regras/habilidadesDaArvore.js.
// Aqui ficou só a raiz de cada classe: a primeira habilidade, gratuita, que era a habilidade de teste da Fase 1.
// A Ressurreição do Sacerdote vem da documentação (Conceito §7); as outras raízes são provisórias.
export const habilidadesDeTeste = Object.fromEntries(
  classes.map((classe) => {
    const raiz = raizDaClasse(classe.id)
    return [classe.id, { id: raiz.id, nome: raiz.nome, descricao: raiz.descricao, provisoria: raiz.id !== 'ressurreicao' }]
  }),
)
