// O que a tela da Partida e as janelas dela sabem da partida que está rodando (o Phaser avisa pela ponte quando muda)
// e os pedidos que elas mandam para ela. Nada disso é salvo; sai da Partida, volta ao começo.
export function controleInicialDaPartida() {
  return {
    andamento: { emCombate: false, retornando: false, fugindo: false },
    // { id, tipo }: 'comecarRetorno' (Voltar ao Reino da pausa) ou 'fugir' (aviso da fuga). A Partida repassa ao Phaser.
    pedido: null,
    proximoIdDePedido: 1,
    recusasDePausa: 0, // sobe a cada Esc em combate: a Partida mostra "Você não pode pausar agora" (RF44)
    custoDaFuga: null, // { taxa, ouro } de quando o F foi apertado, para o aviso da fuga (RF46)
  }
}

// Pedido da tela (pausa, aviso da fuga) para a partida que está rodando; a Partida o repassa ao Phaser pela ponte
export function comPedido(estado, tipo) {
  const controle = estado.controleDaPartida
  return {
    ...estado,
    controleDaPartida: { ...controle, pedido: { id: controle.proximoIdDePedido, tipo }, proximoIdDePedido: controle.proximoIdDePedido + 1 },
  }
}
