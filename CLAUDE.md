# Jogo RPG (nome a definir)

## O que é
RPG 2D visto de cima, em pixel art, só para computador (teclado e mouse). Trabalho de Análise e Projeto de Sistemas + Desenvolvimento Web 2 (UTFPR Campo Mourão), equipe de 3. Entrega do código e versão beta em 03/12/2026.

## Pastas
Código em `programacao/` (rodar npm lá); documentação em `documentacao/` (fonte de verdade). O caminho até a entrega e a situação de cada item da auditoria (TASK/DOC/TEST) ficam no `PLANO.md` da raiz. Os roteiros de teste manual (passo a passo para o Pablo) e o registro de todos os testes rodados (o que passou e o que falhou) ficam em `testes/` na raiz.
Comandos: `npm run dev`, `npm test` (Vitest), `npm run lint`, `npm run balanceamento` (gera o `documentacao/Balanceamento.md` com todos os valores e limites) `npm run testar:navegador` (roteiro da partida num Edge escondido) e `npm run testar:contas` (TEST-007: as contas com o Supabase de verdade, em dois Edges escondidos; precisa do SQL rodado e das duas contas de teste no `.env.local`).

## Stack e arquitetura
- React na interface (obrigatório) + Supabase (contas e dados). A partida é desenhada com Phaser 4 (canvas) em `src/jogo/` (cenas, entidades, ataques); HUD, menus, janelas e a barra de teste continuam em React.
- Phaser e React só conversam pela ponte (`src/jogo/ponte.js`): o Phaser manda a situação 8 vezes por segundo, o andamento (em combate, retornando, fugindo) quando muda, as mensagens curtas do HUD e o "fimDaPartida" (com os números para o Resumo); o React manda comandos (Q, fuga confirmada, Voltar ao Reino da pausa e a barra de teste) e a pausa. As contas do fim e o save ficam com o estado do jogo (`encerrarPartida`). O Phaser só carrega ao abrir a Partida (import dinâmico em `ArenaDaPartida.jsx`), e nunca há dois jogos ao mesmo tempo. No `npm run dev`, o jogo fica em `window.__jogoDaPartida` para testes no navegador.
- Roteiro de testes no navegador: `npm run testar:navegador` liga o Vite e um Edge escondido, joga a arena e confere tudo (prints em `programacao/testes-do-navegador/`, fora do git). Rodar no fim de cada parte e acrescentar as conferências do que for novo.
- Na partida, o HUD (faixa de cima) e a barra de teste (faixa de baixo) ficam fora da área jogável: a borda da arena é a beira delas (`dados/arenaDeTeste.js`).
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
- Habilidades de teste (uma por classe, tecla 1, até a TASK-010) ficam em `dados/habilidades.js` e o efeito de cada uma em `jogo/habilidades/`.
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
- Commits: no modo contínuo (seção abaixo), commit LOCAL no fim de cada parte, com todos os testes passando; o push só depois do teste visual do Pablo na fase. Fora do modo contínuo, não commitar sem ele pedir.
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
O Claude programa o resto do jogo até a entrega sem esperar o ok de cada parte. Se a sessão acabar no meio, o Pablo manda só "Continue o modo contínuo de onde parou": ler a seção **"Onde parei"** no topo do `PLANO.md` e seguir.

1. **Ordem (a do PLANO.md):**
   1. fim da Fase 1 (TASK-079, TASK-071, DOC-003);
   2. Fase 2 (contas e ranking);
   3. Fase 3 (mundo da Floresta);
   4. Fase 4 (Reino com dados);
   5. arte e som, quando houver material;
   6. Fase 5 (polimento e testes);
   7. Fase 6 (entrega).
2. **Cada parte segue o protocolo:**
   1. plano curto escrito no PLANO.md;
   2. programar;
   3. testes: `npm test`, lint, build e `npm run testar:navegador`, com conferências novas para o que for novo;
   4. atualizar PLANO.md, CLAUDE.md, a documentação (com "Alterações do projeto"), o Balanceamento e a pasta `testes/`.
3. **Sem esperar o ok do plano.** Parar e esperar o Pablo só quando:
   - **uma fase terminar:** mandar os dois relatórios do protocolo, com o "Teste visual para o Pablo", e esperar o teste dele antes da próxima fase;
   - **precisar de algo que só ele faz** (criar o projeto no Supabase, passar chaves, configurar e-mail, publicar, gerar arte): dizer exatamente o que fazer, passo a passo;
   - **precisar de uma decisão do grupo que mude regra do jogo;**
   - **algo quebrar** e não der para resolver.
4. **Commits:** no fim de cada parte, com todos os testes passando, commit LOCAL com mensagem clara (terminando com a linha Co-Authored-By). O push só depois do teste visual do Pablo na fase.
5. **"Onde parei":** antes de mudar de parte, atualizar no topo do PLANO.md a parte atual, o que falta e o próximo passo.
6. **Conteúdo que o grupo ainda não entregou** (TASK-010, 012, 013, 014, 015 e 016):
   - não esperar: criar conteúdo provisório coerente com o Conceito (classes, Floresta, Reino, Pedra de Retorno);
   - marcar tudo como **"PROVISÓRIO – substituir pelo do grupo"** nos arquivos de dados e no PLANO.md;
   - todo conteúdo fica em arquivos de dados, para trocar sem mexer no código;
   - quando o conteúdo de verdade chegar, trocar e rodar todos os testes.
7. **O que depende do Pablo, avisado na hora certa:**
   - **Fase 2:** projeto no Supabase, URL e chave no `.env` e o teste do e-mail de confirmação (TASK-090). Se ainda não estiver pronto, passar o passo a passo, adiantar a Fase 3 e voltar depois.
   - **Arte:** a lista de assets com tamanhos (TASK-110), cedo, para ele gerar no PixelLab em paralelo. Até chegar, quadrados e cinza.
   - **Som:** a lista de músicas e efeitos (TASK-104). Até chegar, o sistema de áudio pronto, com o mudo funcionando.
   - **Decisões do grupo** (hospedagem TASK-130, nome do jogo, cor do Guerreiro, tema padrão): perguntar na hora e usar um valor provisório até lá.
8. **Regras que não mudam:**
   - Nada pode travar o jogo a ponto de alguém não conseguir jogar: personagem preso, tela que não abre, save estragado que trava. Testar esses casos em cada fase.
   - Tudo o que é de teste (barra de teste, painel DEV, Subir nível, +300 de ouro) existe só no `npm run dev`.
   - Cronograma apertado: não cortar nada sozinho. Propor cortes na ordem da seção 12 da "Auditoria e Backlog" e perguntar.
   - **Congelamento em 22/11:** depois disso, só correção, testes e documentação.
   - Na Fase 5: gerar prints de todas as telas em `documentacao/`, como reserva para os protótipos atualizados (TASK-121 a TASK-123), já que o professor ainda não respondeu.
   - A decisão mais recente vale. Se a documentação contrariar o pedido do Pablo, avisar e atualizar a documentação.

## Etapas
1. Base do projeto ✔
2. Esqueleto de telas navegável ✔
3. Estado global e salvamento local (modo convidado) ✔
4. Regras puras com testes (taxa, XP, peso) ✔
5. Partida com quadrados (Phaser) ✔ (Fase 1 do `PLANO.md`, aprovada pelo Pablo em 08/10): 5a (arena, Líder, grupo, ataques, inimigos), 5b (colisão e travamento, IA dos aliados, desmaio e resgate, Sacerdote, mana e habilidades de teste), 5b.1 (IA em três níveis, sem tremor, linha de tiro), 5c (em combate, pausa, Q, F, fim com números reais, HUD completo, tecla M), 5d (Sacerdote sempre curando, um nível da IA não atrapalha o outro) e 5e (DOC-003)
6. Mundo (zona segura, regiões, minimapa)
7. Telas do Reino com dados de exemplo (adiantados na Fase 1: 7a, contratos na Guilda; 7b, pentágono na Seleção e nas Árvores e HUD do Reino)
8. Supabase (login, tabelas, sessão única, salvamentos, convidado → conta) ← em andamento (Fase 2): código, SQL e testes de unidade prontos; falta o Pablo rodar o SQL, configurar o Auth e as contas de teste, e os testes ao vivo (TEST-007)
9. Ranking, conquistas e som (o ranking com as 6 abas e o histórico já estão na Fase 2)
10. Arte
