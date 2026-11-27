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
  // A Caravana (RF56, Parte 7) aparece sempre; o início é de graça
  await aba.esperarTela('Caravana')
  conferir('depois do bioma vem a Caravana, com o início de graça e liberado', await aba.temBotao('Começar no início'))
  await aba.passarPelaCaravana()
  await aba.clicar('Começar partida')
  await aba.esperar(`!!document.querySelector('.arena canvas') && !!${CENA}?.lider`, 'a Floresta', 20000)
  await pausa(800)
  const mapa = await cena(`({ id: c.mapa.id, largura: c.mapa.tamanho.largura, altura: c.mapa.tamanho.altura, lider: { x: Math.round(c.lider.x), y: Math.round(c.lider.y) }, inicio: c.mapa.inicio })`)
  conferir('a partida acontece na Floresta, um mapa bem maior que a tela', mapa.id === 'floresta' && mapa.largura > 1600 * 3, mapa)
  conferir('o grupo nasce no ponto inicial (zona segura)', Math.hypot(mapa.lider.x - mapa.inicio.x, mapa.lider.y - mapa.inicio.y) < 80, mapa)
  // Quantos mobs nasceram em cada região (conferido na seção 7; até lá, o grupo derrota alguns)
  const nasceram = await cena(`(() => { const t = {}; for (const i of c.inimigos) t[i.regiao] = (t[i.regiao] ?? 0) + 1; return t })()`)
  await aba.print('01-floresta-inicio')
  // Floresta grande (Parte 5): as posições do roteiro saem do mapa (os inícios das zonas), não de números soltos
  const Z = await cena(`(() => { const z = {}; for (const r of c.mapa.regioes) z[r.id] = { x: Math.round(r.inicio.x), y: Math.round(r.inicio.y) }; return z })()`)
  // Uma faixa reta de 1100 px na Fácil sem árvore nem pedra (para andar, mirar e atirar sem bater em nada)
  const faixa = await cena(`(() => {
    const livre = (x, y) => !c.mapa.obstaculos.some((o) => Math.abs(o.x - x) < o.largura / 2 + 70 && Math.abs(o.y - y) < o.altura / 2 + 70)
    for (let y = 1000; y <= 1900; y += 25) for (let x = 2700; x <= 5500; x += 50) {
      let ok = true
      for (let d = 0; d <= 1100 && ok; d += 50) ok = livre(x + d, y) && c.regiaoEm({ x: x + d, y })?.id === 'facil'
      if (ok) return { x, y }
    }
    return null
  })()`)
  conferir('achou uma faixa livre de 1100 px na Fácil para os testes de andar e mirar', Boolean(faixa), faixa)

  console.log('2. Câmera segue o Líder (TASK-060)')
  // A faixa y = 1900, de x = 1600 a 2600, não tem árvore nem pedra (o ponto 1800, 1800 caía dentro de uma árvore). Os mobs
  // da Fácil que estiverem passeando nela saem antes (um cervo parado na frente segura o Líder, como deve ser)
  const noCaminho = await cena(`c.inimigos.filter((i) => i.x > ${faixa.x} - 150 && i.x < ${faixa.x} + 1250 && Math.abs(i.y - ${faixa.y}) < 300).map((i) => (c.matarInimigo(i), i.tipo))`)
  await colocarLider(faixa.x, faixa.y)
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
  conferir('o mapa aparece desde o alto da tela (o HUD é translúcido, por cima) até a barra de teste', vista.y === 0 && vista.altura === 900 - 112, vista)
  await aba.print('02-camera')

  console.log('3. A mira continua certa com a câmera andando (mouse parado)')
  const P3 = { x: faixa.x + 300, y: faixa.y }
  const M3 = { x: P3.x + 300, y: P3.y - 100 }
  await colocarLider(P3.x, P3.y)
  await pausa(400)
  const alvo = await naTela(M3.x, M3.y)
  await aba.moverMouse(alvo.x, alvo.y)
  await pausa(150)
  // O ângulo esperado sai de onde o Líder está de verdade (um aliado pode tê-lo empurrado uns pixels depois de colocado)
  const miraParado = await cena(`({ angulo: c.anguloDaMira, mouse: c.mouseNoMundo, lider: { x: c.lider.x, y: c.lider.y } })`)
  const esperadoParado = Math.atan2(M3.y - miraParado.lider.y, M3.x - miraParado.lider.x)
  conferir(
    'com a câmera parada, a mira aponta para onde o mouse está',
    Math.hypot(miraParado.mouse.x - M3.x, miraParado.mouse.y - M3.y) < 3 && Math.abs(miraParado.angulo - esperadoParado) < 0.05,
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
  // O corpo que colide é menor que o desenho (ajustes de 14/10): o limite é o raio dele
  const raioDoLider = await cena(`c.lider.raio`)
  await colocarLider(Z.zonaSegura.x - 250, Z.zonaSegura.y)
  await aba.segurar(['a'], 900)
  const esquerda = await cena(`({ x: c.lider.x, scrollX: c.cameras.main.scrollX })`)
  conferir('na beira esquerda do mapa, o Líder não passa e a câmera para no limite', esquerda.x >= raioDoLider - 1 && esquerda.scrollX === 0, esquerda)
  // (a mata da Floresta grande vem do terreno: depois de empurrar a parede, o Líder continua na zona)
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y - 600)
  await aba.segurar(['w'], 1500)
  const cima = await cena(`({ y: Math.round(c.lider.y), regiao: c.regiaoEm(c.lider)?.id ?? null })`)
  conferir('na zona segura, a mata fechada de cima é parede', cima.regiao === 'zonaSegura' && cima.y > 300, cima)
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y + 600)
  await aba.segurar(['s'], 1500)
  const baixo = await cena(`({ y: Math.round(c.lider.y), regiao: c.regiaoEm(c.lider)?.id ?? null })`)
  conferir('...e a de baixo também', baixo.regiao === 'zonaSegura' && baixo.y < 2600, baixo)
  // O fundo é o domínio do Boss: sozinho e sem o Invencível, o Líder às vezes caía antes da conferência, e Líder sozinho
  // caído é Derrota (a partida acabava no meio do roteiro)
  await cena(`(c.invencivel = true, true)`)
  const chefe = await cena(`({ x: Math.round(c.mapa.lugarDoChefe.x), y: Math.round(c.mapa.lugarDoChefe.y) })`)
  await cena(`(() => { const p = c.lugarLivre(c.lider.tamanho, { x: ${chefe.x} + 300, y: ${chefe.y} }, c.lider, 4); c.lider.colocarEm(p.x, p.y); c.cameras.main.centerOn(p.x, p.y); return true })()`)
  await aba.segurar(['d'], 1500)
  await pausa(600)
  const direita = await cena(`({ x: Math.round(c.lider.x), regiao: c.regiaoEm(c.lider)?.id ?? null, scrollX: c.cameras.main.scrollX, limite: c.mapa.tamanho.largura - c.cameras.main.width })`)
  conferir('no fundo da Floresta, o Líder não sai do domínio do chefe e a câmera para no limite', direita.regiao === 'dominioDoBoss' && Math.abs(direita.scrollX - direita.limite) < 2, direita)
  await aba.print('03-fundo-da-floresta')
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y)
  await cena(`(c.lider.vida = c.lider.vidaMaxima, c.invencivel = false, true)`)

  console.log('5. O grupo atravessa a Floresta junto')
  await cena(`(c.encherGrupo(), true)`)
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y)
  for (const membro of await cena(`c.aliados.map((a, i) => i)`)) await cena(`(c.aliados[${membro}].colocarEm(c.lider.x - 60 - ${membro} * 10, c.lider.y + (${membro} - 2) * 50), true)`)
  await pausa(500)
  await aba.segurar(['d'], 6000)
  await pausa(2500)
  const grupo = await cena(`c.aliados.map((a) => ({ classe: a.classe, distancia: Math.round(Math.hypot(a.x - c.lider.x, a.y - c.lider.y)) }))`)
  conferir('depois de 6 s andando pela Floresta, os 4 aliados continuam perto do Líder', grupo.length === 4 && grupo.every((um) => um.distancia < 400), grupo)
  await aba.print('04-grupo-andando')
  // Corredor estreito (ajustes de 14/10, hitbox menor): o vão mais apertado entre dois obstáculos (árvore ou pedra), um ao
  // lado do outro, longe da mata fechada, com o grupo de um lado e o Líder indo para o outro; todos passam sem travar
  const corredor = await cena(`(() => {
    const obs = c.mapa.obstaculos.filter((o) => o.tipo !== 'mata' && c.regiaoEm(o)?.id === 'facil')
    const livre = (x, y) => !c.mapa.obstaculos.some((o) => Math.abs(o.x - x) < o.largura / 2 + 40 && Math.abs(o.y - y) < o.altura / 2 + 40)
    let melhor = null
    for (const a of obs) for (const b of obs) {
      if (b.x <= a.x) continue
      const vao = (b.x - b.largura / 2) - (a.x + a.largura / 2)
      const encaram = Math.min(a.y + a.altura / 2, b.y + b.altura / 2) - Math.max(a.y - a.altura / 2, b.y - b.altura / 2)
      if (vao < 60 || vao > 240 || encaram < 30) continue
      const meio = (a.x + a.largura / 2 + b.x - b.largura / 2) / 2
      const topo = Math.min(a.y - a.altura / 2, b.y - b.altura / 2)
      const base = Math.max(a.y + a.altura / 2, b.y + b.altura / 2)
      if (!livre(meio, topo - 170) || !livre(meio, base + 130) || !livre(meio, base + 200)) continue
      if (!melhor || vao < melhor.vao) melhor = { vao: Math.round(vao), x: (a.x + a.largura / 2 + b.x - b.largura / 2) / 2, topo: Math.min(a.y - a.altura / 2, b.y - b.altura / 2), base: Math.max(a.y + a.altura / 2, b.y + b.altura / 2) }
    }
    return melhor
  })()`)
  if (corredor) {
    await cena(`(c.inimigos.filter((i) => Math.hypot(i.x - ${corredor.x}, i.y - ${corredor.topo}) < 1200).forEach((i) => c.matarInimigo(i)), true)`)
    await colocarLider(corredor.x, corredor.topo - 90)
    for (const membro of [0, 1, 2, 3]) await cena(`(c.aliados[${membro}]?.colocarEm(${corredor.x} + (${membro} - 1.5) * 34, ${corredor.topo} - 150 - (${membro} % 2) * 30), true)`)
    await pausa(300)
    // O Líder bem depois da saída (200 px): quem para na distância normal de seguir (uns 130 px) já atravessou
    await colocarLider(corredor.x, corredor.base + 200)
    await pausa(5000)
    const passaram = await cena(`c.aliados.map((a) => ({ classe: a.classe, passou: a.y > ${corredor.base}, distancia: Math.round(Math.hypot(a.x - c.lider.x, a.y - c.lider.y)), deslizou: !!a.deslizando }))`)
    conferir(`corredor estreito (${corredor.vao} px entre dois obstáculos): o grupo inteiro passa para o outro lado sem travar`, passaram.length === 4 && passaram.every((um) => um.passou && um.distancia < 260), { vao: corredor.vao, passaram })
    await aba.print('04b-corredor')
  } else {
    conferir('achou um corredor estreito na Fácil para o teste', false)
  }

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
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y)
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
  await colocarLider(Z.facil.x, Z.facil.y)
  await pausa(500)
  conferir('entrando na Fácil, o HUD mostra "Fácil"', (await quadroDoMinimapa()).regiao === 'Fácil')
  // A taxa da fuga como o HUD mostra ("Fuga (F): 11% · ...")
  // (depois de um salto longo, o HUD pode levar mais que um instante para trocar: espera o número parar de mudar)
  const taxa = async (x, y) => {
    await colocarLider(x, y)
    const ler = () => aba.avaliar(`parseInt(document.querySelector('.hud').innerText.split('Fuga (F): ')[1] ?? '', 10)`)
    await pausa(400)
    let antes = await ler()
    for (let i = 0; i < 10; i++) {
      await pausa(300)
      const agora = await ler()
      if (agora === antes) return agora
      antes = agora
    }
    return antes
  }
  // A taxa conta a distância em LINHA RETA até o início do bioma (RF48, mantido pelo Pablo em 20/11). Com o caminho em
  // "S", o início da Difícil fica mais perto do começo, em linha reta, que o da Média: a conferência usa pontos em
  // distâncias crescentes (zona segura, Fácil, Média) e, para o +7 do domínio, dois pontos dos lados da divisa do fim.
  const taxaPerto = await taxa(Z.zonaSegura.x, Z.zonaSegura.y)
  const taxaMedia = await taxa(Z.facil.x, Z.facil.y)
  const taxaDificil = await taxa(Z.media.x, Z.media.y)
  const antesDoDominio = await cena(`(() => { const p = c.lugarLivre(c.lider.tamanho, { x: ${Z.dominioDoBoss.x} - 600, y: ${Z.dominioDoBoss.y} }, c.lider, 4); return { x: Math.round(p.x), y: Math.round(p.y) } })()`)
  const taxaAntes = await taxa(antesDoDominio.x, antesDoDominio.y)
  const taxaBoss = await taxa(Z.dominioDoBoss.x, Z.dominioDoBoss.y)
  conferir('o custo da fuga sobe com a distância (em linha reta) do ponto inicial', taxaPerto < taxaMedia && taxaMedia < taxaDificil, { taxaPerto, taxaMedia, taxaDificil })
  conferir('no domínio do Boss, a fuga custa +7 pontos (RF48)', taxaBoss - taxaAntes >= 7 && taxaBoss - taxaAntes <= 10, { taxaAntes, taxaBoss })
  await aba.esperar(`!!document.querySelector('.hud-regiao-boss')`, 'o aviso do domínio', 3000).catch(() => {})
  conferir('no domínio do Boss, o HUD avisa a região em destaque', await aba.avaliar(`!!document.querySelector('.hud-regiao-boss')`))
  const noDominio = await quadroDoMinimapa()
  conferir('...e o nome mais comprido ("Domínio do Boss") também cabe no quadro', noDominio.regiao === 'Domínio do Boss' && noDominio.fora.length === 0, noDominio)
  await aba.print('05-dominio-do-boss')
  // (passa pela Difícil também: ela entra nas regiões descobertas, para o Ponto de partida da seção 15)
  await taxa(Z.dificil.x, Z.dificil.y)

  console.log('7. Mobs por região (TASK-062)')
  // Onde cada um nasceu (a casa): depois de nascer, eles andam e perseguem. Dentro e encostado medem pelo corpo que
  // colide (ajustes de 14/10: menor que o desenho)
  const mobs = await cena(`c.inimigos.map((i) => ({ tipo: i.tipo, regiao: i.regiao, x: Math.round(i.casaFixa.x), y: Math.round(i.casaFixa.y), tamanho: i.tamanho, hostil: i.config.hostil }))`)
  conferir('cada região nasce com os seus mobs (a zona segura, nenhum)', !nasceram.zonaSegura && nasceram.facil >= 10 && nasceram.media >= 15 && nasceram.dificil >= 18, nasceram)
  const inicios = await cena(`c.mapa.regioes.map((r) => r.inicio)`)
  const pertoDeInicio = mobs.filter((mob) => inicios.some((inicio) => Math.hypot(inicio.x - mob.x, inicio.y - mob.y) < 600))
  conferir('nenhum mob nasce perto do início de uma região (o grupo nunca nasce com mob perto)', pertoDeInicio.length === 0, pertoDeInicio.slice(0, 3))
  const dentroDeObstaculo = await cena(`c.inimigos.filter((i) => c.paredesPerto(i, 100).some((p) => Math.abs(i.x - p.x) * 2 < p.largura + 2 * i.raio - 4 && Math.abs(i.y - p.y) * 2 < p.altura + 2 * i.raio - 4)).length`)
  conferir('nenhum mob dentro de árvore, pedra ou mata', dentroDeObstaculo === 0, dentroDeObstaculo)
  const encostados = await cena(`(() => { const l = c.inimigos; let n = 0; for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) { const m = l[a].raio + l[b].raio - 1; if (Math.abs(l[a].x - l[b].x) < m && Math.abs(l[a].y - l[b].y) < m) n++ } return n })()`)
  conferir('nenhum mob em cima de outro', encostados === 0, encostados)
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y)
  await pausa(400)
  const dormindo = await cena(`({ dormindo: c.inimigos.filter((i) => i.dormindo).length, total: c.inimigos.length })`)
  conferir('longe do Líder, os mobs dormem (não pensam nem andam: 60 FPS)', dormindo.dormindo >= dormindo.total - 4, dormindo)

  console.log('8. Fugir de um lobo até ele desistir (território)')
  await cena(`(c.invencivel = true, true)`)
  // Vida de sobra para o lobo do teste: os aliados atacam quem persegue o Líder e, com a vida normal, às vezes o matavam
  // antes da conferência (o lobo sumia da lista e a conferência dava erro)
  const lobo = await cena(`(() => { const l = c.inimigos.find((i) => i.tipo === 'lobo' && i.regiao === 'facil' && !i.morto) ?? c.criarMobDoMundo('lobo', 'facil', (() => { const r = c.mapa.regioes.find((u) => u.id === 'facil'); return { x: r.inicio.x + 900, y: r.inicio.y } })()); l.__teste = true; l.vida = l.vidaMaxima = 1e6; return { x: Math.round(l.x), y: Math.round(l.y), casa: l.casaFixa, territorio: l.config.raioDoTerritorio } })()`)
  // Só o lobo do teste por perto (os outros mobs atacariam no meio)
  await cena(`(c.inimigos.filter((i) => !i.__teste && Math.hypot(i.x - ${lobo.x}, i.y - ${lobo.y}) < 2200).forEach((i) => c.matarInimigo(i)), true)`)
  await colocarLider(lobo.x - 220, lobo.y)
  await aba.esperar(`${CENA}.inimigos.find((i) => i.__teste)?.perseguindo`, 'o lobo perseguir', 4000).catch(() => {})
  conferir('chegando perto, o lobo persegue (aparece o "!")', await cena(`c.inimigos.find((i) => i.__teste).perseguindo`))
  // O Líder corre para fora do território (o lobo fica dentro dele): para o lado em que o lugar livre fica mesmo fora
  // (o lobo sorteado pode ter nascido perto da beira da região, e aí um dos lados não cabe)
  const fora = await cena(`(() => {
    const casa = c.inimigos.find((i) => i.__teste).casaFixa
    const longe = ${lobo.territorio} + 350
    const lados = [{ x: casa.x - longe, y: casa.y }, { x: casa.x + longe, y: casa.y }, { x: casa.x, y: casa.y - longe }, { x: casa.x, y: casa.y + longe }]
    const livres = lados.map((ponto) => c.lugarLivre(40, ponto))
    return livres.find((ponto) => Math.hypot(ponto.x - casa.x, ponto.y - casa.y) > ${lobo.territorio} + 150) ?? livres[0]
  })()`)
  await colocarLider(fora.x, fora.y)
  await aba.esperar(`!${CENA}.inimigos.find((i) => i.__teste)?.perseguindo`, 'o lobo desistir', 6000).catch(() => {})
  conferir('com o grupo fora do território, o lobo desiste (aparece o "?")', !(await cena(`c.inimigos.find((i) => i.__teste).perseguindo`)))
  await pausa(3500)
  const voltou = await cena(`(() => { const l = c.inimigos.find((i) => i.__teste); return Math.round(Math.hypot(l.x - l.casaFixa.x, l.y - l.casaFixa.y)) })()`)
  conferir('...e volta para perto de casa', voltou < lobo.territorio * 0.6, voltou)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 8000).catch(() => {})
  conferir('5 s depois de o lobo desistir, o grupo sai de combate (RF37)', !(await cena(`c.emCombate`)))
  // O lobo do teste (com vida de sobra) sai do jogo, para não perseguir o grupo nos testes seguintes
  await cena(`(c.inimigos.filter((i) => i.__teste).forEach((i) => c.matarInimigo(i)), true)`)

  console.log('9. Animais pacíficos (Parte 6a): o cervo nunca ataca e foge do grupo, sem sair da zona neutra')
  // (se as seções de antes não deixaram nenhum cervo vivo, nasce um numa zona neutra, como no sorteio do mapa)
  const cervo = await cena(`(() => {
    let v = c.inimigos.find((i) => i.tipo === 'cervo' && !i.morto)
    if (!v) { const r = c.mapa.regioes.find((u) => u.dificuldade === 'neutra'); v = c.criarMobDoMundo('cervo', r.id, r.inicio) }
    // vida de sobra, como o lobo de teste: nada de fora (um tiro perdido) derruba o cervo antes das conferências
    v.__cervo = true
    v.vida = v.vidaMaxima = 1e6
    return { x: Math.round(v.x), y: Math.round(v.y), regiao: v.regiao }
  })()`)
  conferir('o cervo nasce numa zona neutra', cervo.regiao.startsWith('neutra'), cervo)
  await cena(`(c.inimigos.filter((i) => !i.__cervo && Math.hypot(i.x - ${cervo.x}, i.y - ${cervo.y}) < 1200).forEach((i) => c.matarInimigo(i)), true)`)
  await cena(`(c.invencivel = false, c.lider.vida = c.lider.vidaMaxima, true)`)
  await colocarLider(cervo.x - 120, cervo.y)
  await pausa(1500)
  const veado = `c.inimigos.find((i) => i.__cervo)`
  const passou = await cena(`(() => { const v = ${veado}; return { persegue: v.perseguindo, longe: Math.round(Math.hypot(v.x - c.lider.x, v.y - c.lider.y)), naZona: v.naMinhaArea(v), vida: c.lider.vida, maxima: c.lider.vidaMaxima } })()`)
  conferir('passando perto do cervo, ele não ataca e se afasta do grupo', !passou.persegue && passou.vida === passou.maxima && passou.longe > 170, passou)
  conferir('...sem sair da zona neutra dele', passou.naZona, passou)
  const vidaDepoisDoGolpe = await cena(`(c.invencivel = true, c.acertar(${veado}, 5, c.lider, 0, c.lider), ${veado}.vida)`)
  await pausa(600)
  const atacado = await cena(`(() => { const v = ${veado}; return { persegue: v.perseguindo, fugindo: v.fugindo, estado: v.estado, naZona: v.naMinhaArea(v) } })()`)
  conferir('atacado, o cervo não revida: foge', !atacado.persegue && atacado.fugindo, atacado)
  await pausa(1500)
  const vidaDoCervo = await cena(`${veado}.vida`)
  conferir('os aliados não atacam o animal pacífico (só o Líder bateu)', vidaDoCervo === vidaDepoisDoGolpe, { vidaDepoisDoGolpe, agora: vidaDoCervo })
  await aba.print('06-cervo-foge')
  await cena(`(c.inimigos.filter((i) => i.__cervo).forEach((i) => c.matarInimigo(i)), true)`)

  console.log('9b. O Lobo Alfa e a matilha (acordam juntos) e o território pela área (Parte 6a)')
  await cena(`(c.invencivel = true, true)`)
  // Um Alfa novo no fim da faixa livre da Fácil, com a matilha; nada mais por perto
  await cena(`(c.inimigos.filter((i) => Math.hypot(i.x - ${faixa.x + 800}, i.y - ${faixa.y}) < 1600).forEach((i) => c.matarInimigo(i)), true)`)
  const matilha = await cena(`(() => {
    const a = c.criarMobDoMundo('loboAlfa', 'facil', { x: ${faixa.x + 800}, y: ${faixa.y} })
    c.criarMatilha(a, Math.random)
    for (const m of a.bando) { m.__matilha = true; m.vida = m.vidaMaxima = 1e6 }
    const lobo = c.inimigos.find((i) => i.tipo === 'lobo' && i.__matilha)
    return { bando: a.bando.length, tamanho: a.tamanho, doLobo: lobo?.tamanho, mesmoBando: a.bando.every((m) => m.bando === a.bando), x: Math.round(a.x), y: Math.round(a.y) }
  })()`)
  conferir('o Lobo Alfa nasce maior que o lobo, com a matilha em volta (todos no mesmo bando)', matilha.bando >= 2 && matilha.mesmoBando && matilha.tamanho > matilha.doLobo, matilha)
  await colocarLider(faixa.x + 50, faixa.y)
  await pausa(500)
  conferir('longe deles, ninguém da matilha persegue', !(await cena(`c.inimigos.some((i) => i.__matilha && i.perseguindo)`)))
  await cena(`(c.inimigos.find((i) => i.tipo === 'loboAlfa' && i.__matilha).aoApanhar(c.agora), true)`)
  await pausa(300)
  const acordaram = await cena(`c.inimigos.filter((i) => i.__matilha).map((i) => i.perseguindo)`)
  conferir('o Alfa atacado chama a matilha: todos perseguem juntos', acordaram.length >= 2 && acordaram.every(Boolean), acordaram)
  await aba.print('06b-matilha')
  await cena(`(c.inimigos.filter((i) => i.__matilha).forEach((i) => c.matarInimigo(i)), true)`)
  // Território pela área: o lobo da Fácil não entra na zona neutra vizinha (a Clareira da Entrada), nem provocado
  const borda = await cena(`(() => {
    const neutra = c.mapa.regioes.find((r) => r.id === 'neutraDaEntrada'), facil = c.mapa.regioes.find((r) => r.id === 'facil')
    const y = neutra.inicio.y
    for (let x = neutra.inicio.x; x < facil.inicio.x; x += 10) if (c.regiaoEm({ x, y })?.id === 'facil') return { x, y }
    return null
  })()`)
  await cena(`(c.inimigos.filter((i) => Math.hypot(i.x - ${borda.x}, i.y - ${borda.y}) < 1500).forEach((i) => c.matarInimigo(i)), true)`)
  await cena(`(() => { const l = c.criarMobDoMundo('lobo', 'facil', c.lugarLivre(34, { x: ${borda.x + 260}, y: ${borda.y} })); l.__borda = true; l.vida = l.vidaMaxima = 1e6; return true })()`)
  await colocarLider(borda.x - 200, borda.y)
  await pausa(1500)
  // (os aliados podem bater no lobo, que está perto do Líder: aí ele persegue porque apanhou, o que vale)
  // (um aliado que pisar na Fácil pode virar alvo, o que vale: a conferência olha se o alvo é o Líder)
  const naNeutra = await cena(`(() => { const l = c.inimigos.find((i) => i.__borda); return { liderNaAreaDoLobo: l.naMinhaArea(c.lider), alvoEOLider: l.alvo === c.lider, apanhou: l.provocadoAte > 0 } })()`)
  conferir('com o Líder na zona neutra, ele não está na área do lobo da Fácil (o lobo não o escolhe, a não ser que apanhe)', !naNeutra.liderNaAreaDoLobo && (!naNeutra.alvoEOLider || naNeutra.apanhou), naNeutra)
  await cena(`(c.inimigos.find((i) => i.__borda).aoApanhar(c.agora), true)`)
  await pausa(2500)
  const naBorda = await cena(`(() => { const l = c.inimigos.find((i) => i.__borda); return { naFacil: l.naMinhaArea(l), x: Math.round(l.x), lider: Math.round(c.lider.x), vida: c.lider.vida, maxima: c.lider.vidaMaxima } })()`)
  conferir('provocado, o lobo vai até a borda da Fácil mas não entra na zona neutra', naBorda.naFacil && naBorda.x > naBorda.lider + 60, naBorda)
  await aba.print('06c-territorio')
  await cena(`(c.inimigos.filter((i) => i.__borda).forEach((i) => c.matarInimigo(i)), true)`)

  console.log('9c. O acampamento goblin da Média (Parte 6b): paliçada, bando, xamã e a IA dos aliados')
  const acamp = await cena(`(() => {
    const a = c.mapa.acampamentos[0]
    const troncos = c.mapa.obstaculos.filter((o) => o.tipo === 'palicada' && Math.hypot(o.x - a.centro.x, o.y - a.centro.y) < a.raio + 30).length
    const goblins = c.inimigos.filter((i) => i.acampamento === a && !i.morto)
    const intrusos = c.inimigos.filter((i) => !i.acampamento && !i.morto && Math.hypot(i.x - a.centro.x, i.y - a.centro.y) < a.raio).length
    return { x: a.centro.x, y: a.centro.y, raio: a.raio, entradas: a.entradas.length, troncos, goblins: goblins.map((g) => g.tipo), mesmoBando: goblins.every((g) => g.bando === goblins[0].bando), intrusos }
  })()`)
  conferir('o acampamento tem a paliçada (com 1 ou 2 entradas), os goblins dentro, no mesmo bando, e nenhum outro mob', acamp.troncos > 40 && acamp.entradas >= 1 && acamp.goblins.includes('goblinXama') && acamp.goblins.includes('goblinLanceiro') && acamp.goblins.includes('goblinArqueiro') && acamp.mesmoBando && acamp.intrusos === 0, acamp)
  // Goblins com vida de sobra e o grupo invencível (as conferências não podem depender de quem ganha a briga)
  await cena(`(c.invencivel = true, c.iaForcada = 'media', c.inimigos.filter((i) => i.acampamento === c.mapa.acampamentos[0]).forEach((g) => { g.__goblin = true; g.vida = g.vidaMaxima = 1e6 }), true)`)
  await cena(`(c.inimigos.filter((i) => !i.__goblin && Math.hypot(i.x - ${acamp.x}, i.y - ${acamp.y}) < 1800).forEach((i) => c.matarInimigo(i)), true)`)
  // Passando do lado de fora, longe da paliçada (além da folga): ninguém acorda e os aliados não começam a briga
  await colocarLider(acamp.x, acamp.y + acamp.raio + 420)
  await pausa(2500)
  const acampamentoDormindo = await cena(`({ acordados: c.inimigos.filter((i) => i.__goblin && i.perseguindo).length, apanhou: c.inimigos.filter((i) => i.__goblin && i.vida < 1e6).length })`)
  conferir('passando do lado de fora, o acampamento continua dormindo e os aliados não atacam', acampamentoDormindo.acordados === 0 && acampamentoDormindo.apanhou === 0, acampamentoDormindo)
  // Entrando pela entrada leste: o acampamento acorda junto
  await colocarLider(acamp.x + acamp.raio + 70, acamp.y)
  await pausa(1200)
  const acordou = await cena(`c.inimigos.filter((i) => i.__goblin).map((i) => i.perseguindo)`)
  conferir('chegando na entrada, o acampamento acorda junto (todos perseguem)', acordou.length >= 5 && acordou.every(Boolean), acordou)
  await aba.print('06d-acampamento')
  // IA média: o Guerreiro, o Arqueiro ou o Mago aliado miram o xamã primeiro (o grupo dentro do acampamento: os aliados
  // só lutam com quem está a até 380 px do Líder)
  await colocarLider(acamp.x + acamp.raio - 130, acamp.y)
  let miraNoXama = false
  // (6 s: o aliado às vezes está recuando de um golpe ou levantando alguém na hora da amostra)
  for (let i = 0; i < 24 && !miraNoXama; i++) {
    miraNoXama = await cena(`c.aliados.some((a) => !a.caido && ['guerreiro', 'arqueiro'].includes(a.classe) && a.ia.alvo?.tipo === 'goblinXama')`)
    if (!miraNoXama) await pausa(250)
  }
  conferir('na IA média, um aliado (Guerreiro ou Arqueiro) mira o xamã primeiro', miraNoXama)
  // O xamã cura o goblin ferido
  // (os aliados continuam batendo: confere quem o xamã escolheu curar, o lanceiro com 30% da vida)
  await cena(`(() => {
    const x = c.inimigos.find((i) => i.__goblin && i.tipo === 'goblinXama'); x.__curas = []
    const curar = x.curar.bind(x); x.curar = (f, a) => { x.__curas.push(f.__ferido ? 'ferido' : f.tipo); curar(f, a) }
    const g = c.inimigos.find((i) => i.__goblin && i.tipo === 'goblinLanceiro'); g.vida = g.vidaMaxima * 0.3; g.__ferido = true
    return true
  })()`)
  await aba.esperar(`${CENA}.inimigos.find((i) => i.tipo === 'goblinXama' && i.__goblin)?.__curas.includes('ferido')`, 'o xamã curar', 6000).catch(() => {})
  const curas = await cena(`c.inimigos.find((i) => i.tipo === 'goblinXama' && i.__goblin).__curas`)
  conferir('o xamã cura o goblin mais ferido do acampamento', curas.includes('ferido'), curas)
  // Território: o Líder foge para longe; os goblins ficam no acampamento (com a folga)
  await colocarLider(acamp.x + acamp.raio + 900, acamp.y)
  await pausa(3000)
  const longe = await cena(`c.inimigos.filter((i) => i.__goblin).map((g) => Math.round(Math.hypot(g.x - ${acamp.x}, g.y - ${acamp.y})))`)
  conferir('com o grupo longe, nenhum goblin sai do acampamento (só a folga em volta da paliçada)', longe.every((d) => d <= acamp.raio + 260), longe)
  await cena(`(c.iaForcada = null, c.inimigos.filter((i) => i.__goblin).forEach((i) => c.matarInimigo(i)), true)`)

  console.log('9d. O forte goblin da Difícil, o Orc e a Aranha-Mãe (Parte 6c)')
  const forte = await cena(`(() => {
    const f = c.mapa.acampamentos.find((a) => a.forma === 'retangulo')
    const muros = c.mapa.obstaculos.filter((o) => o.tipo === 'muro').length
    const moradores = c.inimigos.filter((i) => i.acampamento === f && !i.morto)
    const naTorre = moradores.filter((i) => i.naTorre)
    return { x: f.centro.x, y: f.centro.y, largura: f.largura, altura: f.altura, muros, torres: (f.torres ?? []).length, naTorre: naTorre.length, torreFixa: naTorre.every((i) => i.fixo), orc: moradores.some((i) => i.tipo === 'orc'), tipos: [...new Set(moradores.map((i) => i.tipo))] }
  })()`)
  conferir('o forte tem muros, 4 torres com um arqueiro parado em cada e o Orc dentro', forte.muros > 10 && forte.torres === 4 && forte.naTorre === 4 && forte.torreFixa && forte.orc, forte)
  await cena(`(c.invencivel = true, c.inimigos.filter((i) => i.acampamento?.forma === 'retangulo').forEach((g) => { g.__forte = true; g.vida = g.vidaMaxima = 1e6 }), true)`)
  await cena(`(c.inimigos.filter((i) => !i.__forte && Math.hypot(i.x - ${forte.x}, i.y - ${forte.y}) < 2000).forEach((i) => c.matarInimigo(i)), true)`)
  // Parte 11: o forte acorda POR PARTES. Entrando pelo portão oeste, só o Portão (e as torres do lado dele) acorda
  const partesAcordadas = () =>
    cena(`(() => { const r = {}; for (const i of c.inimigos.filter((g) => g.__forte && !g.morto)) { const id = i.leva?.id ?? 'sem'; r[id] = r[id] ?? { todos: 0, perseguindo: 0 }; r[id].todos++; if (i.perseguindo) r[id].perseguindo++ } return r })()`)
  const parteAcordou = (parte) => parte && parte.todos > 0 && parte.perseguindo === parte.todos
  const parteDormindo = (parte) => parte && parte.perseguindo === 0
  await colocarLider(forte.x - forte.largura / 2 - 80, forte.y)
  await pausa(1500)
  let partes = await partesAcordadas()
  conferir('o forte tem as três partes (Portão, Pátio, Torre) e todo goblin dele é de uma parte', partes.portao && partes.patio && partes.torre && !partes.sem, partes)
  conferir('chegando no portão, só o Portão acorda (todos dele perseguem); o Pátio e a Torre continuam parados', parteAcordou(partes.portao) && parteDormindo(partes.patio) && parteDormindo(partes.torre), partes)
  // No meio do forte, o Pátio acorda; a Torre (do outro lado) ainda não
  await colocarLider(forte.x - 60, forte.y + 120)
  await pausa(1500)
  partes = await partesAcordadas()
  conferir('no pátio, o Pátio acorda e a Torre ainda não', parteAcordou(partes.patio) && parteDormindo(partes.torre), partes)
  // Do lado leste, a Torre acorda
  await colocarLider(forte.x + forte.largura / 2 - 140, forte.y)
  await pausa(1500)
  partes = await partesAcordadas()
  conferir('chegando na Torre, ela acorda (com o Orc)', parteAcordou(partes.torre), partes)
  const torreParada = await cena(`(() => { const a = c.inimigos.find((i) => i.__forte && i.naTorre); a.__antes = { x: a.x, y: a.y }; return true })()`)
  await pausa(1500)
  const moveu = await cena(`(() => { const a = c.inimigos.find((i) => i.__forte && i.naTorre && i.__antes); return Math.round(Math.hypot(a.x - a.__antes.x, a.y - a.__antes.y)) })()`)
  conferir('o arqueiro da torre não sai do lugar', torreParada && moveu <= 2, moveu)
  await aba.print('06e-forte')
  await cena(`(c.inimigos.filter((i) => i.__forte).forEach((i) => c.matarInimigo(i)), true)`)
  // Parte 11: no mapa da pausa, as três partes do forte são pontos de perigo
  await colocarLider(forte.x - forte.largura / 2 - 400, forte.y)
  await aba.esperar(`!${CENA}.emCombate`, 'o grupo sair de combate', 12000)
  await aba.apertar('esc')
  await aba.esperar(`!!document.querySelector('.mapa-inteiro')`, 'o mapa da pausa', 4000)
  const perigos = await aba.avaliar(`[...document.querySelectorAll('.mapa-inteiro .ponto-de-perigo')].map((p) => p.getAttribute('aria-label'))`)
  conferir('no mapa da pausa, o Portão, o Pátio e a Torre do forte são pontos de perigo', perigos.length === 3 && ['Portão', 'Pátio', 'Torre'].every((nome) => perigos.some((p) => p.includes(nome))), perigos)
  await aba.print('06f-perigos-no-mapa')
  await aba.apertar('esc')
  await pausa(400)
  // A teia da Aranha-Mãe: prende o Líder (não anda) e solta depois do tempo
  const teia = await cena(`(() => {
    c.invencivel = false
    c.__vidaAntes = { vida: c.lider.vida, maxima: c.lider.vidaMaxima }
    c.lider.vida = c.lider.vidaMaxima = 100000
    const m = c.criarMobDoMundo('aranhaMae', 'facil', { x: ${faixa.x + 700}, y: ${faixa.y} })
    m.__mae = true; m.vida = m.vidaMaxima = 1e6; m.dormindo = false
    return { msPreso: m.config.teia.msPreso }
  })()`)
  await cena(`(c.inimigos.filter((i) => !i.__mae && Math.hypot(i.x - ${faixa.x + 700}, i.y - ${faixa.y}) < 1500).forEach((i) => c.matarInimigo(i)), true)`)
  await colocarLider(faixa.x + 350, faixa.y)
  await aba.esperar(`${CENA}.lider.presoAte > ${CENA}.agora`, 'a teia prender', 12000).catch(() => {})
  await pausa(250) // o tiro também empurra: espera o empurrão acabar antes de medir
  const presoAntes = await cena(`({ preso: c.lider.presoAte > c.agora, x: c.lider.x, teia: (c.teias ?? []).length })`)
  conferir('a teia da Aranha-Mãe prende o Líder (e aparece em cima dele)', presoAntes.preso && presoAntes.teia >= 1, presoAntes)
  await aba.segurar(['a'], 500)
  const presoDepois = await cena(`({ x: c.lider.x, preso: c.lider.presoAte > c.agora })`)
  conferir('preso, o Líder não anda', !presoDepois.preso || Math.abs(presoDepois.x - presoAntes.x) <= 3, { antes: presoAntes.x, depois: presoDepois.x })
  await aba.print('06f-teia')
  await cena(`(c.inimigos.filter((i) => i.__mae).forEach((i) => c.matarInimigo(i)), true)`)
  await pausa(teia.msPreso + 200)
  await aba.segurar(['a'], 500)
  const solto = await cena(`({ preso: c.lider.presoAte > c.agora, x: c.lider.x, teia: (c.teias ?? []).length })`)
  conferir('depois do tempo, a teia some e o Líder volta a andar', !solto.preso && solto.teia === 0 && Math.abs(solto.x - presoDepois.x) > 20, solto)
  await cena(`(c.lider.vidaMaxima = c.__vidaAntes.maxima, c.lider.vida = c.__vidaAntes.vida, c.invencivel = true, true)`)

  console.log('10. Aliado longe ou preso volta por fora da tela')
  await colocarLider(faixa.x + 600, faixa.y)
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
  // (a Clareira das Flores fica no meio da Fácil: o Líder passa por ela)
  await cena(`(() => { const a = c.mapa.areas.find((u) => u.id === 'clareiraDasFlores'); const p = c.lugarLivre(c.lider.tamanho, a, c.lider, 4); c.lider.colocarEm(p.x, p.y); c.cameras.main.centerOn(p.x, p.y); return true })()`)
  await pausa(600)
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

  console.log('11b. Opções de desenvolvedor (RF61, só no npm run dev): super velocidade e teletransporte')
  await cena(`(c.inimigos.filter((i) => Math.hypot(i.x - ${faixa.x}, i.y - ${faixa.y}) < 1800).forEach((i) => c.matarInimigo(i)), true)`)
  const andarParaADireita = async () => {
    await colocarLider(faixa.x, faixa.y)
    await pausa(300)
    const antes = await cena(`c.lider.x`)
    await aba.segurar(['d'], 500)
    return Math.round((await cena(`c.lider.x`)) - antes)
  }
  const em1x = await andarParaADireita()
  await aba.clicar('Super velocidade', false)
  await pausa(200)
  const em3x = await andarParaADireita()
  conferir('Super velocidade 3×: o Líder anda bem mais longe no mesmo tempo', (await cena(`c.superVelocidade`)) === 3 && em3x > em1x * 2.2, { em1x, em3x })
  await aba.clicar('Super velocidade', false)
  await pausa(200)
  const travas = await cena(`({ vezes: c.superVelocidade, dev: c.saltoMaximoPorQuadro(1000 / 60) })`)
  await aba.clicar('Super velocidade', false)
  await pausa(200)
  const travaNormal = await cena(`c.saltoMaximoPorQuadro(1000 / 60)`)
  conferir('6×: a trava do maior passo cresce só no dev; de volta a 1×, é a de sempre', travas.vezes === 6 && travas.dev > travaNormal * 3 && (await cena(`c.superVelocidade`)) === 1, { ...travas, normal: travaNormal })
  // Clique no minimapa: o grupo vai para o lugar livre mais perto do ponto, com a câmera junto
  // (o minimapa mostra uma janela em volta do Líder: o alvo é um ponto livre dentro dela, 1000 px à direita)
  const alvoDoDev = await cena(`(() => {
    const p = c.lugarLivre(c.lider.tamanho, { x: c.lider.x + 1000, y: c.lider.y }, c.lider, 8)
    const t = c.mapa.tamanho, j = { largura: Math.min(3600, t.largura), altura: Math.min(1800, t.altura) }
    j.x = Math.min(Math.max(c.lider.x - j.largura / 2, 0), t.largura - j.largura)
    j.y = Math.min(Math.max(c.lider.y - j.altura / 2, 0), t.altura - j.altura)
    return { x: Math.round(p.x), y: Math.round(p.y), janela: j }
  })()`)
  const noMinimapa = await aba.avaliar(`(() => { const r = document.querySelector('.minimapa').getBoundingClientRect(), j = ${JSON.stringify(alvoDoDev.janela)}; return { x: r.left + r.width * (${alvoDoDev.x} - j.x) / j.largura, y: r.top + r.height * (${alvoDoDev.y} - j.y) / j.altura } })()`)
  await aba.clicarNaTela(noMinimapa.x, noMinimapa.y)
  await pausa(400)
  const depoisDoMinimapa = await cena(`(() => {
    const dentro = (e) => c.paredesPerto(e, 100).some((p) => Math.abs(e.x - p.x) * 2 < p.largura + 2 * e.raio - 4 && Math.abs(e.y - p.y) * 2 < p.altura + 2 * e.raio - 4)
    const cam = c.cameras.main
    return {
      lider: Math.round(Math.hypot(c.lider.x - ${alvoDoDev.x}, c.lider.y - ${alvoDoDev.y})),
      grupo: Math.round(Math.max(...c.aliados.map((a) => Math.hypot(a.x - c.lider.x, a.y - c.lider.y)))),
      dentroDeParede: c.grupo.filter(dentro).length,
      camera: Math.round(Math.hypot(cam.midPoint.x - c.lider.x, cam.midPoint.y - c.lider.y)),
    }
  })()`)
  conferir('clique no minimapa: o Líder e o grupo vão para o ponto (lugar livre), com a câmera junto', depoisDoMinimapa.lider < 160 && depoisDoMinimapa.grupo < 220 && depoisDoMinimapa.dentroDeParede === 0 && depoisDoMinimapa.camera < 200, depoisDoMinimapa)
  await aba.print('07b-teletransporte-minimapa')
  // T + clique no mapa: vai para o ponto clicado, sem atacar
  const antesDoT = await cena(`({ x: c.lider.x, y: c.lider.y, vezes: c.teletransportes ?? 0 })`)
  const naTelaDoT = await naTela(antesDoT.x + 320, antesDoT.y)
  await aba.tecla('t', 'keyDown')
  await pausa(80)
  await aba.clicarNaTela(naTelaDoT.x, naTelaDoT.y)
  await pausa(80)
  await aba.tecla('t', 'keyUp')
  await pausa(300)
  const depoisDoT = await cena(`({ dx: Math.round(c.lider.x - ${antesDoT.x}), vezes: c.teletransportes ?? 0, puxando: !!c.lider.puxando })`)
  conferir('T + clique: o grupo vai para o ponto clicado e o clique não vira ataque', depoisDoT.vezes === antesDoT.vezes + 1 && Math.abs(depoisDoT.dx - 320) < 120 && !depoisDoT.puxando, depoisDoT)
  // Volta ao Reino com Q (num lugar sem mobs, fora de combate; a contagem é adiantada)
  await colocarLider(Z.zonaSegura.x, Z.zonaSegura.y)
  await cena(`(c.inimigos.filter((i) => i.perseguindo || Math.hypot(i.x - ${Z.zonaSegura.x}, i.y - ${Z.zonaSegura.y}) < 1500).forEach((i) => c.matarInimigo(i)), c.ultimoDano = -999999, true)`)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 9000)
  await aba.apertar('q')
  await cena(`(c.retorno.msRestantes = 300, true)`)
  await aba.esperarTela('Resumo', 8000)
  const resumo = await aba.texto()
  conferir('o Resumo mostra a exploração (áreas novas e o XP)', /Exploração\s+\d+ áreas? novas? \(\+\d+ XP\)/.test(resumo), resumo.split('Exploração')[1]?.slice(0, 40))
  const salvo = await aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso`)
  conferir('o mapa descoberto ficou no save (névoa, áreas e regiões)', salvo.mapasDescobertos?.floresta?.areas?.includes('clareiraDasFlores') && salvo.mapasDescobertos.floresta.nevoa.length > 50 && salvo.regioesDescobertas?.floresta?.includes('facil'), { areas: salvo.mapasDescobertos?.floresta?.areas, regioes: salvo.regioesDescobertas?.floresta })

  console.log('12. A Caravana (RF56, Parte 7): paradas nas zonas neutras, o preço e o ouro só no fim')
  await aba.clicar('Jogar novamente')
  await aba.clicar('Floresta')
  await aba.esperarTela('Caravana')
  const paradasDaCaravana = async () =>
    aba.avaliar(`[...document.querySelectorAll('.caravana-parada')].map((li) => { const b = li.querySelector('button'); return { nome: li.querySelector('.caravana-nome').textContent, botao: b.textContent.trim(), ativo: !b.disabled, motivo: li.querySelector('.motivo-do-botao')?.textContent ?? null, preco: Number((b.textContent.match(/por (\\d+) de ouro/) ?? [])[1] ?? 0) } })`)
  const ouroDoSave = () => aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso.ouro`)
  let paradas = await paradasDaCaravana()
  const ouroAntes = await ouroDoSave()
  const precos = paradas.map((p) => p.preco)
  // Parte 11: o preço é o ouro de uma partida típica da região perto (a do chefe pode ficar no preço da de antes)
  conferir('a Caravana tem o início de graça e 4 zonas neutras, nenhuma mais barata que a de antes', paradas.length === 5 && precos[0] === 0 && precos.slice(1).every((p, i) => p >= precos[i] && p > 0) && precos[1] < precos[2] && precos[2] < precos[3] && paradas[0].ativo, paradas)
  conferir('só o preço barra: quem custa mais que o ouro fica apagado, com "Falta N de ouro"', paradas.every((p) => p.ativo === (p.preco <= ouroAntes) && (p.ativo || p.motivo?.startsWith('Falta'))), { ouroAntes, paradas })
  await aba.print('08-caravana')
  // Ouro de teste (painel </> DEV, só no npm run dev)
  if (await aba.temBotao('</> DEV')) await aba.clicar('</> DEV', false)
  await aba.clicar('Itens de teste', false)
  await pausa(300)
  const ouroComTeste = await ouroDoSave()
  paradas = await paradasDaCaravana()
  const vau = paradas.find((p) => p.nome === 'Vau do Riacho')
  conferir('com ouro, a parada fica liberada', vau.ativo && ouroComTeste >= vau.preco, { ouroComTeste, vau })
  await aba.clicar(vau.botao)
  await aba.esperarTela('Preparação')
  conferir('a Preparação mostra a parada e o preço da Caravana (antes → depois)', (await aba.texto()).includes(`Caravana: ${vau.preco} de ouro`), vau.preco)
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.lider && !!${CENA}.exploracao`, 'a Floresta', 20000)
  await pausa(800)
  conferir('o ouro da Caravana ainda não saiu do save durante a partida (RF12)', (await ouroDoSave()) === ouroComTeste)
  const nascimento = await cena(`({ lider: { x: Math.round(c.lider.x), y: Math.round(c.lider.y) }, inicio: c.mapa.regioes.find((r) => r.id === 'neutraDaCurva1').inicio, regiao: c.regiaoEm(c.lider)?.id, maisPerto: Math.round(Math.min(...c.inimigos.filter((i) => i.config.hostil !== false).map((i) => Math.hypot(i.x - c.lider.x, i.y - c.lider.y)))) })`)
  conferir('o grupo nasce na zona neutra da parada (o Vau do Riacho), fora de qualquer região', Math.hypot(nascimento.lider.x - nascimento.inicio.x, nascimento.lider.y - nascimento.inicio.y) < 100 && nascimento.regiao === 'neutraDaCurva1', nascimento)
  conferir('...sem mob hostil perto', nascimento.maisPerto > 600, nascimento.maisPerto)
  const taxaNoVau = await aba.avaliar(`parseInt(document.querySelector('.hud').innerText.split('Fuga (F): ')[1] ?? '', 10)`)
  conferir('a taxa já começa com a distância da parada (maior que a do ponto inicial)', taxaNoVau > taxaPerto, { taxaNoVau, taxaPerto })
  const reveladasAntes = await cena(`c.exploracao.nevoa.bits.reduce((a, b) => a + b, 0)`)
  conferir('o minimapa já começa com o que foi descoberto antes', reveladasAntes >= exploracao.reveladas, { agora: reveladasAntes, antes: exploracao.reveladas })
  conferir('áreas já descobertas não dão XP de novo', !(await cena(`c.exploracao.novas.includes('clareiraDasFlores')`)))

  console.log('13. Coleta com E, drops e mochila da partida (TASK-064)')
  await cena(`(c.invencivel = true, true)`)
  const recursos = await cena(`c.itensNoChao.filter((i) => i.tipo === 'natural' && i.expiraEm === null && !i.anel).length`)
  conferir('a Floresta tem recursos no chão (cogumelo, erva, madeira), naturais: sem tempo e sem anel', recursos > 20, recursos)
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
  const drop = await cena(`(() => { const l = c.inimigos.find((i) => i.__drop); const ponto = { x: l.x, y: l.y }; const antes = c.itensNoChao.length; c.acertar(l, 99999, c.lider, 0, c.lider); const novo = c.itensNoChao.slice(antes)[0]; return novo ? { id: novo.item.id, tipo: novo.tipo, anel: !!novo.anel, quantidade: novo.quantidade, some: Math.round((novo.expiraEm - c.agora) / 1000), x: novo.x, y: novo.y, longe: Math.round(Math.hypot(novo.x - ponto.x, novo.y - ponto.y)) } : null })()`)
  conferir('o lobo derrotado deixa a pele no chão como dropado: anel do tempo e some em 30 s', drop?.id === 'peleDeLobo' && drop.tipo === 'dropado' && drop.anel && drop.some > 27 && drop.some <= 30 && drop.longe < 80, drop)
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
  conferir('E com a mochila cheia: o dropado continua no chão com o tempo que tinha (até 30 s)', cheia && cheia.some <= 30 && cheia.some > 20, cheia)
  await aba.print('10-mochila-cheia')
  // Natural com a mochila cheia: continua natural (nunca some sozinho)
  const natural = await cena(`(() => { const i = c.itensNoChao.find((um) => um.tipo === 'natural'); return { x: i.x, y: i.y, id: i.item.id } })()`)
  await colocarLider(natural.x - 40, natural.y)
  await pausa(300)
  await aba.apertar('e')
  await pausa(300)
  const naturalCheia = await cena(`(() => { const i = c.itensNoChao.find((um) => um.x === ${natural.x} && um.y === ${natural.y}); return i ? { tipo: i.tipo, expiraEm: i.expiraEm } : null })()`)
  conferir('o natural que não coube continua natural, sem tempo', naturalCheia?.tipo === 'natural' && naturalCheia.expiraEm === null, naturalCheia)
  // Nos últimos 5 s o dropado pisca
  await cena(`(c.itensNoChao.filter((i) => i.item.id === 'peleDeLobo').forEach((i) => { i.expiraEm = c.agora + 3500 }), true)`)
  const alfas = []
  for (let i = 0; i < 8; i++) {
    alfas.push(await cena(`c.itensNoChao.find((i) => i.item.id === 'peleDeLobo')?.desenho.alpha ?? -1`))
    await pausa(90)
  }
  conferir('nos últimos 5 s o dropado pisca', alfas.some((a) => a < 0.5) && alfas.some((a) => a === 1), alfas)
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
  // Desde a Fase 4, o Resumo lista só o que foi coletado com E (a madeira do botão "Encher mochila" não foi coletada, mas
  // vai para a Mochila do Reino do mesmo jeito: a conferência seguinte olha o save)
  conferir('o Resumo lista os itens coletados (só o que foi pego com E)', linhaDosItens.includes('Cogumelo') && !linhaDosItens.includes('Madeira'), linhaDosItens)
  const mochilaDoReino = await aba.avaliar(`JSON.parse(localStorage.getItem('jogo-rpg:convidado')).progresso.mochila`)
  conferir('os itens foram para a Mochila do Reino (no save)', mochilaDoReino.some((i) => i.id === 'cogumelo') && mochilaDoReino.some((i) => i.id === 'madeira'), mochilaDoReino)
  const textoDoResumo = await aba.texto()
  const recebido = Number((textoDoResumo.split('Ouro recebido')[1] ?? '').match(/\d+/)?.[0] ?? 0)
  conferir('o Resumo mostra a Caravana, e o preço saiu do ouro no fim', textoDoResumo.includes(`−${vau.preco} de ouro`) && (await ouroDoSave()) === ouroComTeste - vau.preco + recebido, { recebido, depois: await ouroDoSave(), ouroComTeste, preco: vau.preco })

  console.log('14. O chefe da Floresta: o Ogro (TASK-065; Parte 6d)')
  await aba.clicar('Jogar novamente')
  await aba.clicar('Floresta')
  await aba.passarPelaCaravana()
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.lider`, 'a partida', 20000)
  await pausa(800)
  // (a Caravana não deixa dentro do domínio: o roteiro leva o grupo até a entrada dele)
  await colocarLider(Z.dominioDoBoss.x, Z.dominioDoBoss.y)
  await pausa(600)
  // O Ogro nasce sozinho no lugar do chefe (Parte 6d)
  await pausa(300)
  const boss = await cena(`({ tipo: c.boss?.tipo, nome: c.boss?.config.nome, x: Math.round(c.boss.x), y: Math.round(c.boss.y), noDominio: c.noDominioDeBoss(c.boss), liderNoDominio: c.noDominioDeBoss(c.lider), blocos: !!c.boss.desenhoEmCodigo?.grafico.visible })`)
  conferir('o Ogro nasce no domínio do fim do mapa, e o Líder está na entrada do domínio', boss.tipo === 'ogro' && boss.noDominio && boss.liderNoDominio, boss)
  conferir('o Ogro é desenhado em blocos (sem imagem ainda)', boss.blocos, boss)
  conferir('no domínio do Boss, a barra de vida grande aparece no HUD', await aba.avaliar(`!!document.querySelector('.barra-do-boss')`))
  // Ataque avisado: o pisão perto do Líder, sem Invencível
  // (Parte 8: os golpes do Ogro tiram 70 a 110; o Arqueiro de teste ganha vida de sobra para a conferência não acabar a partida)
  await cena(`(c.invencivel = false, c.lider.vidaMaxima = 2000, c.lider.vida = c.lider.vidaMaxima, c.lider.fimDaImunidade = 0, c.lider.imunidades = null, c.inimigos.filter((i) => !i.ehBoss).forEach((i) => c.matarInimigo(i)), true)`)
  await cena(`(() => { c.lider.colocarEm(c.boss.x - 140, c.boss.y); c.boss.alvo = c.lider; c.boss.estado = 'perseguindo'; c.boss.comecarAtaque('pisao', c.agora); return true })()`)
  const durante = await cena(`({ aviso: !!c.boss.aviso, vida: c.lider.vida, maxima: c.lider.vidaMaxima, estado: c.boss.estado })`)
  conferir('antes do golpe, a marca aparece no chão e ninguém leva dano ainda', durante.aviso && durante.vida === durante.maxima && durante.estado === 'avisando', durante)
  await aba.print('11-boss-avisando')
  await aba.esperar(`${CENA}.boss.estado !== 'avisando'`, 'o golpe', 4000)
  await pausa(150)
  const depoisDoGolpe = await cena(`({ vida: c.lider.vida, maxima: c.lider.vidaMaxima, aviso: !!c.boss.aviso })`)
  conferir('quem ficou na marca leva o golpe, e a marca some', depoisDoGolpe.vida < depoisDoGolpe.maxima && !depoisDoGolpe.aviso, depoisDoGolpe)
  await cena(`(() => { c.lider.vida = c.lider.vidaMaxima; c.lider.fimDaImunidade = 0, c.lider.imunidades = null; c.boss.ultimoAtaque = null; c.boss.comecarAtaque('pisao', c.agora); c.lider.colocarEm(c.boss.x - 420, c.boss.y); return true })()`)
  await aba.esperar(`${CENA}.boss.estado !== 'avisando'`, 'o golpe', 4000)
  await pausa(150)
  conferir('quem sai da marca antes do golpe não leva dano', await cena(`c.lider.vida === c.lider.vidaMaxima`))
  // O terceiro golpe do Ogro: o arremesso. A marca aparece onde o Líder está; quem fica nela leva a pedra
  await cena(`(() => { c.lider.vida = c.lider.vidaMaxima; c.lider.fimDaImunidade = 0, c.lider.imunidades = null; c.boss.ultimoAtaque = null; c.lider.colocarEm(c.boss.x - 500, c.boss.y); return true })()`)
  await pausa(200)
  const marcaDaPedra = await cena(`(() => { c.boss.alvo = c.lider; c.boss.estado = 'perseguindo'; c.boss.comecarAtaque('arremesso', c.agora); return { aviso: !!c.boss.aviso, longe: Math.round(Math.hypot(c.boss.pontoDaPedra.x - c.lider.x, c.boss.pontoDaPedra.y - c.lider.y)) } })()`)
  conferir('arremesso: a marca aparece no chão onde o Líder está', marcaDaPedra.aviso && marcaDaPedra.longe < 20, marcaDaPedra)
  await aba.esperar(`${CENA}.boss.estado !== 'avisando'`, 'a pedra', 4000)
  await pausa(150)
  const pedra = await cena(`({ vida: c.lider.vida, maxima: c.lider.vidaMaxima, aviso: !!c.boss.aviso })`)
  conferir('...e quem ficou na marca leva a pedra', pedra.vida < pedra.maxima && !pedra.aviso, pedra)
  // Tanque (ajustes de 14/10): o escudo segura golpes e tiros de frente, mas o pisão é em área e atinge mesmo de frente
  await aba.clicar('Tanque')
  await pausa(300)
  await cena(`(() => { c.lider.vida = c.lider.vidaMaxima; c.lider.fimDaImunidade = 0, c.lider.imunidades = null; c.boss.ultimoAtaque = null; c.lider.colocarEm(c.boss.x - 140, c.boss.y); return true })()`)
  // Mira no Boss: o escudo fica virado para ele
  const mira = await naTela(await cena(`c.boss.x`), await cena(`c.boss.y`))
  await aba.moverMouse(mira.x, mira.y)
  await pausa(300)
  const deFrente = await cena(`c.lider.escudo?.ativo === true && c.lider.escudo.bloqueiaGolpe(c.boss)`)
  await cena(`(c.boss.alvo = c.lider, c.boss.estado = 'perseguindo', c.boss.comecarAtaque('pisao', c.agora), c.lider.colocarEm(c.boss.x - 140, c.boss.y), true)`)
  await aba.esperar(`${CENA}.boss.estado !== 'avisando'`, 'o pisão', 4000)
  await pausa(150)
  const tanque = await cena(`({ vida: c.lider.vida, maxima: c.lider.vidaMaxima })`)
  conferir('o Tanque virado para o Boss (escudo de frente) leva o pisão em área', deFrente && tanque.vida < tanque.maxima, { deFrente, ...tanque })
  // Escudo contra golpe forte (ajustes na partida, 14/10): a investida do Boss (40) passa do limite do Tanque do começo
  // (Força 15: 32,5) e rompe o escudo; o Tanque leva o dano inteiro
  await pausa(700)
  await cena(`(() => { c.lider.vida = c.lider.vidaMaxima; c.lider.fimDaImunidade = 0, c.lider.imunidades = null; c.boss.ultimoAtaque = null; c.lider.colocarEm(c.boss.x - 300, c.boss.y); return true })()`)
  const miraDaInvestida = await naTela(await cena(`c.boss.x`), await cena(`c.boss.y`))
  await aba.moverMouse(miraDaInvestida.x, miraDaInvestida.y)
  await pausa(300)
  await cena(`(c.boss.alvo = c.lider, c.boss.estado = 'perseguindo', c.boss.comecarAtaque('investida', c.agora), true)`)
  await aba.esperar(`${CENA}.boss.estado === 'perseguindo' || ${CENA}.lider.vida < ${CENA}.lider.vidaMaxima`, 'a investida', 5000)
  await pausa(250)
  const investida = await cena(`({ perdeu: Math.round(c.lider.vidaMaxima - c.lider.vida), forca: c.lider.forca, rompido: c.children.list.some((o) => o.type === 'Text' && o.text === 'Escudo rompido!'), deFrente: c.lider.escudo.bloqueiaGolpe(c.boss) })`)
  await aba.print('11b-escudo-rompido-pelo-boss')
  conferir('a investida do Boss rompe o escudo do Tanque do começo ("Escudo rompido!") e tira o dano inteiro', investida.rompido && investida.perdeu >= 40, investida)
  await aba.clicar('Arqueiro')
  await pausa(300)
  // Derrota do Boss, com o drop especial forçado em 100% (barra de teste, só no npm run dev)
  await aba.clicar('Drop especial do Boss', false)
  await cena(`(c.invencivel = true, c.acertar(c.boss, 999999, c.lider, 0, c.lider), true)`)
  await pausa(500)
  const vitoria = await cena(`({ bonus: c.ganhos.bonusDeBoss, esperado: c.boss.config.bonus, especial: c.itensNoChao.some((i) => i.item.id === 'cintoDoOgro'), couro: c.itensNoChao.some((i) => i.item.id === 'couroDoOgro') })`)
  conferir('o Ogro derrotado dá o bônus de Boss', vitoria.bonus === vitoria.esperado && vitoria.bonus > 0, vitoria)
  conferir('com a chance forçada em 100%, o equipamento especial cai (o Cinto do Ogro, e o couro)', vitoria.especial && vitoria.couro, vitoria)
  conferir('sem o Boss, a barra grande some do HUD', !(await aba.avaliar(`!!document.querySelector('.barra-do-boss')`)))
  await aba.print('12-boss-derrotado')
  await cena(`(c.inimigos.forEach((i) => c.matarInimigo(i)), c.ultimoDano = -999999, true)`)
  await aba.esperar(`!${CENA}.emCombate`, 'sair de combate', 9000)
  await aba.apertar('q')
  await cena(`(c.retorno.msRestantes = 300, true)`)
  await aba.esperarTela('Resumo', 8000)
  const resumoDoBoss = await aba.texto()
  const base = Number((resumoDoBoss.match(/\(base (\d+)\)/) ?? [])[1] ?? 0)
  conferir('o Resumo mostra o chefe derrotado, e a pontuação base inclui o bônus (RF49)', resumoDoBoss.includes(`derrotado (+${vitoria.esperado} pontos)`) && base >= vitoria.esperado, base)

  console.log('15. TEST-005: 60 FPS no pior cenário (grupo de 5 e todos os mobs da Difícil), por 2 minutos')
  await aba.clicar('Jogar novamente')
  await aba.clicar('Floresta')
  await aba.passarPelaCaravana()
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.lider && !!${CENA}.exploracao`, 'a Floresta', 20000)
  await pausa(800)
  // o pior cenário é na Difícil: o roteiro leva o grupo até o início dela
  await colocarLider(Z.dificil.x, Z.dificil.y)
  await pausa(600)
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
