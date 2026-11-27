// Prints das telas do jogo (Fase 4.5: antes e depois da interface; Fase 5 e Parte 12: os protótipos, TASK-121 a 123).
// Uso: npm run prints -- [pasta] [escuro]
//   pasta: subpasta de testes-do-navegador/telas/ (padrão: "atual"), com os prints numerados na ordem.
//          "prototipos" (Parte 12): salva em documentacao/prototipos/ (escuro: em documentacao/prototipos/escuro/), com o
//          caso de uso no nome (ex.: UC16_mercado_comerciante.png), e, no tema claro, escreve o README com a tabela
//          print → tela → caso de uso → requisitos. Só apaga os UCxx_*.png da pasta (a subpasta iniciais/ fica).
//   escuro: tira os prints no tema escuro.
// Liga o Vite e um Edge escondido (1366 × 768), joga como convidado com os itens de teste do painel DEV e passa por
// cada tela, aba e janela: o acesso (Tela inicial, Login, Criar conta, Confirme o e-mail, Esqueci a senha, Senha nova,
// Apelido), as Configurações e o Como jogar, o Reino com os NPCs, o Mapa, os três minijogos (antes e jogando), a
// Caravana, a Preparação, o carregamento, a partida (pausa com o mapa inteiro, confirmar a fuga, o grupo de 5 com os
// mobs, o chefe, a mochila com Tab), o Resumo e a cutscene da derrota. O painel DEV e a barra de teste somem nos prints.
// As abas que não existirem (numa versão mais antiga) são puladas.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { abrirNavegador, ligarVite, pausa } from './ferramentasDoNavegador.mjs'

const [pastaPedida = 'atual', tema = 'claro'] = process.argv.slice(2)
const PROTOTIPOS = pastaPedida === 'prototipos'
const PASTA = PROTOTIPOS ? resolve('..', 'documentacao', 'prototipos', ...(tema === 'escuro' ? ['escuro'] : [])) : resolve('testes-do-navegador', 'telas', pastaPedida)
if (PROTOTIPOS) {
  mkdirSync(PASTA, { recursive: true })
  for (const arquivo of readdirSync(PASTA)) if (/^UC\d+_.*\.png$/.test(arquivo)) rmSync(join(PASTA, arquivo))
} else {
  rmSync(PASTA, { recursive: true, force: true })
}
const vite = await ligarVite(5197)
let navegador = null
let aba = null
let numero = 0
const tirados = []

// O nome de cada caso de uso (documentacao/docAdicional/06_Descricao_dos_Casos_de_Uso.md), para o README
const casosDeUso = {
  UC01: 'Jogar como convidado',
  UC02: 'Cadastrar conta',
  UC04: 'Autenticar-se',
  UC06: 'Recuperar senha',
  UC07: 'Escolher classe inicial',
  UC10: 'Consultar instruções do jogo',
  UC11: 'Visualizar Ranking',
  UC13: 'Visualizar conquistas',
  UC14: 'Configurar preferências',
  UC15: 'Gerenciar Mochila',
  UC16: 'Negociar no Mercado',
  UC17: 'Gerenciar equipamentos (Forja)',
  UC18: 'Fabricar equipamento',
  UC19: 'Gerenciar personagens (Árvores)',
  UC21: 'Gerenciar missões (Guilda)',
  UC22: 'Aceitar missão',
  UC25: 'Contratar personagem (Guilda)',
  UC26: 'Iniciar partida',
  UC27: 'Selecionar bioma',
  UC29: 'Selecionar Líder',
  UC31: 'Jogar partida',
  UC32: 'Combater monstros',
  UC34: 'Enfrentar o chefe',
  UC36: 'Usar item',
  UC38: 'Pausar partida',
  UC40: 'Fugir com a Pedra de Retorno',
  UC41: 'Encerrar partida',
  UC42: 'Visualizar resumo da partida',
  UC43: 'Jogar minijogo do Planalto',
  UC44: 'Viajar de Caravana',
  UC45: 'Conversar com NPC',
}

const clicar = (texto, comeco = false, seletor = 'button') =>
  aba.avaliar(`(() => {
    const botoes = [...document.querySelectorAll(${JSON.stringify(seletor)})].filter((b) => !b.disabled)
    const alvo = botoes.find((b) => ${comeco ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : `b.textContent.trim() === ${JSON.stringify(texto)}`})
    if (!alvo) return false
    alvo.click()
    return true
  })()`)
const passo = async (texto, comeco = false) => {
  if (!(await clicar(texto, comeco))) throw new Error(`não achei o botão "${texto}"`)
  await pausa(250)
}
// Uma aba pelo nome (pula se não existir)
const abaChamada = async (nome) => {
  const achou = await clicar(nome, false, '[role=tab]')
  await pausa(250)
  return achou
}
// Pula para uma tela pelo painel DEV (a lista "Pular para")
const irPara = async (tela) => {
  await aba.avaliar(`(() => {
    const select = document.querySelector('.painel-dev select')
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, ${JSON.stringify(tela)})
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  })()`)
  await pausa(350)
}
const CENA = `window.__jogoDaPartida.scene.getScene('arena')`
const cena = (expr) => aba.avaliar(`(() => { const c = ${CENA}; return ${expr} })()`)
// Leva o Líder e o grupo (em volta dele) para um ponto do mapa ("Juntar todos", da barra de teste, junta também os mobs)
const levarOGrupo = (x, y) =>
  cena(`(c.grupo.forEach((m, i) => m.colocarEm(${x} + (m === c.lider ? 0 : Math.cos(i * 1.4) * 70), ${y} + (m === c.lider ? 0 : Math.sin(i * 1.4) * 70))), c.cameras.main.centerOn(${x}, ${y}), true)`)
const tituloDaTela = () => aba.avaliar(`document.querySelector('.tela .titulo')?.textContent ?? document.title`)

// Um print. uc e rf: o caso de uso e os requisitos (o nome do arquivo e o README dos protótipos); tela: o nome da tela
async function print(nome, { uc, rf, tela = null, manterDica = false }) {
  numero += 1
  const semAcento = nome.normalize('NFD').replace(/[̀-ͯ]/g, '')
  const arquivo = PROTOTIPOS ? `${uc}_${semAcento.replace(/-/g, '_')}` : `${String(numero).padStart(2, '0')}-${semAcento}`
  // Sem o painel DEV, a barra de teste, os avisos (conquistas) e a dica da primeira visita (a não ser no print que
  // mostra a dica), para o print mostrar só a tela
  if (!manterDica) await aba.avaliar(`(() => { [...document.querySelectorAll('.dica-da-tela button')].find((b) => b.textContent.trim() === 'Entendi')?.click(); return true })()`)
  await aba.avaliar(`(() => { document.querySelectorAll('.avisos .aviso button').forEach((b) => b.click()); for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini, .barra-de-teste')) p.style.visibility = 'hidden'; return true })()`)
  await pausa(120)
  await aba.print(arquivo)
  await aba.avaliar(`(() => { for (const p of document.querySelectorAll('.painel-dev, .painel-dev-mini, .barra-de-teste')) p.style.visibility = ''; return true })()`)
  tirados.push({ arquivo, uc, rf, tela: tela ?? (await tituloDaTela()) })
}
// O Mercado, a Forja e a Guilda começam pela conversa com o NPC (Parte 9): a primeira opção do menu abre a tela
async function abrirLoja() {
  await aba.avaliar(`(() => { document.querySelector('.npc-menu .botao-de-acao')?.click(); return true })()`)
  await pausa(250)
}
// Todas as abas de uma tela, uma por print
async function abasDaTela(prefixo, abas) {
  for (const [nome, uc, rf] of abas) if (await abaChamada(nome)) await print(`${prefixo}-${nome.toLowerCase().replace(/[^a-z0-9à-ú]+/g, '-')}`, { uc, rf, tela: `${prefixo[0].toUpperCase()}${prefixo.slice(1)}: ${nome}` })
}
// Uma janela aberta por um botão, e Esc fecha
async function janela(botao, nome, opcoes) {
  if (!(await clicar(botao, true))) return
  await pausa(300)
  await print(nome, opcoes)
  await aba.apertar('esc')
  await pausa(250)
}
// Começar uma partida na Floresta pelo caminho de verdade (Mapa → Caravana → Preparação)
async function comecarPartida({ printDoCarregamento = false } = {}) {
  await passo('Começar partida')
  if (printDoCarregamento) {
    // a tela de carregamento é rápida: o print sai assim que ela aparece
    const viu = await aba.esperar(`!!document.querySelector('.carregando-a-partida')`, 'o carregamento', 3000).then(() => true, () => false)
    if (viu) await print('carregando-a-partida', { uc: 'UC31', rf: 'RF34', tela: 'Carregando a partida' })
  }
  await aba.esperar(`!!${CENA}?.lider && !!${CENA}.exploracao`, 'a partida', 20000)
  await pausa(1200)
}

try {
  navegador = await abrirNavegador('prints', PASTA)
  aba = await navegador.novaAba('aba1')
  await aba.abrir(vite.site)
  if (tema === 'escuro') {
    await passo('Configurações')
    await passo('Tema', true)
    await aba.apertar('esc')
  }
  // ---------- Acesso ----------
  await print('tela-inicial', { uc: 'UC10', rf: 'RF13, RF14' })
  await janela('Como jogar', 'como-jogar', { uc: 'UC10', rf: 'RF13, RF35', tela: 'Como jogar (janela)' })
  await janela('Configurações', 'configuracoes', { uc: 'UC14', rf: 'RF18', tela: 'Configurações (janela)' })
  await passo('Iniciar jogo')
  await print('login', { uc: 'UC04', rf: 'RF01, RF04' })
  for (const [id, nome, uc, rf] of [
    ['criarConta', 'criar-conta', 'UC02', 'RF02'],
    ['confirmeEmail', 'confirme-o-email', 'UC02', 'RF02, RF04'],
    ['esqueciSenha', 'esqueci-a-senha', 'UC06', 'RF06'],
    ['novaSenha', 'senha-nova', 'UC06', 'RF06'],
    ['escolherApelido', 'escolher-apelido', 'UC04', 'RF02'],
  ]) {
    await irPara(id)
    await print(nome, { uc, rf })
  }
  await irPara('login')
  await passo('Jogar como convidado')
  await aba.esperarTela('Narrativa inicial')
  await print('narrativa', { uc: 'UC01', rf: 'RF01, RF07' })
  await passo('Continuar')
  await passo('Arqueiro')
  await print('selecao-de-classe', { uc: 'UC07', rf: 'RF07' })
  await passo('Escolher Arqueiro')
  await aba.esperarTela('Reino')

  // ---------- Reino ----------
  // O comerciante se apresenta na primeira visita (Parte 9); o Catálogo de quem acabou de começar: quase tudo apagado
  await irPara('mercado')
  await print('mercado-comerciante', { uc: 'UC16', rf: 'RF21, RF57', tela: 'Mercado: o comerciante Bartolomeu' })
  await abrirLoja()
  if (await abaChamada('Catálogo')) await print('catalogo-no-comeco', { uc: 'UC16', rf: 'RF21', tela: 'Mercado: Catálogo no começo' })
  await irPara('reino')
  await passo('Itens de teste', true)
  await passo('Itens de teste', true)
  await pausa(300)
  await print('reino', { uc: 'UC26', rf: 'RF19' })
  await janela('?', 'reino-ajuda', { uc: 'UC10', rf: 'RF13', tela: 'Como funciona: Reino (janela do "?")' })

  await irPara('mochila')
  await print('mochila', { uc: 'UC15', rf: 'RF20' })

  await irPara('mercado')
  await print('mercado-comerciante-fala', { uc: 'UC45', rf: 'RF57', tela: 'Mercado: o comerciante (segunda visita)' })
  await abrirLoja()
  await abasDaTela('mercado', [
    ['Comprar', 'UC16', 'RF21'],
    ['Vender', 'UC16', 'RF21'],
    ['Trocar', 'UC16', 'RF21'],
    ['Catálogo', 'UC16', 'RF21'],
  ])
  await janela('?', 'mercado-ajuda', { uc: 'UC10', rf: 'RF13', tela: 'Como funciona: Mercado (janela do "?")' })

  await irPara('forja')
  await print('forja-ferreiro', { uc: 'UC17', rf: 'RF22, RF57', tela: 'Forja: o ferreiro Gunnar' })
  await abrirLoja()
  // Na aba Equipar, uma peça escolhida (para o print mostrar o antes e depois)
  await abaChamada('Equipar')
  for (let vez = 0; vez < 2; vez++) {
    await aba.avaliar(`(() => { document.querySelector('.balcao-grade .celula-da-grade:first-child')?.click(); return true })()`)
    await pausa(150)
  }
  await pausa(250)
  await abasDaTela('forja', [
    ['Equipar', 'UC17', 'RF22'],
    ['Comprar', 'UC17', 'RF22'],
    ['Vender', 'UC17', 'RF22'],
    ['Fabricar', 'UC18', 'RF23'],
    ['Catálogo', 'UC17', 'RF22'],
  ])

  await irPara('guilda')
  await print('guilda-mestra', { uc: 'UC21', rf: 'RF26, RF29, RF57', tela: 'Guilda: a Mestra Isolda' })
  await abrirLoja()
  await abasDaTela('guilda', [
    ['Missões', 'UC21', 'RF26'],
    ['Contrato temporário', 'UC25', 'RF29'],
    ['Contrato permanente', 'UC25', 'RF29'],
    ['Contratos', 'UC25', 'RF29'],
  ])
  // Um temporário ativo e uma missão aceita, para os prints com conteúdo
  if (await abaChamada('Contrato temporário')) {
    await aba.avaliar(`(() => { const li = [...document.querySelectorAll('.lista-de-contratos li, .carta-de-contrato')].find((l) => l.textContent.includes('Guerreiro')); const b = li?.querySelector('button'); b?.click(); return !!b })()`)
    await pausa(300)
    await clicar('Assinar', true)
    await pausa(300)
    await print('guilda-temporario-ativo', { uc: 'UC25', rf: 'RF29', tela: 'Guilda: contrato temporário ativo' })
  }
  await abaChamada('Missões')
  await clicar('Caçar lobos', true)
  await pausa(200)
  await clicar('Aceitar', true)
  await pausa(300)
  await print('guilda-missao-ativa', { uc: 'UC22', rf: 'RF26', tela: 'Guilda: missão aceita' })

  await irPara('arvores')
  await print('arvores', { uc: 'UC19', rf: 'RF24, RF55' })

  await irPara('salaoGloria')
  await pausa(1500) // o ranking vem do banco
  await print('salao-ranking', { uc: 'UC11', rf: 'RF15', tela: 'Salão da Glória: Ranking' })
  if (await abaChamada('Conquistas')) await print('salao-conquistas', { uc: 'UC13', rf: 'RF17', tela: 'Salão da Glória: Conquistas' })

  // ---------- Mapa e minijogos ----------
  await irPara('reino')
  await passo('Jogar')
  await aba.esperarTela('Mapa')
  await print('mapa', { uc: 'UC27', rf: 'RF30' })
  for (const [lugar, seletor] of [
    ['Fazenda', '.canteiro'],
    ['Mina', '.pedra-da-mina'],
    ['Lago', '.boia'],
  ]) {
    if (!(await clicar(lugar, true))) continue
    await pausa(400)
    const id = lugar.toLowerCase()
    await print(`minijogo-${id}`, { uc: 'UC43', rf: 'RF54' })
    // Jogando (Partes 10 e 11b: as cenas desenhadas): espera um pouco e, na Fazenda, até um canteiro madurar
    await passo('Começar rodada', true)
    await pausa(1200)
    if (id === 'fazenda') await aba.esperar(`!!document.querySelector('.canteiro-madura')`, 'um canteiro madurar', 8000).catch(() => {})
    if (id === 'mina') {
      await aba.avaliar(`(document.querySelector('${seletor}')?.click(), true)`)
      await pausa(80)
    }
    await print(`minijogo-${id}-jogando`, { uc: 'UC43', rf: 'RF54', tela: `Minijogo ${lugar === 'Fazenda' ? 'da' : 'do'} ${lugar === 'Mina' ? 'Mina' : lugar}: jogando` })
    await irPara('mapa')
  }

  // ---------- A partida ----------
  // A Caravana (Parte 7), pelo caminho de verdade (depois de escolher a Floresta)
  await passo('Floresta')
  await aba.esperarTela('Caravana')
  await print('caravana', { uc: 'UC44', rf: 'RF56' })
  await aba.passarPelaCaravana()
  // Duas poções na mochila da partida (a grade da direita e a da partida, com Tab)
  for (let i = 0; i < 2; i++) {
    await aba.avaliar(`(() => { [...document.querySelectorAll('.mochila-da-preparacao button.slot')].find((b) => (b.getAttribute('aria-label') ?? '').startsWith('Poção de vida'))?.click(); return true })()`)
    await pausa(200)
  }
  await print('preparacao', { uc: 'UC29', rf: 'RF33' })
  await comecarPartida({ printDoCarregamento: true })
  await print('partida-comeco', { uc: 'UC31', rf: 'RF35, RF53', tela: 'Partida: o começo, na zona segura' })
  // A pausa (fora de combate) com o mapa inteiro
  await aba.apertar('esc')
  await pausa(500)
  await print('pausa', { uc: 'UC38', rf: 'RF40, RF44', tela: 'Pausa (com o mapa inteiro)' })
  await aba.apertar('esc')
  await pausa(300)
  // A fuga: o primeiro F mostra o custo e pede a confirmação; Esc cancela
  await aba.apertar('f')
  await pausa(400)
  await print('confirmar-fuga', { uc: 'UC40', rf: 'RF46', tela: 'Confirmar a fuga (janela)' })
  await aba.apertar('esc')
  await pausa(300)
  // O grupo de 5 (bonecos em blocos) perto de uma matilha: o Líder vai até um Lobo Alfa e o grupo vem junto
  await clicar('Invencível: não')
  await clicar('Encher grupo')
  await pausa(400)
  const alfa = await cena(`(() => { const a = c.inimigos.find((i) => i.tipo === 'loboAlfa' && !i.morto); return a ? { x: Math.round(a.x), y: Math.round(a.y) } : null })()`)
  if (alfa) {
    await levarOGrupo(alfa.x - 260, alfa.y + 40)
    await pausa(1300)
    await print('partida-com-mobs', { uc: 'UC32', rf: 'RF36, RF42, RF53', tela: 'Partida: o grupo de 5 e a matilha do Lobo Alfa' })
  }
  // O chefe (o Ogro), no domínio dele
  const chefe = await cena(`(() => { const o = c.inimigos.find((i) => (i.tipo === 'ogro' || i.constructor?.name === 'Ogro') && !i.morto); return o ? { x: Math.round(o.x), y: Math.round(o.y) } : null })()`)
  if (chefe) {
    await levarOGrupo(chefe.x - 330, chefe.y)
    await pausa(1300)
    await print('partida-chefe-ogro', { uc: 'UC34', rf: 'RF39', tela: 'Partida: o chefe Ogro' })
  }
  await aba.apertar('tab')
  await pausa(400)
  await print('mochila-da-partida', { uc: 'UC36', rf: 'RF41', tela: 'Mochila da partida (Tab)' })
  await aba.apertar('tab')
  await pausa(300)
  // O Resumo: a barra de teste termina a partida com Vitória
  if (await clicar('Vitória')) {
    await aba.esperarTela('Resumo', 15000).catch(() => {})
    await pausa(600)
    await print('resumo-vitoria', { uc: 'UC42', rf: 'RF47, RF48, RF51', tela: 'Resumo (Vitória)' })
  }
  // A derrota: outra partida, que termina com todos desmaiados (a cutscene e o Resumo)
  if (await clicar('Jogar novamente')) {
    await pausa(400)
    await passo('Floresta')
    await aba.passarPelaCaravana()
    await comecarPartida()
    if (await clicar('Derrota')) {
      await aba.esperarTela('Cutscene de derrota', 8000).catch(() => {})
      await pausa(900)
      await print('cutscene-derrota', { uc: 'UC41', rf: 'RF47', tela: 'Cutscene de derrota' })
      await clicar('Continuar')
      await aba.esperarTela('Resumo', 20000).catch(async () => {
        await clicar('Pular', true)
        await aba.esperarTela('Resumo', 8000)
      })
      await pausa(600)
      await print('resumo-derrota', { uc: 'UC42', rf: 'RF47, RF51', tela: 'Resumo (Derrota)' })
    }
  }
  console.log(`${tirados.length} prints em ${PASTA}`)

  // O README dos protótipos (só no tema claro): a tabela print → tela → caso de uso → requisitos
  if (PROTOTIPOS && tema !== 'escuro') {
    const linhas = tirados.map(({ arquivo, uc, rf, tela }) => `| [${arquivo}.png](${arquivo}.png) · [escuro](escuro/${arquivo}.png) | ${tela} | ${uc} ${casosDeUso[uc] ?? ''} | ${rf} |`)
    const texto = [
      '# Protótipos (prints do jogo)',
      '',
      `Prints de todas as telas do jogo como ele está hoje, em 1366 × 768, tirados pelo próprio jogo com \`npm run prints -- prototipos\` (tema claro, nesta pasta) e \`npm run prints -- prototipos escuro\` (tema escuro, na subpasta [escuro/](escuro/)). O nome de cada arquivo começa pelo caso de uso que a tela atende. Os protótipos iniciais, feitos antes do jogo, ficam em [iniciais/](iniciais/).`,
      '',
      'O painel DEV e a barra de teste (que só existem no `npm run dev`) não aparecem nos prints. A matriz completa (cada requisito com o caso de uso, a história, o diagrama, o protótipo e o teste) fica em [09_Matriz_de_Rastreabilidade.md](../docAdicional/09_Matriz_de_Rastreabilidade.md).',
      '',
      '| Print | Tela | Caso de uso | Requisitos |',
      '| --- | --- | --- | --- |',
      ...linhas,
      '',
    ].join('\n')
    writeFileSync(join(PASTA, 'README.md'), texto)
    console.log('README.md escrito')
  }
} catch (erro) {
  console.log(`ERRO ${erro.message} (depois de ${tirados.length} prints)`)
  if (aba) await aba.print('erro')
  process.exitCode = 1
} finally {
  await navegador?.fechar()
  await vite.fechar()
  process.exit(process.exitCode ?? 0)
}
