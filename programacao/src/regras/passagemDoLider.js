import { combateDeTeste } from '../dados/balanceamento.js'

// PASSAR PELOS ALIADOS (ajustes da partida, 14/10/2026; modo misto, decisão do Pablo):
// - normal: o aliado que está na frente do caminho do Líder sai para o lado antes do encontro, e o grupo "se abre como
//   água" e se fecha depois que ele passa (a IA avançada abre mais cedo e de um jeito mais limpo);
// - encurralado: se o aliado não tem para onde sair (pedra, mata, borda ou outro aliado dos dois lados), o Líder
//   atravessa só ele, sem colidir e sem empurrá-lo para dentro de nada;
// - na fuga (F) e no retorno (Q), o Líder atravessa todos os aliados;
// - passou (os dois já não se tocam), a colisão volta.
// Os mobs continuam colidindo com todo mundo. Números em combateDeTeste.passagemDoLider (PROVISÓRIOS).

const config = () => combateDeTeste.passagemDoLider

const tamanho = (v) => Math.hypot(v.x, v.y)

// O aliado está no caminho do Líder? (à frente, a até "alcance" px, e perto da linha do caminho: a menos da soma dos
// corpos mais a folga). velocidade: para onde o Líder anda agora.
export function naFrenteDoLider(lider, velocidade, aliado, alcance, folga = config().folgaDoCaminho) {
  const v = tamanho(velocidade)
  if (v < 1) return false
  const ux = velocidade.x / v
  const uy = velocidade.y / v
  const dx = aliado.x - lider.x
  const dy = aliado.y - lider.y
  const aFrente = dx * ux + dy * uy
  if (aFrente <= 0 || aFrente > alcance + lider.raio + aliado.raio) return false
  const deLado = Math.abs(dx * -uy + dy * ux)
  return deLado < lider.raio + aliado.raio + folga
}

// Para que lado o aliado sai: perpendicular ao caminho, do lado em que ele já está (exatamente na linha: a direita)
export function ladoParaSair(lider, velocidade, aliado) {
  const v = tamanho(velocidade) || 1
  const ux = velocidade.x / v
  const uy = velocidade.y / v
  const lado = (aliado.x - lider.x) * -uy + (aliado.y - lider.y) * ux >= 0 ? 1 : -1
  return { x: -uy * lado, y: ux * lado }
}

// O aliado cabe ali? (sem parede, dentro da área e sem outro corpo)
function cabe(ponto, raio, { paredes = [], area, outros = [] }) {
  if (area) {
    const dentro =
      ponto.x - raio >= area.x - area.largura / 2 &&
      ponto.x + raio <= area.x + area.largura / 2 &&
      ponto.y - raio >= area.y - area.altura / 2 &&
      ponto.y + raio <= area.y + area.altura / 2
    if (!dentro) return false
  }
  const naParede = paredes.some((p) => Math.abs(ponto.x - p.x) < raio + p.largura / 2 && Math.abs(ponto.y - p.y) < raio + p.altura / 2)
  if (naParede) return false
  return !outros.some((o) => Math.abs(ponto.x - o.x) < raio + o.raio && Math.abs(ponto.y - o.y) < raio + o.raio)
}

// Para onde o aliado sai: o lado preferido, ou o outro; null = encurralado (não cabe em nenhum dos dois).
// mundo: { paredes, area, outros } (outros: os outros aliados e os mobs, sem o Líder e sem ele mesmo)
export function saidaDoAliado(lider, velocidade, aliado, mundo, distancia = config().distanciaParaSair) {
  const preferido = ladoParaSair(lider, velocidade, aliado)
  for (const lado of [preferido, { x: -preferido.x, y: -preferido.y }]) {
    const ponto = { x: aliado.x + lado.x * distancia, y: aliado.y + lado.y * distancia }
    if (cabe(ponto, aliado.raio, mundo)) return lado
  }
  return null
}

// A velocidade para abrir caminho, pelo nível da IA: perpendicular ao Líder, mais forte quanto mais perto ele está
// (a avançada começa mais longe e sai com a velocidade toda; a básica, mais em cima e mais devagar).
export function velocidadeParaAbrir(lider, aliado, lado, nivelDaIA, velocidadeDeAndar = combateDeTeste.personagem.velocidade) {
  const { alcance, forca } = config()
  const longe = alcance[nivelDaIA] ?? alcance.media
  const ate = Math.hypot(aliado.x - lider.x, aliado.y - lider.y) - lider.raio - aliado.raio
  const perto = Math.min(1, Math.max(0.35, 1 - ate / Math.max(1, longe)))
  const v = velocidadeDeAndar * (forca[nivelDaIA] ?? forca.media) * perto
  return { x: lado.x * v, y: lado.y * v }
}

// O Líder atravessa este aliado agora? (na fuga e no retorno, sempre; senão, só o encurralado que está no caminho)
export function liderAtravessa({ fugindoOuRetornando, encurralado }) {
  return Boolean(fugindoOuRetornando || encurralado)
}

// A colisão volta: os dois corpos já não se tocam (com uma folga)
export function colisaoVolta(lider, aliado, folga = config().folgaParaVoltar) {
  return Math.abs(lider.x - aliado.x) >= lider.raio + aliado.raio + folga || Math.abs(lider.y - aliado.y) >= lider.raio + aliado.raio + folga
}
