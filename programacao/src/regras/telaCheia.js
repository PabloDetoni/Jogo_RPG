// TELA CHEIA (ajustes de 14/10/2026): as decisões puras. O navegador só deixa entrar em tela cheia no momento de um
// clique, então ela vai junto com os botões principais (Iniciar jogo, Jogar e Começar partida).

// Pedir a tela cheia neste clique? Só com a preferência ligada, se o navegador tiver tela cheia e se ainda não estiver nela.
export function devePedirTelaCheia({ preferencia, suportada, emTelaCheia }) {
  return Boolean(preferencia && suportada && !emTelaCheia)
}

// O jogo saiu da tela cheia sem o jogador pedir (Esc do navegador fora do Chrome e do Edge, ou o Esc segurado): na
// partida, isso vale como um Esc (pausa, se puder) e aparece "Voltar à tela cheia".
// saidaPedida: o jogador clicou no X ou desligou nas Configurações. msDesdeOUltimoEsc: o Esc que a página já recebeu
// (com o Esc travado, o navegador entrega a tecla; segurar sai da tela cheia, e esse Esc não pode contar duas vezes).
export function saidaContaComoEsc({ naPartida, saidaPedida, msDesdeOUltimoEsc = Infinity }, msDoEscRecente = 2500) {
  return Boolean(naPartida && !saidaPedida && msDesdeOUltimoEsc > msDoEscRecente)
}

// Mostrar o botão "Voltar à tela cheia": fora dela, com a preferência ligada, depois de ter saído sem pedir
export function mostrarVoltarATelaCheia({ preferencia, suportada, emTelaCheia, saiuSemPedir }) {
  return Boolean(preferencia && suportada && !emTelaCheia && saiuSemPedir)
}
