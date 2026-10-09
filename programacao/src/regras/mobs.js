// Regras dos mobs do mundo (Fase 3, TASK-062): a força de cada um pela região, onde nascem e o território.
// Funções puras; os números ficam em dados/balanceamento.js (mundo.mobs) e a população em dados/mundo/.

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

// O território: o mob só persegue quem está a até "raio" de casa. Fora dele, desiste e volta (RF31, TASK-062).
export function dentroDoTerritorio(casa, ponto, raio) {
  return Math.hypot(ponto.x - casa.x, ponto.y - casa.y) <= raio
}
