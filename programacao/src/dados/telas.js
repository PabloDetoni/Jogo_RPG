// Lista de todas as telas do jogo.
// nome: aparece como título da tela e no painel de desenvolvimento.
// grupo: só organiza a lista do painel de desenvolvimento.
// raiz: ao entrar nesta tela, o jogo esquece o caminho feito até ali (o Voltar não passa dela).
// soConfiguracoes: no canto aparece só o botão de Configurações (sem o Salão da Glória).
// naPartida: dentro da partida; as opções de conta somem das Configurações.

export const telas = {
  telaInicial: { nome: 'Tela inicial', grupo: 'Acesso', raiz: true },
  login: { nome: 'Login', grupo: 'Acesso' },
  criarConta: { nome: 'Criar conta', grupo: 'Acesso' },
  confirmeEmail: { nome: 'Confirme seu e-mail', grupo: 'Acesso' },
  esqueciSenha: { nome: 'Esqueci minha senha', grupo: 'Acesso' },
  narrativaInicial: { nome: 'Narrativa inicial', grupo: 'Acesso' },
  selecaoClasse: { nome: 'Seleção de classe', grupo: 'Acesso' },

  reino: { nome: 'Reino', grupo: 'Reino', raiz: true },
  guilda: { nome: 'Guilda', grupo: 'Reino' },
  mercado: { nome: 'Mercado', grupo: 'Reino' },
  forja: { nome: 'Forja', grupo: 'Reino' },
  mochila: { nome: 'Mochila', grupo: 'Reino' },
  arvores: { nome: 'Árvores de Habilidades', grupo: 'Reino' },
  salaoGloria: { nome: 'Salão da Glória', grupo: 'Reino', soConfiguracoes: true },

  mapa: { nome: 'Mapa', grupo: 'Mapa e partida' },
  fazenda: { nome: 'Minijogo da Fazenda', grupo: 'Mapa e partida' },
  mina: { nome: 'Minijogo da Mina', grupo: 'Mapa e partida' },
  lago: { nome: 'Minijogo do Lago', grupo: 'Mapa e partida' },
  pontoPartida: { nome: 'Ponto de partida', grupo: 'Mapa e partida' },
  preparacao: { nome: 'Preparação', grupo: 'Mapa e partida' },
  partida: { nome: 'Partida', grupo: 'Mapa e partida', raiz: true, soConfiguracoes: true, naPartida: true },
  cutsceneDerrota: { nome: 'Cutscene de derrota', grupo: 'Mapa e partida', raiz: true, soConfiguracoes: true, naPartida: true },
  resumo: { nome: 'Resumo', grupo: 'Mapa e partida', raiz: true },
}
