# Mensagem do Claude do chat para o Claude Code — Diagnóstico completo do Jogo RPG

> **Modelo e esforço:** rode esta tarefa com **Opus 5.5, esforço alto**.
> **De quem é esta mensagem:** do Claude do chat (claude.ai, projeto "Jogo RPG"), que organiza o projeto com o Pablo e monta os planos. Você é o Claude Code, que programa. O Pablo leva os textos de um para o outro.
> **Data:** 19/11/2026.

---

## 0. O que eu preciso de você agora (resumo em 6 linhas)

1. **NÃO programe nada nesta tarefa.** É só leitura, análise e testes que não mudam nada.
2. Leia o projeto inteiro (código, documentação, testes, git, skills, scripts) como se fosse auditar uma casa abrindo todos os quartos.
3. Rode os testes locais que você conseguir rodar, para dizer com números o que está funcionando.
4. Escreva um **diagnóstico completo** no arquivo `mensagens-claude/2026-11-19-diagnostico-do-claude-code.md` (seções na parte 5 desta mensagem). Pode ficar enorme: quanto mais completo, melhor. Não economize.
5. Além do estado atual, analise **como cada funcionalidade nova planejada (parte 3) caberia no código de hoje**: onde mexer, riscos, tamanho e ordem sugerida.
6. No fim, mostre no chat só um resumo curto e o caminho do arquivo. O Pablo traz o arquivo para mim, e eu monto o plano grande com ele.

---

## 1. Regras desta tarefa (obrigatórias)

- **Somente leitura.** O único arquivo que você pode criar é o do diagnóstico (`mensagens-claude/2026-11-19-diagnostico-do-claude-code.md`). Não altere, mova nem apague nenhum outro arquivo.
- **Não troque de ramo** (`git checkout`, `switch`, `stash`, `reset`, `merge`): a pasta de trabalho tem mudanças sem commit (a Área do Desenvolvedor D1 e arquivos de arte do Pablo) que não podem se misturar nem se perder. Para olhar outros ramos, use `git log`, `git show <ramo>:<arquivo>`, `git diff main..<ramo> --stat` e similares, sem mudar o que está na pasta.
- **Sem commit, push, publicação, SQL no Supabase, instalação de bibliotecas ou gerações no PixelLab.**
- **Testes:** pode rodar `npm test`, o lint, o build e os roteiros locais do navegador (`testar:navegador`, `testar:floresta`, `testar:reino`, `testar:paredes`, `testar:botoes`, `testar:camadas`, `testar:arte`) e os conferidores só de leitura (`conferir:arte`, `conferir:configuracao`). **Não rode** nada que escreva no Supabase de verdade ou no site publicado (`testar:contas`, `testar:contas:publicado`), a não ser que só leia. Se um teste precisar do contorno do Windows (Rolldown em WASM, `RAYON_NUM_THREADS=1`, descrito no PLANO.md), use o contorno e diga se ele ainda é necessário.
- **Se o limite de uso acabar no meio:** escreva o diagnóstico **seção por seção**, salvando o arquivo a cada seção terminada, e mantenha no topo do arquivo uma linha "Progresso: seções prontas X de Y". Assim, quando o Pablo disser "continue o diagnóstico de onde parou", você continua pelo arquivo, sem refazer nada.
- **Honestidade acima de tudo:** quando não souber, diga "não verificado" e por quê. Quando um teste falhar, mostre a falha. Não arredonde nada para parecer melhor.

---

## 2. O que eu (Claude do chat) já sei, para você confirmar ou corrigir

Li o repositório em 18 e 19/11. Confirme cada ponto ou diga o que está errado:

**Git e pasta de trabalho**
- Ramo atual: `area-dev`. Ramos locais: `ajustes-partida`, `area-dev`, `arte`, `camadas`, `fase-4`, `interface`, `main`, `visual-novo`.
- Último commit: `c68b4bc` (camadas com as peças do Pablo publicadas, `8008ce1`).
- Sem commit: arquivos da D1 (`src/areaDev/`, `conta/servicoDev.js`, `regras/areaDev.js`, `dados/areaDev.js`, `supabase/003_area_dev.sql` e mudanças em `fluxo.js`, `servico.js`, `main.jsx`, `regras/contas.js`, `vercel.json`), além de `.agents/`, `.codex/`, `AGENTS.md`, `documentacao/Guia_de_Arte.md`, `Telas/reino_pixel_art/04_muralhas.png` e relatórios de arte em `testes/2026-11-*`.

**Documentação**
- `documentacao/diagramas/02_Diagrama_Casos_de_Uso.puml`: último commit em **01/10** (desatualizado).
- `04_Diagrama_Atividades_Partida.puml`: último commit em **06/10**.
- `docAdicional/08_Requisitos.md`: atualizado até **22/10** (55 RFs).
- `ideias/01_Conceito_do_Jogo.pdf`: de **08/10** (o .docx tem a seção 21.6 de 22/10, mas o PDF não foi exportado de novo).
- `documentacao/prototipos/`: 17 imagens de **02/10** (os protótipos antigos, anteriores às contas, à mochila nova, ao visual novo e às camadas).

**Jogo**
- Publicado em https://jogo-rpg-six.vercel.app (o `main`).
- Floresta: 7.200 × 3.600 px (`src/dados/mundo/floresta.js`), atravessada em uns 30 s.
- Mobs provisórios: lobo, aranha, javali, cervo (não hostil) e o Boss Guardião da Floresta.
- Personagens ainda são quadrados coloridos na partida. A arte dos personagens está em `programacao/arte-original/` (várias rodadas em 16, 32 e 64 px), sem integração. Mago e Tanque (32 × 32) foram aprovados pelo Pablo; o resto está em avaliação.
- O SQL `002_hora_do_servidor.sql`: o Pablo diz que funciona e que a senha mínima de 8 caracteres já é conferida.

---

## 3. Decisões novas do Pablo (18 e 19/11) e o que vem por aí

Isto é para você entender o contexto e **analisar a viabilidade**. Ainda não é para fazer.

### 3.1 Decisões
- **A parte visual (pixel art) fica para o final.** Primeiro o jogo funcional e completo, depois bonito.
- **A Área do Desenvolvedor (D1 a D5) é extra** e fica para depois. A D1 programada continua parada no ramo `area-dev`.
- **Não haverá apresentação em novembro.** A entrega é em dezembro. As datas que estavam no Trello eram provisórias.
- **Versão mobile e multiplayer:** só no futuro. Mobile só depois que o jogo estiver entre 80 e 90% pronto. Nada disso agora.
- O Pablo usa **sempre o Opus 5.5** (esforço médio, alto, extra ou max).

### 3.2 Bloco URGENTE (documentação e organização)
1. **Diagrama de caso de uso novo** (PlantUML + PNG), com tudo o que o jogo tem hoje e o que vai entrar: Caravana, conversar com NPC (comerciante, ferreiro, mestre da Guilda), minijogos diários, opções de dev (e a Área do Desenvolvedor como extra, se fizer sentido).
2. **Diagramas de atividades atualizados:** Partida, Acesso e Guilda, e um novo da **Caravana**.
3. **Protótipos novos:** os prints de todas as telas (já existe `npm run prints`), organizados e ligados aos casos de uso, substituindo os de 02/10.
4. **Requisitos, histórias de usuário e matriz de rastreabilidade** batendo com o jogo final, incluindo as funcionalidades novas.
5. **PDF do Conceito exportado de novo**, com uma seção "Trabalhos futuros" (multiplayer, mobile, outros biomas, pergaminhos de treinamento).

### 3.3 Bloco IMPORTANTE (jogo)
1. **Floresta muito maior e fixa.**
   - Hoje atravessa em uns 30 s; a meta é levar **vários minutos** (eu sugeri de 3 a 5 min de ponta a ponta na velocidade normal).
   - Sempre o mesmo mapa (não procedural), que reinicia a cada partida.
   - As regiões fácil, média e difícil têm **forma natural**, não são círculos. O domínio do chefe fica no fim do mapa.
   - Entre as regiões há **zonas neutras**.
2. **Mobs e lugares:**
   - Região fácil: lobos soltos (bichos para aprender a lutar com um de cada vez).
   - Região média: um **acampamento goblin** (este sim, circular e concentrado), para aprender tática.
   - Região difícil: um **forte ou aldeia goblin** com muitos goblins.
   - Chefe: o **Ogro**. O Guardião da Floresta fica para depois, como chefe mais avançado.
   - **10 mobs** que façam sentido numa floresta. Minha sugestão: Lobo, Lobo Alfa, Javali, Cervo (não hostil), Aranha, Aranha-Mãe (cospe teia), Goblin Lanceiro, Goblin Arqueiro, Goblin Xamã (cura os goblins) e Orc. Mais o Ogro.
   - **Animais pacíficos** nas zonas neutras (o cervo e mais um), que nunca atacam e **se afastam das áreas de predadores**. Cada mob fica sempre na sua área (cervo não vai onde tem lobo; lobo não vai onde tem goblin).
   - Animais inofensivos dão **XP ridiculamente baixo**.
3. **Caravana** (substitui a escolha do "ponto de partida", que hoje deixa o jogador "descobrir" uma região difícil só fugindo de lá):
   - Paga ouro para ser levado a uma **zona neutra** mais à frente: perto da região fácil, da média, da difícil ou do fim do mapa.
   - **Nunca** deixa dentro de uma região.
   - O preço tem que ser **bem caro**, crescendo com a distância.
4. **NPCs com fala e menu:**
   - Mercado: um **comerciante** com jeito de vendedor medieval. Ele se apresenta, explica a loja (funciona também como tutorial) e oferece Comprar, Vender, Trocar e Ir embora.
   - Forja: um **ferreiro velho e ranzinza** que odeia monstros, com Equipar, Comprar, Vender, Fabricar e Ir embora.
   - Guilda: um **mestre da Guilda** para missões e contratos.
   - Por enquanto, um NPC por lugar, com balão de fala e menu simples.
5. **Bonecos de quadradinho com corpo** (antes da pixel art, feitos em código):
   - Corpo quadrado grande, **cabeça grande** ("cabeçudinho"), um quadradinho ou retângulo embaixo, **duas perninhas** e **dois bracinhos**, balançando de leve.
   - Uma mão segura a arma e a outra fica para baixo, mexendo.
   - Guerreiro: uma **espada bonita**, que pareça espada de verdade.
   - Mago: um **cajado de madeira**.
   - Sacerdote: um **cetro com uma orbe** (não precisa ser esfera perfeita).
   - Tanque: um **escudo mais bonito**, e o braço acompanha o escudo.
   - Arqueiro: o **arco**.
   - No **Tanque e no Arqueiro**, o braço e a arma acompanham a mira em todas as direções (para cima, para baixo, para os lados), e o corpo dá uma "viradinha" quando o braço passaria na frente do corpo. Tem que ficar bonito, não estranho.
   - Animação simples de andar (perninhas alternando) e de atacar.
   - **Mobs e animais também em quadradinhos**, cada um com formato e cores que façam sentido: cervo marrom e com outro formato; lobo cinza e de quatro patas; goblin verde; outro goblin ou o Ogro em verde mais escuro; aranha com patas. Um cervo não pode ter o mesmo formato de um lobo.
6. **Opções de dev:** super velocidade, **teletransporte** clicando no mapa e um **simulador de balanceamento** ("party de nível X contra a região Y": quanto tempo aguenta, quanto dano dá e recebe).
7. **Balanceamento por nível (provisório, para discutir):**
   - Um jogador que acabou de começar consegue a região fácil com **muito esforço** e ainda pode morrer. Nunca dá conta da média, da difícil ou do chefe, a não ser desviando com perfeição.
   - A fácil ensina a pegar um bicho por vez; a média ensina tática.
   - **Sem bloqueio artificial:** a barreira é ter atributos (dano, vida, velocidade). Se o jogador fosse rápido o bastante, conseguiria.
   - O Pablo **não quer** as faixas 20/40/70/100 nem 25/50/75/100. Quer uma proposta que faça sentido para o jogo, para conversarmos.
8. **Minijogo do Lago mais visual:** um bonequinho com vara de pesca; no momento certo ele puxa e o peixe aparece. Fazenda e Mina ficam para depois.

### 3.4 Ideias futuras (só anotar; NÃO fazer)
- **Pergaminhos de treinamento:** ler ensina o grupo a enfrentar uma espécie ou lugar (ex.: forte goblin), com uns +10% e a IA dos aliados mais eficiente contra aquele mob.
- **XP que diminui:** depois de matar muito o mesmo tipo de mob, ele deixa de dar experiência.

---

## 4. Como ler o projeto (sugestão de ordem)

1. `CLAUDE.md`, `AGENTS.md`, `PLANO.md` (inteiro, inclusive os planos antigos e a tabela do backlog), `testes/Registro.md` e `testes/Roteiros.md`.
2. `documentacao/` inteira: README, Balanceamento, Guias de Arte e de Interface, Lista de Arte e Som, passo a passo do Supabase e da Vercel, `diagramas/`, `docAdicional/` (casos de uso, histórias, requisitos, matriz), `ideias/` (Conceito), `prototipos/`, `Telas/`.
3. `programacao/`: `package.json`, `vite.config`, `vercel.json`, `src/` inteiro (`dados`, `regras`, `estado`, `salvamento`, `conta`, `jogo`, `telas`, `janelas`, `componentes`, `arte`, `audio`, `estilo`, `areaDev`, `testes`), `scripts/`, `supabase/`, `arte-original/`.
4. `.claude/` (skills do projeto, configurações), os plugins instalados e as conexões MCP que você enxerga.
5. Git: ramos, commits que não estão no `main`, o que está publicado.

---

## 5. Formato do diagnóstico (seções obrigatórias)

Escreva em português, com tabelas onde ajudar, **caminhos de arquivo** em tudo o que citar e números reais. Pode passar de 50 páginas se precisar.

### A. Retrato geral
- Estado do git: ramo atual, cada ramo local com o que tem a mais que o `main`, o que está publicado, a lista do que está sem commit agrupada pela origem (D1, arte do Pablo, outros).
- Versões (Node, Vite, Phaser, React, Vitest), o contorno do Windows e se ainda é preciso.
- **Resultados dos testes que você rodou**: quantos passam e quantos falham, por roteiro, com as falhas explicadas. Tempo de build e tamanho dos pacotes.

### B. Estado funcional por área
Tabela com cada funcionalidade e a situação (funciona / parcial / provisório / quebrado / falta), com o arquivo principal de cada uma. Cubra pelo menos:
- conta, convidado e save;
- Reino e camadas;
- Mochila;
- Mercado, Forja, Guilda (missões e contratos), Árvores;
- Salão da Glória;
- Mapa e Preparação;
- partida: combate, IA, desmaio, Q, F, taxas, resumo, HUD, tela cheia, carregamento;
- Floresta, mobs, Boss;
- minijogos, conquistas, som, configurações.
Depois, cruze com as **HU01 a HU43** e os **RF01 a RF55**: quais estão implementados como escritos, quais mudaram e onde o documento está errado.

### C. Documentação
- Para cada arquivo de `documentacao/`: data da última mudança, o que está desatualizado em relação ao código (lista concreta) e o que falta.
- Diagramas: dá para regerar os PNG com o PlantUML desta máquina? Como?
- Conceito: dá para exportar o PDF do .docx nesta máquina (Word por script, LibreOffice ou outro)? Como foi feito antes?
- Protótipos: o que o `npm run prints` gera hoje, quantas telas, onde salva, e o que falta para virar os protótipos novos.
- Uma proposta concreta de **lista de casos de uso novos e alterados** (com nomes e números) e de **requisitos novos e alterados** para as funcionalidades da parte 3.

### D. Personagens, arte e desenho na partida
- Como os personagens, mobs e efeitos são desenhados hoje na partida (arquivos, classes, funções), e como a arte de `src/assets/arte/` entraria.
- O que existe em `arte-original/`: cada pasta, o que é, o que foi aprovado pelo Pablo segundo os relatórios.
- **Para os bonecos de quadradinho (3.3.5):** onde e como desenhar corpo, cabeça, braços, pernas e armas em código; como fazer o braço girar com a mira e a "viradinha" do corpo; como animar andar e atacar; impacto em desempenho (hoje 60 FPS no pior cenário); o que muda na hitbox (o corpo de colisão é 32% do desenho). Proponha a abordagem técnica.

### E. Mundo (Floresta)
- Como a Floresta está definida (estrutura dos dados, regiões como retângulos ou outra forma, áreas com nome, pedras, mata, bordas), como os mobs nascem e ficam no território, como funcionam o minimapa, o "ponto de partida", a distância da taxa e o sono dos mobs longe do Líder.
- **Para o mapa grande (3.3.1 a 3.3.3):** o que quebra ou fica pesado com um mapa de 6 a 10 vezes mais largo (desenho, memória, minimapa, busca de caminho, nascimento de mobs, save do mapa descoberto, testes que dependem do tamanho atual). Proponha como representar regiões de **forma natural** (polígonos, máscaras, grade) e o acampamento e o forte goblin.
- **Para a Caravana:** o que precisa mudar no "ponto de partida", na tela de Preparação, na taxa por distância e na documentação.

### F. Mobs, combate e balanceamento
- Lista dos mobs e do Boss: comportamento, números (vida, dano, velocidade, XP, ouro), onde ficam e como se cria um mob novo.
- IA dos aliados com mobs novos (acampamento cheio de goblins, xamã que cura): o que pode dar errado.
- As fórmulas de hoje (vida, dano, defesa, crítico, curva de XP, pontos por nível, preços) com os números.
- **Avaliação da dificuldade atual:** o que um grupo de nível 1 faz hoje contra cada região e contra o Boss (use as regras puras para simular, se der; senão, estime e diga como estimou).
- Para o **balanceamento provisório (3.3.7)** e o **simulador (3.3.6)**: o que já existe que pode ser aproveitado e como você faria.

### G. Reino, telas e NPCs
- Como Mercado, Forja e Guilda são montados hoje (componentes, estado, camadas do Reino).
- **Para os NPCs (3.3.4):** onde entram o balão de fala e o menu, como guardar as falas em dados, como mostrar a fala de apresentação só na primeira vez (tutorial) e falas aleatórias depois.

### H. Minijogos
- Como cada minijogo funciona hoje, as rodadas diárias e a hora do servidor.
- **Para a pesca visual (3.3.8):** a abordagem (React ou Phaser), o que reaproveitar.

### I. Contas, Supabase e Vercel
- Arquivos SQL (001, 002, 003): o que cada um faz, quais o Pablo já rodou (diga como verificou ou se não deu para verificar).
- Estado da D1 (o que foi feito, o que falta para testar).
- Riscos: projeto gratuito do Supabase pausando, limite de envio de e-mail, contas TesteA e TesteB no ranking.

### J. Ferramentas de desenvolvimento
- O que existe hoje (painel `</> DEV`, barra de teste, arena de teste, scripts) e o que falta para super velocidade, teletransporte e simulador.

### K. Qualidade e dívidas
- Defeitos conhecidos (do PLANO e do Registro) e o estado de cada um (ex.: o aviso "EM RECARGA" que às vezes não aparece; o apelido de conta nunca confirmada; a partida jogada sem internet que some do histórico).
- Testes instáveis, avisos do lint, arquivos muito grandes, código duplicado, partes frágeis.

### L. Ferramentas do Claude Code
- Skills do projeto (`.claude/skills/`), plugins e conexões MCP: o que existe, o que funciona, o tamanho do CLAUDE.md, e o que você recomendaria acrescentar ou tirar para trabalhar melhor neste projeto (só recomendar).

### M. Plano técnico sugerido para os blocos URGENTE e IMPORTANTE
Para **cada item** das partes 3.2 e 3.3:
- abordagem técnica;
- arquivos afetados;
- tamanho (P, M, G ou GG);
- dependências entre itens;
- riscos;
- o que pode ser testado pelo Pablo no fim (o "teste visual" dele).

Depois, uma **ordem sugerida de execução em partes**, cada parte entregável e testável sozinha. Lembre que a documentação depende das funcionalidades: diga quando vale atualizar os diagramas (antes, durante ou depois das funcionalidades novas) e por quê.

### N. Perguntas e decisões em aberto
O que você precisa que o Pablo ou eu decidamos antes de começar. Para cada pergunta, a sua recomendação.

### O. Anexo: mapa do projeto
A árvore de `programacao/src/` (até 3 níveis), com uma linha dizendo o que cada pasta e arquivo principal faz. Mais a lista dos scripts de `package.json` e o que cada um faz.

---

## 6. Ao terminar

1. Confira que o arquivo `mensagens-claude/2026-11-19-diagnostico-do-claude-code.md` está completo (a linha "Progresso" no topo dizendo todas as seções prontas).
2. **Não faça commit** desse arquivo nem de nada.
3. No chat, mostre ao Pablo:
   - o caminho do arquivo;
   - um resumo de no máximo 15 linhas com as descobertas mais importantes (principalmente o que eu, Claude do chat, ainda não sabia);
   - quanto da tarefa ficou "não verificado" e por quê.
4. Diga ao Pablo que o próximo passo é levar o arquivo ao Claude do chat, que vai montar o plano.

Obrigado. Pode levar o tempo que precisar: a qualidade do plano depende deste diagnóstico.
