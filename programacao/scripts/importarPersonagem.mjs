// Importa um personagem do PixelLab para o jogo (skill gerar-arte; 15/10/2026).
// Uso (em programacao/): node scripts/importarPersonagem.mjs <id do personagem no PixelLab> <classe ou monstro> [correções]
//                        node scripts/importarPersonagem.mjs --zip <arquivo.zip> <classe ou monstro> [correções]   (sem baixar)
// Correções (sem gastar gerações; anote o comando usado na fila da skill gerar-arte, para refazer igual):
//   --parado-da-rotacao baixo,cima   o parado dessas direções vira o desenho parado do personagem (1 quadro), quando o
//                                    molde de respirar estraga o boneco (o Mago perdeu o cajado de frente)
//   --trocar andando-baixo-4=andando-baixo-2   um quadro com defeito vira cópia de outro (pode repetir a opção)
// Baixa o ZIP do personagem (rotações e animações, um PNG por quadro), guarda uma cópia em arte-original/ (fora do git,
// para refazer sem gastar gerações) e salva os quadros soltos com os nomes da Lista de Arte e Som em
// src/assets/arte/bonecos/<nome>/: "<nome>-<animação>-<direção>-<n>.png" (o jogo junta os quadros numerados sozinho).
// O desmaiado é o último quadro do falling-back-death (deitado), numa direção só: "<nome>-desmaiado.png".
// A animação é reconhecida pelo nome dado no PixelLab ("mago-andando") ou pelo molde ("walking-4-frames").

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateRawSync } from 'node:zlib'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const direcoes = { south: 'baixo', north: 'cima', west: 'esquerda', east: 'direita' }
// Nome no PixelLab → animação do jogo (o nome que demos primeiro, depois o molde)
const animacaoDoNome = (nome) => {
  const n = nome.toLowerCase()
  if (/parado|idle|breathing/.test(n)) return 'parado'
  if (/andando|walk|running/.test(n)) return 'andando'
  if (/desmaiado|death|dead/.test(n)) return 'desmaiado'
  if (/aviso|warning/.test(n)) return 'aviso'
  if (/atacando|attack|fireball|punch|jab|kick|throw|slash|cast/.test(n)) return 'atacando'
  return null
}

// ZIP sem biblioteca: o diretório central no fim do arquivo diz onde está cada arquivo (guardado ou comprimido)
function lerZip(buffer) {
  let fim = buffer.length - 22
  while (fim >= 0 && buffer.readUInt32LE(fim) !== 0x06054b50) fim--
  if (fim < 0) throw new Error('não é um ZIP (o PixelLab ainda está gerando alguma animação?)')
  const total = buffer.readUInt16LE(fim + 10)
  let p = buffer.readUInt32LE(fim + 16)
  const arquivos = new Map()
  for (let i = 0; i < total; i++) {
    const metodo = buffer.readUInt16LE(p + 10)
    const tamanho = buffer.readUInt32LE(p + 20)
    const nomeLen = buffer.readUInt16LE(p + 28)
    const extraLen = buffer.readUInt16LE(p + 30)
    const comentarioLen = buffer.readUInt16LE(p + 32)
    const local = buffer.readUInt32LE(p + 42)
    const nome = buffer.toString('utf8', p + 46, p + 46 + nomeLen)
    const inicio = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28)
    const dados = buffer.subarray(inicio, inicio + tamanho)
    arquivos.set(nome, metodo === 0 ? dados : inflateRawSync(dados))
    p += 46 + nomeLen + extraLen + comentarioLen
  }
  return arquivos
}

// As opções com valor (--parado-da-rotacao, --trocar) saem da lista; o que sobra são o id (ou --zip arquivo) e o nome
const args = []
const paradoDaRotacao = []
const trocas = []
const brutos = process.argv.slice(2)
for (let i = 0; i < brutos.length; i++) {
  if (brutos[i] === '--parado-da-rotacao') paradoDaRotacao.push(...brutos[++i].split(','))
  else if (brutos[i] === '--trocar') trocas.push(brutos[++i].split('='))
  else args.push(brutos[i])
}
const doZip = args[0] === '--zip'
const [origem, nome] = doZip ? [args[1], args[2]] : [args[0], args[1]]
if (!origem || !nome || !/^[a-z]+$/.test(nome)) {
  console.log('Uso: node scripts/importarPersonagem.mjs <id do PixelLab | --zip arquivo.zip> <nome em minúsculas, ex.: mago>')
  process.exit(1)
}

let zip
if (doZip) zip = readFileSync(origem)
else {
  const resposta = await fetch(`https://api.pixellab.ai/mcp/characters/${origem}/download`)
  if (!resposta.ok) throw new Error(`o PixelLab respondeu ${resposta.status}: ${await resposta.text()}`)
  zip = Buffer.from(await resposta.arrayBuffer())
  const pastaOriginal = join(raiz, 'arte-original')
  mkdirSync(pastaOriginal, { recursive: true })
  const copia = join(pastaOriginal, `${nome}-${origem.slice(0, 8)}.zip`)
  writeFileSync(copia, zip)
  console.log(`original guardado em ${copia}`)
}

const arquivos = lerZip(zip)
const metadados = JSON.parse(arquivos.get('metadata.json').toString('utf8'))
const estado = metadados.states[0]
const pasta = join(raiz, 'src', 'assets', 'arte', 'bonecos', nome)
// Começa limpo: quadros velhos de uma geração anterior não podem sobrar
if (existsSync(pasta)) for (const arquivo of readdirSync(pasta)) if (arquivo.startsWith(`${nome}-`)) rmSync(join(pasta, arquivo))
mkdirSync(pasta, { recursive: true })

const resumo = []
for (const [nomeDaAnimacao, porDirecao] of Object.entries(estado.frames.animations ?? {})) {
  const animacao = animacaoDoNome(nomeDaAnimacao)
  if (!animacao) {
    resumo.push(`  ignorada: ${nomeDaAnimacao} (nome que o jogo não conhece)`)
    continue
  }
  if (animacao === 'desmaiado') {
    const quadros = porDirecao.south ?? Object.values(porDirecao)[0]
    writeFileSync(join(pasta, `${nome}-desmaiado.png`), arquivos.get(quadros.at(-1)))
    resumo.push(`  desmaiado: o último de ${quadros.length} quadros (${nomeDaAnimacao})`)
    continue
  }
  for (const [direcao, quadros] of Object.entries(porDirecao)) {
    const nossa = direcoes[direcao]
    if (!nossa) continue
    quadros.forEach((quadro, i) => writeFileSync(join(pasta, `${nome}-${animacao}-${nossa}-${i + 1}.png`), arquivos.get(quadro)))
    resumo.push(`  ${animacao} ${nossa}: ${quadros.length} quadros (${nomeDaAnimacao})`)
  }
}
// O parado de algumas direções vem do desenho parado (as rotações), um quadro só
for (const nossa of paradoDaRotacao) {
  const direcao = Object.keys(direcoes).find((d) => direcoes[d] === nossa)
  const rotacao = estado.frames.rotations?.[direcao]
  if (!rotacao) throw new Error(`não há rotação para ${nossa}`)
  for (const arquivo of readdirSync(pasta)) if (arquivo.startsWith(`${nome}-parado-${nossa}-`)) rmSync(join(pasta, arquivo))
  writeFileSync(join(pasta, `${nome}-parado-${nossa}-1.png`), arquivos.get(rotacao))
  resumo.push(`  parado ${nossa}: o desenho parado, 1 quadro (correção)`)
}
// Quadros com defeito viram cópia de outro
for (const [ruim, bom] of trocas) {
  const deBom = join(pasta, `${nome}-${bom}.png`)
  if (!existsSync(deBom)) throw new Error(`não achei o quadro ${nome}-${bom}`)
  writeFileSync(join(pasta, `${nome}-${ruim}.png`), readFileSync(deBom))
  resumo.push(`  ${ruim}: cópia de ${bom} (correção)`)
}
console.log(`${nome}: ${estado.character.size.width} × ${estado.character.size.height} px por quadro, em ${pasta}`)
console.log(resumo.join('\n'))
