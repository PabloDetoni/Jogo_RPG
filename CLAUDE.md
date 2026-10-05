# Jogo RPG (nome a definir)

## O que é
RPG 2D visto de cima, em pixel art, só para computador (teclado e mouse). Trabalho de Análise e Projeto de Sistemas + Desenvolvimento Web 2 (UTFPR Campo Mourão), equipe de 3. Entrega do código e versão beta em 03/12/2026.

## Pastas
Código em `programacao/` (rodar npm lá); documentação em `documentacao/` (fonte de verdade).

## Stack e arquitetura
- React na interface (obrigatório) + Supabase (contas e dados). A camada de jogo em canvas (provavelmente Phaser) entra na etapa da partida.
- Imagens são só fundo. Textos, botões e áreas clicáveis são componentes React por cima.
- Primeiro funcional, depois bonito: no início cada classe é um quadrado colorido e os ataques são quadradinhos.
- Estado global em `src/estado/` (um reducer); salvamento no navegador em `src/salvamento/`. Durante a partida o progresso salvo não muda: os ganhos ficam na partida atual e só entram no progresso ao encerrar (RF12).

## Regras que moldam as telas
- Conta: e-mail e senha, apelido único, confirmação de e-mail obrigatória e "esqueci minha senha". Dá para jogar como convidado (salvo só no navegador); ao criar conta, o progresso do convidado vai para a conta. Uma conta = uma sessão ativa.
- Ranking (Salão da Glória): visível para todos, até sem login, mas só quem tem conta aparece nele. O histórico de partidas fica dentro do Ranking, só para o próprio jogador logado.
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
- Não instalar bibliotecas sem perguntar. Plano antes de qualquer mudança grande.

## Etapas
1. Base do projeto
2. Esqueleto de telas navegável
3. Estado global e salvamento local (modo convidado) ← etapa atual
4. Regras puras com testes (taxa, XP, peso)
5. Partida com quadrados
6. Mundo (zona segura, regiões, minimapa)
7. Telas do Reino com dados de exemplo
8. Supabase (login, tabelas, sessão única, salvamentos, convidado → conta)
9. Ranking, conquistas e som
10. Arte
