// Conferência rápida do site publicado como convidado (sem conta de teste): abre o endereço principal, entra como
// convidado e passa pelas telas do Reino conferindo que a interface nova está no ar e que não há erro no console.
// Uso: node scripts/conferirSiteComoConvidado.mjs [endereço]   (padrão: o endereço principal da Vercel)
// Serve quando a conta de teste A está em uso (por exemplo, aberta no navegador de alguém) e o testar:contas:publicado
// não consegue entrar.
import { resolve } from 'node:path'
import { abrirNavegador, criarConferencias, pausa } from './ferramentasDoNavegador.mjs'

const SITE = process.argv[2] ?? process.env.ENDERECO_DA_VERCEL ?? 'https://jogo-rpg-six.vercel.app'
const PASTA = resolve('testes-do-navegador', 'site-convidado')
let navegador = null
const { estado, conferir, parar } = criarConferencias(async () => {
  await navegador?.fechar()
  process.exit(1)
})
let aba = null
const clicar = (texto, comeco = false) =>
  aba.avaliar(`(() => {
    const alvo = [...document.querySelectorAll('button')].filter((b) => !b.disabled).find((b) => ${comeco ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : `b.textContent.trim() === ${JSON.stringify(texto)}`})
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
const passo = async (texto, comeco = false) => {
  if (!(await clicar(texto, comeco))) throw new Error(`não achei o botão "${texto}"`)
  await pausa(400)
}

try {
  navegador = await abrirNavegador('site-convidado', PASTA)
  aba = await navegador.novaAba('aba1')
  console.log(`Site: ${SITE}`)
  await aba.abrir(SITE)
  await passo('Iniciar jogo')
  await passo('Jogar como convidado')
  // Um convidado novo vê a narrativa e a escolha da classe; um que já jogou neste perfil vai direto ao Reino
  if (await clicar('Continuar')) {
    await pausa(400)
    await passo('Arqueiro')
    await passo('Escolher Arqueiro')
  }
  await aba.esperarTela('Reino', 15000)
  conferir('Reino: os lugares têm a linha que diz o que são, e há o "?"', (await aba.avaliar(`document.querySelectorAll('.legenda-do-lugar').length`)) === 6 && (await aba.avaliar(`!!document.querySelector('.botao-ajuda')`)))
  await aba.print('01-reino')
  await passo('Mochila')
  conferir('Mochila: a grade (vazia para o convidado novo, com a explicação)', await aba.avaliar(`!!document.querySelector('.balcao .vazio, .balcao .grade')`))
  await passo('Voltar ao Reino')
  await passo('Mercado')
  conferir('Mercado: o balcão com as ofertas em quadradinhos e o ouro à vista', (await aba.avaliar(`document.querySelectorAll('.balcao-grade button.slot').length`)) >= 5 && (await aba.avaliar(`!!document.querySelector('.ouro-a-vista')`)))
  conferir('Mercado: sem ouro, o botão de comprar fica apagado com o motivo', await aba.avaliar(`!!document.querySelector('.motivo-do-botao')`))
  await aba.print('02-mercado')
  await passo('Catálogo')
  conferir('Catálogo: tudo do beta, com silhuetas', (await aba.avaliar(`document.querySelectorAll('.balcao-grade button.slot-silhueta').length`)) > 0)
  await passo('Voltar ao Reino')
  await passo('Forja')
  conferir('Forja: o boneco com os 7 espaços', (await aba.avaliar(`document.querySelectorAll('.espaco-do-boneco').length`)) === 7)
  await aba.print('03-forja')
  await passo('Voltar ao Reino')
  await passo('Guilda')
  conferir('Guilda: o quadro de avisos com os cartazes', (await aba.avaliar(`document.querySelectorAll('.cartaz').length`)) >= 8)
  await passo('Contrato temporário')
  conferir('Guilda: os contratos como cartas', (await aba.avaliar(`document.querySelectorAll('.carta-de-contrato').length`)) >= 4)
  await aba.print('04-guilda')
  await passo('?')
  conferir('o "?" abre "Como funciona"', (await aba.avaliar(`document.querySelector('[role=dialog]')?.getAttribute('aria-label') ?? ''`)) === 'Como funciona: Guilda')
  await aba.apertar('esc')
  conferir('o site não tem o painel DEV', !(await aba.avaliar(`!!document.querySelector('.painel-dev, .painel-dev-mini')`)))
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
  process.exit(estado.falhas ? 1 : 0)
}
