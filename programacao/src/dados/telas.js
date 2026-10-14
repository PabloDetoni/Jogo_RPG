// Lista de todas as telas do jogo.
// nome: aparece como título da tela e no painel de desenvolvimento.
// grupo: só organiza a lista do painel de desenvolvimento.
// raiz: ao entrar nesta tela, o jogo esquece o caminho feito até ali (o Voltar não passa dela).
// soConfiguracoes: no canto aparece só o botão de Configurações (sem o Salão da Glória).
// naPartida: dentro da partida; as opções de conta somem das Configurações.
// pai (ajustes de 14/10): a tela de cima na trilha ("Reino › Forja") e para onde o Voltar e o Esc levam. '*' = a tela de
// onde se veio (o Salão da Glória abre de quase todo lugar). Sem pai, o Esc não sai da tela.

export const telas = {
  telaInicial: { nome: 'Tela inicial', grupo: 'Acesso', raiz: true },
  login: { nome: 'Login', grupo: 'Acesso', pai: 'telaInicial' },
  criarConta: { nome: 'Criar conta', grupo: 'Acesso', pai: 'login' },
  confirmeEmail: { nome: 'Confirme seu e-mail', grupo: 'Acesso', pai: 'login' },
  esqueciSenha: { nome: 'Esqueci minha senha', grupo: 'Acesso', pai: 'login' },
  novaSenha: { nome: 'Senha nova', grupo: 'Acesso', pai: 'login' },
  escolherApelido: { nome: 'Escolha seu apelido', grupo: 'Acesso', pai: 'login' },
  narrativaInicial: { nome: 'Narrativa inicial', grupo: 'Acesso' },
  selecaoClasse: { nome: 'Seleção de classe', grupo: 'Acesso' },

  reino: { nome: 'Reino', grupo: 'Reino', raiz: true },
  guilda: { nome: 'Guilda', grupo: 'Reino', pai: 'reino' },
  mercado: { nome: 'Mercado', grupo: 'Reino', pai: 'reino' },
  forja: { nome: 'Forja', grupo: 'Reino', pai: 'reino' },
  mochila: { nome: 'Mochila', grupo: 'Reino', pai: 'reino' },
  arvores: { nome: 'Árvores de Habilidades', grupo: 'Reino', pai: 'reino' },
  salaoGloria: { nome: 'Salão da Glória', grupo: 'Reino', soConfiguracoes: true, pai: '*' },

  mapa: { nome: 'Mapa', grupo: 'Mapa e partida', pai: 'reino' },
  fazenda: { nome: 'Minijogo da Fazenda', grupo: 'Mapa e partida', pai: 'mapa' },
  mina: { nome: 'Minijogo da Mina', grupo: 'Mapa e partida', pai: 'mapa' },
  lago: { nome: 'Minijogo do Lago', grupo: 'Mapa e partida', pai: 'mapa' },
  pontoPartida: { nome: 'Ponto de partida', grupo: 'Mapa e partida', pai: 'mapa' },
  preparacao: { nome: 'Preparação', grupo: 'Mapa e partida', pai: 'mapa' },
  partida: { nome: 'Partida', grupo: 'Mapa e partida', raiz: true, soConfiguracoes: true, naPartida: true },
  cutsceneDerrota: { nome: 'Cutscene de derrota', grupo: 'Mapa e partida', raiz: true, soConfiguracoes: true, naPartida: true },
  resumo: { nome: 'Resumo', grupo: 'Mapa e partida', raiz: true, pai: 'reino' },
}
