import { useSyncExternalStore } from 'react'

// O "reduzir movimento" do sistema (Windows: Configurações › Acessibilidade › Efeitos visuais › Efeitos de animação)
const consulta = '(prefers-reduced-motion: reduce)'
const inscrever = (aviso) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const lista = window.matchMedia(consulta)
  lista.addEventListener('change', aviso)
  return () => lista.removeEventListener('change', aviso)
}
export function useReduzirMovimento() {
  return useSyncExternalStore(
    inscrever,
    () => Boolean(window.matchMedia?.(consulta).matches),
    () => false,
  )
}
