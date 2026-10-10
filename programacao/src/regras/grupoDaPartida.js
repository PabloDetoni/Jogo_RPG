import { combateDeTeste, contratos, critico } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse, classes } from '../dados/classes.js'
import { equipamentoDosTemporarios } from '../dados/forja.js'
import { nivelInicial } from '../dados/regras.js'
import { chanceDeCritico } from './combate.js'
import { atributosComEquipamento, bonusDoEquipamento } from './equipamento.js'
import { manaMaxima, manaPorSegundo } from './habilidades.js'
import { capacidadeDaMochila } from './mochila.js'

// Quem vai para a partida, com quanta vida e quanta mana (Fase 1).
// Cada membro do grupo: { classe, nivel, xp, vidaMaxima, manaMaxima, manaPorSegundo, chanceDeCritico, lider, temporario, deTeste? }
// O nível decide a IA do personagem quando ele é aliado (regras/nivelDaIA.js). nivel e xp são os do save no começo
// da partida: o XP ganho nela só entra no save no fim (RF12), e é com eles que o HUD avisa "subiu de nível".

// Vida máxima na arena de teste: Vitalidade × vidaPorPontoDeVitalidade (provisório)
export function vidaMaximaPelaVitalidade(vitalidade) {
  return Math.max(1, Math.round(vitalidade * combateDeTeste.vidaPorPontoDeVitalidade))
}

// Vida pela Vitalidade, mana pela Inteligência, a volta da mana pela Sabedoria e o crítico pela Agilidade.
// Com equipamento (Fase 4): os bônus somam aos atributos, e a defesa e a redução de recarga das peças vão junto.
function numerosDoMembro(atributosSemEquipamento, equipamento = {}) {
  const atributos = atributosComEquipamento(atributosSemEquipamento, equipamento)
  const { defesa, reducaoDeRecarga } = bonusDoEquipamento(equipamento)
  return {
    defesa,
    reducaoDeRecarga,
    forca: atributos.forca ?? 0, // a capacidade da mochila da partida sai da Força do grupo (RF33)
    vidaMaxima: vidaMaximaPelaVitalidade(atributos.vitalidade),
    manaMaxima: manaMaxima(atributos.inteligencia),
    manaPorSegundo: manaPorSegundo(atributos.sabedoria),
    chanceDeCritico: chanceDeCritico(atributos.agilidade, critico),
  }
}

// Membro criado só na memória da partida (barra de teste); nunca vai para o save
export function membroDeTeste(classe, lider = false) {
  return { classe, nivel: nivelInicial, xp: 0, ...numerosDoMembro(atributosIniciaisDaClasse(classe)), lider, temporario: true, deTeste: true }
}

// Todos os personagens permanentes e os contratados temporários vão juntos (RF34), com o Líder
// escolhido na Preparação em primeiro. Sem ninguém (tela aberta pelo painel de desenvolvimento),
// entra um membro de teste para a arena funcionar.
export function montarGrupoDaPartida(progresso, lider) {
  const permanentes = progresso.personagens.map((personagem) => ({
    classe: personagem.classe,
    atributos: { ...atributosIniciaisDaClasse(personagem.classe), ...personagem.atributos },
    equipamento: personagem.equipamento ?? {},
    nivel: personagem.nivel ?? nivelInicial,
    xp: personagem.xp ?? 0,
    temporario: false,
  }))
  const temporarios = progresso.contratosTemporarios
    .filter((contrato) => !permanentes.some((personagem) => personagem.classe === contrato.classe))
    .map((contrato) => ({
      classe: contrato.classe,
      atributos: atributosIniciaisDaClasse(contrato.classe),
      equipamento: equipamentoDosTemporarios[contrato.classe] ?? {}, // fixo (RF29)
      nivel: contrato.nivel ?? contratos.nivelDoTemporario,
      xp: 0,
      temporario: true,
    }))
  const grupo = [...permanentes, ...temporarios].map((membro) => ({
    classe: membro.classe,
    nivel: membro.nivel,
    xp: membro.xp,
    ...numerosDoMembro(membro.atributos, membro.equipamento),
    lider: membro.classe === lider,
    temporario: membro.temporario,
  }))

  if (grupo.length === 0) return [membroDeTeste(lider ?? classes[0].id, true)]
  if (!grupo.some((membro) => membro.lider)) grupo[0].lider = true
  return [...grupo.filter((membro) => membro.lider), ...grupo.filter((membro) => !membro.lider)]
}

// "Encher grupo": as classes que ainda não estão no grupo
export function classesQueFaltam(grupo) {
  return classes.map((classe) => classe.id).filter((id) => !grupo.some((membro) => membro.classe === id))
}

// Trocar a classe do Líder na hora (barra de teste). Se um aliado já é dessa classe, ele vira o Líder
// e o Líder antigo vira aliado; senão, o Líder só muda de classe.
export function trocarClasseDoLider(grupo, novaClasse) {
  const lider = grupo.find((membro) => membro.lider)
  if (!lider || lider.classe === novaClasse) return grupo
  const aliado = grupo.find((membro) => membro.classe === novaClasse)
  if (aliado) {
    return grupo.map((membro) => {
      if (membro === lider) return { ...membro, lider: false }
      if (membro === aliado) return { ...membro, lider: true }
      return membro
    })
  }
  return grupo.map((membro) => (membro === lider ? membroDeTeste(novaClasse, true) : membro))
}

// Capacidade da mochila da partida com o grupo que vai (a Força de todos, RF33): a mesma conta que a partida faz ao
// começar, para a Preparação mostrar e limitar o que vai junto
export function capacidadeDaPartida(progresso, lider) {
  return capacidadeDaMochila(montarGrupoDaPartida(progresso, lider).map((membro) => membro.forca ?? 0))
}
