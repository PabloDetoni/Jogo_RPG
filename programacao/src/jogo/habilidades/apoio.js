import { camadas, numeroFlutuante, particulas } from '../efeitos.js'

// Efeitos de apoio das árvores (Fase 4, TASK-077): fortalecer (mais dano), proteger (menos dano recebido) e curar em
// área. "h" é a habilidade com os números do nível dela (regras/habilidadesDaArvore.js). Os efeitos que duram ficam em
// membro.efeitos ({ tipo: { multiplicador, ate } }), que a cena lê ao acertar e ao levar golpe.

const pertoDe = (dono, raio) => (membro) => !membro.caido && Math.hypot(membro.x - dono.x, membro.y - dono.y) <= raio

function anel(cena, dono, raio, cor) {
  const circulo = cena.add.circle(dono.x, dono.y, raio, cor, 0.18).setStrokeStyle(4, cor, 0.9).setDepth(camadas.aura).setScale(0.2)
  cena.tweens.add({ targets: circulo, scale: 1, alpha: 0, duration: 500, ease: 'Cubic.Out', onComplete: () => circulo.destroy() })
}

// Mais dano por um tempo: no próprio dono (Fúria) ou no grupo perto dele (Bênção)
export function fortalecer(cena, dono, h) {
  const ate = cena.agora + h.msDeDuracao
  const alvos = h.alvo === 'grupo' ? cena.grupo.filter(pertoDe(dono, h.raio)) : [dono]
  for (const membro of alvos) membro.efeitos = { ...membro.efeitos, dano: { multiplicador: 1 + h.bonusDeDano, ate } }
  anel(cena, dono, h.raio ?? dono.tamanho * 2, h.cor ?? 0xff4d4d)
  numeroFlutuante(cena, dono.x, dono.y - 50, `${h.nome.toUpperCase()}!`, '#ffd0a0', 22)
  dono.deformar(1.25, 1.25, 70, 180)
}

// Menos dano recebido por um tempo, no grupo perto do dono (Muralha)
export function proteger(cena, dono, h) {
  const ate = cena.agora + h.msDeDuracao
  for (const membro of cena.grupo.filter(pertoDe(dono, h.raio))) {
    membro.efeitos = { ...membro.efeitos, protecao: { multiplicador: 1 - Math.min(0.8, h.reducaoDeDano), ate } }
  }
  anel(cena, dono, h.raio, h.cor ?? 0x9fc5ff)
  numeroFlutuante(cena, dono.x, dono.y - 50, `${h.nome.toUpperCase()}!`, '#cfe2ff', 22)
}

// Há alguém de pé e ferido perto? (a Cura em área sem ninguém para curar não sai)
export function alguemFeridoPerto(cena, dono, h) {
  return cena.grupo.filter(pertoDe(dono, h.raio)).some((membro) => membro.vida < membro.vidaMaxima)
}

// Cura de uma vez todo o grupo de pé perto do dono (Cura em área); a passiva de cura do dono (Fé) soma
export function curar(cena, dono, h) {
  const cura = Math.round(h.cura * (dono.multiplicadorDeCura ?? 1))
  for (const membro of cena.grupo.filter(pertoDe(dono, h.raio))) {
    if (membro.vida >= membro.vidaMaxima) continue
    const antes = membro.vida
    membro.vida = Math.min(membro.vidaMaxima, membro.vida + cura)
    numeroFlutuante(cena, membro.x, membro.y - 40, `+${Math.round(membro.vida - antes)}`, '#7dff9a', 18)
    particulas(cena, membro.x, membro.y, 0x7dff9a, 6, 140)
  }
  anel(cena, dono, h.raio, h.cor ?? 0x7dff9a)
}
