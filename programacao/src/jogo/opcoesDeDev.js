import { combateDeTeste } from '../dados/balanceamento.js'
import { vagaNaFormacao } from '../regras/combate.js'
import { proximoMultiplicador } from '../regras/opcoesDeDev.js'
import { particulas } from './efeitos.js'

// Opções de desenvolvedor na partida (RF61, Parte 1 de 11/2026): super velocidade e teletransporte.
// SÓ NO npm run dev: a cena carrega este arquivo com import() dentro de "if (import.meta.env.DEV)", então no jogo
// publicado ele nem entra no pacote (o conferir:configuracao procura a marca abaixo no site e avisa se achar).
export const marcaDasOpcoesDeDev = 'Opções de desenvolvedor: teletransporte e super velocidade'

const { raioDaFormacao } = combateDeTeste

export function ligarOpcoesDeDev(cena) {
  // "T + clique" no mapa: teletransporta para o ponto do clique (e o clique não vira ataque)
  // (o clique de ataque da cena olha cena.teclaDeTeletransporte e não ataca com o T apertado)
  const teclaT = cena.input.keyboard.addKey('T', false)
  cena.teclaDeTeletransporte = teclaT
  cena.input.on('pointerdown', (ponteiro) => {
    if (!teclaT.isDown || !ponteiro.leftButtonDown()) return
    teletransportar(cena, { x: ponteiro.worldX, y: ponteiro.worldY })
  })
  cena.opcoesDeDev = {
    marca: marcaDasOpcoesDeDev,
    teletransportar: (ponto) => teletransportar(cena, ponto),
    trocarSuperVelocidade: (multiplicador) => {
      cena.superVelocidade = multiplicador ?? proximoMultiplicador(cena.superVelocidade)
    },
  }
}

// Leva o Líder e o grupo para o lugar livre mais perto do ponto (lugarLivre), cada aliado na vaga dele em volta, e a
// câmera junto. Ninguém fica dentro de pedra, de mata ou de outro corpo.
function teletransportar(cena, ponto) {
  const { lider } = cena
  if (!lider || cena.terminou) return
  // a área tem x e y no centro
  const { area } = cena
  const dentro = {
    x: Math.min(area.x + area.largura / 2, Math.max(area.x - area.largura / 2, ponto.x)),
    y: Math.min(area.y + area.altura / 2, Math.max(area.y - area.altura / 2, ponto.y)),
  }
  const grupo = cena.grupo.filter((membro) => !membro.morto)
  const lugarDoLider = cena.lugarLivre(lider.tamanho, dentro, lider)
  lider.puxando = null
  lider.colocarEm(lugarDoLider.x, lugarDoLider.y)
  const aliados = grupo.filter((membro) => membro !== lider)
  aliados.forEach((aliado, indice) => {
    const vaga = vagaNaFormacao(indice, aliados.length, raioDaFormacao)
    const lugar = cena.lugarLivre(aliado.tamanho, { x: lugarDoLider.x + vaga.x, y: lugarDoLider.y + vaga.y }, aliado)
    aliado.puxando = null
    aliado.colocarEm(lugar.x, lugar.y)
    cena.navegador?.esquecer(aliado)
  })
  cena.cameras.main.centerOn(lugarDoLider.x, lugarDoLider.y)
  cena.teletransportes = (cena.teletransportes ?? 0) + 1
  particulas(cena, lugarDoLider.x, lugarDoLider.y, 0x9be7ff, 16, 240)
}
