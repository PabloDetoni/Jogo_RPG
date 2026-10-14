import { createContext, useContext, useEffect } from 'react'

// A aba aberta entra na trilha do alto da tela ("Reino › Forja › Equipar", ajustes de 14/10). O Tela.jsx guarda o nome;
// o ConteudoComAbas avisa qual aba está aberta.
export const ContextoDaTrilha = createContext(null)

export function useAbaNaTrilha(nome) {
  const definir = useContext(ContextoDaTrilha)
  useEffect(() => {
    if (!definir) return undefined
    definir(nome ?? null)
    return () => definir(null)
  }, [definir, nome])
}
