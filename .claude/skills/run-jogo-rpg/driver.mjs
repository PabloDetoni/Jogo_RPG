// Driver do Jogo RPG: liga o Vite (npm run dev) numa porta livre, abre um Edge escondido (1366x768) e faz os passos
// pedidos na linha de comando, tirando prints. Usa as ferramentas dos roteiros (programacao/scripts/ferramentasDoNavegador.mjs).
// Rodar de dentro de programacao/:
//   node ../.claude/skills/run-jogo-rpg/driver.mjs entrar print:reino clicar:Mercado print:mercado
// Passos:
//   entrar             Iniciar jogo -> Jogar como convidado -> (se for novo) Continuar -> Arqueiro -> Reino
//   clicar:<texto>     clica no botão cujo texto começa com <texto>
//   tecla:<nome>       aperta uma tecla (w a s d e f q r m tab espaco esc um setaCima setaBaixo)
//   segurar:<t>:<ms>   segura uma tecla por <ms> milissegundos
//   mouse:<x>:<y>      clica nesse ponto da tela (pixels da janela de 1366x768)
//   segurarMouse:<x>:<y>:<ms>[:print]  aperta o botão do mouse por <ms> (com :print, continua apertado; solte com soltarMouse:<x>:<y>)
//   esperar:<ms>       espera
//   tela:<título>      espera a tela com esse título (.tela .titulo)
//   eval:<js>          roda JS na página e mostra o resultado (window.__jogoDaPartida existe na partida)
//   print:<nome>       salva programacao/testes-do-navegador/driver/<nome>.png
import { resolve } from 'node:path'
import { abrirNavegador, ligarVite, pausa, portaLivre } from '../../../programacao/scripts/ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'driver')
const passos = process.argv.slice(2)
let vite = null
let navegador = null
let falhou = false
try {
  vite = await ligarVite(await portaLivre())
  console.log(`Vite em ${vite.site}`)
  navegador = await abrirNavegador('driver', PASTA)
  const aba = await navegador.novaAba('aba')
  await aba.abrir(vite.site)
  for (const passo of passos) {
    const [nome, ...resto] = passo.split(':')
    const valor = resto.join(':')
    console.log(`> ${passo}`)
    if (nome === 'entrar') {
      await aba.clicar('Iniciar jogo')
      await aba.clicar('Jogar como convidado')
      await pausa(300)
      if (await aba.temBotao('Continuar')) {
        await aba.clicar('Continuar')
        await aba.clicar('Arqueiro')
        await aba.clicar('Escolher Arqueiro')
      }
      await aba.esperarTela('Reino', 15000)
    } else if (nome === 'clicar') await aba.clicar(valor, false)
    else if (nome === 'tecla') await aba.apertar(valor)
    else if (nome === 'segurar') await aba.segurar([resto[0]], Number(resto[1]))
    else if (nome === 'andarComPrint') {
      // andarComPrint:<tecla>:<ms>:<print>: segura a tecla, tira o print ainda andando e solta
      await aba.tecla(resto[0], 'keyDown')
      await pausa(Number(resto[1]))
      await aba.print(resto[2])
      console.log(`  print em ${resolve(PASTA, resto[2] + '.png')}`)
      await aba.tecla(resto[0], 'keyUp')
    }
    else if (nome === 'mouse') await aba.clicarNaTela(Number(resto[0]), Number(resto[1]), resto[2] === 'direito' ? 'right' : 'left')
    else if (nome === 'clicarEm') await aba.clicarNoElemento(valor)
    else if (nome === 'direitoEm') await aba.clicarNoElemento(valor, 'right')
    else if (nome === 'passarEm') await aba.moverParaElemento(valor)
    else if (nome === 'segurarMouse') {
      const [x, y, ms] = resto.map(Number)
      await aba.moverMouse(x, y)
      await aba.cdp.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
      await pausa(ms)
      if (resto[3] !== 'print') await aba.cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
    } else if (nome === 'soltarMouse') {
      const [x, y] = resto.map(Number)
      await aba.cdp.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
    }
    else if (nome === 'esperar') await pausa(Number(valor))
    else if (nome === 'tela') await aba.esperarTela(valor, 15000)
    else if (nome === 'eval') console.log(JSON.stringify(await aba.avaliar(valor)))
    else if (nome === 'print') {
      await aba.print(valor)
      console.log(`  print em ${resolve(PASTA, valor + '.png')}`)
    } else throw new Error(`passo desconhecido: ${passo}`)
  }
  console.log(`Tela no fim: "${await aba.titulo()}". Erros no console: ${JSON.stringify(await aba.avaliar('window.__erros ?? []'))}`)
} catch (erro) {
  falhou = true
  console.log(`ERRO ${erro.message}`)
} finally {
  await navegador?.fechar()
  await vite?.fechar()
  process.exit(falhou ? 1 : 0)
}
