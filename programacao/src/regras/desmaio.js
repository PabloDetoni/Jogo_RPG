// Desmaio e resgate na partida (TASK-044; RF43, RF47; Conceito §11.7). Funções puras.
// Ninguém morre: quem fica sem vida desmaia e tem 30 s para ser levantado. A ajuda de alguém de pé, parado
// perto, leva 5 s com a área limpa. Sem ajuda, a Pedra de Retorno leva o personagem ao Reino (perdido).
// Se o Líder não for levantado em 30 s, a partida acaba em Retorno forçado; se todos caírem, em Derrota.

const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

// Área limpa (decisão de 06/10): nenhum inimigo vivo a menos de "raio" de quem caiu
export function areaLimpa(ponto, inimigos, raio) {
  return !inimigos.some((inimigo) => !inimigo.morto && distancia(ponto, inimigo) < raio)
}

// Segundos que ainda faltam para o prazo de quem caiu (arredondado para cima, para a contagem na tela)
export function segundosRestantes(caidoDesde, agora, prazoMs) {
  return Math.max(0, Math.ceil((caidoDesde + prazoMs - agora) / 1000))
}

export function prazoAcabou(caidoDesde, agora, prazoMs) {
  return agora - caidoDesde >= prazoMs
}

// Está ajudando? De pé, parado (sem tentar andar) e perto de quem caiu
export function estaAjudando(ajudante, caido, { raioDaAjuda, velocidadeQuerida }) {
  if (ajudante === caido || ajudante.caido || ajudante.perdido) return false
  const parado = Math.hypot(velocidadeQuerida.x, velocidadeQuerida.y) < 1
  return parado && distancia(ajudante, caido) <= raioDaAjuda
}

// Progresso da ajuda, em ms: sobe enquanto alguém ajuda com a área limpa. Se a área sujar ou ninguém
// estiver ajudando, volta a zero (são 5 s seguidos).
export function avancarAjuda(progresso, { temAjudante, limpa, ms }) {
  return temAjudante && limpa ? progresso + ms : 0
}

// Vida de quem foi levantado pela ajuda (cerca de 10%; pelo menos 1)
export function vidaAoLevantar(vidaMaxima, percentual) {
  return Math.max(1, Math.ceil((vidaMaxima * percentual) / 100))
}

// Fim da partida por desmaio. membros: os que ainda estão no mapa ({ lider, caido, caidoDesde }).
// Ninguém de pé → Derrota na hora (vale também para um personagem só).
// Líder caído há 30 s → Retorno forçado (os aliados de pé vão embora sem ser perdidos).
export function fimPorDesmaio(membros, agora, prazoMs) {
  if (!membros.some((membro) => !membro.caido)) return { resultado: 'derrota', motivo: 'Todos os personagens desmaiaram' }
  const lider = membros.find((membro) => membro.lider)
  if (lider?.caido && prazoAcabou(lider.caidoDesde, agora, prazoMs)) {
    return { resultado: 'retornoForcado', motivo: 'Líder não levantado em 30 s' }
  }
  return null
}

// Quem vai ajudar quem. Cada caído recebe no máximo um ajudante, e cada aliado ajuda no máximo um caído.
// O Líder caído vem primeiro; depois, quem tem menos tempo. O Sacerdote vai antes dos outros; senão,
// vai o mais perto. caidos e disponiveis: [{ id, x, y, classe, lider, caidoDesde }].
// Devolve [{ ajudante, caido }] com os ids.
export function escolherAjudantes(caidos, disponiveis) {
  const ordem = [...caidos].sort((a, b) => Number(b.lider) - Number(a.lider) || a.caidoDesde - b.caidoDesde)
  const livres = [...disponiveis]
  const pares = []
  for (const caido of ordem) {
    if (livres.length === 0) break
    const sacerdote = livres.find((membro) => membro.classe === 'sacerdote')
    const ajudante =
      sacerdote ?? livres.reduce((maisPerto, outro) => (distancia(outro, caido) < distancia(maisPerto, caido) ? outro : maisPerto))
    livres.splice(livres.indexOf(ajudante), 1)
    pares.push({ ajudante: ajudante.id, caido: caido.id })
  }
  return pares
}
