// Gera o documentacao/Balanceamento.md a partir dos valores de verdade do jogo (src/dados) e das regras (src/regras).
// Assim o documento nunca fica diferente do código. Rode com: npm run balanceamento
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  atributoMaximo,
  capacidadePorPontoDeForca,
  contratos,
  curvaDeXp,
  curvaDosAtributos,
  distanciaAteABorda,
  minimoDaGrandeVitoria,
  pesosDaPontuacao,
  pontosDeAtributoPorNivel,
  pontosDeHabilidadePorNivel,
} from '../src/dados/balanceamento.js'
import { biomas } from '../src/dados/biomas.js'
import { atributos, classes } from '../src/dados/classes.js'
import { bonusDaGrandeVitoriaPercentual, multaPorAbandonoPercentual, nivelInicial, nivelMaximo } from '../src/dados/regras.js'
import { resultados } from '../src/dados/resultados.js'
import { adicionalNoDominioDeBoss } from '../src/dados/taxas.js'
import { efeitoComExpoente, pontosDeAtributoAteONivel } from '../src/regras/atributos.js'
import { calcularFimDaPartida } from '../src/regras/fimDaPartida.js'
import { multaDaMissao } from '../src/regras/guilda.js'
import { capacidadeDaMochila } from '../src/regras/mochila.js'
import { aplicarTaxa, taxaNaDistancia } from '../src/regras/taxa.js'
import { xpParaSubir, xpTotalAteONivel } from '../src/regras/xp.js'

// Fica junto da documentação, que é a fonte de verdade do grupo (TASK-011)
const destino = fileURLToPath(new URL('../../documentacao/Balanceamento.md', import.meta.url))

const numero = (valor, casas = 0) =>
  valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
const tabela = (cabecalho, linhas) =>
  [`| ${cabecalho.join(' | ')} |`, `| ${cabecalho.map(() => '---').join(' | ')} |`, ...linhas.map((linha) => `| ${linha.join(' | ')} |`)].join(
    '\n',
  )

const borda = distanciaAteABorda.floresta
const somaInicial = (classe) => Object.values(classe.atributosIniciais).reduce((soma, valor) => soma + valor, 0)
const somas = classes.map(somaInicial)
const menorSoma = Math.min(...somas)
const maiorSoma = Math.max(...somas)
const somaTexto = menorSoma === maiorSoma ? numero(menorSoma) : `${numero(menorSoma)} a ${numero(maiorSoma)}`
const pontosAte100 = pontosDeAtributoAteONivel(nivelMaximo)
const forcasIniciais = classes.map((classe) => classe.atributosIniciais.forca)
const xpTotal = xpTotalAteONivel(nivelMaximo)
const expoentes = [...new Set([1, 1.25, 1.5, 2, curvaDosAtributos.expoente])].sort((a, b) => a - b)
const nomeDoExpoente = (e) => `expoente ${numero(e, 2).replace(/,?0+$/, '')}${e === curvaDosAtributos.expoente ? ' (atual)' : ''}`
const lugar = (fracao, noDominioDeBoss = false) => ({ distancia: borda * fracao, noDominioDeBoss })

// Cada bloco (título, parágrafo, tabela, lista) é separado por uma linha em branco
const partes = []
const escrever = (...blocos) => partes.push(...blocos)
const lista = (...itens) => itens.map((item) => `- ${item}`).join('\n')

escrever(
  '# Balanceamento: valores e limites',
  [
    '> Este arquivo é **gerado pelo código**: não edite à mão. Para mudar um valor, edite `programacao/src/dados/balanceamento.js` (ou `classes.js` e `taxas.js`) e rode `npm run balanceamento` dentro de `programacao`. Depois rode `npm test`: os testes de limite avisam se algum número ficou absurdo.',
    '>',
    '> **Provisório** = valor de balanceamento ainda a decidir (Conceito §19). **Documentação** = vem do Conceito e dos requisitos.',
  ].join('\n'),
)

escrever(
  '## Resumo dos limites',
  tabela(
    ['O quê', 'Valor', 'Origem'],
    [
      ['Nível máximo', numero(nivelMaximo), 'Documentação (RF55)'],
      ['XP para subir do nível 1 ao 2', numero(xpParaSubir(1)), 'Provisório'],
      [`XP para subir do nível ${nivelMaximo - 1} ao ${nivelMaximo}`, numero(xpParaSubir(nivelMaximo - 1)), 'Provisório'],
      [`XP total do nível 1 ao ${nivelMaximo}`, numero(xpTotal), 'Provisório'],
      ['Maior valor de um atributo', numero(atributoMaximo), 'Provisório'],
      [`Pontos de atributo ganhos até o nível ${nivelMaximo}`, numero(pontosAte100), 'Provisório'],
      [
        `Atributos de um personagem no nível ${nivelMaximo}`,
        `${somaTexto} iniciais + ${numero(pontosAte100)} ganhos, de ${numero(atributos.length * atributoMaximo)} possíveis`,
        'Provisório',
      ],
      ['Maior taxa possível', `${taxaNaDistancia('todosDesmaiam', borda, borda, true)}%`, 'Documentação (§12.2)'],
      ['Mochila do grupo com as 5 classes no nível 1', numero(capacidadeDaMochila(forcasIniciais)), 'Provisório'],
      ['Maior mochila possível (5 personagens com Força no máximo)', numero(capacidadeDaMochila(classes.map(() => atributoMaximo))), 'Provisório'],
      ['Pontuação base para a Grande Vitória', `acima de ${numero(minimoDaGrandeVitoria)}`, 'Provisório'],
      ['Bônus da Grande Vitória', `+${bonusDaGrandeVitoriaPercentual}% no ouro e na pontuação`, 'Documentação (RF47)'],
      ['Contrato temporário / permanente', `${numero(contratos.precoDoTemporario)} / ${numero(contratos.precoDoPermanente)} de ouro`, 'Provisório'],
    ],
  ),
)

const niveisDaTabela = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100].filter((n) => n >= nivelInicial && n <= nivelMaximo)
escrever(
  '## XP e níveis',
  `XP para passar do nível n para o n + 1 = **${numero(curvaDeXp.base)} × n ^ ${numero(curvaDeXp.expoente, 2).replace(/,?0+$/, '')}** (provisório). A cada nível o personagem ganha **${pontosDeAtributoPorNivel} pontos de atributo** e **${pontosDeHabilidadePorNivel} de habilidade**. O XP guardado é o que ele juntou dentro do nível atual; no nível ${nivelMaximo}, o XP a mais é descartado. XP nunca é taxado (RF50).`,
  tabela(
    ['Nível', 'XP para subir ao próximo', 'XP total para chegar a este nível'],
    niveisDaTabela.map((n) => [numero(n), n >= nivelMaximo ? '—' : numero(xpParaSubir(n)), numero(xpTotalAteONivel(n))]),
  ),
  '### Quantos monstros até o nível 100',
  `Ainda não existe XP por monstro (etapa 5). A tabela mostra quantos monstros são precisos para ir do nível 1 ao ${nivelMaximo}, para cada valor possível de XP por monstro. No grupo, o XP de cada monstro é dividido entre os permanentes ativos (RF50): com 5 personagens, cada um recebe um quinto.`,
  tabela(
    ['XP por monstro', 'Monstros (personagem sozinho)', 'Monstros (grupo de 5, todos chegam ao 100 juntos)'],
    [10, 25, 50, 100, 250, 500].map((xp) => [numero(xp), numero(Math.ceil(xpTotal / xp)), numero(Math.ceil(xpTotal / (xp / 5)))]),
  ),
  '### Ideia em aberto: limitar o XP por monstro',
  'Anotada em 05/10/2026 para decidir depois: limitar quanto XP dá para ganhar com cada monstro, para o jogador precisar enfrentar todo tipo de monstro. Caminhos possíveis:',
  lista(
    'teto de XP por tipo de monstro em cada partida;',
    'XP que diminui quanto mais vezes o mesmo tipo é derrotado;',
    'XP que depende da diferença de nível entre o monstro e o grupo.',
  ),
)

const valoresDosAtributos = [10, 25, 50, 75, 100].map((v) => Math.round((v / 100) * atributoMaximo))
escrever(
  '## Atributos',
  `Maior valor de cada atributo: **${numero(atributoMaximo)}** (provisório). Cada nível dá ${pontosDeAtributoPorNivel} pontos; do nível 1 ao ${nivelMaximo} são **${numero(pontosAte100)} pontos**. Cada classe começa com ${somaTexto} pontos, então um personagem no nível ${nivelMaximo} tem até ${numero(maiorSoma + pontosAte100)} pontos espalhados pelos 5 atributos, de ${numero(atributos.length * atributoMaximo)} possíveis: dá para levar uns **${Math.floor((maiorSoma + pontosAte100) / atributoMaximo)} atributos ao máximo**, não todos.`,
  '### Atributos iniciais (provisório)',
  tabela(
    ['Classe', ...atributos.map((a) => a.nome), 'Soma'],
    classes.map((classe) => [classe.nome, ...atributos.map((a) => numero(classe.atributosIniciais[a.id])), numero(somaInicial(classe))]),
  ),
  '### Quanto um atributo alto vale',
  `O efeito de um atributo (dano, vida, mana...) segue a curva **efeito = ${numero(atributoMaximo)} × (valor ÷ ${numero(atributoMaximo)}) ^ expoente**. Com expoente 1, o atributo ${numero(atributoMaximo)} vale o dobro do ${numero(atributoMaximo / 2)}. Com expoente maior, os valores altos valem cada vez mais. O expoente escolhido está marcado como atual (provisório); o combate usa a curva a partir da etapa 5.`,
  tabela(
    ['Valor do atributo', ...expoentes.map(nomeDoExpoente)],
    [
      ...valoresDosAtributos.map((v) => [numero(v), ...expoentes.map((e) => numero(efeitoComExpoente(v, e), 1))]),
      [
        `**${numero(atributoMaximo)} vale quantas vezes o ${numero(atributoMaximo / 2)}**`,
        ...expoentes.map((e) => `**${numero(efeitoComExpoente(atributoMaximo, e) / efeitoComExpoente(atributoMaximo / 2, e), 2)}×**`),
      ],
    ],
  ),
)

const linhaDaTaxa = (rotulo, situacao, vezes, boss) => [
  rotulo,
  ...[0, 0.5, 1].map((fracao) => `${vezes * taxaNaDistancia(situacao, borda * fracao, borda, boss)}%`),
]
const linhasDasTaxas = (boss) => [
  linhaDaTaxa('Cada personagem perdido', 'perdido', 1, boss),
  linhaDaTaxa('2 perdidos', 'perdido', 2, boss),
  linhaDaTaxa('3 perdidos', 'perdido', 3, boss),
  linhaDaTaxa('4 perdidos', 'perdido', 4, boss),
  linhaDaTaxa('Fuga', 'fuga', 1, boss),
  linhaDaTaxa('Todos desmaiam', 'todosDesmaiam', 1, boss),
]
const exemplo1 = calcularFimDaPartida({ como: 'retornoNormal', houveDesmaio: true, perdidos: [lugar(0.5), lugar(0.5)], ouroGanho: 8000 }, borda)
const exemplo2 = calcularFimDaPartida({ como: 'fuga', houveDesmaio: true, perdidos: [lugar(0.5), lugar(0.5)], lider: lugar(0.5), ouroGanho: 8000 }, borda)
escrever(
  '## Taxas (documentação)',
  `A taxa incide só sobre o **ouro ganho na partida** (RF48). Cada perdido paga pela distância em linha reta entre o ponto inicial do bioma e o lugar onde caiu: a taxa cresce em linha reta do início até a borda, e cada valor é truncado (3,5% vira 3%). Fuga e "todos desmaiam" usam uma taxa só, pela posição do Líder, no lugar das dos perdidos. No domínio de Boss somam-se +${adicionalNoDominioDeBoss.perdido} pontos por perdido, +${adicionalNoDominioDeBoss.fuga} na fuga e +${adicionalNoDominioDeBoss.todosDesmaiam} em "todos desmaiam". Itens e XP nunca são taxados.`,
  tabela(
    ['Bioma', 'Distância até a borda (provisório)'],
    biomas.map((bioma) => [bioma.nome, numero(distanciaAteABorda[bioma.id])]),
  ),
  '### Sem Boss',
  tabela(['Situação', 'Início', 'Meio', 'Borda'], linhasDasTaxas(false)),
  '### No domínio de Boss',
  tabela(['Situação', 'Início', 'Meio', 'Borda'], linhasDasTaxas(true)),
  '### A taxa ao longo do caminho (sem Boss)',
  tabela(
    ['Distância', 'Perdido', 'Fuga', 'Todos desmaiam'],
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5].map((fracao) => [
      `${numero(fracao * 100)}% do caminho${fracao > 1 ? ' (depois da borda)' : ''}`,
      `${taxaNaDistancia('perdido', borda * fracao, borda)}%`,
      `${taxaNaDistancia('fuga', borda * fracao, borda)}%`,
      `${taxaNaDistancia('todosDesmaiam', borda * fracao, borda)}%`,
    ]),
  ),
  '### Exemplos do Conceito, calculados pelo jogo',
  lista(
    `Ganha 8.000 de ouro, dois personagens caem no meio, volta com Q: **${resultados[exemplo1.resultado].nome}**, taxa de ${exemplo1.taxa}% = ${numero(exemplo1.taxaEmOuro)} de ouro; recebe ${numero(exemplo1.ouroRecebido)}.`,
    `O mesmo, mas foge com F no meio: **${resultados[exemplo2.resultado].nome}**, taxa de ${exemplo2.taxa}% = ${numero(exemplo2.taxaEmOuro)} de ouro; recebe ${numero(exemplo2.ouroRecebido)}.`,
  ),
)

const taxasDeExemplo = [0, 6, 18, 25, 55]
escrever(
  '## Ouro (moedas)',
  lista(
    'A taxa em moedas é **arredondada para baixo**, a favor do jogador. O ouro que o jogador já tinha nunca é taxado.',
    `Grande Vitória: taxa 0% e **+${bonusDaGrandeVitoriaPercentual}%** no ouro (também arredondado para baixo).`,
    'Ainda sem valor: ouro por monstro, preços do Mercado e da Forja e do pergaminho (etapas 5 e 7). Os contratos já têm preço provisório (seção Guilda).',
    '**Teto do ouro: ainda não existe.** O maior número que o jogo guarda com segurança é 9.007.199.254.740.991. Se quiser um teto (por exemplo, 999.999.999), é só decidir.',
  ),
  '### Quanto o jogador recebe',
  tabela(
    ['Ouro ganho', ...taxasDeExemplo.map((t) => `Taxa ${t}%`)],
    [100, 1000, 8000, 50000].map((ouro) => [numero(ouro), ...taxasDeExemplo.map((t) => numero(aplicarTaxa(ouro, t).ouroRecebido))]),
  ),
)

const recompensasDeExemplo = [50, 100, 500, 1000, 5000]
escrever(
  '## Guilda: contratos e missões',
  `Contratos (RF29, preços provisórios). O **temporário** custa **${numero(contratos.precoDoTemporario)} de ouro**, vem no nível ${contratos.nivelDoTemporario}, dura **${contratos.partidasDoTemporario} partidas** e não pode ser Líder. O **permanente** custa **${numero(contratos.precoDoPermanente)} de ouro** e cria o personagem no nível ${nivelInicial}, que evolui normalmente; se já havia um temporário da mesma classe, ele é substituído.`,
  lista(
    'O temporário perde uma partida a cada partida terminada (RF52). Partida interrompida (aba fechada, queda) não gasta partida, porque não conta (RF12).',
    'Um personagem por classe: não dá para contratar uma classe que já tem permanente, nem dois temporários da mesma classe.',
  ),
  `Missões (RF28): uma por vez. Ao entregar, o ouro vai para o jogador e o XP é dividido entre todos os permanentes (a sobra vai para o Líder); XP nunca é taxado. Missão de entregar consome os itens da Mochila do Reino. Abandonar custa **${multaPorAbandonoPercentual}% do ouro da recompensa** (documentação), arredondado para baixo; o ouro do jogador nunca fica negativo.`,
  tabela(
    ['Ouro da recompensa', ...recompensasDeExemplo.map((ouro) => numero(ouro))],
    [['Multa por abandonar', ...recompensasDeExemplo.map((ouro) => numero(multaDaMissao({ recompensa: { ouro } })))]],
  ),
)

const grupos = [
  ...classes.map((classe) => [`${classe.nome} sozinho (nível 1)`, [classe.atributosIniciais.forca]]),
  ['As 5 classes juntas (nível 1)', forcasIniciais],
  ['5 personagens com Força 50', classes.map(() => atributoMaximo / 2)],
  [`5 personagens com Força ${numero(atributoMaximo)}`, classes.map(() => atributoMaximo)],
]
escrever(
  '## Peso (mochila da partida)',
  `Capacidade = soma da Força de todo o grupo que vai, contando os contratados × **${capacidadePorPontoDeForca}** (provisório). É calculada ao começar a partida e não muda durante ela (RF33). O peso de cada item é um número inteiro por unidade; o que não cabe cai no chão. O peso dos itens ainda não existe (etapa 7).`,
  tabela(
    ['Grupo', 'Força somada', 'Capacidade'],
    grupos.map(([nome, forcas]) => [nome, numero(forcas.reduce((s, f) => s + f, 0)), numero(capacidadeDaMochila(forcas))]),
  ),
)

const cenarios = [
  ['Partida curta: 5 monstros, 50 de ouro, 2 recursos, 60 s ativos, sem desmaio', { como: 'retornoNormal', houveDesmaio: false, perdidos: [], monstros: 5, ouroGanho: 50, recursos: 2, segundosAtivos: 60 }],
  ['Boa partida: 50 monstros, 2.000 de ouro, 20 recursos, 600 s, sem desmaio', { como: 'retornoNormal', houveDesmaio: false, perdidos: [], monstros: 50, ouroGanho: 2000, recursos: 20, segundosAtivos: 600 }],
  ['A mesma, mas um personagem caiu na borda', { como: 'retornoNormal', houveDesmaio: true, perdidos: [lugar(1)], monstros: 50, ouroGanho: 2000, recursos: 20, segundosAtivos: 600 }],
  ['A mesma, mas fugiu com F no meio', { como: 'fuga', houveDesmaio: false, lider: lugar(0.5), monstros: 50, ouroGanho: 2000, recursos: 20, segundosAtivos: 600 }],
  ['Exemplo do Conceito: base 5.100, todos desmaiam no meio', { como: 'todosDesmaiaram', houveDesmaio: true, lider: lugar(0.5), ouroGanho: 5100 }],
]
escrever(
  '## Pontuação e resultado',
  `Pontuação base = monstros × ${pesosDaPontuacao.porMonstro} + ouro ganho × ${pesosDaPontuacao.porOuro} + recursos × ${pesosDaPontuacao.porRecurso} + bônus de Boss + segundos ativos × ${pesosDaPontuacao.porSegundoAtivo} (pesos provisórios). Pontuação final = base × (1 − taxa); na Grande Vitória, +${bonusDaGrandeVitoriaPercentual}% (RF49).`,
  lista(
    `**Grande Vitória:** voltou com Q ou pela pausa, ninguém desmaiou na partida inteira e a base passou de ${numero(minimoDaGrandeVitoria)} (provisório).`,
    '**Vitória:** voltou com Q ou pela pausa nos outros casos.',
    '**Retorno forçado:** fugiu com F, ou o Líder não foi levantado em 30 s.',
    '**Derrota:** todos desmaiaram.',
  ),
  tabela(
    ['Cenário', 'Base', 'Resultado', 'Taxa', 'Ouro recebido', 'Pontuação final'],
    cenarios.map(([nome, fim]) => {
      const conta = calcularFimDaPartida(fim, borda)
      return [nome, numero(conta.pontuacaoBase), resultados[conta.resultado].nome, `${conta.taxa}%`, numero(conta.ouroRecebido), numero(conta.pontuacaoFinal)]
    }),
  ),
)

escrever(
  '## Ainda sem valor (a decidir)',
  'Valores do Conceito §19 que ainda não existem no código:',
  lista(
    'XP e ouro por monstro; bônus de Boss na pontuação; chance de drop dos Bosses;',
    'dano, custo de mana e recarga das habilidades; recarga da esquiva; duração da imunidade;',
    'vida devolvida e fragilidade na ajuda de 5 s; fortalecimento da Ressurreição;',
    'preços do Mercado e da Forja e do pergaminho;',
    'peso de cada item; tempo que um item fica no chão;',
    'tamanho dos domínios de Boss; raio de detecção e território dos mobs;',
    'recompensas de missões e conquistas.',
  ),
)

writeFileSync(destino, `${partes.join('\n\n')}\n`)
console.log(`Balanceamento.md atualizado (${destino})`)
