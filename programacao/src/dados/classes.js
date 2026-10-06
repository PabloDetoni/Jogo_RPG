// Os 5 atributos (Conceito §6). Aparecem no pentágono, nesta ordem.
export const atributos = [
  { id: 'vitalidade', nome: 'Vitalidade', sigla: 'Vit' }, // vida
  { id: 'forca', nome: 'Força', sigla: 'For' }, // dano e defesa físicos, carga da mochila
  { id: 'sabedoria', nome: 'Sabedoria', sigla: 'Sab' }, // resistência mágica, mana que volta, curas e buffs
  { id: 'inteligencia', nome: 'Inteligência', sigla: 'Int' }, // mana máxima e dano mágico
  { id: 'agilidade', nome: 'Agilidade', sigla: 'Agi' }, // velocidade, intervalo entre ataques, crítico
]

// As 5 classes. Atributos iniciais PROVISÓRIOS (Conceito §19), todos somando 50:
// o Tanque vem do protótipo 03; os outros seguem a descrição de cada classe no Conceito §5.
export const classes = [
  {
    id: 'guerreiro',
    nome: 'Guerreiro',
    atributosIniciais: { vitalidade: 12, forca: 14, sabedoria: 6, inteligencia: 5, agilidade: 13 },
  },
  {
    id: 'mago',
    nome: 'Mago',
    atributosIniciais: { vitalidade: 8, forca: 4, sabedoria: 12, inteligencia: 18, agilidade: 8 },
  },
  {
    id: 'tanque',
    nome: 'Tanque',
    atributosIniciais: { vitalidade: 18, forca: 15, sabedoria: 6, inteligencia: 4, agilidade: 7 },
  },
  {
    id: 'sacerdote',
    nome: 'Sacerdote',
    atributosIniciais: { vitalidade: 8, forca: 5, sabedoria: 18, inteligencia: 12, agilidade: 7 },
  },
  {
    id: 'arqueiro',
    nome: 'Arqueiro',
    atributosIniciais: { vitalidade: 6, forca: 10, sabedoria: 6, inteligencia: 6, agilidade: 22 },
  },
]

export function nomeDaClasse(id) {
  return classes.find((classe) => classe.id === id)?.nome ?? id
}

export function atributosIniciaisDaClasse(id) {
  return { ...classes.find((classe) => classe.id === id).atributosIniciais }
}
