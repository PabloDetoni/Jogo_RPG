import { combateDeTeste } from '../../dados/balanceamento.js'
import { camadas, numeroFlutuante, particulas } from '../efeitos.js'

const config = combateDeTeste.habilidades.sacerdote

// Ressurreição (Sacerdote, Conceito §7; números provisórios): levanta todos os caídos no raio, com vida cheia,
// fortalecimento curto e breve imunidade. Não precisa de área limpa (funciona no meio da luta).
export function caidosNoRaio(cena, sacerdote) {
  return cena.grupo.filter((membro) => membro.caido && Math.hypot(membro.x - sacerdote.x, membro.y - sacerdote.y) <= config.raio)
}

export function ressuscitar(cena, sacerdote) {
  const agora = cena.time.now
  const anel = cena.add
    .circle(sacerdote.x, sacerdote.y, config.raio, 0xffe680, 0.25)
    .setStrokeStyle(5, 0xffd700)
    .setDepth(camadas.aura)
    .setScale(0.2)
  cena.tweens.add({ targets: anel, scale: 1.1, alpha: 0, duration: 600, ease: 'Cubic.Out', onComplete: () => anel.destroy() })
  numeroFlutuante(cena, sacerdote.x, sacerdote.y - 50, 'RESSURREIÇÃO', '#ffe680', 24)
  for (const caido of caidosNoRaio(cena, sacerdote)) {
    cena.levantar(caido, {
      vida: caido.vidaMaxima,
      fimDaImunidade: agora + config.msDeImunidade,
      fimDoFortalecimento: agora + config.msDeFortalecimento,
    })
    particulas(cena, caido.x, caido.y, 0xffd700, 16, 260)
  }
}
