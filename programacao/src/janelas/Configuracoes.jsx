import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { pedirTelaCheia, sairDaTelaCheia, telaCheiaSuportada } from '../componentes/telaCheia.js'
import { useReduzirMovimento } from '../componentes/cenario/useReduzirMovimento.js'
import { telas } from '../dados/telas.js'
import { useJogo } from '../estado/contexto.js'

// Configurações (RF18). Música, som e mudo só mudam o botão por enquanto (ainda não há som); o tema já troca o cinza
// das telas e janelas. Todos ficam salvos no navegador e valem antes do login. O mudo também liga e desliga com M.
export default function Configuracoes() {
  const { estado, acoes } = useJogo()
  const { tipoJogador, preferencias, conta, nuvem } = estado
  const naPartida = telas[estado.tela].naPartida
  const reduzirMovimento = useReduzirMovimento()

  return (
    <Janela titulo="Configurações">
      <h3>Conta</h3>
      {/* Na partida, sem opções de conta: não há atalho para sair dela */}
      {naPartida && <p>As opções de conta não aparecem durante a partida.</p>}
      {!naPartida && tipoJogador === 'nenhum' && <p>Você ainda não entrou no jogo.</p>}
      {!naPartida && tipoJogador === 'convidado' && (
        <>
          <p>Jogando como convidado. O progresso fica salvo só neste navegador.</p>
          <div className="linha">
            <Botao onClick={() => acoes.irPara('criarConta')}>Criar conta</Botao>
            <Botao onClick={acoes.sair}>Sair do jogo</Botao>
          </div>
        </>
      )}
      {!naPartida && tipoJogador === 'conta' && (
        <>
          <p>
            Conta: <strong>{conta?.apelido ?? 'de teste'}</strong>
            {conta?.email ? ` (${conta.email})` : ''}. O progresso fica salvo na nuvem.
          </p>
          {/* Sem internet, o jogo segue e o progresso espera neste navegador (RNF09) */}
          {nuvem?.situacao === 'pendente' && <p className="mensagem-da-guilda-erro">{nuvem.mensagem}</p>}
          <Botao onClick={acoes.sair}>Sair da conta</Botao>
        </>
      )}

      <h3>Som</h3>
      <div className="linha">
        <Botao selecionado={preferencias.musica} onClick={() => acoes.alternarPreferencia('musica')}>
          Música: {preferencias.musica ? 'ligada' : 'desligada'}
        </Botao>
        <Botao selecionado={preferencias.som} onClick={() => acoes.alternarPreferencia('som')}>
          Som: {preferencias.som ? 'ligado' : 'desligado'}
        </Botao>
      </div>
      <Botao selecionado={preferencias.mudo} onClick={() => acoes.alternarPreferencia('mudo')}>
        Mudo (tecla M): {preferencias.mudo ? 'sim' : 'não'}
      </Botao>

      <h3>Tela</h3>
      <div className="linha">
        <Botao onClick={() => acoes.alternarPreferencia('tema')}>Tema: {preferencias.tema}</Botao>
        {/* Ajustes de 14/10: liga e desliga a tela cheia dos botões principais; desligar também sai dela agora */}
        {telaCheiaSuportada() && (
          <Botao
            selecionado={preferencias.telaCheia}
            onClick={() => {
              if (preferencias.telaCheia) sairDaTelaCheia()
              else pedirTelaCheia(true)
              acoes.alternarPreferencia('telaCheia')
            }}
          >
            Tela cheia: {preferencias.telaCheia ? 'ligada' : 'desligada'}
          </Botao>
        )}
      </div>
      {/* 20/10: as nuvens, bandeiras, fumaça e água do Reino e do Mapa */}
      <Botao selecionado={preferencias.animacoesDoCenario} onClick={() => acoes.alternarPreferencia('animacoesDoCenario')}>
        Animações do cenário: {preferencias.animacoesDoCenario ? 'ligadas' : 'desligadas'}
      </Botao>
      {reduzirMovimento && preferencias.animacoesDoCenario && <p className="dica-das-configuracoes">O computador pede menos movimento: o cenário fica parado.</p>}

      <Botao onClick={acoes.fecharJanela}>Fechar</Botao>
    </Janela>
  )
}
