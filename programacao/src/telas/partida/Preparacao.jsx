import { useState } from 'react'
import Area from '../../componentes/Area.jsx'
import Botao from '../../componentes/Botao.jsx'
import Icone from '../../componentes/Icone.jsx'
import Tela from '../../componentes/Tela.jsx'
import { pedirTelaCheia } from '../../componentes/telaCheia.js'
import Barra from '../../componentes/ui/Barra.jsx'
import BotaoDeAcao from '../../componentes/ui/BotaoDeAcao.jsx'
import GradeDeItens from '../../componentes/ui/GradeDeItens.jsx'
import Painel from '../../componentes/ui/Painel.jsx'
import Simbolo from '../../componentes/ui/Simbolo.jsx'
import { retratoDaClasse } from '../../dados/arte.js'
import { biomas, pontosDePartida } from '../../dados/biomas.js'
import { acoes as acoesDaInterface, arteDaAcao } from '../../dados/interface.js'
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
            <Icone nome={retratoDaClasse(p.classe)} />
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
      {/* Verbo e resultado (ajustes de 14/10): para onde vai e com quem; sem Líder, o motivo */}
      <Area em={pos.comecarPartida} className="comecar-partida">
        <BotaoDeAcao acao="jogar" grande desativado={!temLider} motivo="Escolha um Líder primeiro" onClick={() => {
            pedirTelaCheia(estado.preferencias.telaCheia)
            acoes.comecarPartida()
          }}>
          Começar partida
        </BotaoDeAcao>
        {temLider && (
          <span className="nota">
            {biomas.find((b) => b.id === estado.escolhasDaPartida.bioma)?.nome ?? 'Bioma'} ·{' '}
            {pontosDePartida.find((p) => p.id === estado.escolhasDaPartida.pontoPartida)?.nome ?? 'Início do bioma'} · Líder: {nomeDaClasse(lider)}
          </span>
        )}
      </Area>
      <Botao em={pos.voltarAoReino} onClick={() => acoes.irPara('reino')}>
        Voltar ao Reino
      </Botao>
      <Botao em={pos.voltarAoMapa} onClick={() => acoes.irPara('mapa')}>
        Voltar ao Mapa
      </Botao>
    </Tela>
  )
}

// Mochila da partida (TASK-073, RF33; Fase 4.5): duas grades lado a lado, com uma seta: à esquerda o que dá para levar da
// Mochila do Reino (só poções e aceleradores, o que se usa na partida), à direita o que vai. Clicar à esquerda leva 1;
// clicar à direita devolve 1. A barra mostra o peso até a capacidade (a Força de todo o grupo); o motivo aparece quando
// algo não cabe.
function MochilaDaPartida() {
  const { estado, acoes } = useJogo()
  const { progresso } = estado
  const levar = estado.escolhasDaPartida.levar ?? {}
  const capacidade = capacidadeDaPartida(progresso, progresso.lider)
  const [motivo, setMotivo] = useState(null)
  const usaveis = progresso.mochila.filter((item) => usavelNaPartida(itemDoCatalogo(item.id)))
  const peso = pesoDeLevar(levar)
  const indo = Object.entries(levar).filter(([, quantidade]) => quantidade > 0)

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
      <Barra fracao={peso / Math.max(1, capacidade)} texto={`Peso ${peso} de ${capacidade}`} alerta={peso >= capacidade} rotulo="Peso da mochila da partida" />
      <p className="nota">A capacidade vem da Força de quem vai; o que for coletado na partida também ocupa. Na partida, Tab abre a mochila.</p>
      <div className="duas-grades">
        <Painel titulo="Mochila do Reino" className="grade-da-preparacao">
          <GradeDeItens
            comFiltros={false}
            tamanho="medio"
            rotulo="O que dá para levar"
            itens={usaveis.map((item) => {
              const sobra = item.quantidade - (levar[item.id] ?? 0)
              return { id: item.id, rotulo: `tem ${sobra}`, apagado: sobra === 0, titulo: `${itemDoCatalogo(item.id).nome}: tem ${sobra} (clique para levar 1)` }
            })}
            aoEscolher={mais}
            vazio="Nenhuma poção nem acelerador na Mochila. Dá para comprar no Mercado."
          />
        </Painel>
        <Simbolo simbolo={acoesDaInterface.levar.simbolo} cor={acoesDaInterface.levar.cor} arte={arteDaAcao('levar')} grande />
        <Painel titulo="Vai na partida" className="grade-da-preparacao">
          <GradeDeItens
            comFiltros={false}
            tamanho="medio"
            rotulo="O que vai na partida"
            itens={indo.map(([id, quantidade]) => ({ id, rotulo: `leva ${quantidade}`, titulo: `${itemDoCatalogo(id)?.nome ?? id}: levando ${quantidade} (clique para devolver 1)` }))}
            aoEscolher={menos}
            vazio="Nada ainda: clique num item à esquerda para levar."
          />
        </Painel>
      </div>
      <p className="nota">Os itens só saem da Mochila do Reino no fim da partida, e só o que foi usado.</p>
      {motivo && (
        <p className="mensagem-do-reino mensagem-do-reino-erro" role="status">
          {motivo}
        </p>
      )}
    </div>
  )
}
