// Varredura das paredes da Floresta (ajustes da partida, 14/10/2026): o Líder anda encostado em todas as bordas de
// região (as paredes de mata), nas quinas e na borda do mapa, em todas as direções (de frente para a parede e em
// diagonal ao longo dela), e um monitor dentro da página registra qualquer salto de posição num quadro: o Líder só pode
// andar o que a velocidade permite (com a esquiva e o empurrão de golpe), nunca ser teletransportado.
// Uso: npm run testar:paredes   (liga o Vite e um Edge escondido; leva uns 4 minutos)
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa, portaLivre } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'paredes')
const CENA = `window.__jogoDaPartida.scene.getScene('arena')`
let navegador = null
let vite = null
const { estado, conferir, parar } = criarConferencias(async () => {
  await navegador?.fechar()
  await vite?.fechar()
  process.exit(1)
})
let aba = null
const cena = (expr) => aba.avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)

// Monitor: a cada quadro (depois da física e das correções), quanto cada um andou. Salto = mais do que a velocidade
// mais alta permitida no quadro (a esquiva, o empurrão) com uma folga pequena.
const MONITOR = `(() => {
  const c = ${CENA}
  if (c.__monitorDeSaltos) return true
  window.__saltos = []
  window.__maiorPasso = 0
  const ultimo = new Map()
  c.__monitorDeSaltos = () => {
    const ms = c.game.loop.delta
    const limite = c.saltoMaximoPorQuadro ? c.saltoMaximoPorQuadro(ms) : 1100 * ms / 1000 + 8
    for (const e of [...c.grupo, ...c.inimigos.filter((i) => !i.morto)]) {
      const antes = ultimo.get(e)
      ultimo.set(e, { x: e.x, y: e.y })
      if (!antes) continue
      const passo = Math.hypot(e.x - antes.x, e.y - antes.y)
      if (e.colocadoAgora) {
        e.colocadoAgora = false
        continue
      }
      if (e.lider) window.__maiorPasso = Math.max(window.__maiorPasso, passo)
      // Aliados e mobs podem reaparecer fora da vista (o aliado preso volta por fora da tela); à vista, nunca
      const aVista = c.cameras.main.worldView.contains(antes.x, antes.y) || c.cameras.main.worldView.contains(e.x, e.y)
      if (passo > limite && (e.lider || aVista)) window.__saltos.push({ quem: e.lider ? 'Líder' : (e.classe ?? e.tipo ?? '?'), de: [Math.round(antes.x), Math.round(antes.y)], para: [Math.round(e.x), Math.round(e.y)], passo: Math.round(passo), limite: Math.round(limite), ms: Math.round(ms), aVista })
    }
  }
  c.events.on('postupdate', c.__monitorDeSaltos)
  return true
})()`

// Põe o Líder num lugar livre perto do ponto (sem contar como salto)
const colocar = (x, y) =>
  cena(`(() => { const p = c.lugarLivre(c.lider.tamanho, { x: ${x}, y: ${y} }, c.lider, 2, false); c.lider.colocarEm(p.x, p.y); c.lider.colocadoAgora = true; c.cameras.main.centerOn(p.x, p.y); return { x: Math.round(p.x), y: Math.round(p.y) } })()`)

try {
  vite = await ligarVite(await portaLivre())
  navegador = await abrirNavegador('paredes', PASTA)
  aba = await navegador.novaAba('aba1')
  await aba.abrir(vite.site)
  await aba.clicar('Iniciar jogo')
  await aba.clicar('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await aba.clicar('Continuar')
  await aba.clicar('Arqueiro')
  await aba.clicar('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  await aba.clicar('Jogar')
  await aba.clicar('Floresta')
  await aba.esperarTela('Preparação')
  await aba.clicar('Começar partida')
  await aba.esperar(`!!${CENA}?.lider && !document.querySelector('.carregando-a-partida')`, 'a partida', 25000)
  await aba.clicar('Entendi').catch(() => {})
  // Sem mobs (eles empurrariam o Líder) e invencível: só o Líder e as paredes
  await cena(`(c.invencivel = true, c.inimigos.forEach((i) => c.matarInimigo(i)), true)`)
  await aba.avaliar(MONITOR)

  const regioes = await cena(`c.mapa.regioes.map((r) => ({ id: r.id, x0: r.x0, x1: r.x1, y0: r.y0, y1: r.y1 }))`)
  const raio = await cena(`c.lider.raio`)
  console.log(`Regiões: ${regioes.map((r) => r.id).join(', ')} · corpo do Líder: ${raio * 2} px`)
  // Teclas de cada lado: a que vai contra a parede e as duas que andam ao longo dela
  const lados = {
    cima: { contra: 'w', ao: ['a', 'd'], ponto: (r, t) => ({ x: r.x0 + (r.x1 - r.x0) * t, y: r.y0 + raio + 4 }) },
    baixo: { contra: 's', ao: ['a', 'd'], ponto: (r, t) => ({ x: r.x0 + (r.x1 - r.x0) * t, y: r.y1 - raio - 4 }) },
    esquerda: { contra: 'a', ao: ['w', 's'], ponto: (r, t) => ({ x: r.x0 + raio + 4, y: r.y0 + (r.y1 - r.y0) * t }) },
    direita: { contra: 'd', ao: ['w', 's'], ponto: (r, t) => ({ x: r.x1 - raio - 4, y: r.y0 + (r.y1 - r.y0) * t }) },
  }
  let pontos = 0
  const deslizou = []
  for (const regiao of regioes) {
    const antes = (await aba.avaliar(`window.__saltos.length`)) ?? 0
    for (const [nome, lado] of Object.entries(lados)) {
      for (const t of [0.04, 0.3, 0.5, 0.7, 0.96]) {
        const alvo = lado.ponto(regiao, t)
        await colocar(alvo.x, alvo.y)
        await pausa(120)
        // De frente para a parede: não pode virar deslizar para o lado
        const antesDeFrente = await cena(`({ x: c.lider.x, y: c.lider.y })`)
        await aba.segurar([lado.contra], 450)
        const depoisDeFrente = await cena(`({ x: c.lider.x, y: c.lider.y })`)
        const deLado = nome === 'cima' || nome === 'baixo' ? Math.abs(depoisDeFrente.x - antesDeFrente.x) : Math.abs(depoisDeFrente.y - antesDeFrente.y)
        if (deLado > 6) deslizou.push({ regiao: regiao.id, lado: nome, t, deLado: Math.round(deLado) })
        // Em diagonal ao longo dela para os dois lados (até a quina)
        await aba.segurar([lado.contra, lado.ao[0]], 900)
        await aba.segurar([lado.contra, lado.ao[1]], 900)
        // Só ao longo dela, encostado
        await aba.segurar([lado.ao[0]], 500)
        pontos++
      }
      console.log(`  ${regiao.id} · ${nome}: ok`)
    }
    const depois = await aba.avaliar(`window.__saltos.length`)
    const saltos = await aba.avaliar(`window.__saltos.slice(${antes})`)
    conferir(`${regiao.id}: andando encostado em todas as paredes e quinas, o Líder nunca salta de lugar`, depois === antes, saltos.slice(0, 5))
    if (depois !== antes) await aba.print(`salto-${regiao.id}`)
  }
  console.log(`  (${pontos} pontos de parede · maior passo do Líder num quadro: ${(await aba.avaliar(`window.__maiorPasso`)).toFixed(1)} px)`)
  conferir('empurrando de frente contra a parede, o Líder nunca desliza para o lado (no máximo 6 px)', deslizou.length === 0, deslizou.slice(0, 5))

  // Com o grupo e mobs: andando encostado na parede da Fácil, ninguém salta de lugar à vista
  const facil = regioes.find((r) => r.id === 'facil')
  await colocar(facil.x0 + 300, facil.y0 + 40)
  await cena(`(c.encherGrupo(), true)`)
  await pausa(800)
  await cena(`(() => { for (let i = 0; i < 3; i++) { const m = c.criarMobDoMundo('lobo', 'facil', { x: c.lider.x + 220 + i * 60, y: c.lider.y + 80 }); } return true })()`)
  const antesComGrupo = await aba.avaliar(`window.__saltos.length`)
  for (let i = 0; i < 3; i++) {
    await aba.segurar(['w', 'd'], 1500)
    await aba.segurar(['w', 'a'], 1500)
  }
  await aba.segurar(['a'], 1200)
  const comGrupo = await aba.avaliar(`window.__saltos.slice(${antesComGrupo})`)
  conferir('com o grupo e lobos perseguindo, ninguém salta de lugar à vista (Líder, aliados e mobs)', comGrupo.length === 0, comGrupo.slice(0, 5))
  await aba.print('com-o-grupo')
  const mobs = (await aba.avaliar(`window.__saltos`)).filter((s) => s.quem !== 'Líder')
  conferir('nenhum outro corpo saltou de lugar durante a varredura', mobs.length === 0, mobs.slice(0, 5))
  const erros = await aba.avaliar(`window.__erros ?? []`)
  conferir('nenhum erro no console', erros.length === 0, erros.slice(0, 3))
} catch (erro) {
  console.log(`  ERRO ${erro.message}`)
  estado.falhas++
  await aba?.print('erro').catch(() => {})
} finally {
  parar()
  console.log(`\n${estado.total - estado.falhas} de ${estado.total} conferências passaram. Prints em ${PASTA}`)
  await navegador?.fechar()
  await vite?.fechar()
  process.exit(estado.falhas ? 1 : 0)
}
