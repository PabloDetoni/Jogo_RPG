# Descrição dos Casos de Uso

Ator único: **Jogador**. Banco de dados, navegador e IA dos aliados são partes internas do sistema e não aparecem como atores.

Regras de leitura do diagrama: no «include», o caso base **sempre** executa o caso incluído (a seta aponta para o incluído). No «extend», o caso extensor só acontece **quando a condição é verdadeira** (a seta sai da extensão e aponta para o caso base).

## Conta e acesso

| Código | Caso de uso | Tipo | Relacionamentos | Condição | Descrição |
|---|---|---|---|---|---|
| UC01 | Jogar como convidado | Associação | Estendido por UC07 | — | Começa a jogar sem cadastro; o progresso fica só no navegador. |
| UC02 | Cadastrar conta | Associação | Estendido por UC03 | — | Cria a conta com e-mail real, senha e apelido único e recebe o e-mail de confirmação. |
| UC03 | Transferir progresso do convidado | «extend» de UC02 | «include» UC09 | Condição: o cadastro foi feito a partir do modo convidado | No primeiro login da conta nova, todo o progresso do convidado daquele navegador vai para a conta. |
| UC04 | Autenticar-se | Associação | Estendido por UC05, UC06 e UC07 | — | Entra com e-mail e senha; cria a sessão única e carrega o progresso. |
| UC05 | Notificar conta em uso | «extend» de UC04 | — | Condição: a conta já tem uma sessão ativa | Bloqueia o acesso e avisa que a conta está aberta em outra máquina ou aba. |
| UC06 | Recuperar senha | «extend» de UC04 | — | Condição: o jogador esqueceu a senha | Envia um link de recuperação ao e-mail da conta para redefinir a senha. |
| UC07 | Escolher classe inicial | «extend» de UC01 e de UC04 | — | Condição: primeiro acesso (convidado novo ou conta nova sem progresso de convidado) | Mostra a narrativa inicial e as 5 classes; cria o primeiro personagem, que é o primeiro Líder. |
| UC08 | Encerrar sessão | Associação | «include» UC09 | — | Sai da conta (ou, no modo convidado, sai do jogo) salvando o progresso; a página recarrega e volta à Tela Inicial. |

## Compartilhado

| Código | Caso de uso | Tipo | Relacionamentos | Condição | Descrição |
|---|---|---|---|---|---|
| UC09 | Salvar progresso | Incluído por UC03, UC08, UC26 e UC41 | — | — | Grava o estado no navegador e, para contas, envia ao Supabase com controle de versão. |

## Informações e preferências

| Código | Caso de uso | Tipo | Relacionamentos | Condição | Descrição |
|---|---|---|---|---|---|
| UC10 | Consultar instruções do jogo | Associação | — | — | Mostra os controles e as regras básicas (Como jogar). |
| UC11 | Visualizar Ranking | Associação | Estendido por UC12 | — | Abre o Salão da Glória e consulta as abas do ranking, mesmo sem login. |
| UC12 | Visualizar histórico de partidas | «extend» de UC11 | — | Condição: jogador logado com conta | Lista todas as partidas do próprio jogador, 20 por página, numa aba do Salão da Glória. |
| UC13 | Visualizar conquistas | Associação | — | — | Mostra as conquistas, o progresso e as recompensas, numa aba do Salão da Glória. |
| UC14 | Configurar preferências | Associação | — | — | Liga ou desliga Música, Som e o mudo (também pela tecla M), troca o tema e, fora da partida, acessa as opções de conta. |

## Reino

| Código | Caso de uso | Tipo | Relacionamentos | Condição | Descrição |
|---|---|---|---|---|---|
| UC15 | Gerenciar Mochila | Associação | — | — | Vê itens, função, descrição e peso; descarta itens. |
| UC16 | Negociar no Mercado | Associação | — | — | Compra, vende e troca itens com NPCs. |
| UC17 | Gerenciar equipamentos (Forja) | Associação | Estendido por UC18 | — | Equipa os personagens e compra e vende equipamentos. |
| UC18 | Fabricar equipamento | «extend» de UC17 | — | Condição: possuir os materiais e o ouro da receita | Fabrica um equipamento a partir de uma receita. |
| UC19 | Gerenciar personagens (Árvores de Habilidades) | Associação | Estendido por UC20 | — | Distribui atributos, evolui habilidades e escolhe as 3 ativas de cada personagem. |
| UC20 | Redefinir atributos | «extend» de UC19 | — | Condição: possuir o pergaminho de redefinição | Devolve os pontos de atributo de um personagem para redistribuir. |
| UC21 | Gerenciar missões (Guilda) | Associação | Estendido por UC22, UC23 e UC24 | — | Mostra a missão ativa, o progresso e o quadro de missões. |
| UC22 | Aceitar missão | «extend» de UC21 | — | Condição: não há missão ativa | Pega uma missão do quadro. |
| UC23 | Entregar missão | «extend» de UC21 | — | Condição: objetivo cumprido no momento da entrega | Entrega a missão e recebe a recompensa. |
| UC24 | Abandonar missão | «extend» de UC21 | — | Condição: há missão ativa | Cancela a missão pagando a multa. |
| UC25 | Contratar personagem (Guilda) | Associação | — | — | Contrata personagens temporários ou permanentes de classes que ainda não possui. |

## Partida

| Código | Caso de uso | Tipo | Relacionamentos | Condição | Descrição |
|---|---|---|---|---|---|
| UC26 | Iniciar partida | Associação | «include» UC27, UC29 e UC09; estendido por UC28 e UC30 | — | Abre o mapa, passa pela preparação e começa a partida. Da preparação dá para voltar ao Mapa ou ao Reino. |
| UC27 | Selecionar bioma | Incluído por UC26 | — | — | Escolhe Floresta, Deserto, Tundra ou Vulcânico no mapa em ovo. |
| UC28 | Escolher ponto de partida (dificuldade) | «extend» de UC26 | — | Condição: já ter descoberto outras regiões do bioma | Escolhe nascer na região Fácil, Média, Difícil ou Muito difícil. |
| UC29 | Selecionar Líder | Incluído por UC26 | — | — | Escolhe o personagem controlado entre os permanentes. |
| UC30 | Preparar mochila da partida | «extend» de UC26 | — | Condição: o jogador quer levar itens | Leva itens da Mochila do Reino respeitando o limite de peso. |
| UC31 | Jogar partida | Associação | «include» UC41; estendido por UC32 e UC35 a UC40 | — | Estado "jogo em andamento": o jogador controla o Líder e os aliados agem sozinhos, com uma IA que melhora com o nível de cada personagem (básica, média e avançada), sem que um nível atrapalhe o outro. O Sacerdote cura sempre que alguém não está com a vida cheia. Só o Líder esquiva. |
| UC32 | Combater monstros | «extend» de UC31 | Estendido por UC33 e UC34 | Condição: há mob hostil por perto | Luta em tempo real, com esquiva, knockback e breve imunidade. |
| UC33 | Usar habilidade | «extend» de UC32 | — | Condição: mana e recarga disponíveis | Usa uma das 3 habilidades ativas com as teclas 1, 2 e 3. |
| UC34 | Enfrentar Boss | «extend» de UC32 | — | Condição: o grupo está no domínio de um Boss | Luta contra um Boss, com taxas maiores dentro do domínio dele. |
| UC35 | Explorar e coletar recursos | «extend» de UC31 | — | — | Revela o minimapa e coleta materiais e itens. |
| UC36 | Usar item | «extend» de UC31 | — | Condição: há item na mochila da partida | Usa um item em si (E) ou em um aliado (R) pela Mochila. |
| UC37 | Levantar aliado desmaiado | «extend» de UC31 | — | Condição: aliado desmaiado dentro dos 30 s e área limpa (nenhum inimigo vivo perto dele) | Levanta um aliado com a ajuda de 5 segundos: basta ficar parado perto, sem tecla. |
| UC38 | Pausar partida | «extend» de UC31 | — | Condição: o grupo está fora de combate | Pausa o jogo com Esc e abre o menu de pausa. |
| UC39 | Retornar ao Reino | «extend» de UC31 | — | Condição: o grupo está fora de combate | Volta ao Reino sem custo depois de 15 segundos (tecla Q ou menu de pausa). |
| UC40 | Fugir com a Pedra de Retorno | «extend» de UC31 | — | Condição: o jogador confirma a fuga | Foge com o grupo inteiro em 5 segundos, mesmo em combate, pagando a taxa de fuga. Confirmada, não se cancela. |
| UC41 | Encerrar partida | Incluído por UC31 | «include» UC42 e UC09 | — | Define o resultado e calcula taxa, ouro, XP e pontuação. O nível ganho vale a partir da partida seguinte. |
| UC42 | Visualizar resumo da partida | Incluído por UC41 | — | — | Mostra o resumo e permite jogar de novo sem recarregar a página. |
| UC43 | Jogar minijogo do Planalto | Associação | — | — | Joga na Fazenda, na Mina ou no Lago, pelo Mapa, para conseguir recursos e XP; ao sair, volta ao Mapa. |

## Alterações do projeto

Decisões tomadas durante a programação (outubro de 2026). As descrições acima já estão com o texto novo; nenhum caso de uso foi criado ou removido, e os relacionamentos do diagrama não mudaram.

| Caso de uso | O que mudou |
|---|---|
| UC08 | O convidado também encerra a sessão ("Sair do jogo"); sair recarrega a página. |
| UC11, UC12, UC13 | Ranking, Histórico e Conquistas ficam juntos no Salão da Glória. |
| UC14 | "Efeitos" passou a se chamar Som; na partida, as opções de conta não aparecem. |
| UC26 | A preparação permite voltar ao Mapa, além do Reino. |
| UC43 | O minijogo é acessado pelo Mapa e volta ao Mapa. |
| UC31 | Os aliados agem com uma IA que melhora com o nível de cada personagem; só o Líder esquiva. |
| UC37 | "Área limpa" quer dizer nenhum inimigo vivo perto de quem caiu; a ajuda começa sozinha quando alguém fica parado perto. |
| UC14 | O mudo (tecla M) silencia Música e Som sem mudar a escolha de cada um. |
| UC31 | O Sacerdote cura sempre que alguém do grupo não está com a vida cheia (caídos primeiro, depois o mais ferido, em empate o Líder); a IA de nível mais alto desvia de quem está parado e não espera quem errou. |
| UC40 | Confirmada, a fuga não se cancela. |
| UC41 | O nível ganho na partida vale a partir da partida seguinte. |

Os requisitos ligados a cada mudança estão na seção "Alterações do projeto" dos [Requisitos](08_Requisitos.md).
