import { useState } from 'react'
import { useJogo } from '../../estado/contexto.js'
import { aplicarNoReino } from '../../regras/reino.js'

// Faz uma operação do Reino (regras/reino.js) e guarda a mensagem do que aconteceu, ou do motivo de não ter dado
// (sem ouro, sem o item...). A regra roda aqui para a mensagem e no estado para mudar o progresso: é a mesma.
export function useNoReino() {
  const { estado, acoes } = useJogo()
  const [mensagem, setMensagem] = useState(null)

  function fazer(operacao, ...argumentos) {
    const resultado = aplicarNoReino(estado.progresso, operacao, argumentos)
    if (!resultado.ok) {
      setMensagem({ texto: resultado.motivo, erro: true })
      return false
    }
    acoes.noReino(operacao, ...argumentos)
    setMensagem({ texto: resultado.mensagem, erro: false })
    return true
  }

  return { estado, progresso: estado.progresso, mensagem, setMensagem, fazer }
}
