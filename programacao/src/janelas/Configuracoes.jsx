import Botao from '../componentes/Botao.jsx'
import Janela from '../componentes/Janela.jsx'
import { telas } from '../dados/telas.js'
import { useJogo } from '../estado/contexto.js'

// Configurações (RF18). Música e som só mudam o botão por enquanto; o tema já troca o cinza
// das telas e janelas. As três ficam salvas no navegador e valem antes do login.
export default function Configuracoes() {
  const { estado, acoes } = useJogo()
  const { tipoJogador, preferencias } = estado
  const naPartida = telas[estado.tela].naPartida

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
          <p>Jogando com conta de teste. Por enquanto, nada da conta é salvo.</p>
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

      <h3>Tema</h3>
      <Botao onClick={() => acoes.alternarPreferencia('tema')}>Tema: {preferencias.tema}</Botao>

      <Botao onClick={acoes.fecharJanela}>Fechar</Botao>
    </Janela>
  )
}
