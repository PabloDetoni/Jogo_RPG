# Jogo RPG (nome a definir)

## O que é
RPG 2D visto de cima, em pixel art, só para computador (teclado e mouse). Trabalho de Análise e Projeto de Sistemas + Desenvolvimento Web 2 (UTFPR Campo Mourão), equipe de 3. Entrega do código e versão beta em 03/12/2026.

## Pastas
Código em `programacao/` (rodar npm lá); documentação em `documentacao/` (fonte de verdade). O caminho até a entrega e a situação de cada item da auditoria (TASK/DOC/TEST) ficam no `PLANO.md` da raiz. Os roteiros de teste manual (passo a passo para o Pablo) e o registro de todos os testes rodados (o que passou e o que falhou) ficam em `testes/` na raiz.
Comandos: `npm run dev`, `npm test` (Vitest), `npm run lint`, `npm run testar:floresta` (roteiro da Floresta, Fase 3), `npm run balanceamento` (gera o `documentacao/Balanceamento.md` com todos os valores e limites) `npm run testar:navegador` (roteiro da partida num Edge escondido) `npm run conferir:configuracao` (confere o Supabase e a Vercel sem mudar nada: SQL, segurança, links de e-mail, contas de teste e as variáveis do jogo publicado) `npm run testar:contas` (TEST-007: as contas com o Supabase de verdade, em dois Edges escondidos; precisa do SQL rodado e das duas contas de teste no `.env.local`) e `npm run testar:contas:publicado` (o mesmo roteiro no endereço principal, sem a barra de teste, conferindo também que a Floresta abre lá).

## Stack e arquitetura
- React na interface (obrigatório) + Supabase (contas e dados). A partida é desenhada com Phaser 4 (canvas) em `src/jogo/` (cenas, entidades, ataques); HUD, menus, janelas e a barra de teste continuam em React.
- Phaser e React só conversam pela ponte (`src/jogo/ponte.js`): o Phaser manda a situação 8 vezes por segundo, o andamento (em combate, retornando, fugindo) quando muda, as mensagens curtas do HUD e o "fimDaPartida" (com os números para o Resumo); o React manda comandos (Q, fuga confirmada, Voltar ao Reino da pausa e a barra de teste) e a pausa. As contas do fim e o save ficam com o estado do jogo (`encerrarPartida`). O Phaser só carrega ao abrir a Partida (import dinâmico em `ArenaDaPartida.jsx`), e nunca há dois jogos ao mesmo tempo. No `npm run dev`, o jogo fica em `window.__jogoDaPartida` para testes no navegador.
- Roteiro de testes no navegador: `npm run testar:navegador` liga o Vite e um Edge escondido, joga a arena e confere tudo (prints em `programacao/testes-do-navegador/`, fora do git). Rodar no fim de cada parte e acrescentar as conferências do que for novo. A Floresta tem o roteiro dela, `npm run testar:floresta` (Fase 3, com o TEST-005 de 2 minutos), que usa as ferramentas comuns de `scripts/ferramentasDoNavegador.mjs` e a placa de vídeo (com `NAVEGADOR_GPU=0`, desenha no processador e fica bem mais lento).
- Na partida, o HUD (faixa de cima) e a barra de teste (faixa de baixo) ficam fora da área jogável: na arena, a borda é a beira delas (`dados/arenaDeTeste.js`); na Floresta, a câmera mostra o mundo só entre as duas.
- Imagens são só fundo. Textos, botões e áreas clicáveis são componentes React por cima.
- Primeiro funcional, depois bonito: no início cada classe é um quadrado colorido e os ataques são quadradinhos.
- Estado global em `src/estado/` (um reducer); salvamento no navegador em `src/salvamento/`, no formato `{ formato, versao, salvoEm, progresso, partidaEmAndamento }`. Campo novo no progresso entra pelo `normalizarProgresso`; campo que muda de nome ou lugar pede um formato novo com migração (`formato.js`). Durante a partida o progresso salvo não muda: os ganhos ficam na partida atual e só entram no progresso ao encerrar (RF12).
- Regras puras (taxa, XP, atributos, mochila, fim da partida, Guilda, combate, movimento, grupo da partida, IA, desmaio, habilidades, andamento e ganhos da partida) em `src/regras/`, cada uma com teste ao lado. Na partida, o Phaser só desenha e move:
  - dano, recarga, empurrão, cura e acerto vêm de `regras/combate.js`;
  - separação entre corpos, escorregar (pedras, borda e outros corpos), tirar de dentro das pedras e desfazer sobreposições depois da física (a física do Phaser não tira um corpo parado de dentro da pedra), caminho em volta das pedras (grade), travamento e ponto livre vêm de `regras/movimento.js`;
  - alvos e posições da IA (aliados e inimigos), zona confortável, tremor, linha de tiro, formação de combate e a cura do Sacerdote (`quemCurar`, `posicaoParaCurar`) vêm de `regras/iaDosAliados.js`; o desvio de quem está parado (`pontoDeDesvio`), de `regras/movimento.js`; o nível da IA de cada aliado (pelo nível do personagem), a chance de erro e o momento de foco, de `regras/nivelDaIA.js`;
  - os 30 s, a ajuda de 5 s, a área limpa e o fim por desmaio vêm de `regras/desmaio.js`;
  - mana e uso das teclas 1 a 3 vêm de `regras/habilidades.js`;
  - em combate, retorno com Q, fuga com F, tempo ativo, XP de cada abate e custo da fuga vêm de `regras/andamentoDaPartida.js`; o fim (resultado, taxa com perdidos e caídos, pontuação) de `regras/fimDaPartida.js` (`montarFimDaPartida`), e o que vai para o save de `regras/ganhosDaPartida.js`; o crítico, de `regras/combate.js`.
- Na partida, todo tempo usa o relógio da cena (`cena.agora`), que para na pausa e com a aba escondida; nunca o `time.now` do Phaser, que continua correndo na pausa.
- Valores da documentação ficam em `src/dados/regras.js` e `taxas.js`; os provisórios, só em `src/dados/balanceamento.js`. Os testes de limite em `balanceamento.test.js` barram números absurdos.
- Habilidades (Fase 4, TASK-077): a árvore de cada classe fica em `dados/arvores.js` (PROVISÓRIO até a TASK-010: 10 lugares, 4 no beta; a raiz é a antiga habilidade de teste, gratuita e já no nível 1 na tecla 1). As teclas 1 a 3 de cada personagem, os números de cada nível, aprender/evoluir e as passivas vêm de `regras/habilidadesDaArvore.js`; o efeito de cada ativa, pelo campo "efeito", de `jogo/habilidades/` (cada efeito recebe a habilidade com os números do nível). Os aliados usam só a raiz da classe (`cena.usarHabilidadeDaRaiz`).
- Reino com dados (Fase 4):
  - catálogo em `dados/itens.js` (a "função" de cada item sai de `funcaoDoItem`), loja e receitas da Forja e equipamento fixo dos temporários em `dados/forja.js`, ofertas e trocas do Mercado em `dados/mercado.js` (tudo PROVISÓRIO até a TASK-014); números em `balanceamento.js` (`mercado`, `equipamentoNaPartida`, `evolucaoDasHabilidades`);
  - toda mudança de progresso nas telas do Reino é uma operação pura com nome em `regras/reino.js` (`operacoesDoReino`: Mochila, Mercado, Forja e Árvores), aplicada pela ação `noReino` do estado; a tela usa `telas/reino/useNoReino.js`, que roda a mesma regra antes para mostrar o motivo quando não dá. Listas com detalhe: `componentes/ListaComDetalhe.jsx`;
  - mochila da partida: o que vai é escolhido na Preparação (`escolhasDaPartida.levar`, só consumíveis, até a capacidade) e só sai da Mochila do Reino no fim da partida (`ganhosDaPartida`, `levados`); na partida, Tab abre a janela `mochilaDaPartida` (desenhada pela Partida, não pausa), E usa no Líder e R no aliado mais perto da mira (`regras/itensNaPartida.js`);
  - equipamento: bônus, defesa e redução de recarga em `regras/equipamento.js`, somados ao montar o grupo da partida;
  - missões: quadro em `dados/missoes.js`, regras em `regras/guilda.js` (etapa 4) e `regras/missoes.js` (quadro, telas e partida: a partida conta abates, coletas e áreas e só entra no save no fim);
  - conquistas: lista em `dados/conquistas.js` e regras em `regras/conquistas.js`; o estado confere depois de cada ação fora da partida (`conferirConquistas`).
- Som (Fase 4, TASK-105): um gerenciador só, `audio/gerenciador.js` (começa no primeiro clique; Música, Som e mudo pelas Configurações). Música por tela (`regras/som.js`, `musicaDaTela`) e efeitos chamados pela cena (`tocarEfeito`). Os arquivos entram sozinhos de `src/assets/audio/` com os nomes de `dados/sons.js` (`audio/arquivos.js`); sem arquivo, bipe provisório.
- Mundo (Fase 3): a partida acontece num mapa montado por `regras/mapaDaPartida.js` (`mapaDoBioma`): a Floresta (layout PROVISÓRIO em `dados/mundo/floresta.js`: regiões, áreas, população de mobs, recursos e lugar do Boss) ou a arena de teste da Fase 1, que só existe no `npm run dev` (botão "Arena de teste" no Mapa; o `testar:navegador` usa ela). A cena continua sendo `jogo/cenas/CenaArena.js` (chave 'arena'):
  - na Floresta, a câmera segue o Líder e mostra o mundo entre o HUD e a faixa de baixo; a mira usa `cameras.main.getWorldPoint` a cada quadro;
  - a mata fechada em volta das regiões, as árvores e as pedras vêm de `regras/mundo.js` (paredes, obstáculos com passagem garantida, região e área de um ponto, borda da taxa e a névoa do minimapa); os obstáculos perto de um ponto vêm da busca rápida `regras/vizinhanca.js` (`cena.paredesPerto`, `paredesEntre`; os tiros usam `pedrasPerto`, sem o boneco);
  - o desenho da Floresta fica em `jogo/mapas.js` (imagens feitas uma vez, em pedaços escondidos fora da tela); mobs longe do Líder dormem;
  - mobs da Floresta = o mob vermelho ou o atirador com outra ficha (`balanceamento.js`, `mundo.mobs`), com a força da região e o território (`regras/mobs.js`); o Boss é `jogo/entidades/GuardiaoDaFloresta.js`;
  - itens: catálogo provisório em `dados/itens.js` (`itemDoCatalogo`); no chão, `jogo/entidades/ItemNoChao.js`; a mochila da partida usa `regras/mochila.js`;
  - o que a partida descobre (névoa, áreas, regiões) e os itens só entram no save no fim (`regras/ganhosDaPartida.js`), no campo `mapasDescobertos` e na `mochila` do progresso.
- Contas (Fase 2) em `src/conta/`:
  - `cliente.js` é o ÚNICO lugar que cria o cliente do Supabase, com a URL e a chave **publicável** do `.env.local` (fora do git; os nomes ficam no `.env.example`) ou das variáveis da Vercel. A chave secreta nunca entra no jogo: a segurança vem das políticas RLS e das funções do banco. No `npm run dev`, o cliente fica em `window.__supabase` (para o `testar:contas`);
  - `servico.js` faz cada pedido ao Supabase e nunca lança erro (devolve `{ ok, codigo, mensagem }`, com as mensagens de `regras/contas.js`);
  - `fluxo.js` cuida da entrada (trava de uma aba de conta por navegador, sessão única, apelido), do save no banco com versão (envios em fila, versão recusada carrega a do banco, sem rede fica "pendente"), da passagem do convidado e da saída. O `ProvedorDoJogo` liga o fluxo ao estado: envia depois de cada save local pedido por `pedidosAoBanco`, registra `partidasParaRegistrar`, manda o sinal da sessão a cada minuto e tenta de novo quando a internet volta;
  - a conta também tem uma cópia local do save (`salvamento/salvadorLocal.js`, chave `jogo-rpg:conta:<id>`, com `versaoNoBanco`); a escolha do progresso no login fica em `regras/contas.js` (`escolherProgressoNoLogin`).
- SQL do banco em `programacao/supabase/`, em arquivos numerados (`001_contas.sql`), rodados pelo Pablo no SQL Editor. Arquivo já rodado não se edita: mudança vira um arquivo novo. Toda tabela com RLS; escrever no save e na sessão só pelas funções.

## Regras que moldam as telas
- Conta: e-mail e senha (8 caracteres ou mais), apelido único (3 a 16 letras, números ou _), confirmação de e-mail obrigatória, "esqueci minha senha" com a tela Senha nova e "Continuar como ..." quando o navegador lembra a conta. Dá para jogar como convidado (salvo só no navegador); a conta criada pelas Configurações do convidado recebe o progresso dele no primeiro login naquele navegador. Uma conta = uma sessão ativa (uma aba por navegador e uma sessão no banco). Sem internet ou com o Supabase fora do ar, nada trava: o convidado joga e a conta guarda tudo no navegador, com mensagem clara.
- Ranking (Salão da Glória): visível para todos, até sem login, mas só quem tem conta aparece nele. Dentro do Salão da Glória ficam também o histórico de partidas (só para o próprio jogador logado) e as Conquistas (para quem já está jogando, convidado ou conta).
- Na partida, só o Líder esquiva. A IA dos aliados vem do nível de cada personagem (básica, média e avançada) e o jogador nunca escolhe; o seletor "IA:" da barra de teste é só para testar. O nível ganho na partida aparece na hora, mas vale a partir da partida seguinte (RF12). Um nível não atrapalha o outro: a média e a avançada desviam de quem está parado, e a avançada não espera quem errou.
- O Sacerdote cura SEMPRE que alguém do grupo (ele mesmo também) não está com a vida cheia, em combate ou fora dele: caídos primeiro, depois o mais ferido, em empate o Líder. O nível da IA muda só a posição dele e a escolha do alvo.
- Em combate (dano nos últimos 5 s ou mob perseguindo) não dá para pausar nem começar o retorno com Q; a fuga com F funciona sempre e, confirmada, não se cancela. M liga e desliga o mudo em qualquer tela (menos digitando num campo).
- Classes: Guerreiro, Mago, Tanque, Sacerdote e Arqueiro. A classe inicial é gratuita; um personagem por classe; as outras classes vêm de contratos na Guilda (temporário ou permanente).
- Reino (hub): Guilda (contratos e missões), Mercado, Forja, Mochila, Árvores de Habilidades, Jogar, Ranking e Configurações.
- Jogar abre um mapa em forma de ovo. No centro fica o Planalto (Reino, fazenda, mina e lago, com minijogos que não contam como partida). Em volta: Floresta, Deserto, Tundra e Vulcânico. No beta, só a Floresta.
- Fluxo da partida: bioma → ponto de partida → preparação (Líder e mochila) → "Começar partida" → partida → resumo. A partida vai até voltar ao Reino.
- Resultados: Grande Vitória, Vitória, Retorno forçado (amarelo) e Derrota (com cutscene). Sem empate. Só o ouro é taxado; XP nunca.
- Ranking e Configurações aparecem em quase todas as telas. Na partida, só Configurações, que abre sem pausar. Esc fecha a janela aberta; se não houver nenhuma, pausa.

## Convenções
- Nomes de telas, componentes e variáveis em português.
- Números do jogo (taxas, XP, atributos, peso) ficam em arquivos de dados, nunca espalhados no código.
- Hitboxes separadas das imagens, para trocar a arte sem quebrar nada. Na partida, a hitbox é uma zona de física invisível e o desenho segue ela (`jogo/entidades/Entidade.js`). Cores das classes em `dados/classes.js`; mapa, cores e posições da arena em `dados/arenaDeTeste.js`.
- Na partida, cada entidade diz para onde quer andar (`andar`/`parar`) e a cena decide a velocidade final (`CenaArena.moverTodos`: separação, escorregar e destravar; `corrigirSobreposicoes` desfaz o que a física deixou um dentro do outro); para andar, ninguém chama `setVelocity` direto. Nascer ou reaparecer sempre passa por `lugarLivre` (nunca em pedra, fora da borda ou em cima de outro).
- Não instalar bibliotecas sem perguntar (já aprovadas: Vitest, Phaser e `@supabase/supabase-js`, o cliente oficial do Supabase, instalado na Fase 2 dentro do passo a passo que o Pablo delegou em 08/10). Plano antes de qualquer mudança grande.
- Ferramentas de teste que mexem no save ficam no painel `</> DEV` (só existe no `npm run dev`) e só funcionam fora da partida; a ação no estado também confere `import.meta.env.DEV`. A barra de teste inteira existe só no `npm run dev` (no build, a faixa de baixo da partida mostra só as teclas, e a cena ignora os comandos de teste).
- Commits e publicação: o `main` é o jogo público, no único endereço `https://jogo-rpg-six.vercel.app` (a Vercel só publica o `main`: `programacao/vercel.json`). No modo contínuo, o trabalho pode ser feito num ramo LOCAL (`fase-4`...), com commit no fim de cada parte e os testes passando; no fim da fase, com todos os testes passando, ele junta no `main`, vai para o GitHub e o endereço principal é conferido (regras na seção "Modo contínuo"). Fora do modo contínuo, não commitar sem ele pedir.
- Decisão que muda a documentação: atualizar o texto do documento e registrar na seção "Alterações do projeto" dele (no Conceito, a seção 21, sem reescrever o original). O PNG do diagrama sai do `.puml` pelo PlantUML.

## Protocolo de cada tarefa
1. Ler CLAUDE.md, PLANO.md e os documentos ligados à tarefa antes de mexer.
2. Mostrar um plano curto (arquivos, abordagem, valores provisórios) e esperar o ok do Pablo antes de programar. No modo contínuo, o plano é escrito no PLANO.md e o trabalho segue sem esperar.
3. Perguntar antes de: instalar biblioteca, apagar arquivo, mudar o formato do save ou contrariar a documentação. Se a documentação e um pedido do Pablo discordarem, vale o mais recente, mas avisar.
4. Testar sempre que possível: `npm test`, lint e build no fim de cada parte; teste novo para toda regra pura nova; se der para abrir o jogo no navegador, abrir e conferir. Dizer o que não deu para testar. No fim de cada parte, registrar os testes rodados em `testes/Registro.md` e acrescentar os roteiros manuais novos em `testes/Roteiros.md`.
5. Se travar ou algo der errado, parar e explicar em vez de improvisar.
6. Atualizar no mesmo trabalho o PLANO.md, o CLAUDE.md e o documento afetado. Números novos vão em `src/dados/balanceamento.js`, regenerando o `Balanceamento.md`.
7. Fora do modo contínuo: não fazer commit e sugerir a mensagem no fim. No modo contínuo: commit local por parte (ver abaixo).
8. Terminar com o relatório neste formato:
   1. Resumo em 2 ou 3 frases
   2. Onde o projeto está (tabela das etapas)
   3. O que mudou (arquivos e para que servem)
   4. Testes rodados e resultado (quantos, quais novos, o que falhou)
   5. Teste visual para o Pablo: passo a passo do que abrir, clicar e apertar, e o que deve aparecer. Obrigatório sempre que a tarefa mexer em algo que se vê
   6. Decisões tomadas por conta própria
   7. Pendências (comigo e com o grupo)
   8. Problemas conhecidos e riscos
   9. Próximo passo
   10. Mensagem de commit
9. Junto com esse relatório, mandar um segundo, para o Pablo repassar ao grupo (Uener e Lucas): o que já aconteceu e o que está acontecendo, bem explicado, em linguagem simples, sem depender de ter lido a conversa nem o código.

## Modo contínuo (pedido do Pablo em 08/10/2026; vale nas próximas sessões)
O Claude programa o resto do jogo até a entrega sem esperar o ok de cada parte nem o teste do Pablo entre as fases (ritmo novo, pedido em 10/10/2026). Se a sessão acabar no meio, o Pablo manda só "Continue o modo contínuo de onde parou": ler a seção **"Onde parei"** no topo do `PLANO.md` e seguir.

1. **Ordem (a do PLANO.md; Fases 1, 2 e 3 feitas e aprovadas):**
   1. Fase 4 (Reino com dados), partes 4a a 4m do PLANO.md: catálogo; Mochila do Reino; mochila da partida na Preparação e na partida (Tab, E e R); Mercado; Forja; Árvores (atributos, habilidades do nível 1 ao 5, 3 ativas, pergaminho); missões da Guilda; conquistas; minijogos da Fazenda, da Mina e do Lago, se couberem antes do congelamento. **O Painel do Mestre fica de fora até o Pablo confirmar;**
   2. arte e som: o sistema pronto para receber os arquivos da `Lista_de_Arte_e_Som.md` sem mexer no código; avisar o Pablo quando for a hora de gerar a arte; até chegar, os quadrados continuam;
   3. Fase 5 (polimento e testes): TEST-008 (navegadores, telas, acessibilidade), TEST-009 (checklist da especificação do professor) e TEST-010 (regressão completa); os problemas conhecidos (o apelido reservado de conta nunca confirmada; a partida jogada sem internet que se perde se a aba fechar; textos cortados ou que cobrem a tela); prints de todas as telas em `documentacao/` como protótipos atualizados (TASK-121 a TASK-123); DOC-006, a revisão final da documentação (diagramas de caso de uso e de atividades atualizados, PNG e PlantUML; requisitos; histórias; Conceito; matriz de rastreabilidade com tarefa e teste; o que ficou "fora do beta" marcado);
   4. Fase 6 (entrega): pacote final no GitHub (TASK-131) e o endereço principal com a versão final; **lembrar o Pablo de apagar as contas TesteA e TesteB do ranking, explicando como.**
2. **Cada parte segue o protocolo:**
   1. plano curto escrito no PLANO.md;
   2. programar;
   3. testes: `npm test`, lint, build, `npm run testar:navegador` e `npm run testar:floresta`, com conferências novas para o que for novo;
   4. atualizar PLANO.md, CLAUDE.md, a documentação (com "Alterações do projeto"), o Balanceamento e a pasta `testes/`.
3. **Sem esperar o ok do plano nem o teste do Pablo entre as fases (ritmo do Pablo em 10/10/2026):**
   - **No fim de cada fase:** publicar seguindo o item 4, mandar os dois relatórios do protocolo (com o "Teste visual para o Pablo" no endereço principal) e **seguir direto para a próxima fase**.
   - **O Pablo testa no site em paralelo.** Se ele mandar um problema: parar o que estiver fazendo, corrigir, publicar a correção (mesma regra do item 4) e depois continuar.
   - **Parar e esperar o Pablo só quando:**
     - precisar de algo que só ele faz (painel do Supabase ou da Vercel, arte, som): dizer exatamente o que fazer, passo a passo, e **adiantar o que não depender disso**;
     - precisar de uma decisão do grupo que mude regra do jogo (também adiantando o resto);
     - algo quebrar e não der para resolver.
4. **Commits e publicação (regra do Pablo em 09/10/2026; troca a das prévias por ramo, do mesmo dia):**
   - O único endereço do jogo é `https://jogo-rpg-six.vercel.app`, e ele mostra sempre o `main`. A Vercel só publica o `main` (`programacao/vercel.json`, `git.deploymentEnabled`): nada de endereços de prévia por ramo.
   - Dá para trabalhar em ramos LOCAIS (`fase-4`...), saídos do `main`, com commits por parte (testes passando, mensagem clara terminando com a linha Co-Authored-By). Esses ramos não vão para o GitHub: o que o Pablo testa é sempre o endereço principal.
   - No fim de cada fase:
     1. rodar todos os testes (`npm test`, lint, build, `testar:navegador` e `testar:floresta`);
     2. com tudo passando, juntar no `main` e fazer o push;
     3. depois que a Vercel publicar, conferir o endereço principal: `npm run conferir:configuracao` (diz também se o último `main` já está no ar) e `npm run testar:contas:publicado`;
     4. mandar os dois relatórios, com o "Teste visual para o Pablo";
     5. seguir direto para a próxima fase.
   - **Nunca publicar no `main` uma fase com teste falhando.**
   - Se algo quebrar no site depois de publicar: voltar o `main` para a versão anterior na hora, com `git revert` (nunca apagar histórico), e avisar o Pablo.
5. **"Onde parei":** antes de mudar de parte, atualizar no topo do PLANO.md a parte atual, o que falta e o próximo passo.
6. **Conteúdo que o grupo ainda não entregou** (TASK-010, 012, 013, 014, 015 e 016):
   - não esperar: criar conteúdo provisório coerente com o Conceito (classes, Floresta, Reino, Pedra de Retorno);
   - marcar tudo como **"PROVISÓRIO – substituir pelo do grupo"** nos arquivos de dados e no PLANO.md;
   - todo conteúdo fica em arquivos de dados, para trocar sem mexer no código;
   - quando o conteúdo de verdade chegar, trocar e rodar todos os testes.
7. **O que depende do Pablo, avisado na hora certa:**
   - **Arte:** a lista de assets com tamanhos (TASK-110, `documentacao/Lista_de_Arte_e_Som.md`) e o sistema pronto para receber os arquivos sem mexer no código; avisar quando for a hora de ele gerar no PixelLab. Até chegar, quadrados e cinza.
   - **Som:** a lista de músicas e efeitos (TASK-104). Até chegar, o sistema de áudio pronto, com o mudo funcionando, recebendo os arquivos sem mexer no código.
   - **Decisões do grupo** (hospedagem TASK-130, nome do jogo, cor do Guerreiro, tema padrão): perguntar na hora e usar um valor provisório até lá.
8. **Regras que não mudam:**
   - Nada pode travar o jogo a ponto de alguém não conseguir jogar: personagem preso, tela que não abre, save estragado que trava. Testar esses casos em cada fase.
   - Tudo o que é de teste (barra de teste, painel DEV, Subir nível, +300 de ouro) existe só no `npm run dev`.
   - Cronograma apertado: não cortar nada sozinho. Propor cortes na ordem da seção 12 da "Auditoria e Backlog" e perguntar.
   - **Congelamento em 22/11:** depois disso, só correção, testes e documentação.
   - Na Fase 5: gerar prints de todas as telas em `documentacao/`, como protótipos atualizados (TASK-121 a TASK-123).
   - Conteúdo do grupo que ainda não chegou continua provisório, marcado e em arquivos de dados; quando o Pablo mandar o de verdade, trocar e rodar todos os testes.
   - A decisão mais recente vale. Se a documentação contrariar o pedido do Pablo, avisar e atualizar a documentação.

## Etapas
1. Base do projeto ✔
2. Esqueleto de telas navegável ✔
3. Estado global e salvamento local (modo convidado) ✔
4. Regras puras com testes (taxa, XP, peso) ✔
5. Partida com quadrados (Phaser) ✔ (Fase 1 do `PLANO.md`, aprovada pelo Pablo em 08/10): 5a (arena, Líder, grupo, ataques, inimigos), 5b (colisão e travamento, IA dos aliados, desmaio e resgate, Sacerdote, mana e habilidades de teste), 5b.1 (IA em três níveis, sem tremor, linha de tiro), 5c (em combate, pausa, Q, F, fim com números reais, HUD completo, tecla M), 5d (Sacerdote sempre curando, um nível da IA não atrapalha o outro) e 5e (DOC-003)
6. Mundo (zona segura, regiões, minimapa) ✔ (Fase 3, publicada e aprovada pelo Pablo em 10/10)
7. Telas do Reino com dados de exemplo (adiantados na Fase 1: 7a, contratos na Guilda; 7b, pentágono na Seleção e nas Árvores e HUD do Reino) ← em andamento (Fase 4, ramo local `fase-4`)
8. Supabase (login, tabelas, sessão única, salvamentos, convidado → conta) ✔ (Fase 2, aprovada e publicada em 09/10 em `https://jogo-rpg-six.vercel.app`)
9. Ranking, conquistas e som (o ranking com as 6 abas e o histórico já estão na Fase 2)
10. Arte
