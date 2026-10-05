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

  // ---------- Acesso ----------
  telaInicial: {
    iniciarJogo: { x: 50, y: 55 },
    comoJogar: { x: 50, y: 67 },
  },
  login: {
    email: { x: 50, y: 30 },
    senha: { x: 50, y: 44 },
    entrar: { x: 50, y: 57 },
    criarConta: { x: 38, y: 69 },
    esqueciSenha: { x: 62, y: 69 },
    jogarComoConvidado: { x: 50, y: 81 },
    voltar: { x: 10, y: 90 },
  },
  criarConta: {
    email: { x: 50, y: 28 },
    senha: { x: 50, y: 40 },
    apelido: { x: 50, y: 52 },
    criarConta: { x: 50, y: 66 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  confirmeEmail: {
    mensagem: { x: 50, y: 40 },
    jaConfirmei: { x: 50, y: 58 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  esqueciSenha: {
    email: { x: 50, y: 36 },
    enviar: { x: 50, y: 50 },
    mensagem: { x: 50, y: 62 },
    voltarAoLogin: { x: 10, y: 90 },
  },
  narrativaInicial: {
    texto: { x: 50, y: 45 },
    continuar: { x: 50, y: 75 },
  },
  selecaoClasse: {
    instrucao: { x: 50, y: 30 },
    guerreiro: { x: 18, y: 55 },
    mago: { x: 34, y: 55 },
    tanque: { x: 50, y: 55 },
    sacerdote: { x: 66, y: 55 },
    arqueiro: { x: 82, y: 55 },
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
    mochila: { x: 70, y: 25 },
    comecarPartida: { x: 80, y: 88, grande: true },
    voltarAoReino: { x: 10, y: 90 },
    voltarAoMapa: { x: 27, y: 90 },
  },
  partida: {
    dica: { x: 50, y: 25 },
    retorno: { x: 50, y: 45 },
    cancelarRetorno: { x: 50, y: 56 },
    grandeVitoria: { x: 20, y: 80 },
    vitoria: { x: 40, y: 80 },
    retornoForcado: { x: 60, y: 80 },
    derrota: { x: 80, y: 80 },
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
