import { createContext, useContext } from 'react'

export const ContextoJogo = createContext(null)

// Dá acesso ao estado do jogo e às ações (irPara, voltar, abrirJanela...) em qualquer componente.
export function useJogo() {
  const valor = useContext(ContextoJogo)
  if (!valor) throw new Error('useJogo precisa estar dentro do <ProvedorDoJogo>')
  return valor
}
