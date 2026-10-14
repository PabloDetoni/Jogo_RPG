import { useEffect, useRef, useState } from 'react'
import { useJogo } from '../estado/contexto.js'
import { mostrarVoltarATelaCheia, saidaContaComoEsc } from '../regras/telaCheia.js'
import { estaEmTelaCheia, ouvirTelaCheia, pedirTelaCheia, sairDaTelaCheia, telaCheiaSuportada } from './telaCheia.js'

// O X discreto para sair da tela cheia e o "Voltar à tela cheia" (ajustes de 14/10/2026). Se o navegador tirar o jogo
// da tela cheia sem o jogador pedir (o Esc do Firefox ou do Safari, ou o Esc segurado no Chrome e no Edge), na partida
// isso vale como um Esc: pausa, se puder (regras/telaCheia.js).
export default function ControleDaTelaCheia() {
  const { estado, acoes } = useJogo()
  const [emTelaCheia, setEmTelaCheia] = useState(estaEmTelaCheia)
  const [saiuSemPedir, setSaiuSemPedir] = useState(false)
  const ultimoEsc = useRef(-Infinity)
  const atual = useRef({ tela: estado.tela })
  useEffect(() => {
    atual.current = { tela: estado.tela }
  }, [estado.tela])

  useEffect(() => {
    const aoApertar = (evento) => {
      if (evento.key === 'Escape') ultimoEsc.current = performance.now()
    }
    window.addEventListener('keydown', aoApertar, true)
    const pararDeOuvir = ouvirTelaCheia(({ emTelaCheia: agora, saidaPedida }) => {
      setEmTelaCheia(agora)
      if (agora) {
        setSaiuSemPedir(false)
        return
      }
      if (!saidaPedida) setSaiuSemPedir(true)
      const naPartida = atual.current.tela === 'partida'
      if (saidaContaComoEsc({ naPartida, saidaPedida, msDesdeOUltimoEsc: performance.now() - ultimoEsc.current })) acoes.esc()
    })
    return () => {
      window.removeEventListener('keydown', aoApertar, true)
      pararDeOuvir()
    }
  }, [acoes])

  if (!telaCheiaSuportada()) return null
  const voltar = mostrarVoltarATelaCheia({ preferencia: estado.preferencias.telaCheia, suportada: true, emTelaCheia, saiuSemPedir })

  return (
    <>
      {emTelaCheia && (
        <button type="button" className="sair-da-tela-cheia" onClick={sairDaTelaCheia} aria-label="Sair da tela cheia" title="Sair da tela cheia (ou F11)">
          ✕
        </button>
      )}
      {voltar && (
        <button
          type="button"
          className="botao voltar-a-tela-cheia"
          onClick={() => {
            setSaiuSemPedir(false)
            pedirTelaCheia(true)
          }}
        >
          Voltar à tela cheia
        </button>
      )}
    </>
  )
}
