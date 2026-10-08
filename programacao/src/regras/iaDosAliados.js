// IA de combate da partida (TASK-043, TASK-045; RF42; Conceito §5). Funções puras: escolhem alvos e lugares;
// o Phaser (src/jogo/iaDosAliados.js) só anda e ataca. Pontos são { x, y }.
//   Tanque: atrai os mobs perto do grupo (mobs perto dele vão nele).
//   Guerreiro: ataca o mob mais próximo.
//   Arqueiro: ataca de longe, sem encostar no mob.
//   Mago: mira onde há mais mobs juntos.
//   Sacerdote: cura e levanta os caídos, com prioridade para o Líder.
// Todos voltam para perto do Líder se ele se afastar demais.

import { linhaLivre, lugarLivre } from './movimento.js'

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

// ---------- Parados em volta do Líder (5b.1: sem tremor) ----------

// A vaga do X é só referência. Regras:
// - parado: continua parado enquanto o Líder estiver até a distância máxima + folga (não corrige nada);
// - andando com o Líder parado: para assim que entra na zona (entre a mínima e a máxima); com tolerância
//   (IA média e avançada), só quando também está perto da vaga, ou quando não consegue chegar mais perto
//   dela (travado: outro corpo, pedra ou borda no caminho);
// - andando com o Líder andando: continua indo para a vaga.
// Devolve true se deve ficar parado.
export function deveFicarParado(
  { parado, distanciaAoLider, distanciaAVaga, liderAndando, travado = false },
  { minima, maxima, folga, tolerancia = null },
) {
  if (parado) return distanciaAoLider <= maxima + folga
  if (liderAndando) return false
  const naZona = distanciaAoLider >= minima && distanciaAoLider <= maxima
  return naZona && (tolerancia === null || distanciaAVaga <= tolerancia || travado)
}

// Detector de tremor: numa janela de tempo, soma o caminho andado e compara com o quanto saiu do lugar.
// Vai e volta (caminho bem maior que o deslocamento) sem sair do lugar = tremendo.
// registro: { inicio, origem, ultima, caminho } (null no começo). Devolve { registro, tremendo }.
export function acompanharTremor(registro, { agora, posicao }, { msDaJanela, razao, deslocamentoMaximo, caminhoMinimo }) {
  if (!registro) return { registro: { inicio: agora, origem: { ...posicao }, ultima: { ...posicao }, caminho: 0 }, tremendo: false }
  const caminho = registro.caminho + distancia(registro.ultima, posicao)
  if (agora - registro.inicio < msDaJanela) {
    return { registro: { ...registro, ultima: { ...posicao }, caminho }, tremendo: false }
  }
  const saiu = distancia(registro.origem, posicao)
  const tremendo = caminho >= caminhoMinimo && saiu < deslocamentoMaximo && caminho > saiu * razao
  return { registro: { inicio: agora, origem: { ...posicao }, ultima: { ...posicao }, caminho: 0 }, tremendo }
}

// Aliado parado no caminho do Líder: se o Líder anda na direção dele e está encostando, o aliado dá um
// passo para o lado (o lado de que já está mais perto). Devolve a direção (tamanho 1) ou null.
export function passagemParaOLider(aliado, lider, velocidadeDoLider, contato) {
  const velocidade = Math.hypot(velocidadeDoLider.x, velocidadeDoLider.y)
  if (velocidade < 20 || distancia(aliado, lider) > contato) return null
  const frente = { x: velocidadeDoLider.x / velocidade, y: velocidadeDoLider.y / velocidade }
  const ate = { x: aliado.x - lider.x, y: aliado.y - lider.y }
  if (ate.x * frente.x + ate.y * frente.y <= 0) return null // está atrás ou do lado: não atrapalha
  const lado = ate.x * -frente.y + ate.y * frente.x >= 0 ? 1 : -1
  return { x: -frente.y * lado, y: frente.x * lado }
}

// ---------- Linha de tiro (5b.1) ----------

// Nenhuma pedra entre quem atira e o alvo (folga = metade da grossura do tiro)
export function temLinhaDeTiro(de, alvo, pedras, folga) {
  return linhaLivre(de, alvo, pedras, folga)
}

// O inimigo mais perto que dá para acertar daqui (sem pedra no caminho), ou null
export function alvoComLinhaDeTiro(de, inimigos, pedras, folga) {
  return maisProximo(
    de,
    vivos(inimigos).filter((inimigo) => temLinhaDeTiro(de, inimigo, pedras, folga)),
  )
}

// Um lugar, na distância certa do alvo, de onde dá para acertá-lo: testa pontos numa volta em volta dele
// e fica com o mais perto de quem atira. Fora da área ou dentro de pedra não vale. null se não houver.
export function pontoComLinhaDeTiro(atirador, alvo, { pedras, area, distanciaDoAlvo, folga, raioDoCorpo, pontos }) {
  let melhor = null
  for (let i = 0; i < pontos; i++) {
    const angulo = (2 * Math.PI * i) / pontos
    const ponto = { x: alvo.x + Math.cos(angulo) * distanciaDoAlvo, y: alvo.y + Math.sin(angulo) * distanciaDoAlvo }
    if (!lugarLivre(ponto, { area, paredes: pedras, raio: raioDoCorpo })) continue
    if (!temLinhaDeTiro(ponto, alvo, pedras, folga)) continue
    if (!melhor || distancia(atirador, ponto) < distancia(atirador, melhor)) melhor = ponto
  }
  return melhor
}

// ---------- IA avançada ----------

// O inimigo mais forte: o de mais vida máxima; no empate, o que bate mais; depois, o mais perto
export function inimigoMaisForte(de, inimigos) {
  let melhor = null
  for (const inimigo of vivos(inimigos)) {
    if (!melhor) {
      melhor = inimigo
      continue
    }
    const forca = (outro) => [outro.vidaMaxima ?? 0, outro.dano ?? 0]
    const [vidaA, danoA] = forca(inimigo)
    const [vidaB, danoB] = forca(melhor)
    if (vidaA > vidaB || (vidaA === vidaB && (danoA > danoB || (danoA === danoB && distancia(de, inimigo) < distancia(de, melhor))))) {
      melhor = inimigo
    }
  }
  return melhor
}

// Formação de combate: "frente" é a direção do Líder para o meio dos inimigos.
// Tanque sozinho na frente, colado no mob mais perto do grupo; Guerreiro ao lado dele, um pouco atrás;
// Arqueiro e Mago lado a lado, atrás, cada um na sua distância do meio dos inimigos; Sacerdote no fundo,
// entre os dois e um pouco atrás. Devolve { tanque, guerreiro, arqueiro, mago, sacerdote, frente }.
export function posicoesDeCombate(lider, inimigos, { tanqueAteOMob, guerreiroAoLado, distanciaEntreArqueiroEMago, sacerdoteAtras, distanciaDoArqueiro, distanciaDoMago }) {
  const lista = vivos(inimigos)
  if (lista.length === 0) return null
  const meio = { x: lista.reduce((s, i) => s + i.x, 0) / lista.length, y: lista.reduce((s, i) => s + i.y, 0) / lista.length }
  const ate = distancia(lider, meio)
  const frente = ate > 0 ? { x: (meio.x - lider.x) / ate, y: (meio.y - lider.y) / ate } : { x: 1, y: 0 }
  const lado = { x: -frente.y, y: frente.x }
  const maisPertoDoLider = maisProximo(lider, lista)
  const tanque = { x: maisPertoDoLider.x - frente.x * tanqueAteOMob, y: maisPertoDoLider.y - frente.y * tanqueAteOMob }
  const guerreiro = {
    x: tanque.x + lado.x * guerreiroAoLado - frente.x * guerreiroAoLado * 0.4,
    y: tanque.y + lado.y * guerreiroAoLado - frente.y * guerreiroAoLado * 0.4,
  }
  const meiaDistancia = distanciaEntreArqueiroEMago / 2
  const arqueiroAte = (distanciaDoArqueiro.minima + distanciaDoArqueiro.maxima) / 2
  const magoAte = (distanciaDoMago.minima + distanciaDoMago.maxima) / 2
  const arqueiro = { x: meio.x - frente.x * arqueiroAte - lado.x * meiaDistancia, y: meio.y - frente.y * arqueiroAte - lado.y * meiaDistancia }
  const mago = { x: meio.x - frente.x * magoAte + lado.x * meiaDistancia, y: meio.y - frente.y * magoAte + lado.y * meiaDistancia }
  const sacerdote = {
    x: (arqueiro.x + mago.x) / 2 - frente.x * sacerdoteAtras,
    y: (arqueiro.y + mago.y) / 2 - frente.y * sacerdoteAtras,
  }
  return { tanque, guerreiro, arqueiro, mago, sacerdote, frente }
}

// Recuar andando do golpe avisado (os aliados não esquivam): direção para longe do mob, tamanho 1
export function direcaoDeRecuo(aliado, mob) {
  const ate = distancia(mob, aliado)
  if (ate === 0) return { x: 1, y: 0 }
  return { x: (aliado.x - mob.x) / ate, y: (aliado.y - mob.y) / ate }
}

// Sacerdote: quem curar (regra do Pablo de 08/10). Ele cura SEMPRE que alguém do grupo (Líder, aliados ou ele
// mesmo) não está com a vida cheia, em combate ou fora dele, em qualquer nível da IA. Levantar os caídos vem antes
// (a ajuda e a Ressurreição); aqui caídos e perdidos não contam. Devolve o membro, ou null se ninguém precisa.
// Ordem: o mais ferido (menor fração da vida); em empate (diferença de até "empate", em fração da vida), o Líder.
// O nível muda só a escolha:
//   'basica' errando: pega o ferido mais perto dele ("de"), mesmo que não seja o mais ferido;
//   'media': o mais ferido;
//   'avancada': quem está sendo atacado conta como mais ferido (cada inimigo mirando nele vale urgenciaPorAtacante).
// atacantes(membro): quantos inimigos miram naquele membro (só a avançada olha).
export function quemCurar(membros, { de = null, estilo = 'media', errou = false, empate = 0.05, urgenciaPorAtacante = 0.1, atacantes = () => 0 } = {}) {
  const feridos = membros.filter((membro) => !membro.caido && !membro.perdido && membro.vida < membro.vidaMaxima)
  if (feridos.length === 0) return null
  if (estilo === 'basica' && errou && de) return maisProximo(de, feridos)
  const urgencia = (membro) =>
    membro.vida / membro.vidaMaxima - (estilo === 'avancada' ? atacantes(membro) * urgenciaPorAtacante : 0)
  const menor = Math.min(...feridos.map(urgencia))
  const empatados = feridos.filter((membro) => urgencia(membro) <= menor + empate)
  return empatados.find((membro) => membro.lider) ?? feridos.find((membro) => urgencia(membro) === menor)
}

// Onde o Sacerdote da IA avançada fica para curar: protegido, do lado do ferido mais longe do inimigo mais perto
// dele, a "distanciaDoAlvo" px (a aura alcança o ferido e o Sacerdote fica atrás). Sem inimigos, para a essa
// distância do ferido, do lado de onde vem. Curando a si mesmo, fica onde está.
export function posicaoParaCurar(sacerdote, alvo, inimigos, distanciaDoAlvo) {
  if (alvo === sacerdote || distancia(sacerdote, alvo) === 0) return { x: sacerdote.x, y: sacerdote.y }
  const mob = maisProximo(alvo, vivos(inimigos))
  const origem = mob && distancia(mob, alvo) > 0 ? mob : null
  const de = origem ?? alvo
  const para = origem ? alvo : sacerdote
  const ate = distancia(de, para)
  if (!origem && ate <= distanciaDoAlvo) return { x: sacerdote.x, y: sacerdote.y }
  return { x: alvo.x + ((para.x - de.x) / ate) * distanciaDoAlvo, y: alvo.y + ((para.y - de.y) / ate) * distanciaDoAlvo }
}
