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
// Cor: o quadrado da classe na partida. Nenhuma é verde (o chão) nem vermelha (os inimigos).
// A cor do Guerreiro é provisória: o protótipo 06 usa vermelho, e a decisão é do grupo.
// papel e descricao: da tabela de classes do Conceito §5 (aparecem na Seleção de classe).
export const classes = [
  {
    id: 'guerreiro',
    nome: 'Guerreiro',
    papel: 'DPS principal',
    descricao: 'Equilibrado, rápido e constante na linha de frente. Dano físico pela Força; pode investir em Agilidade e passar o crítico do Arqueiro.',
    cor: 0x3d7bff, // azul (provisório)
    atributosIniciais: { vitalidade: 12, forca: 14, sabedoria: 6, inteligencia: 5, agilidade: 13 },
  },
  {
    id: 'mago',
    nome: 'Mago',
    papel: 'Dano em massa',
    descricao: 'Dano mágico muito alto: a Inteligência aumenta o dano mágico. Pouca força física.',
    cor: 0xa54bff, // roxo
    atributosIniciais: { vitalidade: 8, forca: 4, sabedoria: 12, inteligencia: 18, agilidade: 8 },
  },
  {
    id: 'tanque',
    nome: 'Tanque',
    papel: 'Absorver dano',
    descricao: 'Muita vitalidade, força alta, grande resistência e pouca mana. Atrai os inimigos.',
    cor: 0xff8a1f, // laranja
    atributosIniciais: { vitalidade: 18, forca: 15, sabedoria: 6, inteligencia: 4, agilidade: 7 },
  },
  {
    id: 'sacerdote',
    nome: 'Sacerdote',
    papel: 'Suporte',
    descricao: 'Cura, buffs e Ressurreição; alta resistência mágica. Pouca força e vitalidade. É o único que cura ativamente.',
    cor: 0xffd23f, // amarelo
    atributosIniciais: { vitalidade: 8, forca: 5, sabedoria: 18, inteligencia: 12, agilidade: 7 },
  },
  {
    id: 'arqueiro',
    nome: 'Arqueiro',
    papel: 'Dano em alvo único',
    descricao: 'Dano e crítico altos, vida muito baixa. Começa com mais Agilidade que o Guerreiro.',
    cor: 0x2fe0e0, // ciano
    atributosIniciais: { vitalidade: 6, forca: 10, sabedoria: 6, inteligencia: 6, agilidade: 22 },
  },
]

export function nomeDaClasse(id) {
  return classes.find((classe) => classe.id === id)?.nome ?? id
}

export function atributosIniciaisDaClasse(id) {
  return { ...classes.find((classe) => classe.id === id).atributosIniciais }
}

export function corDaClasse(id) {
  return classes.find((classe) => classe.id === id)?.cor ?? 0xffffff
}

// A mesma cor em texto CSS, para o HUD em React
export function corDaClasseCss(id) {
  return `#${corDaClasse(id).toString(16).padStart(6, '0')}`
}
