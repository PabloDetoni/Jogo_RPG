// Os NPCs do Reino (RF57, Parte 9 de 11/2026): quem atende no Mercado, na Forja e na Guilda.
// PROVISÓRIO – substituir pelo do grupo: os nomes, as apresentações e as falas são um rascunho (o Uener revisa). O
// texto fica todo aqui, para o grupo reescrever sem mexer em código.
// - apresentacao: as partes do balão na primeira visita (o tutorial do lugar); depois, uma fala sorteada de "falas";
// - menu: cada opção abre uma aba da tela ("aba") com a cor e o símbolo de uma ação (dados/interface.js); "Ir embora"
//   volta ao Reino;
// - aparencia: o boneco em blocos do NPC (o mesmo dos personagens, regras/bonecos.js), com o detalhe do ofício.
export const npcs = {
  comerciante: {
    nome: 'Bartolomeu',
    oficio: 'comerciante',
    lugar: 'mercado',
    apresentacao: [
      'Ora, ora! Um cliente novo! Bartolomeu, a seu dispor: o melhor comerciante deste lado das muralhas.',
      'Aqui você compra poções e aceleradores, vende o que trouxer da Floresta e troca uma coisa por outra.',
      'As ofertas com estrela mudam depois de algumas partidas. Volte sempre, e traga ouro!',
    ],
    falas: [
      'Poções fresquinhas! Quase não explodem!',
      'Pele de lobo? Eu compro. Lobo inteiro, não.',
      'Se o preço parece alto, é porque a qualidade é alta. Quase sempre.',
      'Dizem que tem goblin na Média. Ótimo para o comércio de orelhas.',
      'Um aventureiro sem poção é um aventureiro com pressa de voltar.',
    ],
    menu: [
      { id: 'comprar', rotulo: 'Comprar', aba: 'comprar', acao: 'comprar' },
      { id: 'vender', rotulo: 'Vender', aba: 'vender', acao: 'vender' },
      { id: 'trocar', rotulo: 'Trocar', aba: 'trocar', acao: 'trocar' },
    ],
    aparencia: { cor: 0xc9822e, chapeu: 'chapeuDeAba', detalhe: 'bigode' },
  },
  ferreiro: {
    nome: 'Gunnar',
    oficio: 'ferreiro',
    lugar: 'forja',
    apresentacao: [
      'Hmpf. Mais um que quer brincar de herói. Gunnar. Ferreiro. Quarenta anos batendo ferro.',
      'Aqui você equipa o seu grupo, compra e vende equipamento e fabrica peças com o que arrancar dos monstros.',
      'E não me traga equipamento sujo de gosma de aranha. Odeio aranha. Odeio todos eles.',
    ],
    falas: [
      'Monstro bom é monstro virado em couro.',
      'Essa espada aí já viu dias melhores. Você também.',
      'Na minha época, goblin tinha medo de gente.',
      'Fabricar? Traga o material e não me apresse.',
      'Se quebrar, a culpa é sua. Se não quebrar, o mérito é meu.',
    ],
    menu: [
      { id: 'equipar', rotulo: 'Equipar', aba: 'equipar', acao: 'equipar' },
      { id: 'comprar', rotulo: 'Comprar', aba: 'comprar', acao: 'comprar' },
      { id: 'vender', rotulo: 'Vender', aba: 'vender', acao: 'vender' },
      { id: 'fabricar', rotulo: 'Fabricar', aba: 'fabricar', acao: 'fabricar' },
    ],
    aparencia: { cor: 0x8a6a52, chapeu: null, detalhe: 'avental', barba: 0xd9d4cc },
  },
  mestre: {
    nome: 'Mestra Isolda',
    oficio: 'mestre da Guilda',
    lugar: 'guilda',
    apresentacao: [
      'Bem-vindo à Guilda dos Aventureiros. Sou Isolda, a mestra daqui.',
      'No quadro de missões você aceita um trabalho por vez; o progresso conta entre as partidas.',
      'E, quando quiser companhia na Floresta, contrate um aventureiro: por algumas partidas ou para sempre.',
    ],
    falas: [
      'O quadro está cheio hoje. A Floresta anda agitada.',
      'Um grupo bem montado vale mais que uma espada cara.',
      'Missão abandonada tem multa. Escolha com calma.',
      'Ouvi falar de um Ogro no fim da Floresta. Que tal?',
      'Contratei um Tanque ontem. Ele ainda está segurando a porta.',
    ],
    menu: [
      { id: 'missoes', rotulo: 'Missões', aba: 'missoes', acao: 'aceitar' },
      { id: 'contratos', rotulo: 'Contratos', aba: 'contratoTemporario', acao: 'contratar' },
    ],
    aparencia: { cor: 0x3f5aa8, chapeu: 'chapeuComPena', detalhe: null },
  },
}

// O NPC de cada lugar
export const npcDoLugar = (lugar) => Object.entries(npcs).find(([, npc]) => npc.lugar === lugar)?.[0] ?? null
