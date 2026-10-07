import { combateDeTeste } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse, classes } from '../dados/classes.js'
import { manaMaxima, manaPorSegundo } from './habilidades.js'

// Quem vai para a partida, com quanta vida e quanta mana (Fase 1).
// Cada membro do grupo: { classe, vidaMaxima, manaMaxima, manaPorSegundo, lider, temporario, deTeste? }

// Vida máxima na arena de teste: Vitalidade × vidaPorPontoDeVitalidade (provisório)
export function vidaMaximaPelaVitalidade(vitalidade) {
  return Math.max(1, Math.round(vitalidade * combateDeTeste.vidaPorPontoDeVitalidade))
}

// Vida pela Vitalidade, mana pela Inteligência e a volta da mana pela Sabedoria
function numerosDoMembro(atributos) {
  return {
    vidaMaxima: vidaMaximaPelaVitalidade(atributos.vitalidade),
    manaMaxima: manaMaxima(atributos.inteligencia),
    manaPorSegundo: manaPorSegundo(atributos.sabedoria),
  }
}

// Membro criado só na memória da partida (barra de teste); nunca vai para o save
export function membroDeTeste(classe, lider = false) {
  return { classe, ...numerosDoMembro(atributosIniciaisDaClasse(classe)), lider, temporario: true, deTeste: true }
}

// Todos os personagens permanentes e os contratados temporários vão juntos (RF34), com o Líder
// escolhido na Preparação em primeiro. Sem ninguém (tela aberta pelo painel de desenvolvimento),
// entra um membro de teste para a arena funcionar.
export function montarGrupoDaPartida(progresso, lider) {
  const permanentes = progresso.personagens.map((personagem) => ({
    classe: personagem.classe,
    atributos: { ...atributosIniciaisDaClasse(personagem.classe), ...personagem.atributos },
    temporario: false,
  }))
  const temporarios = progresso.contratosTemporarios
    .filter((contrato) => !permanentes.some((personagem) => personagem.classe === contrato.classe))
    .map((contrato) => ({ classe: contrato.classe, atributos: atributosIniciaisDaClasse(contrato.classe), temporario: true }))
  const grupo = [...permanentes, ...temporarios].map((membro) => ({
    classe: membro.classe,
    ...numerosDoMembro(membro.atributos),
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
