// Ferramentas de imagem para os roteiros (sem biblioteca): ler o tamanho de um PNG, JPG ou WEBP (npm run conferir:arte) e
// criar um PNG simples (as imagens de teste do npm run testar:arte).
import { deflateSync } from 'node:zlib'

// Largura e altura pelo cabeçalho do arquivo, ou null se não der para ler
export function tamanhoDaImagem(dados) {
  // PNG: o IHDR vem logo depois da assinatura
  if (dados.length > 24 && dados.readUInt32BE(0) === 0x89504e47) return { largura: dados.readUInt32BE(16), altura: dados.readUInt32BE(20) }
  // JPG: o tamanho fica no primeiro bloco SOF
  if (dados[0] === 0xff && dados[1] === 0xd8) {
    let i = 2
    while (i + 9 < dados.length) {
      if (dados[i] !== 0xff) return null
      const marca = dados[i + 1]
      if (marca === 0xff) {
        i += 1
        continue
      }
      if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) return { altura: dados.readUInt16BE(i + 5), largura: dados.readUInt16BE(i + 7) }
      i += 2 + dados.readUInt16BE(i + 2)
    }
    return null
  }
  // WEBP: três jeitos de guardar o tamanho
  if (dados.length > 30 && dados.toString('ascii', 0, 4) === 'RIFF' && dados.toString('ascii', 8, 12) === 'WEBP') {
    const tipo = dados.toString('ascii', 12, 16)
    if (tipo === 'VP8X') return { largura: 1 + dados.readUIntLE(24, 3), altura: 1 + dados.readUIntLE(27, 3) }
    if (tipo === 'VP8 ') return { largura: dados.readUInt16LE(26) & 0x3fff, altura: dados.readUInt16LE(28) & 0x3fff }
    if (tipo === 'VP8L') {
      const bits = dados.readUInt32LE(21)
      return { largura: (bits & 0x3fff) + 1, altura: ((bits >> 14) & 0x3fff) + 1 }
    }
  }
  return null
}

const tabelaDoCrc = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(dados) {
  let c = 0xffffffff
  for (const byte of dados) c = tabelaDoCrc[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function bloco(tipo, dados) {
  const nome = Buffer.from(tipo, 'ascii')
  const tamanho = Buffer.alloc(4)
  tamanho.writeUInt32BE(dados.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([nome, dados])))
  return Buffer.concat([tamanho, nome, dados, crc])
}

// Um PNG de largura × altura; pintar(x, y) devolve [r, g, b, a] (0 a 255) de cada pixel
export function criarPng(largura, altura, pintar) {
  const porLinha = largura * 4 + 1
  const cru = Buffer.alloc(porLinha * altura)
  for (let y = 0; y < altura; y++) {
    cru[y * porLinha] = 0 // sem filtro
    for (let x = 0; x < largura; x++) cru.set(pintar(x, y), y * porLinha + 1 + x * 4)
  }
  const cabecalho = Buffer.alloc(13)
  cabecalho.writeUInt32BE(largura, 0)
  cabecalho.writeUInt32BE(altura, 4)
  cabecalho[8] = 8 // 8 bits por cor
  cabecalho[9] = 6 // RGBA
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', cabecalho), bloco('IDAT', deflateSync(cru)), bloco('IEND', Buffer.alloc(0))])
}
