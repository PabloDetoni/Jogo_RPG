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
// Fase 4.5: os itens são quadradinhos (o nome fica no aria-label) e os botões apagados dizem o motivo embaixo
const clicarItem = async (nome, seletor = '') => {
  const achou = await aba.avaliar(`(() => {
    const alvo = [...document.querySelectorAll(${JSON.stringify(`${seletor} button.slot`)})].find((b) => (b.getAttribute('aria-label') ?? '').startsWith(${JSON.stringify(nome)}))
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
  if (!achou) throw new Error(`não achei o item "${nome}"`)
  await pausa(220)
}
const motivo = (seletor = '') => aba.avaliar(`document.querySelector(${JSON.stringify(`${seletor} .motivo-do-botao`)})?.textContent ?? ''`)
const desativado = (texto) =>
  aba.avaliar(`(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(${JSON.stringify(texto)})); return b ? b.disabled : null })()`)
// Contratar pela carta da classe e assinar o contrato
const contratar = async (classe) => {
  const achou = await aba.avaliar(`(() => { const b = document.querySelector('[aria-label^=${JSON.stringify(`${classe}:`)}] .botao-de-acao'); if (!b || b.disabled) return false; b.click(); return true })()`)
  if (!achou) throw new Error(`não achei o Contratar de ${classe}`)
  await pausa(220)
  await passo('Assinar o contrato')
}
// Aceitar a missão pelo cartaz dela no quadro
const aceitarMissao = async (titulo) => {
  const achou = await aba.avaliar(`(() => { const b = document.querySelector('[aria-label=${JSON.stringify(titulo)}] .botao-de-acao'); if (!b || b.disabled) return false; b.click(); return true })()`)
  if (!achou) throw new Error(`não achei o Aceitar da missão "${titulo}"`)
  await pausa(250)
}
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
  await clicarItem('Pergaminho de redefinição')
  conferir(
    'comprar sem ouro: o botão fica apagado e diz o motivo (nada é comprado)',
    (await desativado('Comprar por 300')) === true && (await motivo()).startsWith('Ouro insuficiente: custa 300 e você tem 0'),
    await motivo(),
  )
  conferir('na grade, a oferta que o ouro não paga fica apagada', await aba.avaliar(`!!document.querySelector('button.slot.slot-apagado[aria-label^="Pergaminho de redefinição"]')`))
  // Catálogo de quem acabou de começar: tudo do beta, quase tudo ainda em silhueta (nunca encontrado)
  await passo('Catálogo')
  const catalogoNovo = await aba.avaliar(`({ total: document.querySelectorAll('.balcao-grade button.slot').length, silhuetas: document.querySelectorAll('.balcao-grade button.slot-silhueta').length })`)
  conferir('Catálogo no começo: tudo do beta, e o que nunca foi encontrado em silhueta', catalogoNovo.total >= 40 && catalogoNovo.silhuetas === catalogoNovo.total, catalogoNovo)
  await irAoReino()
  await passo('Itens de teste', true)
  await passo('Itens de teste', true) // duas vezes: ouro para os contratos
  await pausa(300)
  const comItens = await salvo()
  conferir('itens de teste na Mochila e ouro (só no npm run dev)', comItens?.ouro === 2000 && quantos(comItens, 'pocaoDeVida') === 6, { ouro: comItens?.ouro })

  console.log('3. TEST-006, caso 6: contrato permanente com o temporário da mesma classe ativo')
  await passo('Guilda')
  await passo('Contrato temporário')
  await contratar('Guerreiro')
  await passo('Contrato permanente')
  conferir(
    'a carta do Guerreiro avisa que encerra o temporário',
    (await aba.avaliar(`document.querySelector('[aria-label="Guerreiro: Contrato permanente"]')?.textContent ?? ''`)).includes('encerra o contrato temporário'),
  )
  await contratar('Guerreiro')
  await pausa(150)
  const contratado = await salvo()
  conferir('o permanente entra e o temporário da mesma classe vai embora', contratado.personagens.some((p) => p.classe === 'guerreiro') && !contratado.contratosTemporarios.some((c) => c.classe === 'guerreiro'), {
    personagens: contratado.personagens.map((p) => p.classe),
    temporarios: contratado.contratosTemporarios,
  })

  console.log('4. TEST-006, caso 2: vender e recomprar')
  await irAoReino()
  await passo('Mercado')
  await passo('Vender')
  await clicarItem('Poção de vida')
  const antesDeVender = await salvo()
  await passo('Vender 1 por', true)
  const vendeu = await salvo()
  conferir('vender soma metade do preço ao ouro e tira 1 da Mochila', vendeu.ouro === antesDeVender.ouro + 12 && quantos(vendeu, 'pocaoDeVida') === quantos(antesDeVender, 'pocaoDeVida') - 1, {
    ouro: [antesDeVender.ouro, vendeu.ouro],
  })
  await passo('Comprar')
  await clicarItem('Poção de vida')
  await passo('Comprar por 25', true)
  const recomprou = await salvo()
  conferir('recomprar desconta o preço cheio e a poção volta', recomprou.ouro === vendeu.ouro - 25 && quantos(recomprou, 'pocaoDeVida') === quantos(antesDeVender, 'pocaoDeVida'), { ouro: recomprou.ouro })
  conferir('a compra confirma o que aconteceu ("Você comprou 1 Poção de vida · −25 de ouro")', await mensagem().then((texto) => texto.includes('Você comprou 1 Poção de vida · −25 de ouro')), await mensagem())
  await aba.print('01-mercado')

  console.log('5. TEST-006, caso 3: missão de entrega depois de vender os itens')
  await irAoReino()
  await passo('Guilda')
  await passo('Missões')
  await aceitarMissao('Peles para o curtidor')
  conferir('aceitou a missão de entrega e ela já conta as peles da Mochila', (await aba.texto()).includes('Entregar 4 Pele de lobo (4/4)'))
  await irAoReino()
  await passo('Mercado')
  await passo('Vender')
  await clicarItem('Pele de lobo')
  await passo('Vender todos', true)
  await irAoReino()
  await passo('Guilda')
  conferir('vendidas as peles, a entrega fica incompleta de novo', (await aba.texto()).includes('Entregar 4 Pele de lobo (0/4)'))
  conferir(
    'entregar sem os itens: o botão fica apagado e explica (a recompensa não entra)',
    (await desativado('Entregar:')) === true && (await motivo('.missao-ativa')).includes('ainda não foi cumprida'),
    await motivo('.missao-ativa'),
  )

  console.log('6. Mochila: descartar com confirmação')
  await irAoReino()
  await passo('Mochila')
  await clicarItem('Tônico ligeiro')
  await passo('Descartar…')
  conferir('descartar pede a quantidade e confirma o item, quantos e o que acontece', (await aba.texto()).includes('Quantos?') && (await aba.avaliar(`document.querySelector('.descartar-confirmacao')?.textContent ?? ''`)).includes('Descartar 1 Tônico ligeiro? Ele some para sempre'))
  const antesDeDescartar = quantos(await salvo(), 'tonicoLigeiro')
  await passo('Sim, descartar 1')
  conferir('confirmado, o item sai da Mochila, com a confirmação do que aconteceu', quantos(await salvo(), 'tonicoLigeiro') === antesDeDescartar - 1 && (await mensagem()).startsWith('Você descartou 1 Tônico ligeiro'))

  console.log('7. TEST-006, caso 5: arma de outra classe; Forja comprar e fabricar')
  await irAoReino()
  await passo('Forja')
  conferir('no alto, a trilha mostra onde se está ("Reino › Forja › Equipar")', (await aba.avaliar(`document.querySelector('.trilha')?.innerText.replace(/\s+/g, ' ') ?? ''`)) === 'Reino › Forja › Equipar')
  conferir('na primeira visita, a dica curta da tela aparece', await aba.avaliar(`!!document.querySelector('.dica-da-tela')`))
  await aba.apertar('esc')
  conferir('Esc fecha a dica e fica na Forja', !(await aba.avaliar(`!!document.querySelector('.dica-da-tela')`)) && (await aba.titulo()) === 'Forja')
  await passo('?')
  conferir('o "?" reabre a dica', await aba.avaliar(`!!document.querySelector('.dica-da-tela')`))
  await passo('Entendi')
  const arcosAntes = quantos(await salvo(), 'arcoDeCaca')
  await aba.avaliar(`(() => { document.querySelector('button[aria-label^="Arma:"]').click(); return true })()`)
  await pausa(200)
  conferir('o boneco mostra os 7 espaços em volta', (await aba.avaliar(`document.querySelectorAll('.boneco-da-forja .espaco-do-boneco').length`)) === 7)
  await clicarItem('Espada curta', '.forja-equipar')
  conferir(
    'equipar arma de outra classe: apagada na grade, e o botão apagado explica',
    (await desativado('Equipar Espada curta')) === true && (await motivo('.forja-equipar')) === 'Espada curta é só para Guerreiro.',
    await motivo('.forja-equipar'),
  )
  await clicarItem('Arco de caça', '.forja-equipar')
  conferir(
    'antes de equipar, a comparação mostra a Agilidade subindo (em verde)',
    await aba.avaliar(`[...document.querySelectorAll('.comparacao .mudanca-boa')].some((m) => m.textContent.startsWith('Agilidade'))`),
  )
  await passo('Equipar Arco de caça')
  const equipou = await salvo()
  conferir('a arma da própria classe é equipada e sai da Mochila', equipou.personagens.find((p) => p.classe === 'arqueiro').equipamento.arma === 'arcoDeCaca' && quantos(equipou, 'arcoDeCaca') === arcosAntes - 1)
  await passo('Fabricar')
  // As peles foram vendidas no caso 3: o Elmo de ferro (que pede 1) diz o que falta; as Manoplas de ferro saem
  await clicarItem('Elmo de ferro', '.balcao')
  conferir(
    'fabricar sem os materiais: o botão fica apagado, diz o que falta e nada é gasto',
    (await desativado('Fabricar Elmo de ferro')) === true && (await motivo('.balcao')) === 'Falta 1 Pele de lobo.' && (await salvo()).ouro === equipou.ouro,
    await motivo('.balcao'),
  )
  conferir('a receita mostra os materiais com o que tem (em vermelho o que falta)', await aba.avaliar(`!!document.querySelector('.receita .troca-item-falta')`))
  await clicarItem('Manoplas de ferro', '.balcao')
  await passo('Fabricar Manoplas de ferro')
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
  await aba.apertar('esc')
  await pausa(200)
  conferir('Esc faz o mesmo que o Voltar: da Forja ao Reino', (await aba.titulo()) === 'Reino')

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
  await passo('Abandonar', true)
  await passo('Sim, abandonar')
  await aceitarMissao('Caçar lobos')
  await irAoReino()
  await passo('Jogar')
  await passo('Floresta')
  await aba.esperarTela('Preparação')
  await clicarItem('Poção de vida', '.mochila-da-preparacao')
  await clicarItem('Poção de vida', '.mochila-da-preparacao')
  conferir(
    'Preparação: clicar à esquerda leva para a mochila da partida, e a barra mostra o peso',
    (await aba.avaliar(`!!document.querySelector('.mochila-da-preparacao button.slot[aria-label^="Poção de vida: levando 2"]')`)) &&
      (await aba.avaliar(`document.querySelector('.mochila-da-preparacao .barra-texto')?.textContent ?? ''`)).startsWith('Peso 2 de'),
  )
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
  // Descartar na partida (ajustes de 14/10): DADO 3 poções QUANDO descarto 2 ENTÃO fica 1 e 2 caem no chão com 30 s
  await cena(`(() => { c.mochila.itens.find((i) => i.id === 'pocaoDeVida').quantidade += 2; return true })()`)
  await pausa(400)
  await passo('Descartar…')
  await passo('+')
  conferir('na partida, a confirmação diz que as 2 poções caem no chão', (await aba.avaliar(`document.querySelector('.descartar-confirmacao')?.textContent ?? ''`)).includes('Descartar 2 Poção de vida? Caem no chão perto do Líder'))
  await passo('Sim, descartar 2')
  await pausa(300)
  const descartou = await cena(`({ naMochila: c.mochila.itens.find((i) => i.id === 'pocaoDeVida')?.quantidade ?? 0, noChao: c.itensNoChao.filter((i) => i.item.id === 'pocaoDeVida').map((i) => ({ q: i.quantidade, falta: i.expiraEm - c.agora, perto: Math.hypot(i.x - c.lider.x, i.y - c.lider.y) < 80 })) })`)
  conferir('descartadas 2 de 3: fica 1 na mochila e 2 caem perto do Líder, com o tempo de 30 s', descartou.naMochila === 1 && descartou.noChao.length === 1 && descartou.noChao[0].q === 2 && descartou.noChao[0].falta > 28000 && descartou.noChao[0].falta <= 30000 && descartou.noChao[0].perto, descartou)
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
  await passo('Abandonar', true)
  await passo('Sim, abandonar')
  await aceitarMissao('O Guardião da Floresta')
  await irAoReino()
  await passo('Mercado')
  await clicarItem('Poção de vida')
  for (let i = 0; i < 400 && (await salvo()).ouro >= 25; i++) await clicar('Comprar por 25', true)
  await pausa(300)
  const pobre = await salvo()
  await irAoReino()
  await passo('Guilda')
  await passo('Abandonar', true)
  conferir('o aviso mostra a multa e que o ouro vai ficar em zero', (await aba.texto()).includes('o ouro vai ficar em zero'), pobre.ouro)
  await passo('Sim, abandonar')
  const abandonou = await salvo()
  conferir('com ouro abaixo da multa, o ouro fica em zero e a missão sai', abandonou.ouro === 0 && abandonou.missaoAtiva === null, { antes: pobre.ouro, depois: abandonou.ouro })

  console.log('11b. Interface (Fase 4.5): filtros, trocas, Catálogo, o "?" e o aviso de conquista')
  await irAoReino()
  await passo('Mochila')
  const todos = await aba.avaliar(`document.querySelectorAll('.balcao-grade button.slot').length`)
  await passo('Consumíveis', true)
  const consumiveis = await aba.avaliar(`[...document.querySelectorAll('.balcao-grade button.slot')].map((b) => b.getAttribute('aria-label'))`)
  conferir(
    'Mochila: o filtro Consumíveis deixa só poções e aceleradores',
    consumiveis.length > 0 && consumiveis.length < todos && consumiveis.every((nome) => /^(Poção|Tônico|Elixir)/.test(nome)),
    { todos, consumiveis },
  )
  await irAoReino()
  await passo('Mercado')
  await passo('Trocar')
  conferir(
    'Trocar: cada troca mostra "você dá" ⇄ "você recebe", e a que falta item fica com o botão apagado e o motivo',
    (await aba.avaliar(`document.querySelectorAll('.troca').length`)) >= 3 && (await aba.avaliar(`!!document.querySelector('.troca .motivo-do-botao')`)),
  )
  await passo('Catálogo')
  const catalogo = await aba.avaliar(`({ total: document.querySelectorAll('.balcao-grade button.slot').length, silhuetas: document.querySelectorAll('.balcao-grade button.slot-silhueta').length, texto: document.querySelector('.balcao-grade .nota')?.textContent ?? '' })`)
  conferir('Catálogo depois dos itens de teste: tudo encontrado, nada em silhueta (os vistos ficam no save)', catalogo.total >= 40 && catalogo.silhuetas === 0 && catalogo.texto.includes(`Você já encontrou ${catalogo.total} de ${catalogo.total}`), catalogo)
  await aba.print('06-catalogo')
  await passo('?')
  conferir('o "?" abre a explicação da tela', (await aba.avaliar(`document.querySelector('[role=dialog]')?.getAttribute('aria-label') ?? ''`)) === 'Como funciona: Mercado')
  await aba.apertar('esc')
  conferir('Esc fecha a explicação', !(await aba.avaliar(`!!document.querySelector('[role=dialog]')`)))
  await irAoReino()
  await passo('Mochila')
  await aba.avaliar(`(() => { [...document.querySelectorAll('.avisos .aviso button')].forEach((b) => b.click()); return true })()`)
  await passo('Itens de teste', true) // +1000 de ouro: pode concluir a conquista "Cofre cheio"
  await pausa(300)
  const conquista = await aba.avaliar(`!!document.querySelector('.avisos-de-conquista .aviso-de-conquista')`)
  if (conquista) {
    await pausa(6500)
    conferir('o aviso de conquista fica no canto e some sozinho', !(await aba.avaliar(`!!document.querySelector('.avisos-de-conquista .aviso-de-conquista')`)))
  }

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
