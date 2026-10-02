# Requisitos

## Requisitos funcionais

A última coluna mostra de quais casos de uso cada requisito vem.

| Código | Requisito | Casos de uso |
|---|---|---|
| RF01 | Modo convidado: jogar sem cadastro. Todo o progresso fica só no navegador e nada vai para o banco. O convidado não aparece no ranking, e o jogo permite uma única aba aberta por navegador. | UC01 |
| RF02 | Cadastro com e-mail real, senha e apelido único (o nome público do jogador). O sistema envia um e-mail de confirmação e só deixa jogar com a conta depois que o e-mail é confirmado. | UC02 |
| RF03 | Conta criada a partir do modo convidado: no primeiro login, todo o progresso do convidado guardado naquele navegador é transferido para a conta e salvo no Supabase. Entrar em uma conta que já existia não mistura o progresso do convidado. | UC03 |
| RF04 | Login com e-mail e senha. Se o e-mail ainda não foi confirmado, o sistema avisa e permite reenviar o link de confirmação. | UC04 |
| RF05 | Sessão única: cada conta só pode ter uma sessão ativa (uma máquina e uma aba). O jogo envia um heartbeat a cada 1 minuto, e a sessão expira depois de 3 heartbeats sem resposta (cerca de 3 minutos). Quem tenta entrar numa conta ocupada vê o aviso "conta em uso", inclusive no mesmo computador, até a sessão anterior expirar. | UC04, UC05 |
| RF06 | Recuperação de senha por link enviado ao e-mail da conta. | UC06 |
| RF07 | Primeiro acesso (convidado novo ou conta nova sem progresso de convidado): exibir a narrativa inicial e a escolha da classe inicial entre as 5 classes, com o pentágono de atributos. A classe escolhida cria o primeiro personagem, é permanente e é o primeiro Líder. | UC07 |
| RF08 | Encerrar sessão: salvar o progresso no Supabase e voltar à Tela Inicial. | UC08 |
| RF09 | Salvamento local: o estado do jogo é gravado no navegador (localStorage) a cada 3 minutos e em cada momento de salvamento. | UC09 |
| RF10 | Salvamento no banco (só contas): o progresso é enviado ao Supabase ao começar uma partida, ao encerrar uma partida, ao encerrar a sessão e na transferência do convidado. Cada envio leva a versão do estado, e uma versão antiga nunca sobrescreve uma mais nova. | UC03, UC08, UC09, UC26 |
| RF11 | Recuperação no login: se o navegador tiver progresso com a mesma versão que está no banco, ele é recuperado. Se esse progresso tiver uma partida não terminada, ela é apagada antes. | UC04, UC09 |
| RF12 | Partida interrompida (navegador fechado, queda de internet, bateria): a partida é descartada e tudo volta ao estado do início dela. Ela não gera ganhos, taxa nem registro no histórico, e não gasta partida de contrato. | UC09, UC41 |
| RF13 | Tela Inicial com nome do jogo, apresentação, instruções (Como jogar), Iniciar jogo, Ranking e Configurações. | UC10 |
| RF14 | Os botões de Ranking e Configurações aparecem em quase todas as telas (Tela Inicial, acesso e Reino). Na partida aparece só o de Configurações. | UC11, UC14 |
| RF15 | Ranking público, visível sem login, com as abas Melhores pontuações (a melhor partida de cada jogador), Nível total (soma dos níveis dos personagens permanentes), Por classe (nível do personagem daquela classe, com desempate por XP), Ouro, Monstros derrotados e Maior duração (tempo ativo). Só jogadores com conta aparecem. | UC11 |
| RF16 | Histórico "Minhas partidas" dentro do Ranking, visível só para o próprio jogador logado: todas as partidas, 20 por página, com data, bioma, resultado, tempo ativo, pontuação e ouro. | UC12 |
| RF17 | Conquistas com progresso e marcação de concluídas. Algumas dão recompensa. | UC13 |
| RF18 | Configurações: música e efeitos sonoros (liga/desliga), tema claro ou escuro da interface, Criar conta (para o convidado) e Sair da conta. Som e tema ficam guardados no navegador e funcionam antes do login. Na partida, as Configurações abrem por cima sem pausar, e a tecla M muta o jogo a qualquer momento. | UC14 |
| RF19 | O Reino é o hub do jogo, com Guilda, Mercado, Forja, Mochila, Árvores de Habilidades, Jogar, Ranking e Configurações, e um HUD com apelido, Líder, ouro e missão ativa. | UC15, UC16, UC17, UC19, UC21, UC25 |
| RF20 | Mochila do Reino praticamente ilimitada. Cada item mostra função, descrição e peso, e pode ser descartado. | UC15 |
| RF21 | Mercado com NPCs: comprar, vender e trocar item por item, com ofertas fixas e rotativas (poções, aceleradores, partes de monstros e utilitários). Não existe troca entre jogadores. | UC16 |
| RF22 | Forja: único lugar para equipar e para comprar e vender equipamentos. As armaduras (capacete, peitoral, calças, botas e manoplas) servem para várias classes; armas e escudos são específicos de cada classe. Equipamentos têm raridade e bônus. | UC17 |
| RF23 | Fabricação de equipamento por receita, que exige os materiais e o ouro indicados. | UC18 |
| RF24 | Árvores de Habilidades: distribuir pontos de atributo, com o pentágono atualizado. Cada classe tem 10 habilidades, cada uma do nível 1 ao 5. A primeira é gratuita, a próxima de um ramo libera quando a anterior chega ao nível 5, e os ramos não são exclusivos. Cada personagem tem até 3 habilidades ativas; as passivas ficam sempre ligadas. | UC19 |
| RF25 | Redefinir os pontos de atributo usando o pergaminho comprado no Mercado. Habilidades não são redefinidas. | UC20 |
| RF26 | Missões: uma ativa por vez, dos tipos matar, coletar, entregar e explorar. O progresso só conta depois de aceitar e soma entre partidas. Coletar conta ao pegar o item; explorar exige visitar o local depois de aceitar. | UC21, UC22 |
| RF27 | Entrega na Guilda: a recompensa (ouro e XP) só é recebida ao entregar. Missão de entrega exige possuir os itens naquele momento e os consome, então vender itens antes pode deixar a missão incompleta de novo. | UC23 |
| RF28 | Abandono de missão com multa de 10% do ouro da recompensa. Se o ouro não for suficiente, ele fica em zero. | UC24 |
| RF29 | Contratos só de classes que o jogador ainda não possui. Temporário: custa ouro, dura N partidas, tem nível e equipamento fixos, não evolui, não recebe XP e não pode ser Líder. Permanente: custa ouro e cria um personagem no nível 1 que evolui normalmente. Ao contratar o permanente de uma classe, o temporário da mesma classe vai embora. | UC25 |
| RF30 | Mapa em ovo com o Planalto no centro (Reino, Fazendas, Minas e Lagos) e quatro biomas separados (Floresta, Deserto, Tundra e Vulcânico). Não existe passagem nem interação entre biomas. | UC26, UC27 |
| RF31 | Cada bioma tem regiões fácil, média e difícil e domínios de Boss (muito difícil), com mobs, drops e recursos próprios. O mapa descoberto fica salvo; mobs, Bosses e recursos voltam a cada partida. | UC27, UC35 |
| RF32 | Ponto de partida: entre as regiões já descobertas, o jogador escolhe onde nascer (Fácil, Média, Difícil ou Muito difícil, que é a entrada do domínio do Boss), no início da região e sem mobs por perto. Sem outras regiões descobertas, ele nasce no ponto inicial (zona segura perto do Reino). | UC28 |
| RF33 | Preparação: escolher o Líder entre os personagens permanentes e montar a mochila da partida, cuja capacidade depende da Força do grupo, é calculada ao começar e não muda. Voltar antes de "Começar partida" não conta como partida. | UC29, UC30 |
| RF34 | A partida começa no botão "Começar partida" (que salva o progresso) e termina no resumo. Todos os personagens possuídos e contratados vão juntos. Entrar e sair logo em seguida também conta como partida. | UC26, UC31 |
| RF35 | Controles: WASD movem o Líder; o mouse mira e ataca; 1, 2 e 3 usam as habilidades ativas; Espaço esquiva; E interage; Tab abre a Mochila; Q volta ao Reino; F foge; Esc fecha a janela aberta ou pausa; M muta. | UC31 |
| RF36 | Combate 2D visto de cima, em tempo real, com esquiva sem custo de mana e com recarga, e knockback com breve imunidade ao receber dano. Mobs hostis perseguem quem entra no raio de detecção e desistem quando o jogador sai do território deles; mobs não hostis só reagem se forem atacados. O jogador nunca é obrigado a lutar. | UC32 |
| RF37 | Definição de "em combate": o grupo está em combate se algum personagem causou ou recebeu dano nos últimos 5 segundos ou se algum mob hostil está perseguindo o grupo. | UC32, UC38, UC39 |
| RF38 | Habilidades ativas têm custo de mana e recarga. A mana se regenera sozinha (a Sabedoria define a velocidade); a vida não se regenera sozinha. | UC33 |
| RF39 | Bosses: dentro do domínio do Boss, as taxas recebem os pontos de Boss, mesmo que ele não esteja atacando. Bosses têm pequena chance de deixar um equipamento especial. | UC34 |
| RF40 | Exploração: o minimapa começa escuro, é revelado ao explorar e mostra a dificuldade das regiões; a primeira descoberta de uma área dá XP. Itens coletados vão para a mochila da partida, e os que passam da capacidade caem no chão por um tempo. | UC35 |
| RF41 | Usar item: Tab abre a Mochila sem pausar; E usa o item no Líder e R usa em um aliado. Poção não levanta personagem desmaiado. | UC36 |
| RF42 | IA dos aliados: eles ficam sempre em volta do Líder. O Tanque atrai os inimigos, o Guerreiro ataca o mais próximo, o Arqueiro mantém distância, o Mago ataca em área e o Sacerdote cura e levanta os caídos, com prioridade para o Líder. | UC31, UC37 |
| RF43 | Desmaio: o personagem sem vida desmaia e tem 30 segundos para ser levantado, pela Ressurreição do Sacerdote (vida cheia, fortalecimento curto e breve imunidade) ou pela ajuda de 5 segundos de um aliado com a área limpa (cerca de 10% da vida e fragilidade temporária). Se não for levantado, a Pedra de Retorno o leva ao Reino e ele passa a ser um perdido. | UC37 |
| RF44 | Pausa com Esc só fora de combate. Em combate aparece "Você não pode pausar agora". O menu de pausa tem Continuar, Configurações, Como jogar e Voltar ao Reino. | UC38 |
| RF45 | Retorno normal com Q ou pelo menu de pausa: só começa fora de combate e dura 15 segundos. Se o grupo entrar em combate, a contagem volta a 15 s e só corre fora de combate. Apertar Q de novo cancela. | UC39 |
| RF46 | Fuga com F: mostra o custo atual, e um segundo F confirma (Esc ou fechar a janela cancela). A contagem de 5 segundos funciona em combate e leva o grupo inteiro ao Reino. Se todos desmaiarem antes do fim da contagem, vale a Derrota; se só o Líder cair, a fuga continua. | UC40 |
| RF47 | Resultados da partida: Grande Vitória (retorno normal, nenhum desmaio na partida e pontuação acima do mínimo); Vitória (retorno normal nas demais situações); Retorno forçado, em amarelo e com o motivo (fuga ou Líder não levantado em 30 segundos); Derrota (todos desmaiaram, inclusive com um personagem só, com cutscene). | UC41 |
| RF48 | Taxa final, só sobre o ouro ganho na partida, calculada pela situação final. Cada perdido paga pela distância em linha reta entre o ponto inicial do bioma e o lugar onde caiu, com valor truncado por personagem. Fuga e todos desmaiam têm taxa única, pela posição do Líder, e substituem as taxas individuais. No domínio de Boss somam-se +2 p.p. por perdido, +7 na fuga e +15 em todos desmaiam. Quem estiver desmaiado no fim conta como perdido. | UC41 |
| RF49 | Pontuação: base = monstros derrotados + ouro ganho + recursos coletados + bônus de Boss + tempo ativo. Pontuação final = base × (1 − taxa). A Grande Vitória soma +10% na pontuação e no ouro. | UC41 |
| RF50 | XP: o XP de cada monstro e da exploração é dividido igualmente entre os personagens permanentes do grupo que não estão desmaiados nem perdidos naquele momento; o contratado temporário não recebe. O XP de missão e de minijogo é dividido entre todos os personagens permanentes. XP e itens coletados são mantidos em todos os resultados. | UC23, UC32, UC35, UC41, UC43 |
| RF51 | Resumo da partida com resultado, motivo, ouro ganho, taxa, ouro recebido, XP, pontuação, monstros, itens, tempo total e tempo ativo, e os botões Jogar novamente (volta ao mapa sem recarregar a página) e Voltar ao Reino. | UC42 |
| RF52 | Ao fim da partida, a vida e a mana de todos os personagens voltam ao máximo e cada contrato temporário perde uma partida. | UC41 |
| RF53 | HUD da partida: vida e mana do grupo, habilidades e recargas, minimapa, região atual, tempo de partida, pontuação atual, ouro ganho, custo atual da fuga e mensagens de feedback (dano, crítico, nível, missão, desmaio). | UC31 |
| RF54 | Minijogos do Planalto (Fazenda, Mina e Lago), acessados pelo mapa: dão recursos próprios e XP. Não são partida, não têm taxa e não entram no ranking. | UC43 |
| RF55 | Progressão: cada personagem tem nível próprio, até o 100, e cada nível exige mais XP que o anterior. Ao subir de nível, o personagem recebe pontos de atributo e de habilidade. | UC19, UC32 |

## Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | Interface em React (disciplina de Desenvolvimento Web 2). A camada de jogo pode usar Canvas (Phaser, PixiJS ou similar) só se for simples de integrar. |
| RNF02 | Autenticação e banco no Supabase, com políticas RLS: cada conta só lê e altera os próprios dados; o ranking tem leitura pública apenas de apelido e números. |
| RNF03 | Somente computador (desktop), com teclado e mouse. A interface se adapta a resoluções de computador a partir de 1366×768. Não há versão mobile. |
| RNF04 | Estilo pixel art em telas, menus e gameplay. Textos e botões são componentes React por cima das imagens, nunca texto desenhado dentro da imagem. |
| RNF05 | Para não sobrecarregar o banco, o Supabase recebe dados só nos momentos de salvamento, nunca a cada ação; o navegador guarda o estado a cada 3 minutos. |
| RNF06 | Controle de versão do estado: um salvamento antigo nunca sobrescreve um mais novo, o que impede voltar o progresso com um save velho. |
| RNF07 | Senhas tratadas só pelo Supabase Auth; o navegador não guarda senha. |
| RNF08 | Desempenho: meta de 60 quadros por segundo em um computador comum. |
| RNF09 | Usabilidade: feedback visual claro (pontuação, vida, tempo e mensagens), interface em português e mensagens de erro que dizem o que aconteceu e como resolver. |
| RNF10 | Acessibilidade básica: foco visível ao navegar pelo teclado e contraste adequado nos temas claro e escuro. |
| RNF11 | Compatível com as versões atuais de Chrome, Edge e Firefox. |
| RNF12 | Código versionado no GitHub e atividades registradas no Trello, com Kanban. |
| RNF13 | Boas práticas de código: componentes pequenos e regras do jogo (taxa, pontuação, XP e combate) em módulos separados da interface. |
| RNF14 | Limitação conhecida: o estado do jogo é calculado no navegador, então esta versão não tem proteção contra trapaça por edição do armazenamento local. |
