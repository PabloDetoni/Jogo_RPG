# Histórias de Usuário

Cada história nasce de um caso de uso do diagrama: a HU01 vem do UC01, a HU02 do UC02, e assim por diante. Os critérios de aceite dizem quando a história está pronta e podem virar a checklist do cartão no Trello.

### HU01 · Jogar como convidado (UC01)

Como jogador, quero jogar como convidado para começar na hora, sem precisar criar conta.

Critérios de aceite:
- Na primeira vez, vejo a narrativa e escolho a classe; nas próximas, continuo de onde parei.
- Sou avisado de que, como convidado, não apareço no ranking e perco tudo se limpar o navegador.
- Requisitos atendidos: RF01.

### HU02 · Cadastrar conta (UC02)

Como jogador, quero criar uma conta para que meu progresso fique salvo e eu possa aparecer no ranking.

Critérios de aceite:
- O apelido não pode repetir o de outro jogador.
- Só consigo jogar com a conta depois de confirmar o e-mail.
- Requisitos atendidos: RF02.

### HU03 · Transferir progresso do convidado (UC03)

Como convidado, quero levar todo o meu progresso para a conta que eu criar, para não começar do zero.

Critérios de aceite:
- Personagens, itens, ouro, missões e conquistas do convidado aparecem na conta.
- Se eu entrar numa conta que já existia, o progresso do convidado não é misturado.
- Requisitos atendidos: RF03, RF10.

### HU04 · Autenticar-se (UC04)

Como jogador, quero entrar na minha conta para continuar de onde parei.

Critérios de aceite:
- Credenciais erradas mostram uma mensagem de erro.
- Com e-mail não confirmado, sou avisado e posso reenviar o link.
- Requisitos atendidos: RF04, RF05, RF11.

### HU05 · Notificar conta em uso (UC05)

Como jogador, quero ser avisado quando minha conta já estiver aberta em outro lugar, para entender por que não consigo entrar.

Critérios de aceite:
- O aviso aparece mesmo no mesmo computador, até a sessão anterior expirar (cerca de 3 min).
- Requisitos atendidos: RF05.

### HU06 · Recuperar senha (UC06)

Como jogador, quero recuperar minha senha pelo e-mail para não perder minha conta.

Critérios de aceite:
- O link chega ao e-mail cadastrado e permite criar uma senha nova.
- Requisitos atendidos: RF06.

### HU07 · Escolher classe inicial (UC07)

Como jogador, quero escolher minha classe inicial vendo o pentágono de atributos, para decidir como vou jogar.

Critérios de aceite:
- As 5 classes aparecem com descrição e pentágono.
- A escolha é permanente.
- Requisitos atendidos: RF07.

### HU08 · Encerrar sessão (UC08)

Como jogador, quero sair da conta sabendo que meu progresso foi salvo.

Critérios de aceite:
- Ao sair, o progresso é enviado ao Supabase antes de voltar à Tela Inicial.
- O convidado tem "Sair do jogo", que salva no navegador.
- Sair recarrega a página e volta à Tela Inicial.
- Requisitos atendidos: RF08, RF10.

### HU09 · Salvar progresso (UC09)

Como jogador, quero que meu progresso seja salvo automaticamente para não perder o que conquistei.

Critérios de aceite:
- O navegador guarda o estado a cada 3 minutos, ao escolher a classe inicial e quando a aba é fechada ou escondida.
- Uma versão antiga nunca sobrescreve uma mais nova.
- Requisitos atendidos: RF09, RF10, RF11, RF12.

### HU10 · Consultar instruções do jogo (UC10)

Como jogador, quero ver as instruções na Tela Inicial para aprender os controles antes de jogar.

Critérios de aceite:
- As instruções podem ser abertas sem conta e também pelo menu de pausa.
- Requisitos atendidos: RF13.

### HU11 · Visualizar Ranking (UC11)

Como jogador, quero ver o ranking para comparar meu desempenho com o de outros jogadores.

Critérios de aceite:
- O botão de Ranking abre o Salão da Glória.
- Abas: Melhores pontuações, Nível total, Por classe, Ouro, Monstros e Maior duração.
- Minha linha aparece destacada quando estou logado.
- Requisitos atendidos: RF14, RF15.

### HU12 · Visualizar histórico de partidas (UC12)

Como jogador, quero ver o histórico das minhas partidas para acompanhar minha evolução.

Critérios de aceite:
- O histórico é uma aba do Salão da Glória, e só eu vejo as minhas partidas.
- Cada partida mostra data, bioma, resultado, tempo ativo, pontuação e ouro.
- Requisitos atendidos: RF16.

### HU13 · Visualizar conquistas (UC13)

Como jogador, quero acompanhar minhas conquistas para ter metas extras.

Critérios de aceite:
- As conquistas ficam numa aba do Salão da Glória, para convidado e conta.
- Conquistas concluídas aparecem marcadas.
- Requisitos atendidos: RF17.

### HU14 · Configurar preferências (UC14)

Como jogador, quero controlar som e tema a qualquer momento, inclusive no meio de uma partida.

Critérios de aceite:
- Funciona antes do login.
- Música e Som têm liga/desliga separados.
- Na partida, as Configurações abrem sem pausar, sem as opções de conta, e M muta o jogo (até em combate).
- O mudo não apaga a minha escolha de Música e Som, e o HUD mostra se está mudo.
- Requisitos atendidos: RF14, RF18.

### HU15 · Gerenciar Mochila (UC15)

Como jogador, quero organizar minha mochila para saber o que tenho e quanto pesa.

Critérios de aceite:
- Cada item mostra função, descrição e peso.
- Requisitos atendidos: RF19, RF20.

### HU16 · Negociar no Mercado (UC16)

Como jogador, quero comprar, vender e trocar itens com mercadores para conseguir o que preciso.

Critérios de aceite:
- Ouro e itens são atualizados na hora.
- Há ofertas fixas e rotativas.
- Requisitos atendidos: RF19, RF21.

### HU17 · Gerenciar equipamentos (Forja) (UC17)

Como jogador, quero equipar meus personagens na Forja para deixá-los mais fortes.

Critérios de aceite:
- Armaduras servem para várias classes; armas e escudos, só para a sua classe.
- Requisitos atendidos: RF19, RF22.

### HU18 · Fabricar equipamento (UC18)

Como jogador, quero fabricar equipamentos com os materiais que coletei.

Critérios de aceite:
- A receita mostra o que falta; só fabrica com tudo disponível.
- Requisitos atendidos: RF23.

### HU19 · Gerenciar personagens (Árvores de Habilidades) (UC19)

Como jogador, quero distribuir pontos e evoluir habilidades para personalizar cada personagem.

Critérios de aceite:
- O pentágono muda com os pontos.
- No máximo 3 habilidades ativas por personagem.
- Requisitos atendidos: RF19, RF24, RF55.

### HU20 · Redefinir atributos (UC20)

Como jogador, quero redefinir os atributos de um personagem para corrigir uma distribuição ruim.

Critérios de aceite:
- Consome o pergaminho.
- As habilidades não são redefinidas.
- Requisitos atendidos: RF25.

### HU21 · Gerenciar missões (Guilda) (UC21)

Como jogador, quero acompanhar minha missão na Guilda para saber quanto falta.

Critérios de aceite:
- Só existe uma missão ativa por vez.
- O progresso soma entre partidas.
- Requisitos atendidos: RF19, RF26.

### HU22 · Aceitar missão (UC22)

Como jogador, quero aceitar uma missão para ganhar recompensas extras.

Critérios de aceite:
- O progresso começa a contar a partir do aceite.
- Requisitos atendidos: RF26.

### HU23 · Entregar missão (UC23)

Como jogador, quero entregar a missão na Guilda para receber a recompensa.

Critérios de aceite:
- Só recebo ao entregar.
- Em missão de entrega, preciso ter os itens agora; eles são consumidos.
- Requisitos atendidos: RF27, RF50.

### HU24 · Abandonar missão (UC24)

Como jogador, quero abandonar uma missão que não quero mais.

Critérios de aceite:
- A multa de 10% do ouro da recompensa é mostrada antes de confirmar.
- Requisitos atendidos: RF28.

### HU25 · Contratar personagem (Guilda) (UC25)

Como jogador, quero contratar personagens de classes que não tenho para completar meu grupo.

Critérios de aceite:
- Temporário: nível e equipamento fixos, N partidas, não pode ser Líder.
- Permanente: nível 1, evolui, e encerra o temporário da mesma classe.
- A Guilda mostra o preço, o ouro que tenho e as partidas restantes de cada temporário; sem ouro, diz o motivo.
- Requisitos atendidos: RF19, RF29.

### HU26 · Iniciar partida (UC26)

Como jogador, quero preparar e começar uma partida para explorar um bioma.

Critérios de aceite:
- Da Preparação dá para voltar ao Mapa ou ao Reino.
- Voltar antes de "Começar partida" não gasta partida.
- Ao começar, o progresso é salvo.
- Requisitos atendidos: RF30, RF34, RF10.

### HU27 · Selecionar bioma (UC27)

Como jogador, quero escolher o bioma para decidir onde vou jogar.

Critérios de aceite:
- Os biomas são separados; para trocar antes de começar, volto ao Mapa.
- Requisitos atendidos: RF30, RF31.

### HU28 · Escolher ponto de partida (dificuldade) (UC28)

Como jogador, quero escolher onde nascer para jogar direto na dificuldade que eu quiser.

Critérios de aceite:
- Nasço no início da região, sem mobs por perto.
- A taxa continua medida pela distância desde o ponto inicial do bioma.
- Requisitos atendidos: RF32.

### HU29 · Selecionar Líder (UC29)

Como jogador, quero escolher meu Líder para definir qual personagem vou controlar.

Critérios de aceite:
- Só personagens permanentes podem ser Líder.
- Não dá para trocar durante a partida.
- Requisitos atendidos: RF33.

### HU30 · Preparar mochila da partida (UC30)

Como jogador, quero escolher os itens que vou levar para me preparar para a partida.

Critérios de aceite:
- A capacidade depende da Força do grupo e não muda durante a partida.
- Requisitos atendidos: RF33.

### HU31 · Jogar partida (UC31)

Como jogador, quero controlar o Líder com os aliados me acompanhando para explorar e lutar.

Critérios de aceite:
- O HUD mostra vida, mana, tempo, pontuação e ouro ganho.
- Os aliados ficam sempre em volta do Líder e, parados, não ficam tremendo nem se empurrando.
- A IA dos aliados melhora com o nível de cada um (básica, média e avançada); nenhuma é perfeita, e a de nível alto não é atrapalhada pela de nível baixo (desvia de quem está parado).
- O Sacerdote cura sempre que alguém do grupo, ele mesmo também, não está com a vida cheia: o mais ferido primeiro e, em empate, o Líder.
- Só o Líder esquiva.
- Requisitos atendidos: RF34, RF35, RF36, RF42, RF53.

### HU32 · Combater monstros (UC32)

Como jogador, quero combater em tempo real para derrotar monstros e ganhar XP, ouro e itens.

Critérios de aceite:
- O clique faz o ataque básico da classe do meu Líder, sem gastar mana.
- Durante a esquiva eu não levo dano.
- Posso fugir de mobs; eles desistem quando saio do território deles.
- O XP de cada monstro é dividido entre os permanentes ativos.
- Requisitos atendidos: RF36, RF37, RF50, RF55.

### HU33 · Usar habilidade (UC33)

Como jogador, quero usar minhas habilidades no combate para causar mais dano ou ajudar o grupo.

Critérios de aceite:
- Cada habilidade tem custo de mana e recarga.
- Requisitos atendidos: RF38.

### HU34 · Enfrentar Boss (UC34)

Como jogador, quero enfrentar Bosses para ganhar recompensas raras.

Critérios de aceite:
- Dentro do domínio, os pontos de Boss somam nas taxas.
- O Boss pode deixar um equipamento especial.
- Requisitos atendidos: RF39.

### HU35 · Explorar e coletar recursos (UC35)

Como jogador, quero explorar o bioma e coletar recursos para evoluir e fabricar equipamentos.

Critérios de aceite:
- O minimapa revelado fica salvo.
- Itens além da capacidade caem no chão por um tempo.
- Requisitos atendidos: RF31, RF40, RF50.

### HU36 · Usar item (UC36)

Como jogador, quero usar poções em mim ou em aliados durante a partida.

Critérios de aceite:
- Tab abre a Mochila sem pausar.
- Poção não levanta personagem desmaiado.
- Requisitos atendidos: RF41.

### HU37 · Levantar aliado desmaiado (UC37)

Como jogador, quero levantar aliados desmaiados para não perdê-los nem pagar taxa.

Critérios de aceite:
- Basta ficar parado perto do caído por 5 s, sem tecla, com a área limpa (nenhum inimigo vivo perto dele).
- Se um inimigo chegar perto ou eu sair de perto, a ajuda volta a zero.
- O aliado volta com pouca vida e fica frágil por um tempo.
- Requisitos atendidos: RF42, RF43.

### HU38 · Pausar partida (UC38)

Como jogador, quero pausar o jogo quando estiver seguro para fazer uma pausa ou mexer nas opções.

Critérios de aceite:
- Em combate, aparece "Você não pode pausar agora".
- "Voltar ao Reino" no menu de pausa inicia o retorno de 15 s, sem atalho.
- Requisitos atendidos: RF37, RF44.

### HU39 · Retornar ao Reino (UC39)

Como jogador, quero voltar ao Reino sem custo quando estiver seguro.

Critérios de aceite:
- Se entrar em combate, a contagem volta a 15 s.
- Apertar Q de novo cancela.
- Requisitos atendidos: RF37, RF45.

### HU40 · Fugir com a Pedra de Retorno (UC40)

Como jogador, quero fugir mesmo em combate, sabendo antes quanto vai custar.

Critérios de aceite:
- F mostra o custo e um segundo F confirma; Esc cancela o aviso.
- Confirmada, a fuga não se cancela; se só o Líder cair, ela continua.
- O resultado aparece como Retorno forçado.
- Requisitos atendidos: RF46.

### HU41 · Encerrar partida (UC41)

Como jogador, quero que a partida termine com um resultado claro e justo.

Critérios de aceite:
- Resultados: Grande Vitória, Vitória, Retorno forçado ou Derrota.
- XP e itens coletados são sempre mantidos.
- Quando um personagem sobe de nível, eu vejo na hora; o nível novo vale a partir da próxima partida.
- Requisitos atendidos: RF12, RF47, RF48, RF49, RF50, RF52, RF55.

### HU42 · Visualizar resumo da partida (UC42)

Como jogador, quero ver um resumo ao fim da partida e poder jogar de novo sem recarregar a página.

Critérios de aceite:
- Mostra resultado, motivo, ouro, taxa, XP, pontuação e tempos.
- Tem os botões Jogar novamente e Voltar ao Reino.
- Requisitos atendidos: RF51.

### HU43 · Jogar minijogo do Planalto (UC43)

Como jogador, quero jogar os minijogos do Planalto para conseguir recursos sem combate.

Critérios de aceite:
- Não conta como partida, não tem taxa e não entra no ranking.
- O XP é dividido entre os personagens permanentes.
- Entro pelo Mapa e, ao sair, volto ao Mapa.
- Requisitos atendidos: RF54, RF50.

## Alterações do projeto

Decisões tomadas durante a programação (outubro de 2026). Os critérios acima já estão com o texto novo:

- **HU08:** o convidado também tem "Sair do jogo"; sair recarrega a página.
- **HU09:** o jogo também salva ao escolher a classe inicial e quando a aba fecha ou é escondida.
- **HU11, HU12 e HU13:** Ranking, Histórico e Conquistas ficam no Salão da Glória.
- **HU14:** Música e Som separados; na partida, sem as opções de conta.
- **HU26 e HU27:** da Preparação dá para voltar ao Mapa e trocar de bioma sem passar pelo Reino.
- **HU38:** o "Voltar ao Reino" da pausa passa pelo retorno de 15 s.
- **HU43:** o minijogo volta ao Mapa.
- **HU31:** a IA dos aliados melhora com o nível de cada um; só o Líder esquiva; parados, os aliados não tremem.
- **HU37:** "área limpa" quer dizer nenhum inimigo vivo perto de quem caiu; a ajuda começa sozinha.
- **HU14:** o mudo (tecla M) não apaga a escolha de Música e Som.
- **HU32:** o clique faz o ataque básico da classe, e a esquiva não deixa levar dano (pendente: o grupo confirmar os ataques).
- **HU31:** o Sacerdote cura sempre que alguém não está com a vida cheia; a IA de nível alto não é atrapalhada pela de nível baixo.
- **HU40:** confirmada, a fuga não se cancela.
- **HU41:** o nível ganho na partida vale a partir da partida seguinte.

O motivo de cada mudança está na seção "Alterações do projeto" dos [Requisitos](08_Requisitos.md).
