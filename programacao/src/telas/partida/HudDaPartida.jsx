import Minimapa from './Minimapa.jsx'
import { emCqw, faixas } from '../../dados/arenaDeTeste.js'
import { corDaClasseCss, nomeDaClasse } from '../../dados/classes.js'
import { nomeDoNivelDaIA } from '../../regras/nivelDaIA.js'
import { relogio } from './formato.js'

// HUD da partida (RF53, TASK-049; React, por cima do Phaser): uma faixa no topo, fora da área jogável.
// À esquerda, duas linhas: o Líder (vida, mana, ataque, esquiva e as teclas 1 a 3 com a recarga) e o grupo (vida, IA,
// caído com a contagem dos 30 s, frágil, perdidos). No meio, os números da partida: tempo, pontuação, ouro ganho,
// custo da fuga, "em combate", foco e o mudo. Depois, o lugar reservado do minimapa e da região (etapa 6).
// Recebe a "situação" que o Phaser manda 8 vezes por segundo pela ponte.
export default function HudDaPartida({ situacao, mudo = false, bioma = 'floresta' }) {
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
      <div className="hud-principal">
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
        </div>
      </div>

      <div className="hud-numeros">
        <div className="hud-linha">
          <Numero nome="Tempo" valor={relogio(situacao.tempo)} />
          <Numero nome="Pontos" valor={situacao.pontuacao} />
          <Numero nome="Ouro" valor={situacao.ouroGanho} />
        </div>
        <div className="hud-linha" title="Taxa da fuga pela posição do Líder agora, e quanto ela tira do ouro ganho">
          <span className="hud-fuga">
            Fuga (F): <strong>{situacao.custoDaFuga.taxa}%</strong> · {situacao.custoDaFuga.ouro} de ouro
          </span>
        </div>
        <div className="hud-linha">
          <span className={`hud-selo ${situacao.emCombate ? 'hud-combate' : 'hud-calmo'}`}>
            {situacao.emCombate ? 'Em combate' : 'Fora de combate'}
          </span>
          {situacao.emFoco && <span className="hud-selo hud-foco">Foco!</span>}
          <span className={`hud-selo ${mudo ? 'hud-mudo' : 'hud-som'}`} title="M liga e desliga o mudo">
            {mudo ? 'Mudo (M)' : 'Som (M)'}
          </span>
        </div>
      </div>

      {/* O minimapa (parte 3d) e a região atual (RF53); no domínio do Boss, em destaque (a taxa sobe ali, RF48) */}
      <div className={`hud-minimapa${situacao?.minimapa ? ' hud-minimapa-ativo' : ''}`} aria-label="Minimapa">
        {situacao?.minimapa ? <Minimapa bioma={bioma} minimapa={situacao.minimapa} /> : <span>Minimapa</span>}
        <span className={`hud-regiao${situacao?.regiao?.dominioDeBoss ? ' hud-regiao-boss' : ''}`}>Região: {situacao?.regiao?.nome ?? '—'}</span>
        {situacao?.mochila && (
          <span className={`hud-regiao${situacao.mochila.peso >= situacao.mochila.capacidade ? ' hud-mochila-cheia' : ''}`} title="Peso na mochila da partida / capacidade (Força do grupo)">
            Mochila {situacao.mochila.peso}/{situacao.mochila.capacidade}
          </span>
        )}
      </div>
    </div>
  )
}

// Contagens e avisos logo abaixo do HUD, no meio: retorno (Q), fuga (F), Líder caído e as mensagens curtas
// (crítico, nível, desmaio, perdido, "não pode pausar"...). Não pegam o clique: o jogo continua embaixo.
export function AvisosDaPartida({ situacao, mensagens }) {
  return (
    <div className="avisos-da-partida" style={{ top: emCqw(faixas.hud + 10) }} aria-live="polite">
      {situacao?.boss && (
        <div className="barra-do-boss" role="status" aria-label={`${situacao.boss.nome}: ${situacao.boss.vida} de vida`}>
          <span>{situacao.boss.nome}</span>
          <div className="barra-do-boss-fundo">
            <div className="barra-do-boss-vida" style={{ width: `${(100 * situacao.boss.vida) / situacao.boss.vidaMaxima}%` }} />
          </div>
        </div>
      )}
      {situacao?.fuga && <div className="faixa-da-partida faixa-fuga">Fugindo com a Pedra de Retorno em {situacao.fuga.segundos} s</div>}
      {situacao?.retorno && (
        <div className={`faixa-da-partida${situacao.retorno.interrompido ? ' faixa-alerta' : ''}`}>
          {situacao.retorno.interrompido
            ? `Em combate: o retorno espera (${situacao.retorno.segundos} s)`
            : `Voltando ao Reino em ${situacao.retorno.segundos} s`}{' '}
          · Q cancela
        </div>
      )}
      {situacao?.itemPerto && (
        <div className={`faixa-da-partida${situacao.itemPerto.cabe ? '' : ' faixa-alerta'}`}>
          {situacao.itemPerto.cabe
            ? `E: pegar ${situacao.itemPerto.nome}${situacao.itemPerto.quantidade > 1 ? ` ×${situacao.itemPerto.quantidade}` : ''}`
            : `Mochila cheia: não cabe ${situacao.itemPerto.nome}`}
        </div>
      )}
      {situacao?.caido && (
        <div className="faixa-da-partida faixa-alerta">O Líder desmaiou: {situacao.segundosParaLevantar} s para ser levantado</div>
      )}
      {mensagens.map((mensagem) => (
        <div key={mensagem.id} className={`mensagem-da-partida mensagem-${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      ))}
    </div>
  )
}

function Numero({ nome, valor }) {
  return (
    <span className="hud-numero">
      <span className="hud-rotulo">{nome}</span> <strong>{valor}</strong>
    </span>
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

// Aliado em duas linhas: cor, nome e estado em cima; a IA e a vida embaixo
function Aliado({ aliado }) {
  const estado = aliado.caido ? `caído: ${aliado.segundosParaLevantar} s` : aliado.fragil ? 'frágil' : null
  return (
    <span className={`hud-aliado${aliado.caido ? ' hud-aliado-caido' : ''}`}>
      <span className="hud-cor" style={{ background: corDaClasseCss(aliado.classe) }} />
      <span className="hud-aliado-texto">
        <span>
          {nomeDaClasse(aliado.classe)}
          {estado && <span className="hud-estado"> {estado}</span>}
        </span>
        <span className="hud-aliado-baixo">
          {aliado.ia && <span className="hud-ia">IA {nomeDoNivelDaIA(aliado.ia)}</span>}
          {!aliado.caido && <Barra fracao={aliado.vida / aliado.vidaMaxima} />}
        </span>
      </span>
    </span>
  )
}
