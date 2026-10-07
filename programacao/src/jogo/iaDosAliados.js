import { combateDeTeste } from '../dados/balanceamento.js'
import { anguloEntre, vagaNaFormacao, velocidadeParaSeguir } from '../regras/combate.js'
import { areaLimpa } from '../regras/desmaio.js'
import {
  deveVoltar,
  inimigosPerto,
  maisProximo,
  pontoDeMaisInimigos,
  posicaoADistancia,
  posicaoDoTanque,
  quemCurar,
  vagaEmVoltaDoAlvo,
} from '../regras/iaDosAliados.js'

const { ia, personagem, ataques, habilidades, desmaio, raioDaFormacao } = combateDeTeste
const velocidade = personagem.velocidade * 1.15
const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

// IA dos aliados (TASK-043 e TASK-045). As escolhas vêm de regras/iaDosAliados.js e regras/desmaio.js;
// aqui cada aliado só anda (pelo caminho em volta das pedras, com a mesma separação de todo mundo),
// mira e ataca. A cada quadro, cada aliado de pé escolhe um plano:
//   voltar (o Líder se afastou demais) → ajudar um caído → lutar (cada classe do seu jeito) → seguir a formação.
export function pensarAliados(cena, agora) {
  const lider = cena.lider
  const aliados = cena.aliados
  for (const caido of aliados.filter((aliado) => aliado.caido)) caido.parar()
  const dePe = aliados.filter((aliado) => !aliado.caido)
  const inimigos = inimigosPerto(cena.inimigos, lider, ia.raioDeCombate)
  const ajudas = cena.tarefasDeAjuda(dePe)

  const planos = new Map()
  for (const aliado of dePe) {
    aliado.ia.voltando = !lider.caido && deveVoltar(aliado.ia.voltando, distancia(aliado, lider), ia)
    let plano
    if (aliado.ia.voltando) plano = { tipo: 'seguir', rapido: true }
    else if (ajudas.has(aliado)) plano = planoDeAjuda(cena, aliado, ajudas.get(aliado))
    else plano = planoDeCombate(cena, aliado, inimigos)
    planos.set(aliado, plano)
  }

  // Quem luta de perto contra o mesmo mob pega uma vaga diferente em volta dele (ninguém se empilha)
  const pertoDoMob = new Map()
  for (const [aliado, plano] of planos) {
    if (plano.tipo !== 'corpoACorpo') continue
    if (!pertoDoMob.has(plano.alvo)) pertoDoMob.set(plano.alvo, [])
    pertoDoMob.get(plano.alvo).push(aliado)
  }
  for (const [alvo, lutando] of pertoDoMob) {
    lutando.forEach((aliado, indice) => {
      planos.get(aliado).vaga = vagaEmVoltaDoAlvo(alvo, indice, lutando.length, ataques.guerreiro.alcance * 0.75 + alvo.tamanho / 2, lider)
    })
  }

  // Só quem tinha plano no começo do quadro (quem a Ressurreição levanta agora começa no quadro seguinte)
  aliados.forEach((aliado, indice) => {
    const plano = planos.get(aliado)
    if (plano && !aliado.caido) executar(cena, aliado, plano, { agora, indice, total: aliados.length })
  })
}

// Um caído para levantar: o Sacerdote com a Ressurreição pronta vai e usa (não precisa de área limpa).
// Os outros precisam da área limpa: se há inimigo perto do caído, lutam com ele primeiro.
function planoDeAjuda(cena, aliado, caido) {
  if (aliado.classe === 'sacerdote' && cena.habilidadeDisponivel(aliado, 0)) return { tipo: 'ressuscitar', caido }
  if (aliado.classe !== 'sacerdote' && !areaLimpa(caido, cena.inimigos, desmaio.raioDaAreaLimpa)) {
    const pertoDoCaido = inimigosPerto(cena.inimigos, caido, desmaio.raioDaAreaLimpa)
    if (pertoDoCaido.length > 0) return planoDeCombate(cena, aliado, pertoDoCaido)
  }
  return { tipo: 'ajudar', caido }
}

function planoDeCombate(cena, aliado, inimigos) {
  if (aliado.classe === 'sacerdote') {
    const ferido = quemCurar(cena.grupo, ia.limiteParaCurar)
    return ferido ? { tipo: 'curar', alvo: ferido } : { tipo: 'seguir' }
  }
  if (inimigos.length === 0) return { tipo: 'seguir' }
  if (aliado.classe === 'guerreiro') return { tipo: 'corpoACorpo', alvo: maisProximo(aliado, inimigos), inimigos }
  // Tanque: segura o mob que está mais perto do Líder, ficando entre ele e o grupo
  if (aliado.classe === 'tanque') return { tipo: 'tanque', alvo: maisProximo(cena.lider, inimigos), inimigos }
  if (aliado.classe === 'arqueiro') {
    return { tipo: 'longe', alvo: maisProximo(aliado, inimigos), faixa: ia.distanciaDoArqueiro, alcance: ataques.arqueiro.alcance }
  }
  // Mago: mira no meio do grupinho com mais mobs
  const ponto = pontoDeMaisInimigos(aliado, inimigos, ataques.mago.raioDaExplosao)
  return { tipo: 'longe', alvo: ponto, faixa: ia.distanciaDoMago, alcance: ataques.mago.alcance, quantos: ponto.quantos }
}

function executar(cena, aliado, plano, { agora, indice, total }) {
  const lider = cena.lider
  switch (plano.tipo) {
    case 'seguir': {
      const vaga = vagaNaFormacao(indice, total, raioDaFormacao)
      irPara(cena, aliado, { x: lider.x + vaga.x, y: lider.y + vaga.y }, agora, 60, plano.rapido ? 1.3 : 1)
      mirarNaDirecao(aliado)
      break
    }
    case 'ajudar': {
      // Fica parado logo ao lado do caído (fora da zona dele) e a ajuda conta sozinha
      if (distancia(aliado, plano.caido) <= desmaio.raioDaAjuda - 6) aliado.parar()
      else irPara(cena, aliado, plano.caido, agora, 1)
      aliado.anguloDaMira = anguloEntre(aliado, plano.caido)
      break
    }
    case 'ressuscitar': {
      const raio = habilidades.sacerdote.raio * 0.8
      if (distancia(aliado, plano.caido) <= raio) {
        aliado.parar()
        cena.usarHabilidade(aliado, 0, mirandoEm(aliado, plano.caido))
      } else irPara(cena, aliado, plano.caido, agora, 1)
      break
    }
    case 'curar': {
      const raio = ataques.sacerdote.raio
      const ate = distancia(aliado, plano.alvo)
      if (ate <= raio * 0.6) aliado.parar()
      else irPara(cena, aliado, plano.alvo, agora, 1)
      if (ate <= raio * 0.8) cena.usarAtaque(aliado, anguloEntre(aliado, plano.alvo))
      break
    }
    case 'corpoACorpo': {
      const { alvo } = plano
      irPara(cena, aliado, plano.vaga ?? alvo, agora, 20)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= ataques.guerreiro.alcance + alvo.tamanho / 2) cena.usarAtaque(aliado, aliado.anguloDaMira)
      // Giro: vale a pena com 2 ou mais mobs em volta
      const emVolta = plano.inimigos.filter((inimigo) => distancia(aliado, inimigo) <= habilidades.guerreiro.raio)
      if (emVolta.length >= 2) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
      break
    }
    case 'tanque': {
      const { alvo } = plano
      const colado = ataques.tanque.alcanceDoEmpurrao * 0.5 + (aliado.tamanho + alvo.tamanho) / 2
      irPara(cena, aliado, posicaoDoTanque(alvo, lider, colado), agora, 20)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= ataques.tanque.alcanceDoEmpurrao + alvo.tamanho / 2) cena.usarAtaque(aliado, aliado.anguloDaMira)
      // Provocação: quando algum mob perto está atrás de outra pessoa do grupo
      const fugiuDoTanque = plano.inimigos.some(
        (inimigo) => inimigo.alvo && inimigo.alvo !== aliado && distancia(aliado, inimigo) <= habilidades.tanque.raio,
      )
      if (fugiuDoTanque) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
      break
    }
    case 'longe': {
      // Arqueiro e Mago: ficam na faixa de distância, sem encostar no mob, e atiram
      const { alvo } = plano
      const maisPerto = maisProximo(aliado, cena.inimigos.filter((inimigo) => !inimigo.morto)) ?? alvo
      irPara(cena, aliado, posicaoADistancia(aliado, maisPerto, plano.faixa), agora, 30)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= plano.alcance) cena.usarAtaque(aliado, aliado.anguloDaMira)
      const vale = aliado.classe === 'arqueiro' || plano.quantos >= 2
      if (vale && distancia(aliado, alvo) <= (aliado.classe === 'mago' ? habilidades.mago.alcance : plano.alcance)) {
        cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
      }
      break
    }
  }
}

// Anda até o ponto pelo caminho em volta das pedras; freia ao chegar (raioDeChegada)
function irPara(cena, aliado, ponto, agora, raioDeChegada, fator = 1) {
  const destino = cena.navegador.proximoPonto(aliado, ponto, agora)
  aliado.andar(velocidadeParaSeguir(aliado, destino, velocidade * fator, destino === ponto ? raioDeChegada : 1))
}

// Sem alvo, olha para onde anda (o escudo do Tanque aliado vai junto)
function mirarNaDirecao(aliado) {
  if (Math.hypot(aliado.querida.x, aliado.querida.y) > 20) aliado.anguloDaMira = Math.atan2(aliado.querida.y, aliado.querida.x)
}

function mirandoEm(aliado, ponto) {
  return { angulo: anguloEntre(aliado, ponto), ponto: { x: ponto.x, y: ponto.y } }
}
