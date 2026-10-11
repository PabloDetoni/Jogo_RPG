// A mensagem embaixo das telas do Reino (Fase 4.5): o que aconteceu, ou o motivo de não ter dado (em vermelho)
export function MensagemDoReino({ mensagem }) {
  if (!mensagem) return null
  return (
    <p className={mensagem.erro ? 'mensagem-do-reino mensagem-do-reino-erro' : 'mensagem-do-reino mensagem-do-reino-ok'} role="status">
      {mensagem.texto}
    </p>
  )
}
