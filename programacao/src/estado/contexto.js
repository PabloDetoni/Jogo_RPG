import { createContext, useContext, useSyncExternalStore } from 'react'

export const ContextoJogo = createContext(null)

// Dá acesso ao estado do jogo e às ações (irPara, voltar, abrirJanela...) em qualquer componente.
export function useJogo() {
  const valor = useContext(ContextoJogo)
  if (!valor) throw new Error('useJogo precisa estar dentro do <ProvedorDoJogo>')
  return valor
}

// Situação do salvamento do convidado: { versao, salvoEm, problema }.
// problema: null, 'indisponivel', 'cheio', 'conflito' ou 'formatoNovo'.
export function useInfoDoSalvamento() {
  const { salvador } = useJogo()
  return useSyncExternalStore(salvador.inscrever, salvador.obterInfo, salvador.obterInfo)
}
