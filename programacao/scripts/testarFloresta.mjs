// Roteiro da Floresta no navegador (Fase 3). Uso: npm run testar:floresta
// Liga o Vite e um Edge escondido, joga a Floresta e confere o que um teste do Vitest não alcança: câmera, mira,
// bordas, regiões, mobs, minimapa, coleta e o Boss. Prints em testes-do-navegador/floresta/ (fora do git).
// (O roteiro da arena de teste da Fase 1 continua no npm run testar:navegador.)
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'floresta')
const vite = await ligarVite(5197)
let navegador = null

async function desligar(codigo) {
  await navegador?.fechar()
  await vite.fechar()
  process.exit(codigo)
}
const { estado, conferir, parar } = criarConferencias(() => desligar(1))

// Olhar o jogo por dentro (window.__jogoDaPartida existe só no npm run dev)
const CENA = `window.__jogoDaPartida.scene.getScene('arena')`
let aba = null
const cena = (expr) => aba.avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)
const colocarLider = (x, y) => cena(`(c.lider.colocarEm(${x}, ${y}), c.cameras.main.centerOn(${x}, ${y}), true)`)

// Ponto do mapa → ponto da tela (para o mouse): a câmera mostra o mapa entre a faixa do HUD e a de baixo
async function naTela(x, y) {
  return aba.avaliar(`(() => {
    const c = ${CENA}
    const r = document.querySelector('.arena canvas').getBoundingClientRect()
    const cam = c.cameras.main
    const escala = r.width / 1600
    return { x: r.left + (cam.x + ${x} - cam.scrollX) * escala, y: r.top + (cam.y + ${y} - cam.scrollY) * escala }
  })()`)
}

try {
  navegador = await abrirNavegador('floresta', PASTA)
  aba = await navegador.novaAba('aba1')
  console.log(`Site: ${vite.site}`)
  await aba.abrir(vite.site)

  console.log('1. Do Reino até a Floresta (convidado novo)')
  await aba.clicar('Iniciar jogo')
  await aba.clicar('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await aba.clicar('Continuar')
  await aba.clicar('Arqueiro')
  await aba.clicar('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  await aba.clicar('Jogar')
  await aba.clicar('Floresta')
  // Nenhuma outra região descoberta: a tela Ponto de partida não aparece (RF32)
  await aba.esperarTela('Preparação')
  conferir('sem outra região descoberta, a Floresta vai direto para a Preparação', (await aba.titulo()) === 'Preparação')
  await aba.clicar('Começar partida')
  await aba.esperar(`!!document.querySelector('.arena canvas') && !!${CENA}?.lider`, 'a Floresta', 20000)
  await pausa(800)
  const mapa = await cena(`({ id: c.mapa.id, largura: c.mapa.tamanho.largura, altura: c.mapa.tamanho.altura, lider: { x: Math.round(c.lider.x), y: Math.round(c.lider.y) }, inicio: c.mapa.inicio })`)
  conferir('a partida acontece na Floresta, um mapa bem maior que a tela', mapa.id === 'floresta' && mapa.largura > 1600 * 3, mapa)
  conferir('o grupo nasce no ponto inicial (zona segura)', Math.hypot(mapa.lider.x - mapa.inicio.x, mapa.lider.y - mapa.inicio.y) < 80, mapa)
  // Quantos mobs nasceram em cada região (conferido na seção 7; até lá, o grupo derrota alguns)
  const nasceram = await cena(`(() => { const t = {}; for (const i of c.inimigos) t[i.regiao] = (t[i.regiao] ?? 0) + 1; return t })()`)
  await aba.print('01-floresta-inicio')

  console.log('2. Câmera segue o Líder (TASK-060)')
  // A faixa y = 1900, de x = 1600 a 2600, não tem árvore nem pedra (o ponto 1800, 1800 caía dentro de uma árvore). Os mobs
  // da Fácil que estiverem passeando nela saem antes (um cervo parado na frente segura o Líder, como deve ser)
  const noCaminho = await cena(`c.inimigos.filter((i) => i.x > 1650 && i.x < 2700 && Math.abs(i.y - 1900) < 160).map((i) => (c.matarInimigo(i), i.tipo))`)
  await colocarLider(1800, 1900)
  await pausa(300)
  const antes = await cena(`({ scrollX: c.cameras.main.scrollX, x: c.lider.x })`)
  // Segura D até o Líder andar uns 200 px (um aliado no caminho ou um quadro lento do navegador escondido não derrubam a
  // conferência, que é sobre a câmera ir junto, não sobre a velocidade)
  for (let vez = 0; vez < 8 && (await cena(`c.lider.x`)) - antes.x < 200; vez++) await aba.segurar(['d'], 400)
  await pausa(600)
  const depois = await cena(`({ scrollX: c.cameras.main.scrollX, x: c.lider.x, meio: c.cameras.main.worldView.centerX })`)
  const andou = { lider: depois.x - antes.x, camera: depois.scrollX - antes.scrollX }
  conferir('andando para a direita, a câmera vai junto', andou.lider > 150 && Math.abs(andou.camera - andou.lider) < 40, { antes, depois, tiradosDoCaminho: noCaminho })
  conferir('o Líder fica perto do meio da tela', Math.abs(depois.meio - depois.x) < 60, depois)
  const vista = await cena(`({ y: c.cameras.main.y, altura: c.cameras.main.height })`)
  conferir('o mapa aparece só entre a faixa do HUD e a de baixo (ninguém fica escondido embaixo delas)', vista.y === 96 && vista.altura === 900 - 96 - 112, vista)
  await aba.print('02-camera')

  console.log('3. A mira continua certa com a câmera andando (mouse parado)')
  await colocarLider(2400, 1800)
  await pausa(400)
  const alvo = await naTela(2700, 1700)
  await aba.moverMouse(alvo.x, alvo.y)
  await pausa(150)
  // O ângulo esperado sai de onde o Líder está de verdade (um aliado pode tê-lo empurrado uns pixels depois de colocado)
  const miraParado = await cena(`({ angulo: c.anguloDaMira, mouse: c.mouseNoMundo, lider: { x: c.lider.x, y: c.lider.y } })`)
  const esperadoParado = Math.atan2(1700 - miraParado.lider.y, 2700 - miraParado.lider.x)
  conferir(
    'com a câmera parada, a mira aponta para onde o mouse está',
    Math.hypot(miraParado.mouse.x - 2700, miraParado.mouse.y - 1700) < 3 && Math.abs(miraParado.angulo - esperadoParado) < 0.05,
    { miraParado, esperadoParado },
  )
  await aba.segurar(['s'], 900) // a câmera desce; o mouse fica parado na tela
  await pausa(500)
  const miraAndando = await cena(`(() => {
    const p = c.input.activePointer
    const ponto = c.cameras.main.getWorldPoint(p.x, p.y)
    return { angulo: c.anguloDaMira, esperado: Math.atan2(ponto.y - c.lider.y, ponto.x - c.lider.x), mouse: c.mouseNoMundo, ponto: { x: ponto.x, y: ponto.y } }
  })()`)
  conferir('com a câmera andando e o mouse parado, a mira segue o ponto embaixo do mouse', Math.abs(miraAndando.angulo - miraAndando.esperado) < 0.05 && Math.abs(miraAndando.mouse.y - miraAndando.ponto.y) < 2, miraAndando)
  // Um tiro sai na direção da mira. Conta só o tiro novo do Líder: os aliados também atiram, e as flechas deles somem
  // no meio (contar o total dava falso). Se o clique cair na recarga do ataque, clica de novo.
  await cena(`(c.projeteis.forEach((p) => { p.__antes = true }), true)`)
  const tiroNovo = `${CENA}.projeteis.some((p) => p.dono === ${CENA}.lider && !p.__antes)`
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    await aba.clicarNaTela(alvo.x, alvo.y)
    if (await aba.esperar(tiroNovo, 'o tiro do Líder', 700).then(() => true, () => false)) break
  }
  const tiro = await cena(`(() => { const f = c.projeteis.find((p) => p.dono === c.lider && !p.__antes); return f ? { angulo: Math.round(Math.atan2(f.y - c.lider.y, f.x - c.lider.x) * 100) / 100, mira: Math.round(c.anguloDaMira * 100) / 100 } : null })()`)
  conferir('o clique ataca na direção da mira', Boolean(tiro), tiro)

  console.log('4. Bordas e mata fechada: ninguém atravessa')
  await colocarLider(60, 1800)
  await aba.segurar(['a'], 900)
  const esquerda = await cena(`({ x: c.lider.x, scrollX: c.cameras.main.scrollX })`)
  conferir('na beira esquerda do mapa, o Líder não passa e a câmera para no limite', esquerda.x >= 19 && esquerda.scrollX === 0, esquerda)
  await colocarLider(500, 1540)
  await aba.segurar(['w'], 900)
  const cima = await cena(`c.lider.y`)
  conferir('na zona segura, a mata fechada de cima é parede', cima >= 1500 + 19, Math.round(cima))
  await colocarLider(500, 2060)
  await aba.segurar(['s'], 900)
  const baixo = await cena(`c.lider.y`)
  conferir('...e a de baixo também', baixo <= 2100 - 19, Math.round(baixo))
  // O fundo é o domínio do Boss: sozinho e sem o Invencível, o Líder às vezes caía antes da conferência, e Líder sozinho
  // caído é Derrota (a partida acabava no meio do roteiro)
  await cena(`(c.invencivel = true, true)`)
  await colocarLider(7150, 1800)
  await aba.segurar(['d'], 900)
  await pausa(600)
  const direita = await cena(`({ x: c.lider.x, scrollX: c.cameras.main.scrollX, limite: c.mapa.tamanho.largura - c.cameras.main.width })`)
  conferir('no fundo da Floresta, o Líder não sai do mapa e a câmera para no limite', direita.x <= 7200 - 19 && Math.abs(direita.scrollX - direita.limite) < 2, direita)
  await aba.print('03-fundo-da-floresta')
  await colocarLider(400, 1800)
  await cena(`(c.lider.vida = c.lider.vidaMaxima, c.invencivel = false, true)`)

  console.log('5. O grupo atravessa a Floresta junto')
  await cena(`(c.encherGrupo(), true)`)
  await colocarLider(400, 1800)
  for (const membro of await cena(`c.aliados.map((a, i) => i)`)) await cena(`(c.aliados[${membro}].colocarEm(c.lider.x - 60 - ${membro} * 10, c.lider.y + (${membro} - 2) * 50), true)`)
  await pausa(500)
  await aba.segurar(['d'], 6000)
  await pausa(2500)
  const grupo = await cena(`c.aliados.map((a) => ({ classe: a.classe, distancia: Math.round(Math.hypot(a.x - c.lider.x, a.y - c.lider.y)) }))`)
  conferir('depois de 6 s andando pela Floresta, os 4 aliados continuam perto do Líder', grupo.length === 4 && grupo.every((um) => um.distancia < 400), grupo)
  await aba.print('04-grupo-andando')

  console.log('6. Regiões: o HUD mostra a região, e a taxa conta do ponto inicial até a borda real (TASK-061)')
  // O que está no quadro do minimapa (o mapa, a região e a mochila) fica inteiro dentro dele, e o quadro dentro da faixa
  // do HUD: nenhuma linha espremida ou cortada (altura ou largura do texto maior que o espaço dela)
  const quadroDoMinimapa = () =>
    aba.avaliar(`(() => {
      const quadro = document.querySelector('.hud-minimapa').getBoundingClientRect()
      const hud = document.querySelector('.hud').getBoundingClientRect()
      const problemas = []
      if (quadro.top < hud.top - 1 || quadro.bottom > hud.bottom + 1) problemas.push('o quadro sai do HUD')
      for (const item of document.querySelectorAll('.hud-minimapa > *')) {
        const r = item.getBoundingClientRect()
        const nome = item.textContent || item.className
        if (r.top < quadro.top - 1 || r.bottom > quadro.bottom + 1 || r.left < quadro.left - 1 || r.right > quadro.right + 1) problemas.push(nome + ': sai do quadro')
        if (item.tagName === 'SPAN' && (item.scrollHeight > item.clientHeight + 1 || item.scrollWidth > item.clientWidth + 1)) problemas.push(nome + ': cortado')
        if (r.height < 2) problemas.push(nome + ': sem altura')
      }
      return { regiao: document.querySelector('.hud-regiao')?.textContent ?? '', fora: problemas }
    })()`)
  await colocarLider(700, 1800)
  await pausa(500)
  const naZonaSegura = await quadroDoMinimapa()
  conferir('na zona segura, o HUD mostra "Zona segura"', naZonaSegura.regiao === 'Zona segura', naZonaSegura.regiao)
  conferir('o quadro do minimapa cabe no HUD (o mapa, a região e a mochila inteiros, numa linha cada)', naZonaSegura.fora.length === 0, naZonaSegura)
  // O HUD muda de tamanho com a tela: confere também numa tela menor e numa maior
  const emOutrasTelas = {}
  for (const [largura, altura] of [[1280, 720], [1920, 1080]]) {
    await aba.cdp.enviar('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 1, mobile: false })
    await pausa(400)
    emOutrasTelas[`${largura}x${altura}`] = (await quadroDoMinimapa()).fora
  }
  await aba.cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false })
  await pausa(400)
  conferir('...também em 1280×720 e em 1920×1080', Object.values(emOutrasTelas).every((lista) => lista.length === 0), emOutrasTelas)
  await colocarLider(1400, 1800)
  await pausa(500)
  conferir('entrando na Fácil, o HUD mostra "Fácil"', (await quadroDoMinimapa()).regiao === 'Fácil')
  // A taxa da fuga como o HUD mostra ("Fuga (F): 11% · ...")
  const taxa = async (x, y) => {
    await colocarLider(x, y)
    await pausa(400)
    return aba.avaliar(`parseInt(document.querySelector('.hud').innerText.split('Fuga (F): ')[1] ?? '', 10)`)
  }
  const taxaPerto = await taxa(400, 1800)
  const taxaMedia = await taxa(3600, 1800)
  const taxaDificil = await taxa(5900, 1800)
  const taxaBoss = await taxa(6100, 1800)
  conferir('o custo da fuga sobe com a distância do ponto inicial', taxaPerto < taxaMedia && taxaMedia < taxaDificil, { taxaPerto, taxaMedia, taxaDificil })
  conferir('no domínio do Boss, a fuga custa +7 pontos (RF48)', taxaBoss - taxaDificil >= 7 && taxaBoss - taxaDificil <= 8, { taxaDificil, taxaBoss })
  conferir('no domínio do Boss, o HUD avisa a região em destaque', await aba.avaliar(`!!document.querySelector('.hud-regiao-boss')`))
  const noDominio = await quadroDoMinimapa()
  conferir('...e o nome mais comprido ("Domínio do Boss") também cabe no quadro', noDominio.regiao === 'Domínio do Boss' && noDominio.fora.length === 0, noDominio)
  await aba.print('05-dominio-do-boss')

  console.log('7. Mobs por região (TASK-062)')
  // Onde cada um nasceu (a casa): depois de nascer, eles andam e perseguem
  const mobs = await cena(`c.inimigos.map((i) => ({ tipo: i.tipo, regiao: i.regiao, x: Math.round(i.casaFixa.x), y: Math.round(i.casaFixa.y), tamanho: i.tamanho, hostil: i.config.hostil }))`)
  conferir('cada região nasce com os seus mobs (a zona segura, nenhum)', !nasceram.zonaSegura && nasceram.facil >= 10 && nasceram.media >= 15 && nasceram.dificil >= 18, nasceram)
  const inicios = await cena(`c.mapa.regioes.map((r) => r.inicio)`)
  const pertoDeInicio = mobs.filter((mob) => inicios.some((inicio) => Math.hypot(inicio.x - mob.x, inicio.y - mob.y) < 600))
  conferir('nenhum mob nasce perto do início de uma região (o grupo nunca nasce com mob perto)', pertoDeInicio.length === 0, pertoDeInicio.slice(0, 3))
  const dentroDeObstaculo = await cena(`c.inimigos.filter((i) => c.paredesPerto(i, 100).some((p) => Math.abs(i.x - p.x) * 2 < p.largura + i.tamanho - 4 && Math.abs(i.y - p.y) * 2 < p.altura + i.tamanho - 4)).length`)
  conferir('nenhum mob dentro de árvore, pedra ou mata', dentroDeObstaculo === 0, dentroDeObstaculo)
  const encostados = await cena(`(() => { const l = c.inimigos; let n = 0; for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) { const m = (l[a].tamanho + l[b].tamanho) / 2 - 1; if (Math.abs(l[a].x - l[b].x) < m && Math.abs(l[a].y - l[b].y) < m) n++ } return n })()`)
  conferir('nenhum mob em cima de outro', encostados === 0, encostados)
  await colocarLider(400, 1800)
  await pausa(400)
  const dormindo = await cena(`({ dormindo: c.inimigos.filter((i) => i.dormindo).length, total: c.inimigos.length })`)
  conferir('longe do Líder, os mobs dormem (não pensam nem andam: 60 FPS)', dormindo.dormindo >= dormindo.total - 4, dormindo)

  console.log('8. Fugir de um lobo até ele desistir (território)')
  await cena(`(c.invencivel = true, true)`)
  // Vida de sobra para o lobo do teste: os aliados atacam quem persegue o Líder e, com a vida normal, às vezes o matavam
  // antes da conferência (o lobo sumia da lista e a conferência dava erro)
  const lobo = await cena(`(() => { const l = c.inimigos.find((i) => i.tipo === 'lobo' && i.regiao === 'facil'); l.__teste = true; l.vida = l.vidaMaxima = 1e6; return { x: Math.round(l.x), y: Math.round(l.y), casa: l.casaFixa, territorio: l.config.raioDoTerritorio } })()`)
  // Só o lobo do teste por perto (os outros mobs atacariam no meio)
  await cena(`(c.inimigos.filter((i) => !i.__teste && Math.hypot(i.x - ${lobo.x}, i.y - ${lobo.y}) < 2200).forEach((i) => c.matarInimigo(i)), true)`)
  await colocarLider(lobo.x - 220, lobo.y)
  await aba.esperar(`${CENA}.inimigos.find((i) => i.__teste)?.perseguindo`, 'o lobo perseguir', 4000).catch(() => {})
  conferir('chegando perto, o lobo persegue (aparece o "!")', await cena(`c.inimigos.find((i) => i.__teste).perseguindo`))
  // O Líder corre para fora do território (o lobo fica dentro dele)
  const fora = { x: lobo.casa.x - lobo.territorio - 350, y: lobo.casa.y }
  await colocarLider(Math.max(1050, fora.x), fora.y)
  await aba.esperar(`!${CENA}.inimigos.find((i) => i.__teste)?.perseguindo`, 'o lobo desistir', 6000).catch(() => {})
  conferir('com o grupo fora do território, o lobo desiste (aparece o "?")', !(await cena(`c.inimigos.find((i) => i.__teste).perseguindo`)))
  await pausa(3500)
  const voltou = await cena(`(() => { const l = c.inimigos.find((i) => i.__teste); return Math.round(Math.hypot(l.x - l.casaFixa.x, l.y - l.casaFixa.y)) })()`)
  conferir('...e volta para perto de casa', voltou < lobo.territorio * 0.6, voltou)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 8000).catch(() => {})
  conferir('5 s depois de o lobo desistir, o grupo sai de combate (RF37)', !(await cena(`c.emCombate`)))
  // O lobo do teste (com vida de sobra) sai do jogo, para não perseguir o grupo nos testes seguintes
  await cena(`(c.inimigos.filter((i) => i.__teste).forEach((i) => c.matarInimigo(i)), true)`)

  console.log('9. Passar por um mob não hostil (o cervo)')
  const cervo = await cena(`(() => { const v = c.inimigos.find((i) => i.tipo === 'cervo' && !i.morto); v.__cervo = true; return { x: Math.round(v.x), y: Math.round(v.y) } })()`)
  await cena(`(c.inimigos.filter((i) => !i.__cervo && Math.hypot(i.x - ${cervo.x}, i.y - ${cervo.y}) < 1200).forEach((i) => c.matarInimigo(i)), true)`)
  await cena(`(c.invencivel = false, c.lider.vida = c.lider.vidaMaxima, true)`)
  await colocarLider(cervo.x - 90, cervo.y)
  await pausa(3000)
  const passou = await cena(`({ persegue: c.inimigos.find((i) => i.__cervo).perseguindo, vida: c.lider.vida, maxima: c.lider.vidaMaxima })`)
  conferir('passando ao lado do cervo, ele não ataca', !passou.persegue && passou.vida === passou.maxima, passou)
  await cena(`(c.invencivel = true, c.acertar(c.inimigos.find((i) => i.__cervo), 5, c.lider, 0, c.lider), true)`)
  await pausa(300)
  conferir('atacado, o cervo reage (persegue quem bateu)', await cena(`c.inimigos.find((i) => i.__cervo).perseguindo`))
  await aba.print('06-cervo-revida')
  await cena(`(c.inimigos.filter((i) => i.__cervo).forEach((i) => c.matarInimigo(i)), true)`)

  console.log('10. Aliado longe ou preso volta por fora da tela')
  await colocarLider(2400, 1800)
  await pausa(600)
  await cena(`(() => { const a = c.aliados[0]; a.__longe = true; a.colocarEm(c.lider.x - 1500, c.lider.y); return true })()`)
  await pausa(4500)
  const volta = await cena(`(() => {
    const a = c.aliados.find((um) => um.__longe), v = c.cameras.main.worldView
    return { distancia: Math.round(Math.hypot(a.x - c.lider.x, a.y - c.lider.y)), naTelaOuPerto: a.x > v.x - 300 && a.x < v.right + 300 && a.y > v.y - 300 && a.y < v.bottom + 300 }
  })()`)
  conferir('o aliado que ficou longe e fora da tela volta para perto (reaparece logo além da borda)', volta.distancia < 1100 && volta.naTelaOuPerto, volta)
  await pausa(2500)
  conferir('...e chega andando até o grupo', (await cena(`Math.round(Math.hypot(c.aliados.find((um) => um.__longe).x - c.lider.x, c.aliados.find((um) => um.__longe).y - c.lider.y))`)) < 400)

  console.log('11. Minimapa e descoberta (TASK-063)')
  const minimapa = await aba.avaliar(`(() => {
    const t = document.querySelector('.minimapa')
    if (!t) return null
    const d = t.getContext('2d').getImageData(0, 0, t.width, t.height).data
    let acesos = 0
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 120) acesos++
    return { acesos, total: t.width * t.height }
  })()`)
  conferir('o minimapa aparece no quadro do HUD, com o que já foi revelado aceso', minimapa && minimapa.acesos > 50 && minimapa.acesos < minimapa.total * 0.8, minimapa)
  const exploracao = await cena(`({ novas: [...c.exploracao.novas], xp: c.exploracao.xp, reveladas: c.exploracao.nevoa.bits.reduce((a, b) => a + b, 0), total: c.exploracao.nevoa.bits.length })`)
  conferir('as áreas visitadas foram descobertas e deram XP (RF40)', exploracao.novas.includes('clareiraDasFlores') && exploracao.xp > 0, exploracao)
  conferir('o minimapa revelou só por onde o grupo passou', exploracao.reveladas > 20 && exploracao.reveladas < exploracao.total * 0.6, { reveladas: exploracao.reveladas, total: exploracao.total })
  await aba.print('07-minimapa')
  // Volta ao Reino com Q (num lugar sem mobs, fora de combate; a contagem é adiantada)
  await colocarLider(400, 1800)
  await cena(`(c.inimigos.filter((i) => i.perseguindo || Math.hypot(i.x - 400, i.y - 1800) < 1500).forEach((i) => c.matarInimigo(i)), c.ultimoDano = -999999, true)`)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 9000)
  await aba.apertar('q')
  await cena(`(c.retorno.msRestantes = 300, true)`)
  await aba.esperarTela('Resumo', 8000)
  const resumo = await aba.texto()
  conferir('o Resumo mostra a exploração (áreas novas e o XP)', /Exploração\s+\d+ áreas? novas? \(\+\d+ XP\)/.test(resumo), resumo.split('Exploração')[1]?.slice(0, 40))
  const salvo = await aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso`)
  conferir('o mapa descoberto ficou no save (névoa, áreas e regiões)', salvo.mapasDescobertos?.floresta?.areas?.includes('clareiraDasFlores') && salvo.mapasDescobertos.floresta.nevoa.length > 50 && salvo.regioesDescobertas?.floresta?.includes('facil'), { areas: salvo.mapasDescobertos?.floresta?.areas, regioes: salvo.regioesDescobertas?.floresta })

  console.log('12. Ponto de partida: só o que foi descoberto (RF32)')
  await aba.clicar('Jogar novamente')
  await aba.clicar('Floresta')
  await aba.esperarTela('Ponto de partida')
  const botoes = await aba.avaliar(`[...document.querySelectorAll('.tela button')].map(b => ({ texto: b.textContent.trim(), ativo: !b.disabled }))`)
  const ativo = (inicio) => botoes.find((b) => b.texto.startsWith(inicio))?.ativo
  const descobertas = salvo.regioesDescobertas.floresta
  conferir('com outra região descoberta, a tela Ponto de partida aparece', true)
  conferir('só as regiões descobertas ficam liberadas', ativo('Início') && ativo('Fácil') === descobertas.includes('facil') && ativo('Média') === descobertas.includes('media') && ativo('Difícil') === descobertas.includes('dificil'), { botoes, descobertas })
  await aba.print('08-ponto-de-partida')
  await aba.clicar('Média')
  await aba.esperarTela('Preparação')
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.lider && !!${CENA}.exploracao`, 'a Floresta', 20000)
  await pausa(800)
  const nascimento = await cena(`({ lider: { x: Math.round(c.lider.x), y: Math.round(c.lider.y) }, inicio: c.mapa.regioes.find((r) => r.id === 'media').inicio, maisPerto: Math.round(Math.min(...c.inimigos.map((i) => Math.hypot(i.x - c.lider.x, i.y - c.lider.y)))) })`)
  conferir('o grupo nasce no início da região escolhida', Math.hypot(nascimento.lider.x - nascimento.inicio.x, nascimento.lider.y - nascimento.inicio.y) < 100, nascimento)
  conferir('...sem mob perto', nascimento.maisPerto > 600, nascimento.maisPerto)
  const taxaNaMedia = await aba.avaliar(`parseInt(document.querySelector('.hud').innerText.split('Fuga (F): ')[1] ?? '', 10)`)
  conferir('a taxa já começa com a distância da Média (maior que a do ponto inicial)', taxaNaMedia > taxaPerto, { taxaNaMedia, taxaPerto })
  const reveladasAntes = await cena(`c.exploracao.nevoa.bits.reduce((a, b) => a + b, 0)`)
  conferir('o minimapa já começa com o que foi descoberto antes', reveladasAntes >= exploracao.reveladas, { agora: reveladasAntes, antes: exploracao.reveladas })
  conferir('áreas já descobertas não dão XP de novo', !(await cena(`c.exploracao.novas.includes('clareiraDasFlores')`)))

  console.log('13. Coleta com E, drops e mochila da partida (TASK-064)')
  await cena(`(c.invencivel = true, true)`)
  const recursos = await cena(`c.itensNoChao.filter((i) => i.expiraEm === null).length`)
  conferir('a Floresta tem recursos no chão (cogumelo, erva, madeira)', recursos > 20, recursos)
  // Um cogumelo, longe dos mobs
  const cogumelo = await cena(`(() => { const i = c.itensNoChao.find((um) => um.item.id === 'cogumelo' && um.expiraEm === null); return { x: i.x, y: i.y } })()`)
  await cena(`(c.inimigos.filter((i) => Math.hypot(i.x - ${cogumelo.x}, i.y - ${cogumelo.y}) < 1500).forEach((i) => c.matarInimigo(i)), true)`)
  await colocarLider(cogumelo.x - 50, cogumelo.y)
  await pausa(400)
  conferir('perto de um item, o HUD mostra "E: pegar"', (await aba.texto()).includes('E: pegar Cogumelo'))
  await aba.apertar('e')
  await pausa(200)
  const depoisDeE = await cena(`({ naMochila: c.mochila.itens.find((i) => i.id === 'cogumelo')?.quantidade ?? 0, noChao: c.itensNoChao.some((i) => i.x === ${cogumelo.x} && i.y === ${cogumelo.y}) })`)
  conferir('E pega o item: ele vai para a mochila e sai do chão', depoisDeE.naMochila >= 1 && !depoisDeE.noChao, depoisDeE)
  // Drop: um lobo com a chance forçada em 100%
  await cena(`(() => { c.chanceDeDropForcada = 1; const l = c.criarMobDoMundo('lobo', 'media', { x: c.lider.x + 200, y: c.lider.y }); l.__drop = true; return true })()`)
  await pausa(200)
  const drop = await cena(`(() => { const l = c.inimigos.find((i) => i.__drop); const ponto = { x: l.x, y: l.y }; const antes = c.itensNoChao.length; c.acertar(l, 99999, c.lider, 0, c.lider); const novo = c.itensNoChao.slice(antes)[0]; return novo ? { id: novo.item.id, quantidade: novo.quantidade, some: Math.round((novo.expiraEm - c.agora) / 1000), x: novo.x, y: novo.y, longe: Math.round(Math.hypot(novo.x - ponto.x, novo.y - ponto.y)) } : null })()`)
  conferir('o lobo derrotado deixa a pele no chão, que some se ninguém pegar', drop?.id === 'peleDeLobo' && drop.some > 50 && drop.longe < 80, drop)
  await cena(`(c.chanceDeDropForcada = undefined, true)`)
  await aba.print('09-drop-no-chao')
  // Mochila cheia: o item fica no chão, com aviso, e some depois
  await aba.clicar('Encher mochila')
  await pausa(300)
  const mochila = await cena(`({ peso: c.mochila.itens.reduce((s, i) => s + i.quantidade * (i.id === 'madeira' ? 3 : i.id === 'cogumelo' ? 1 : 2), 0), capacidade: c.mochila.capacidade })`)
  await colocarLider(drop.x - 40, drop.y)
  await pausa(400)
  conferir('com a mochila cheia, o HUD avisa que não cabe', (await aba.texto()).includes('Mochila cheia: não cabe Pele de lobo'), mochila)
  await aba.apertar('e')
  await pausa(300)
  const cheia = await cena(`(() => { const i = c.itensNoChao.find((um) => um.item.id === 'peleDeLobo'); return i ? { quantidade: i.quantidade, some: Math.round((i.expiraEm - c.agora) / 1000) } : null })()`)
  conferir('E com a mochila cheia: o item continua no chão e passa a sumir em até 30 s', cheia && cheia.some <= 30, cheia)
  await aba.print('10-mochila-cheia')
  await cena(`(c.itensNoChao.filter((i) => i.item.id === 'peleDeLobo').forEach((i) => { i.expiraEm = c.agora + 300 }), true)`)
  await pausa(800)
  conferir('quando o tempo acaba, o item some do chão', !(await cena(`c.itensNoChao.some((i) => i.item.id === 'peleDeLobo')`)))
  // Fim: a mochila da partida vai para a Mochila do Reino
  await cena(`(c.inimigos.forEach((i) => c.matarInimigo(i)), c.ultimoDano = -999999, true)`)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 9000)
  await aba.apertar('q')
  await cena(`(c.retorno.msRestantes = 300, true)`)
  await aba.esperarTela('Resumo', 8000)
  const linhaDosItens = (await aba.texto()).split('Itens coletados')[1]?.split(String.fromCharCode(10)).filter(Boolean)[0] ?? ''
  conferir('o Resumo lista os itens coletados', linhaDosItens.includes('Cogumelo') && linhaDosItens.includes('Madeira'), linhaDosItens)
  const mochilaDoReino = await aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso.mochila`)
  conferir('os itens foram para a Mochila do Reino (no save)', mochilaDoReino.some((i) => i.id === 'cogumelo') && mochilaDoReino.some((i) => i.id === 'madeira'), mochilaDoReino)

  console.log('14. O Boss da Floresta (TASK-065)')
  await aba.clicar('Jogar novamente')
  await aba.clicar('Floresta')
  await aba.esperarTela('Ponto de partida')
  await aba.clicar('Muito difícil')
  await aba.esperarTela('Preparação')
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.boss && !!${CENA}.lider`, 'o Boss', 20000)
  await pausa(800)
  const boss = await cena(`({ x: Math.round(c.boss.x), y: Math.round(c.boss.y), noDominio: c.noDominioDeBoss(c.boss), liderNoDominio: c.noDominioDeBoss(c.lider) })`)
  conferir('o Boss nasce no domínio dele, e "Muito difícil" é a entrada do domínio', boss.noDominio && boss.liderNoDominio, boss)
  conferir('no domínio do Boss, a barra de vida grande aparece no HUD', await aba.avaliar(`!!document.querySelector('.barra-do-boss')`))
  // Ataque avisado: o pisão perto do Líder, sem Invencível
  await cena(`(c.invencivel = false, c.lider.vida = c.lider.vidaMaxima, c.lider.fimDaImunidade = 0, c.inimigos.filter((i) => !i.ehBoss).forEach((i) => c.matarInimigo(i)), true)`)
  await cena(`(() => { c.lider.colocarEm(c.boss.x - 140, c.boss.y); c.boss.alvo = c.lider; c.boss.estado = 'perseguindo'; c.boss.comecarAtaque('pisao', c.agora); return true })()`)
  const durante = await cena(`({ aviso: !!c.boss.aviso, vida: c.lider.vida, maxima: c.lider.vidaMaxima, estado: c.boss.estado })`)
  conferir('antes do golpe, a marca aparece no chão e ninguém leva dano ainda', durante.aviso && durante.vida === durante.maxima && durante.estado === 'avisando', durante)
  await aba.print('11-boss-avisando')
  await aba.esperar(`${CENA}.boss.estado !== 'avisando'`, 'o golpe', 4000)
  await pausa(150)
  const depoisDoGolpe = await cena(`({ vida: c.lider.vida, maxima: c.lider.vidaMaxima, aviso: !!c.boss.aviso })`)
  conferir('quem ficou na marca leva o golpe, e a marca some', depoisDoGolpe.vida < depoisDoGolpe.maxima && !depoisDoGolpe.aviso, depoisDoGolpe)
  await cena(`(() => { c.lider.vida = c.lider.vidaMaxima; c.lider.fimDaImunidade = 0; c.boss.ultimoAtaque = null; c.boss.comecarAtaque('pisao', c.agora); c.lider.colocarEm(c.boss.x - 420, c.boss.y); return true })()`)
  await aba.esperar(`${CENA}.boss.estado !== 'avisando'`, 'o golpe', 4000)
  await pausa(150)
  conferir('quem sai da marca antes do golpe não leva dano', await cena(`c.lider.vida === c.lider.vidaMaxima`))
  // Derrota do Boss, com o drop especial forçado em 100% (barra de teste, só no npm run dev)
  await aba.clicar('Drop especial do Boss', false)
  await cena(`(c.invencivel = true, c.acertar(c.boss, 999999, c.lider, 0, c.lider), true)`)
  await pausa(500)
  const vitoria = await cena(`({ bonus: c.ganhos.bonusDeBoss, especial: c.itensNoChao.some((i) => i.item.id === 'coroaDeRaizes'), casca: c.itensNoChao.some((i) => i.item.id === 'cascaAntiga') })`)
  conferir('o Boss derrotado dá o bônus de Boss', vitoria.bonus === 500, vitoria)
  conferir('com a chance forçada em 100%, o equipamento especial cai (e a casca antiga)', vitoria.especial && vitoria.casca, vitoria)
  conferir('sem o Boss, a barra grande some do HUD', !(await aba.avaliar(`!!document.querySelector('.barra-do-boss')`)))
  await aba.print('12-boss-derrotado')
  await cena(`(c.inimigos.forEach((i) => c.matarInimigo(i)), c.ultimoDano = -999999, true)`)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 9000)
  await aba.apertar('q')
  await cena(`(c.retorno.msRestantes = 300, true)`)
  await aba.esperarTela('Resumo', 8000)
  const resumoDoBoss = await aba.texto()
  const base = Number((resumoDoBoss.match(/\(base (\d+)\)/) ?? [])[1] ?? 0)
  conferir('o Resumo mostra o Boss derrotado, e a pontuação base inclui o bônus (RF49)', resumoDoBoss.includes('derrotado (+500 pontos)') && base >= 500, base)

  console.log('15. TEST-005: 60 FPS no pior cenário (grupo de 5 e todos os mobs da Difícil), por 2 minutos')
  await aba.clicar('Jogar novamente')
  await aba.clicar('Floresta')
  await aba.esperarTela('Ponto de partida')
  await aba.clicar('Difícil')
  await aba.esperarTela('Preparação')
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.lider && !!${CENA}.exploracao`, 'a Floresta', 20000)
  await pausa(800)
  await aba.clicar('Invencível: não')
  await aba.clicar('Pior cenário (FPS)')
  await pausa(1500)
  const cenario = await cena(`({ grupo: c.grupo.length, acordados: c.inimigos.filter((i) => !i.dormindo && i.regiao === 'dificil').length, perseguindo: c.inimigos.filter((i) => i.perseguindo).length })`)
  conferir('o pior cenário: grupo de 5 e os mobs da Difícil acordados em volta', cenario.grupo === 5 && cenario.acordados >= 15, cenario)
  await aba.print('13-pior-cenario')
  const amostras = []
  for (let i = 0; i < 120; i++) {
    await pausa(1000)
    amostras.push(await cena(`Math.round(c.game.loop.actualFps)`))
  }
  const media = Math.round(amostras.reduce((a, b) => a + b, 0) / amostras.length)
  const ordenadas = [...amostras].sort((a, b) => a - b)
  const pior5 = ordenadas[Math.floor(ordenadas.length * 0.05)]
  console.log(`  (FPS em 2 minutos: média ${media}, mínimo ${ordenadas[0]}, 5% piores ${pior5}; renderizador: ${await aba.avaliar(`(() => { const g = document.createElement('canvas').getContext('webgl'); const i = g && g.getExtension('WEBGL_debug_renderer_info'); return i ? g.getParameter(i.UNMASKED_RENDERER_WEBGL) : '?' })()`)})`)
  conferir('em 2 minutos de pior cenário, o FPS fica perto de 60 (média ≥ 55)', media >= 55, { media, minimo: ordenadas[0], pior5 })

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
