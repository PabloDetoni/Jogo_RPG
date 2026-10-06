import { atributoMaximo, curvaDosAtributos, pontosDeAtributoPorNivel } from '../dados/balanceamento.js'
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
