import { useState } from 'react'
import { acompanharMochila, cliqueDireito, cliqueEsquerdo, completarGrade, devolverAoFechar, guardar, slotsDaLista, soltarFora } from '../../regras/itemNaMao.js'

const chaveDosItens = (itens) => (itens ?? []).map((item) => `${item.id}:${item.quantidade}`).join('|')

// O estado da grade com o item na mão (ajustes da partida, 14/10; regras/itemNaMao.js), para a mochila da partida e a
// Mochila do Reino. "itens" é a lista de verdade (a da partida ou a do save); a arrumação é só da tela e acompanha a
// lista quando ela muda (usou, pegou do chão, descartou). aberta = false devolve o item da mão para a grade.
// grade: { minimo, passo } (dados/interface.js, gradeComMao). Devolve o estado, o quadradinho embaixo do mouse e as ações.
export function useGradeComMao(itens, { minimo, passo = 1, aberta = true }) {
  const chave = chaveDosItens(itens)
  const [guardado, setGuardado] = useState(() => ({ chave, estado: completarGrade({ slots: slotsDaLista(itens, minimo), mao: null }, { minimo, passo }) }))
  const [sobre, setSobre] = useState(null)

  // Ajuste durante o render (sem efeito): a lista mudou ou a janela fechou com item na mão
  let { estado } = guardado
  let mudou = false
  if (guardado.chave !== chave) {
    estado = acompanharMochila(estado, itens, sobre)
    mudou = true
  }
  if (!aberta && estado.mao) {
    estado = devolverAoFechar(estado)
    mudou = true
  }
  if (mudou) {
    estado = completarGrade(estado, { minimo, passo })
    setGuardado({ chave, estado })
  }

  const mudar = (funcao) => setGuardado((atual) => ({ ...atual, estado: completarGrade(funcao(atual.estado), { minimo, passo }) }))

  return {
    estado,
    sobre,
    setSobre,
    // O item embaixo do mouse ou, sem ele, o da mão
    itemEmFoco: (sobre !== null ? estado.slots[sobre] : null) ?? estado.mao,
    esquerdo: (indice) => mudar((atual) => cliqueEsquerdo(atual, indice)),
    direito: (indice) => mudar((atual) => cliqueDireito(atual, indice)),
    // Tira o item da mão (para o chão ou para a lixeira) e devolve o que era
    soltar: () => {
      const { estado: novo, noChao } = soltarFora(estado)
      setGuardado((atual) => ({ ...atual, estado: novo }))
      return noChao
    },
    // Põe um item de volta na grade (o cancelar da lixeira)
    guardar: (item) => mudar((atual) => guardar(atual, item)),
  }
}
