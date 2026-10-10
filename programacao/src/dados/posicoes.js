// Posições de tudo o que aparece nas telas, em porcentagem da caixa 16:9.
// x vai de 0 (esquerda) a 100 (direita); y vai de 0 (topo) a 100 (base).
// O número é o CENTRO do elemento. "grande: true" deixa o botão maior.
// Quando a arte entrar, ajuste só os números daqui.
// Dentro das janelas (Configurações, Pausa, Como jogar) os botões ficam em coluna, sem posição.

export const posicoes = {
  // Valem para todas as telas
  titulo: { x: 50, y: 11 },
  cantos: {
    salaoGloria: { x: 9, y: 11 },
    configuracoes: { x: 93, y: 11 },
  },
  avisos: { x: 50, y: 30 }, // mensagens por cima da tela (partida descartada, aba ocupada...)

  // ---------- Acesso ----------
  telaInicial: {
    iniciarJogo: { x: 50, y: 55 },
    comoJogar: { x: 50, y: 67 },
  },
  // Fase 2: as mensagens (e-mail confirmado, senha errada, conta em uso...) ficam logo abaixo do título
  login: {
    mensagem: { x: 50, y: 19 },
    continuar: { x: 50, y: 27 }, // "Continuar como ...": a conta que o Supabase lembra neste navegador
    email: { x: 50, y: 36 },
    senha: { x: 50, y: 47 },
    entrar: { x: 50, y: 57 },
    reenviar: { x: 72, y: 57 }, // só com o e-mail ainda não confirmado (RF04)
    criarConta: { x: 38, y: 67 },
    esqueciSenha: { x: 62, y: 67 },
    jogarComoConvidado: { x: 50, y: 78 },
    avisoConvidado: { x: 50, y: 86 },
    voltar: { x: 10, y: 90 },
  },
  criarConta: {
    mensagem: { x: 50, y: 19 },
    email: { x: 50, y: 29 },
    senha: { x: 50, y: 41 },
    apelido: { x: 50, y: 53 },
    regras: { x: 50, y: 63 },
    criarConta: { x: 50, y: 73 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  confirmeEmail: {
    mensagem: { x: 50, y: 38 },
    resposta: { x: 50, y: 52 },
    reenviar: { x: 50, y: 62 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  esqueciSenha: {
    email: { x: 50, y: 36 },
    enviar: { x: 50, y: 50 },
    mensagem: { x: 50, y: 62 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  // Aberta pelo link de senha nova do e-mail (RF06)
  novaSenha: {
    explicacao: { x: 50, y: 22 },
    senha: { x: 50, y: 34 },
    repetir: { x: 50, y: 46 },
    salvar: { x: 50, y: 58 },
    mensagem: { x: 50, y: 69 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  // Conta sem apelido (criada fora do jogo, ou o apelido foi tomado entre o cadastro e a confirmação)
  escolherApelido: {
    explicacao: { x: 50, y: 24 },
    apelido: { x: 50, y: 38 },
    confirmar: { x: 50, y: 50 },
    mensagem: { x: 50, y: 61 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  narrativaInicial: {
    texto: { x: 50, y: 45 },
    continuar: { x: 50, y: 75 },
  },
  // Clicar numa classe mostra a descrição e o pentágono dela; "Escolher" confirma (TASK-071)
  selecaoClasse: {
    instrucao: { x: 50, y: 21 },
    guerreiro: { x: 18, y: 31 },
    mago: { x: 34, y: 31 },
    tanque: { x: 50, y: 31 },
    sacerdote: { x: 66, y: 31 },
    arqueiro: { x: 82, y: 31 },
    detalhe: { x: 50, y: 61 },
    escolher: { x: 50, y: 89, grande: true },
  },

  // ---------- Reino ----------
  reino: {
    hud: { x: 50, y: 21 },
    guilda: { x: 50, y: 41 },
    mercado: { x: 29, y: 61 },
    forja: { x: 74, y: 63 },
    mochila: { x: 9, y: 83 },
    jogar: { x: 50, y: 88, grande: true },
    arvores: { x: 92, y: 86 },
  },
  guilda: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 52 },
    voltarAoReino: { x: 10, y: 90 },
  },
  mercado: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 52 },
    voltarAoReino: { x: 10, y: 90 },
  },
  forja: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 52 },
    voltarAoReino: { x: 10, y: 90 },
  },
  mochila: {
    conteudo: { x: 50, y: 53 },
    voltarAoReino: { x: 10, y: 90 },
  },
  arvores: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 52 },
    voltarAoReino: { x: 10, y: 90 },
  },
  salaoGloria: {
    abas: { x: 50, y: 25 },
    conteudo: { x: 50, y: 52 },
    voltar: { x: 10, y: 90 },
  },

  // ---------- Mapa e partida ----------
  mapa: {
    voltarAoReino: { x: 50, y: 45 },
    planalto: { x: 50, y: 53 },
    fazenda: { x: 38, y: 45 },
    lago: { x: 50, y: 37 },
    mina: { x: 62, y: 45 },
    tundra: { x: 20, y: 27 },
    vulcanico: { x: 75, y: 27 },
    floresta: { x: 26, y: 70 },
    deserto: { x: 74, y: 73 },
    arenaDeTeste: { x: 50, y: 86 }, // só no npm run dev
  },
  // Usada pelas telas de Fazenda, Mina e Lago
  minijogo: {
    mensagem: { x: 50, y: 45 },
    voltarAoMapa: { x: 10, y: 90 },
  },
  pontoPartida: {
    bioma: { x: 50, y: 21 },
    inicio: { x: 50, y: 32 },
    facil: { x: 50, y: 43 },
    media: { x: 50, y: 53 },
    dificil: { x: 50, y: 63 },
    muitoDificil: { x: 50, y: 73 },
    voltarAoMapa: { x: 10, y: 90 },
  },
  preparacao: {
    tituloLider: { x: 25, y: 25 },
    lideres: { x: 25, y: 50 },
    mochila: { x: 70, y: 48 },
    comecarPartida: { x: 80, y: 88, grande: true },
    voltarAoReino: { x: 10, y: 90 },
    voltarAoMapa: { x: 27, y: 90 },
  },
  // HUD (faixa de cima) e barra de teste (faixa de baixo) têm a altura de dados/arenaDeTeste.js.
  // Configurações fica dentro da faixa do HUD, no canto direito (menor que nas outras telas), para não cobrir a área
  // jogável. As contagens do Q e da fuga e as mensagens ficam logo abaixo do HUD (HudDaPartida.jsx).
  partida: {
    configuracoes: { x: 94.8, y: 5.3 },
  },
  cutsceneDerrota: {
    mensagem: { x: 50, y: 45 },
    continuar: { x: 50, y: 75 },
  },
  resumo: {
    resultado: { x: 50, y: 25 },
    detalhes: { x: 50, y: 55 },
    jogarNovamente: { x: 38, y: 88 },
    voltarAoReino: { x: 62, y: 88 },
  },
}
