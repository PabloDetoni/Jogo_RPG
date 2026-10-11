// Barra (Fase 4.5): o peso da mochila, o progresso de uma missão. fracao de 0 a 1; "alerta" pinta de vermelho (chegou ao
// limite). Com a arte (barra-fundo.png e barra-cheia.png), as imagens.
export default function Barra({ fracao, texto, rotulo, alerta = false }) {
  const porcento = Math.round(Math.max(0, Math.min(1, fracao || 0)) * 100)
  return (
    <div className={`barra${alerta ? ' barra-alerta' : ''}`} role="meter" aria-label={rotulo ?? texto} aria-valuemin={0} aria-valuemax={100} aria-valuenow={porcento}>
      <div className="barra-cheia" style={{ width: `${porcento}%` }} />
      {texto && <span className="barra-texto">{texto}</span>}
    </div>
  )
}
