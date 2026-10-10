import { arvoreDaClasse, raizDaClasse } from '../dados/arvores.js'
import { evolucaoDasHabilidades } from '../dados/balanceamento.js'
import { nomeDaClasse } from '../dados/classes.js'
import { habilidadesAtivasNoMaximo, nivelMaximoDaHabilidade } from '../dados/regras.js'

// ÁRVORE DE HABILIDADES (Fase 4, TASK-077; RF24, Conceito §7): aprender e evoluir com pontos de habilidade, escolher até
// 3 ativas (teclas 1, 2 e 3) e os números de cada nível. As árvores ficam em dados/arvores.js (PROVISÓRIO, TASK-010).
// personagem.habilidades = { id: nível (1 a 5) }; personagem.ativas = [ids], na ordem das teclas.
// "arvore" é sempre a da classe; os testes podem passar outra.

// Os números de uma ativa no nível dela: dano, cura e efeitos sobem; a recarga cai (balanceamento.js)
export function numerosNoNivel(numeros, nivel) {
  const passos = Math.max(0, Math.min(nivelMaximoDaHabilidade, nivel) - 1)
  const resultado = { ...numeros }
  for (const [campo, porNivel] of Object.entries(evolucaoDasHabilidades.porNivel)) {
    if (typeof numeros[campo] === 'number') resultado[campo] = Math.round(numeros[campo] * (1 + porNivel * passos) * 1000) / 1000
  }
  if (typeof numeros.recargaMs === 'number') resultado.recargaMs = Math.round(numeros.recargaMs * (1 - evolucaoDasHabilidades.recargaPorNivel * passos))
  return resultado
}

// A habilidade que precisa chegar ao nível 5 antes desta: a anterior do mesmo ramo (a primeira de cada ramo pede a raiz)
export function requisitoDe(habilidade, arvore) {
  if (habilidade.ramo === 'raiz') return null
  if (habilidade.camada === 2) return arvore.find((uma) => uma.ramo === 'raiz') ?? null
  return arvore.find((uma) => uma.ramo === habilidade.ramo && uma.camada === habilidade.camada - 1) ?? null
}

// Como a habilidade está para o personagem: 'foraDoBeta', 'bloqueada' (o requisito não chegou ao nível 5),
// 'liberada' (dá para aprender), 'aprendida' (nível 1 a 4) ou 'maxima' (nível 5)
export function estadoDaHabilidade(personagem, habilidade, arvore = arvoreDaClasse(personagem.classe)) {
  if (!habilidade.noBeta) return 'foraDoBeta'
  const nivel = personagem.habilidades?.[habilidade.id] ?? 0
  if (nivel >= nivelMaximoDaHabilidade) return 'maxima'
  if (nivel >= 1) return 'aprendida'
  const requisito = requisitoDe(habilidade, arvore)
  if (requisito && (personagem.habilidades?.[requisito.id] ?? 0) < nivelMaximoDaHabilidade) return 'bloqueada'
  return 'liberada'
}

function mudarPersonagem(progresso, classe, mudar) {
  return { ...progresso, personagens: progresso.personagens.map((personagem) => (personagem.classe === classe ? mudar(personagem) : personagem)) }
}

function acharNaArvore(progresso, classe, id, arvore) {
  const personagem = progresso.personagens.find((um) => um.classe === classe)
  if (!personagem) return { motivo: 'Só os personagens permanentes têm árvore.' }
  const habilidade = arvore.find((uma) => uma.id === id)
  if (!habilidade) return { motivo: 'Esta habilidade não é da árvore desta classe.' }
  return { personagem, habilidade }
}

// Aprender (nível 1) ou evoluir um nível, gastando os pontos de habilidade (balanceamento.js, pontosPorNivel)
export function evoluirHabilidade(progresso, classe, id, arvore = arvoreDaClasse(classe)) {
  const { personagem, habilidade, motivo } = acharNaArvore(progresso, classe, id, arvore)
  if (motivo) return { ok: false, motivo }
  const estado = estadoDaHabilidade(personagem, habilidade, arvore)
  if (estado === 'foraDoBeta') return { ok: false, motivo: `${habilidade.nome} fica para depois do beta.` }
  if (estado === 'maxima') return { ok: false, motivo: `${habilidade.nome} já está no nível ${nivelMaximoDaHabilidade}.` }
  if (estado === 'bloqueada') {
    const requisito = requisitoDe(habilidade, arvore)
    return { ok: false, motivo: `Bloqueada: ${requisito.nome} precisa chegar ao nível ${nivelMaximoDaHabilidade} antes.` }
  }
  const custo = evolucaoDasHabilidades.pontosPorNivel
  if (personagem.pontosDeHabilidade < custo) {
    return { ok: false, motivo: `Pontos de habilidade insuficientes: precisa de ${custo} e ${nomeDaClasse(classe)} tem ${personagem.pontosDeHabilidade}.` }
  }
  const nivel = (personagem.habilidades[id] ?? 0) + 1
  return {
    ok: true,
    progresso: mudarPersonagem(progresso, classe, (um) => ({ ...um, habilidades: { ...um.habilidades, [id]: nivel }, pontosDeHabilidade: um.pontosDeHabilidade - custo })),
    mensagem: nivel === 1 ? `${nomeDaClasse(classe)} aprendeu ${habilidade.nome}.` : `${habilidade.nome} subiu para o nível ${nivel}.`,
  }
}

// Põe uma ativa aprendida numa tecla livre. Com as 3 teclas ocupadas, pede para trocar uma (precisaTrocar).
export function porNaTecla(progresso, classe, id, arvore = arvoreDaClasse(classe)) {
  const { personagem, habilidade, motivo } = acharNaArvore(progresso, classe, id, arvore)
  if (motivo) return { ok: false, motivo }
  if (habilidade.tipo !== 'ativa') return { ok: false, motivo: 'Passiva fica sempre ligada: não vai numa tecla.' }
  if (!personagem.habilidades[id]) return { ok: false, motivo: `Aprenda ${habilidade.nome} antes.` }
  if (personagem.ativas.includes(id)) return { ok: false, motivo: `${habilidade.nome} já está numa tecla.` }
  if (personagem.ativas.length >= habilidadesAtivasNoMaximo) {
    return { ok: false, precisaTrocar: true, motivo: `As ${habilidadesAtivasNoMaximo} teclas estão ocupadas: escolha qual trocar.` }
  }
  return {
    ok: true,
    progresso: mudarPersonagem(progresso, classe, (um) => ({ ...um, ativas: [...um.ativas, id] })),
    mensagem: `${habilidade.nome} na tecla ${personagem.ativas.length + 1}.`,
  }
}

// Troca a ativa de uma tecla por outra aprendida (a que sai continua aprendida)
export function trocarNaTecla(progresso, classe, idQueSai, idQueEntra, arvore = arvoreDaClasse(classe)) {
  const { personagem, habilidade, motivo } = acharNaArvore(progresso, classe, idQueEntra, arvore)
  if (motivo) return { ok: false, motivo }
  const tecla = personagem.ativas.indexOf(idQueSai)
  if (tecla < 0) return { ok: false, motivo: 'Essa habilidade não está numa tecla.' }
  if (habilidade.tipo !== 'ativa' || !personagem.habilidades[idQueEntra] || personagem.ativas.includes(idQueEntra)) {
    return { ok: false, motivo: `${habilidade.nome} não pode entrar nessa tecla.` }
  }
  const ativas = personagem.ativas.map((uma) => (uma === idQueSai ? idQueEntra : uma))
  return {
    ok: true,
    progresso: mudarPersonagem(progresso, classe, (um) => ({ ...um, ativas })),
    mensagem: `${habilidade.nome} na tecla ${tecla + 1}.`,
  }
}

// Tira uma ativa da tecla (as teclas seguintes andam uma para a esquerda)
export function tirarDaTecla(progresso, classe, id) {
  const personagem = progresso.personagens.find((um) => um.classe === classe)
  if (!personagem?.ativas.includes(id)) return { ok: false, motivo: 'Essa habilidade não está numa tecla.' }
  return {
    ok: true,
    progresso: mudarPersonagem(progresso, classe, (um) => ({ ...um, ativas: um.ativas.filter((uma) => uma !== id) })),
    mensagem: 'Tecla liberada.',
  }
}

// O que vai nas teclas 1, 2 e 3 na partida: cada ativa com os números do nível dela (null = tecla vazia).
// Sem "ativas" (contratado temporário, membro de teste), só a raiz, no nível 1.
export function habilidadesNasTeclas({ classe, habilidades, ativas } = {}) {
  const arvore = arvoreDaClasse(classe)
  const raiz = raizDaClasse(classe)
  const niveis = habilidades ?? (raiz ? { [raiz.id]: 1 } : {})
  const ids = ativas ?? (raiz ? [raiz.id] : [])
  const teclas = Array.from({ length: habilidadesAtivasNoMaximo }, () => null)
  ids.slice(0, habilidadesAtivasNoMaximo).forEach((id, indice) => {
    const habilidade = arvore.find((uma) => uma.id === id && uma.tipo === 'ativa')
    if (!habilidade || !niveis[id]) return
    const { numeros, ...resto } = habilidade
    teclas[indice] = { ...resto, ...numerosNoNivel(numeros, niveis[id]), nivel: niveis[id], raiz: habilidade.ramo === 'raiz' }
  })
  return teclas
}

// O que as passivas aprendidas somam (sempre ligadas): vida e mana que volta em fração, chance de crítico, pontos de
// defesa e fração a mais nas curas
export function bonusDasPassivas({ classe, habilidades } = {}) {
  const bonus = { vida: 0, mana: 0, critico: 0, defesa: 0, cura: 0 }
  for (const habilidade of arvoreDaClasse(classe)) {
    const nivel = habilidades?.[habilidade.id] ?? 0
    if (habilidade.tipo === 'passiva' && habilidade.noBeta && nivel > 0 && habilidade.efeito in bonus) bonus[habilidade.efeito] += habilidade.porNivel * nivel
  }
  return bonus
}

// O que todo personagem novo já tem: a raiz no nível 1, na tecla 1 (a primeira habilidade é gratuita, RF24)
export function habilidadesIniciais(classe) {
  const raiz = raizDaClasse(classe)
  return raiz ? { habilidades: { [raiz.id]: 1 }, ativas: [raiz.id] } : { habilidades: {}, ativas: [] }
}
