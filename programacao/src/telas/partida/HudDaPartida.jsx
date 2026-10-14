import Minimapa from './Minimapa.jsx'
import { urlDaArte } from '../../arte/indice.js'
import CorDaClasse from '../../componentes/CorDaClasse.jsx'
import Icone from '../../componentes/Icone.jsx'
import { emCqw, faixaDeBaixo } from '../../dados/arenaDeTeste.js'
import { iconeDaHabilidade, iconeDaPedraDeRetorno, iconeDoItem } from '../../dados/arte.js'
import { nomeDaClasse } from '../../dados/classes.js'
import { nomeDoNivelDaIA } from '../../regras/nivelDaIA.js'
import { relogio } from './formato.js'

// HUD da partida (RF53, TASK-049; React, por cima do Phaser). Ajustes de 14/10: em vez da faixa escura no topo, grupos
// translúcidos sobre o mapa, cada um num canto, com sombra no texto (quem está embaixo continua visível):
// - em cima à esquerda: o Líder (vida e mana) e o grupo (vida, IA, caído com a contagem dos 30 s, frágil, perdidos);
// - em cima no meio: tempo, pontos, ouro, custo da fuga, "em combate", foco e o som;
// - em cima à direita: o minimapa, a região e a mochila (o botão Configurações fica logo acima);
// - embaixo no meio: a barra de ações (clique, esquiva, 1, 2 e 3), com a recarga em volta de cada ícone.
// Recebe a "situação" que o Phaser manda 8 vezes por segundo pela ponte.
export default function HudDaPartida({ situacao, mudo = false, bioma = 'floresta' }) {
  const estilo = { '--barra-de-baixo': emCqw(faixaDeBaixo) }
  if (!situacao) {
    return (
      <div className="hud" style={estilo}>
        <div className="hud-principal hud-grupo-do-canto">Carregando a arena...</div>
      </div>
    )
  }

  return (
    <div className="hud" style={estilo}>
      <div className="hud-principal hud-grupo-do-canto">
        <div className="hud-classe">
          <CorDaClasse classe={situacao.classe} />
          Líder: {nomeDaClasse(situacao.classe)}
        </div>
        <Medidor nome="Vida" fracao={situacao.vida / situacao.vidaMaxima} texto={`${situacao.vida} / ${situacao.vidaMaxima}`} tipo="vida" />
        <Medidor nome="Mana" fracao={situacao.mana / situacao.manaMaxima} texto={`${situacao.mana} / ${situacao.manaMaxima}`} tipo="mana" />
        <div className="hud-grupo">
          <span className="hud-rotulo">Grupo:{situacao.aliados.length === 0 && situacao.perdidos.length === 0 ? ' só o Líder' : ''}</span>
          {situacao.aliados.map((aliado, indice) => (
            <Aliado key={indice} aliado={aliado} />
          ))}
          {situacao.perdidos.map((classe, indice) => (
            <span key={`perdido-${indice}`} className="hud-aliado hud-perdido">
              <CorDaClasse classe={classe} />
              {nomeDaClasse(classe)}: perdido
            </span>
          ))}
        </div>
      </div>

      <div className="hud-numeros hud-grupo-do-canto">
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
          <span className={`hud-selo ${situacao.emCombate ? 'hud-combate' : 'hud-calmo'}`}>{situacao.emCombate ? 'Em combate' : 'Fora de combate'}</span>
          {situacao.emFoco && <span className="hud-selo hud-foco">Foco!</span>}
          <span className={`hud-selo ${mudo ? 'hud-mudo' : 'hud-som'}`} title="M liga e desliga o mudo">
            {mudo ? 'Mudo (M)' : 'Som (M)'}
          </span>
        </div>
      </div>

      {/* O minimapa (parte 3d), a região atual (RF53; no domínio do Boss, em destaque, porque a taxa sobe ali, RF48) e a
          mochila. Uma linha para cada; o texto inteiro da região fica na dica do mouse */}
      <div className={`hud-minimapa hud-grupo-do-canto${situacao.minimapa ? ' hud-minimapa-ativo' : ''}`} aria-label="Minimapa">
        {situacao.minimapa ? <Minimapa bioma={bioma} minimapa={situacao.minimapa} /> : <span>Minimapa</span>}
        <span className={`hud-regiao${situacao.regiao?.dominioDeBoss ? ' hud-regiao-boss' : ''}`} title={`Região: ${situacao.regiao?.nome ?? '—'}`}>
          {situacao.regiao?.nome ?? 'Região: —'}
        </span>
        {situacao.mochila && (
          <span className={`hud-regiao${situacao.mochila.peso >= situacao.mochila.capacidade ? ' hud-mochila-cheia' : ''}`} title="Peso na mochila da partida / capacidade (Força do grupo). Tab abre.">
            Mochila {situacao.mochila.peso}/{situacao.mochila.capacidade}
          </span>
        )}
      </div>

      {/* A barra de ações: cada ícone com a tecla no canto e a recarga em volta (cheia = pronto). Em cima dela, o item perto */}
      <div className="hud-acoes" aria-label="Ações">
        {situacao.itemPerto && (
          <div className={`faixa-da-partida hud-item-perto${situacao.itemPerto.cabe ? '' : ' faixa-alerta'}`}>
            <Icone nome={iconeDoItem(situacao.itemPerto.id)} />
            {situacao.itemPerto.cabe
              ? `E: pegar ${situacao.itemPerto.nome}${situacao.itemPerto.quantidade > 1 ? ` ×${situacao.itemPerto.quantidade}` : ''}`
              : `Mochila cheia: não cabe ${situacao.itemPerto.nome}`}
          </div>
        )}
        <div className="hud-barra-de-acoes">
          <Espaco tecla="Clique" nome={situacao.classe === 'arqueiro' ? 'Arco (segure)' : 'Ataque'} recarga={situacao.recargaDoAtaque} carga={situacao.cargaDoArco ?? null} />
          <Espaco tecla="Espaço" nome="Esquiva" recarga={situacao.recargaDaEsquiva} />
          {situacao.habilidades.map((habilidade, indice) => (
            <Espaco
              key={indice}
              tecla={String(indice + 1)}
              icone={habilidade ? iconeDaHabilidade(habilidade.id) : null}
              nome={habilidade?.nome ?? 'vazio'}
              custo={habilidade?.custo}
              recarga={habilidade ? habilidade.recarga : null}
              semMana={habilidade?.semMana}
            />
          ))}
        </div>
        <p className="hud-teclas">WASD anda · E pega · Tab mochila · Q volta ao Reino · F foge · Esc pausa · M som</p>
      </div>
    </div>
  )
}

// Avisos num lugar fixo (ajustes de 14/10): embaixo dos números, no meio. Primeiro a barra do Boss, depois as contagens
// (fuga, retorno, Líder caído) e no máximo 3 mensagens curtas (crítico, nível, "não pode pausar"...). Não pegam o
// clique: o jogo continua embaixo.
export function AvisosDaPartida({ situacao, mensagens }) {
  return (
    <div className="avisos-da-partida" aria-live="polite">
      {situacao?.boss && (
        <div className="barra-do-boss" role="status" aria-label={`${situacao.boss.nome}: ${situacao.boss.vida} de vida`}>
          <span>{situacao.boss.nome}</span>
          <div className="barra-do-boss-fundo">
            <div className="barra-do-boss-vida" style={{ width: `${(100 * situacao.boss.vida) / situacao.boss.vidaMaxima}%` }} />
          </div>
        </div>
      )}
      {situacao?.fuga && (
        <div className="faixa-da-partida faixa-fuga">
          <Icone nome={iconeDaPedraDeRetorno} />
          Fugindo com a Pedra de Retorno em {situacao.fuga.segundos} s
        </div>
      )}
      {situacao?.retorno && (
        <div className={`faixa-da-partida${situacao.retorno.interrompido ? ' faixa-alerta' : ''}`}>
          <Icone nome={iconeDaPedraDeRetorno} />
          {situacao.retorno.interrompido ? `Em combate: o retorno espera (${situacao.retorno.segundos} s)` : `Voltando ao Reino em ${situacao.retorno.segundos} s`} · Q cancela
        </div>
      )}
      {situacao?.caido && <div className="faixa-da-partida faixa-alerta">O Líder desmaiou: {situacao.segundosParaLevantar} s para ser levantado</div>}
      {mensagens.slice(-3).map((mensagem) => (
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

// Um espaço da barra de ações: o ícone (ou a inicial do nome), a tecla no canto, o custo de mana e a recarga como um anel
// em volta (cheio = pronto). recarga null = vazio. carga: o arco do Arqueiro puxando (de 0 a 1), por dentro do anel.
function Espaco({ tecla, icone, nome, custo, recarga, semMana, carga = null }) {
  const vazio = recarga === null
  const pronto = recarga >= 1
  const classes = ['hud-espaco', vazio && 'hud-espaco-vazio', semMana && 'hud-espaco-sem-mana', pronto && 'hud-espaco-pronto', carga !== null && 'hud-espaco-carregando']
  const fracao = vazio ? 0 : Math.max(0, Math.min(1, recarga))
  return (
    <div className={classes.filter(Boolean).join(' ')} title={nome}>
      <span className="hud-espaco-anel" style={{ '--recarga': fracao, '--carga': carga ?? 0 }}>
        <span className="hud-espaco-icone">{icone && urlDaArte(icone) ? <Icone nome={icone} tamanho="1.7em" /> : <span className="hud-espaco-inicial">{nome.charAt(0)}</span>}</span>
        <span className="hud-tecla">{tecla}</span>
        {custo !== undefined && <span className="hud-custo">{custo}</span>}
      </span>
      <span className="hud-espaco-nome">{nome}</span>
    </div>
  )
}

// Aliado numa linha: cor, nome, IA, vida e o estado (caído com a contagem, frágil)
function Aliado({ aliado }) {
  const estado = aliado.caido ? `caído: ${aliado.segundosParaLevantar} s` : aliado.fragil ? 'frágil' : null
  return (
    <span className={`hud-aliado${aliado.caido ? ' hud-aliado-caido' : ''}`}>
      <CorDaClasse classe={aliado.classe} />
      <span className="hud-aliado-nome">{nomeDaClasse(aliado.classe)}</span>
      {aliado.ia && <span className="hud-ia">IA {nomeDoNivelDaIA(aliado.ia)}</span>}
      {!aliado.caido && <Barra fracao={aliado.vida / aliado.vidaMaxima} />}
      {estado && <span className="hud-estado">{estado}</span>}
    </span>
  )
}
