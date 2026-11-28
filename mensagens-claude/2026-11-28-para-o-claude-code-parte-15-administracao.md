# Mensagem do Claude do chat para o Claude Code — Partes 15 e 16 (Administração, telas e teste de pixel art)

> **Modelo e esforço:** **Opus 5.5, esforço alto**. Comece **depois de terminar e publicar a Parte 14 (mobile)**.
> **De quem é:** do Claude do chat. **Data:** 28/11/2026. Entrega do professor: 03/12 às 23h59.
> Valem as regras de trabalho da Parte 14: **não parar** até terminar ou acabar o limite, e **avisar antes de cada
> teste demorado** (o que roda, quanto demora, hora de início e hora prevista do fim).

---

## Parte 15 · Área de Administração (substitui o plano D1 a D5 do `area-dev`)

Aproveite o que já existe no ramo `area-dev` (commit `ff0718c`: SQL 003, `src/areaDev/`, `servicoDev.js`, regras e
testes), mas **adapte** às decisões abaixo. Trabalhe num ramo novo `administracao`, saído do `main` (depois do mobile),
trazendo do `area-dev` só o que servir.

### 15.1 Quem é quem
- **Dono vitalício:** a conta **pablodetoni1@gmail.com** (atenção: Detoni, com **i**). Ninguém consegue tirar o dono do
  cargo, nem outro ADM, nem o próprio jogo. Só pelo SQL no painel do Supabase.
- **ADMs:** o dono dá e tira ADM de qualquer conta. Os ADMs (Lucas e Uener, depois) têm **todos os poderes do dono,
  menos** tirar o dono e dar ou tirar ADM de outra pessoa (só o dono faz isso).
- **Contas (decididas pelo Pablo em 28/11, de madrugada):**
  - **pablodetoni1@gmail.com** (hoje a TesteA) vira a conta do Pablo: **dono**, apelido **Pitufo**, volta ao ranking.
  - **Os roteiros passam a usar TesteB (pablodetoni2) e TesteC (pablodetoni3).** A senha da C já está no `.env.local`
    (`TESTE_CONTA_C_EMAIL` e `TESTE_CONTA_C_SENHA`; o Claude do chat acertou a senha dela no banco). Troque A e B por B e
    C em todos os roteiros e no `conferir:configuracao`, e confira que tudo passa antes de mexer na pablodetoni1.
  - **Lucas e Uener já têm conta** (criadas pelo Claude do chat, confirmadas, com perfil):
    `pablodetoni1+lucas@gmail.com` (apelido Lucas) e `pablodetoni1+uener@gmail.com` (apelido Uener). As senhas estão
    com o Pablo. Confira que as duas conseguem entrar no jogo (um roteiro só de login, sem escrever nada).
  - Escreva o `supabase/006_administracao.sql`: tabela dos papéis, **pablodetoni1 = dono** (apelido Pitufo, fora da
    lista "fora do ranking"), **Lucas e Uener = ADM**. **Não rode:** avise no relatório, e o Claude do chat roda.
- **Títulos:** cada ADM tem um **título**, que **só o dono** define ou muda (nem o próprio ADM). O título aparece junto
  do apelido com uma marca de "ADM" (no ranking, no perfil, na Administração). Títulos de agora: **Pablo = "Pitufo"**,
  **Lucas = "Little B"**, **Uener = "Linguiçaiolo"** (com ç; aceite acentos no título, mesmo que o apelido não aceite).

### 15.2 Entrar como dev
- Na tela de login, **só para contas ADM**, depois da senha aparece uma escolha: **"Jogar normalmente"** ou **"Entrar
  como dev"**. Conta comum nunca vê essa escolha.
- **Jogar normalmente:** o jogo exatamente como para qualquer jogador (sem painel de dev, sem barra de teste, aparece no
  ranking). **Entrar como dev:** os poderes ligados (as ferramentas de dev de hoje no site publicado: velocidade,
  teletransporte, subir nível, ouro, etc., mais o acesso à Administração).
- Dá para trocar de modo sem sair da conta (Configurações → "Modo dev: ligado/desligado"), só para ADM.
- No modo dev, a conta **não entra no ranking** (as partidas de dev não contam), e isso fica claro na tela.

### 15.3 Segurança (sem complicar a vida do Pablo)
- **A segurança de verdade fica no banco:** toda função de administração confere no Supabase se a conta é ADM (RLS e
  funções `security definer` que checam o papel). Mesmo que alguém ache a tela, o banco recusa tudo.
- **Sem endereço óbvio:** não existe `/admin`, `/dev` ou parecido. A Administração abre só por um botão que aparece
  para ADM no modo dev (por exemplo, no Reino e nas Configurações). Quem digitar `/admin`, `/dev`, `/adm` etc. vai
  para a Tela inicial, sem nenhuma mensagem que denuncie que existe algo.
- **Código de 6 dígitos (Google Authenticator): opcional**, desligado por padrão, com um botão para ligar. A senha basta.
- **Tudo registrado:** cada ação de ADM fica num registro (quem, o quê, quando, antes e depois), que ninguém apaga.
- A parte de administração é carregada à parte: quem não é ADM nunca baixa esse código.

### 15.4 O que tem na Administração
Mesmo visual do jogo, **bem organizado e intuitivo**, com abas:
1. **Painel (dashboard):** jogadores cadastrados, contas confirmadas, ativos hoje e na semana, partidas por dia, ouro e
   XP médios, monstros derrotados, resultados (vitória, derrota, fuga), classes mais usadas, pendências abertas,
   últimas ações dos ADMs. Gráficos simples.
2. **Jogadores:** buscar pelo apelido; ver conta, save, personagens, itens e histórico de partidas; **corrigir dados**
   (ouro, itens, nível), sempre com motivo e com o "antes → depois" registrado; **suspender** (com prazo: 1 dia, 7
   dias, 30 dias ou outro) ou **banir** (para sempre, até um ADM desfazer). Nunca apagar: a conta fica marcada. A conta
   suspensa ou banida vê o motivo e o prazo ao tentar entrar.
3. **Equipe:** lista de ADMs, dar e tirar ADM (só o dono), o registro de ações.
4. **Balanceamento:** todos os mobs, o chefe, as classes, os itens e os preços em **tabelas claras**, agrupados e com o
   nome de cada número em português ("Vida do lobo na região Fácil", "Dano do Ogro: pancada"). Editar, ver o
   **simulador** responder na hora (as metas da Parte 8 em verde ou vermelho) e **publicar**. O jogo passa a ler os
   números publicados no banco por cima dos de `src/dados` (se o banco falhar ou o número for inválido, vale o do
   código). Dá para voltar a uma versão anterior.
5. **Criação:** criar **item, equipamento, mob, personagem/NPC e som**. Cada criação tem:
   - um desenho feito no **Ateliê Pixel RPG embutido** (ou uma imagem enviada) e, para som, um arquivo de áudio;
   - um **nome** e uma **descrição livre do que faz** (ex.: "poção que recupera mana e dá 10 s de imunidade");
   - os **campos de jogo** quando der (peso, preço, raridade; para mob: vida, dano, velocidade, região, XP, ouro);
   - o **efeito**, escolhido de uma lista pronta (curar vida, curar mana, imunidade a dano por X s, aumentar atributo
     por X s, etc.). Se o efeito não existir na lista, marcar "precisa de programação".
   - Vai para **Pendências**.
6. **Pendências:** a fila das criações com o desenho, a descrição, quem fez e quando. Ações: **Aprovar e publicar**
   (entra direto no jogo, se usar só efeitos da lista), **Pedir mudança** (com comentário), **Recusar**, ou
   **Mandar para o Claude** (gera um arquivo em `mensagens-claude/pendencias/` com tudo, inclusive o PNG, pronto
   para o Claude transformar em código).
7. **Imagens e sons:** a biblioteca do que foi enviado (armazenamento do Supabase, só ADM escreve).
8. **Testes:** criar uma conta de teste, dar itens e ouro a ela, e zerar o ranking de teste.

### 15.5 Ateliê embutido
O Ateliê Pixel RPG está na pasta `DesingProgram` do Pablo (React + TypeScript). Embuta o editor na aba Criação (cópia
ou pacote local, sem biblioteca nova da internet). Se embutir der muito trabalho, faça primeiro "enviar PNG feito no
Ateliê" e diga no relatório quanto falta para embutir.

### 15.6 Documentação
Ator "Administrador" e "Dono" no diagrama de casos de uso (com include e extend), RFs, RNF de segurança, histórias,
matriz, Conceito (seção nova "Administração") e o PDF exportado de novo.

---

## Parte 16 · Telas que o Pablo achou feias e teclas novas (sem arte nova)

1. **Salão da Glória:** refazer bonito e bem formatado (pódio para os 3 primeiros, tabelas alinhadas, abas claras, a
   própria linha destacada, as Conquistas como cartões com ícone, progresso e data). Com poucos jogadores, não pode
   parecer vazio.
2. **Configurações:** refazer organizada em grupos (Som, Tela, Jogo, Conta), com interruptores e controles deslizantes
   bonitos no estilo do jogo.
3. **Os botões "Salão da Glória" e "Configurações" do canto das telas:** o Pablo acha feios. Faça placas ou ícones que
   combinem com o resto (no Reino, o desenho; nas outras telas, um ícone com nome).
4. **Teclas novas:**
   - **Tab abre o mapa grande** (o mapa inteiro, com "você está aqui", zoom com a roda do mouse e +/−, e arrastar).
   - **Mochila:** a tecla em cima do Tab (código `Backquote`, que no teclado brasileiro é a das aspas), e o **I** como
     alternativa.
   - **M** deixa de ser o mudo (o mudo fica nas Configurações e num botão pequeno do HUD).
   - **Setas também andam**, além do WASD.
   - Atualize o Como jogar, o HUD, os botões do celular (Parte 14) e a documentação.

---

## Parte 17 · Teste de pixel art (só uma amostra, para o Pablo aprovar; NÃO integrar)

O Pablo quer o jogo inteiro em pixel art no estilo dos personagens dele (`documentacao/arte-personagens/`). Antes de
refazer tudo, ele precisa **ver e aprovar uma amostra**. Faça só isto:
- **Escala única:** todos os pixels do jogo do mesmo tamanho na tela. Os personagens têm 32 × 32; uma árvore pode ter
  64 × 64, uma pedra 32 × 32, mas um pixel da árvore tem o mesmo tamanho de um pixel do cavaleiro.
- **Blocos que se repetem (como no Minecraft):** grama (3 variações), terra/trilha, água animada (3 quadros) e beira
  d'água, em 32 × 32.
- **Objetos:** 2 árvores (64 × 64 e 64 × 96), 3 pedras, 2 arbustos, 1 tronco caído, 1 ponte.
- **Paleta tirada dos personagens do Pablo** (contorno escuro igual ao deles, 2 a 3 tons por cor).
- Desenhe no formato do Ateliê (`.atelie.json`) e exporte PNG. Guarde em `documentacao/arte-amostra/`.
- Monte **uma cena de prova** (um pedaço de floresta de uns 20 × 12 blocos com os 5 personagens do Pablo no tamanho
  real do jogo) e tire um print em 1366 × 768.
- Página do grupo com a cena e cada peça ampliada. **Não integre nada no jogo.** O Pablo decide se aprova.

---

## Fim
- Publique as Partes 15 e 16 (a 17 é só amostra). Página do grupo de cada uma.
- Relatório em `mensagens-claude/2026-11-XX-relatorio-partes-15-a-17.md`, com o "Teste para o Pablo" (como entrar
  como dev, o que conferir em cada aba, as teclas novas) e as perguntas.
