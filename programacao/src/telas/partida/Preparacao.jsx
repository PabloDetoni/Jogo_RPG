import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Tela from '../../componentes/Tela.jsx'
import { nomeDaClasse } from '../../dados/classes.js'
import { itemDoCatalogo, usavelNaPartida } from '../../dados/itens.js'
import { posicoes } from '../../dados/posicoes.js'
import { useJogo } from '../../estado/contexto.js'
import { capacidadeDaPartida } from '../../regras/grupoDaPartida.js'
import { levarNaPartida, pesoDeLevar } from '../../regras/mochila.js'

const pos = posicoes.preparacao

// Escolher o Líder (só permanentes) e a mochila da partida (RF33).
// Voltar daqui não conta como partida: ao Mapa para trocar de bioma, ou ao Reino para desistir.
// (O "Voltar ao Mapa" é decisão de 04/10/2026; o diagrama de Partida só tem "Voltar ao Reino".)
export default function Preparacao() {
  const { estado, acoes } = useJogo()
  const { personagens: permanentes, lider, contratosTemporarios } = estado.progresso
  const temLider = permanentes.some((p) => p.classe === lider)

  return (
    <Tela>
      <Area em={pos.tituloLider}>Escolha o Líder</Area>
      <Area em={pos.lideres} className="lista">
        {permanentes.map((p) => (
          <Botao key={p.classe} selecionado={lider === p.classe} onClick={() => acoes.escolherLider(p.classe)}>
            {nomeDaClasse(p.classe)}
          </Botao>
        ))}
        {permanentes.length === 0 && 'Nenhum personagem permanente.'}
        {/* O temporário vai junto, mas nunca pode ser Líder (RF29) */}
        {contratosTemporarios.length > 0 && (
          <p className="nota temporarios-da-preparacao">
            Também vão:{' '}
            {contratosTemporarios
              .map((contrato) => `${nomeDaClasse(contrato.classe)} (temporário, ${contrato.partidasRestantes} ${contrato.partidasRestantes === 1 ? 'partida' : 'partidas'})`)
              .join(', ')}
          </p>
        )}
      </Area>
      <Area em={pos.mochila}>
        <MochilaDaPartida />
      </Area>
      <Botao em={pos.comecarPartida} desativado={!temLider} onClick={acoes.comecarPartida}>
        Começar partida
      </Botao>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}

// Mochila da partida (TASK-073, RF33): o que vai junto da Mochila do Reino, até a capacidade (a Força de todo o grupo).
// Só poções e aceleradores (o que se usa na partida com Tab, E e R). O motivo aparece quando algo não cabe.
function MochilaDaPartida() {
  const { estado, acoes } = useJogo()
  const { progresso } = estado
  const levar = estado.escolhasDaPartida.levar ?? {}
  const capacidade = capacidadeDaPartida(progresso, progresso.lider)
  const [motivo, setMotivo] = useState(null)
  const usaveis = progresso.mochila.filter((item) => usavelNaPartida(itemDoCatalogo(item.id)))

  function mais(id) {
    const resultado = levarNaPartida(levar, progresso.mochila, id, 1, capacidade)
    setMotivo(resultado.ok ? null : resultado.motivo)
    if (resultado.ok) acoes.levarNaPartida(id, 1)
  }
  function menos(id) {
    setMotivo(null)
    acoes.levarNaPartida(id, -1)
  }

  return (
    <div className="mochila-da-preparacao">
      <h2>Mochila da partida</h2>
      <p>
        Peso <strong>{pesoDeLevar(levar)}</strong> de <strong>{capacidade}</strong>
        <span className="nota"> (a capacidade vem da Força de quem vai; o que for coletado também ocupa)</span>
      </p>
      <p className="nota">Só vai o que se usa na partida: poções e aceleradores. Na partida, Tab abre a mochila.</p>
      <ul className="lista-de-contratos">
        {usaveis.map((item) => {
          const dado = itemDoCatalogo(item.id)
          const vai = levar[item.id] ?? 0
          return (
            <li key={item.id}>
              <span>
                {dado.nome} <span className="nota">(tem {item.quantidade}, peso {dado.peso})</span>
              </span>
              <span className="botoes-em-linha">
                <Botao desativado={vai === 0} onClick={() => menos(item.id)}>
                  −
                </Botao>
                <span className="quantidade-que-vai" aria-label={`Levando ${vai}`}>
                  {vai}
                </span>
                <Botao desativado={vai >= item.quantidade} onClick={() => mais(item.id)}>
                  +
                </Botao>
              </span>
            </li>
          )
        })}
        {usaveis.length === 0 && <li className="nota">Nenhuma poção nem acelerador na Mochila. Dá para comprar no Mercado.</li>}
      </ul>
      {motivo && (
        <p className="mensagem-do-reino mensagem-do-reino-erro" role="status">
          {motivo}
        </p>
      )}
    </div>
  )
}
