import { giro } from './giro.js'
import Meteoro from './meteoro.js'
import { provocar } from './provocacao.js'
import { caidosNoRaio, ressuscitar } from './ressurreicao.js'
import TiroPerfurante from './tiroPerfurante.js'

// O que cada habilidade faz na arena, pelo id de dados/habilidades.js.
// mira: { angulo, ponto } (para onde o dono está mirando e o ponto do mouse ou do alvo).
// Para trocar uma habilidade de teste pela de verdade (TASK-010), troque aqui e em dados/habilidades.js.
export const efeitosDasHabilidades = {
  giro: (cena, dono) => giro(cena, dono),
  tiroPerfurante: (cena, dono, mira) => cena.adicionarProjetil(new TiroPerfurante(cena, dono, mira.angulo)),
  meteoro: (cena, dono, mira) => cena.adicionarProjetil(new Meteoro(cena, dono, mira.ponto, cena.agora)),
  provocacao: (cena, dono) => provocar(cena, dono),
  ressurreicao: (cena, dono) => ressuscitar(cena, dono),
}

// Habilidade que precisa de alvo para valer a pena (a Ressurreição sem ninguém caído perto não sai)
export const temAlvoParaAHabilidade = {
  ressurreicao: (cena, dono) => caidosNoRaio(cena, dono).length > 0,
}
