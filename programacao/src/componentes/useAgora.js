import { useEffect, useState } from 'react'
import { horaDoJogo } from '../conta/horaDoServidor.js'

// A hora do jogo (a do servidor para a conta; ajustes de 14/10), atualizada a cada "ms": para contagens na tela, como o
// "renova em 05:12" das rodadas dos minijogos.
export function useAgora(ms = 15000) {
  const [agora, setAgora] = useState(horaDoJogo)
  useEffect(() => {
    const relogio = setInterval(() => setAgora(horaDoJogo()), ms)
    return () => clearInterval(relogio)
  }, [ms])
  return agora
}
