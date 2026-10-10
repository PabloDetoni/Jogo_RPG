import * as Phaser from 'phaser'
import { coresDaArena, tamanhoDaArena } from '../dados/arenaDeTeste.js'
import { mapaDoBioma } from '../regras/mapaDaPartida.js'
import CenaArena from './cenas/CenaArena.js'

// Cria o Phaser dentro do elemento dado. A tela tem 1600 × 900 e se ajusta à caixa 16:9 (modo FIT):
// quando a janela muda de tamanho, o Phaser redimensiona o desenho e corrige a posição do mouse.
// Na Floresta (Fase 3), a câmera mostra um pedaço do mapa; na arena de teste, a arena inteira cabe na tela.
// Este arquivo só é carregado ao abrir a Partida (import dinâmico em ArenaDaPartida.jsx).
// partida: { bioma, pontoPartida }
export function criarJogo(elemento, { ponte, grupo, partida }) {
  const mapa = mapaDoBioma(partida?.bioma)
  const jogo = new Phaser.Game({
    type: Phaser.AUTO,
    parent: elemento,
    width: tamanhoDaArena.largura,
    height: tamanhoDaArena.altura,
    backgroundColor: mapa.comCamera ? mapa.cores.mata : coresDaArena.chao,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    // overlapBias: até quantos px dentro um do outro a física ainda separa os corpos (o padrão, 4, desiste cedo
    // demais quando o navegador está lento e deixa um corpo "enterrado" no outro)
    physics: { default: 'arcade', arcade: { debug: false, overlapBias: 16 } },
    disableContextMenu: true,
    banner: false,
    audio: { noAudio: true }, // o som entra na etapa 9
  })
  jogo.scene.add('arena', CenaArena, true, { ponte, grupo, partida })
  return jogo
}
