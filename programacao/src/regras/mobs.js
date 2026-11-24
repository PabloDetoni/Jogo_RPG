// Regras dos mobs do mundo (Fase 3, TASK-062): a força de cada um pela região, onde nascem e o território.
// Funções puras; os números ficam em dados/balanceamento.js (mundo.mobs) e a população em dados/mundo/.
import { regiaoEm } from './mundo.js'

// A ficha do mob numa região: vida, dano, XP e ouro multiplicados pela força da região (o resto igual).
// base: a ficha do tipo; forca: o multiplicador da região (1 na fácil).
export function fichaNaRegiao(base, forca) {
  const vezes = (valor) => Math.max(1, Math.round(valor * forca))
  return {
    ...base,
    vida: vezes(base.vida),
    dano: vezes(base.dano),
    xp: vezes(base.xp),
    ouro: vezes(base.ouro),
  }
}

// Onde cada mob nasce, a cada partida (o bioma reinicia: RF31). Para cada região, sorteia pontos dentro dela (longe
// da mata), longe dos pontos proibidos (os inícios das regiões: o grupo nunca nasce com mob perto, RF32) e longe dos
// outros mobs. Quem chama ainda passa cada ponto pelo "lugar livre" da cena (pedras, árvores e corpos).
// populacao: { idDaRegiao: { tipo: quantidade } }. Devolve [{ tipo, regiao, x, y }].
export function espalharMobs(regioes, populacao, { proibidos = [], distanciaEntreMobs, margem, tentativas = 40 }, sorteio) {
  const mobs = []
  for (const regiao of regioes) {
    const daRegiao = populacao[regiao.id] ?? {}
    for (const [tipo, quantidade] of Object.entries(daRegiao)) {
      for (let i = 0; i < quantidade; i++) {
        for (let tentativa = 0; tentativa < tentativas; tentativa++) {
          const ponto = {
            x: Math.round(regiao.x0 + margem + sorteio() * (regiao.x1 - regiao.x0 - margem * 2)),
            y: Math.round(regiao.y0 + margem + sorteio() * (regiao.y1 - regiao.y0 - margem * 2)),
          }
          // Floresta grande (Parte 5): a região é um polígono; o ponto (com a margem em volta) tem de ficar dentro dela
          if (regiao.poligono && !pontoComMargemNaRegiao(regioes, regiao, ponto, margem)) continue
          const pertoDeProibido = proibidos.some((proibido) => Math.hypot(proibido.x - ponto.x, proibido.y - ponto.y) < proibido.raio)
          const pertoDeOutro = mobs.some((mob) => Math.hypot(mob.x - ponto.x, mob.y - ponto.y) < distanciaEntreMobs)
          if (pertoDeProibido || pertoDeOutro) continue
          mobs.push({ tipo, regiao: regiao.id, ...ponto })
          break
        }
      }
    }
  }
  return mobs
}

// O ponto e os quatro pontos a "margem" dele (em cruz) ficam na região? (a primeira da lista que contém, como regiaoEm)
function pontoComMargemNaRegiao(regioes, regiao, ponto, margem) {
  return [ponto, { x: ponto.x + margem, y: ponto.y }, { x: ponto.x - margem, y: ponto.y }, { x: ponto.x, y: ponto.y + margem }, { x: ponto.x, y: ponto.y - margem }].every(
    (p) => regiaoEm(regioes, p) === regiao,
  )
}

// O território: o mob só persegue quem está a até "raio" de casa. Fora dele, desiste e volta (RF31, TASK-062).
export function dentroDoTerritorio(casa, ponto, raio) {
  return Math.hypot(ponto.x - casa.x, ponto.y - casa.y) <= raio
}

// Território pela área (Parte 6a de 11/2026): o mob nunca anda para fora da zona dele (o cervo não entra onde há lobo;
// o lobo não entra no acampamento goblin). Olha "olhar" segundos à frente: se o passo inteiro sai da área, tenta só o
// lado de cada eixo (desliza pela borda); sem eixo que caiba (indo reto contra a borda), gira o passo para os lados
// (45° e 90°, os dois sentidos); se nada cabe, para. naArea(ponto) → true/false.
export function passoNaArea(ponto, velocidade, naArea, olhar = 0.12) {
  if (!velocidade.x && !velocidade.y) return velocidade
  const cabe = (v) => naArea({ x: ponto.x + v.x * olhar, y: ponto.y + v.y * olhar })
  if (cabe(velocidade)) return velocidade
  const soX = { x: velocidade.x, y: 0 }
  const soY = { x: 0, y: velocidade.y }
  if (Math.abs(velocidade.x) >= Math.abs(velocidade.y)) {
    if (velocidade.x && cabe(soX)) return soX
    if (velocidade.y && cabe(soY)) return soY
  } else {
    if (velocidade.y && cabe(soY)) return soY
    if (velocidade.x && cabe(soX)) return soX
  }
  for (const giro of [Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2]) {
    const cos = Math.cos(giro)
    const sen = Math.sin(giro)
    const girado = { x: velocidade.x * cos - velocidade.y * sen, y: velocidade.x * sen + velocidade.y * cos }
    if (cabe(girado)) return girado
  }
  return { x: 0, y: 0 }
}

// Para onde o animal pacífico foge (Parte 6a): para longe de todas as ameaças, cada uma pesando mais quanto mais perto.
// Devolve a direção (comprimento 1) ou null se nenhuma ameaça está a até "raio".
export function direcaoDeFuga(ponto, ameacas, raio) {
  let x = 0
  let y = 0
  for (const ameaca of ameacas) {
    const dx = ponto.x - ameaca.x
    const dy = ponto.y - ameaca.y
    const d = Math.hypot(dx, dy)
    if (d > raio) continue
    if (d < 1) {
      x += 1
      continue
    }
    const peso = (raio - d) / raio + 0.2
    x += (dx / d) * peso
    y += (dy / d) * peso
  }
  const tamanho = Math.hypot(x, y)
  return tamanho > 0 ? { x: x / tamanho, y: y / tamanho } : null
}

// Os lugares do bando em volta do líder dele (a matilha do Lobo Alfa, Parte 6a): "quantos" pontos a "distancia" dele,
// espalhados por igual com um giro sorteado.
export function pontosEmVolta(centro, quantos, distancia, sorteio) {
  const giro = sorteio() * Math.PI * 2
  return Array.from({ length: quantos }, (_, i) => {
    const angulo = giro + (i * Math.PI * 2) / quantos
    return { x: Math.round(centro.x + Math.cos(angulo) * distancia), y: Math.round(centro.y + Math.sin(angulo) * distancia) }
  })
}
