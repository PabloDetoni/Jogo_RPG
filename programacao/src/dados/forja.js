// FORJA (TASK-075): o que ela vende e as receitas de fabricação (RF22, RF23).
// PROVISÓRIO – substituir pelo do grupo (catálogo e receitas: TASK-014). Os itens vêm de dados/itens.js; aqui ficam só
// os ids. Quem vende equipamento na Forja recebe a parte do preço de balanceamento.js (mercado.fracaoDaVenda).

// Equipamento comum à venda (o incomum e o raro só saem das receitas ou dos Bosses)
export const aVendaNaForja = [
  'espadaCurta',
  'arcoDeCaca',
  'cajadoDeCarvalho',
  'marteloDeGuerra',
  'cetroDaAurora',
  'escudoDeMadeira',
  'capuzDeCouro',
  'coleteDeCouro',
  'calcasDeCouro',
  'botasDeCouro',
  'luvasDeCouro',
]

// Receitas: fabricar 1 "resultado" consome os materiais ({ id: quantidade }) e o ouro (RF23)
export const receitas = [
  // Armadura de couro, com as peles dos lobos (mais barata que comprar)
  { resultado: 'capuzDeCouro', materiais: { peleDeLobo: 2 }, ouro: 15 },
  { resultado: 'coleteDeCouro', materiais: { peleDeLobo: 4 }, ouro: 25 },
  { resultado: 'calcasDeCouro', materiais: { peleDeLobo: 3 }, ouro: 20 },
  { resultado: 'botasDeCouro', materiais: { peleDeLobo: 2 }, ouro: 15 },
  { resultado: 'luvasDeCouro', materiais: { peleDeLobo: 2 }, ouro: 15 },
  // Armadura de ferro (só por receita)
  { resultado: 'elmoDeFerro', materiais: { minerioDeFerro: 3, peleDeLobo: 1 }, ouro: 80 },
  { resultado: 'peitoralDeFerro', materiais: { minerioDeFerro: 5, peleDeLobo: 2 }, ouro: 120 },
  { resultado: 'grevasDeFerro', materiais: { minerioDeFerro: 4, peleDeLobo: 1 }, ouro: 90 },
  { resultado: 'botasDeVento', materiais: { teiaDeAranha: 5, peleDeLobo: 2 }, ouro: 100 },
  { resultado: 'manoplasDeFerro', materiais: { minerioDeFerro: 3, presaDeJavali: 1 }, ouro: 80 },
  // Armas melhores, uma por classe (a do Tanque é o escudo de casca)
  { resultado: 'laminaDePresa', materiais: { presaDeJavali: 3, minerioDeFerro: 2 }, ouro: 120 },
  { resultado: 'arcoDeTeia', materiais: { teiaDeAranha: 6, madeira: 3 }, ouro: 120 },
  { resultado: 'cajadoDeChifre', materiais: { chifreDeCervo: 2, madeira: 3 }, ouro: 120 },
  { resultado: 'cetroDeErvas', materiais: { ervaMedicinal: 8, madeira: 2 }, ouro: 120 },
  { resultado: 'escudoDeCasca', materiais: { cascaAntiga: 2, madeira: 4 }, ouro: 200 },
]
