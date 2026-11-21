# Diagnóstico do Jogo RPG, feito pelo Claude Code em 19/11/2026

Progresso: seções prontas 15 de 15 (A a O). Diagnóstico completo.

> **Para quem é:** o Claude do chat, que vai montar o plano grande com o Pablo.
> **Como foi feito:** leitura do repositório inteiro (código, documentação, testes, git, skills, scripts) e testes que
> não mudam nada.
> **Modelo:** Opus 5.5.
> **O que mudou na pasta:** antes do diagnóstico, o Pablo pediu um commit só da D1 no ramo `area-dev` (detalhes em A.1).
> Fora isso, o único arquivo criado é este. Nada foi publicado, nenhum SQL foi rodado e nada foi gerado no PixelLab.
>
> **Legenda:** "verificado" = conferi rodando ou lendo o código; "não verificado" = explico por quê.

---

## A. Retrato geral

### A.1 Git

**Correções ao que o Claude do chat sabia:**
- **O último commit não é mais o `c68b4bc`.** Hoje (19/11), por pedido do Pablo e antes do diagnóstico, fiz o commit
  `ff0718c` no ramo `area-dev`: "Área do Desenvolvedor, parte D1".
  - Entraram **só os 26 arquivos da D1**: `src/areaDev/`, `conta/servicoDev.js` e o teste dele, `dados/areaDev.js`,
    `regras/areaDev.js` e o teste dele, `supabase/003_area_dev.sql`, `supabase/README.md` e `testes/area-dev-D1.md`.
  - Também as mudanças da D1 em `conta/fluxo.js` e no teste dele, `conta/servico.js`, `main.jsx`, `regras/contas.js`
    e no teste dele, `vercel.json`, `CLAUDE.md` e **só as linhas da D1** do `PLANO.md`.
  - Não juntei no `main` nem fiz push. Antes do commit: 970 testes passando e lint sem erro.
- **O Conceito (`.docx`) vai até a seção 21.9** (camadas do Reino e do Mapa, 20 e 21/10), não até a 21.6.

| Ramo local | Commits a mais que o `main` | O `main` tem a mais | Situação |
|---|---|---|---|
| `main` | — | — | `c68b4bc` (22/10), igual ao `origin/main` (é o que está publicado) |
| `area-dev` (atual) | 1 (`ff0718c`, a D1) | 0 | só a D1 a mais; nunca foi para o GitHub |
| `camadas` | 0 | 2 | já está no `main` (pode ser apagado) |
| `visual-novo` | 0 | 9 | já está no `main` |
| `ajustes-partida` | 0 | 16 | já está no `main` |
| `interface` | 0 | 46 | já está no `main` |
| `arte` | 0 | 47 | já está no `main` |
| `fase-4` | 0 | 51 | já está no `main` |

- **Publicado:** https://jogo-rpg-six.vercel.app = `main` = `c68b4bc` (o código do jogo é o do `8008ce1`, de 22/10).
  O `main` tem 97 commits.
- **Ramos sem nada novo:** todos os ramos locais, menos o `area-dev`, já estão no `main` e podem ser apagados sem perder
  nada (`git branch -d`). Só recomendo, não apaguei.

**Sem commit na pasta (depois do commit da D1), agrupado pela origem:**

| Origem | Arquivos |
|---|---|
| Arte do Pablo (Codex, 08 a 15/11) | `documentacao/Guia_de_Arte.md` (anotações das rodadas 16/32/64 px), `documentacao/Telas/reino_pixel_art/04_muralhas.png` (**mudou**: 1,24 MB → 0,68 MB; o jogo usa a cópia de 21/10, então o jogo não muda), `PLANO.md` (entradas de arte de 08 a 15/11 no topo e no fim), `testes/Registro.md` e `testes/Roteiros.md` (entradas ARTE-*), 15 relatórios `testes/2026-11-*.md` |
| Ferramentas do Codex | `AGENTS.md` (cópia do CLAUDE.md com "Codex" no lugar de "Claude"), `.agents/skills/` (cópia das 7 skills), `.codex/config.toml` |
| Chat | `mensagens-claude/` (a mensagem do Claude do chat e este diagnóstico) |

**Arte fora do git:** `programacao/arte-original/` (26 MB, todas as rodadas dos personagens de 08 a 15/11) está no
`.gitignore`. Ela existe **só nesta máquina** (e no OneDrive, porque a pasta do projeto fica nele). Se o Pablo trocar de
computador ou o OneDrive falhar, ela se perde. Recomendação: guardar os finais aprovados (Mago e Tanque 32 × 32) num
lugar versionado, por exemplo `documentacao/arte-aprovada/`.

### A.2 Versões (verificado)

| Item | Versão |
|---|---|
| Node | 24.15.0 |
| Vite | ^8.3.0 (com Rolldown) |
| React e React DOM | ^19.2.8 |
| Phaser | ^4.2.1 |
| Vitest | ^5.0.3 |
| ESLint | ^10.10.0 (com `react-hooks` ^7.1.1) |
| `@supabase/supabase-js` | ^2.117.3 |
| PlantUML (extensão do VS Code) | 1.2024.3, com Java 1.8.0_481 e Graphviz 2.44.1 |
| Word | Office 16 (`WINWORD.EXE`) |

**O contorno do Windows não foi preciso hoje.** O PLANO.md (linha da D1, 09/11) diz que o Rolldown nativo era bloqueado
pelo Controle de Aplicativo do Windows e que o build precisava do Rolldown WASM e de `RAYON_NUM_THREADS=1`. Hoje rodei
`npm test`, `npm run lint` e `npm run build` **sem contorno**, e os três passaram:
- o `node_modules/@rolldown/binding-win32-x64-msvc` (nativo) funcionou;
- o `binding-wasm32-wasi` e o `node_modules/.cache/windows-wasm.config.mjs` continuam lá, sem uso.

Pode ser que o bloqueio volte com outra política do Windows. Se voltar, o caminho está no PLANO.md.

### A.3 Testes rodados hoje

| Teste | Resultado | Tempo |
|---|---|---|
| `npm test` (Vitest) | **970 de 970** passando, 59 arquivos | ~4 s |
| `npm run lint` | sem erro nem aviso | — |
| `npm run build` | ok | 0,66 s |
| roteiros do navegador | ver A.4 | — |

### A.4 Roteiros do navegador e conferidores (rodados hoje, um de cada vez)

| Roteiro | 1ª rodada | 2ª rodada (sozinho) | Normal (22/10) | Falhas |
|---|---|---|---|---|
| `testar:navegador` (arena) | **253 de 254** (444 s) | — | 254 | "IA avançada: Arqueiro e Mago não atiram na pedra" (o Arqueiro acertou a pedra 1 vez). Intermitente: em 22/10 falharam outras do mesmo tipo (K.2); o "EM RECARGA" passou hoje |
| `testar:floresta` | 31 de 32 (**parou na seção 9**, 44 s) | **72 de 73** | 73 | 1ª: o roteiro não achou nenhum cervo vivo e parou (erro de JS do próprio roteiro). 2ª: a mira com a câmera andando errou por 0,001 rad (−0,2248 contra −0,2239), um limite apertado demais. **FPS no pior cenário: média 60, mínimo 55, 5% piores 59** |
| `testar:reino` | 50 de 53 (**parou**) | 50 de 53 (parou igual) | 84 | **A tela cheia não funciona mais no Edge escondido.** "Começar partida entra em tela cheia" e "saiu da tela cheia sem pedir" falham ("Document not active"), e o roteiro para ao procurar o "Continuar" da pausa. **Rodei o mesmo roteiro numa cópia do `main` (sem a D1) e falhou igual**: não é o código, é o ambiente. O Edge desta máquina é o 157.0.4341.60 hoje (não sei qual era em 22/10). **As seções 10 em diante do roteiro do Reino não rodaram hoje (31 conferências)** |
| `testar:paredes` | **9 de 9** (352 s) | — | 9 | — |
| `testar:botoes` | **52 de 52** (373 s) | — | 52 | — |
| `testar:camadas` | 33 de 34 (98 s) | — | 34 | a tela cheia (a mesma causa do Reino) |
| `testar:arte` | **39 de 39** (25 s) | — | 39 | — |
| `conferir:arte` | ok | — | — | 30 de 288 imagens da lista existem (as do Reino e do Mapa; nenhuma de personagem, mob ou ícone) |
| `conferir:configuracao` | **"Tudo certo · 1 aviso"** | — | — | o aviso de sempre: a senha mínima de 8 não dá para conferir de fora. As contas A e B entram, o RLS segura, e o endereço principal está com o último `main` (`c68b4bc`) |

**Não rodei:**
- `testar:contas` e `testar:contas:publicado`, porque escrevem no Supabase de verdade (regra da tarefa);
- `conferir:site`;
- `npm run prints`, que apaga e recria a pasta de prints.

**Conclusão:** nenhuma falha de hoje aponta defeito novo no jogo.
- As falhas são de tempo ou de sorteio: a pedra, o cervo e a mira.
- A da tela cheia é do navegador desta máquina: falha igual no `main`.
- **Mas o roteiro do Reino precisa de conserto** (pular ou adaptar a tela cheia no Edge escondido); senão, 31 conferências
  dele ficam sem rodar.

**Tamanho dos pacotes do build (`dist/assets`, 26 MB no total):**

| Pacote | Tamanho | gzip |
|---|---|---|
| `criarJogo-*.js` (Phaser e a partida, carregado só ao abrir a partida) | 1.492 KB | 396 KB |
| `index-*.js` (React, telas, regras, Supabase) | 716 KB | 215 KB |
| `AreaDoDesenvolvedor-*.js` (só em `/dev`) | 17,5 KB | 5,5 KB |
| `index-*.css` | 49 KB | 11,6 KB |
| imagens do Reino (peças do Pablo, WEBP sem perda) | ~13,6 MB | — |
| imagens do Mapa | ~10,1 MB | — |
| `fundo-reino` e `fundo-mapa` (reserva, só se faltar o fundo) | 2,6 MB + 0,3 MB | — |

O Vite avisa que dois pacotes passam de 500 KB. Isso não é erro: o Phaser sozinho já tem esse tamanho.

---

## B. Estado funcional por área

**Legenda:**
- **Funciona:** feito e testado.
- **Provisório:** funciona, mas com conteúdo ou números de exemplo, à espera do grupo.
- **Parcial:** falta um pedaço.
- **Falta:** não existe.

### B.1 Tabela das funcionalidades

| Área | Funcionalidade | Situação | Arquivo principal |
|---|---|---|---|
| Conta | Convidado (só no navegador, uma aba) | Funciona | `src/salvamento/salvadorDoConvidado.js`, `salvamento/abaUnica.js` |
| Conta | Cadastro, login, confirmação de e-mail, esqueci a senha, apelido | Funciona (com 1 defeito: B.3) | `src/conta/fluxo.js`, `conta/servico.js`, `telas/acesso/` |
| Conta | Sessão única (sinal a cada 1 min, expira em 3) | Funciona | `conta/fluxo.js`, `supabase/001_contas.sql` |
| Conta | Save no banco com versão, fila e "pendente" sem rede | Funciona | `conta/fluxo.js`, `salvamento/salvadorLocal.js` |
| Conta | Passagem do progresso do convidado para a conta | Funciona | `regras/contas.js` (`escolherProgressoNoLogin`) |
| Conta | Conta banida (D1) | Parcial: código no `area-dev`, SQL 003 **não rodado** | `conta/fluxo.js`, `supabase/003_area_dev.sql` |
| Save | Save local a cada 3 min, ao esconder a aba e nos momentos de salvamento | Funciona | `src/salvamento/`, `estado/ProvedorDoJogo.jsx` |
| Reino | Hub em camadas (peças do Pablo, clique pelo desenho, contorno, animações) | Funciona | `telas/reino/Reino.jsx`, `componentes/cenario/` |
| Reino | Faixa com apelido, Líder, ouro e missão | Funciona | `telas/reino/Reino.jsx` |
| Mochila | Mochila do Reino (grade estilo Minecraft, lixeira, filtros, catálogo) | Funciona | `telas/reino/Mochila.jsx`, `componentes/ui/GradeComMao.jsx`, `regras/mochila.js` |
| Mercado | Comprar, vender, trocar, ofertas rotativas, catálogo | Provisório (catálogo da TASK-014) | `telas/reino/Mercado.jsx`, `regras/mercado.js`, `dados/mercado.js` |
| Mercado | NPC comerciante | **Falta** (o RF21 já fala em "Mercado com NPCs") | — |
| Forja | Equipar, comprar, vender, fabricar por receita | Provisório | `telas/reino/Forja.jsx`, `regras/forja.js`, `dados/forja.js` |
| Forja | NPC ferreiro | Falta | — |
| Guilda | Missões (matar, coletar, entregar, explorar), uma ativa, abandono com multa | Provisório (TASK-015) | `telas/reino/Missoes.jsx`, `regras/guilda.js`, `regras/missoes.js`, `dados/missoes.js` |
| Guilda | Contratos temporário e permanente | Funciona | `telas/reino/Contratos.jsx`, `regras/guilda.js` |
| Guilda | NPC mestre da Guilda | Falta | — |
| Árvores | Atributos, pentágono, pergaminho, habilidades (10 por classe, 4 no beta) | Provisório (TASK-010) | `telas/reino/ArvoresHabilidades.jsx`, `ArvoreDeHabilidades.jsx`, `regras/habilidadesDaArvore.js`, `dados/arvores.js` |
| Salão | Ranking (5 abas), histórico (20 por página), conquistas | Funciona (com 1 defeito: B.3) | `telas/reino/SalaoGloria.jsx`, `Ranking.jsx`, `Conquistas.jsx` |
| Mapa | Mapa em ovo em camadas; Floresta abre; outros com cadeado | Funciona | `telas/partida/Mapa.jsx` |
| Mapa | Ponto de partida (regiões descobertas) | Funciona (a Caravana vai trocar) | `telas/partida/PontoPartida.jsx`, `regras/mundo.js` |
| Mapa | Preparação (Líder e mochila da partida) | Funciona | `telas/partida/Preparacao.jsx` |
| Partida | Combate (clique de cada classe, esquiva, crítico, empurrão) | Funciona; dano **não** depende de Força nem Inteligência (ver F.3) | `jogo/cenas/CenaArena.js`, `regras/combate.js`, `jogo/ataques/` |
| Partida | Arco que carrega (Arqueiro) | Funciona | `regras/arco.js`, `jogo/arco.js` |
| Partida | Escudo do Tanque (gira com a mira, rompe com golpe forte) | Funciona | `jogo/ataques/escudo.js`, `regras/combate.js` |
| Partida | Habilidades 1 a 3, mana | Funciona (uma ativa de teste por classe, mais as da árvore) | `jogo/habilidades/`, `regras/habilidades.js` |
| Partida | IA dos aliados (básica, média, avançada) | Funciona | `jogo/iaDosAliados.js`, `regras/iaDosAliados.js`, `regras/nivelDaIA.js` |
| Partida | Desmaio (30 s), ajuda (5 s), Ressurreição | Funciona | `regras/desmaio.js` |
| Partida | Q (15 s), F (5 s), pausa, "em combate" | Funciona | `regras/andamentoDaPartida.js` |
| Partida | Taxas por distância, pontuação, Grande Vitória, resumo | Funciona | `regras/taxa.js`, `regras/fimDaPartida.js`, `telas/partida/Resumo.jsx` |
| Partida | HUD translúcido, minimapa com névoa, mochila com Tab | Funciona | `telas/partida/HudDaPartida.jsx`, `Minimapa.jsx`, `MochilaNaPartida.jsx` |
| Partida | Tela cheia, carregamento com dicas | Funciona | `componentes/telaCheia.js`, `telas/partida/CarregandoAPartida.jsx` |
| Partida | Cutscene da derrota | Funciona (sem imagens: só texto e cor) | `telas/partida/CutsceneDerrota.jsx` |
| Floresta | Mapa 7.200 × 3.600 com 5 regiões retangulares, 9 áreas com nome | Provisório (TASK-013) | `dados/mundo/floresta.js`, `regras/mundo.js` |
| Floresta | Mobs: lobo, aranha, javali, cervo (não hostil) | Provisório (TASK-012) | `dados/balanceamento.js` (`mundo.mobs`), `regras/mobs.js` |
| Floresta | Boss Guardião da Floresta (pisão, investida, espinhos) | Provisório | `jogo/entidades/GuardiaoDaFloresta.js` |
| Floresta | Coleta com E, drops, itens no chão por 30 s | Funciona | `regras/itensNoChao.js`, `jogo/entidades/ItemNoChao.js` |
| Personagens | Desenho na partida | Quadrados coloridos (sem arte) | `jogo/entidades/Entidade.js`, `Personagem.js` |
| Minijogos | Fazenda, Mina e Lago, com 3 rodadas por dia | Provisório (TASK-016), visual simples em React | `telas/partida/Minijogo.jsx`, `regras/minijogos.js`, `regras/rodadasDoDia.js` |
| Conquistas | Lista, progresso, recompensa em ouro | Provisório | `dados/conquistas.js`, `regras/conquistas.js` |
| Som | Música por tela e efeitos | Parcial: **não há nenhum arquivo de som**; tudo é bipe (`src/assets/audio/` só tem o LEIA-ME) | `audio/gerenciador.js`, `dados/sons.js` |
| Configurações | Música, Som, mudo (M), tema, tela cheia, animações do cenário, conta | Funciona | `janelas/Configuracoes.jsx` |
| Ajuda | "?" em cada tela, dica da primeira visita, Como jogar | Funciona | `dados/ajuda.js`, `janelas/Ajuda.jsx`, `janelas/ComoJogar.jsx` |
| Dev | Painel `</> DEV`, barra de teste, arena de teste | Funciona (só no `npm run dev`) | `componentes/PainelDev.jsx`, `telas/partida/BarraDeTeste.jsx`, `dados/arenaDeTeste.js` |
| Dev | Área do Desenvolvedor `/dev` (D1) | Parcial (commit no `area-dev`; SQL não rodado; roteiro manual não feito) | `src/areaDev/`, `conta/servicoDev.js` |

### B.2 Cruzamento com os requisitos (RF01 a RF55) e as histórias (HU01 a HU43)

Os 55 RFs, as 43 HUs e os 43 casos de uso existem e a matriz (`docAdicional/09_Matriz_de_Rastreabilidade.md`) bate com
eles (nenhum RF sem caso de uso, nenhum caso de uso sem RF). As histórias seguem os casos de uso um a um (HU01 = UC01...).

**Implementados como escritos (verificado pelo código e pelos roteiros):** RF01 a RF12, RF14 a RF20, RF22 a RF29, RF30,
RF31 (com as regiões retangulares e provisórias), RF33 a RF52, RF54 e RF55.

**Onde o documento está errado ou à frente do código:**

| Item | O que o documento diz | O que o código faz |
|---|---|---|
| **RF21** | "Mercado com NPCs" | não há NPC: o Mercado é um balcão com abas |
| **RF13** | "Tela Inicial com nome do jogo" | o nome ainda não foi decidido (o jogo mostra "Jogo RPG") |
| **RF24** | "Cada classe tem 10 habilidades" | 10 lugares por classe, só 4 no beta, com conteúdo provisório (TASK-010) |
| **RF32** | ponto de partida pelas regiões descobertas | funciona assim, mas a Caravana (3.3.3) vai substituir |
| **Conceito §6** | Força dá dano físico; Agilidade dá velocidade e o intervalo entre ataques; Inteligência dá dano mágico | só a vida (Vitalidade), a mana (Inteligência), a volta da mana (Sabedoria), o crítico (Agilidade), o arco (Força e Agilidade), o limite do escudo (Força) e a mochila (Força) dependem de atributo. **O dano da espada (25) e da bola mágica (30) é fixo, e a velocidade é 220 para todos.** O próprio código avisa: `regras/atributos.js`, `efeitoDoAtributo`, "Nada usa isso ainda" |
| **RF53** | o HUD | bate; o documento não cita a barra de teste, que é só do `npm run dev` (certo) |
| **RF18 / Conceito 21.9** | "Animações do cenário" | bate (feito em 21/10) |
| **Diagrama 02** | os 43 casos de uso | tem os 43 (inclusive o UC43, que já estava no projeto de 01/10), com um ator só ("Jogador"); falta o que mudou depois: Salão da Glória com as três abas, camadas, minijogos diários, opções de dev e tudo da parte 3 |

**Histórias:** as 43 batem com os casos de uso. Nenhuma fala de NPC, Caravana, opções de dev ou Área do Desenvolvedor.

### B.3 Defeitos achados que o Claude do chat citou (verificados no código)

1. **Apelido de conta nunca confirmada fica preso para sempre.**
   - Onde: `supabase/001_contas.sql`, linhas 27 a 40.
   - O gatilho do cadastro grava o perfil (o apelido) assim que a conta é criada, antes da confirmação do e-mail.
   - Uma conta que nunca confirma continua dona do apelido: ninguém mais consegue usá-lo.
   - Correção possível: um SQL novo (004) que libera apelidos de contas não confirmadas há mais de N dias, ou que só
     cria o perfil na confirmação.
2. **Partida terminada sem internet some do histórico e do ranking se o jogo fechar antes de a internet voltar.**
   - Onde: a fila `partidasParaRegistrar` fica só na memória (`estado/estadoDoJogo.js`, linhas 52 e 179), não no save.
   - O progresso (ouro, XP, itens) fica salvo; só o registro da partida (histórico e ranking) se perde.
   - Correção: guardar a fila na cópia local da conta (`salvamento/salvadorLocal.js`) e mandá-la no próximo login.
3. **O aviso "EM RECARGA" às vezes não aparece no segundo aperto da tecla 1** (A.4 e K.2).

---

## C. Documentação

### C.1 Cada arquivo de `documentacao/`

Datas: último commit no git (entre parênteses, quando o arquivo na pasta é mais novo e está sem commit).

| Arquivo | Último commit | O que está desatualizado em relação ao código | O que falta |
|---|---|---|---|
| `README.md` | 11/10 | lista de arquivos e o diagrama de 01/10; não cita o Guia de Arte nem o de Interface nem a pasta `Telas/` | atualizar a lista; pôr o nome do jogo quando houver |
| `Balanceamento.md` | 14/10 | **provavelmente em dia**: o `balanceamento.js`, o `regras.js`, o `taxas.js` e o `classes.js` não mudam desde 14/10 (não regenerei, porque o script escreve no documento) | as fórmulas novas, quando o balanceamento mudar |
| `Guia_de_Arte.md` | 22/10 (pasta: 15/11, sem commit) | as anotações das rodadas de 16/32/64 px estão sem commit e repetidas várias vezes no fim do arquivo (dois blocos iguais de 14 e 15/11) | arrumar as anotações; dizer o estado final (Mago e Tanque 32 × 32 aprovados) e a decisão nova: pixel art no final, bonecos de quadradinho antes |
| `Guia_de_Interface.md` | 22/10 | em dia com o código | o padrão do NPC (balão e menu), quando vier |
| `Lista_de_Arte_e_Som.md` | 22/10 | em dia com o Reino e o Mapa; os personagens continuam "a gerar" | os mobs novos (goblins, Ogro, Lobo Alfa, Aranha-Mãe, Orc), os NPCs e o boneco da pesca |
| `Supabase_passo_a_passo.md` | 10/10 | **só fala do `001_contas.sql`**: não fala do 002 (já rodado, conferi) nem do 003 (D1, não rodado) | os passos do 002 e do 003 (o README de `programacao/supabase/` já tem uma tabela dos três) |
| `Vercel_passo_a_passo.md` | 10/10 | não cita a reescrita do `/dev` (no `vercel.json` do ramo `area-dev`) | só quando a D1 for publicada |
| `Telas/ReinoRPG.png`, `MapaRPG.jpeg` | 05/10 | são as imagens principais (guia de posição) | — |
| `Telas/reino_pixel_art/`, `mapa_pixel_art/` | 22/10 | **`04_muralhas.png` foi trocado na pasta** (sem commit; 1,24 MB → 0,68 MB) | decidir se a muralha nova entra no jogo (o jogo usa a cópia de 21/10, cortada em duas) |
| `diagramas/02_Diagrama_Casos_de_Uso` (`.puml` e `.png`) | 01/10 | um ator só; não mostra o Salão da Glória com as três abas, as camadas nem os minijogos diários | tudo da parte 3 (C.5) |
| `diagramas/03_Diagrama_Atividades_Acesso` | 01/10 | **anterior às contas de verdade (Fase 2, 08/10)**: falta a escolha do apelido no primeiro login, "Conta em uso", a passagem do convidado e a conta banida | refazer pelo `conta/fluxo.js` |
| `diagramas/04_Diagrama_Atividades_Partida` | 06/10 | anterior à 5c (pausa, Q e F com "em combate"), à Fase 3 (ponto de partida, coleta com E, minimapa) e à mochila com Tab | refazer; a Caravana entra no lugar do ponto de partida |
| `diagramas/05_Diagrama_Atividades_Guilda` | 01/10 | o fluxo de missões e contratos ainda bate em linhas gerais | o NPC mestre da Guilda |
| `docAdicional/06_Descricao_dos_Casos_de_Uso.md` | 22/10 | em dia até as camadas | os casos de uso novos (C.5) |
| `docAdicional/07_Historias_de_Usuario.md` | 22/10 | em dia | as histórias novas |
| `docAdicional/08_Requisitos.md` | 22/10 | 55 RFs e 14 RNFs; o RF21 promete NPC; o §6 do Conceito promete efeitos de atributo que não existem (B.2) | os RFs novos (C.5) |
| `docAdicional/09_Matriz_de_Rastreabilidade.md` | 01/10 | **bate com os 43 casos de uso e os 55 RFs** (conferi), mas a coluna "Diagrama de atividades" aponta para diagramas desatualizados | as linhas novas |
| `ideias/01_Conceito_do_Jogo.docx` | 22/10 | vai até a 21.9; o §6 (atributos) e o §11 (combate) prometem mais do que o código faz | "Trabalhos futuros" (hoje há a §17, "Fora do escopo"); as decisões da parte 3 em 21.10 |
| `ideias/01_Conceito_do_Jogo.pdf` | 08/10 | **anterior às seções 21.6 a 21.9** e às mudanças de 09 a 22/10 | exportar de novo |
| `prototipos/` (17 PNG e `Leia prf.txt`) | 01/10 (não 02/10) | os protótipos de antes de tudo; o `Leia prf.txt` diz "são apenas ideias" | trocar pelos prints (C.4) |

### C.2 Diagramas: dá para regerar os PNG nesta máquina? Sim (verificado)

- **O que existe:** o PlantUML 1.2024.3 da extensão do VS Code (`~/.vscode/extensions/jebbs.plantuml-2.18.1/plantuml.jar`),
  o Java 1.8 e o Graphviz 2.44.1 (o `-testdot` diz "Installation seems OK").
- **Teste:** gerei os quatro PNG numa pasta temporária, sem tocar nos originais. Levou 16 s:
  ```bash
  cd documentacao/diagramas
  java -jar ~/.vscode/extensions/jebbs.plantuml-2.18.1/plantuml.jar -tpng -o <pasta de saída> *.puml
  ```
- **Cuidado:** o nome do PNG vem do `@startuml <nome>` e não do nome do arquivo. Saem `Diagrama_Casos_de_Uso.png`,
  `Atividades_Acesso.png`... e não `02_Diagrama_Casos_de_Uso.png`. Para manter os nomes atuais, é preciso renomear
  depois ou trocar o nome no `@startuml`.
- **Como foi feito antes:** não está registrado. O mais provável é a mesma extensão do VS Code (não verificado).

### C.3 Conceito: dá para exportar o PDF nesta máquina? Sim (verificado)

O Word 16 está instalado (`C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE`). Exportei uma **cópia** do
`.docx` para PDF pelo PowerShell (COM do Word), sem abrir janela: 23 páginas, 400 KB, em 9 s.

```powershell
$w = New-Object -ComObject Word.Application; $w.Visible = $false
$d = $w.Documents.Open("<cópia>.docx", $false, $true)
$d.ExportAsFixedFormat("<saída>.pdf", 17); $d.Close(0); $w.Quit()
```

Não há LibreOffice. O WPS Office está instalado, mas não testei. **Como foi feito antes:** não está registrado. O PDF
entrou no git junto com o commit "Fase 1, parte 5e" (08/10), sem dizer como foi gerado.

### C.4 Protótipos: o que o `npm run prints` gera hoje

- **Script:** `programacao/scripts/printsDasTelas.mjs` (`npm run prints -- <pasta> [escuro]`).
  - Liga o Vite e um Edge escondido em 1366 × 768 e joga como convidado.
  - Salva em `programacao/testes-do-navegador/telas/<pasta>/` (fora do git), **apagando a pasta antes**. Por isso não
    rodei hoje.
- **36 telas, numeradas:**
  - acesso: Tela inicial, Como jogar, Login, Narrativa e Seleção de classe;
  - Catálogo no começo, Reino e Mochila;
  - Mercado (4 abas e a ajuda), Forja (dica, 5 abas) e Guilda (missões, contratos temporário e permanente, temporário
    ativo, missão ativa);
  - Árvores, Salão (ranking e conquistas), Mapa e os 3 minijogos;
  - Ponto de partida, Preparação, Mochila da partida, Partida e Resumo.
- **Os conjuntos mais novos são de 20/10:** `depois-visual` e `depois-visual-escuro`, com 36 cada (antes das camadas
  com as peças do Pablo).
- **Faltam para virar os protótipos novos:**
  1. Telas que o script não tira:
     - Criar conta, Confirme o e-mail, Esqueci a senha, Senha nova e Escolher apelido (com conta não dá sem o Supabase;
       dá para abrir pelo painel DEV ou pelo estado);
     - Configurações, Pausa, Confirmar fuga, Carregando a partida, Cutscene da derrota e a janela de Ajuda;
     - o histórico do Salão (só com conta).
  2. Organizar com o número e o caso de uso no nome (ex.: `UC16_mercado_comprar.png`) e uma tabela no
     `documentacao/prototipos/README.md` ligando cada print ao UC e ao RF.
  3. Copiar para `documentacao/prototipos/` (trocando os de 01/10 ou guardando os antigos numa subpasta `iniciais/`).
  4. **Tirar depois das funcionalidades novas** (NPC, Caravana, bonecos): se tirar agora, vão sair desatualizados de
     novo.

### C.5 Proposta de casos de uso e requisitos novos e alterados

**Atores (no diagrama novo):**
- **Jogador** (convidado ou com conta);
- **Desenvolvedor**: opções de dev e a Área do Desenvolvedor (extra);
- **Sistema de autenticação** (Supabase), como ator secundário, se o professor gostar.

**Casos de uso alterados:**

| UC | Mudança |
|---|---|
| UC16 Negociar no Mercado | passa a começar pela conversa com o comerciante (inclui o UC45) |
| UC17 Gerenciar equipamentos (Forja) | idem, com o ferreiro |
| UC21 Gerenciar missões (Guilda) | idem, com o mestre da Guilda |
| UC28 Escolher ponto de partida | **substituído** pelo UC44 Viajar de Caravana (o 28 fica marcado como "substituído em 11/2026") |
| UC31 Jogar partida | mapa fixo maior, zonas neutras, animais pacíficos |
| UC32 Combater monstros | os mobs novos e os grupos (acampamento e forte goblin) |
| UC34 Enfrentar Boss | o Boss da Floresta passa a ser o Ogro |
| UC43 Jogar minijogo do Planalto | a pesca visual no Lago |

**Casos de uso novos:**

| UC | Nome | Ator |
|---|---|---|
| UC44 | Viajar de Caravana (escolher a zona neutra e pagar) | Jogador |
| UC45 | Conversar com NPC (apresentação na primeira vez, fala aleatória depois, menu) | Jogador |
| UC46 | Usar opções de desenvolvedor na partida (super velocidade, teletransporte pelo clique no mapa) | Desenvolvedor |
| UC47 | Simular balanceamento (grupo de nível X contra a região Y) | Desenvolvedor |
| UC48 | Acessar a Área do Desenvolvedor (D1: entrada com 2FA, auditoria) — **extra**, num pacote separado no diagrama | Desenvolvedor |
| UC49 | Banir e desbanir conta (D2) — extra, só se a D2 for feita | Desenvolvedor |

**Requisitos alterados:**

| RF | Mudança |
|---|---|
| RF21 | o comerciante (hoje o RF diz "com NPCs" e não há) |
| RF22 | o ferreiro |
| RF26 | o mestre da Guilda |
| RF31 | Floresta fixa e maior (3 a 5 min de ponta a ponta), regiões de forma natural, zonas neutras entre elas, Boss no fim do mapa |
| RF32 | substituído pelo RF56 (Caravana) |
| RF39 | o Boss da Floresta é o Ogro; o Guardião fica para depois |
| RF50 | animais inofensivos dão XP muito baixo |
| RF54 | a pesca visual no Lago |

**Requisitos novos:**

| RF | O que pede |
|---|---|
| RF56 | Caravana: pagar ouro para nascer numa zona neutra mais à frente (perto da fácil, da média, da difícil ou do fim); preço alto, crescendo com a distância; nunca dentro de uma região |
| RF57 | NPCs com balão de fala e menu: apresentação na primeira visita (serve de tutorial), falas aleatórias nas outras, "Ir embora" |
| RF58 | Animais pacíficos nas zonas neutras: nunca atacam e se afastam das áreas de predadores |
| RF59 | Cada tipo de mob fica na sua área (o cervo não entra onde há lobo; o lobo não entra onde há goblin) |
| RF60 | Acampamento goblin na região média e forte goblin na difícil, com goblins de papéis diferentes (lanceiro, arqueiro, xamã que cura) |
| RF61 | Opções de desenvolvedor (só no `npm run dev`): super velocidade e teletransporte pelo clique no mapa |
| RF62 | Simulador de balanceamento (só no `npm run dev`): grupo de nível X contra a região Y, com tempo de sobrevivência, dano dado e recebido |

**Requisito não funcional novo:**
- **RNF15:** enquanto não houver arte, personagens, mobs e animais aparecem como bonecos desenhados em código (corpo,
  cabeça, braços, pernas e arma), cada espécie com formato e cores próprios.

**"Trabalhos futuros" no Conceito (nova seção, ou a §17 ampliada):** multiplayer, versão mobile (só com o jogo entre 80
e 90% pronto), os outros biomas, pergaminhos de treinamento, XP que diminui com o mesmo mob, o Guardião da Floresta como
chefe avançado, a Área do Desenvolvedor D2 a D5 e a pixel art dos personagens.

---

## D. Personagens, arte e desenho na partida

### D.1 Como tudo é desenhado hoje (verificado)

- **`jogo/entidades/Entidade.js`:** a base de todos (Líder, aliados, mobs, boneco de treino).
  - **Corpo que colide:** uma zona de física invisível, quadrada, com meio lado de 32% do desenho (`raioDoCorpo`, 12,8 px
    para um desenho de 40). É o que a separação, as pedras e o caminho usam.
  - **Área que recebe golpes:** o retângulo do desenho inteiro (`retangulo()`, 40 × 40 no personagem).
  - **Desenho:** um `container` do Phaser (`this.visual`) com um `rectangle` da cor da classe (`this.quadrado`) e
    contorno escuro. Por fora, uma sombra (elipse) e a barra de vida.
  - **Andar:** `atualizarDesenho` (por quadro) estica e achata o container (`balanco`, onda de 8%) e dá um pulinho de até
    3 px. `escalaExtra` faz as deformações rápidas (esquiva, bote, aviso). A profundidade é o `y`, então quem está mais
    embaixo fica na frente.
- **`jogo/entidades/Personagem.js`:** acrescenta o contorno escuro, o contorno branco do Líder, a marca e o anel da ajuda.
- **Mobs:**
  - `Inimigo.js` é a base: perseguição, território, bote avisado e a barra.
  - `MobVermelho.js`: corpo a corpo (lobo, javali, cervo).
  - `Atirador.js`: de longe (aranha).
  - `GuardiaoDaFloresta.js`: o Boss, com o quadrado grande e a "coroa"; os avisos no chão são retângulos e imagens.
  - A forma de todos é o mesmo quadrado. Só a cor e o tamanho mudam (`mundo.mobs`, `cor` e `tamanho`).
- **Armas e golpes:** cada uma é desenhada à parte, em `jogo/ataques/`.
  - `espada.js`: o arco do golpe.
  - `escudo.js`: um retângulo que **já gira com a mira do dono** (`anguloDaMira`), a 40 px dele, e treme quando rompe.
  - `bolaMagica.js`, `flecha.js` e `projetil.js`: os projéteis.
  - `aura.js`: a cura do Sacerdote.
  - O arco que carrega do Arqueiro é desenhado em `jogo/arco.js`.
- **Arte (pronta desde 10/10, ainda sem uso):** `jogo/arte.js`, classe `DesenhoDoBoneco`.
  - Se existe uma imagem com o nome certo em `src/assets/arte/` (`guerreiro-andando-baixo.png`...), a cena a carrega e
    `Entidade.usarArte` põe um `sprite` animado dentro do mesmo container, no lugar do quadrado.
  - As regras de nome, direção e animação estão em `regras/arte.js`.
  - O `npm run testar:arte` testa isso com imagens de teste (39 de 39 hoje).

### D.2 O que existe em `programacao/arte-original/` (26 MB, fora do git)

| Pasta ou arquivo | O que é | Situação (pelos relatórios em `testes/2026-11-*.md` e pelo PLANO.md) |
|---|---|---|
| `classe-mago-*.png`, `retrato-mago-*.png`, `mago-*.zip`, `item-pocaoDeVida-*.png` | o Mago chibi do PixelLab (15 a 19/10) | **rejeitado** pelo Pablo |
| `camadas/`, `fundo-reino-original.png`, `fundo-mapa-original.jpg` | o trabalho rejeitado das camadas (20/10) e cópias das imagens principais | só histórico |
| `teste-estilo-2026-11-08/` | teste de estilo do Mago | histórico |
| `classes-pablo-2026-11-08/`, `classes-pablo-64-2026-11-08/` | a referência própria do Pablo (`referencia-pablo.png`) e o primeiro teste em 64 × 64 | a referência continua sendo a base |
| `classes-pablo-64-final-2026-11-12/` e o `.zip` | as cinco classes em 64 × 64 | substituídas pela volta a 32 × 32 |
| `classes-pablo-32-r2` a `r5` (12 a 14/11) e os `.zip` | as cinco classes em 32 × 32, rodadas 2 a 5 | **Mago e Tanque da rodada 4 aprovados e congelados** (a rodada 5 os mantém idênticos); Guerreiro, Sacerdote e Arqueiro em avaliação |
| `classes-pablo-16-2026-11-15/`, `-16-r2-` e os `.zip` | teste em 16 × 16 | variante, não substitui a de 32 |
| `classes-64-comandos-corrigidos-2026-11-15/`, `classes-64-revisao/`, `mago-64-reparo-`, `tanque-64-perna-`, `sacerdote-64-*` (3 pastas), `arqueiro-64-*` (2 pastas), `tanque-sacerdote-nova-correcao/` | revisões em 64 × 64 no "Ateliê" (pixel-matrix em JSON) | em avaliação; a última é o Sacerdote com o cetro antigo (15/11) |

**Só poses estáticas, uma direção. Nenhuma animação, nenhuma das 4 direções, nenhum mob.** Nada disso está em
`src/assets/arte/`, então o jogo continua com quadrados. Segundo o pedido de 18 e 19/11, a pixel art fica para o
final.

**Não verificado:** quem fez as rodadas de novembro e com qual ferramenta. Pelo `AGENTS.md` e pelos relatórios, foi o
Codex com o "Ateliê", fora deste repositório.

### D.3 Bonecos de quadradinho (3.3.5): abordagem técnica proposta

**Onde:** um módulo novo, `jogo/bonecos/` (ou `jogo/desenhoDosBonecos.js`), com uma "receita" de cada espécie em dados
(`dados/bonecos.js`: tamanhos, cores e peças). O `Entidade` troca o `this.quadrado` pelo boneco, no mesmo
`this.visual`. A sombra, a barra, a profundidade e o "usarArte" continuam; a arte, quando vier, substitui o boneco
inteiro.

**Peças (todas `rectangle` ou `graphics` do Phaser, dentro de containers):**
```
visual (container, já existe: posição, balanço e profundidade)
 ├─ perna de trás, perna da frente (retângulos; giram no quadril)
 ├─ corpo (quadrado grande)
 ├─ braço de trás (container no ombro) ─ mão livre
 ├─ cabeça (retângulo grande, "cabeçudinho"; olhos de 2 px)
 └─ braço da arma (container no ombro) ─ mão ─ arma (container próprio)
```

**Armas:** desenhadas com 3 a 8 retângulos ou um `graphics` cada:
- **espada:** lâmina com ponta (triângulo), guarda e cabo;
- **cajado:** haste de madeira com a ponta mais grossa;
- **cetro:** haste e uma orbe (círculo ou octógono);
- **escudo:** escudo com borda e emblema, reaproveitando o `escudo.js` que já gira;
- **arco:** curva em `graphics` e corda que estica com a carga do `jogo/arco.js`.

**O braço que segue a mira (Tanque e Arqueiro) e a "viradinha":**
- **Ângulo:** o `anguloDaMira` já existe no Líder e nos aliados (o escudo usa). O braço da arma gira em volta do ombro
  com esse ângulo, limitado a uma faixa natural.
- **Virada do corpo:** o corpo olha para a esquerda ou para a direita pelo sinal do `cos(ângulo)`. Ao virar, o
  container inteiro espelha (`scaleX = -1`), e o braço da arma passa para o outro lado. Assim o braço nunca passa na
  frente do corpo.
- **Mira para cima ou para baixo:**
  - mirando **para cima** (seno negativo), o braço e a arma vão para **trás** do corpo (`depth` menor dentro do
    container, com `container.moveDown`);
  - mirando **para baixo**, vão para a **frente**.
  - Uma pequena histerese evita o pisca-pisca na troca.
- **A regra fica pura e testável:** uma função em `regras/` que recebe o ângulo e devolve o lado, o ângulo do braço e se
  a arma vai na frente ou atrás.

**Animação:**
- **andar:** as duas pernas balançam em sentidos opostos (`sin(t)`); o corpo sobe 1 a 2 px; a mão livre balança. Usa o
  `balanco` que já existe.
- **atacar:** um tween curto no braço da arma.
  - Guerreiro: varrida de ~120°, combinando com o arco do golpe (`aberturaGraus`).
  - Mago e Sacerdote: o cajado sobe e desce.
  - Tanque: o braço empurra para a frente (o `avanco` do escudo).
  - Arqueiro: puxa a corda.
- **caído:** o boneco deitado (rotação de 90°) e mais escuro.

**Mobs e animais (formas próprias, como pedido):**

| Espécie | Forma |
|---|---|
| lobo | corpo horizontal comprido, cinza, 4 patas, cabeça com focinho e orelhas |
| cervo | marrom-claro, mais alto, patas finas e chifres |
| javali | baixo e largo, marrom-escuro, presas |
| aranha | corpo redondo e 8 patas que se mexem |
| goblins | bonecos de pé como os personagens, menores, verdes, cada um com a sua arma (lança, arco, cajado com caveira) |
| Orc | boneco grande, verde-acinzentado |
| Ogro | boneco enorme, verde-escuro, clava |

**Desempenho:**
- **Medido em 22/10:** 60 FPS no pior cenário da Floresta.
- **Estimativa do custo novo:** cada boneco tem de 8 a 14 objetos em vez de 1 (o quadrado). Com 5 personagens e ~40 mobs
  acordados, são ~600 objetos a mais.
- **O que segura o custo:**
  - os mobs longe já dormem (`mundo.raioAtivo` = 1.500 px) e o desenho deles pode ser escondido;
  - dá para animar as peças só dos visíveis;
  - dá para guardar cada boneco parado numa textura (`generateTexture`) e montar as peças só durante a animação.
- **Precisa medir:** o `testar:floresta` já mede o FPS no pior cenário. **Risco médio.**

**Hitbox:** não muda.
- O corpo que colide continua sendo 32% do "tamanho" de cada um, e a área que recebe golpes é o retângulo do tamanho.
- O boneco pode passar um pouco do tamanho (a cabeça grande, a arma) sem mudar o combate.
- Para mobs compridos (lobo deitado), vale pensar num retângulo não quadrado: `Entidade.retangulo()` aceita isso com uma
  mudança pequena (largura × altura em vez de "tamanho"). Não é obrigatório.

**Tamanho:** G (personagens) + M (mobs e animais). **Pode ser feito antes e em paralelo com o mapa**, porque só mexe no
desenho.

---

## E. Mundo (Floresta)

### E.1 Como a Floresta é hoje (verificado em `dados/mundo/floresta.js`, `regras/mundo.js`, `regras/mapaDaPartida.js`, `jogo/mapas.js` e `jogo/cenas/CenaArena.js`)

- **Tamanho:** 7.200 × 3.600 px. O Líder anda a 220 px/s: em linha reta, a travessia leva **~33 s** (confirma o "uns 30 s").
- **Regiões:** 5 **retângulos lado a lado, da esquerda para a direita**, em `{ x0, x1, y0, y1 }`:
  - zona segura: 0–1.000;
  - fácil: 1.000–2.800;
  - média: 2.800–4.600;
  - difícil: 4.600–6.000;
  - domínio do Boss: 6.000–7.200.
  
  Cada uma tem um `inicio` (onde se nasce pelo ponto de partida) e cores de chão.
- **Mata fechada (parede):** `paredesDaMata` faz um retângulo em cima e embaixo de cada região e antes e depois da
  primeira e da última. **A função assume que as regiões são retângulos encostados em fila.** Regiões de forma livre
  pedem outro jeito de fazer a parede.
- **Áreas com nome:** 9 retângulos dentro das regiões; a primeira visita dá XP (RF40).
- **Árvores e pedras soltas:** `gerarObstaculos` usa uma grade com desvio a cada 300 px, com a densidade de cada região e
  uma semente fixa (2026). O mapa é igual em toda partida, mas é **sorteado** e não desenhado à mão.
- **Desenho (`jogo/mapas.js`):**
  - o chão é um `tileSprite` por região;
  - a mata é um `tileSprite` só;
  - cada árvore, copa, mancha e pedra é **um objeto do Phaser** (centenas hoje).
- **Mobs:**
  - `populacao` (quantos de cada tipo por região) e `espalharMobs` (sorteio dentro do retângulo da região, longe dos
    inícios e uns dos outros);
  - cada mob tem a "casa" onde nasceu e só persegue dentro do `raioDoTerritorio` (600 a 800 px). Fora dele, desiste e
    volta para casa por 3,5 s;
  - a força vem da região: vida, dano, XP e ouro vezes 1 (fácil), 1,5 (média), 2,2 (difícil) e 2,6 (Boss);
  - **o território é um círculo em volta da casa, não a região**: um lobo que nasce perto da beira persegue para dentro
    da região vizinha (o roteiro da Floresta já tropeçou nisso, Registro linha 148).
- **Sono dos mobs:** a mais de 1.500 px do Líder (`mundo.raioAtivo`) e fora da tela, o mob não pensa nem anda.
- **Minimapa:** células de 200 px (36 × 18 = 648) reveladas a 450 px do Líder.
  - Guardado no save como texto hexadecimal: 4 células por caractere, **~162 caracteres** por bioma.
  - Junta com o que já estava salvo no fim da partida.
- **Ponto de partida (RF32):** `PontoPartida.jsx` libera os inícios das regiões já descobertas (`regioesDescobertas` no
  save) e `inicioDoPontoDePartida` põe o grupo lá.
- **Taxa por distância (RF48):** sempre medida a partir do **ponto inicial do bioma** (o da zona segura), não do ponto
  de partida escolhido. A "borda" é a maior distância até um canto andável (`distanciaAteABorda`).
- **Caminho dos aliados (`jogo/navegador.js`):**
  - **uma grade única do mapa inteiro** com casas de 20 px (360 × 180 = 64.800 casas), criada ao abrir a partida;
  - a busca A* zera três vetores do tamanho da grade inteira **a cada busca** (`custo`, `veioDe`, `fechado`);
  - quando a linha reta está livre, nem busca.
- **Busca de obstáculos:** em baldes de 400 px (`regras/vizinhanca.js`), o que deixa colisão e linha de tiro rápidas.

### E.2 O que quebra ou pesa com um mapa 6 a 10 vezes mais largo

Para levar de 3 a 5 min de ponta a ponta, a 220 px/s, o caminho tem de **40.000 a 66.000 px**. Isso dá 6 a 9 vezes a
largura atual (ou um caminho que vai e volta num mapa menos largo e mais alto).

| Parte | Hoje | Num mapa ~8× maior | Risco e o que fazer |
|---|---|---|---|
| Grade do caminho | 64.800 casas; cada busca zera ~0,8 MB | ~500 mil casas; cada busca zera ~6 MB e pode explorar muito | **Alto.** Trocar por grades **locais** (só uma janela em volta de quem busca) ou por casas maiores com refinamento. As buscas são raras (linha reta primeiro, recálculo a cada 500 ms), mas cada uma ficaria lenta |
| Objetos do desenho | centenas de árvores, copas, manchas e pedras | alguns milhares | **Médio.** O Phaser testa cada objeto contra a câmera a cada quadro. Dá para guardar o chão e a mata parada em pedaços de textura (`RenderTexture` por bloco de 2.000 px) ou criar e apagar os objetos dos blocos perto da câmera |
| Tamanho das texturas | `tileSprite` do tamanho da região | regiões de 10 a 20 mil px | Médio. O WebGL tem limite de textura (geralmente 4.096 a 16.384 px); o `tileSprite` repete a textura e não cria uma gigante, mas vale testar no pior caso |
| Minimapa | 648 células | ~5 mil | Baixo. O texto no save vai para ~1.300 caracteres. O minimapa (`telas/partida/Minimapa.jsx`) já é um canvas de 180 × 90 que pinta cada célula revelada; 5 mil retângulos por desenho ainda é rápido, mas num mapa muito largo cada célula fica menor que 1 px no minimapa (precisa de zoom ou de um minimapa que acompanha o Líder) |
| Mobs | ~60 no total | 300 a 500 | Médio. Com o sono, só os perto pensam; o nascimento por sorteio (`espalharMobs`, 40 tentativas cada) continua rápido |
| Mata fechada | `paredesDaMata` para retângulos em fila | regiões de forma livre | **Precisa reescrever** (abaixo) |
| Distância da taxa | maior distância até um canto | cresce muito | As taxas da borda chegariam no fundo do mapa; rever se a taxa deve contar pela distância em linha reta ou pelo "progresso" no caminho |
| Save do mapa descoberto | `regioesDescobertas` e a névoa | — | Sem problema de tamanho. A Caravana troca o uso das regiões descobertas |
| Testes que dependem do tamanho | `testarFloresta.mjs`, `testarParedes.mjs` (anda encostado em **todas** as paredes: o tempo cresce com o perímetro), `regras/mundo.test.js`, `mapaDaPartida.test.js`, `regras/cenario.test.js` (não) | — | Rever os pontos fixos dos roteiros; o `testar:paredes` pode ficar lento demais e precisar de amostra |

### E.3 Proposta: regiões de forma natural, zonas neutras, acampamento e forte

**Representação recomendada: polígonos simples, escritos à mão em dados, mais uma grade de "terreno" calculada uma vez.**
- Cada região, zona neutra e o domínio do chefe é um polígono (lista de pontos, com 8 a 20 vértices) em
  `dados/mundo/floresta.js`. Dá para desenhar à mão num papel quadriculado ou numa ferramenta simples.
- Ao abrir a partida, uma função pura transforma os polígonos numa **grade de terreno** (casas de 100 a 200 px).
  - Cada casa guarda a região dela, ou "neutra", ou "mata".
  - `regiaoEm(ponto)` vira uma consulta de vetor, rápida e igual à de hoje.
  - A mata fechada vira as casas "mata" juntadas em retângulos (o mesmo formato de parede de hoje), então a colisão, o
    caminho e o desenho não mudam de formato.
- **Por que não máscara de imagem:** daria um terreno bonito, mas sem regras puras fáceis de testar e com o tamanho
  preso à imagem. **Por que não grade pura à mão:** é muito trabalho para escrever e para mudar.
- **Acampamento goblin (circular e concentrado):** um círculo (centro e raio) dentro da região média, com população
  própria, uma paliçada (obstáculos em anel com 1 ou 2 aberturas) e uma fogueira no meio.
  - Os goblins dele têm o território = o círculo, e não o raio em volta de cada um.
  - O sono pode ser por grupo: o acampamento todo acorda junto.
- **Forte goblin (região difícil):** um retângulo ou polígono com muros (obstáculos), portão, torres de arqueiros e
  mais goblins.
- **Território por área (pedido 3.3.2: "cada mob fica sempre na sua área"):** trocar o `raioDoTerritorio` por "a área
  do mob" (o polígono da região dele, ou o círculo do acampamento). O mob desiste ao sair dela. A regra pura em
  `regras/mobs.js` passa a receber a área.
- **Animais pacíficos:** um comportamento novo ("fugitivo"), que anda nas zonas neutras e se afasta de predadores e do
  grupo. A população fica nas zonas neutras.
- **Chefe no fim:** o domínio do Ogro no fim do mapa, com uma "arena" de forma livre.

### E.4 Caravana: o que muda

- **Tela:** a `PontoPartida.jsx` vira a tela da **Caravana**. Ela fica entre o Mapa e a Preparação, ou dentro da
  Preparação, como um passo "De onde partir".
  - Mostra as paradas: o início, a zona neutra perto da fácil, a da média, a da difícil e a do fim.
  - Cada parada mostra o preço, o ouro do jogador e o "antes → depois" do ouro (como manda o Guia de Interface).
- **Dados:** cada zona neutra ganha um ponto de chegada (`inicio`). As paradas e os preços ficam em
  `dados/mundo/floresta.js` (onde) e `dados/balanceamento.js` (quanto). O preço cresce com a distância e é **caro**,
  por exemplo uma fração alta do ouro típico de uma partida naquela região.
- **Regra pura nova:** `regras/caravana.js` (preço por parada, pode pagar, motivo do botão apagado), com testes.
- **Pagamento:**
  - entra como operação do Reino (`regras/reino.js`, `operacoesDoReino`), descontando ao clicar em "Começar partida";
  - se a partida for descartada (RF12: queda), o ouro **não** volta, a não ser que se decida o contrário (pergunta em N);
  - o ouro da Caravana é gasto **antes** da partida, então não entra na taxa.
- **Save:**
  - `regioesDescobertas` deixa de liberar o ponto de partida. Pode continuar existindo para o minimapa e as
    conquistas, sem formato novo;
  - o campo `pontoPartida` das escolhas da partida passa a guardar a parada (o nome pode continuar o mesmo, sem
    migração).
- **Taxa (RF48):** continua contando do início do bioma. **Consequência:** quem paga para nascer perto do fim e foge
  paga uma taxa alta. É coerente com "a Caravana é cara". Confirmar com o Pablo.
- **Documentação:**
  - o RF32 e o UC28 são substituídos pelo RF56 e o UC44;
  - o diagrama de Partida muda o passo "escolher ponto de partida";
  - o Conceito §4.3 ("Ponto de partida e dificuldade") é reescrito;
  - o `testar:reino` e o `testar:floresta` usam o ponto de partida hoje e precisam mudar.

---

## F. Mobs, combate e balanceamento

### F.1 Os mobs e o Boss de hoje (números em `dados/balanceamento.js`, `mundo.mobs` e `mundo.boss`)

Valores **na região fácil** (força 1). Na média vezes 1,5, na difícil vezes 2,2 e no domínio do Boss vezes 2,6, só para
vida, dano, XP e ouro (`regras/mobs.js`, `fichaNaRegiao`).

| Mob | Comportamento | Hostil | Vida | Dano | Recarga | Velocidade | XP | Ouro | Detecta / desiste / território (px) | Drop |
|---|---|---|---|---|---|---|---|---|---|---|
| Lobo | corpo a corpo (bote avisado 0,5 s) | sim | 55 | 10 | 1,3 s | 150 | 18 | 10 | 340 / 520 / 650 | pele de lobo 60% |
| Aranha | atiradora (teia; fica a 280–430 px) | sim | 38 | 8 | 1,9 s | 105 | 22 | 12 | 560 / 760 / 800 | teia 70% |
| Javali | corpo a corpo, pesado (aviso 0,65 s) | sim | 110 | 18 | 1,7 s | 125 | 35 | 18 | 300 / 480 / 600 | presa 50% |
| Cervo | corpo a corpo, **só revida** | não | 45 | 7 | 1,4 s | 160 | 12 | 6 | 0 / 500 / 700 | chifre 40% |
| **Guardião da Floresta** (Boss) | pisão em área, investida em linha, leque de espinhos, tudo avisado no chão | sim | 2.400 | 26 (pisão), 40 (investida), 12 (espinho) | 1,5 s entre ataques | 95 | 400 | 250 (+500 de bônus) | 620 / 900 / 720 | casca antiga 100%; coroa de raízes 8% |

**População:**
- fácil: 6 lobos, 4 cervos e 2 aranhas;
- média: 6 lobos, 5 aranhas, 3 javalis e 3 cervos;
- difícil: 7 lobos, 6 aranhas, 5 javalis e 2 cervos;
- domínio do Boss: 2 lobos e o Boss.

**Como se cria um mob novo hoje:**
1. Uma ficha em `mundo.mobs`, com `comportamento: 'corpoACorpo'` ou `'atirador'`.
2. A população em `dados/mundo/floresta.js`.
3. O drop em `dados/itens.js`.
4. A missão, se quiser, em `dados/missoes.js`.

Os dois comportamentos são as classes `MobVermelho.js` e `Atirador.js`. **Qualquer comportamento diferente** pede uma
classe nova em `jogo/entidades/`:
- xamã que cura;
- Aranha-Mãe que prende com teia;
- animal que foge;
- Ogro com golpes próprios.

### F.2 IA dos aliados com os mobs novos: o que pode dar errado

Arquivos: `regras/iaDosAliados.js` e `jogo/iaDosAliados.js`.

- **Corrente de 420 px:** se o Líder passa de 420 px, todos largam a luta e voltam. Num acampamento, o grupo entra e sai
  da luta conforme o Líder anda, e pode puxar o acampamento inteiro.
- **Escolha do alvo:**
  - o Guerreiro vai no mais próximo, e o Arqueiro e o Mago também escolhem pela distância;
  - **ninguém prioriza o xamã que cura**, então a luta se arrasta;
  - é preciso uma regra pura nova de prioridade ("curandeiro primeiro" na IA média e na avançada).
- **Atração do Tanque (260 px):** com 8 a 12 goblins, todos vão no Tanque. O escudo segura golpes de frente até 32,5 de
  dano, mas os de lado e de trás passam.
- **Imunidade de 0,5 s depois de apanhar** (`personagem.msDeImunidade`): limita o dano recebido a ~2 golpes por segundo,
  **não importa quantos mobs batem**.
  - Isso deixa os grupos grandes menos perigosos do que parecem.
  - Também contraria "a fácil ensina a pegar um bicho por vez", porque hoje pegar três de uma vez quase não dói mais.
- **Linha de tiro com paliçada e muros:** a regra de linha de tiro já existe (`folgaDaLinhaDeTiro`); o roteiro da arena
  tem conferências disso. Elas falharam hoje uma vez ("Arqueiro e Mago não atiram na pedra", A.4), o que mostra que
  esse comportamento já é frágil.
- **Caminho dentro de um forte com portão:** o caminho na grade resolve, mas a grade inteira do mapa grande pesa (E.2).
- **Mobs que curam mobs:** hoje nada cura mob. Os números de cura (`curaDaAura`) são de aliado.

### F.3 As fórmulas de hoje (verificado no código)

| O quê | Fórmula | Exemplo (nível 1) |
|---|---|---|
| Vida máxima | Vitalidade × 10 (`grupoDaPartida.js`) | Guerreiro 120, Mago 80, Tanque 180, Sacerdote 80, Arqueiro 60 |
| Mana máxima | 20 + Inteligência × 5 | Mago 110, Sacerdote 80, Tanque 40 |
| Mana que volta | 0,5 + Sabedoria × 0,15 por segundo | Sacerdote 3,2/s, Mago 2,3/s |
| Crítico | 5% + Agilidade × 0,5%; o golpe crítico dá 1,5 × | Arqueiro (Agi 22) 16%, Guerreiro (Agi 13) 11,5% |
| Defesa | cada ponto tira 2% do dano, até 50% (equipamento e passivas) | — |
| Escudo do Tanque | segura até 10 + 1,5 × Força | Força 15 → 32,5 |
| Arco | dano cheio 26 + 1,2 × Força; carga cheia 450 + 650 × (1 − Agi/100) ms; recarga 60% da carga | Arqueiro: 38 de dano, 957 ms de carga, ~1,5 s por flecha |
| **Espada (Guerreiro)** | **25 fixo**, a cada 0,4 s, num arco de 120° e 70 px | ~62 de dano por segundo, em todos no arco |
| **Bola mágica (Mago)** | **30 fixo**, explode em 90 px, a cada 1,5 s | ~20 por segundo, em área |
| Tanque | 8 de dano e empurrão forte, a cada 0,6 s | ~13 por segundo |
| **Sacerdote** | **nenhum dano**: o clique é a aura de cura (10 de vida por segundo) | **0** |
| Velocidade | **220 para todos** | — |
| XP para subir do nível n | 100 × n (linha reta) | 1→2: 100; até o 10: 4.500; até o 100: 495.000 |
| Pontos por nível | 3 de atributo e 1 de habilidade | — |
| Atributo máximo | 100 | — |
| `efeitoDoAtributo` (curva 1,5) | existe, mas **nada usa** | — |
| Preços de exemplo | poção de vida 25, poção de mana 30, pergaminho 300, contrato temporário 200, permanente 1.000; venda = 50% do preço | — |

### F.4 Avaliação da dificuldade de hoje (estimativa)

**Como estimei:** com as fórmulas acima e os números dos mobs, fazendo contas de dano por segundo. Não rodei uma
simulação: o combate depende da física, das recargas e da IA do Phaser, e não existe um simulador puro. O roteiro da
Floresta não mede vitória ou derrota por região.

**Ponto de partida do jogador novo:** só **um** personagem (a classe inicial), nível 1, sem contrato.

- **A classe inicial muda tudo:**
  - **Guerreiro:** ~62 de dano por segundo em área, 120 de vida. O lobo da fácil (55 de vida) cai em 3 golpes (1,2 s);
    o da difícil (121 de vida, 22 de dano), em 5 golpes (2 s).
  - **Mago:** ~20 por segundo, 80 de vida. Mais lento; depende da distância.
  - **Arqueiro:** ~25 por segundo, 60 de vida, e mata devagar.
  - **Tanque:** 13 por segundo, 180 de vida. Mata muito devagar, mas quase não morre.
  - **Sacerdote:** **não mata nada**. Começando de Sacerdote, o jogador não consegue terminar nenhuma luta sozinho nem
    juntar ouro para contratar (o contrato temporário custa 200). Só os minijogos dão algum dinheiro, e devagar. **É um
    defeito de projeto que o Claude do chat ainda não sabia.**
- **Dano recebido:** a imunidade de 0,5 s depois de cada golpe limita a ~2 golpes por segundo.
  - Lobo da fácil: até 20 por segundo.
  - Lobo da difícil: até 44 por segundo.
  - Mordida no domínio do Boss: até 52 por segundo.
  - O Guerreiro (120 de vida) aguenta ~2,7 s apanhando sem parar na difícil.
- **Fugir é fácil demais:** o Líder anda a 220 e o mob mais rápido a 160 (o cervo; o lobo a 150). **Hoje dá para
  atravessar qualquer região correndo**, e um mob só persegue até o território dele (600 a 800 px). Então "nunca dá
  conta da média, a não ser desviando com perfeição" **não vale hoje**: basta correr.
- **Boss:** 2.400 de vida. O Guerreiro sozinho, batendo sem parar, leva ~40 s. Com o grupo inteiro de nível 1
  (~120 por segundo somados), ~20 s. O perigo é a investida (40 de dano, rompe o escudo de Força 15) e o pisão (26 em
  área). Com os avisos no chão e a esquiva, um jogador atento vence.

**Resumo:**
- Com o Guerreiro, a fácil e a média são tranquilas no nível 1 e a difícil é possível.
- Com o Tanque ou o Arqueiro, é lento, mas possível.
- Com o Sacerdote, é impossível.
- Correr resolve quase tudo.

Isso é o contrário do pedido 3.3.7 ("um jogador novo consegue a fácil com muito esforço").

### F.5 Balanceamento provisório (3.3.7) e simulador (3.3.6): o que aproveitar e como eu faria

**Para a barreira ser "ter atributos", três mudanças de base, antes de mexer em números:**
1. **O dano depender do atributo:** Força para espada e escudo, Inteligência para bola e meteoro, Força para o arco
   (já depende). A função `efeitoDoAtributo` com a curva 1,5 já existe e está testada; falta usar.
2. **A velocidade depender da Agilidade** (por exemplo, 170 + Agilidade × 1,5) **e os mobs das regiões mais fundas
   serem mais rápidos que o Líder do começo.** Sem isso, correr sempre resolve.
3. **Rever a imunidade de 0,5 s**, para cercado ser perigoso de verdade (por exemplo, imunidade só contra o mesmo
   atacante).

E uma correção obrigatória: **o Sacerdote precisa de algum dano no beta**. Pode ser a "Luz divina" na raiz, um clique
que machuca, ou ele ser proibido como classe inicial.

**Proposta de curva, para conversar (sem 20/40/70/100):** pensar a dificuldade pelo **"nível médio do grupo" esperado
em cada região**, com a força da região subindo devagar no começo e depressa no fim, e os mobs com números próprios em
vez de só multiplicados.

| Região | Nível médio esperado | Quem vence com folga | Ideia do número |
|---|---|---|---|
| Fácil | 1 a 6 | grupo de nível 5 | o lobo mata um personagem de nível 1 em 6 a 8 s de luta sozinho; dois lobos ao mesmo tempo matam |
| Média (acampamento) | 7 a 15 | grupo de nível 12 com 3 ou mais personagens | o xamã deixa a luta longa se ninguém o derrubar primeiro |
| Difícil (forte) | 16 a 28 | grupo de nível 22 completo | os goblins andam mais rápido que o Líder do nível 1 |
| Ogro | 25 a 35 | grupo de nível 30 com equipamento | — |
| Nível 100 | — | — | sobra para os outros biomas (fora do beta) |

O XP em linha reta (100 × n) dá, para chegar ao nível 10, 4.500 de XP **por personagem**. Hoje um lobo dá 18 dividido
pelo grupo, então o jogador precisaria de centenas de lobos. **A curva de XP e o XP dos mobs têm de ser decididos
juntos.**

**Simulador (3.3.6):** o melhor caminho é um **simulador puro em Node**, sem Phaser, em `regras/simulador.js` com testes
e um `npm run simular -- --nivel 5 --regiao media`.
- Usa as mesmas fórmulas (`grupoDaPartida.js`, `combate.js`, `fichaNaRegiao`).
- É um modelo simplificado: dano por segundo de cada lado, alcance, imunidade, cura do Sacerdote, ordem de alvos e um
  "quantos mobs ao mesmo tempo" configurável.
- Responde, para uma região: tempo até cair cada personagem, dano dado e recebido, quantos mobs dá para enfrentar ao
  mesmo tempo e o XP e o ouro por minuto.
- **Não substitui** jogar: a física e a IA ficam de fora. Para conferir, um modo "simulação no navegador" pode rodar a
  partida de verdade com um grupo de nível X numa região, com o Líder parado ou andando sozinho, e medir. Isso cabe
  como um roteiro novo em `scripts/` (no estilo do `testarFloresta.mjs`) ou como um botão do painel DEV.
- **Já existe e ajuda:**
  - o painel DEV, que sobe o nível dos personagens;
  - a barra de teste: "Encher grupo", "Criar mob", "Pior cenário (FPS)" e "IA:";
  - `window.__jogoDaPartida`, para ler a cena de fora.

---

## G. Reino, telas e NPCs

### G.1 Como Mercado, Forja e Guilda são montados hoje (verificado)

- **O Reino** (`telas/reino/Reino.jsx`) é a cena em camadas.
  - Clicar na peça ou na placa chama `acoes.irPara('mercado')`, e o estado troca a tela (`estado/navegacao.js`, `pai` em
    `dados/telas.js`).
- **Cada lugar é uma tela própria**, com o fundo cinza ou pergaminho do `Tela.jsx`, sem cenário.
  - `Mercado.jsx`, `Forja.jsx` e `Guilda.jsx` montam uma lista de abas e passam para o `ConteudoComAbas.jsx`, que mostra
    as abas e a escolhida.
  - O `ConteudoComAbas` **já aceita `inicial`** (qual aba abre primeiro), útil para o menu do NPC levar direto a
    "Comprar".
- **As ações** são operações puras com nome em `regras/reino.js` (`operacoesDoReino`), chamadas pelo `useNoReino.js`.
  - `fazer` muda o progresso; `previa` faz a mesma conta sem mudar, para o botão apagado dizer o motivo e para o
    "antes → depois".
- **A dica da primeira visita:**
  - fica em `dados/ajuda.js` (`dicasDasTelas`);
  - quem já viu fica em `preferencias.dicasVistas` (`estado/estadoDoJogo.js`, linhas 215 a 217). **É preferência do
    navegador, não save**: com conta, num computador novo, as dicas aparecem de novo.
- **Posições** em `dados/posicoes.js` (`mercado`, `forja`, `guilda`: as abas, o conteúdo e o Voltar).

### G.2 NPCs (3.3.4): onde entram e como guardar as falas

**Proposta:**
- **Dados (`dados/npcs.js`):** um NPC por lugar. O texto fica todo em dados, e o grupo pode reescrever sem mexer em
  código.
  ```js
  comerciante: {
    nome: 'Bartolomeu',
    lugar: 'mercado',
    apresentacao: ['Ora, ora! Um cliente!', 'Aqui você compra, vende e troca...'],
    falas: ['Poções fresquinhas!', ...],
    menu: [
      { id: 'comprar', rotulo: 'Comprar', aba: 'comprar' },
      ...,
      { id: 'sair', rotulo: 'Ir embora' },
    ],
  }
  ```
- **Regra pura (`regras/npcs.js`), com testes:** `falaDaVez(npc, jaConhece, sorteio)` devolve a apresentação (em
  partes) na primeira vez e uma fala aleatória depois, sem repetir a última.
- **Componente (`componentes/ui/Npc.jsx`):**
  - o NPC desenhado (o mesmo "boneco de quadradinho" da D.3, numa versão de retrato, ou uma imagem quando houver);
  - o **balão de fala**, com "Continuar" se a apresentação tiver várias partes;
  - o **menu** com `BotaoDeAcao`, com a cor e o símbolo de cada ação do Guia de Interface.
- **Tela:** `Mercado.jsx` ganha um estado "conversando" e "na loja".
  - Ao entrar, mostra o NPC.
  - O menu abre o `ConteudoComAbas` na aba escolhida (`inicial`).
  - Um botão "Falar com Bartolomeu" volta ao NPC.
  - "Ir embora" volta ao Reino.
  - O mesmo vale para a Forja (ferreiro: Equipar, Comprar, Vender, Fabricar) e a Guilda (mestre: Missões, Contratos).
- **Primeira vez (tutorial):**
  - recomendo **guardar no save** (`progresso.npcsConhecidos: []`, campo novo pelo `normalizarProgresso`, sem formato
    novo), para seguir a conta em qualquer computador;
  - a dica da primeira visita das três telas pode ser trocada pela apresentação do NPC (para não ter dois "tutoriais").
- **Testes:**
  - a regra pura;
  - o `telas.test.jsx`;
  - o `testar:reino` (que clica nas abas hoje e vai precisar passar pelo menu do NPC);
  - o `testar:botoes`.
- **Tamanho:** M (com o boneco do NPC simples) ou G (se cada NPC tiver animação e cenário).

---

## H. Minijogos

### H.1 Como funcionam hoje (verificado)

- **Uma tela só, em React** (`telas/partida/Minijogo.jsx`), para os três.
  - As regras são passos puros em `regras/minijogos.js`: o tempo e o sorteio vêm de fora.
  - Os números estão em `balanceamento.js` (`minijogos`). A rodada dura 30 s; cada ponto dá 1 recurso e XP (4, 5 ou 7
    por ponto) dividido entre os personagens permanentes.
- **Fazenda:** 9 canteiros que crescem (1,5 a 5 s), ficam maduros 1,6 s e murcham; clicar no maduro colhe.
- **Mina:** uma pedra; 3 cliques quebram.
- **Lago:** a boia espera de 1,2 a 3,8 s, depois há uma janela de 0,9 s para fisgar; fora dela, o peixe se assusta por
  1,5 s.
- **Rodadas por dia:** 3 por minijogo, renovando à meia-noite de Brasília (`regras/rodadasDoDia.js`).
  - O contador fica no save: `minijogosDoDia = { dia, rodadas }`.
  - Para a conta, o dia vem da **hora do servidor** (`conta/horaDoServidor.js`, função `hora_do_servidor` do SQL 002,
    **que está rodado**: conferi chamando a função, que respondeu a hora). Para o convidado, vem do relógio do
    computador.
- **Brecha conhecida (não é defeito novo):** o contador fica no save do navegador, e o convidado pode apagar os dados do
  site para jogar de novo. Para a conta, o save no banco segura.

### H.2 Pesca visual (3.3.8): abordagem

- **Recomendo React com um `<canvas>` (ou SVG) dentro da tela atual, e não Phaser.**
  - O Phaser só carrega na partida (1,5 MB) e tem a ponte, a pausa e o "nunca dois jogos".
  - Um minijogo de uma cena pequena não precisa disso.
- **Desenho:**
  - o lago, a margem e o bonequinho (o mesmo desenho dos bonecos da D.3, num canvas: dá para ter uma função
    `desenharBoneco(contexto, receita, pose)` comum ao Phaser e ao canvas, ou desenhar à parte);
  - a vara com a linha e a boia que balança;
  - o "puxão" (um tween da vara) e o peixe pulando fora d'água (uma curva) quando acerta.
- **Reaproveita:**
  - as regras do Lago (`comecarLago`, `avancarLago`, os tempos);
  - as rodadas do dia, o XP e os recursos (`aplicarMinijogo`);
  - o `CamadaAnimada.jsx` (canvas com até 30 quadros por segundo que para com a aba escondida) é um bom modelo.
- **Tamanho:** M.

---

## I. Contas, Supabase e Vercel

### I.1 Arquivos SQL

| Arquivo | O que faz | Rodado? |
|---|---|---|
| `001_contas.sql` | perfis (apelido único, criado pelo gatilho do cadastro), sessão única, saves com versão, partidas, ranking público, RLS em tudo | **sim**: o jogo publicado entra, salva e mostra o ranking (último `testar:contas:publicado`, 22/10, 54 de 54) |
| `002_hora_do_servidor.sql` | a função `hora_do_servidor()` (só devolve `now()`) | **sim, verificado hoje**: chamei a função com a chave publicável e ela respondeu a hora |
| `003_area_dev.sql` | D1: `devs`, `eh_dev()` com `aal2`, `minha_situacao_de_dev()`, auditoria só de acréscimo, banimentos e novas versões de `abrir_sessao`, `sinal_da_sessao`, `salvar_progresso` e `ranking` | **não, verificado hoje**: as funções `eu_estou_banido` e `minha_situacao_de_dev` não existem (o banco responde "não achei a função") |

**Cuidado com a ordem:** o 003 troca funções do 001 (`create or replace`). O código da D1 sabe lidar com o banco sem o
003 (o `meuBanimento` falha em silêncio e cai na mensagem padrão). Mesmo assim, o SQL e o código da D1 devem ir juntos
ao `main`.

### I.2 Estado da D1

- **Feito (commit `ff0718c` no ramo `area-dev`):**
  - a tela `/dev` num pedaço separado do build (17,5 KB), com entrada, 2FA por app (TOTP), painel inicial, aviso de
    inatividade (29 e 30 min) e a confirmação de ação perigosa (para a D2 em diante);
  - o serviço e as regras com testes;
  - a conta banida no jogo (entrada, sinal e save), com a mensagem do prazo e do motivo.
- **Falta para testar:**
  1. o Pablo rodar o `003_area_dev.sql` no SQL Editor;
  2. pôr a conta dele em `devs` (o `insert` comentado, com o e-mail dele, sem salvar em arquivo);
  3. ter um app autenticador;
  4. seguir `testes/area-dev-D1.md` (AD-01 a AD-13).
- **Pelo pedido de 18 e 19/11, a D1 fica parada** (é extra). O ramo `area-dev` pode esperar sem problema: só tem um
  commit a mais que o `main` e não conflita com nada.

### I.3 Riscos

- **Supabase grátis pausando:** aconteceu em 20/10 (o Registro conta: o endereço sumia, as contas e o ranking não
  respondiam, e o convidado jogava normal). O plano grátis pausa depois de ~1 semana sem uso.
  - **Antes da apresentação de dezembro, abrir o painel e conferir se o projeto está ativo.**
  - Alternativa: um "ping" semanal (uma tarefa agendada que só lê o ranking).
- **Limite de e-mail:** o envio padrão do Supabase (sem SMTP próprio) é de poucos e-mails por hora (a documentação do
  Supabase fala em 2 a 4 por hora no plano grátis; **não verificado hoje**).
  - Numa apresentação com a turma criando contas ao mesmo tempo, a confirmação vai travar.
  - Soluções: um SMTP próprio (Resend, Brevo e similares; mexe no painel do Supabase) ou combinar que a turma jogue
    como convidado.
- **Contas TesteA e TesteB no ranking:** continuam lá (o `conferir:configuracao` de hoje entra nas duas: ver A.4).
  - O PLANO.md lembra de apagar na Fase 6.
  - Para não aparecerem, basta apagar as duas no painel (Authentication → Users) **depois** do último roteiro de contas.
- **Apelido preso por conta não confirmada** (B.3): com a turma criando contas, alguém pode "ocupar" um apelido sem
  confirmar.
- **Chave secreta:** só a publicável aparece no código e no `.env.local` (conferi o que o commit da D1 levou: nenhum
  e-mail real nem chave).

---

## J. Ferramentas de desenvolvimento

### J.1 O que existe hoje (só no `npm run dev`; o roteiro `conferir:configuracao` confere que o site publicado não tem nada disso)

- **Painel `</> DEV`** (`componentes/PainelDev.jsx`, fora da partida), com o estado em `estado/ferramentasDeDev.js`:
  - trocar convidado ou conta e salvar agora;
  - apagar o progresso;
  - contratar todas as classes;
  - itens de teste;
  - nível de cada personagem (−1, +1, +10, "quase subir");
  - Agilidade 5 ou 100, para testar o arco.
- **Barra de teste da partida** (`telas/partida/BarraDeTeste.jsx`, mandando comandos pela `jogo/ponte.js`):
  - fim da partida: Grande Vitória, Vitória, Retorno forçado e Derrota;
  - Invencível e o FPS na tela;
  - derrubar um aliado ou o Líder, "Aliados ajudam" e o seletor "IA:";
  - trocar a classe do Líder, "Encher grupo" e "Juntar todos";
  - criar mob vermelho e atirador;
  - recarregar habilidades, encher a mochila e "Pior cenário (FPS)";
  - drop especial do Boss, testar o foco, "Subir nível" e "+300 de ouro".
- **Arena de teste:** botão no Mapa, mapa de 1.600 × 900 com pedras, boneco de treino e mobs (`dados/arenaDeTeste.js`).
- **`window.__jogoDaPartida`:** a cena acessível de fora (os roteiros usam).
- **Scripts:** os roteiros do navegador, os prints, os conferidores e o gerador do Balanceamento (O.2).

### J.2 O que falta para as opções novas (3.3.6)

- **Super velocidade:**
  - um multiplicador só de dev na cena (por exemplo, `cena.dev.velocidade = 3`), aplicado à velocidade do Líder no
    `moverTodos`, e um botão na barra de teste;
  - **cuidado:** existe uma trava de segurança, `saltoMaximoPorQuadro` (`regras/movimento.js`, `movimento.velocidadeMaxima`
    = 1.200 px/s), que corta qualquer corpo que ande mais que isso por quadro. Super velocidade acima de ~5× precisa de
    uma exceção de dev, ou o Líder "trava" no limite;
  - os aliados ficam para trás e reaparecem pela regra do "aliado longe" (3 s fora da tela), o que já funciona.
- **Teletransporte:**
  - clicar no **minimapa** (é um canvas: converte o clique em ponto do mapa) ou "T + clique" no mapa;
  - o ponto passa pelo `lugarLivre` (regra do CLAUDE.md: nascer ou reaparecer sempre passa por ele);
  - o Líder vai com `colocarEm` (o mesmo do "Juntar todos", `CenaArena.js`, linha ~1690), e os aliados com ele;
  - a câmera pula junto (`centerOn`).
- **Simulador:** F.5 (regra pura, mais um roteiro ou um botão no navegador).
- **Tamanho:** P (velocidade e teletransporte); M (simulador puro); M (simulação no navegador).

---

## K. Qualidade e dívidas

### K.1 Defeitos conhecidos

| Defeito | Situação | Onde |
|---|---|---|
| **Sacerdote sem dano no beta** (quem começa de Sacerdote não vence luta sozinho) | aberto, **novo** | `dados/arvores.js`, `jogo/ataques/aura.js` |
| **Fugir sempre funciona** (o Líder é mais rápido que todo mob) | aberto, **novo** | `balanceamento.js` (`personagem.velocidade` 220; mobs 95 a 160) |
| **Atributos não mudam o dano nem a velocidade** (o Conceito §6 diz que mudam) | aberto, **novo** | `regras/atributos.js` (`efeitoDoAtributo` sem uso) |
| Imunidade de 0,5 s limita o dano de grupos | aberto (decisão de projeto) | `balanceamento.js` (`personagem.msDeImunidade`) |
| Apelido preso por conta nunca confirmada | aberto | `supabase/001_contas.sql`, linhas 27 a 40 |
| Partida sem internet some do histórico se o jogo fechar antes de a internet voltar | aberto | `estado/estadoDoJogo.js` (`partidasParaRegistrar` fora do save) |
| "EM RECARGA" às vezes não aparece no segundo aperto | intermitente: falhou em 5 de 6 rodadas em 22/10, e **também no código de antes** (comparado em 22/10); hoje passou | `scripts/testarNoNavegador.mjs`, linha ~750; o texto flutuante dura 0,87 s |
| Dicas da primeira visita voltam num computador novo (ficam na preferência do navegador, não no save) | aberto, pequeno | `estado/estadoDoJogo.js`, linhas 215 a 217 |
| `04_muralhas.png` trocado na pasta do Pablo, sem commit | precisa de decisão | `documentacao/Telas/reino_pixel_art/` |

### K.2 Testes instáveis (roteiros do navegador)

Conferências que já falharam sem mudança no código (pelo Registro e pelas rodadas de 22/10 e de hoje):
- **arena:**
  - "EM RECARGA";
  - "corredor estreito: nenhum aliado em cima de outro";
  - "os mobs miram o Tanque na maior parte do tempo";
  - "campo aberto" (seção 37);
  - **hoje:** "IA avançada: Arqueiro e Mago não atiram na pedra" (o Arqueiro acertou a pedra 1 vez);
  - antigas, já corrigidas: dois mobs nascendo encostados e a ajuda com mob perto;
- **Floresta:**
  - o lobo que nasce perto da beira (Registro, linha 148);
  - **hoje:** o roteiro parou ao procurar um cervo vivo (seção 9; ver A.4);
- **Reino e camadas:** **hoje**, a tela cheia ("Document not active").
  - Falhou também rodando sozinho e numa cópia do `main` sem a D1: é o Edge escondido desta máquina (157), não o
    código.
  - **Não é intermitente:** falha sempre, e o roteiro do Reino para no meio (A.4).

**Causa comum:** os roteiros medem coisas que dependem do tempo de cada quadro e do sorteio de onde os mobs nascem.
Rodar de novo resolve, mas esconde problema de verdade. **Recomendação:**
- uma semente fixa para o sorteio dos mobs no modo de teste;
- esperas por condição em vez de tempos fixos;
- registrar cada intermitente com quantas vezes falhou.

### K.3 Arquivos grandes e partes frágeis

| Arquivo | Linhas | Por que é frágil |
|---|---|---|
| `src/index.css` | 3.392 | um arquivo só para o jogo inteiro; difícil achar o que vale onde (mais 411 no `identidade.css`) |
| `src/jogo/cenas/CenaArena.js` | 1.954 (116 métodos) | concentra criação, movimento, combate, mobs, minimapa, ponte e testes da barra. O mapa grande, os bonecos e os mobs novos vão mexer aqui. **Vale separar em módulos antes** (mobs, mundo, combate, desenho) |
| `src/regras/movimento.js` | 614 | a física "à mão" (separação, escorregar, destravar, caminho) |
| `src/jogo/iaDosAliados.js` | 475 | a IA na cena (mais 253 em `regras/iaDosAliados.js`) |
| `src/estado/estadoDoJogo.js` | 447 | o reducer único |
| `src/dados/balanceamento.js` | 496 | todos os números provisórios (bom ter num lugar só) |
| `scripts/testarNoNavegador.mjs` | grande (254 conferências) | coordenadas fixas e tempos fixos |

**Duplicação que pode divergir:**
- **`AGENTS.md` e `.agents/skills/` são cópias do `CLAUDE.md` e de `.claude/skills/` para o Codex.**
  - Hoje três skills já diferem: `modo-continuo`, `relatorio-de-fase` e `run-jogo-rpg`.
  - O `AGENTS.md` não tem a linha da D1.
  - Quem mudar um tem de mudar o outro. Sugestão: o `AGENTS.md` dizer só "siga o CLAUDE.md", ou um script que copie.
- O `Guia_de_Arte.md` tem as mesmas anotações de 14 e 15/11 repetidas em dois lugares (sem commit).

**Outras:**
- O build tem **~24 MB de imagens** do Reino e do Mapa (sem perda, decisão do Pablo): a primeira abertura em internet
  lenta é demorada (o pré-carregamento disfarça).
- Os arquivos misturam fins de linha (CRLF e LF): o git avisa a cada commit.
- O `npm run prints` apaga a pasta de destino antes.
- O lint está limpo (0 erros, 0 avisos).

---

## L. Ferramentas do Claude Code

| Item | O que é | Situação |
|---|---|---|
| `CLAUDE.md` | 61 linhas, **18 KB** (linhas muito longas) | carregado em toda conversa; é grande. A parte "Etapas" está velha ("10. Arte: esperando as imagens do PixelLab") |
| `.claude/skills/` (7) | `modo-continuo`, `verify`, `publicar`, `relatorio-de-fase`, `balanceamento`, `run-jogo-rpg` (com `driver.mjs`), `gerar-arte` | funcionam. O `gerar-arte` (7,7 KB) é do PixelLab, que foi deixado de lado; o `verify` não cita o `testar:botoes` nem o `testar:camadas` na lista de "antes de publicar" |
| `.claude/settings.local.json` | só os plugins ligados (skill-creator, frontend-design, supabase, vercel, design) | sem permissões guardadas |
| Plugins e MCP | PixelLab (funciona); Supabase e Vercel (**precisam de autorização nesta sessão**: a ferramenta avisa que exigem login, então não consegui usar); design | o `.codex/config.toml` liga o MCP do Supabase só para leitura e o da Vercel para o Codex |

**Recomendações (só recomendar):**
1. **Encurtar o CLAUDE.md:**
   - deixar só o que vale para toda conversa (regras, arquitetura em uma linha por área, comandos);
   - levar os detalhes de cada área para um `docs/arquitetura.md` ou para dentro das skills;
   - atualizar "Etapas".
2. **Uma fonte só para Claude e Codex:** o `AGENTS.md` apontar para o `CLAUDE.md` (ou o contrário), e as skills numa
   pasta só.
3. **Skills novas que ajudariam no plano grande:**
   - `diagramas` (gerar os PNG com o PlantUML desta máquina e renomear, C.2);
   - `exportar-conceito` (o PDF pelo Word, C.3);
   - `prototipos` (`npm run prints` com o mapa tela → caso de uso).
4. **Atualizar o `verify`** com o `testar:botoes` e o `testar:camadas`, e com a lista das conferências intermitentes
   conhecidas.
5. **Aposentar ou marcar o `gerar-arte`** como "fora de uso", já que a arte fica para o final e é do Pablo.
6. **Autorizar o MCP do Supabase só para leitura** (`/mcp`): ajudaria a conferir o que já foi rodado sem precisar de
   truques.

---

## M. Plano técnico sugerido para os blocos URGENTE e IMPORTANTE

**Antes de tudo, o prazo.** O `CLAUDE.md` e o `PLANO.md` dizem: **congelamento em 22/11** (daqui a 3 dias) e entrega
em **03/12** (daqui a 14 dias). A mensagem do Claude do chat diz que a entrega é em dezembro e que não haverá
apresentação em novembro, mas **não fala do congelamento**.
- Somando os tamanhos abaixo, o bloco IMPORTANTE inteiro é de **6 a 8 semanas** de trabalho no ritmo das fases
  anteriores. O URGENTE é de 1 a 1,5 semana.
- **Não cabe tudo até 03/12.** Na parte N proponho um corte.

**Tamanhos:**

| Tamanho | Quanto é |
|---|---|
| P | menos de 1 sessão |
| M | 1 a 2 sessões |
| G | 3 a 4 sessões |
| GG | 5 ou mais sessões |

Uma "sessão" é um bloco de trabalho como os das fases de outubro (uma parte com testes, documentação e commit).

### M.1 Bloco URGENTE (documentação)

| Item | Abordagem | Arquivos | Tamanho | Depende de | Riscos | Teste visual do Pablo |
|---|---|---|---|---|---|---|
| 1. Diagrama de casos de uso novo | reescrever o `.puml` com os atores "Jogador" e "Desenvolvedor", pacotes por área (Acesso, Reino, Partida, Planalto, Dev, Extra) e os UC44 a UC49 (C.5); gerar o PNG pelo PlantUML desta máquina (C.2) e renomear | `documentacao/diagramas/02_*` | M | as decisões da parte N (nomes e quais UCs entram) | ficar desatualizado se as funcionalidades mudarem na hora de fazer | abrir o PNG e conferir se cada tela do jogo tem o seu caso de uso |
| 2. Diagramas de atividades | **Acesso:** refazer agora pelo `conta/fluxo.js` (estável). **Partida e Caravana:** depois da Caravana e do mapa grande. **Guilda:** depois do NPC | `03_*`, `04_*`, `05_*` e um novo `06_Diagrama_Atividades_Caravana.puml` | M | Caravana (M.2.3) e NPC (M.2.4) | refazer duas vezes, se for feito antes | conferir o diagrama jogando o mesmo caminho |
| 3. Protótipos novos | estender o `printsDasTelas.mjs` com as telas que faltam (C.4); nomes com o caso de uso; um README em `prototipos/` ligando print → UC → RF; os antigos numa subpasta | `programacao/scripts/printsDasTelas.mjs`, `documentacao/prototipos/` | M | **as funcionalidades novas** (NPC, Caravana, bonecos, mapa) | tirar cedo demais e ficarem velhos de novo | abrir a pasta e conferir que toda tela está lá |
| 4. Requisitos, histórias e matriz | escrever os RF56 a RF62, o RNF15, os UC44 a UC49 e as histórias (C.5) **como "planejado"** logo depois das decisões; marcar "feito" ao terminar cada funcionalidade; atualizar a matriz | `docAdicional/06` a `09` | M (texto) | decisões; depois, cada funcionalidade | — | ler e comparar com o jogo |
| 5. Conceito: PDF e "Trabalhos futuros" | escrever a 21.10 (decisões de 18 e 19/11) e a "Trabalhos futuros" no `.docx`; exportar o PDF pelo Word por script (C.3) | `ideias/01_Conceito_do_Jogo.docx` e `.pdf` | P | **ser o último** (depois de toda a documentação) | o `.docx` é editado como XML (já foi feito assim em 21/10); conferir no Word | abrir o PDF |

### M.2 Bloco IMPORTANTE (jogo)

| Item | Abordagem (detalhe nas seções) | Arquivos principais | Tamanho | Depende de | Riscos | Teste visual do Pablo |
|---|---|---|---|---|---|---|
| 1. Floresta maior e fixa | polígonos à mão mais a grade de terreno; parede da mata pela grade; zonas neutras; desenho por blocos; caminho com grades locais; roteiros revistos (E.2, E.3) | `dados/mundo/floresta.js`, `regras/mundo.js`, `regras/mapaDaPartida.js`, `jogo/mapas.js`, `jogo/navegador.js`, `regras/movimento.js` (grade), `CenaArena.js`, `scripts/testarFloresta.mjs`, `testarParedes.mjs` | **GG** | decisões do tamanho e da forma; as opções de dev (M.2.6) ajudam a testar | desempenho (60 FPS), roteiros longos, a taxa por distância mudar muito | andar de ponta a ponta (3 a 5 min), ver as regiões com forma natural, as zonas neutras e o fim |
| 2. Mobs e lugares (10 mobs, animais, acampamento, forte, Ogro) | classes novas por comportamento (fugitivo, xamã que cura, Aranha-Mãe que prende, goblin arqueiro, Ogro); território pela área (E.3); grupos (acampamento, forte) que acordam juntos; regra pura de prioridade de alvo para os aliados (xamã primeiro) | `jogo/entidades/` (novas), `regras/mobs.js`, `dados/balanceamento.js` (`mundo.mobs`), `dados/mundo/floresta.js`, `regras/iaDosAliados.js`, `dados/itens.js` (drops), `dados/missoes.js` | **GG** | M.2.1 (onde ficam); M.2.5 (para cada um ter forma própria); M.2.7 (números) | a IA dos aliados com grupos grandes; o desempenho; muitos testes novos | ver cada espécie com a sua forma e o seu jeito; o acampamento acordando junto; o xamã curando |
| 3. Caravana | trocar o ponto de partida pela Caravana (E.4): regra pura do preço, a tela, o pagamento como operação do Reino, os dados das paradas | `telas/partida/PontoPartida.jsx` (vira a Caravana), `regras/caravana.js` (nova), `regras/reino.js`, `dados/mundo/floresta.js`, `dados/balanceamento.js`, `scripts/testarReino.mjs` e `testarFloresta.mjs` | M | M.2.1 (zonas neutras) | o save (`pontoPartida`, `regioesDescobertas`), sem formato novo; a taxa | pagar e nascer na zona neutra escolhida; o botão apagado sem ouro, com o motivo |
| 4. NPCs | `dados/npcs.js`, `regras/npcs.js`, `componentes/ui/Npc.jsx` e o estado "conversando ou na loja" nas três telas (G.2) | `telas/reino/Mercado.jsx`, `Forja.jsx`, `Guilda.jsx`, `dados/npcs.js`, `progresso.npcsConhecidos` | M | nada (o desenho do NPC pode usar o boneco da M.2.5) | o `testar:reino` passa a ter um clique a mais em tudo | entrar no Mercado pela primeira vez (apresentação) e depois (fala aleatória); cada opção do menu |
| 5. Bonecos de quadradinho | módulo de desenho com receitas em dados; braço que segue a mira e a "viradinha" por regra pura; animação de andar e atacar (D.3); depois os mobs e animais | `jogo/entidades/Entidade.js`, `Personagem.js`, `jogo/ataques/`, `dados/bonecos.js` (novo), `regras/bonecos.js` (novo) | G (personagens) + M (mobs) | nada | desempenho; o boneco "estranho" (avaliação do Pablo, como na arte) | ver as 5 classes andando e atacando, o Tanque e o Arqueiro mirando para cima, para baixo e para os lados |
| 6. Opções de dev | super velocidade, teletransporte (minimapa ou "T + clique") e o simulador (F.5, J.2) | `telas/partida/BarraDeTeste.jsx`, `jogo/ponte.js`, `CenaArena.js`, `regras/simulador.js` (novo), um script | P + M | nada | a trava de salto por quadro (`movimento.velocidadeMaxima`) | correr 3× mais rápido; clicar no minimapa e aparecer lá; rodar o simulador e ler a tabela |
| 7. Balanceamento por nível | primeiro a base (F.5: atributos no dano e na velocidade, dano do Sacerdote, imunidade); depois os números de cada região com o simulador; o Balanceamento.md regenerado | `regras/atributos.js`, `regras/grupoDaPartida.js`, `jogo/ataques/*`, `dados/balanceamento.js`, `dados/classes.js`, `scripts/gerarBalanceamento.js` | M (base) + M (números) | M.2.6 (simulador); M.2.2 (os mobs que vão existir) | mexe em tudo o que os roteiros medem; muitos testes de limite | jogar com um personagem de nível 1 na fácil e sofrer; ver que correr não salva na média |
| 8. Pesca visual | canvas em React na tela do minijogo, com as regras do Lago de hoje (H.2) | `telas/partida/Minijogo.jsx`, um desenho novo | M | nada (pode usar o boneco da M.2.5) | — | pescar: puxar na hora certa e ver o peixe pular |

### M.3 Ordem sugerida de execução (cada parte entregável e testável sozinha)

| Parte | O quê | Por que nesta ordem |
|---|---|---|
| 0 · Decisões e arrumação (P) | as respostas da parte N; apagar os ramos já juntados; guardar a arte aprovada no git; decidir a muralha 04; escrever os RFs e UCs novos como "planejado" (M.1.4) | sem as decisões, o resto muda no meio |
| 1 · Opções de dev (P) | super velocidade e teletransporte | deixa testar todo o resto mais rápido, principalmente o mapa grande |
| 2 · Bonecos dos personagens (G) | as 5 classes em quadradinho, com o braço que mira e as animações | não depende de nada e é o que mais muda o visual; o Pablo avalia cedo |
| 3 · Base do balanceamento (M) | atributos no dano e na velocidade, dano do Sacerdote, imunidade, simulador puro | o mapa e os mobs novos precisam dessa base para os números fazerem sentido |
| 4 · Mapa grande fixo (GG, em 3 entregas) | 4a: dados e regras (polígonos, grade de terreno, zonas neutras, testes puros); 4b: desenho por blocos e caminho local, medindo os 60 FPS; 4c: roteiros revistos | a base de mobs, Caravana e diagramas |
| 5 · Mobs novos (GG, em 4 entregas) | 5a: lobos, Lobo Alfa e animais pacíficos com território pela área; 5b: goblins e o acampamento (com a prioridade do xamã); 5c: o forte e o Orc; 5d: o Ogro | cada entrega dá para jogar |
| 6 · Caravana (M) | substitui o ponto de partida | precisa das zonas neutras (4a) |
| 7 · Balanceamento das regiões (M) | números de cada região com o simulador e o teste do Pablo | precisa dos mobs (5) |
| 8 · NPCs (M) | as três lojas | independente; pode subir na fila se o mapa atrasar |
| 9 · Pesca visual (M) | o Lago | independente |
| 10 · Documentação final (G) | diagramas de atividades (Partida, Caravana, Guilda), diagrama de casos de uso, requisitos, histórias e matriz "feito", protótipos (prints), Conceito 21.10 e "Trabalhos futuros", PDF | **depois** das funcionalidades: assim os prints e os diagramas mostram o jogo final |

**Quando atualizar os diagramas:**
- **O de Acesso dá para fazer já** (não muda com a parte 3).
- **O de casos de uso dá para fazer logo depois das decisões** (parte 0), porque os casos de uso são o "o quê" e não o
  "como"; ajustar no fim.
- **Os de atividades de Partida, Caravana e Guilda, e os protótipos, só depois** das partes 4 a 8: são o "como", e
  mudariam a cada parte.

---

## N. Perguntas e decisões em aberto

| # | Pergunta | Minha recomendação |
|---|---|---|
| 1 | **O congelamento de 22/11 e a entrega de 03/12 continuam?** | Se continuam: até 03/12 fazer as partes 0, 1, 2, 3, 6 (com o mapa de hoje, usando as regiões como "paradas") e 8, e toda a documentação; o mapa grande, os mobs novos e o balanceamento por região viram "trabalho seguinte" (ou entram numa versão posterior à entrega). Se a data mudou: seguir a ordem da M.3 inteira |
| 2 | Quanto tempo de ponta a ponta? | 3 min (~40.000 px de caminho) no beta. O mapa num "S" ou com curvas, para não ficar com 40.000 px de largura (o minimapa e a taxa agradecem) |
| 3 | **Como o Sacerdote causa dano no beta?** | O clique da aura também causa um dano baixo nos inimigos dentro dela (ex.: 4 por pulso), ou a "Luz divina" na raiz. A primeira mexe menos na árvore |
| 4 | Velocidade pela Agilidade e mobs mais rápidos que o Líder do começo? | Sim; sem isso, correr sempre resolve (F.4) |
| 5 | A imunidade de 0,5 s depois de cada golpe continua? | Trocar por "imunidade só contra o mesmo atacante": cercado volta a ser perigoso |
| 6 | Os atributos passam a mudar o dano (Força, Inteligência)? | Sim, com o `efeitoDoAtributo` que já existe (curva 1,5), como o Conceito §6 já promete |
| 7 | A Caravana devolve o ouro se a partida cair (RF12)? | Devolver: o RF12 diz que a partida interrompida "não gasta" e volta tudo ao começo |
| 8 | As regiões descobertas ainda liberam alguma coisa? | Não liberam paradas (a Caravana fica sempre disponível, só o preço barra); continuam no minimapa e nas conquistas |
| 9 | A taxa conta pela distância em linha reta até o início do bioma? | Manter a regra e recalibrar a "borda" para o mapa novo (é o que o RF48 e o Conceito dizem) |
| 10 | O Guardião da Floresta sai do mapa? | Sair do mapa e ficar no código (fora do beta), para ser o "chefe avançado" depois |
| 11 | Os 10 mobs da lista do Claude do chat estão aprovados? | Sim, mas entregar em levas (5a a 5d da M.3); se faltar tempo, começar por Lobo, Lobo Alfa, Cervo, Goblin Lanceiro, Goblin Arqueiro, Goblin Xamã e o Ogro |
| 12 | Os bonecos de quadradinho ficam até a pixel art? A arte aprovada (Mago e Tanque 32 × 32) espera? | Sim. O código da arte (D.1) já troca o boneco pela imagem quando ela chegar |
| 13 | Quem escreve as falas dos NPCs e o nome deles? | Eu rascunho, marcado "PROVISÓRIO – substituir pelo do grupo", como foi com o conteúdo das TASKs |
| 14 | O SQL 003 (D1) roda agora? | Não: a D1 é extra e está parada. O ramo `area-dev` fica como está |
| 15 | A muralha nova (`04_muralhas.png`, trocada na pasta) entra no jogo? | Perguntar ao Pablo se foi de propósito; se sim, recortar e encaixar de novo (P) |
| 16 | A arte de `arte-original/` vai para o git? | Só os finais aprovados, numa pasta versionada (`documentacao/arte-aprovada/`) |
| 17 | Na apresentação de dezembro, a turma cria contas? | Se sim, configurar um SMTP próprio no Supabase (o padrão manda poucos e-mails por hora) e corrigir o apelido preso (B.3). Se não, todos jogam como convidado |
| 18 | O `AGENTS.md` e as skills do Codex continuam? | Se o Codex continua sendo usado, uma fonte só (L, item 2) |
| 19 | O minimapa no mapa grande | Um minimapa que acompanha o Líder (mostra uma janela do mapa) e o mapa inteiro na tela de pausa |

---

## O. Anexo: mapa do projeto

### O.1 `programacao/src/` (33.377 linhas de JS, JSX e CSS, sem contar as imagens)

```
src/
├─ main.jsx ............ entrada: espera a fonte; em /dev abre a Área do Desenvolvedor (ramo area-dev), senão o App
├─ App.jsx ............. a moldura 16:9, a tela atual, as janelas, os avisos, o painel DEV e o pré-carregamento
├─ index.css ........... todo o estilo (3.392 linhas)
├─ areaDev/ ............ (só no area-dev) a Sala dos Mestres: entrada, 2FA, painel, inatividade, confirmação perigosa
├─ arte/indice.js ...... acha as imagens de assets/arte pelo nome (import.meta.glob)
├─ assets/
│  ├─ arte/ ............ reino/ (peças do Pablo), mapa/ (peças do Pablo), telas/ (fundo-reino e fundo-mapa de reserva)
│  ├─ audio/ ........... vazio (só o LEIA-ME): todo som é bipe
│  └─ fontes/ .......... Pixelify Sans
├─ audio/ .............. gerenciador.js (música por tela, efeitos, mudo), arquivos.js
├─ componentes/ ........ Tela, Botao, Abas, Janela, Avisos, PainelDev (DEV), Pentagono, tela cheia, trilha...
│  ├─ cenario/ ......... o Reino e o Mapa em camadas: CenaEmCamadas (clique pelo desenho), CamadaAnimada, desenhoDoReino,
│  │                      desenhoDoMapa, preCarregar, SimboloDaPlaca
│  └─ ui/ .............. Slot, GradeDeItens, GradeComMao (item na mão), BotaoDeAcao, Painel, Selo, Barra, Mudanca, Descartar
├─ conta/ .............. cliente (o único cliente do Supabase), servico (nunca lança erro), fluxo (entrada, sessão,
│                         save na nuvem, banimento), horaDoServidor, navegador, servicoDev (area-dev)
├─ dados/ .............. todos os dados e números: balanceamento (provisórios), regras (fixos), taxas, classes, itens,
│  │                      mercado, forja, missoes, arvores, conquistas, interface, ajuda, posicoes, telas, arte, sons,
│  │                      animacoesDoCenario, arenaDeTeste, biomas, minijogos, areaDev (area-dev)
│  └─ mundo/ ........... floresta.js (o mapa provisório), minimapa.js (cores)
├─ estado/ ............. estadoDoJogo (o reducer), ProvedorDoJogo, progresso (normalizarProgresso), navegacao,
│                         preferencias, ferramentasDeDev, controleDaPartida, validacao, contexto
├─ estilo/identidade.css  a aparência do visual novo (placas, botões, pergaminho e madeira)
├─ janelas/ ............ Configuracoes, Pausa, ConfirmarFuga, ComoJogar, Ajuda
├─ jogo/ ............... a partida em Phaser 4
│  ├─ ArenaDaPartida.jsx  carrega o Phaser só aqui (import dinâmico)
│  ├─ criarJogo.js, ponte.js (Phaser ↔ React), navegador.js (caminho em grade), arte.js (sprites), mapas.js
│  │                      (desenho do mapa), efeitos.js, arco.js, iaDosAliados.js
│  ├─ cenas/CenaArena.js  a cena única da partida (1.954 linhas)
│  ├─ entidades/ ........ Entidade (base), Personagem, Inimigo, MobVermelho (corpo a corpo), Atirador,
│  │                      GuardiaoDaFloresta (Boss), BonecoDeTreino, ItemNoChao
│  ├─ ataques/ .......... espada, escudo, flecha, bolaMagica, projetil, aura, tiroInimigo
│  └─ habilidades/ ...... giro, tiroPerfurante, meteoro, provocacao, ressurreicao, apoio
├─ regras/ ............. regras puras com teste ao lado (~45 arquivos): combate, movimento, iaDosAliados, nivelDaIA,
│                         desmaio, habilidades, habilidadesDaArvore, andamentoDaPartida, fimDaPartida, ganhosDaPartida,
│                         taxa, xp, atributos, mundo, mobs, vizinhanca, mapaDaPartida, mochila, itemNaMao, itensNaPartida,
│                         itensNoChao, mercado, forja, guilda, missoes, reino, equipamento, conquistas, minijogos,
│                         rodadasDoDia, contas, interface, cenario, arte, som, telaCheia, carregamento, arco,
│                         passagemDoLider, grupoDaPartida, areaDev (area-dev)...
├─ salvamento/ ......... armazenamento, arquivoDeSave, formato, chaves, salvadorDoConvidado, salvadorLocal (cópia da
│                         conta), abaUnica, preferenciasLocais
├─ telas/
│  ├─ acesso/ ........... TelaInicial, Login, CriarConta, ConfirmeEmail, EsqueciSenha, NovaSenha, EscolherApelido,
│  │                      NarrativaInicial, SelecaoClasse
│  ├─ reino/ ............ Reino (camadas), Mochila, Mercado, Forja, Balcao, Guilda, Missoes, Contratos,
│  │                      ArvoresHabilidades, ArvoreDeHabilidades, SalaoGloria, Ranking, Conquistas, DetalheDoItem,
│  │                      useNoReino
│  ├─ partida/ .......... Mapa (camadas), PontoPartida, Preparacao, Partida, HudDaPartida, Minimapa, MochilaNaPartida,
│  │                      BarraDeTeste (DEV), CarregandoAPartida, CutsceneDerrota, Resumo, Minijogo
│  └─ index.js, telas.test.jsx (os testes das telas)
└─ testes/ajudantes.js
```

Fora de `src/`:
- `programacao/scripts/` (O.2);
- `programacao/supabase/` (`001` a `003` e o README);
- `programacao/arte-original/` (fora do git, D.2);
- `programacao/testes-do-navegador/` (prints dos roteiros, fora do git);
- `programacao/vercel.json`.

### O.2 Scripts do `package.json`

| Script | O que faz | Muda algo? |
|---|---|---|
| `dev` | o jogo no Vite (porta 5173), com o painel DEV e a barra de teste | não |
| `build` | o jogo para publicar, em `dist/` | só `dist/` |
| `preview` | serve o `dist/` | não |
| `lint` | ESLint | não |
| `test` / `test:observar` | Vitest (970 testes) / o mesmo, olhando os arquivos | não |
| `testar:navegador` | arena (254 conferências) num Edge escondido | só prints |
| `testar:floresta` | TEST-005: Floresta, câmera, regiões, mobs, FPS (73) | só prints |
| `testar:reino` | TEST-006: Reino, lojas, Guilda, Árvores, mochila da partida, tela cheia (84) | só prints |
| `testar:paredes` | anda encostado em todas as paredes da Floresta e mede o maior salto (9) | só prints |
| `testar:botoes` | nenhum botão sai do lugar (52) | só prints |
| `testar:camadas` | Reino e Mapa: clique pelo desenho, contorno, animações (34) | só prints |
| `testar:arte` | a arte entrando sozinha, com imagens de teste (39) | cria e apaga `src/assets/arte-de-teste/` |
| `conferir:arte` | o que chegou e o que falta da arte | não |
| `prints -- <pasta> [escuro]` | 36 prints das telas | **apaga e recria** `testes-do-navegador/telas/<pasta>` |
| `testar:contas` | TEST-007 no `npm run dev`, com as contas de teste (escreve no Supabase de verdade) | **escreve no banco** |
| `testar:contas:publicado` | o mesmo no site publicado | **escreve no banco** |
| `conferir:site` | o site como convidado (11) | não |
| `conferir:configuracao` | Supabase e Vercel sem mudar nada (entra com as contas A e B) | não muda dados |
| `balanceamento` | gera o `documentacao/Balanceamento.md` | **escreve o documento** |

Fora do `package.json`, em `scripts/`:
- `ferramentasDoNavegador.mjs`: o Vite e o Edge escondido, usados por todos os roteiros;
- `imagens.mjs`;
- `importarPersonagem.mjs`: importa um ZIP do PixelLab;
- `gravarAnimacoes.mjs`: grava quadros das animações do cenário para relatórios.

<!-- fim -->
