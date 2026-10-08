import { useState } from 'react'

// Um pedido à conta (entrar, criar a conta, mandar o link...): enquanto ele não volta, "ocupado" desativa o botão;
// a resposta ({ ok, codigo, mensagem, ... }) fica guardada para a tela mostrar.
export function usePedido() {
  const [ocupado, setOcupado] = useState(false)
  const [resposta, setResposta] = useState(null)

  async function pedir(fazer) {
    if (ocupado) return null
    setOcupado(true)
    try {
      const recebida = await fazer()
      // "ocupado" vem de outro pedido de conta ainda em andamento: só ignora o clique
      if (recebida?.codigo !== 'ocupado') setResposta(recebida ?? null)
      return recebida
    } finally {
      setOcupado(false)
    }
  }

  return { ocupado, resposta, pedir }
}

// A resposta de um pedido à conta ({ ok, mensagem }) como mensagem da tela; sem texto, nada aparece
export function comoMensagem(resposta) {
  if (!resposta?.mensagem) return null
  return { texto: resposta.mensagem, tipo: resposta.ok ? 'bom' : 'erro' }
}
