// Roteiro do som (Parte 13, 27/11/2026). Uso: npm run testar:som
// Liga o Vite e um Edge escondido e confere, pelo medidor do gerenciador de áudio (window.__somDoJogo, só no npm run
// dev): nada toca (nem existe o áudio) antes do primeiro clique; depois do clique, a música da Tela inicial sai de
// verdade; a tecla M deixa tudo mudo e volta; a música de cada tela (Reino, Mapa, minijogo, Caravana, partida, combate,
// chefe, vitória, derrota); os efeitos (clique, moeda, colher, puxar e soltar o arco, dano, mochila).
// Também "grava" cada música e cada efeito sem tocar (OfflineAudioContext), confere que nada estoura e salva as músicas
// em WAV em testes-do-navegador/som/ (para ouvir sem abrir o jogo).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { abrirNavegador, criarConferencias, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const PASTA = resolve('testes-do-navegador', 'som')
mkdirSync(PASTA, { recursive: true })
const vite = await ligarVite(5197)
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
const som = () => aba.avaliar(`window.__somDoJogo?.situacao() ?? null`)
// O maior nível de som em ~1 s (o medidor olha 2048 amostras por vez)
const nivelMaximo = async (vezes = 10) => {
  let maior = 0
  for (let i = 0; i < vezes; i++) {
    maior = Math.max(maior, (await som())?.nivel ?? 0)
    await pausa(100)
  }
  return maior
}
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
  await pausa(250)
}
const passarPeloNpc = async () => {
  await pausa(150)
  if (await aba.avaliar(`(() => { const b = document.querySelector('.npc-menu .botao-de-acao'); b?.click(); return !!b })()`)) await pausa(250)
}
const esperarMusica = (id, ms = 6000) => aba.esperar(`window.__somDoJogo?.situacao().musica === ${JSON.stringify(id)}`, `a música "${id}"`, ms).then(() => true, () => false)
const efeitos = async () => (await som())?.efeitos ?? {}

try {
  navegador = await abrirNavegador('som', PASTA)
  aba = await navegador.novaAba('aba1')
  await aba.simularTelaCheia()
  console.log(`Site: ${vite.site}`)
  await aba.abrir(vite.site)

  console.log('1. Antes do primeiro clique, nada toca (regra do navegador)')
  await pausa(1500)
  const antes = await som()
  conferir('o medidor do som existe (npm run dev)', antes !== null)
  conferir('antes do clique: o áudio nem existe e nada toca, mas a música da Tela inicial já está pedida', antes?.destravado === false && antes?.musica === null && antes?.pedida === 'reino' && antes?.nivel === 0, antes)

  console.log('2. O primeiro clique liga o áudio, e a música calma começa')
  await aba.clicarNaTela(40, 400) // um clique de verdade no fundo da tela (nenhum botão)
  await pausa(1500)
  const depois = await som()
  const nivelDaInicial = await nivelMaximo()
  conferir('depois do clique: o áudio está ligado e toca a música calma ("reino")', depois.destravado && depois.estado === 'running' && depois.musica === 'reino', depois)
  conferir('as notas estão saindo e o som chega de verdade na saída', depois.notas > 5 && nivelDaInicial > 0.003, { notas: depois.notas, nivel: nivelDaInicial })
  conferir('o volume é baixo (nada perto de estourar)', nivelDaInicial < 0.5, nivelDaInicial)

  console.log('3. A tecla M deixa mudo e volta')
  await aba.apertar('m')
  await pausa(600)
  const mudo = await som()
  const nivelMudo = await nivelMaximo()
  conferir('com M: a música fica sem volume e não sai som', mudo.volumes.musica === 0 && mudo.volumes.efeitos === 0 && mudo.ganhoDaMusica < 0.01 && nivelMudo < 0.002, { volumes: mudo.volumes, ganho: mudo.ganhoDaMusica, nivel: nivelMudo })
  const cliquesAntes = (await efeitos()).clique ?? 0
  await clicar('Iniciar jogo')
  await pausa(300)
  conferir('mudo: o clique de botão não toca', ((await efeitos()).clique ?? 0) === cliquesAntes)
  await aba.apertar('m')
  await pausa(600)
  const volta = await som()
  const nivelDaVolta = await nivelMaximo()
  conferir('M de novo: a música volta (a mesma, sem recomeçar)', volta.volumes.musica === 1 && volta.ganhoDaMusica > 0.1 && nivelDaVolta > 0.003 && volta.musicas.reino === 1, { volumes: volta.volumes, nivel: nivelDaVolta, vezes: volta.musicas })

  console.log('4. O clique dos botões e a música de cada tela fora da partida')
  await aba.esperarTela('Login').catch(() => {})
  await passo('Jogar como convidado')
  conferir('o clique de botão toca o efeito "clique"', ((await efeitos()).clique ?? 0) > cliquesAntes, await efeitos())
  await aba.esperarTela('Narrativa inicial')
  await passo('Continuar')
  await passo('Arqueiro')
  await passo('Escolher Arqueiro')
  await aba.esperarTela('Reino')
  conferir('no Reino, a música calma continua', (await som()).musica === 'reino')
  // comprar: a moeda (o convidado começa sem ouro: os itens de teste do painel DEV dão ouro)
  await aba.avaliar(`(document.querySelector('.painel-dev-mini')?.click(), true)`)
  await pausa(200)
  await passo('Itens de teste', true)
  await passo('Mercado')
  await passarPeloNpc()
  await aba.avaliar(`([...document.querySelectorAll('button.slot')].find((b) => (b.getAttribute('aria-label') ?? '').startsWith('Poção de vida'))?.click(), true)`)
  await pausa(250)
  const moedasAntes = (await efeitos()).moeda ?? 0
  await passo('Comprar por 25', true)
  conferir('comprar no Mercado toca a moeda', ((await efeitos()).moeda ?? 0) === moedasAntes + 1, await efeitos())
  await aba.apertar('esc')
  await pausa(300)
  await aba.esperarTela('Reino')
  await passo('Jogar')
  await aba.esperarTela('Mapa')
  conferir('no Mapa, a música de aventura', await esperarMusica('aventura'))
  await passo('Fazenda')
  conferir('no minijogo, a música leve', await esperarMusica('minijogo'))
  await passo('Começar rodada', true)
  await clicar('Entendi')
  await pausa(300)
  const colheuAntes = (await efeitos()).colher ?? 0
  const cliquesNaFazenda = (await efeitos()).clique ?? 0
  await aba.avaliar(`(document.querySelector('.canteiro')?.click(), true)`)
  await pausa(200)
  const naFazenda = await efeitos()
  conferir('na Fazenda, clicar no canteiro toca o "colher" (e não o clique de botão)', (naFazenda.colher ?? 0) === colheuAntes + 1 && (naFazenda.clique ?? 0) === cliquesNaFazenda, naFazenda)
  await aba.apertar('esc')
  await pausa(300)
  await aba.apertar('esc')
  await pausa(400)
  await aba.esperarTela('Mapa').catch(() => {})
  await passo('Floresta')
  await aba.esperarTela('Caravana')
  const naCaravana = await som()
  conferir('na Caravana, ainda a de aventura', naCaravana.musica === 'aventura')
  await aba.clicar('Começar no início', false)
  await aba.esperarTela('Preparação')
  conferir('na Preparação, ainda a de aventura (a mesma, sem recomeçar)', (await som()).musica === 'aventura' && (await som()).musicas.aventura === naCaravana.musicas.aventura, (await som()).musicas)

  console.log('5. Na partida: a da Floresta, a do combate (troca devagar), a do chefe e os efeitos')
  await passo('Começar partida')
  await aba.esperar(`!!${CENA}?.lider`, 'a partida', 20000)
  conferir('na partida, a música de exploração da Floresta', await esperarMusica('floresta', 8000))
  // em combate (o dano dos últimos 5 s): a do combate
  await cena(`(c.ultimoDano = c.agora, true)`)
  conferir('em combate, a música do combate', await esperarMusica('combate', 3000))
  await pausa(300)
  const naTroca = await som()
  conferir('a troca é devagar: logo depois, a música ainda está entrando', naTroca.notas > 0, naTroca)
  // fora de combate de novo (sem dano e sem mob perseguindo): volta a da Floresta
  conferir('fora de combate, volta a da Floresta', await esperarMusica('floresta', 9000))
  // os efeitos do Líder (Arqueiro): puxar e soltar o arco
  const antesDoArco = await efeitos()
  await aba.clicarNaTela(900, 380)
  await pausa(300)
  const depoisDoArco = await efeitos()
  conferir('o clique do Arqueiro toca o puxar do arco e a flecha ao soltar', (depoisDoArco.arcoPuxar ?? 0) > (antesDoArco.arcoPuxar ?? 0) && (depoisDoArco.ataqueArqueiro ?? 0) > (antesDoArco.ataqueArqueiro ?? 0), depoisDoArco)
  await cena(`(c.lider.fimDaImunidade = 0, c.lider.imunidades = null, c.liderLevaGolpe(1, { x: c.lider.x + 20, y: c.lider.y }, 0), true)`)
  await pausa(150)
  conferir('o Líder levando dano toca o "dano"', ((await efeitos()).dano ?? 0) >= 1, await efeitos())
  await aba.apertar('tab')
  await pausa(300)
  conferir('Tab abre a mochila com o som dela', ((await efeitos()).mochila ?? 0) >= 1, await efeitos())
  await aba.apertar('tab')
  await pausa(300)
  // perto do Ogro: a do chefe
  await clicar('Invencível: não')
  await cena(`(c.lider.colocarEm(c.boss.x - 300, c.boss.y), c.cameras.main.centerOn(c.boss.x - 300, c.boss.y), true)`)
  conferir('perto do Ogro, a música do chefe (a mais tensa)', await esperarMusica('boss', 6000))
  await aba.print('partida-perto-do-ogro')

  console.log('6. O fim: a fanfarra da vitória (uma vez) e a da derrota')
  await passo('Vitória')
  await aba.esperarTela('Resumo', 15000)
  conferir('no Resumo de uma vitória, a fanfarra', await esperarMusica('vitoria'))
  await pausa(6000)
  const depoisDaFanfarra = await som()
  const nivelDepois = await nivelMaximo(5)
  conferir('a fanfarra toca uma vez e acaba (não repete)', depoisDaFanfarra.musica === 'vitoria' && depoisDaFanfarra.musicas.vitoria === 1 && nivelDepois < 0.002, { nivel: nivelDepois, vezes: depoisDaFanfarra.musicas })
  await passo('Jogar novamente')
  await passo('Floresta')
  await aba.passarPelaCaravana()
  await passo('Começar partida')
  await aba.esperar(`!!${CENA}?.lider`, 'a partida', 20000)
  await pausa(500)
  await passo('Derrota')
  conferir('na derrota, a música triste da cutscene', await esperarMusica('derrota', 8000))

  console.log('7. Gravar cada música e cada efeito sem tocar: nada estoura, e as músicas viram WAV')
  // as ferramentas de gravação ficam na página (window.__gravarSom), e cada música é gravada numa chamada (20 s cada)
  await aba.avaliar(`(async () => {
    const { partituras } = await import('/src/dados/musicas.js')
    const { audio, efeitos, instrumentos, musicas } = await import('/src/dados/sons.js')
    const { duracaoDaMusica, eventosDaMusica } = await import('/src/regras/partitura.js')
    const { criarSintetizador } = await import('/src/audio/sintetizador.js')
    const taxa = 22050
    const medir = (dados) => {
      let pico = 0
      let soma = 0
      for (const amostra of dados) {
        pico = Math.max(pico, Math.abs(amostra))
        soma += amostra * amostra
      }
      return { pico, rms: Math.sqrt(soma / dados.length) }
    }
    const wav = (dados) => {
      const bytes = new DataView(new ArrayBuffer(44 + dados.length * 2))
      const texto = (onde, s) => [...s].forEach((letra, i) => bytes.setUint8(onde + i, letra.charCodeAt(0)))
      texto(0, 'RIFF'); bytes.setUint32(4, 36 + dados.length * 2, true); texto(8, 'WAVEfmt ')
      bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true)
      bytes.setUint32(24, taxa, true); bytes.setUint32(28, taxa * 2, true); bytes.setUint16(32, 2, true); bytes.setUint16(34, 16, true)
      texto(36, 'data'); bytes.setUint32(40, dados.length * 2, true)
      for (let i = 0; i < dados.length; i++) bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, dados[i])) * 32767, true)
      let binario = ''
      const u8 = new Uint8Array(bytes.buffer)
      for (let i = 0; i < u8.length; i += 0x8000) binario += String.fromCharCode(...u8.subarray(i, i + 0x8000))
      return btoa(binario)
    }
    window.__gravarSom = {
      ids: Object.keys(musicas),
      async musica(id) {
        const partitura = partituras[id]
        const segundos = Math.min(duracaoDaMusica(partitura), 20) + 0.6
        const contexto = new OfflineAudioContext(1, Math.ceil(taxa * segundos), taxa)
        const volume = contexto.createGain()
        volume.gain.value = audio.volumeDaMusica
        volume.connect(contexto.destination)
        const sintetizador = criarSintetizador(contexto, instrumentos)
        for (const evento of eventosDaMusica(partitura)) if (evento.t < segundos - 0.5) sintetizador.tocarEvento(evento, evento.t + 0.05, volume)
        const dados = (await contexto.startRendering()).getChannelData(0)
        return { ...medir(dados), segundos: Math.round(duracaoDaMusica(partitura) * 10) / 10, wav: wav(dados) }
      },
      async efeitos() {
        const resultado = {}
        for (const [id, efeito] of Object.entries(efeitos)) {
          const contexto = new OfflineAudioContext(1, taxa, taxa)
          const volume = contexto.createGain()
          volume.gain.value = audio.volumeDosEfeitos
          volume.connect(contexto.destination)
          criarSintetizador(contexto, instrumentos).efeito(efeito.receita, volume, 0.01)
          resultado[id] = medir((await contexto.startRendering()).getChannelData(0))
        }
        return resultado
      },
    }
    return true
  })()`)
  const gravacoes = { musicas: {}, efeitos: await aba.avaliar(`window.__gravarSom.efeitos()`) }
  for (const id of await aba.avaliar(`window.__gravarSom.ids`)) {
    const { pico, rms, segundos, wav } = await aba.avaliar(`window.__gravarSom.musica(${JSON.stringify(id)})`)
    gravacoes.musicas[id] = { pico, rms }
    writeFileSync(join(PASTA, `musica-${id}.wav`), Buffer.from(wav, 'base64'))
    estado.ultimaAtividade = Date.now()
    console.log(`        ${id}: ${segundos} s · pico ${pico.toFixed(3)} · média ${rms.toFixed(3)}`)
  }
  conferir(
    'toda música sai com som (média acima de 0,01) e sem estourar (pico abaixo de 0,9)',
    Object.values(gravacoes.musicas).every(({ pico, rms }) => rms > 0.01 && pico < 0.9),
    Object.fromEntries(Object.entries(gravacoes.musicas).map(([id, m]) => [id, [m.pico.toFixed(2), m.rms.toFixed(3)]])),
  )
  conferir(
    'todo efeito sai com som e sem estourar (pico entre 0,01 e 0,9)',
    Object.values(gravacoes.efeitos).every(({ pico }) => pico > 0.01 && pico < 0.9),
    Object.fromEntries(Object.entries(gravacoes.efeitos).map(([id, e]) => [id, e.pico.toFixed(2)])),
  )
  const erros = await aba.avaliar(`window.__erros ?? []`)
  conferir('nenhum erro na página', erros.length === 0, erros.slice(0, 5))
} catch (erro) {
  conferir(`o roteiro chegou ao fim (${erro.message})`, false)
} finally {
  parar()
  console.log(`\n${estado.total - estado.falhas} de ${estado.total} conferências passaram. WAVs e prints em ${PASTA}`)
  await desligar(estado.falhas ? 1 : 0)
}
