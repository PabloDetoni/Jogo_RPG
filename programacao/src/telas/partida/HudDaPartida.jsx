import { combateDeTeste } from '../../dados/balanceamento.js'
import { corDaClasseCss, nomeDaClasse } from '../../dados/classes.js'

// HUD da partida (React, por cima do Phaser): classe e vida do Líder e as recargas do ataque e da esquiva.
// Recebe a "situação" que o Phaser manda 8 vezes por segundo pela ponte.
export default function HudDaPartida({ situacao }) {
  if (!situacao) return <div className="hud">Carregando a arena...</div>

  return (
    <div className="hud">
      <div className="hud-classe">
        <span className="hud-cor" style={{ background: corDaClasseCss(situacao.classe) }} />
        Líder: {nomeDaClasse(situacao.classe)}
      </div>
      <Medidor nome="Vida" fracao={situacao.vida / situacao.vidaMaxima} texto={`${situacao.vida} / ${situacao.vidaMaxima}`} tipo="vida" />
      <Medidor nome="Ataque" fracao={situacao.recargaDoAtaque} texto={situacao.recargaDoAtaque >= 1 ? 'pronto' : '...'} />
      <Medidor nome="Esquiva" fracao={situacao.recargaDaEsquiva} texto={situacao.recargaDaEsquiva >= 1 ? 'pronta' : '...'} />
      {situacao.caido && <p className="hud-alerta">O Líder desmaiou. Derrota em {combateDeTeste.msAteADerrota / 1000} s.</p>}
      <p className="hud-dica">WASD anda · mouse mira · clique ataca · Espaço esquiva · Esc pausa</p>
    </div>
  )
}

function Medidor({ nome, fracao, texto, tipo = 'recarga' }) {
  return (
    <div className={`medidor medidor-${tipo}`}>
      <span>{nome}</span>
      <span className="medidor-barra">
        <span className="medidor-cheio" style={{ width: `${Math.round(Math.max(0, Math.min(1, fracao)) * 100)}%` }} />
      </span>
      <span>{texto}</span>
    </div>
  )
}
