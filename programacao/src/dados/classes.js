// As 5 classes do jogo. Atributos e habilidades entram na etapa 4.
export const classes = [
  { id: 'guerreiro', nome: 'Guerreiro' },
  { id: 'mago', nome: 'Mago' },
  { id: 'tanque', nome: 'Tanque' },
  { id: 'sacerdote', nome: 'Sacerdote' },
  { id: 'arqueiro', nome: 'Arqueiro' },
]

export function nomeDaClasse(id) {
  return classes.find((classe) => classe.id === id)?.nome ?? id
}
