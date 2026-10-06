# Jogo RPG (nome a definir)

## O que é
RPG 2D visto de cima, em pixel art, só para computador (teclado e mouse). Trabalho de Análise e Projeto de Sistemas + Desenvolvimento Web 2 (UTFPR Campo Mourão), equipe de 3. Entrega do código e versão beta em 03/12/2026.

## Pastas
Código em `programacao/` (rodar npm lá); documentação em `documentacao/` (fonte de verdade). O caminho até a entrega e a situação de cada item da auditoria (TASK/DOC/TEST) ficam no `PLANO.md` da raiz.
Comandos: `npm run dev`, `npm test` (Vitest), `npm run lint` e `npm run balanceamento` (gera o `documentacao/Balanceamento.md` com todos os valores e limites).

## Stack e arquitetura
- React na interface (obrigatório) + Supabase (contas e dados). A partida é desenhada com Phaser (canvas) em `src/jogo/`; HUD, menus e janelas continuam em React.
- Imagens são só fundo. Textos, botões e áreas clicáveis são componentes React por cima.
- Primeiro funcional, depois bonito: no início cada classe é um quadrado colorido e os ataques são quadradinhos.
- Estado global em `src/estado/` (um reducer); salvamento no navegador em `src/salvamento/`, no formato `{ formato, versao, salvoEm, progresso, partidaEmAndamento }`. Campo novo no progresso entra pelo `normalizarProgresso`; campo que muda de nome ou lugar pede um formato novo com migração (`formato.js`). Durante a partida o progresso salvo não muda: os ganhos ficam na partida atual e só entram no progresso ao encerrar (RF12).
- Regras puras (taxa, XP, atributos, mochila, fim da partida, Guilda) em `src/regras/`, cada uma com teste ao lado. Valores da documentação em `src/dados/regras.js` e `taxas.js`; provisórios só em `src/dados/balanceamento.js`. Os testes de limite em `balanceamento.test.js` barram números absurdos.

## Regras que moldam as telas
- Conta: e-mail e senha, apelido único, confirmação de e-mail obrigatória e "esqueci minha senha". Dá para jogar como convidado (salvo só no navegador); ao criar conta, o progresso do convidado vai para a conta. Uma conta = uma sessão ativa.
- Ranking (Salão da Glória): visível para todos, até sem login, mas só quem tem conta aparece nele. Dentro do Salão da Glória ficam também o histórico de partidas (só para o próprio jogador logado) e as Conquistas (para quem já está jogando, convidado ou conta).
- Classes: Guerreiro, Mago, Tanque, Sacerdote e Arqueiro. A classe inicial é gratuita; um personagem por classe; as outras classes vêm de contratos na Guilda (temporário ou permanente).
- Reino (hub): Guilda (contratos e missões), Mercado, Forja, Mochila, Árvores de Habilidades, Jogar, Ranking e Configurações.
- Jogar abre um mapa em forma de ovo. No centro fica o Planalto (Reino, fazenda, mina e lago, com minijogos que não contam como partida). Em volta: Floresta, Deserto, Tundra e Vulcânico. No beta, só a Floresta.
- Fluxo da partida: bioma → ponto de partida → preparação (Líder e mochila) → "Começar partida" → partida → resumo. A partida vai até voltar ao Reino.
- Resultados: Grande Vitória, Vitória, Retorno forçado (amarelo) e Derrota (com cutscene). Sem empate. Só o ouro é taxado; XP nunca.
- Ranking e Configurações aparecem em quase todas as telas. Na partida, só Configurações, que abre sem pausar. Esc fecha a janela aberta; se não houver nenhuma, pausa.

## Convenções
- Nomes de telas, componentes e variáveis em português.
- Números do jogo (taxas, XP, atributos, peso) ficam em arquivos de dados, nunca espalhados no código.
- Hitboxes separadas das imagens, para trocar a arte sem quebrar nada.
- Não instalar bibliotecas sem perguntar (já aprovadas: Vitest e Phaser). Plano antes de qualquer mudança grande.
- Commits ficam com o Pablo: não commitar sem ele pedir.
- Decisão que muda a documentação: atualizar o texto do documento e registrar na seção "Alterações do projeto" dele (no Conceito, a seção 21, sem reescrever o original). O PNG do diagrama sai do `.puml` pelo PlantUML.

## Protocolo de cada tarefa
1. Ler CLAUDE.md, PLANO.md e os documentos ligados à tarefa antes de mexer.
2. Mostrar um plano curto (arquivos, abordagem, valores provisórios) e esperar o ok do Pablo antes de programar.
3. Perguntar antes de: instalar biblioteca, apagar arquivo, mudar o formato do save ou contrariar a documentação. Se a documentação e um pedido do Pablo discordarem, vale o mais recente, mas avisar.
4. Testar sempre que possível: `npm test`, lint e build no fim de cada parte; teste novo para toda regra pura nova; se der para abrir o jogo no navegador, abrir e conferir. Dizer o que não deu para testar.
5. Se travar ou algo der errado, parar e explicar em vez de improvisar.
6. Atualizar no mesmo trabalho o PLANO.md, o CLAUDE.md e o documento afetado. Números novos vão em `src/dados/balanceamento.js`, regenerando o `Balanceamento.md`.
7. Não fazer commit; sugerir a mensagem no fim.
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

## Etapas
1. Base do projeto ✔
2. Esqueleto de telas navegável ✔
3. Estado global e salvamento local (modo convidado) ✔
4. Regras puras com testes (taxa, XP, peso) ✔
5. Partida com quadrados (Phaser) ← próxima (Fase 1 do `PLANO.md`; plano da parte 5a aguardando o ok)
6. Mundo (zona segura, regiões, minimapa)
7. Telas do Reino com dados de exemplo
8. Supabase (login, tabelas, sessão única, salvamentos, convidado → conta)
9. Ranking, conquistas e som
10. Arte
