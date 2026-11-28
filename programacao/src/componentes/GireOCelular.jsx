// "Gire o celular" (Parte 14): o jogo é deitado (paisagem). Com toque e em pé, esta tela cobre tudo, com um desenho
// simples do celular girando. Fica fora da moldura 16:9 (em pé ela seria pequena demais).
export default function GireOCelular() {
  return (
    <div className="gire-o-celular" role="alertdialog" aria-live="assertive" aria-label="Gire o celular">
      <svg className="gire-o-celular-desenho" viewBox="0 0 120 120" aria-hidden="true">
        <path className="gire-o-celular-seta" d="M 22 40 A 44 44 0 0 1 80 18" />
        <path className="gire-o-celular-seta" d="M 74 10 L 82 18 L 72 24" />
        <g className="gire-o-celular-aparelho">
          <rect x="38" y="26" width="44" height="76" rx="7" />
          <rect className="gire-o-celular-tela" x="43" y="34" width="34" height="58" rx="2" />
          <circle className="gire-o-celular-botao" cx="60" cy="97" r="2.5" />
        </g>
      </svg>
      <h2>Gire o celular</h2>
      <p>O jogo é deitado. Vire o aparelho de lado para jogar.</p>
    </div>
  )
}
