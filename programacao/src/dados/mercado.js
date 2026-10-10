// MERCADO (TASK-074): ofertas fixas e rotativas e as trocas item por item (RF21). Não vende equipamento: isso é
// só na Forja (RF22).
// PROVISÓRIO – substituir pelo do grupo (ofertas e regra da rotação: TASK-014). Os itens vêm de dados/itens.js; aqui
// ficam só os ids. A rotação (de quantas em quantas partidas muda e quantas aparecem) e a parte do preço que o
// Mercado paga a quem vende ficam em balanceamento.js (mercado).

// Sempre à venda
export const ofertasFixas = ['pocaoDeVida', 'pocaoDeMana', 'pergaminhoDeRedefinicao', 'minerioDeFerro']

// Parte destas aparece de cada vez e muda com as partidas jogadas (regras/mercado.js)
export const ofertasRotativas = [
  'pocaoGrandeDeVida',
  'tonicoLigeiro',
  'elixirDoFoco',
  'peleDeLobo',
  'teiaDeAranha',
  'presaDeJavali',
  'chifreDeCervo',
  'ervaMedicinal',
]

// Trocas: entrega "dar" e recebe "receber" ({ id: quantidade }), sem ouro
export const trocas = [
  { id: 'pelesPorPresa', dar: { peleDeLobo: 3 }, receber: { presaDeJavali: 1 } },
  { id: 'teiasPorChifre', dar: { teiaDeAranha: 4 }, receber: { chifreDeCervo: 1 } },
  { id: 'ervasPorPocao', dar: { cogumelo: 3, ervaMedicinal: 3 }, receber: { pocaoDeVida: 1 } },
  { id: 'madeiraPorMinerio', dar: { madeira: 4 }, receber: { minerioDeFerro: 1 } },
  { id: 'presasPorCasca', dar: { presaDeJavali: 5 }, receber: { cascaAntiga: 1 } },
]
