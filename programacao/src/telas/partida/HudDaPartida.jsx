import { emCqw, faixas } from '../../dados/arenaDeTeste.js'
import { corDaClasseCss, nomeDaClasse } from '../../dados/classes.js'

// HUD da partida (React, por cima do Phaser): uma faixa no topo, fora da área jogável (ninguém anda embaixo dela).
// Linha de cima: o Líder (vida, mana), o ataque, a esquiva e as habilidades das teclas 1 a 3, com a recarga.
// Linha de baixo: os aliados (vida, caído com a contagem dos 30 s, frágil), os perdidos e o aviso do Líder caído.
// Recebe a "situação" que o Phaser manda 8 vezes por segundo pela ponte.
export default function HudDaPartida({ situacao }) {
  const estilo = { height: emCqw(faixas.hud) }
  if (!situacao) {
    return (
      <div className="hud" style={estilo}>
        Carregando a arena...
      </div>
    )
  }

  return (
    <div className="hud" style={estilo}>
      <div className="hud-linha">
        <div className="hud-classe">
          <span className="hud-cor" style={{ background: corDaClasseCss(situacao.classe) }} />
          Líder: {nomeDaClasse(situacao.classe)}
        </div>
        <Medidor nome="Vida" fracao={situacao.vida / situacao.vidaMaxima} texto={`${situacao.vida} / ${situacao.vidaMaxima}`} tipo="vida" />
        <Medidor nome="Mana" fracao={situacao.mana / situacao.manaMaxima} texto={`${situacao.mana} / ${situacao.manaMaxima}`} tipo="mana" />
        <Espaco tecla="Clique" nome="Ataque" recarga={situacao.recargaDoAtaque} />
        <Espaco tecla="Espaço" nome="Esquiva" recarga={situacao.recargaDaEsquiva} />
        {situacao.habilidades.map((habilidade, indice) => (
          <Espaco
            key={indice}
            tecla={String(indice + 1)}
            nome={habilidade?.nome ?? 'vazio'}
            custo={habilidade?.custo}
            recarga={habilidade ? habilidade.recarga : null}
            semMana={habilidade?.semMana}
          />
        ))}
      </div>
      <div className="hud-linha">
        <span className="hud-rotulo">Grupo:</span>
        {situacao.aliados.length === 0 && <span className="hud-rotulo">só o Líder</span>}
        {situacao.aliados.map((aliado, indice) => (
          <Aliado key={indice} aliado={aliado} />
        ))}
        {situacao.perdidos.map((classe, indice) => (
          <span key={`perdido-${indice}`} className="hud-aliado hud-perdido">
            <span className="hud-cor" style={{ background: corDaClasseCss(classe) }} />
            {nomeDaClasse(classe)}: perdido
          </span>
        ))}
        {situacao.caido && (
          <span className="hud-alerta">O Líder desmaiou: {situacao.segundosParaLevantar} s para ser levantado</span>
        )}
      </div>
    </div>
  )
}

function Medidor({ nome, fracao, texto, tipo }) {
  return (
    <div className={`medidor medidor-${tipo}`}>
      <span>{nome}</span>
      <Barra fracao={fracao} />
      <span>{texto}</span>
    </div>
  )
}

function Barra({ fracao }) {
  return (
    <span className="medidor-barra">
      <span className="medidor-cheio" style={{ width: `${Math.round(Math.max(0, Math.min(1, fracao)) * 100)}%` }} />
    </span>
  )
}

// Um espaço de ação: tecla, nome, custo de mana e a barra da recarga (cheia = pronta). recarga null = vazio.
function Espaco({ tecla, nome, custo, recarga, semMana }) {
  const vazio = recarga === null
  const classes = ['hud-espaco', vazio && 'hud-espaco-vazio', semMana && 'hud-espaco-sem-mana', recarga >= 1 && 'hud-espaco-pronto']
  return (
    <div className={classes.filter(Boolean).join(' ')}>
      <span className="hud-espaco-nome">
        <span className="hud-tecla">{tecla}</span> {nome}
        {custo !== undefined && <span className="hud-custo"> {custo}</span>}
      </span>
      {!vazio && <Barra fracao={recarga} />}
    </div>
  )
}

function Aliado({ aliado }) {
  const estado = aliado.caido ? `caído: ${aliado.segundosParaLevantar} s` : aliado.fragil ? 'frágil' : null
  return (
    <span className={`hud-aliado${aliado.caido ? ' hud-aliado-caido' : ''}`}>
      <span className="hud-cor" style={{ background: corDaClasseCss(aliado.classe) }} />
      {nomeDaClasse(aliado.classe)}
      {!aliado.caido && <Barra fracao={aliado.vida / aliado.vidaMaxima} />}
      {estado && <span className="hud-estado">{estado}</span>}
    </span>
  )
}
