// Roteiro do Reino no navegador (Fase 4: TEST-006 e as partes novas). Uso: npm run testar:reino
// Liga o Vite e um Edge escondido, joga como convidado e confere os 7 casos do TEST-006 (comprar sem ouro, vender e
// recomprar, entrega depois de vender, abandonar sem ouro para a multa, arma de outra classe, permanente com temporário
// ativo, recarregar e conferir), a Mochila, a Forja, as Árvores, a mochila da partida (Tab, E), missões, conquistas e um
// minijogo. Prints em testes-do-navegador/reino/.
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'reino')
const vite = await ligarVite(5195)
let navegador = null

async function desligar(codigo) {
  await navegador?.fechar()
  await vite.fechar()
  process.exit(codigo)
}
const { estado, conferir, parar } = criarConferencias(() => desligar(1))

const CENA = `window.__jogoDaPartida?.scene?.getScene('arena')`
let aba = null
const cena = (expr) => aba.avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)
// Clica num botão pelo texto (exato, ou só o começo); devolve se achou
const clicar = (texto, comeco = false) =>
  aba.avaliar(`(() => {
    const botoes = [...document.querySelectorAll('button')].filter((b) => !b.disabled)
    const alvo = botoes.find((b) => ${comeco ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : `b.textContent.trim() === ${JSON.stringify(texto)}`})
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
const passo = async (texto, comeco = false) => {
  if (!(await clicar(texto, comeco))) throw new Error(`não achei o botão "${texto}"`)
  await pausa(220)
}
// Clica num botão de dentro de uma parte da tela (quando o mesmo texto aparece também numa aba)
const clicarDentro = async (seletor, texto) => {
  const achou = await aba.avaliar(`(() => {
    const alvo = [...document.querySelectorAll(${JSON.stringify(seletor)} + ' button')].find((b) => !b.disabled && b.textContent.trim().startsWith(${JSON.stringify(texto)}))
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
  if (!achou) throw new Error(`não achei o botão "${texto}" em ${seletor}`)
  await pausa(220)
}
const mensagem = () => aba.avaliar(`document.querySelector('.mensagem-do-reino')?.textContent ?? ''`)
const salvo = () => aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado') ?? 'null')?.progresso ?? null`)
const quantos = (progresso, id) => (progresso?.mochila ?? []).filter((item) => item.id === id).reduce((soma, item) => soma + item.quantidade, 0)
const irAoReino = async () => {
  if ((await aba.titulo()) !== 'Reino') {
    if (await clicar('Voltar ao Reino')) await pausa(200)
    else if (await clicar('Voltar')) await pausa(200)
  }
  await aba.esperarTela('Reino')
}

try {
  navegador = await abrirNavegador('reino', PASTA)
  aba = await navegador.novaAba('aba1')
  console.log(`Site: ${vite.site}`)
  await aba.abrir(vite.site)

  console.log('1. Convidado novo e itens de teste (painel DEV)')
  await passo('Iniciar jogo')
  await passo('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await passo('Continuar')
  await passo('Arqueiro')
  await passo('Escolher Arqueiro')
  await aba.esperarTela('Reino')

  console.log('2. TEST-006, caso 1: comprar sem ouro')
  await passo('Mercado')
  await passo('Pergaminho de redefinição', true)
  await passo('Comprar 1', true)
  conferir('comprar sem ouro: a compra não acontece e aparece o motivo', (await mensagem()).startsWith('Ouro insuficiente: custa 300 e você tem 0'), await mensagem())
  await irAoReino()
  await passo('Itens de teste', true)
  await passo('Itens de teste', true) // duas vezes: ouro para os contratos
  await pausa(300)
  const comItens = await salvo()
  conferir('itens de teste na Mochila e ouro (só no npm run dev)', comItens?.ouro === 2000 && quantos(comItens, 'pocaoDeVida') === 6, { ouro: comItens?.ouro })

  console.log('3. TEST-006, caso 6: contrato permanente com o temporário da mesma classe ativo')
  await passo('Guilda')
  await passo('Contrato temporário')
  await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.lista-de-contratos li')].find((l) => l.textContent.startsWith('Guerreiro')); li.querySelector('button').click(); return true })()`)
  await pausa(250)
  await passo('Contrato permanente')
  conferir('o Guerreiro aparece avisando que encerra o temporário', (await aba.texto()).includes('(encerra o contrato temporário)'))
  await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.lista-de-contratos li')].find((l) => l.textContent.startsWith('Guerreiro')); li.querySelector('button').click(); return true })()`)
  await pausa(300)
  const contratado = await salvo()
  conferir('o permanente entra e o temporário da mesma classe vai embora', contratado.personagens.some((p) => p.classe === 'guerreiro') && !contratado.contratosTemporarios.some((c) => c.classe === 'guerreiro'), {
    personagens: contratado.personagens.map((p) => p.classe),
    temporarios: contratado.contratosTemporarios,
  })

  console.log('4. TEST-006, caso 2: vender e recomprar')
  await irAoReino()
  await passo('Mercado')
  await passo('Vender')
  await passo('Poção de vida', true)
  const antesDeVender = await salvo()
  await passo('Vender 1', true)
  const vendeu = await salvo()
  conferir('vender soma metade do preço ao ouro e tira 1 da Mochila', vendeu.ouro === antesDeVender.ouro + 12 && quantos(vendeu, 'pocaoDeVida') === quantos(antesDeVender, 'pocaoDeVida') - 1, {
    ouro: [antesDeVender.ouro, vendeu.ouro],
  })
  await passo('Comprar')
  await passo('Poção de vida', true)
  await passo('Comprar 1', true)
  const recomprou = await salvo()
  conferir('recomprar desconta o preço cheio e a poção volta', recomprou.ouro === vendeu.ouro - 25 && quantos(recomprou, 'pocaoDeVida') === quantos(antesDeVender, 'pocaoDeVida'), { ouro: recomprou.ouro })
  await aba.print('01-mercado')

  console.log('5. TEST-006, caso 3: missão de entrega depois de vender os itens')
  await irAoReino()
  await passo('Guilda')
  await passo('Missões')
  await passo('Peles para o curtidor', true)
  await passo('Aceitar')
  conferir('aceitou a missão de entrega e ela já conta as peles da Mochila', (await aba.texto()).includes('Entregar 4 Pele de lobo (4/4)'))
  await irAoReino()
  await passo('Mercado')
  await passo('Vender')
  await passo('Pele de lobo', true)
  await passo('Vender todos', true)
  await irAoReino()
  await passo('Guilda')
  conferir('vendidas as peles, a entrega fica incompleta de novo', (await aba.texto()).includes('Entregar 4 Pele de lobo (0/4)'))
  await passo('Entregar')
  conferir('entregar sem os itens não dá a recompensa e explica', (await mensagem()).includes('ainda não foi cumprida'), await mensagem())

  console.log('6. Mochila: descartar com confirmação')
  await irAoReino()
  await passo('Mochila')
  await passo('Tônico ligeiro', true)
  await passo('Descartar 1')
  conferir('descartar pede confirmação antes', (await aba.texto()).includes('Não dá para desfazer'))
  const antesDeDescartar = quantos(await salvo(), 'tonicoLigeiro')
  await passo('Sim, descartar')
  conferir('confirmado, o item sai da Mochila', quantos(await salvo(), 'tonicoLigeiro') === antesDeDescartar - 1)

  console.log('7. TEST-006, caso 5: arma de outra classe; Forja comprar e fabricar')
  await irAoReino()
  await passo('Forja')
  const arcosAntes = quantos(await salvo(), 'arcoDeCaca')
  await passo('Arma', true)
  await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.detalhe-do-item li')].find((l) => l.textContent.startsWith('Espada curta')); li.querySelector('button').click(); return true })()`)
  await pausa(200)
  conferir('equipar arma de outra classe: a Forja não deixa e explica', (await mensagem()) === 'Espada curta é só para Guerreiro.', await mensagem())
  await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.detalhe-do-item li')].find((l) => l.textContent.startsWith('Arco de caça')); li.querySelector('button').click(); return true })()`)
  await pausa(250)
  const equipou = await salvo()
  conferir('a arma da própria classe é equipada e sai da Mochila', equipou.personagens.find((p) => p.classe === 'arqueiro').equipamento.arma === 'arcoDeCaca' && quantos(equipou, 'arcoDeCaca') === arcosAntes - 1)
  await passo('Fabricar')
  // As peles foram vendidas no caso 3: o Elmo de ferro (que pede 1) diz o que falta; as Manoplas de ferro saem
  await passo('Elmo de ferro', true)
  await clicarDentro('.detalhe-do-item', 'Fabricar')
  conferir('fabricar sem os materiais diz o que falta e não gasta nada', (await mensagem()) === 'Falta 1 Pele de lobo.' && (await salvo()).ouro === equipou.ouro, await mensagem())
  await passo('Manoplas de ferro', true)
  await clicarDentro('.detalhe-do-item', 'Fabricar')
  const fabricou = await salvo()
  conferir(
    'com os materiais, fabricar consome materiais e ouro e o equipamento aparece',
    quantos(fabricou, 'manoplasDeFerro') === quantos(equipou, 'manoplasDeFerro') + 1 &&
      quantos(fabricou, 'minerioDeFerro') === quantos(equipou, 'minerioDeFerro') - 3 &&
      quantos(fabricou, 'presaDeJavali') === quantos(equipou, 'presaDeJavali') - 1 &&
      fabricou.ouro === equipou.ouro - 80,
    { mensagem: await mensagem() },
  )
  await aba.print('02-forja')

  console.log('8. Árvores: atributos e habilidades')
  await irAoReino()
  await passo('Árvores', true)
  await passo('Arqueiro') // a primeira aba é a do Guerreiro, contratado agora (sem pontos livres)
  await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.atributos-da-arvore li')].find((l) => l.textContent.startsWith('Força')); const mais = [...li.querySelectorAll('button')].at(-1); mais.click(); mais.click(); return true })()`)
  await pausa(150)
  await passo('Aplicar', true)
  const aplicou = await salvo()
  const arqueiro = aplicou.personagens.find((p) => p.classe === 'arqueiro')
  conferir('aplicar fixa os pontos (Força +2, 2 pontos a menos)', arqueiro.atributos.forca === 12 && arqueiro.pontosDeAtributo === 18, { forca: arqueiro.atributos.forca, livres: arqueiro.pontosDeAtributo })
  await passo('Habilidades')
  for (let i = 0; i < 4; i++) await passo('Evoluir', true)
  await passo('Chuva de flechas', true)
  await passo('Aprender', true)
  await passo('Pôr numa tecla')
  const habilidades = (await salvo()).personagens.find((p) => p.classe === 'arqueiro')
  conferir('a raiz no nível 5 libera o ramo; a nova vai para a tecla 2', habilidades.habilidades.tiroPerfurante === 5 && habilidades.ativas.join() === 'tiroPerfurante,chuvaDeFlechas', habilidades.ativas)
  await aba.print('03-arvore')

  console.log('9. Mochila da partida: Preparação, Tab e E; missão de matar; conquista')
  await irAoReino()
  await passo('Guilda')
  await passo('Abandonar…')
  await passo('Sim, abandonar')
  await passo('Caçar lobos', true)
  await passo('Aceitar')
  await irAoReino()
  await passo('Jogar')
  await passo('Floresta')
  await aba.esperarTela('Preparação')
  await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.mochila-da-preparacao li')].find((l) => l.textContent.startsWith('Poção de vida')); const mais = [...li.querySelectorAll('button')].at(-1); mais.click(); mais.click(); return true })()`)
  await pausa(200)
  const pocoesAntes = quantos(await salvo(), 'pocaoDeVida')
  await passo('Começar partida')
  await aba.esperar(`!!${CENA}?.lider`, 'a partida', 20000)
  await pausa(800)
  conferir('a partida começa com as 2 poções na mochila da partida', await cena(`c.mochila.itens.some((i) => i.id === 'pocaoDeVida' && i.quantidade === 2)`))
  await cena(`(c.lider.vida = 10, true)`)
  await aba.apertar('tab')
  await pausa(300)
  conferir('Tab abre a mochila da partida, sem pausar', (await aba.avaliar(`!!document.querySelector('[aria-label="Mochila da partida"]')`)) && !(await aba.avaliar(`document.body.innerText.includes('Continuar partida')`)))
  await aba.apertar('e')
  await pausa(300)
  const usou = await cena(`({ vida: c.lider.vida, pocoes: c.mochila.itens.find((i) => i.id === 'pocaoDeVida')?.quantidade ?? 0 })`)
  conferir('E usa a poção no Líder: a vida sobe e sobra 1', usou.vida > 10 && usou.pocoes === 1, usou)
  await aba.apertar('esc')
  await pausa(300)
  conferir('Esc fecha a mochila (sem pausar)', !(await aba.avaliar(`!!document.querySelector('[aria-label="Mochila da partida"]')`)))
  await cena(`(() => { c.invencivel = true; for (const l of c.inimigos.filter((i) => i.tipo === 'lobo').slice(0, 2)) c.acertar(l, 99999, c.lider, 0, c.lider); return true })()`)
  await pausa(300)
  conferir('derrotar lobos avisa a missão no HUD', (await aba.texto()).includes('Missão: 2/8 lobo'))
  await aba.print('04-partida')
  await passo('Vitória')
  await aba.esperarTela('Resumo', 8000)
  await pausa(400)
  const depoisDaPartida = await salvo()
  conferir('no fim, sai do Reino só a poção usada', quantos(depoisDaPartida, 'pocaoDeVida') === pocoesAntes - 1, { antes: pocoesAntes, depois: quantos(depoisDaPartida, 'pocaoDeVida') })
  conferir('a missão de matar avançou (2/8)', depoisDaPartida.missaoAtiva?.progresso === 2, depoisDaPartida.missaoAtiva)
  conferir('a primeira partida conclui a conquista "Primeiros passos", com aviso', depoisDaPartida.conquistas?.primeirosPassos === true && (await aba.texto()).includes('Conquista: Primeiros passos'))

  console.log('10. Minijogo do Lago (uma rodada de 30 s)')
  await passo('Jogar novamente')
  await passo('Lago')
  await passo('Começar')
  const pescou = await aba.avaliar(`(async () => {
    const fim = Date.now() + 31500
    while (Date.now() < fim) {
      const boia = document.querySelector('.boia-fisgando')
      if (boia) boia.click()
      await new Promise((r) => setTimeout(r, 120))
    }
    return document.querySelector('.minijogo')?.innerText ?? ''
  })()`)
  await pausa(400)
  const aposLago = await salvo()
  conferir('a rodada acaba e o peixe vai para a Mochila, sem contar como partida', pescou.includes('Fim da rodada') && quantos(aposLago, 'peixe') > 0 && aposLago.estatisticas.partidasJogadas === depoisDaPartida.estatisticas.partidasJogadas, {
    peixes: quantos(aposLago, 'peixe'),
  })
  await aba.print('05-lago')

  console.log('11. TEST-006, caso 4: abandonar com ouro abaixo da multa')
  await passo('Voltar ao Mapa')
  await passo('Voltar ao Reino')
  await aba.esperarTela('Reino')
  await passo('Guilda')
  await passo('Abandonar…')
  await passo('Sim, abandonar')
  await passo('O Guardião da Floresta', true)
  await passo('Aceitar')
  await irAoReino()
  await passo('Mercado')
  await passo('Poção de vida', true)
  for (let i = 0; i < 400 && (await salvo()).ouro >= 25; i++) await clicar('Comprar 1', true)
  await pausa(300)
  const pobre = await salvo()
  await irAoReino()
  await passo('Guilda')
  await passo('Abandonar…')
  conferir('o aviso mostra a multa e que o ouro vai ficar em zero', (await aba.texto()).includes('o ouro vai ficar em zero'), pobre.ouro)
  await passo('Sim, abandonar')
  const abandonou = await salvo()
  conferir('com ouro abaixo da multa, o ouro fica em zero e a missão sai', abandonou.ouro === 0 && abandonou.missaoAtiva === null, { antes: pobre.ouro, depois: abandonou.ouro })

  console.log('12. TEST-006, caso 7: recarregar a página e conferir que tudo persistiu')
  const antesDeRecarregar = await salvo()
  await aba.abrir(vite.site)
  await passo('Iniciar jogo')
  await passo('Jogar como convidado')
  await aba.esperarTela('Reino', 15000)
  const depoisDeRecarregar = await salvo()
  const resumo = (p) => ({
    ouro: p.ouro,
    mochila: [...p.mochila].sort((a, b) => a.id.localeCompare(b.id)),
    personagens: p.personagens.map((um) => ({ classe: um.classe, atributos: um.atributos, habilidades: um.habilidades, ativas: um.ativas, equipamento: um.equipamento })),
    missao: p.missaoAtiva,
    conquistas: p.conquistas,
  })
  conferir('depois de recarregar, ouro, Mochila, personagens, missão e conquistas continuam iguais', JSON.stringify(resumo(antesDeRecarregar)) === JSON.stringify(resumo(depoisDeRecarregar)))

  const erros = await aba.avaliar(`window.__erros ?? []`)
  conferir('nenhum erro no console', erros.length === 0, erros.slice(0, 5))
} catch (erro) {
  estado.falhas++
  console.log('  ERRO', erro.message)
  await aba?.print('erro').catch(() => {})
}

parar()
console.log(`\n${estado.total - estado.falhas} de ${estado.total} conferências passaram${estado.falhas ? `; ${estado.falhas} falharam` : ''}. Prints em ${PASTA}`)
await desligar(estado.falhas ? 1 : 0)
