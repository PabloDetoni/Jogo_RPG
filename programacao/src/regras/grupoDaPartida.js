import { combateDeTeste } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse, classes } from '../dados/classes.js'

// Quem vai para a partida e com quanta vida (Fase 1, parte 5a).
// Cada membro do grupo: { classe, vidaMaxima, lider, temporario, deTeste? }

// Vida máxima na arena de teste: Vitalidade × vidaPorPontoDeVitalidade (provisório)
export function vidaMaximaPelaVitalidade(vitalidade) {
  return Math.max(1, Math.round(vitalidade * combateDeTeste.vidaPorPontoDeVitalidade))
}

// Membro criado só na memória da partida (barra de teste); nunca vai para o save
export function membroDeTeste(classe, lider = false) {
  const { vitalidade } = atributosIniciaisDaClasse(classe)
  return { classe, vidaMaxima: vidaMaximaPelaVitalidade(vitalidade), lider, temporario: true, deTeste: true }
}

// Todos os personagens permanentes e os contratados temporários vão juntos (RF34), com o Líder
// escolhido na Preparação em primeiro. Sem ninguém (tela aberta pelo painel de desenvolvimento),
// entra um membro de teste para a arena funcionar.
export function montarGrupoDaPartida(progresso, lider) {
  const permanentes = progresso.personagens.map((personagem) => ({
    classe: personagem.classe,
    vitalidade: personagem.atributos?.vitalidade ?? atributosIniciaisDaClasse(personagem.classe).vitalidade,
    temporario: false,
  }))
  const temporarios = progresso.contratosTemporarios
    .filter((contrato) => !permanentes.some((personagem) => personagem.classe === contrato.classe))
    .map((contrato) => ({
      classe: contrato.classe,
      vitalidade: atributosIniciaisDaClasse(contrato.classe).vitalidade,
      temporario: true,
    }))
  const grupo = [...permanentes, ...temporarios].map((membro) => ({
    classe: membro.classe,
    vidaMaxima: vidaMaximaPelaVitalidade(membro.vitalidade),
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
