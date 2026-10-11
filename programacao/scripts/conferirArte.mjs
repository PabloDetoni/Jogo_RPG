// npm run conferir:arte — confere as imagens da pasta src/assets/arte/ sem mudar nada (TASK-110):
// 1. cada arquivo achado: para que serve, quantos quadros tem e se o tamanho está estranho;
// 2. nomes que o jogo não conhece (provável erro de digitação) e nomes repetidos;
// 3. o que a Lista de Arte e Som pede, grupo por grupo: o que já chegou e o que falta.
// O nome do arquivo não liga para maiúsculas, acentos, hífen, sublinhado nem espaço (regras/arte.js, chaveDaArte).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { arteEsperada } from '../src/dados/arte.js'
import { avisoDoTamanho, chaveDaArte, extensoesDaArte, nomeDoArquivo, quadrosDaFaixa, reconhecerArte } from '../src/regras/arte.js'
import { tamanhoDaImagem } from './imagens.mjs'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const pasta = join(raiz, 'src', 'assets', 'arte')
const pastaDeTeste = join(raiz, 'src', 'assets', 'arte-de-teste')

function arquivosEm(diretorio) {
  if (!existsSync(diretorio)) return []
  return readdirSync(diretorio).flatMap((nome) => {
    const caminho = join(diretorio, nome)
    return statSync(caminho).isDirectory() ? arquivosEm(caminho) : [caminho]
  })
}

const linha = (marca, texto, detalhe) => console.log(`  ${marca.padEnd(5)} ${texto}${detalhe ? `\n        ${detalhe}` : ''}`)

console.log(`Arte em ${relative(raiz, pasta)}${existsSync(pasta) ? '' : ' (a pasta ainda não existe: crie e ponha as imagens lá)'}\n`)

const todos = arquivosEm(pasta)
const imagens = todos.filter((caminho) => extensoesDaArte.includes(caminho.split('.').at(-1).toLowerCase()))
const outros = todos.filter((caminho) => !imagens.includes(caminho) && !/LEIA-ME|\.md$/i.test(caminho))

let desconhecidos = 0
let avisosDeTamanho = 0
const chegaram = new Set()
const vistos = new Map()

console.log(`1. Arquivos achados (${imagens.length})`)
if (imagens.length === 0) console.log('  (nenhuma imagem ainda: o jogo continua com os quadrados e as telas cinza)')
for (const caminho of imagens.sort()) {
  const nome = relative(pasta, caminho)
  const chave = chaveDaArte(nomeDoArquivo(caminho))
  if (vistos.has(chave)) {
    linha('aviso', nome, `o mesmo nome de ${vistos.get(chave)} (o jogo usa só um deles)`)
    continue
  }
  vistos.set(chave, nome)
  const reconhecido = reconhecerArte(chave)
  if (!reconhecido) {
    desconhecidos += 1
    linha('aviso', nome, 'o jogo não conhece este nome: confira a lista abaixo (maiúsculas, acentos e hífens não importam)')
    continue
  }
  if (reconhecido.canonico) chegaram.add(reconhecido.canonico)
  const tamanho = tamanhoDaImagem(readFileSync(caminho))
  const aviso = avisoDoTamanho(reconhecido.tipo, tamanho?.largura, tamanho?.altura, { quadroSolto: reconhecido.quadroSolto, nome: nomeDoArquivo(caminho) })
  const animado = ['personagem', 'mob', 'boss'].includes(reconhecido.tipo) && !reconhecido.quadroSolto && tamanho
  const quadros = animado ? quadrosDaFaixa(tamanho.largura, tamanho.altura) : 1
  const medida = tamanho ? `${tamanho.largura} × ${tamanho.altura}${quadros > 1 ? `, ${quadros} quadros de ${tamanho.altura} × ${tamanho.altura}` : ''}` : '?'
  if (aviso) {
    avisosDeTamanho += 1
    linha('aviso', `${nome} (${reconhecido.grupo})`, aviso)
  } else {
    linha('ok', `${nome} → ${reconhecido.grupo} (${medida}${reconhecido.quadroSolto ? ', quadro solto' : ''})`)
  }
}
for (const caminho of outros) linha('aviso', relative(pasta, caminho), 'não é PNG, WEBP nem JPG: o jogo ignora')
if (existsSync(pastaDeTeste)) linha('aviso', relative(raiz, pastaDeTeste), 'a pasta de teste do npm run testar:arte ficou para trás; pode apagar')

console.log('\n2. O que a Lista de Arte e Som pede (já chegou / total)')
let total = 0
let prontos = 0
for (const { grupo, nomes } of arteEsperada()) {
  const faltam = nomes.filter((nome) => !chegaram.has(chaveDaArte(nome)))
  total += nomes.length
  prontos += nomes.length - faltam.length
  const marca = faltam.length === 0 ? 'ok' : nomes.length === faltam.length ? '—' : 'parte'
  linha(marca, `${grupo}: ${nomes.length - faltam.length} de ${nomes.length}`, faltam.length ? `faltam: ${faltam.join(', ')}` : '')
}

console.log(`\nResumo: ${prontos} de ${total} imagens da lista · ${desconhecidos} com nome desconhecido · ${avisosDeTamanho} com tamanho estranho.`)
console.log('O que falta continua desenhado como hoje (quadrados e cinza). Faltou uma direção ou animação, o jogo usa a mais parecida.')
