// ARTE (TASK-110 a TASK-116): as contas puras de achar e escolher as imagens. Quem procura os arquivos é o
// arte/indice.js; quem desenha é o jogo/arte.js (partida) e os componentes (telas). Os nomes e tamanhos ficam em
// dados/arte.js.

import {
  animacoes,
  apelidosDasAnimacoes,
  apelidosDasDirecoes,
  arteDaFloresta,
  arteEsperada,
  bonecos,
  direcoes,
  fundosDasTelas,
  tamanhosSugeridos,
} from '../dados/arte.js'
import { classes } from '../dados/classes.js'
import { floresta as layoutDaFloresta } from '../dados/mundo/floresta.js'
import { telas } from '../dados/telas.js'

export const extensoesDaArte = ['png', 'webp', 'jpg', 'jpeg']

// O nome de um arquivo como o jogo o compara: sem acentos, minúsculo e só letras e números
// ("Guerreiro_Andando-Baixo" → "guerreiroandandobaixo")
export function chaveDaArte(nome) {
  return String(nome)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// O nome do arquivo de um caminho, sem a pasta e a extensão ("../assets/arte/mobs/Lobo.png" → "Lobo")
export function nomeDoArquivo(caminho) {
  return caminho
    .split(/[\\/]/)
    .at(-1)
    .replace(/\.[^.]+$/, '')
}

// O índice das imagens achadas: chave → endereço. "achados" vem por ordem de prioridade (o primeiro com um nome ganha);
// "repetidos" são os nomes que apareceram mais de uma vez (o conferidor avisa).
export function indiceDaArte(achados) {
  const arquivos = {}
  const repetidos = []
  for (const [caminho, url] of achados) {
    const chave = chaveDaArte(nomeDoArquivo(caminho))
    if (!chave) continue
    if (chave in arquivos) repetidos.push(chave)
    else arquivos[chave] = url
  }
  return { arquivos, repetidos }
}

// Quantos quadros quadrados há numa faixa (largura × altura; até 2 px de sobra). Imagem que não é um número inteiro de
// quadrados é um quadro só (a imagem inteira).
export function quadrosDaFaixa(largura, altura) {
  if (!(largura > 0 && altura > 0)) return 1
  const quantos = Math.round(largura / altura)
  if (quantos < 2) return 1
  return Math.abs(largura - quantos * altura) <= 2 ? quantos : 1
}

// Os quadros soltos de um nome, em ordem ("guerreiroandandobaixo1", "...2"...; vale começar do 0 e com zeros na frente)
export function quadrosSoltos(chaves, base) {
  const soltos = []
  for (const chave of chaves) {
    if (chave.length <= base.length || !chave.startsWith(base)) continue
    const resto = chave.slice(base.length)
    if (/^\d+$/.test(resto)) soltos.push({ chave, numero: Number(resto) })
  }
  return soltos.sort((a, b) => a.numero - b.numero).map((um) => um.chave)
}

const comApelidos = (nome, apelidos) => [nome, ...(apelidos[nome] ?? [])].map(chaveDaArte)

// O primeiro dos nomes que existe, como faixa (um arquivo) ou como quadros soltos
function procurar(chaves, bases) {
  for (const base of bases) {
    if (chaves.has(base)) return { chaves: [base] }
    const soltos = quadrosSoltos(chaves, base)
    if (soltos.length) return { chaves: soltos }
  }
  return null
}

// O desenho de quem usa o de outro (os mobs da arena de teste usam o do lobo e o da aranha)
export function idDaArte(id) {
  return bonecos[id]?.usa ?? id
}

// Que imagem mostrar para um boneco (classe, mob ou Boss) numa animação e direção, entre as que existem (chaves: Set).
// Ordem: a animação na direção pedida; a direção oposta espelhada (esquerda ↔ direita); a de baixo; sem direção; qualquer
// outra direção. Sem a animação, as da reserva (andando → parado...). Por fim, a imagem única do boneco ("lobo.png").
// Devolve { animacao, chaves (um arquivo de faixa ou os quadros soltos), espelhar } ou null (fica o quadrado).
export function escolherAnimacao(chaves, id, animacao, direcao = 'baixo') {
  const base = chaveDaArte(idDaArte(id))
  const oposta = { esquerda: 'direita', direita: 'esquerda' }[direcao]
  const tentar = (qual) => {
    const nomes = comApelidos(qual, apelidosDasAnimacoes)
    const naDirecao = (lado) => nomes.flatMap((nome) => comApelidos(lado, apelidosDasDirecoes).map((sufixo) => base + nome + sufixo))
    const passos = [
      { bases: naDirecao(direcao), espelhar: false },
      oposta && { bases: naDirecao(oposta), espelhar: true },
      { bases: naDirecao('baixo'), espelhar: false },
      { bases: nomes.map((nome) => base + nome), espelhar: false },
      ...direcoes.filter((lado) => lado !== direcao && lado !== oposta && lado !== 'baixo').map((lado) => ({ bases: naDirecao(lado), espelhar: false })),
    ].filter(Boolean)
    for (const passo of passos) {
      const achado = procurar(chaves, passo.bases)
      if (achado) return { animacao: qual, ...achado, espelhar: passo.espelhar }
    }
    return null
  }
  for (const qual of [animacao, ...(animacoes[animacao]?.reserva ?? [])]) {
    const achado = tentar(qual)
    if (achado) return achado
  }
  const unica = procurar(chaves, [base])
  return unica ? { animacao: 'unica', ...unica, espelhar: false } : null
}

// O boneco tem alguma imagem? (sem nenhuma, continua o quadrado)
export function temArteDoBoneco(chaves, id) {
  return Object.keys(animacoes).some((animacao) => escolherAnimacao(chaves, id, animacao) !== null)
}

// Para que lado o boneco olha, pela direção em que anda (x, y). Parado (vetor curto) continua olhando para onde olhava.
// Um pouco de preferência pelo lado atual evita trocar de lado a cada quadro andando na diagonal.
export function direcaoDoVetor(x, y, anterior = 'baixo', minimo = 0.001) {
  if (Math.hypot(x, y) < minimo) return anterior
  const deLado = anterior === 'esquerda' || anterior === 'direita'
  const horizontal = deLado ? Math.abs(x) * 1.2 >= Math.abs(y) : Math.abs(x) > Math.abs(y) * 1.2
  if (horizontal) return x < 0 ? 'esquerda' : 'direita'
  return y < 0 ? 'cima' : 'baixo'
}

// A pedra de cada tamanho de hitbox; sem a do tamanho, a mais parecida, e por fim "pedra.png"
export function escolherPedra(chaves, largura) {
  const { pedras, larguraDaPedra } = arteDaFloresta
  const tamanho = largura >= larguraDaPedra.grande ? 'grande' : largura >= larguraDaPedra.media ? 'media' : 'pequena'
  const ordem = { pequena: ['pequena', 'media', 'grande'], media: ['media', 'grande', 'pequena'], grande: ['grande', 'media', 'pequena'] }[tamanho]
  const nomes = [...ordem.map((qual) => chaveDaArte(pedras[qual])), 'pedra']
  return nomes.find((nome) => chaves.has(nome)) ?? null
}

// A grama de uma região: a pronta da região ("grama-facil", com variações "-1", "-2"...) sem tinta, ou as variações da
// grama comum com o tom da região. Sem grama nenhuma: null (fica o verde de hoje).
export function gramaDaRegiao(chaves, idDaRegiao) {
  const daRegiao = chaveDaArte(`grama-${idDaRegiao}`)
  const prontas = [...(chaves.has(daRegiao) ? [daRegiao] : []), ...quadrosSoltos(chaves, daRegiao)]
  if (prontas.length) return { chaves: prontas, tinta: 0xffffff }
  const comuns = arteDaFloresta.grama.map(chaveDaArte).filter((chave) => chaves.has(chave))
  if (!comuns.length) return null
  return { chaves: comuns, tinta: arteDaFloresta.tomDaRegiao[idDaRegiao] ?? 0xffffff }
}

// O fundo de uma tela: "fundo-<id da tela>" ou o da lista (dados/arte.js). null: fica o cinza de hoje.
export function fundoDaTela(chaves, idDaTela) {
  const nomes = [`fundo-${idDaTela}`, fundosDasTelas[idDaTela]].filter(Boolean).map(chaveDaArte)
  return nomes.find((nome) => chaves.has(nome)) ?? null
}

// ---------- Para o npm run conferir:arte ----------

// Todos os nomes que o jogo entende, com o grupo de cada um (os da lista, os apelidos e os opcionais) e o nome da lista a
// que cada um corresponde ("canonico": "guerreiro-walk-south" conta como "guerreiro-andando-baixo"; null se é um extra)
function nomesConhecidos() {
  const conhecidos = new Map()
  const esperados = new Set()
  const guardar = (nome, tipo, grupo, canonico) => {
    const chave = chaveDaArte(nome)
    if (!conhecidos.has(chave)) conhecidos.set(chave, { tipo, grupo, canonico: canonico && esperados.has(chaveDaArte(canonico)) ? chaveDaArte(canonico) : null })
  }
  const grupos = arteEsperada()
  for (const { nomes } of grupos) for (const nome of nomes) esperados.add(chaveDaArte(nome))
  for (const { grupo, tipo, nomes } of grupos) for (const nome of nomes) guardar(nome, tipo, grupo, nome)
  // Bonecos: todas as animações, direções e apelidos, sem direção e a imagem única
  for (const [id, boneco] of Object.entries(bonecos)) {
    if (boneco.usa) continue
    const tipo = id === 'guardiao' ? 'boss' : classes.some((classe) => classe.id === id) ? 'personagem' : 'mob'
    const grupo = `Boneco: ${boneco.nome}`
    guardar(id, tipo, grupo, null)
    for (const animacao of Object.keys(animacoes)) {
      const desmaiado = animacao === 'desmaiado'
      for (const nome of comApelidos(animacao, apelidosDasAnimacoes)) {
        guardar(`${id}${nome}`, tipo, grupo, desmaiado ? `${id}-desmaiado` : null)
        for (const direcao of direcoes) {
          for (const sufixo of comApelidos(direcao, apelidosDasDirecoes)) {
            guardar(`${id}${nome}${sufixo}`, tipo, grupo, desmaiado ? `${id}-desmaiado` : `${id}-${animacao}-${direcao}`)
          }
        }
      }
    }
  }
  // Opcionais: fundo de qualquer tela, grama pronta de cada região e a pedra de um tamanho só
  for (const id of Object.keys(telas)) guardar(`fundo-${id}`, 'fundo', 'Telas (fundos)', null)
  for (const regiao of layoutDaFloresta.regioes) guardar(`grama-${regiao.id}`, 'tile', 'Floresta: chão e obstáculos', null)
  guardar('pedra', 'tile', 'Floresta: chão e obstáculos', null)
  guardar('grama', 'tile', 'Floresta: chão e obstáculos', null)
  return conhecidos
}

let conhecidosGuardados = null

// Para que serve um arquivo (pela chave), ou null se o jogo não conhece o nome (provável erro de digitação).
// Quadros soltos ("...-1", "-2") valem pelo nome sem o número.
export function reconhecerArte(chave) {
  conhecidosGuardados ??= nomesConhecidos()
  const direto = conhecidosGuardados.get(chave)
  if (direto) return { ...direto, quadroSolto: false }
  const semNumero = chave.replace(/\d+$/, '')
  if (semNumero !== chave) {
    const doNome = conhecidosGuardados.get(semNumero)
    if (doNome) return { ...doNome, quadroSolto: true }
  }
  return null
}

// O que pode estar estranho no tamanho de uma imagem (null: tudo certo). Não impede nada: o jogo estica a imagem para o
// tamanho da tela; é só um aviso.
export function avisoDoTamanho(tipo, largura, altura, { quadroSolto = false, nome = '' } = {}) {
  if (!(largura > 0 && altura > 0)) return 'não deu para ler o tamanho'
  const animado = ['personagem', 'mob', 'boss'].includes(tipo)
  if (animado && !quadroSolto) {
    const quadros = quadrosDaFaixa(largura, altura)
    if (quadros === 1 && largura > altura * 1.3) return `${largura} × ${altura}: a largura não é um número inteiro de quadros quadrados (a altura é o lado de cada quadro)`
    if (quadros > 16) return `${quadros} quadros: muitos para uma animação (confira se é uma linha só)`
    return null
  }
  if (animado || tipo === 'icone' || tipo === 'retrato') {
    if (Math.abs(largura - altura) > Math.max(2, altura * 0.1)) return `${largura} × ${altura}: o esperado é quadrado (${tamanhosSugeridos[tipo] ?? 32} × ${tamanhosSugeridos[tipo] ?? 32})`
    return null
  }
  if (tipo === 'tile') {
    const obstaculo = ['arvore', 'arbusto', 'tronco', 'pedra'].some((parte) => chaveDaArte(nome).startsWith(parte))
    if (!obstaculo && Math.abs(largura - altura) > 1) return `${largura} × ${altura}: o tile precisa ser quadrado (${tamanhosSugeridos.tile} × ${tamanhosSugeridos.tile})`
    return null
  }
  if (tipo === 'fundo') {
    const { largura: l, altura: a } = tamanhosSugeridos.fundo
    if (Math.abs(largura / altura - l / a) > 0.05) return `${largura} × ${altura}: o esperado é 16:9 (${l} × ${a}); a imagem vai ser cortada nas beiras`
    if (largura < 1280) return `${largura} × ${altura}: pequena para um fundo (o esperado é ${l} × ${a}); vai ficar borrada`
    return null
  }
  return null
}
