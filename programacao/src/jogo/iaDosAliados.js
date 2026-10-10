import { combateDeTeste } from '../dados/balanceamento.js'
import { anguloEntre, vagaNaFormacao, velocidadeParaSeguir } from '../regras/combate.js'
import { areaLimpa } from '../regras/desmaio.js'
import {
  acompanharTremor,
  alvoComLinhaDeTiro,
  deveFicarParado,
  deveVoltar,
  direcaoDeRecuo,
  inimigoMaisForte,
  inimigosPerto,
  maisProximo,
  passagemParaOLider,
  pontoComLinhaDeTiro,
  pontoDeMaisInimigos,
  posicaoADistancia,
  posicaoDoTanque,
  posicaoParaCurar,
  posicoesDeCombate,
  quemCurar,
  temLinhaDeTiro,
  vagaEmVoltaDoAlvo,
} from '../regras/iaDosAliados.js'
import { pontoDeDesvio } from '../regras/movimento.js'
import { atualizarFoco, chanceDeErro, sortear } from '../regras/nivelDaIA.js'

const { ia, personagem, ataques, habilidades, desmaio, raioDaFormacao, mobVermelho } = combateDeTeste
const velocidade = personagem.velocidade * 1.15
const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

// IA dos aliados (TASK-043, TASK-045, 5b.1 e 5d). As escolhas vêm de regras/iaDosAliados.js, regras/nivelDaIA.js,
// regras/desmaio.js e regras/movimento.js; aqui cada aliado só anda (pelo caminho em volta das pedras), mira e ataca.
// O nível da IA vem do nível do personagem (básica, média ou avançada); a cada poucos segundos cada aliado
// sorteia se vai errar "a decisão do momento". A cada quadro, cada aliado de pé escolhe um plano:
//   recuar de um golpe avisado (só a avançada; andando, sem esquiva) → voltar (o Líder se afastou demais)
//   → ajudar um caído → o Sacerdote cura quem não está com a vida cheia → lutar (cada classe do seu jeito, conforme
//   o nível) → ficar em volta do Líder.
// Cada nível decide sozinho, sem ser atrapalhado pelos outros: a média e a avançada desviam de quem está parado no
// caminho, e o Guerreiro avançado não espera um Tanque que errou.
export function pensarAliados(cena, agora) {
  const lider = cena.lider
  const aliados = cena.aliados
  for (const caido of aliados.filter((aliado) => aliado.caido)) {
    caido.parar()
    caido.ia.parado = false
  }
  const dePe = aliados.filter((aliado) => !aliado.caido)
  const inimigos = inimigosPerto(cena.inimigos, lider, ia.raioDeCombate)
  const ajudas = cena.tarefasDeAjuda(dePe)
  const formacao =
    inimigos.length > 0
      ? posicoesDeCombate(lider, inimigos, { ...ia.formacaoDeCombate, distanciaDoArqueiro: ia.distanciaDoArqueiro, distanciaDoMago: ia.distanciaDoMago })
      : null
  cena.focoAte = atualizarFoco({
    focoAte: cena.focoAte,
    agora,
    fracaoDaVidaDoLider: lider.vida / lider.vidaMaxima,
    alguemCaido: cena.grupo.some((membro) => membro.caido),
  })
  const emFoco = cena.focoAte > agora
  const contexto = { cena, agora, lider, inimigos, formacao, emFoco, liderAndando: Math.hypot(lider.querida.x, lider.querida.y) > 20 }

  const planos = new Map()
  for (const aliado of dePe) {
    const perfil = cena.perfilDaIA(aliado)
    aliado.ia.perfilAtual = perfil
    decidir(aliado, perfil, contexto)
    aliado.ia.voltando = !lider.caido && deveVoltar(aliado.ia.voltando, distancia(aliado, lider), ia)
    // Voltar para o Líder vem antes de tudo: recuar de um golpe não pode levar o aliado para longe dele
    const mobAvisando = aliado.ia.voltando ? null : golpeParaRecuar(aliado, perfil, contexto)
    const cura = aliado.classe === 'sacerdote' ? planoDeCura(aliado, perfil, contexto) : null
    let plano
    if (aliado.ia.voltando) plano = { tipo: 'seguir', rapido: true }
    else if (mobAvisando) plano = { tipo: 'recuar', mob: mobAvisando }
    else if (ajudas.has(aliado)) plano = planoDeAjuda(aliado, ajudas.get(aliado), perfil, contexto)
    else if (cura) plano = cura
    else if (inimigos.length > 0) plano = planoDeCombate(aliado, perfil, inimigos, contexto)
    else plano = { tipo: 'seguir' }
    plano.perfil = perfil
    if (plano.tipo !== aliado.ia.ultimoPlano) {
      aliado.ia.ultimoPlano = plano.tipo
      aliado.ia.noPosto = false
      if (plano.tipo !== 'seguir') aliado.ia.parado = false
    }
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
    if (plano && !aliado.caido) executar(aliado, plano, { ...contexto, indice, total: aliados.length })
  })

  // Tremor: quem vai e volta sem sair do lugar fica quieto um pouco (parado em volta do Líder: até ele sair)
  for (const aliado of dePe) {
    const { registro, tremendo } = acompanharTremor(aliado.ia.tremor, { agora, posicao: { x: aliado.x, y: aliado.y } }, ia.tremor)
    aliado.ia.tremor = registro
    if (tremendo) {
      aliado.ia.quietoAte = agora + ia.tremor.msQuieto
      if (planos.get(aliado)?.tipo === 'seguir') aliado.ia.parado = true
    }
  }
}

// A cada poucos segundos (um pouco diferente para cada um), sorteia os erros do momento.
// Em foco (só a avançada tem), conta as decisões e os erros (a barra de teste mostra, no "Testar foco").
function decidir(aliado, perfil, { cena, agora, emFoco }) {
  if (agora < (aliado.ia.proximaDecisao ?? 0)) return
  aliado.ia.proximaDecisao = agora + ia.msEntreDecisoes * (0.8 + Math.random() * 0.4)
  aliado.ia.errou = sortear(chanceDeErro(perfil.nivel, { emFoco }))
  if (emFoco && perfil.id === 'avancada') {
    cena.contagemDoFoco.decisoes++
    if (aliado.ia.errou) cena.contagemDoFoco.erros++
  }
  // O Tanque da IA média ainda erra como na básica
  aliado.ia.tanqueErra = perfil.id === 'media' ? sortear(chanceDeErro(perfil.nivel, { comoBasica: true })) : aliado.ia.errou
  aliado.ia.sacerdoteAtras = perfil.id === 'media' && sortear(ia.chanceDoSacerdoteAtras)
}

// Avançada: um mob avisando o golpe nele (ou bem perto) → às vezes recua andando (os aliados não esquivam).
// O sorteio é um só por aviso. O Tanque não recua: o escudo dele aguenta.
function golpeParaRecuar(aliado, perfil, { cena, emFoco }) {
  if (perfil.id !== 'avancada' || aliado.classe === 'tanque') return null
  const mob = cena.inimigos.find(
    (inimigo) =>
      !inimigo.morto &&
      inimigo.estado === 'avisando' &&
      (inimigo.alvo === aliado || distancia(inimigo, aliado) <= mobVermelho.alcanceDoBote + mobVermelho.distanciaDoBote / 2),
  )
  if (!mob) return null
  aliado.ia.recuos ??= new Map()
  let decisao = aliado.ia.recuos.get(mob)
  if (!decisao || decisao.fim !== mob.fimDoAviso) {
    decisao = { fim: mob.fimDoAviso, recua: sortear(emFoco ? ia.foco.chanceDeRecuar : ia.chanceDeRecuarDoAviso) }
    aliado.ia.recuos.set(mob, decisao)
  }
  return decisao.recua ? mob : null
}

// Um caído para levantar: o Sacerdote com a Ressurreição pronta vai e usa (não precisa de área limpa).
// Os outros precisam da área limpa: se há inimigo perto do caído, lutam com ele primeiro.
function planoDeAjuda(aliado, caido, perfil, contexto) {
  const { cena } = contexto
  if (aliado.classe === 'sacerdote' && cena.habilidadeDisponivel(aliado, 0)) return { tipo: 'ressuscitar', caido }
  if (aliado.classe !== 'sacerdote' && !areaLimpa(caido, cena.inimigos, desmaio.raioDaAreaLimpa)) {
    const pertoDoCaido = inimigosPerto(cena.inimigos, caido, desmaio.raioDaAreaLimpa)
    if (pertoDoCaido.length > 0) return planoDeCombate(aliado, perfil, pertoDoCaido, contexto)
  }
  return { tipo: 'ajudar', caido }
}

// Sacerdote (regra do Pablo de 08/10): está SEMPRE curando quando alguém do grupo (ele mesmo também) não está com
// a vida cheia, em combate ou fora dele e em qualquer nível. Levantar os caídos vem antes (planoDeAjuda).
// O nível muda só a escolha do alvo (regras/iaDosAliados.js, quemCurar) e a posição: a avançada cura do lado de
// trás do ferido, longe do mob; a média e a básica vão direto até ele. null = ninguém precisa de cura.
function planoDeCura(aliado, perfil, { cena }) {
  const estilo = perfil.id === 'avancada' && !aliado.ia.errou ? 'avancada' : perfil.id === 'basica' ? 'basica' : 'media'
  const atacantes = (membro) => cena.inimigos.filter((inimigo) => !inimigo.morto && inimigo.alvo === membro).length
  const alvo = quemCurar(cena.grupo, { de: aliado, estilo, errou: aliado.ia.errou, atacantes, ...ia.sacerdote })
  return alvo ? { tipo: 'curar', alvo, protegido: estilo === 'avancada' } : null
}

// Cada classe luta do seu jeito, conforme o nível da IA e o erro sorteado do momento
function planoDeCombate(aliado, perfil, inimigos, { cena, lider, formacao }) {
  const { errou } = aliado.ia
  const avancada = perfil.id === 'avancada' && !errou // a avançada, quando erra, luta como a média

  // Sacerdote sem ninguém para curar: o nível decide só onde ele fica
  if (aliado.classe === 'sacerdote') {
    if (perfil.id === 'basica') return { tipo: 'sacerdoteParado' } // fica onde está
    if (avancada && formacao) return { tipo: 'posto', ponto: formacao.sacerdote }
    if (aliado.ia.sacerdoteAtras && formacao) {
      return { tipo: 'posto', ponto: { x: lider.x - formacao.frente.x * 80, y: lider.y - formacao.frente.y * 80 } }
    }
    return { tipo: 'seguir' }
  }

  if (aliado.classe === 'tanque') {
    if (avancada && formacao) return { tipo: 'tanqueNaFrente', ponto: formacao.tanque, alvo: maisProximo(lider, inimigos), inimigos }
    // Básica e média: às vezes não avança (fica com o grupo, e o dano cai em outro)
    if (aliado.ia.tanqueErra) return { tipo: 'seguir' }
    return { tipo: 'tanque', alvo: maisProximo(lider, inimigos), inimigos }
  }

  if (aliado.classe === 'guerreiro') {
    if (avancada && formacao) {
      // Veterano: com o Tanque na frente, fica ao lado dele; se o Tanque não está lá (errou, caiu ou não há), não
      // espera: vai proteger o Líder, no mob mais perto dele
      const tanque = cena.grupo.find((membro) => membro.classe === 'tanque' && !membro.caido && membro !== aliado)
      const tanqueNaFrente = tanque && distancia(tanque, formacao.tanque) <= ia.formacaoDeCombate.tanqueNoPosto
      if (tanqueNaFrente) return { tipo: 'guerreiroComTanque', ponto: formacao.guerreiro, inimigos }
      return { tipo: 'corpoACorpo', alvo: maisProximo(lider, inimigos), inimigos }
    }
    if (errou && perfil.id !== 'avancada') return { tipo: 'seguir' } // hesita
    return { tipo: 'corpoACorpo', alvo: maisProximo(aliado, inimigos), inimigos }
  }

  // Arqueiro e Mago
  const arqueiro = aliado.classe === 'arqueiro'
  const faixaNormal = arqueiro ? ia.distanciaDoArqueiro : ia.distanciaDoMago
  const faixaCurta = arqueiro ? ia.distanciaCurtaDoArqueiro : ia.distanciaCurtaDoMago
  const alcance = arqueiro ? ataques.arqueiro.alcance : ataques.mago.alcance
  const alvoDoMago = () => pontoDeMaisInimigos(aliado, inimigos, ataques.mago.raioDaExplosao)
  const base = { tipo: 'longe', alcance, inimigos }
  if (perfil.id === 'basica') {
    // Vai para o meio da luta; errando, o Arqueiro chega a encostar no mob e os dois atiram mesmo com pedra no meio
    const faixa = errou && arqueiro ? { minima: 50, maxima: 90 } : faixaCurta
    return { ...base, alvo: arqueiro ? maisProximo(aliado, inimigos) : alvoDoMago(), faixa, respeitaLinha: !errou }
  }
  if (avancada && formacao) {
    const alvo = arqueiro ? inimigoMaisForte(aliado, inimigos) : alvoDoMago()
    return { ...base, alvo, faixa: faixaNormal, posto: arqueiro ? formacao.arqueiro : formacao.mago, respeitaLinha: true }
  }
  // Média (ou avançada errando): mantém a distância e procura linha de tiro; errando, chega perto demais
  return { ...base, alvo: arqueiro ? maisProximo(aliado, inimigos) : alvoDoMago(), faixa: errou ? faixaCurta : faixaNormal, respeitaLinha: true }
}

function executar(aliado, plano, contexto) {
  const { cena, lider, indice, total } = contexto
  switch (plano.tipo) {
    case 'recuar': {
      const direcao = direcaoDeRecuo(aliado, plano.mob)
      aliado.andar({ x: direcao.x * velocidade, y: direcao.y * velocidade })
      break
    }
    case 'seguir':
      ficarEmVoltaDoLider(aliado, plano, contexto)
      break
    case 'ajudar': {
      // Fica parado logo ao lado do caído e a ajuda conta sozinha
      if (distancia(aliado, plano.caido) <= desmaio.raioDaAjuda - 6) aliado.parar()
      else irPara(aliado, plano.caido, contexto, 1)
      aliado.anguloDaMira = anguloEntre(aliado, plano.caido)
      break
    }
    case 'ressuscitar': {
      if (distancia(aliado, plano.caido) <= habilidades.sacerdote.raio * 0.8) {
        aliado.parar()
        cena.usarHabilidade(aliado, 0, mirandoEm(aliado, plano.caido))
      } else irPara(aliado, plano.caido, contexto, 1)
      break
    }
    case 'curar': {
      // A aura cura todo mundo dentro dela e anda com ele. A avançada fica atrás do ferido (protegida); a média e a
      // básica vão direto até ele. Com o ferido dentro da aura, solta a aura (quando a recarga deixa).
      const raio = ataques.sacerdote.raio
      const ate = distancia(aliado, plano.alvo)
      if (plano.protegido) {
        const ponto = posicaoParaCurar(aliado, plano.alvo, contexto.inimigos, raio * ia.sacerdote.distanciaParaCurar)
        irComFolga(aliado, cena.lugarLivre(aliado.tamanho, ponto, aliado, 0, false), contexto, 20, 45)
      } else if (ate <= raio * 0.6) aliado.parar()
      else irPara(aliado, plano.alvo, contexto, 1)
      if (ate <= raio * 0.8) cena.usarAtaque(aliado, anguloEntre(aliado, plano.alvo))
      break
    }
    case 'sacerdoteParado':
      aliado.parar()
      break
    case 'posto':
      // Sacerdote no fundo, sem ninguém para curar (com alguém ferido, o plano é "curar")
      irComFolga(aliado, plano.ponto, contexto)
      break
    case 'tanqueNaFrente': {
      const { alvo } = plano
      irComFolga(aliado, plano.ponto, contexto, 20, 45)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= ataques.tanque.alcanceDoEmpurrao + alvo.tamanho / 2) cena.usarAtaque(aliado, aliado.anguloDaMira)
      // Provoca sem esperar: os mobs no raio vão nele
      const perto = plano.inimigos.some((inimigo) => distancia(aliado, inimigo) <= habilidades.tanque.raio)
      if (perto && !aliado.provocando) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
      break
    }
    case 'guerreiroComTanque': {
      irComFolga(aliado, plano.ponto, contexto, 25, 55)
      const alvo = maisProximo(aliado, plano.inimigos)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= ataques.guerreiro.alcance + alvo.tamanho / 2) cena.usarAtaque(aliado, aliado.anguloDaMira)
      usarGiroSeValer(aliado, plano.inimigos, alvo, cena)
      break
    }
    case 'corpoACorpo': {
      const { alvo } = plano
      irPara(aliado, plano.vaga ?? alvo, contexto, 20)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= ataques.guerreiro.alcance + alvo.tamanho / 2) cena.usarAtaque(aliado, aliado.anguloDaMira)
      usarGiroSeValer(aliado, plano.inimigos, alvo, cena)
      break
    }
    case 'tanque': {
      const { alvo } = plano
      const colado = ataques.tanque.alcanceDoEmpurrao * 0.5 + (aliado.tamanho + alvo.tamanho) / 2
      irComFolga(aliado, posicaoDoTanque(alvo, lider, colado), contexto, 20, 45)
      aliado.anguloDaMira = anguloEntre(aliado, alvo)
      if (distancia(aliado, alvo) <= ataques.tanque.alcanceDoEmpurrao + alvo.tamanho / 2) cena.usarAtaque(aliado, aliado.anguloDaMira)
      // Provocação: quando algum mob perto está atrás de outra pessoa do grupo
      const fugiuDoTanque = plano.inimigos.some(
        (inimigo) => inimigo.alvo && inimigo.alvo !== aliado && distancia(aliado, inimigo) <= habilidades.tanque.raio,
      )
      if (fugiuDoTanque) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
      break
    }
    case 'longe':
      atirarDeLonge(aliado, plano, contexto)
      break
  }
  aliado.ia.indice = indice
  aliado.ia.total = total
}

// Arqueiro e Mago: ficam na faixa de distância, sem encostar no mob. Antes de atirar, conferem se há pedra
// no caminho; se houver, trocam de alvo ou vão para um lugar de onde dá para acertar (a básica, errando,
// atira assim mesmo).
function atirarDeLonge(aliado, plano, contexto) {
  const { cena } = contexto
  const arqueiro = aliado.classe === 'arqueiro'
  const folga = ia.folgaDaLinhaDeTiro[aliado.classe]
  let { alvo } = plano
  // Os obstáculos que importam: os que ficam entre o aliado e o alvo (ou em volta dele, para os outros alvos)
  let livre = temLinhaDeTiro(aliado, alvo, cena.pedrasEntre(aliado, alvo, folga), folga)
  if (!livre && plano.respeitaLinha) {
    const outro = alvoComLinhaDeTiro(aliado, plano.inimigos, cena.pedrasPerto(aliado, plano.alcance + folga), folga)
    if (outro && distancia(aliado, outro) <= plano.alcance) {
      alvo = outro
      livre = true
    }
  }

  const maisPerto = maisProximo(aliado, cena.inimigos.filter((inimigo) => !inimigo.morto)) ?? alvo
  const meio = (plano.faixa.minima + plano.faixa.maxima) / 2
  if (!livre && plano.respeitaLinha) {
    const ponto = pontoComLinhaDeTiro(aliado, alvo, {
      pedras: cena.pedrasPerto(aliado, plano.faixa.maxima + 300),
      area: cena.area,
      distanciaDoAlvo: meio,
      folga,
      raioDoCorpo: aliado.raio,
      pontos: ia.pontosParaLinhaDeTiro,
    })
    irComFolga(aliado, ponto ?? posicaoADistancia(aliado, maisPerto, plano.faixa), contexto, 25, 50)
  } else if (plano.posto && distancia(aliado, maisPerto) >= plano.faixa.minima) {
    irComFolga(aliado, plano.posto, contexto, 30, 70)
  } else {
    irComFolga(aliado, posicaoADistancia(aliado, maisPerto, plano.faixa), contexto, 25, 50)
  }

  aliado.anguloDaMira = anguloEntre(aliado, alvo)
  const podeAtirar = livre || !plano.respeitaLinha
  if (podeAtirar && distancia(aliado, alvo) <= plano.alcance) cena.usarAtaque(aliado, aliado.anguloDaMira)
  // Habilidades: o Tiro perfurante também para em pedra; o Meteoro cai do céu
  if (arqueiro && podeAtirar) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
  if (!arqueiro && alvo.quantos >= 2 && distancia(aliado, alvo) <= habilidades.mago.alcance) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
}

// Sem luta: fica em volta do Líder. A vaga do X é só referência: com o Líder parado, o aliado para assim que
// entra na zona confortável (na média e na avançada, perto da vaga) e não corrige mais nada até o Líder
// se afastar. Parado no caminho do Líder, dá um passo para o lado.
function ficarEmVoltaDoLider(aliado, plano, contexto) {
  const { cena, lider, agora, indice, total, liderAndando } = contexto
  const vaga = vagaNaFormacao(indice, total, raioDaFormacao)
  // Vaga fora do mapa ou dentro de pedra (Líder no canto, encostado na pedra): vale o lugar livre mais perto dela.
  // Se esse lugar fica atrás de uma pedra (o outro lado do L, por exemplo), a vaga não vale: o aliado para em
  // qualquer ponto da zona, como na IA básica (dar a volta na pedra para "arrumar" a formação seria pior).
  const pontoDaVaga = cena.lugarLivre(aliado.tamanho, { x: lider.x + vaga.x, y: lider.y + vaga.y }, aliado, 0, false)
  const vagaAVista = temLinhaDeTiro(lider, pontoDaVaga, cena.pedrasEntre(lider, pontoDaVaga, aliado.raio), aliado.raio)
  const { zonaConfortavel } = ia
  const tolerancia = plano.perfil.id === 'basica' || !vagaAVista ? null : zonaConfortavel.toleranciaDaVaga
  aliado.ia.parado =
    !plano.rapido &&
    deveFicarParado(
      {
        parado: aliado.ia.parado,
        distanciaAoLider: distancia(aliado, lider),
        distanciaAVaga: distancia(aliado, pontoDaVaga),
        liderAndando,
        travado: (aliado.travamento?.nivel ?? 0) >= 1,
      },
      { ...zonaConfortavel, tolerancia },
    )
  // O Líder andando contra ele: sai do lugar, mesmo parado ou quieto (o jogador nunca fica preso atrás de
  // um aliado); dá um passo para o lado e volta a seguir a vaga
  const passo = passagemParaOLider(aliado, lider, lider.querida, (aliado.tamanho + lider.tamanho) / 2 + 16)
  // Voltando para o Líder (ou saindo da frente dele), o "quieto" do tremor não vale
  if (passo || plano.rapido) {
    aliado.ia.parado = aliado.ia.parado && !passo
    aliado.ia.quietoAte = 0
  }
  if (aliado.ia.parado || agora < (aliado.ia.quietoAte ?? 0)) {
    aliado.parar()
    mirarNaDirecao(aliado)
    return
  }
  // Perto do Líder não desvia de ninguém: qualquer ponto da zona serve, e contornar os outros para chegar à vaga
  // exata (num canto, por exemplo) deixaria o aliado rodando sem parar. Longe dele (voltando), desvia.
  const longeDoLider = distancia(aliado, lider) > zonaConfortavel.maxima + zonaConfortavel.folga
  irPara(aliado, pontoDaVaga, contexto, 60, plano.rapido ? 1.3 : 1, plano.rapido || longeDoLider)
  if (passo) aliado.andar({ x: aliado.querida.x + passo.x * velocidade * 0.8, y: aliado.querida.y + passo.y * velocidade * 0.8 })
  mirarNaDirecao(aliado)
}

function usarGiroSeValer(aliado, inimigos, alvo, cena) {
  const emVolta = inimigos.filter((inimigo) => distancia(aliado, inimigo) <= habilidades.guerreiro.raio)
  if (emVolta.length >= 2) cena.usarHabilidade(aliado, 0, mirandoEm(aliado, alvo))
}

// Anda até o ponto pelo caminho em volta das pedras; freia ao chegar (raioDeChegada).
// Quieto (depois de tremer), não anda. Na média e na avançada, desvia de quem está parado no caminho (desviar = false:
// segue reto e escorrega, como na básica).
function irPara(aliado, ponto, { cena, agora }, raioDeChegada, fator = 1, desviar = true) {
  if (agora < (aliado.ia.quietoAte ?? 0)) {
    aliado.parar()
    return
  }
  const destino = cena.navegador.proximoPonto(aliado, ponto, agora)
  const desvio = desviar ? desvioDeQuemEstaParado(aliado, destino, cena) : null
  if (!desviar) aliado.ia.desvio = null
  if (desvio) {
    aliado.andar(velocidadeParaSeguir(aliado, desvio, velocidade * fator, 1))
    return
  }
  aliado.andar(velocidadeParaSeguir(aliado, destino, velocidade * fator, destino === ponto ? raioDeChegada : 1))
}

// Ponto para contornar quem está parado entre o aliado e o destino (outro aliado, o Líder ou um caído).
// A avançada vê de longe e contorna com folga; a média dá um passo para o lado quando quase encosta; a básica não
// desvia (escorrega no corpo e, se travar, destrava). null = segue reto.
function desvioDeQuemEstaParado(aliado, destino, cena) {
  const regra = ia.desvio[aliado.ia.perfilAtual?.id]
  if (!regra) return null
  const parados = cena.grupo
    .filter((outro) => outro !== aliado && !outro.perdido && (outro.caido || Math.hypot(outro.querida.x, outro.querida.y) < 20))
    .map((outro) => ({ x: outro.x, y: outro.y, raio: outro.raio, id: outro.classe }))
  // O lado escolhido para contornar alguém continua o mesmo até passar por ele (não fica trocando de lado)
  const ponto = pontoDeDesvio(aliado, destino, parados, { raio: aliado.raio, ...regra, ladoAnterior: aliado.ia.desvio })
  aliado.ia.desvio = ponto && { id: ponto.id, lado: ponto.lado }
  return ponto && cena.lugarLivre(aliado.tamanho, ponto, aliado, 0, false)
}

// Vai para um posto e, ao chegar (a "chegada" px), fica lá até o posto se afastar mais que "saida" px.
// Assim o aliado não persegue um ponto que muda um pouquinho a cada quadro (o que daria tremor).
function irComFolga(aliado, ponto, contexto, chegada = 25, saida = 60) {
  const ate = distancia(aliado, ponto)
  if (aliado.ia.noPosto && ate <= saida) {
    aliado.parar()
    return
  }
  aliado.ia.noPosto = ate <= chegada
  if (aliado.ia.noPosto) aliado.parar()
  else irPara(aliado, ponto, contexto, chegada)
}

// Sem alvo, olha para onde anda (o escudo do Tanque aliado vai junto)
function mirarNaDirecao(aliado) {
  if (Math.hypot(aliado.querida.x, aliado.querida.y) > 20) aliado.anguloDaMira = Math.atan2(aliado.querida.y, aliado.querida.x)
}

function mirandoEm(aliado, ponto) {
  return { angulo: anguloEntre(aliado, ponto), ponto: { x: ponto.x, y: ponto.y } }
}
