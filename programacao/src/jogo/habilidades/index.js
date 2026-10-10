import { alguemFeridoPerto, curar, fortalecer, proteger } from './apoio.js'
import { giro } from './giro.js'
import Meteoro from './meteoro.js'
import { provocar } from './provocacao.js'
import { caidosNoRaio, ressuscitar } from './ressurreicao.js'
import TiroPerfurante from './tiroPerfurante.js'

// O que cada habilidade faz na partida, pelo "efeito" dela (dados/arvores.js). h = a habilidade com os números do
// nível dela; mira: { angulo, ponto } (para onde o dono está mirando e o ponto do mouse ou do alvo).
export const efeitosDasHabilidades = {
  giro: (cena, dono, mira, h) => giro(cena, dono, h),
  tiroPerfurante: (cena, dono, mira, h) => cena.adicionarProjetil(new TiroPerfurante(cena, dono, mira.angulo, h)),
  meteoro: (cena, dono, mira, h) => cena.adicionarProjetil(new Meteoro(cena, dono, mira.ponto, cena.agora, h)),
  provocacao: (cena, dono, mira, h) => provocar(cena, dono, h),
  ressurreicao: (cena, dono, mira, h) => ressuscitar(cena, dono, h),
  fortalecer: (cena, dono, mira, h) => fortalecer(cena, dono, h),
  proteger: (cena, dono, mira, h) => proteger(cena, dono, h),
  curar: (cena, dono, mira, h) => curar(cena, dono, h),
}

// Habilidade que precisa de alvo para valer a pena: a Ressurreição sem ninguém caído perto e a Cura em área sem ninguém
// ferido perto não saem (nem gastam mana)
export const temAlvoParaAHabilidade = {
  ressurreicao: (cena, dono, h) => caidosNoRaio(cena, dono, h).length > 0,
  curar: (cena, dono, h) => alguemFeridoPerto(cena, dono, h),
}
