# Protótipos (prints do jogo)

Prints de todas as telas do jogo como ele está hoje, em 1366 × 768, tirados pelo próprio jogo com `npm run prints -- prototipos` (tema claro, nesta pasta) e `npm run prints -- prototipos escuro` (tema escuro, na subpasta [escuro/](escuro/)). O nome de cada arquivo começa pelo caso de uso que a tela atende. Os protótipos iniciais, feitos antes do jogo, ficam em [iniciais/](iniciais/).

O painel DEV e a barra de teste (que só existem no `npm run dev`) não aparecem nos prints. A matriz completa (cada requisito com o caso de uso, a história, o diagrama, o protótipo e o teste) fica em [09_Matriz_de_Rastreabilidade.md](../docAdicional/09_Matriz_de_Rastreabilidade.md).

As mesmas telas no celular (deitado, com os controles de toque; Parte 14) ficam em [celular/](celular/README.md), com a mesma ligação aos casos de uso.

| Print | Tela | Caso de uso | Requisitos |
| --- | --- | --- | --- |
| [UC10_tela_inicial.png](UC10_tela_inicial.png) · [escuro](escuro/UC10_tela_inicial.png) | Tela inicial | UC10 Consultar instruções do jogo | RF13, RF14 |
| [UC10_como_jogar.png](UC10_como_jogar.png) · [escuro](escuro/UC10_como_jogar.png) | Como jogar (janela) | UC10 Consultar instruções do jogo | RF13, RF35 |
| [UC14_configuracoes.png](UC14_configuracoes.png) · [escuro](escuro/UC14_configuracoes.png) | Configurações (janela) | UC14 Configurar preferências | RF18 |
| [UC04_login.png](UC04_login.png) · [escuro](escuro/UC04_login.png) | Login | UC04 Autenticar-se | RF01, RF04 |
| [UC02_criar_conta.png](UC02_criar_conta.png) · [escuro](escuro/UC02_criar_conta.png) | Criar conta | UC02 Cadastrar conta | RF02 |
| [UC02_confirme_o_email.png](UC02_confirme_o_email.png) · [escuro](escuro/UC02_confirme_o_email.png) | Confirme seu e-mail | UC02 Cadastrar conta | RF02, RF04 |
| [UC06_esqueci_a_senha.png](UC06_esqueci_a_senha.png) · [escuro](escuro/UC06_esqueci_a_senha.png) | Esqueci minha senha | UC06 Recuperar senha | RF06 |
| [UC06_senha_nova.png](UC06_senha_nova.png) · [escuro](escuro/UC06_senha_nova.png) | Senha nova | UC06 Recuperar senha | RF06 |
| [UC04_escolher_apelido.png](UC04_escolher_apelido.png) · [escuro](escuro/UC04_escolher_apelido.png) | Escolha seu apelido | UC04 Autenticar-se | RF02 |
| [UC01_narrativa.png](UC01_narrativa.png) · [escuro](escuro/UC01_narrativa.png) | Narrativa inicial | UC01 Jogar como convidado | RF01, RF07 |
| [UC07_selecao_de_classe.png](UC07_selecao_de_classe.png) · [escuro](escuro/UC07_selecao_de_classe.png) | Seleção de classe | UC07 Escolher classe inicial | RF07 |
| [UC16_mercado_comerciante.png](UC16_mercado_comerciante.png) · [escuro](escuro/UC16_mercado_comerciante.png) | Mercado: o comerciante Bartolomeu | UC16 Negociar no Mercado | RF21, RF57 |
| [UC16_catalogo_no_comeco.png](UC16_catalogo_no_comeco.png) · [escuro](escuro/UC16_catalogo_no_comeco.png) | Mercado: Catálogo no começo | UC16 Negociar no Mercado | RF21 |
| [UC26_reino.png](UC26_reino.png) · [escuro](escuro/UC26_reino.png) | Reino | UC26 Iniciar partida | RF19 |
| [UC10_reino_ajuda.png](UC10_reino_ajuda.png) · [escuro](escuro/UC10_reino_ajuda.png) | Como funciona: Reino (janela do "?") | UC10 Consultar instruções do jogo | RF13 |
| [UC15_mochila.png](UC15_mochila.png) · [escuro](escuro/UC15_mochila.png) | Mochila | UC15 Gerenciar Mochila | RF20 |
| [UC45_mercado_comerciante_fala.png](UC45_mercado_comerciante_fala.png) · [escuro](escuro/UC45_mercado_comerciante_fala.png) | Mercado: o comerciante (segunda visita) | UC45 Conversar com NPC | RF57 |
| [UC16_mercado_comprar.png](UC16_mercado_comprar.png) · [escuro](escuro/UC16_mercado_comprar.png) | Mercado: Comprar | UC16 Negociar no Mercado | RF21 |
| [UC16_mercado_vender.png](UC16_mercado_vender.png) · [escuro](escuro/UC16_mercado_vender.png) | Mercado: Vender | UC16 Negociar no Mercado | RF21 |
| [UC16_mercado_trocar.png](UC16_mercado_trocar.png) · [escuro](escuro/UC16_mercado_trocar.png) | Mercado: Trocar | UC16 Negociar no Mercado | RF21 |
| [UC16_mercado_catalogo.png](UC16_mercado_catalogo.png) · [escuro](escuro/UC16_mercado_catalogo.png) | Mercado: Catálogo | UC16 Negociar no Mercado | RF21 |
| [UC10_mercado_ajuda.png](UC10_mercado_ajuda.png) · [escuro](escuro/UC10_mercado_ajuda.png) | Como funciona: Mercado (janela do "?") | UC10 Consultar instruções do jogo | RF13 |
| [UC17_forja_ferreiro.png](UC17_forja_ferreiro.png) · [escuro](escuro/UC17_forja_ferreiro.png) | Forja: o ferreiro Gunnar | UC17 Gerenciar equipamentos (Forja) | RF22, RF57 |
| [UC17_forja_equipar.png](UC17_forja_equipar.png) · [escuro](escuro/UC17_forja_equipar.png) | Forja: Equipar | UC17 Gerenciar equipamentos (Forja) | RF22 |
| [UC17_forja_comprar.png](UC17_forja_comprar.png) · [escuro](escuro/UC17_forja_comprar.png) | Forja: Comprar | UC17 Gerenciar equipamentos (Forja) | RF22 |
| [UC17_forja_vender.png](UC17_forja_vender.png) · [escuro](escuro/UC17_forja_vender.png) | Forja: Vender | UC17 Gerenciar equipamentos (Forja) | RF22 |
| [UC18_forja_fabricar.png](UC18_forja_fabricar.png) · [escuro](escuro/UC18_forja_fabricar.png) | Forja: Fabricar | UC18 Fabricar equipamento | RF23 |
| [UC17_forja_catalogo.png](UC17_forja_catalogo.png) · [escuro](escuro/UC17_forja_catalogo.png) | Forja: Catálogo | UC17 Gerenciar equipamentos (Forja) | RF22 |
| [UC21_guilda_mestra.png](UC21_guilda_mestra.png) · [escuro](escuro/UC21_guilda_mestra.png) | Guilda: a Mestra Isolda | UC21 Gerenciar missões (Guilda) | RF26, RF29, RF57 |
| [UC21_guilda_missoes.png](UC21_guilda_missoes.png) · [escuro](escuro/UC21_guilda_missoes.png) | Guilda: Missões | UC21 Gerenciar missões (Guilda) | RF26 |
| [UC25_guilda_contrato_temporario.png](UC25_guilda_contrato_temporario.png) · [escuro](escuro/UC25_guilda_contrato_temporario.png) | Guilda: Contrato temporário | UC25 Contratar personagem (Guilda) | RF29 |
| [UC25_guilda_contrato_permanente.png](UC25_guilda_contrato_permanente.png) · [escuro](escuro/UC25_guilda_contrato_permanente.png) | Guilda: Contrato permanente | UC25 Contratar personagem (Guilda) | RF29 |
| [UC25_guilda_temporario_ativo.png](UC25_guilda_temporario_ativo.png) · [escuro](escuro/UC25_guilda_temporario_ativo.png) | Guilda: contrato temporário ativo | UC25 Contratar personagem (Guilda) | RF29 |
| [UC22_guilda_missao_ativa.png](UC22_guilda_missao_ativa.png) · [escuro](escuro/UC22_guilda_missao_ativa.png) | Guilda: missão aceita | UC22 Aceitar missão | RF26 |
| [UC19_arvores.png](UC19_arvores.png) · [escuro](escuro/UC19_arvores.png) | Árvores de Habilidades | UC19 Gerenciar personagens (Árvores) | RF24, RF55 |
| [UC11_salao_ranking.png](UC11_salao_ranking.png) · [escuro](escuro/UC11_salao_ranking.png) | Salão da Glória: Ranking | UC11 Visualizar Ranking | RF15 |
| [UC13_salao_conquistas.png](UC13_salao_conquistas.png) · [escuro](escuro/UC13_salao_conquistas.png) | Salão da Glória: Conquistas | UC13 Visualizar conquistas | RF17 |
| [UC27_mapa.png](UC27_mapa.png) · [escuro](escuro/UC27_mapa.png) | Mapa | UC27 Selecionar bioma | RF30 |
| [UC43_minijogo_fazenda.png](UC43_minijogo_fazenda.png) · [escuro](escuro/UC43_minijogo_fazenda.png) | Minijogo da Fazenda | UC43 Jogar minijogo do Planalto | RF54 |
| [UC43_minijogo_fazenda_jogando.png](UC43_minijogo_fazenda_jogando.png) · [escuro](escuro/UC43_minijogo_fazenda_jogando.png) | Minijogo da Fazenda: jogando | UC43 Jogar minijogo do Planalto | RF54 |
| [UC43_minijogo_mina.png](UC43_minijogo_mina.png) · [escuro](escuro/UC43_minijogo_mina.png) | Minijogo da Mina | UC43 Jogar minijogo do Planalto | RF54 |
| [UC43_minijogo_mina_jogando.png](UC43_minijogo_mina_jogando.png) · [escuro](escuro/UC43_minijogo_mina_jogando.png) | Minijogo do Mina: jogando | UC43 Jogar minijogo do Planalto | RF54 |
| [UC43_minijogo_lago.png](UC43_minijogo_lago.png) · [escuro](escuro/UC43_minijogo_lago.png) | Minijogo do Lago | UC43 Jogar minijogo do Planalto | RF54 |
| [UC43_minijogo_lago_jogando.png](UC43_minijogo_lago_jogando.png) · [escuro](escuro/UC43_minijogo_lago_jogando.png) | Minijogo do Lago: jogando | UC43 Jogar minijogo do Planalto | RF54 |
| [UC44_caravana.png](UC44_caravana.png) · [escuro](escuro/UC44_caravana.png) | Caravana | UC44 Viajar de Caravana | RF56 |
| [UC29_preparacao.png](UC29_preparacao.png) · [escuro](escuro/UC29_preparacao.png) | Preparação | UC29 Selecionar Líder | RF33 |
| [UC31_carregando_a_partida.png](UC31_carregando_a_partida.png) · [escuro](escuro/UC31_carregando_a_partida.png) | Carregando a partida | UC31 Jogar partida | RF34 |
| [UC31_partida_comeco.png](UC31_partida_comeco.png) · [escuro](escuro/UC31_partida_comeco.png) | Partida: o começo, na zona segura | UC31 Jogar partida | RF35, RF53 |
| [UC38_pausa.png](UC38_pausa.png) · [escuro](escuro/UC38_pausa.png) | Pausa (com o mapa inteiro) | UC38 Pausar partida | RF40, RF44 |
| [UC40_confirmar_fuga.png](UC40_confirmar_fuga.png) · [escuro](escuro/UC40_confirmar_fuga.png) | Confirmar a fuga (janela) | UC40 Fugir com a Pedra de Retorno | RF46 |
| [UC32_partida_com_mobs.png](UC32_partida_com_mobs.png) · [escuro](escuro/UC32_partida_com_mobs.png) | Partida: o grupo de 5 e a matilha do Lobo Alfa | UC32 Combater monstros | RF36, RF42, RF53 |
| [UC34_partida_chefe_ogro.png](UC34_partida_chefe_ogro.png) · [escuro](escuro/UC34_partida_chefe_ogro.png) | Partida: o chefe Ogro | UC34 Enfrentar o chefe | RF39 |
| [UC36_mochila_da_partida.png](UC36_mochila_da_partida.png) · [escuro](escuro/UC36_mochila_da_partida.png) | Mochila da partida (Tab) | UC36 Usar item | RF41 |
| [UC42_resumo_vitoria.png](UC42_resumo_vitoria.png) · [escuro](escuro/UC42_resumo_vitoria.png) | Resumo (Vitória) | UC42 Visualizar resumo da partida | RF47, RF48, RF51 |
| [UC41_cutscene_derrota.png](UC41_cutscene_derrota.png) · [escuro](escuro/UC41_cutscene_derrota.png) | Cutscene de derrota | UC41 Encerrar partida | RF47 |
| [UC42_resumo_derrota.png](UC42_resumo_derrota.png) · [escuro](escuro/UC42_resumo_derrota.png) | Resumo (Derrota) | UC42 Visualizar resumo da partida | RF47, RF51 |
