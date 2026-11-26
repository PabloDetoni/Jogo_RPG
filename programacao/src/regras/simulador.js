import { atributoMaximo, combateDeTeste, critico, mundo } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { floresta } from '../dados/mundo/floresta.js'
import { simulador as configDoSimulador } from '../dados/simulador.js'
import { msDeRecargaDoArco, msParaCargaCheia, flechaDaCarga } from './arco.js'
import { pontosDeAtributoAteONivel } from './atributos.js'
import { golpeNoEscudo, imuneContra, registrarImunidade } from './combate.js'
import { membroComAtributos } from './grupoDaPartida.js'
import { fichaDoMob } from './mobs.js'

// SIMULADOR DE BALANCEAMENTO (RF62, Parte 3 de 11/2026). Função pura, sem Phaser: um grupo de nível N contra os mobs
// de uma região (ou o Boss), em passos de tempo fixos, sempre com o mesmo resultado para os mesmos dados.
// É um MODELO SIMPLIFICADO: não há física, caminho, pedras nem a IA de verdade. Todos ficam ao alcance de todos; o
// dano é o do clique de cada classe, sem as habilidades; o crítico entra pela média. Serve para comparar níveis,
// regiões e mudanças de número, não para dizer o tempo exato de uma partida. Os números do modelo (como os pontos são
// distribuídos, o quanto o escudo segura, o tempo de andar entre os grupos) estão em dados/simulador.js.

const { ataques, personagem } = combateDeTeste

// Os atributos de um personagem de nível N: os iniciais da classe mais os pontos ganhos, distribuídos pela receita
// da classe (dados/simulador.js), sem passar de 100
export function atributosNoNivel(classe, nivel, distribuicao = configDoSimulador.distribuicao) {
  const atributos = { ...atributosIniciaisDaClasse(classe) }
  const pontos = pontosDeAtributoAteONivel(nivel)
  const pesos = Object.entries(distribuicao[classe] ?? {})
  const somaDosPesos = pesos.reduce((soma, [, peso]) => soma + peso, 0) || 1
  let sobra = pontos
  for (const [atributo, peso] of pesos) {
    const parte = Math.floor((pontos * peso) / somaDosPesos)
    const antes = atributos[atributo]
    atributos[atributo] = Math.min(atributoMaximo, antes + parte)
    sobra -= atributos[atributo] - antes
  }
  // o que sobrou (arredondamento ou atributo no máximo) vai para a Vitalidade, depois para qualquer um abaixo de 100
  for (const atributo of ['vitalidade', 'forca', 'agilidade', 'sabedoria', 'inteligencia']) {
    const cabe = Math.min(sobra, atributoMaximo - atributos[atributo])
    atributos[atributo] += cabe
    sobra -= cabe
  }
  return atributos
}

// O ataque de clique de cada classe, por segundo, contra um alvo (e quantos alvos ele pega de uma vez)
export function ataqueDaClasse(membro) {
  const mediaDoCritico = 1 + (membro.chanceDeCritico ?? 0) * (critico.multiplicador - 1)
  const fator = membro.fatorDeDano ?? 1
  const { alvosPorGolpe } = configDoSimulador
  switch (membro.classe) {
    case 'guerreiro':
      return { dano: ataques.guerreiro.dano * fator * mediaDoCritico, ms: ataques.guerreiro.recargaMs, alvos: alvosPorGolpe.guerreiro }
    case 'mago':
      return { dano: ataques.mago.dano * fator * mediaDoCritico, ms: ataques.mago.recargaMs, alvos: alvosPorGolpe.mago }
    case 'tanque':
      return { dano: ataques.tanque.dano * fator * mediaDoCritico, ms: ataques.tanque.recargaMs, alvos: alvosPorGolpe.tanque }
    case 'arqueiro': {
      // carga cheia sempre (o que rende mais dano por segundo; regras/arco.js)
      const flecha = flechaDaCarga(1, membro.forca)
      return { dano: flecha.dano * mediaDoCritico, ms: msParaCargaCheia(membro.agilidade) + msDeRecargaDoArco(membro.agilidade), alvos: 1 }
    }
    case 'sacerdote': {
      const aura = ataques.sacerdote
      return { dano: (aura.danoPorPulso ?? 0) * fator, ms: aura.msEntrePulsos, alvos: Infinity, cura: aura.curaPorPulso * (membro.fatorDeCura ?? 1) * (membro.multiplicadorDeCura ?? 1) }
    }
    default:
      return { dano: 0, ms: 1000, alvos: 0 }
  }
}

// Um mob para a luta do simulador, pela ficha na dificuldade (com a cura do xamã e a prioridade de alvo)
export function mobDaLuta(tipo, dificuldade) {
  const ficha = fichaDoMob(tipo, dificuldade)
  const recargaMs = ficha.comportamento === 'corpoACorpo' ? ficha.recargaMs : ficha.msEntreTiros
  return {
    tipo,
    vida: ficha.vida,
    dano: ficha.dano,
    recargaMs,
    xp: ficha.xp,
    ouro: ficha.ouro,
    velocidade: ficha.velocidade,
    area: false,
    cura: ficha.cura ? { quanto: ficha.cura.quanto, ms: ficha.cura.msEntreCuras } : null,
    prioridade: Boolean(ficha.prioridade),
  }
}

// Os mobs de uma região, pela população da Floresta (sem os animais pacíficos, que não atacam), com tudo o que a
// região muda. "boss" é o chefe (o Ogro, Parte 6d), a cada msEntreAtaques: dos três golpes, só a pancada é em área
// (pega todo mundo); a investida e o arremesso pegam um só. No modelo, cada golpe vale um terço de cada um.
export function mobsDaRegiao(regiao) {
  if (regiao === 'boss') {
    const chefe = mundo.ogro
    const noAlvo = (chefe.investida.dano + chefe.arremesso.dano) / 3
    const emArea = chefe.pisao.dano / 3
    return [{ tipo: 'ogro', vida: chefe.vida, dano: noAlvo, danoEmArea: emArea, recargaMs: chefe.msEntreAtaques, xp: chefe.xp, ouro: chefe.ouro, velocidade: chefe.velocidade, area: false }]
  }
  const chaveDaPopulacao = regiao === 'dominioDoBoss' ? 'dominioDoBoss' : regiao
  const populacao = floresta.populacao[chaveDaPopulacao] ?? {}
  const dificuldade = regiao === 'dominioDoBoss' ? 'boss' : regiao
  const tipos = []
  for (const [tipo, quantos] of Object.entries(populacao)) {
    const base = mundo.mobs[tipo]
    if (!base || base.hostil === false) continue
    for (let i = 0; i < quantos; i++) tipos.push(mobDaLuta(tipo, dificuldade))
  }
  return tipos
}

// Os goblins de um acampamento ou do forte (Parte 6b e 6c), todos juntos (o acampamento acorda junto), com os
// arqueiros das torres do forte
// leva (Parte 11): só uma parte do forte ('portao', 'patio' ou 'torre'), com os arqueiros das torres do lado dela
export function mobsDoAcampamento(id, leva = null) {
  const acampamento = floresta.acampamentos.find((um) => um.id === id)
  if (!acampamento) return []
  const dificuldade = floresta.regioes.find((regiao) => regiao.id === acampamento.regiao)?.dificuldade ?? 'facil'
  if (leva && acampamento.levas) {
    const parte = acampamento.levas.find((uma) => uma.id === leva)
    const daParte = Object.entries(parte?.populacao ?? {}).flatMap(([tipo, quantos]) => Array.from({ length: quantos }, () => mobDaLuta(tipo, dificuldade)))
    // as torres ficam nos cantos: duas do lado oeste (Portão) e duas do leste (Torre)
    const torres = leva === 'patio' ? 0 : 2
    return [...daParte, ...Array.from({ length: acampamento.arqueirosNasTorres ? torres : 0 }, () => mobDaLuta('goblinArqueiro', dificuldade))]
  }
  const mobs = []
  for (const [tipo, quantos] of Object.entries(acampamento.populacao)) for (let i = 0; i < quantos; i++) mobs.push(mobDaLuta(tipo, dificuldade))
  if (acampamento.arqueirosNasTorres) for (let i = 0; i < 4; i++) mobs.push(mobDaLuta('goblinArqueiro', dificuldade))
  return mobs
}

// Uma luta: o grupo contra "mobs" (fichas de mobsDaRegiao), todos ao mesmo tempo. Devolve o que aconteceu.
// Os mobs miram o Tanque de pé (ele provoca); sem ele, o primeiro do grupo de pé (o Líder). O grupo bate no mob com
// menos vida. A imunidade depois de apanhar vale só contra o mesmo atacante.
// Parte 8: o xamã cura o mob mais ferido (pela fração da vida) a cada cura.ms; com "prioridade", o grupo bate primeiro
// no mob marcado (o xamã), como a IA média e avançada dos aliados.
export function simularLuta(grupo, mobs, { passoMs = configDoSimulador.passoMs, msMaximo = configDoSimulador.msMaximoDaLuta, prioridade = false } = {}) {
  const membros = grupo.map((membro, i) => ({
    id: i,
    classe: membro.classe,
    membro,
    vida: membro.vidaMaxima,
    vidaMaxima: membro.vidaMaxima,
    ataque: ataqueDaClasse(membro),
    proximoAtaque: configDoSimulador.msAteOPrimeiroAtaqueDoGrupo,
    caiuEm: null,
    danoDado: 0,
    danoRecebido: 0,
    imunidades: null,
  }))
  const inimigos = mobs.map((mob, i) => ({ id: `mob${i}`, ...mob, vidaAtual: mob.vida, proximoGolpe: configDoSimulador.msAteOPrimeiroGolpe + i * 150, proximaCura: mob.cura?.ms ?? Infinity, morreuEm: null }))
  let agora = 0
  const dePe = () => membros.filter((m) => m.caiuEm === null)
  const vivos = () => inimigos.filter((m) => m.morreuEm === null)
  while (agora < msMaximo && dePe().length > 0 && vivos().length > 0) {
    // O grupo ataca
    for (const m of dePe()) {
      if (agora < m.proximoAtaque) continue
      m.proximoAtaque = agora + m.ataque.ms
      if (m.ataque.cura) {
        for (const outro of dePe()) {
          const antes = outro.vida
          outro.vida = Math.min(outro.vidaMaxima, outro.vida + m.ataque.cura)
          m.cura = (m.cura ?? 0) + (outro.vida - antes)
        }
      }
      if (m.ataque.dano <= 0) continue
      const ordem = vivos().sort((a, b) => (prioridade && a.prioridade !== b.prioridade ? (a.prioridade ? -1 : 1) : a.vidaAtual - b.vidaAtual))
      const alvos = ordem.slice(0, m.ataque.alvos)
      for (const alvo of alvos) {
        const dano = Math.min(alvo.vidaAtual, m.ataque.dano)
        alvo.vidaAtual -= dano
        m.danoDado += dano
        if (alvo.vidaAtual <= 0) alvo.morreuEm = agora
      }
    }
    // O xamã cura o mob mais ferido (Parte 6b)
    for (const mob of vivos()) {
      if (!mob.cura || agora < mob.proximaCura) continue
      mob.proximaCura = agora + mob.cura.ms
      const ferido = vivos().filter((outro) => outro.vidaAtual < outro.vida).sort((a, b) => a.vidaAtual / a.vida - b.vidaAtual / b.vida)[0]
      if (ferido) ferido.vidaAtual = Math.min(ferido.vida, ferido.vidaAtual + mob.cura.quanto)
    }
    // Os mobs atacam
    for (const mob of vivos()) {
      if (agora < mob.proximoGolpe) continue
      mob.proximoGolpe = agora + mob.recargaMs
      const alvosDoGolpe = mob.area ? dePe() : [dePe().find((m) => m.classe === 'tanque') ?? dePe()[0]]
      for (const alvo of alvosDoGolpe) {
        if (!alvo || imuneContra(alvo.imunidades, mob.id, agora)) continue
        // O escudo do Tanque segura uma parte dos golpes de frente, até o limite pela Força (regras/combate.js)
        if (alvo.classe === 'tanque' && !mob.area) {
          const naFrente = ((agora / passoMs + inimigos.indexOf(mob)) % 100) / 100 < configDoSimulador.fracaoDosGolpesDeFrente
          if (golpeNoEscudo({ escudoAtivo: true, tipo: 'golpe', naFrente, dano: mob.dano, forca: alvo.membro.forca }) === 'bloqueado') continue
        }
        const dano = mob.dano * (1 - Math.min(0.8, (alvo.membro.defesa ?? 0) / 100))
        alvo.vida -= dano
        alvo.danoRecebido += dano
        alvo.imunidades = registrarImunidade(alvo.imunidades, mob.id, agora, personagem.msDeImunidade)
        if (alvo.vida <= 0) alvo.caiuEm = agora
      }
      // a parte em área do golpe do chefe (a pancada): todo mundo de pé leva
      if (mob.danoEmArea) {
        for (const alvo of dePe()) {
          alvo.vida -= mob.danoEmArea
          alvo.danoRecebido += mob.danoEmArea
          if (alvo.vida <= 0) alvo.caiuEm = agora
        }
      }
    }
    agora += passoMs
  }
  const venceu = vivos().length === 0 && dePe().length > 0
  return {
    venceu,
    segundos: agora / 1000,
    membros: membros.map((m) => ({ classe: m.classe, caiuEm: m.caiuEm === null ? null : m.caiuEm / 1000, danoDado: Math.round(m.danoDado), danoRecebido: Math.round(m.danoRecebido), cura: Math.round(m.cura ?? 0), vidaNoFim: Math.max(0, Math.round(m.vida)) })),
    mobsDerrotados: inimigos.filter((m) => m.morreuEm !== null).length,
    xp: inimigos.filter((m) => m.morreuEm !== null).reduce((soma, m) => soma + m.xp, 0),
    ouro: inimigos.filter((m) => m.morreuEm !== null).reduce((soma, m) => soma + m.ouro, 0),
  }
}

// Os mobs de um "bando" de n, na ordem da população da região (um de cada tipo, repetindo)
export function bandoDaRegiao(regiao, n) {
  const todos = mobsDaRegiao(regiao)
  if (regiao === 'boss') return todos
  const porTipo = {}
  for (const mob of todos) (porTipo[mob.tipo] ??= []).push(mob)
  const tipos = Object.keys(porTipo)
  const bando = []
  for (let i = 0; bando.length < n && tipos.length > 0; i++) bando.push(porTipo[tipos[i % tipos.length]][0])
  return bando
}

// O relatório de um grupo numa região: a luta contra o bando padrão, quantos mobs dá para enfrentar ao mesmo tempo
// (o maior bando que o grupo vence sem ninguém cair), o XP e o ouro por minuto (lutas seguidas com esse bando, mais o
// tempo de andar até o próximo) e se fugir resolve (o personagem mais lento é mais rápido que os mobs?).
export function simular({ nivel, regiao, classes }, config = configDoSimulador) {
  const grupo = classes.map((classe) => membroComAtributos(classe, atributosNoNivel(classe, nivel), nivel))
  const lutaPadrao = simularLuta(grupo, bandoDaRegiao(regiao, regiao === 'boss' ? 1 : config.bandoPadrao))
  let maximoSemCair = 0
  let melhorLuta = null
  if (regiao !== 'boss') {
    for (let n = 1; n <= config.bandoMaximo; n++) {
      const luta = simularLuta(grupo, bandoDaRegiao(regiao, n))
      if (!luta.venceu || luta.membros.some((m) => m.caiuEm !== null)) break
      maximoSemCair = n
      melhorLuta = luta
    }
  } else if (lutaPadrao.venceu && lutaPadrao.membros.every((m) => m.caiuEm === null)) {
    maximoSemCair = 1
    melhorLuta = lutaPadrao
  }
  const porMinuto = (valor) => (melhorLuta ? Math.round((valor * 60) / (melhorLuta.segundos + config.segundosAndandoEntreBandos)) : 0)
  const maisLento = Math.min(...grupo.map((m) => m.velocidade))
  const mobs = mobsDaRegiao(regiao)
  const maisRapido = Math.max(...mobs.map((m) => m.velocidade))
  return {
    nivel,
    regiao,
    classes,
    lutaPadrao,
    maximoSemCair,
    xpPorMinuto: porMinuto(melhorLuta?.xp ?? 0),
    ouroPorMinuto: porMinuto(melhorLuta?.ouro ?? 0),
    velocidade: { grupoMaisLento: Math.round(maisLento), mobMaisRapido: maisRapido },
    fugirResolve: maisLento > maisRapido,
  }
}
