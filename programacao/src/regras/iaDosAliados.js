// IA de combate da partida (TASK-043, TASK-045; RF42; Conceito §5). Funções puras: escolhem alvos e lugares;
// o Phaser (src/jogo/iaDosAliados.js) só anda e ataca. Pontos são { x, y }.
//   Tanque: atrai os mobs perto do grupo (mobs perto dele vão nele).
//   Guerreiro: ataca o mob mais próximo.
//   Arqueiro: ataca de longe, sem encostar no mob.
//   Mago: mira onde há mais mobs juntos.
//   Sacerdote: cura e levanta os caídos, com prioridade para o Líder.
// Todos voltam para perto do Líder se ele se afastar demais.

const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
const vivos = (inimigos) => inimigos.filter((inimigo) => !inimigo.morto)

// Inimigos que valem a luta: vivos e a até raioDeCombate do Líder (ninguém sai correndo atrás de mob longe)
export function inimigosPerto(inimigos, lider, raioDeCombate) {
  return vivos(inimigos).filter((inimigo) => distancia(inimigo, lider) <= raioDeCombate)
}

export function maisProximo(de, lista) {
  let melhor = null
  for (const item of lista) if (!melhor || distancia(de, item) < distancia(de, melhor)) melhor = item
  return melhor
}

// Mago: o ponto com mais inimigos juntos. Para cada inimigo, conta quantos estão a até "raio" dele;
// ganha quem tem mais (empate: o mais perto do Mago), e o ponto é o meio desse grupinho.
export function pontoDeMaisInimigos(mago, inimigos, raio) {
  let melhor = null
  for (const inimigo of vivos(inimigos)) {
    const juntos = vivos(inimigos).filter((outro) => distancia(inimigo, outro) <= raio)
    const empatou = melhor && juntos.length === melhor.quantos && distancia(mago, inimigo) < distancia(mago, melhor.centro)
    if (!melhor || juntos.length > melhor.quantos || empatou) {
      const x = juntos.reduce((soma, outro) => soma + outro.x, 0) / juntos.length
      const y = juntos.reduce((soma, outro) => soma + outro.y, 0) / juntos.length
      melhor = { x, y, quantos: juntos.length, centro: inimigo }
    }
  }
  return melhor && { x: melhor.x, y: melhor.y, quantos: melhor.quantos }
}

// Arqueiro e Mago: onde ficar para atacar de longe. Perto demais, recua; longe demais, chega mais perto;
// dentro da faixa, fica onde está. Sempre na linha entre o alvo e onde já está (do mesmo lado).
export function posicaoADistancia(atirador, alvo, { minima, maxima }) {
  const ate = distancia(atirador, alvo)
  if (ate >= minima && ate <= maxima) return { x: atirador.x, y: atirador.y }
  const meio = (minima + maxima) / 2
  const direcao = ate > 0 ? { x: (atirador.x - alvo.x) / ate, y: (atirador.y - alvo.y) / ate } : { x: -1, y: 0 }
  return { x: alvo.x + direcao.x * meio, y: alvo.y + direcao.y * meio }
}

// Vagas em volta do alvo para quem luta de perto: uma para cada, espalhadas, a primeira do lado do Líder.
export function vagaEmVoltaDoAlvo(alvo, indice, total, distanciaDoAlvo, ladoDoLider) {
  const base = Math.atan2(ladoDoLider.y - alvo.y, ladoDoLider.x - alvo.x)
  const passo = total > 1 ? Math.min(Math.PI / 2.5, (2 * Math.PI) / total) : 0
  const angulo = base + (indice - (total - 1) / 2) * passo
  return { x: alvo.x + Math.cos(angulo) * distanciaDoAlvo, y: alvo.y + Math.sin(angulo) * distanciaDoAlvo }
}

// Tanque: fica entre o mob e o Líder, colado no mob, para segurar o mob longe do grupo
export function posicaoDoTanque(alvo, lider, distanciaDoAlvo) {
  const ate = distancia(alvo, lider)
  if (ate === 0) return { x: alvo.x - distanciaDoAlvo, y: alvo.y }
  return { x: alvo.x + ((lider.x - alvo.x) / ate) * distanciaDoAlvo, y: alvo.y + ((lider.y - alvo.y) / ate) * distanciaDoAlvo }
}

// Voltar para o Líder: começa a voltar longe (raioDaCorrente) e só para de voltar perto (raioDeVolta)
export function deveVoltar(voltando, distanciaAoLider, { raioDaCorrente, raioDeVolta }) {
  return voltando ? distanciaAoLider > raioDeVolta : distanciaAoLider > raioDaCorrente
}

// Quem o inimigo ataca. membros: os de pé ({ x, y, classe, provocando }); quem caiu ou foi perdido não conta.
// - Um Tanque com a Provocação ligada puxa todos os inimigos no raio dela.
// - Um Tanque a até raioDeAtracao do inimigo atrai o inimigo.
// - Quem já persegue alguém continua até esse alguém passar do raio de desistência.
// - Quem não persegue ninguém vai no mais perto que entrar no raio de detecção.
// Devolve o membro escolhido ou null (desiste / continua passeando).
export function alvoDoInimigo(inimigo, membros, { alvoAtual, raioDeDeteccao, raioDeDesistencia, raioDeAtracao, raioDaProvocacao }) {
  const tanques = membros.filter((membro) => membro.classe === 'tanque')
  const provocando = tanques.find((tanque) => tanque.provocando && distancia(tanque, inimigo) <= raioDaProvocacao)
  if (provocando) return provocando
  const perseguindo = alvoAtual && membros.includes(alvoAtual) && distancia(inimigo, alvoAtual) <= raioDeDesistencia
  const raio = perseguindo ? raioDeDesistencia : raioDeDeteccao
  const atraindo = tanques.find((tanque) => distancia(tanque, inimigo) <= Math.min(raioDeAtracao, raio))
  if (atraindo && (perseguindo || distancia(inimigo, atraindo) <= raioDeDeteccao)) return atraindo
  if (perseguindo) return alvoAtual
  const perto = membros.filter((membro) => distancia(inimigo, membro) <= raioDeDeteccao)
  return maisProximo(inimigo, perto)
}

// Sacerdote: quem curar. O Líder primeiro, se estiver abaixo do limite; senão, quem tem a menor fração de
// vida abaixo do limite. Caídos não contam (a cura não levanta ninguém). null = ninguém precisa.
export function quemCurar(membros, limite) {
  const precisam = membros.filter((membro) => !membro.caido && !membro.perdido && membro.vida / membro.vidaMaxima < limite)
  const lider = precisam.find((membro) => membro.lider)
  if (lider) return lider
  let pior = null
  for (const membro of precisam) if (!pior || membro.vida / membro.vidaMaxima < pior.vida / pior.vidaMaxima) pior = membro
  return pior
}
