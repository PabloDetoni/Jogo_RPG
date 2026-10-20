// ANIMAÇÕES DO CENÁRIO (pedido do Pablo em 20/10/2026): o Reino e o Mapa quase parados, com vida discreta. Tudo lento
// e suave: nada pisca forte nem chama mais atenção que os botões. Distâncias em pixels da imagem original; tempos em
// segundos. Respeita o "reduzir movimento" do sistema e a opção "Animações do cenário" das Configurações.
// As posições ficam em dados/posicoes.js (reino.animacoes e mapa.animacoes).

export const animacoesDoCenario = {
  quadrosPorSegundo: 30, // o desenho para nisto (e para sozinho com a aba escondida)

  // ---------- Reino ----------
  nuvens: { velocidade: 2.4 }, // px por segundo: uma volta no céu leva uns 12 minutos
  estandartes: { amplitude: 1.3, periodo: 4.2, ondas: 0.6 }, // a ponta de baixo balança até 1,3 px
  flamulas: { amplitude: 1.1, periodo: 1.8, ondas: 1 }, // as bandeirinhas do castelo, ao vento lá em cima
  pasDoMoinho: { voltasPorMinuto: 3 },
  copa: { inclinacao: 1.6, periodo: 7 }, // a árvore grande do canto: o alto vai até 1,6 px para o lado
  arvoreDeHabilidades: { periodo: 8 }, // a peça da Árvore balança pelo CSS (identidade.css), bem pouco
  lanterna: { base: 0.22, variacao: 0.07, periodo: 2.6, cor: '255, 196, 96' },
  fumaca: { vida: 6, quantas: 9, subida: 46, deriva: 14, raioInicial: 3, raioFinal: 10, alfa: 0.32 },
  agua: { quantos: 26, periodo: 3.2, comprimento: 3, alfa: 0.75 }, // os brilhos no lago e na fonte

  // ---------- Mapa ----------
  lava: { periodo: 5, minimo: 0, maximo: 0.38 }, // a lava clareia e escurece devagar
  cachoeiras: { velocidade: 26, alfa: 0.45, espaco: 9 }, // a água desce a 26 px por segundo, uma faixa clara a cada 9 px
  neve: { quantos: 70, velocidade: 9, balanco: 3 }, // flocos caindo devagar na Tundra
  fumacaDoVulcao: { vida: 9, quantas: 12, subida: 70, deriva: 30, raioInicial: 6, raioFinal: 20, alfa: 0.3 },
  ondas: { periodo: 9 }, // o oceano vai e volta um pouco (CSS)
  vento: { periodo: 11, largura: 160, alfa: 0.08 }, // uma faixa de luz passando pelas copas da Floresta
}
