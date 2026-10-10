import { combateDeTeste } from '../../dados/balanceamento.js'
import { camadas, numeroFlutuante } from '../efeitos.js'

const config = combateDeTeste.habilidades.tanque

// Provocação (Tanque, provisória): por alguns segundos, os mobs no raio vão no Tanque (a escolha do alvo
// está em regras/iaDosAliados.js) e ele leva só parte do dano.
export function provocar(cena, tanque, h = config) {
  tanque.provocandoAte = cena.agora + h.msDeDuracao
  tanque.reducaoDaProvocacao = Math.min(0.8, h.reducaoDeDano) // sobe com o nível da habilidade (Fase 4)
  const anel = cena.add
    .circle(tanque.x, tanque.y, h.raio, 0xff4d4d, 0.12)
    .setStrokeStyle(4, 0xff4d4d, 0.9)
    .setDepth(camadas.aura)
  cena.tweens.add({ targets: anel, scale: 0.15, alpha: 0, duration: 450, ease: 'Quad.In', onComplete: () => anel.destroy() })
  numeroFlutuante(cena, tanque.x, tanque.y - 50, 'PROVOCAÇÃO!', '#ff8f8f', 22)
  tanque.deformar(1.3, 1.3, 80, 200)
}
