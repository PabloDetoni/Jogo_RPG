import { useEffect, useState } from 'react'
import Botao from '../../componentes/Botao.jsx'
import { biomas } from '../../dados/biomas.js'
import { classes } from '../../dados/classes.js'
import { partidasPorPaginaNoHistorico } from '../../dados/regras.js'
import { resultados } from '../../dados/resultados.js'
import { useJogo } from '../../estado/contexto.js'
import { totalDePaginas } from '../../regras/contas.js'
import { relogio } from '../partida/formato.js'

// O que cada aba do ranking mostra (RF15). Os números vêm da função ranking do banco (supabase/001_contas.sql).
const colunasDoRanking = {
  melhoresPontuacoes: { valor: 'Melhor pontuação' },
  nivelTotal: { valor: 'Nível total' },
  porClasse: { valor: 'Nível', desempate: 'XP' },
  ouro: { valor: 'Ouro' },
  monstros: { valor: 'Monstros derrotados' },
  maiorDuracao: { valor: 'Tempo ativo', formato: relogio },
}

// Busca no banco quando a tela abre (e quando "chave" muda); "Tentar de novo" busca outra vez.
// Devolve { resposta, tentarDeNovo }; resposta é null enquanto carrega.
function useBusca(buscar, chave) {
  const [tentativa, setTentativa] = useState(0)
  const [lido, setLido] = useState({ chave: null, resposta: null })
  const marca = `${chave}#${tentativa}`
  useEffect(() => {
    let ativo = true
    Promise.resolve(buscar()).then((resposta) => {
      if (ativo) setLido({ chave: marca, resposta })
    })
    return () => {
      ativo = false
    }
    // buscar muda a cada desenho; quem decide quando buscar de novo é a marca
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marca])
  return { resposta: lido.chave === marca ? lido.resposta : null, tentarDeNovo: () => setTentativa((n) => n + 1) }
}

function FalhaAoCarregar({ resposta, tentarDeNovo }) {
  return (
    <div className="lista">
      <p>{resposta.mensagem ?? 'Não deu para carregar agora.'}</p>
      <Botao onClick={tentarDeNovo}>Tentar de novo</Botao>
    </div>
  )
}

// Uma aba do ranking: aberto para todos, até sem login; só contas aparecem; o próprio apelido fica em destaque.
export function RankingDaAba({ aba }) {
  const { estado, acoes } = useJogo()
  const [classe, setClasse] = useState(estado.progresso.lider ?? classes[0].id)
  const porClasse = aba === 'porClasse'
  const { resposta, tentarDeNovo } = useBusca(() => acoes.ranking(aba, porClasse ? classe : null), porClasse ? `${aba}:${classe}` : aba)
  const colunas = colunasDoRanking[aba]
  const formatar = colunas.formato ?? ((valor) => valor)
  const meuApelido = estado.tipoJogador === 'conta' ? estado.conta?.apelido?.toLowerCase() : null

  let corpo
  if (!resposta) corpo = <p>Carregando o ranking...</p>
  else if (!resposta.ok) corpo = <FalhaAoCarregar resposta={resposta} tentarDeNovo={tentarDeNovo} />
  else if (resposta.linhas.length === 0) corpo = <p>Ninguém no ranking ainda. Jogue com uma conta para aparecer aqui.</p>
  else {
    corpo = (
      <div className="tabela-rolavel">
        <table className="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Jogador</th>
              <th>{colunas.valor}</th>
              {colunas.desempate && <th>{colunas.desempate}</th>}
            </tr>
          </thead>
          <tbody>
            {resposta.linhas.map((linha) => (
              <tr key={linha.apelido} className={linha.apelido.toLowerCase() === meuApelido ? 'linha-minha' : undefined}>
                <td>{linha.posicao}º</td>
                <td>{linha.apelido}</td>
                <td>{formatar(linha.valor)}</td>
                {colunas.desempate && <td>{linha.desempate}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="lista">
      {porClasse && (
        <div className="linha">
          {classes.map((opcao) => (
            <Botao key={opcao.id} selecionado={opcao.id === classe} onClick={() => setClasse(opcao.id)}>
              {opcao.nome}
            </Botao>
          ))}
        </div>
      )}
      {corpo}
      {estado.tipoJogador !== 'conta' && <p className="nota">Só jogadores com conta aparecem no ranking.</p>}
    </div>
  )
}

const dataEHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

// Histórico "Minhas partidas" (RF16): só do próprio jogador logado, 20 por página, as mais novas primeiro.
export function HistoricoDePartidas() {
  const { estado, acoes } = useJogo()
  const [pagina, setPagina] = useState(1)
  const { resposta, tentarDeNovo } = useBusca(() => acoes.historico(pagina), String(pagina))
  const naFila = estado.partidasParaRegistrar.length

  let corpo
  if (!resposta) corpo = <p>Carregando o histórico...</p>
  else if (!resposta.ok) corpo = <FalhaAoCarregar resposta={resposta} tentarDeNovo={tentarDeNovo} />
  else if (resposta.total === 0) corpo = <p>Nenhuma partida terminada ainda.</p>
  else {
    const paginas = totalDePaginas(resposta.total, partidasPorPaginaNoHistorico)
    corpo = (
      <>
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Bioma</th>
                <th>Resultado</th>
                <th>Tempo ativo</th>
                <th>Pontuação</th>
                <th>Ouro</th>
              </tr>
            </thead>
            <tbody>
              {resposta.partidas.map((partida) => (
                <tr key={partida.jogada_em}>
                  <td>{dataEHora.format(new Date(partida.jogada_em))}</td>
                  <td>{biomas.find((bioma) => bioma.id === partida.bioma)?.nome ?? partida.bioma}</td>
                  <td>{resultados[partida.resultado]?.nome ?? partida.resultado}</td>
                  <td>{relogio(partida.tempo_ativo)}</td>
                  <td>{partida.pontuacao}</td>
                  <td>{partida.ouro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="linha">
          <Botao onClick={() => setPagina(pagina - 1)} desativado={pagina <= 1}>
            Anterior
          </Botao>
          <span>
            Página {pagina} de {paginas}
          </span>
          <Botao onClick={() => setPagina(pagina + 1)} desativado={pagina >= paginas}>
            Próxima
          </Botao>
        </div>
      </>
    )
  }

  return (
    <div className="lista">
      {corpo}
      {naFila > 0 && (
        <p className="nota">
          {naFila === 1 ? '1 partida ainda está indo' : `${naFila} partidas ainda estão indo`} para a nuvem (sem conexão agora).
        </p>
      )}
    </div>
  )
}
