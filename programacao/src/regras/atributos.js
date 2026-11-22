import { atributoMaximo, atributosNoCombate, curvaDosAtributos, pontosDeAtributoPorNivel } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { nivelInicial } from '../dados/regras.js'

// Efeito de um atributo, de 0 até o máximo: máximo × (valor ÷ máximo) ^ expoente.
// Expoente 1 = linha reta (100 vale o dobro de 50). Acima de 1, valores altos valem cada vez mais.
export function efeitoComExpoente(valor, expoente) {
  const limitado = Math.min(Math.max(valor, 0), atributoMaximo)
  return atributoMaximo * (limitado / atributoMaximo) ** expoente
}

// Efeito com a curva escolhida em dados/balanceamento.js. O combate usa isto na etapa 5.
export function efeitoDoAtributo(valor) {
  return efeitoComExpoente(valor, curvaDosAtributos.expoente)
}

// Fator de dano (ou de cura) pelo atributo (Parte 3 de 11/2026): 1 no valor de referência (o inicial da classe), maior
// com o atributo mais alto, pela curva do efeitoDoAtributo. escala: atributosNoCombate.escala.
export function fatorDoAtributo(valor, referencia, escala = atributosNoCombate.escala) {
  return (1 + efeitoDoAtributo(valor) / escala) / (1 + efeitoDoAtributo(referencia) / escala)
}

// O fator de dano de um personagem: pelo atributo que a classe usa no dano (o Arqueiro, nenhum: o arco já usa a Força)
export function fatorDeDanoDaClasse(classe, atributos, config = atributosNoCombate) {
  const atributo = config.danoPelaClasse[classe]
  if (!atributo) return 1
  return fatorDoAtributo(atributos[atributo] ?? 0, atributosIniciaisDaClasse(classe)[atributo] ?? 0, config.escala)
}

// O fator da cura (a aura do Sacerdote e as curas): pela Sabedoria, com o valor inicial do Sacerdote como referência
export function fatorDeCura(atributos, config = atributosNoCombate) {
  if (!config.curaPelaSabedoria) return 1
  return fatorDoAtributo(atributos.sabedoria ?? 0, atributosIniciaisDaClasse('sacerdote').sabedoria, config.escala)
}

// Velocidade de andar pela Agilidade (px/s): base + porPontoDeAgilidade × Agilidade
export function velocidadePelaAgilidade(agilidade, { base, porPontoDeAgilidade } = atributosNoCombate.velocidade) {
  return base + porPontoDeAgilidade * Math.min(Math.max(agilidade ?? 0, 0), atributoMaximo)
}

// Pontos de atributo que um personagem ganhou até chegar ao nível pedido (RF55)
export function pontosDeAtributoAteONivel(nivel) {
  return Math.max(0, nivel - nivelInicial) * pontosDeAtributoPorNivel
}

// Coloca um ponto livre num atributo (Árvores de Habilidades, RF24).
// Sem ponto livre ou com o atributo no máximo, o personagem volta como estava.
export function aplicarPontoDeAtributo(personagem, atributo) {
  const atual = personagem.atributos[atributo]
  if (personagem.pontosDeAtributo < 1 || atual === undefined || atual >= atributoMaximo) return personagem
  return {
    ...personagem,
    pontosDeAtributo: personagem.pontosDeAtributo - 1,
    atributos: { ...personagem.atributos, [atributo]: atual + 1 },
  }
}
