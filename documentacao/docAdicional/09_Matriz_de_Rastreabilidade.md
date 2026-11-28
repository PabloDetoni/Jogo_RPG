# Matriz de Rastreabilidade

Atualizada em 26/11/2026 (Parte 12), pelo jogo publicado em https://jogo-rpg-six.vercel.app. Liga cada requisito ao caso de uso, à história, ao diagrama de atividades, ao protótipo (print do jogo) e ao teste que o cobre, com a situação real.

Como ler as colunas:

- **Histórias:** a HU de cada caso de uso tem o mesmo número (HU26 vem do UC26), em [07_Historias_de_Usuario.md](07_Historias_de_Usuario.md).
- **Diagramas:** em [../diagramas/](../diagramas/). O 02 (casos de uso) tem todos os casos de uso; os de atividades são o 03 (Acesso), 04 (Partida), 05 (Guilda) e 06 (Caravana).
- **Protótipos:** os prints em [../prototipos/](../prototipos/) (tema claro; o escuro fica em `escuro/`, com o mesmo nome). "(+N)": mais prints do mesmo requisito no [README dos protótipos](../prototipos/README.md).
- **Testes:** os testes automáticos (`npm test`; o nome é o arquivo `src/**/<nome>.test.js`) e os roteiros do navegador (`npm run testar:...`). Os roteiros à mão ficam em [testes/Roteiros.md](../../testes/Roteiros.md) e o registro de cada rodada em [testes/Registro.md](../../testes/Registro.md).

## Requisitos funcionais

| RF | Requisito | Casos de uso | Histórias | Diagrama de atividades | Protótipo | Testes | Situação |
|---|---|---|---|---|---|---|---|
| RF01 | Modo convidado | UC01 | HU01 | Acesso (03) | [UC04_login](../prototipos/UC04_login.png), [UC01_narrativa](../prototipos/UC01_narrativa.png) | contas, salvadorDoConvidado, abaUnica · `conferir:site` | Feito |
| RF02 | Cadastro com e-mail real, senha (pelo menos 8 caracteres) e apelido… | UC02 | HU02 | Acesso (03) | [UC02_criar_conta](../prototipos/UC02_criar_conta.png), [UC02_confirme_o_email](../prototipos/UC02_confirme_o_email.png), [UC04_escolher_apelido](../prototipos/UC04_escolher_apelido.png) | servico, fluxo, contas · `testar:contas` | Feito |
| RF03 | Conta criada a partir do modo convidado (pelas Configurações do… | UC03 | HU03 | Acesso (03) | — | fluxo, contas · `testar:contas` | Feito |
| RF04 | Login com e-mail e senha. Se o e-mail ainda não foi confirmado, o… | UC04 | HU04 | Acesso (03) | [UC04_login](../prototipos/UC04_login.png), [UC02_confirme_o_email](../prototipos/UC02_confirme_o_email.png) | fluxo, servico · `testar:contas` | Feito |
| RF05 | Sessão única | UC04, UC05 | HU04, HU05 | Acesso (03) | — | fluxo · `testar:contas` | Feito |
| RF06 | Recuperação de senha por link enviado ao e-mail da conta. O link abre… | UC06 | HU06 | Acesso (03) | [UC06_esqueci_a_senha](../prototipos/UC06_esqueci_a_senha.png), [UC06_senha_nova](../prototipos/UC06_senha_nova.png) | servico · `testar:contas` | Feito |
| RF07 | Primeiro acesso (convidado novo ou conta nova sem progresso de… | UC07 | HU07 | Acesso (03) | [UC01_narrativa](../prototipos/UC01_narrativa.png), [UC07_selecao_de_classe](../prototipos/UC07_selecao_de_classe.png) | estadoDoJogo, telas · `testar:navegador` | Feito |
| RF08 | Encerrar sessão | UC08 | HU08 | — | — | fluxo · `testar:contas` | Feito |
| RF09 | Salvamento local | UC09 | HU09 | Acesso (03), Partida (04) | — | arquivoDeSave, pontaAPonta, progresso | Feito |
| RF10 | Salvamento no banco (só contas) | UC03, UC08, UC09, UC26 | HU03, HU08, HU09, HU26 | Acesso (03), Caravana (06), Partida (04) | — | fluxo, contas · `testar:contas` | Feito |
| RF11 | Recuperação no login | UC04, UC09 | HU04, HU09 | Acesso (03), Partida (04) | — | contas, fluxo · `testar:contas` | Feito |
| RF12 | Partida interrompida (navegador fechado, queda de internet, bateria) | UC09, UC41 | HU09, HU41 | Acesso (03), Partida (04) | — | ganhosDaPartida, estadoDoJogo, pontaAPonta · `testar:floresta` | Feito |
| RF13 | Tela Inicial com nome do jogo, apresentação, instruções (Como jogar | UC10 | HU10 | Acesso (03) | [UC10_tela_inicial](../prototipos/UC10_tela_inicial.png), [UC10_como_jogar](../prototipos/UC10_como_jogar.png), [UC10_reino_ajuda](../prototipos/UC10_reino_ajuda.png) (+1) | telas, interface · `testar:botoes` | Feito |
| RF14 | Os botões de Ranking (Salão da Glória) e Configurações aparecem em… | UC11, UC14 | HU11, HU14 | Acesso (03) | [UC10_tela_inicial](../prototipos/UC10_tela_inicial.png) | telas · `testar:botoes` | Feito |
| RF15 | Salão da Glória | UC11 | HU11 | Acesso (03) | [UC11_salao_ranking](../prototipos/UC11_salao_ranking.png) | telas · `testar:contas` | Feito |
| RF16 | Histórico "Minhas partidas" dentro do Salão da Glória, visível só… | UC12 | HU12 | — | — | telas · `testar:contas` | Feito |
| RF17 | Conquistas dentro do Salão da Glória, para quem já está jogando… | UC13 | HU13 | — | [UC13_salao_conquistas](../prototipos/UC13_salao_conquistas.png) | conquistas · `testar:reino` | Feito |
| RF18 | Configurações | UC14 | HU14 | Acesso (03) | [UC14_configuracoes](../prototipos/UC14_configuracoes.png) | som, preferenciasLocais · `testar:navegador` | Feito |
| RF19 | O Reino é o hub do jogo, com Guilda, Mercado, Forja, Mochila, Árvores… | UC15, UC16, UC17, UC19, UC21, UC25 | HU15, HU16, HU17, HU19, HU21, HU25 | Guilda (05) | [UC26_reino](../prototipos/UC26_reino.png) | reino, telas · `testar:reino`, `testar:camadas` | Feito |
| RF20 | Mochila do Reino praticamente ilimitada. Cada item mostra função,… | UC15 | HU15 | — | [UC15_mochila](../prototipos/UC15_mochila.png) | mochila, itemNaMao · `testar:reino` | Feito |
| RF21 | Mercado com NPCs | UC16 | HU16 | — | [UC16_mercado_comerciante](../prototipos/UC16_mercado_comerciante.png), [UC16_catalogo_no_comeco](../prototipos/UC16_catalogo_no_comeco.png), [UC16_mercado_comprar](../prototipos/UC16_mercado_comprar.png) (+3) | mercado, npcs · `testar:reino` | Feito |
| RF22 | Forja | UC17 | HU17 | — | [UC17_forja_ferreiro](../prototipos/UC17_forja_ferreiro.png), [UC17_forja_equipar](../prototipos/UC17_forja_equipar.png), [UC17_forja_comprar](../prototipos/UC17_forja_comprar.png) (+2) | forja, equipamento · `testar:reino` | Feito |
| RF23 | Fabricação de equipamento por receita, que exige os materiais e o… | UC18 | HU18 | — | [UC18_forja_fabricar](../prototipos/UC18_forja_fabricar.png) | forja · `testar:reino` | Feito |
| RF24 | Árvores de Habilidades | UC19 | HU19 | — | [UC19_arvores](../prototipos/UC19_arvores.png) | arvores, habilidadesDaArvore, atributos · `testar:reino` | Feito (árvore provisória: 4 das 10 habilidades de cada classe no beta; as outras 6 são trabalho futuro, TASK-010) |
| RF25 | Redefinir os pontos de atributo usando o pergaminho comprado no… | UC20 | HU20 | — | — | arvores · `testar:reino` | Feito |
| RF26 | Missões | UC21, UC22 | HU21, HU22 | Guilda (05) | [UC21_guilda_mestra](../prototipos/UC21_guilda_mestra.png), [UC21_guilda_missoes](../prototipos/UC21_guilda_missoes.png), [UC22_guilda_missao_ativa](../prototipos/UC22_guilda_missao_ativa.png) | missoes, guilda · `testar:reino` | Feito |
| RF27 | Entrega na Guilda | UC23 | HU23 | Guilda (05) | — | missoes · `testar:reino` | Feito |
| RF28 | Abandono de missão com multa de 10% do ouro da recompensa,… | UC24 | HU24 | Guilda (05) | — | missoes · `testar:reino` | Feito |
| RF29 | Contratos só de classes que o jogador ainda não possui. Temporário | UC25 | HU25 | Guilda (05) | [UC21_guilda_mestra](../prototipos/UC21_guilda_mestra.png), [UC25_guilda_contrato_temporario](../prototipos/UC25_guilda_contrato_temporario.png), [UC25_guilda_contrato_permanente](../prototipos/UC25_guilda_contrato_permanente.png) (+1) | guilda · `testar:reino` | Feito |
| RF30 | Mapa em ovo com o Planalto no centro (Reino, Fazendas, Minas e Lagos)… | UC26, UC27 | HU26, HU27 | Caravana (06), Partida (04) | [UC27_mapa](../prototipos/UC27_mapa.png) | mundo, telas · `testar:camadas`, `testar:reino` | Feito (no beta só a Floresta abre; Deserto, Tundra e Vulcânico aparecem com cadeado: trabalho futuro) |
| RF31 | Cada bioma tem regiões fácil, média e difícil e domínios de Boss… | UC27, UC35 | HU27, HU35 | Partida (04) | — | mapaDaPartida, mundo, mobs, terreno · `testar:floresta` | Feito na Floresta; os outros biomas: trabalho futuro |
| RF32 | Ponto de partida | UC28 | HU28 | — | — | caravana (o substituto) | Substituído pelo RF56 (Caravana, Parte 7) |
| RF33 | Preparação | UC29, UC30 | HU29, HU30 | Partida (04) | [UC29_preparacao](../prototipos/UC29_preparacao.png) | estadoDoJogo, itensNaPartida · `testar:floresta` | Feito |
| RF34 | A partida começa no botão "Começar partida" (que salva o progresso) e… | UC26, UC31 | HU26, HU31 | Caravana (06), Partida (04) | [UC31_carregando_a_partida](../prototipos/UC31_carregando_a_partida.png) | estadoDoJogo, carregamento · `testar:floresta` | Feito |
| RF35 | Controles | UC31 | HU31 | Partida (04) | [UC10_como_jogar](../prototipos/UC10_como_jogar.png), [UC31_partida_comeco](../prototipos/UC31_partida_comeco.png) | movimento · `testar:navegador` | Feito |
| RF36 | Combate 2D visto de cima, em tempo real. O clique faz o ataque básico… | UC32 | HU32 | Partida (04) | [UC32_partida_com_mobs](../prototipos/UC32_partida_com_mobs.png) | combate, arco, atributosNoCombate · `testar:navegador` | Feito |
| RF37 | Definição de "em combate" | UC32, UC38, UC39 | HU32, HU38, HU39 | Partida (04) | — | andamentoDaPartida · `testar:floresta`, `testar:navegador` | Feito |
| RF38 | Habilidades ativas têm custo de mana e recarga. A mana se regenera… | UC33 | HU33 | Partida (04) | — | habilidades · `testar:navegador` | Feito |
| RF39 | Bosses | UC34 | HU34 | Partida (04) | [UC34_partida_chefe_ogro](../prototipos/UC34_partida_chefe_ogro.png) | mobs, metasDoBalanceamento · `testar:floresta` | Feito (o Ogro, chefe da Floresta; o Guardião fica no código como chefe avançado: trabalho futuro) |
| RF40 | Exploração | UC35 | HU35 | Partida (04) | [UC38_pausa](../prototipos/UC38_pausa.png) | mundo · `testar:floresta` | Feito |
| RF41 | Usar item | UC36 | HU36 | Partida (04) | [UC36_mochila_da_partida](../prototipos/UC36_mochila_da_partida.png) | itensNaPartida, itensNoChao · `testar:floresta` | Feito |
| RF42 | IA dos aliados | UC31, UC37 | HU31, HU37 | Partida (04) | [UC32_partida_com_mobs](../prototipos/UC32_partida_com_mobs.png) | iaDosAliados, nivelDaIA, passagemDoLider · `testar:navegador`, `testar:paredes` | Feito |
| RF43 | Desmaio | UC37 | HU37 | Partida (04) | — | desmaio · `testar:navegador` | Feito |
| RF44 | Pausa com Esc só fora de combate. Em combate aparece "Você não pode… | UC38 | HU38 | Partida (04) | [UC38_pausa](../prototipos/UC38_pausa.png) | andamentoDaPartida · `testar:navegador` | Feito |
| RF45 | Retorno normal com Q ou pelo menu de pausa | UC39 | HU39 | Partida (04) | — | andamentoDaPartida · `testar:navegador` | Feito |
| RF46 | Fuga com F | UC40 | HU40 | Partida (04) | [UC40_confirmar_fuga](../prototipos/UC40_confirmar_fuga.png) | andamentoDaPartida, taxa · `testar:floresta` | Feito |
| RF47 | Resultados da partida | UC41 | HU41 | Partida (04) | [UC42_resumo_vitoria](../prototipos/UC42_resumo_vitoria.png), [UC41_cutscene_derrota](../prototipos/UC41_cutscene_derrota.png), [UC42_resumo_derrota](../prototipos/UC42_resumo_derrota.png) | fimDaPartida · `testar:navegador` | Feito |
| RF48 | Taxa final, só sobre o ouro ganho na partida, calculada pela situação… | UC41 | HU41 | Partida (04) | [UC42_resumo_vitoria](../prototipos/UC42_resumo_vitoria.png) | taxa · `testar:floresta` | Feito |
| RF49 | Pontuação | UC41 | HU41 | Partida (04) | — | fimDaPartida, ganhosDaPartida · `testar:floresta` | Feito |
| RF50 | XP | UC23, UC32, UC35, UC41, UC43 | HU23, HU32, HU35, HU41, HU43 | Guilda (05), Partida (04) | — | xp, ganhosDaPartida | Feito |
| RF51 | Resumo da partida com resultado, motivo, ouro ganho, taxa, ouro… | UC42 | HU42 | Partida (04) | [UC42_resumo_vitoria](../prototipos/UC42_resumo_vitoria.png), [UC42_resumo_derrota](../prototipos/UC42_resumo_derrota.png) | telas, ganhosDaPartida · `testar:floresta` | Feito |
| RF52 | Ao fim da partida, a vida e a mana de todos os personagens voltam ao… | UC41 | HU41 | Partida (04) | — | ganhosDaPartida | Feito |
| RF53 | HUD da partida, translúcido e por cima do mapa, agrupado por canto… | UC31 | HU31 | Partida (04) | [UC31_partida_comeco](../prototipos/UC31_partida_comeco.png), [UC32_partida_com_mobs](../prototipos/UC32_partida_com_mobs.png) | telas · `testar:navegador`, `testar:botoes` | Feito |
| RF54 | Minijogos do Planalto (Fazenda, Mina e Lago), acessados só pelo Mapa… | UC43 | HU43 | Partida (04) | [UC43_minijogo_fazenda](../prototipos/UC43_minijogo_fazenda.png), [UC43_minijogo_fazenda_jogando](../prototipos/UC43_minijogo_fazenda_jogando.png), [UC43_minijogo_mina](../prototipos/UC43_minijogo_mina.png) (+3) | minijogos, rodadasDoDia · `testar:reino` | Feito |
| RF55 | Progressão | UC19, UC32 | HU19, HU32 | Partida (04) | [UC19_arvores](../prototipos/UC19_arvores.png) | xp, atributos | Feito |
| RF56 | Caravana | UC44 | HU44 | Caravana (06) | [UC44_caravana](../prototipos/UC44_caravana.png) | caravana, telas · `testar:floresta` | Feito |
| RF57 | NPCs com balão de fala e menu | UC45, UC16, UC17, UC21 | HU45, HU16, HU17, HU21 | Guilda (05) | [UC16_mercado_comerciante](../prototipos/UC16_mercado_comerciante.png), [UC45_mercado_comerciante_fala](../prototipos/UC45_mercado_comerciante_fala.png), [UC17_forja_ferreiro](../prototipos/UC17_forja_ferreiro.png) (+1) | npcs, interface · `testar:reino` | Feito |
| RF58 | Animais pacíficos nas zonas neutras | UC31, UC35 | HU31, HU35 | Partida (04) | — | mobs · `testar:floresta` | Feito |
| RF59 | Cada tipo de mob fica na sua área | UC31, UC32 | HU31, HU32 | Partida (04) | — | mobs, mundo · `testar:floresta` | Feito |
| RF60 | Acampamento goblin na região média e forte goblin na difícil, com… | UC32 | HU32 | Partida (04) | — | acampamento, metasDoBalanceamento · `testar:floresta` | Feito |
| RF61 | Opções de desenvolvedor, só no `npm run dev` (nunca no site… | UC46 | HU46 | — | — | opcoesDeDev · `testar:floresta` | Feito |
| RF62 | Simulador de balanceamento, só para o desenvolvedor (`npm run… | UC47 | HU47 | — | — | simulador, metasDoBalanceamento | Feito |

## Requisitos não funcionais

| RNF | Requisito | Como é conferido | Situação |
|---|---|---|---|
| RNF01 | Interface em React (disciplina de Desenvolvimento Web 2). A partida é… | o código (React + Phaser) | Feito |
| RNF02 | Autenticação e banco no Supabase, com políticas RLS | `conferir:configuracao` (RLS); `testar:contas` | Feito |
| RNF03 | Computador e celular (Parte 14): teclado e mouse no computador; toque no celular e no tablet, deitados… | `testar:botoes`, `testar:camadas` (1366×768 a 1920×1080); `testar:celular` (Pixel 7, iPhone 14, 640×360 e 932×430); protótipos em [celular/](../prototipos/celular/README.md) | Feito |
| RNF04 | Estilo pixel art em telas, menus e gameplay. Textos e botões são… | Guia de Arte; `testar:arte`, `testar:camadas` | Em parte: o Reino e o Mapa com as peças do Pablo; personagens, mobs, animais e NPCs em blocos (RNF15); a pixel art definitiva é trabalho futuro |
| RNF05 | Para não sobrecarregar o banco, o Supabase recebe dados só nos… | fluxo, pontaAPonta | Feito |
| RNF06 | Controle de versão do estado | contas, fluxo (versão do save) | Feito |
| RNF07 | Senhas tratadas só pelo Supabase Auth; o navegador não guarda… | servico (só o Supabase Auth) | Feito |
| RNF08 | Desempenho | `testar:floresta`, `testar:navegador` (TEST-005) | Feito (TEST-005: 60 FPS na arena; 56 de média no pior cenário da Floresta grande) |
| RNF09 | Usabilidade | interface, telas · `testar:botoes` | Feito |
| RNF10 | Acessibilidade básica | `testar:botoes` (foco, tema) | Feito |
| RNF11 | Compatível com as versões atuais de Chrome, Edge e… | `testar:*` no Edge; Roteiros.md | Testado no Edge (roteiros automáticos); Chrome e Firefox: teste à mão |
| RNF12 | Código versionado no GitHub e atividades registradas no Trello, com… | GitHub e Trello | Feito |
| RNF13 | Boas práticas de código | 1.044 testes automáticos em `src/regras/` | Feito |
| RNF14 | Limitação conhecida | — (limitação conhecida) | Limitação conhecida (validar o progresso no servidor: trabalho futuro) |
| RNF15 | Bonecos desenhados em código | bonecos · `testar:arte` | Feito |

## Casos de uso

| Caso de uso | Requisitos funcionais | História | Diagrama de atividades |
|---|---|---|---|
| UC01 Jogar como convidado | RF01 | HU01 | Acesso (03) |
| UC02 Cadastrar conta | RF02 | HU02 | Acesso (03) |
| UC03 Transferir progresso do convidado | RF03, RF10 | HU03 | Acesso (03) |
| UC04 Autenticar-se | RF04, RF05, RF11 | HU04 | Acesso (03) |
| UC05 Notificar conta em uso | RF05 | HU05 | Acesso (03) |
| UC06 Recuperar senha | RF06 | HU06 | Acesso (03) |
| UC07 Escolher classe inicial | RF07 | HU07 | Acesso (03) |
| UC08 Encerrar sessão | RF08, RF10 | HU08 | — |
| UC09 Salvar progresso | RF09, RF10, RF11, RF12 | HU09 | Acesso (03), Partida (04) |
| UC10 Consultar instruções do jogo | RF13 | HU10 | Acesso (03) |
| UC11 Visualizar Ranking | RF14, RF15 | HU11 | Acesso (03) |
| UC12 Visualizar histórico de partidas | RF16 | HU12 | — |
| UC13 Visualizar conquistas | RF17 | HU13 | — |
| UC14 Configurar preferências | RF14, RF18 | HU14 | Acesso (03) |
| UC15 Gerenciar Mochila | RF19, RF20 | HU15 | — |
| UC16 Negociar no Mercado | RF19, RF21, RF57 | HU16 | — |
| UC17 Gerenciar equipamentos (Forja) | RF19, RF22, RF57 | HU17 | — |
| UC18 Fabricar equipamento | RF23 | HU18 | — |
| UC19 Gerenciar personagens (Árvores de Habilidades) | RF19, RF24, RF55 | HU19 | — |
| UC20 Redefinir atributos | RF25 | HU20 | — |
| UC21 Gerenciar missões (Guilda) | RF19, RF26, RF57 | HU21 | Guilda (05) |
| UC22 Aceitar missão | RF26 | HU22 | Guilda (05) |
| UC23 Entregar missão | RF27, RF50 | HU23 | Guilda (05) |
| UC24 Abandonar missão | RF28 | HU24 | Guilda (05) |
| UC25 Contratar personagem (Guilda) | RF19, RF29 | HU25 | Guilda (05) |
| UC26 Iniciar partida | RF30, RF34, RF10 | HU26 | Partida (04), Caravana (06) |
| UC27 Selecionar bioma | RF30, RF31 | HU27 | Partida (04) |
| UC28 Escolher ponto de partida (dificuldade) — substituído pelo UC44 (Parte 7) | RF32 | HU28 | Partida (04) |
| UC29 Selecionar Líder | RF33 | HU29 | Partida (04) |
| UC30 Preparar mochila da partida | RF33 | HU30 | Partida (04) |
| UC31 Jogar partida | RF34, RF35, RF42, RF53, RF58 e RF59 | HU31 | Partida (04) |
| UC32 Combater monstros | RF36, RF37, RF50, RF55, RF59, RF60 | HU32 | Partida (04) |
| UC33 Usar habilidade | RF38 | HU33 | Partida (04) |
| UC34 Enfrentar o chefe (o Ogro) | RF39 | HU34 | Partida (04) |
| UC35 Explorar e coletar recursos | RF31, RF40, RF50, RF58 | HU35 | Partida (04) |
| UC36 Usar item | RF41 | HU36 | Partida (04) |
| UC37 Levantar aliado desmaiado | RF42, RF43 | HU37 | Partida (04) |
| UC38 Pausar partida | RF37, RF44 | HU38 | Partida (04) |
| UC39 Retornar ao Reino | RF37, RF45 | HU39 | Partida (04) |
| UC40 Fugir com a Pedra de Retorno | RF46 | HU40 | Partida (04) |
| UC41 Encerrar partida | RF12, RF47, RF48, RF49, RF50, RF52 | HU41 | Partida (04) |
| UC42 Visualizar resumo da partida | RF51 | HU42 | Partida (04) |
| UC43 Jogar minijogo do Planalto | RF54, RF50 | HU43 | Partida (04) |
| UC44 Viajar de Caravana | RF56 | HU44 | Caravana (06), Partida (04) |
| UC45 Conversar com NPC | RF57 | HU45 | Guilda (05) |
| UC46 Usar opções de desenvolvedor (feito, 11/2026) | RF61 | HU46 | — |
| UC47 Simular balanceamento (feito, 11/2026) | RF62 | HU47 | — |
| UC48 Acessar a Área do Desenvolvedor (extra, trabalho futuro) | — (extra, fora do beta) | HU48 | — |
| UC49 Banir e desbanir conta (extra, trabalho futuro) | — (extra, fora do beta) | HU49 | — |

Resumo da conferência (26/11/2026):

- Casos de uso: 49 · requisitos funcionais: 62 · requisitos não funcionais: 15 · histórias: 49.
- Feitos: 57 RFs inteiros; 3 feitos com uma parte para depois (RF24, RF30, RF39); o RF31 feito na Floresta; o RF32 substituído pelo RF56. RNFs: o RNF04 em parte (a pixel art é trabalho futuro) e o RNF14 é uma limitação conhecida.
- Trabalho futuro: os outros biomas (Deserto, Tundra e Vulcânico), as 6 habilidades que faltam em cada árvore, o Guardião da Floresta como chefe avançado, a pixel art definitiva, a validação do progresso no servidor e a Área do Desenvolvedor (UC48 e UC49, no ramo `area-dev`).
- Requisitos sem caso de uso: nenhum. Requisitos com protótipo: 37 de 62 (os outros não têm tela própria: regras como a taxa, o XP e o salvamento, cobertas pelos testes). Todos os RFs têm teste automático, roteiro ou os dois.
- Casos de uso que aparecem em algum diagrama de atividades: 38 de 47 (sem contar os extras). Os demais são telas de consulta ou gerenciamento do Reino, sem fluxo com decisões que precise de diagrama próprio.
