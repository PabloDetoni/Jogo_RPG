import { describe, expect, it } from 'vitest'
import { atributoMaximo } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { ataqueDaClasse, atributosNoNivel, bandoDaRegiao, mobsDaRegiao, simular, simularLuta } from './simulador.js'
import { pontosDeAtributoAteONivel } from './atributos.js'
import { membroComAtributos } from './grupoDaPartida.js'

const grupoCompleto = ['guerreiro', 'mago', 'tanque', 'sacerdote', 'arqueiro']
const soma = (atributos) => Object.values(atributos).reduce((a, b) => a + b, 0)

describe('simulador de balanceamento (RF62)', () => {
  it('os atributos do nível N: os iniciais mais todos os pontos ganhos, sem passar de 100', () => {
    for (const classe of grupoCompleto) {
      const inicial = soma(atributosIniciaisDaClasse(classe))
      expect(soma(atributosNoNivel(classe, 1))).toBe(inicial)
      expect(soma(atributosNoNivel(classe, 30))).toBe(inicial + pontosDeAtributoAteONivel(30))
      for (const valor of Object.values(atributosNoNivel(classe, 100))) expect(valor).toBeLessThanOrEqual(atributoMaximo)
    }
  })

  it('o Sacerdote cura e agora também machuca (Parte 3); o Arqueiro atira com a carga cheia', () => {
    const sacerdote = ataqueDaClasse(membroComAtributos('sacerdote', atributosIniciaisDaClasse('sacerdote')))
    expect(sacerdote.cura).toBeGreaterThan(0)
    expect(sacerdote.dano).toBeGreaterThan(0)
    expect(ataqueDaClasse(membroComAtributos('arqueiro', atributosIniciaisDaClasse('arqueiro'))).dano).toBeGreaterThan(0)
  })

  it('o cervo (não hostil) não entra nos mobs que atacam; a região mais funda tem mobs mais fortes', () => {
    expect(mobsDaRegiao('facil').some((m) => m.tipo === 'cervo')).toBe(false)
    const loboFacil = mobsDaRegiao('facil').find((m) => m.tipo === 'lobo')
    const loboDificil = mobsDaRegiao('dificil').find((m) => m.tipo === 'lobo')
    expect(loboDificil.vida).toBeGreaterThan(loboFacil.vida)
    expect(loboDificil.dano).toBeGreaterThan(loboFacil.dano)
    expect(bandoDaRegiao('media', 4)).toHaveLength(4)
    expect(bandoDaRegiao('boss', 4)).toHaveLength(1)
  })

  it('sempre o mesmo resultado para os mesmos dados (não sorteia)', () => {
    const a = simular({ nivel: 5, regiao: 'media', classes: grupoCompleto })
    const b = simular({ nivel: 5, regiao: 'media', classes: grupoCompleto })
    expect(a).toEqual(b)
  })

  it('nível mais alto aguenta mais: o grupo de nível 20 enfrenta pelo menos tantos mobs quanto o de nível 1', () => {
    for (const regiao of ['facil', 'media', 'dificil']) {
      const n1 = simular({ nivel: 1, regiao, classes: grupoCompleto })
      const n20 = simular({ nivel: 20, regiao, classes: grupoCompleto })
      expect(n20.maximoSemCair, regiao).toBeGreaterThanOrEqual(n1.maximoSemCair)
    }
  })

  it('a luta termina: alguém vence, e quem cai tem a hora da queda', () => {
    const grupo = [membroComAtributos('guerreiro', atributosIniciaisDaClasse('guerreiro'))]
    const luta = simularLuta(grupo, bandoDaRegiao('dificil', 6))
    expect(luta.venceu).toBe(false)
    expect(luta.membros[0].caiuEm).toBeGreaterThan(0)
    expect(luta.membros[0].danoRecebido).toBeGreaterThan(0)
  })
})
