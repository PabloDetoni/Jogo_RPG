import Area from './Area.jsx'

// Mensagem das telas de acesso (Fase 2): o que aconteceu e o que fazer (RNF09). tipo: 'bom' ou 'erro'.
export default function MensagemDoAcesso({ em, mensagem }) {
  if (!mensagem?.texto) return null
  return (
    <Area em={em} className={`mensagem-do-acesso mensagem-do-acesso-${mensagem.tipo ?? 'erro'}`}>
      <p role={mensagem.tipo === 'bom' ? 'status' : 'alert'}>{mensagem.texto}</p>
    </Area>
  )
}
