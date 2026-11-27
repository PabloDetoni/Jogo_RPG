# Relatório do Claude Code — Partes 11, 11b e 12 (mensagem de 26/11)

> **Escrito para:** o Claude do chat e o Pablo.
> **Data:** 26/11/2026.
> **Ramo:** `jogo-dezembro`. **No `main` (site):** as Partes 11, 11b e 12 estão publicadas em https://jogo-rpg-six.vercel.app (último commit `1ca36c8`). Os commits estão na seção 10.

---

## 1. Resumo

As três partes estão feitas, testadas e publicadas, cada uma com a sua página para o grupo.
- **Parte 11:** as respostas do Pablo entraram no jogo:
  - classes equilibradas pelo dano por segundo;
  - o forte acordando por partes, com os pontos de perigo no mapa da pausa;
  - a Caravana pelo ouro de uma partida típica;
  - Mercado, Forja e Guilda sem a dica da primeira visita.
- **Parte 11b:** a Fazenda e a Mina ganharam cenas desenhadas, como a pesca.
- **Parte 12:** a documentação final ficou pronta: diagramas, 56 protótipos nos dois temas, requisitos e matriz com a situação real, e o Conceito com a 21.10, a seção 22 (Trabalhos futuros) e o PDF.

As metas de dificuldade da Parte 8 continuam valendo. Para isso, alguns monstros mudaram (seção 6).

**Páginas para o grupo** (privadas: o Pablo compartilha pelo botão Share):

| Parte | Página |
|---|---|
| 11 e 11b (classes, forte, Caravana, Fazenda e Mina) | https://claude.ai/artifact/TkLKFPD2GS8Un2QQ6BbPhp |
| 12 (documentação final) | https://claude.ai/artifact/UQCQsoEjLGPwjsXap4eqN7 |

Um problema no caminho: o notebook estava na bateria (chegou a 6%), e na bateria o jogo cai de FPS e os roteiros do navegador travam. Os roteiros oficiais e as publicações foram todos feitos na tomada (seção 4).

## 2. Onde o projeto está

| Etapa | Situação |
|---|---|
| Etapas 1 a 9, Fase 4.5, ajustes de 14/10, visual novo e camadas | ✔ |
| Partes 0 a 3 (20 a 22/11) | ✔ publicadas |
| Partes 4 a 10 (22 a 24/11) | ✔ publicadas |
| **Partes 11 e 11b (26/11)** | ✔ publicadas (`9ace646`) |
| **Parte 12: documentação final (26/11)** | ✔ publicada (`1ca36c8`) |
| Pixel art | depois (decisão do Pablo) |
| Fase 6 (entrega) | falta: apagar as contas de teste do ranking, revisão final do grupo |
| Área do Desenvolvedor (D1) | parada no ramo `area-dev` (nunca vai para o `main`) |

## 3. O que mudou

### Parte 11: ajustes de balanceamento

**Classes:**
- [balanceamento.js](../programacao/src/dados/balanceamento.js): o dano dos ataques mudou:
  - Guerreiro 25 → 21;
  - Mago 30 → 40;
  - Tanque 8 → 9;
  - aura do Sacerdote 3 → 4 por pulso;
  - arco 26 → 62 de base.
- O crítico ganhou `bonusDaClasse` (Arqueiro +10%), aplicado em [grupoDaPartida.js](../programacao/src/regras/grupoDaPartida.js).
- A regra dos atributos não mudou.

**Monstros (para as metas continuarem valendo):**
- Lobo Alfa: 520 → 440 de vida, 34 → 32 de dano.
- Cura do xamã: 100 → 125.
- Região Difícil e o chefe: ×5,5 → ×6,5 de vida e ×2,6 → ×3 de dano.
- Novo `curaDaRegiao`: a cura do xamã cresce ×3 na Difícil, em vez de ×6,5 pela força. Entra em [mobs.js](../programacao/src/regras/mobs.js) (`fichaDoMob`).

**Forte em três partes:**
- `levas` no forte de [floresta.js](../programacao/src/dados/mundo/floresta.js):
  - Portão: 3 lanceiros;
  - Pátio: 2 lanceiros, 2 arqueiros e 1 xamã;
  - Torre: o Orc;
  - os 4 arqueiros das torres ficam 2 com o Portão e 2 com a Torre.
- O forte ficou com um xamã a menos.
- Regras puras em [acampamento.js](../programacao/src/regras/acampamento.js): `faixaDaLeva`, `dentroDaLeva`, `levaEm`, `lugaresNaLeva` e `centrosDasLevas`, com 7 testes novos.
- Cada parte é um bando e um território: `CenaArena.criarForte` e `Inimigo.naMinhaArea`.
- No simulador: `mobsDoAcampamento(id, leva)`.

**Pontos de perigo:**
- [Minimapa.jsx](../programacao/src/telas/partida/Minimapa.jsx) põe três bolinhas vermelhas com "!" no mapa da pausa, com o nome no `aria-label`.

**Caravana:**
- [caravana.js](../programacao/src/regras/caravana.js) ganhou `mobsDaRegiaoDoBioma` e `ouroDaPartidaTipica`.
- `precoDaParada` agora recebe o bioma e a parada.
- Cada parada tem `regiaoPerto`, e `mundo.caravana` = `{ fracaoDosMobs: 0.6, arredondar: 5 }`.

**Sem dica nas telas com NPC:**
- [ajuda.js](../programacao/src/dados/ajuda.js) não tem mais a dica do Mercado, da Forja e da Guilda.
- O teste agora aceita a apresentação do NPC no lugar da dica.
- O "?" dessas telas abre o "Como funciona".

**Drop do Ogro:** o Cinto do Ogro (8%, PROVISÓRIO) já existia. A Coroa de raízes continua com o Guardião.

**Simulador e metas:**
- A meta do forte agora é por parte, em [metasDoBalanceamento.test.js](../programacao/src/regras/metasDoBalanceamento.test.js): nível 28 vence cada parte; nível 16 não vence nenhuma; nível 22 ainda não vence o Pátio nem a Torre.
- O `Balanceamento.md` ganhou:
  - a coluna "Cura do xamã" por região;
  - o forte em partes;
  - a regra nova da Caravana;
  - a tabela "Dano por segundo das classes no nível 1".

### Parte 11b: Fazenda e Mina desenhadas

- [CenaDaFazenda.jsx](../programacao/src/telas/partida/CenaDaFazenda.jsx) e [CenaDaMina.jsx](../programacao/src/telas/partida/CenaDaMina.jsx): um canvas cada, como a pesca. O que só o desenho guarda (onde está o bonequinho, as faíscas, as plantas pulando) fica dentro do efeito.
- As medidas e as cores ficam em [minijogos.js](../programacao/src/dados/minijogos.js) (`fazendaDesenhada`, `minaDesenhada`).
- Regras de desenho em [regras/minijogos.js](../programacao/src/regras/minijogos.js), com testes:
  - `etapaDoCanteiro`: broto, planta, maduro ou murcho;
  - `lugarDoCanteiro`;
  - `rachadurasDaPedra`.
- Os botões continuam os mesmos (classes e nomes acessíveis), sem cor, por cima do desenho.
- As regras dos minijogos não mudaram.

### Parte 12: documentação

| Arquivo em `documentacao/` | O que mudou |
|---|---|
| [diagramas/02_Diagrama_Casos_de_Uso](../documentacao/diagramas/02_Diagrama_Casos_de_Uso.puml) | UC44 a UC47 feitos; o UC28 saiu (virou o UC44); UC32 com os monstros; UC34 "o Ogro"; legenda nova |
| [diagramas/03_Diagrama_Atividades_Acesso](../documentacao/diagramas/03_Diagrama_Atividades_Acesso.puml) | conferido: continua batendo com o código (nada mudou nas contas desde a Parte 0) |
| [diagramas/04_Diagrama_Atividades_Partida](../documentacao/diagramas/04_Diagrama_Atividades_Partida.puml) | refeito: Mapa → Caravana → Preparação → partida (E, Tab, Esc, Q, F, desmaio) → fim → Resumo, com o preço da Caravana no fim |
| [diagramas/05_Diagrama_Atividades_Guilda](../documentacao/diagramas/05_Diagrama_Atividades_Guilda.puml) | começa pela conversa com a Mestra Isolda (primeira visita e menu) |
| [diagramas/06_Diagrama_Atividades_Caravana](../documentacao/diagramas/06_Diagrama_Atividades_Caravana.puml) | **novo:** escolher a parada, conferir o ouro, começar, cobrar no fim, não cobrar se cair |
| [prototipos/](../documentacao/prototipos/README.md) | 56 prints novos (claro) e 56 em `escuro/`, com o caso de uso no nome; README com a tabela print → tela → caso de uso → requisitos; os antigos em `iniciais/` |
| [docAdicional/06_Descricao_dos_Casos_de_Uso.md](../documentacao/docAdicional/06_Descricao_dos_Casos_de_Uso.md) | "Planejado" virou "Feitos em 11/2026 e extras"; UC28 substituído; UC48 e UC49 trabalho futuro; linha nova em "Alterações" |
| [docAdicional/07_Historias_de_Usuario.md](../documentacao/docAdicional/07_Historias_de_Usuario.md) | HU28 substituída pela HU44; HU48 e HU49 trabalho futuro |
| [docAdicional/08_Requisitos.md](../documentacao/docAdicional/08_Requisitos.md) | coluna **Situação** em todos os RFs e RNFs; RF60 com o forte por partes; RNF15 feito; RNF09 consertado (estava quebrado em duas células); linhas das Partes 11, 11b e 12 em "Alterações" |
| [docAdicional/09_Matriz_de_Rastreabilidade.md](../documentacao/docAdicional/09_Matriz_de_Rastreabilidade.md) | refeita: cada RF → casos de uso, histórias, diagrama, protótipo (com link), testes e situação; os RNFs com como são conferidos; a tabela dos casos de uso atualizada |
| [README.md](../documentacao/README.md) | lista de todos os arquivos (com o 06, os protótipos, a Arquitetura, o Guia de Arte e a Vercel), números novos e "Como regerar" (diagramas, prints, Balanceamento, PDF) |
| [Supabase_passo_a_passo.md](../documentacao/Supabase_passo_a_passo.md) | Parte 3 nova: a tabela dos SQL (001, 002 e 004 rodam; o 003 é **só para a Área do Desenvolvedor**, não rodar), Passo G (002) e Passo H (004) |
| [ideias/01_Conceito_do_Jogo.docx](../documentacao/ideias/01_Conceito_do_Jogo.docx) e [.pdf](../documentacao/ideias/01_Conceito_do_Jogo.pdf) | 21.10 (decisões de 18 a 26/11), seção 22 Trabalhos futuros, item 22 na lista de seções, notas no §6 e no §11; títulos sempre junto do parágrafo seguinte; PDF pelo Word |
| [Balanceamento.md](../documentacao/Balanceamento.md) | regenerado (Parte 11) |
| [Arquitetura_do_Codigo.md](../documentacao/Arquitetura_do_Codigo.md) | linhas das Partes 11 e 11b |

**Como o Conceito foi conferido:**
- **§6:** ganhou a linha "No combate" (dano pelo atributo da classe, velocidade pela Agilidade, vida = Vitalidade × 10).
- **§11.1:** a Caravana no lugar do ponto de partida.
- **§11.2:** a tecla E também pega o item do chão.
- **§11.3:** mobs na zona deles, bandos, forte por partes e o dano das classes.
- **§11.4:** o Ogro.
- **§11.8:** o mapa inteiro na pausa.

As notas são curtas e apontam para a 21.10, sem reescrever o original.

**O PDF:**
- 24 páginas (eram 23).
- Conferi o texto de cada página: nenhuma termina num título.
- A frase "…para a programação começar:" (§19) ficou sozinha no fim de uma página; agora ela fica junto da lista.
- O documento não tem imagens.
- Não consegui ver o PDF como imagem (falta o `pdftoppm` nesta máquina). Vale o Pablo abrir e olhar.

**Prints:** o `npm run prints` ganhou o modo `prototipos`, que passa por todas as telas:
- o acesso inteiro;
- as janelas (Como jogar, Configurações, "?", Pausa, Confirmar fuga);
- o carregamento;
- a partida com o grupo de 5 e os mobs, e o Ogro;
- o Resumo de vitória e de derrota e a cutscene;
- os minijogos antes e jogando;
- os três NPCs.

O painel DEV e a barra de teste somem nos prints.

## 4. Testes rodados

| Teste | Resultado |
|---|---|
| Unitários (`npm test`) | **1.044 passando** (eram 1.031); novos: forte por partes (7), Caravana pela partida típica (4), minijogos desenhados (3), a meta do forte por parte, o teste da dica com NPC e o Esc na Forja |
| Lint e build | ok |
| Floresta | **109/109** (FPS no pior cenário: média 56 na rodada das Partes 11 e 11b, 61 na da Parte 12; o mínimo aceito é 55) |
| Arena | **254/254** |
| Reino | **86/86** (com a Fazenda e a Mina desenhadas, a Forja sem dica) |
| Camadas | 34/34 |
| Botões | 52/52 |
| Arte | 39/39 |
| Paredes | 12/12 |
| Site publicado (convidado) | 11/11, nas duas publicações |
| Contas no site | 54/54, nas duas publicações |

**O que falhou no caminho (e por quê):**
- **Na bateria:**
  - a medição de FPS da Floresta e os roteiros de camadas e botões travaram no vigia (4 minutos sem andar);
  - no Reino, o fade de uma placa ainda estava em 97% aos 300 ms.
  - Na tomada, tudo passou. O roteiro do Reino passou a esperar o fade terminar (até 2 s).
- **O roteiro do Reino ainda testava a dica da Forja**, que saiu de propósito. Agora ele confere que **não** há dica, que o "?" abre o "Como funciona" e que o Esc fecha a janela e fica na Forja.
- **Erros meus, corrigidos antes do commit:**
  - um final de linha duplicado num arquivo de teste;
  - um nome repetido no roteiro da Floresta;
  - o lint pegou uma leitura de ref no render;
  - o "Juntar todos" da barra de teste junta também os mobs, o que bagunçou o primeiro print da partida. O script dos prints agora leva só o grupo.

Registrado em [testes/Registro.md](../testes/Registro.md). Roteiros à mão novos em [testes/Roteiros.md](../testes/Roteiros.md):
- AJ-01 a AJ-05 (Parte 11);
- PE-02 e PE-03 (Fazenda e Mina).

## 5. Dano por segundo das classes (nível 1)

| Classe | Antes | Depois | Meta do Pablo |
|---|---|---|---|
| Guerreiro (2 alvos no arco) | 66,1 | **55,5** | ~55 |
| Arqueiro (carga cheia, 1 alvo) | 26,8 (crítico 16%) | **54,6** (crítico 26%) | ~55, crítico mais alto |
| Mago (por alvo, até 3 na explosão) | 20,9 | **27,9** | ~28 por alvo |
| Tanque | 13,9 | **15,6** | ~15 |
| Sacerdote (aura) | 6,0 | **8,0** | ~8 |

## 6. O simulador e os preços da Caravana

### A tabela nova do simulador (`npm run simular`; antes → depois só onde mudou)

| Nível | Grupo | Região | Antes | Depois | Mobs sem cair (antes → depois) |
|---|---|---|---|---|---|
| 1 | Guerreiro sozinho | Fácil / Média / Difícil / chefe | perde | perde (igual) | 1 / 0 / 0 / 0 |
| 1 | grupo de 5 | Fácil | vence em 5,1 s | vence em 3,8 s | 4 → 7 |
| 1 | grupo de 5 | Média | vence em 9,7 s | vence em 8,2 s | 3 |
| 1 | grupo de 5 | Difícil / chefe | perde | perde | 0 |
| 10 | Guerreiro sozinho | Média | perde em 4,8 s | perde em 4,8 s | 2 → 1 |
| 10 | Guerreiro sozinho | Difícil | perde em 2,2 s | perde em 1,2 s | 0 |
| 10 | grupo de 5 | Fácil | vence em 3,7 s | vence em 3,1 s | 10 → 12 |
| 10 | grupo de 5 | Média | vence em 7,9 s | vence em 6,7 s | 7 |
| 10 | grupo de 5 | Difícil | perde em 35,0 s | perde em 14,2 s | 0 |
| 30 | Guerreiro sozinho | Fácil | vence em 5,5 s | vence em 5,5 s | 5 → 6 |
| 30 | Guerreiro sozinho | Média | vence em 10,3 s | vence em 12,3 s | 3 |
| 30 | grupo de 5 | Fácil / Média | vence | vence (mais rápido) | 12 |
| 30 | grupo de 5 | Difícil | vence em 11,2 s | vence em 11,5 s | 3 |
| 30 | grupo de 5 | chefe (Ogro) | vence em 54,7 s | vence em 42,7 s | 0 |

**As metas do Pablo continuam passando (são testes):**
- sozinho no nível 1 vence um lobo com dificuldade e perde para dois;
- o Lobo Alfa ganha no nível 1 e perde no 6;
- o acampamento no nível 7 só cai derrubando o xamã primeiro;
- a Difícil cai no 16 e não no 11;
- o Ogro cai no 30 e não no 22 nem no 26;
- **o forte, parte por parte:** no 28 cada parte cai; no 16 nenhuma; no 22 o Pátio e a Torre ainda não.

### Preços da Caravana

| Parada | Antes (pela distância) | Depois (partida típica da região) | Partida típica (60% dos mobs da região) |
|---|---|---|---|
| Início do bioma | 0 | **0** | — |
| Clareira da Entrada (perto da Fácil) | 70 | **175** | 177 |
| Vau do Riacho (perto da Média) | 265 | **710** | 708 |
| Campo dos Cervos (perto da Difícil) | 495 | **2.815** | 2.816 |
| Pouso do Caçador (perto do chefe) | 675 | **2.815** | 417 (o Ogro dá só 300) |

Uma parada mais longe nunca custa menos que a anterior. Por isso o Pouso do Caçador ficou no preço do Campo dos Cervos (pergunta 1). A tela continua com o "antes → depois" do ouro e o "Falta N de ouro".

## 7. Teste visual para o Pablo (no site, https://jogo-rpg-six.vercel.app)

1. **Sem dica nas lojas:**
   - **Fazer:** Iniciar jogo → Jogar como convidado → escolha uma classe → Mercado.
   - **Deve aparecer:** o comerciante se apresenta e **não** aparece a caixa de dica com "Entendi". O "?" abre o "Como funciona: Mercado". Na Forja e na Guilda, a mesma coisa. Nas Árvores, a dica continua.
2. **Caravana nova:**
   - **Fazer:** Jogar → Floresta.
   - **Deve aparecer:** os preços 175, 710, 2.815 e 2.815. Com os 120 do começo, todas as paradas pagas ficam apagadas com "Falta N de ouro"; "Começar no início" continua liberado.
3. **Fazenda:**
   - **Fazer:** Jogar → Fazenda → Começar rodada.
   - **Deve aparecer:** o seu Líder em blocos ao lado de 9 canteiros de terra: broto, depois a planta, depois o trigo dourado com brilho pulsando e, se ninguém colher, a planta marrom caída. Clicando, o bonequinho anda até o canteiro; no maduro, o trigo pula para ele e o placar soma 1.
4. **Mina:**
   - **Fazer:** Jogar → Mina → Começar rodada. Clique na pedra 3 vezes.
   - **Deve aparecer:** a caverna vista de cima e o Líder com a picareta. A cada clique, a picareta desce, a pedra racha e saem faíscas amarelas. No terceiro, a pedra quebra em pedaços, o minério laranja pula para o bonequinho e ele anda até a pedra nova.
5. **Mapa da pausa:**
   - **Fazer:** numa partida, fora de combate, aperte Esc.
   - **Deve aparecer:** no mapa inteiro, três bolinhas vermelhas pequenas com "!" no Forte Goblin, perto do fim do caminho. Passando o mouse, aparece "Perigo: Portão do Forte Goblin", "Pátio" e "Torre".
6. **O forte por partes:**
   - Só dá para ver no `npm run dev`, com o teletransporte (o forte fica no fim da Difícil).
   - **Fazer:** chegue pelo portão oeste.
   - **Deve aparecer:** só os goblins do Portão (e os arqueiros das duas torres do oeste) vêm atrás. No meio do forte acorda o Pátio; do lado leste, o Orc.
7. **Classes:**
   - **Fazer:** na arena do `npm run dev`, bata 10 s no boneco de treino com cada classe.
   - **Deve aparecer:** o Arqueiro com carga cheia tira mais ou menos o mesmo que o Guerreiro (~55 por segundo), com mais críticos amarelos.
8. **Documentação:**
   - **Fazer:** abra `documentacao/prototipos/README.md` no GitHub ou no VS Code.
   - **Deve aparecer:** a tabela com os 56 prints, cada um com o link do escuro. Abra também o PDF do Conceito (`documentacao/ideias/01_Conceito_do_Jogo.pdf`) e confira o fim: a 21.10 e a 22 (Trabalhos futuros).

## 8. Decisões que tomei por conta própria

- **"Partida típica" = 60% dos mobs da região** (os soltos, as matilhas, os acampamentos e o forte), mais o chefe inteiro no domínio dele. O simulador não mede quantos mobs um grupo derruba numa partida; 60% é um chute PROVISÓRIO, em `mundo.caravana.fracaoDosMobs`.
- **Uma parada mais longe nunca custa menos.** Sem isso, o Pouso do Caçador custaria 415 e começar perto do chefe sairia mais barato que perto da Difícil.
- **A cura do xamã cresce menos que a vida na Difícil** (`curaDaRegiao`: ×3). Com a força de ×6,5, nenhuma parte do forte com xamã caía nem no nível 28. A outra saída era mudar a meta, e a mensagem pede para mudar os mobs.
- **Composição das partes do forte**, escolhida pelo simulador: o Portão é a entrada (a parte mais fácil); o Pátio e a Torre são para o fim da faixa. O forte ficou com 1 xamã, não 2: com dois, a Torre não caía no 28.
- **Os pontos de perigo** são bolinhas por cima do mapa da pausa (com o nome para leitores de tela), e não pintadas no canvas. Assim o roteiro consegue conferir.
- **A Mina vista de cima.** A primeira versão tinha teto e chão, mas a pedra aparece em qualquer lugar do campo e ficava "flutuando" perto do teto.
- **O Conceito:** corrigi o §6 e o §11 com notas curtas ("alteração 21.10") em vez de reescrever, para respeitar a regra de não reescrever o original. Também liguei "manter com o próximo" nos estilos de título, para nunca ficar título sozinho no fim de página.
- **Protótipos de telas que precisam de conta** (Confirme o e-mail, Senha nova, Apelido): tirados pela lista "Pular para" do painel DEV, que mostra a tela como ela é, sem conta de verdade.

## 9. O que ainda falta

- **Com o Pablo:**
  - olhar o PDF do Conceito aberto (não consegui ver como imagem aqui);
  - compartilhar as duas páginas;
  - testar no site (seção 7);
  - dizer se o SQL 004 já foi rodado (o passo a passo diz "rodar, se ainda não rodou");
  - na entrega (Fase 6), apagar as contas TesteA e TesteB do ranking.
- **Com o grupo:**
  - o nome do jogo (o diagrama de casos de uso ainda diz "[Nome do Jogo]");
  - o Uener revisar as falas dos NPCs;
  - o conteúdo das TASK-010 e 012 a 016 (árvores, mobs, mapa, itens, conquistas e minijogos continuam PROVISÓRIOS).
- **Comigo, se pedirem:** a pixel art (fica para o final) e a revisão dos números depois de jogar.

**Riscos:**
- O FPS no pior cenário variou entre 56 e 61 entre rodadas. Fica acima do mínimo de 55, mas mais perto dele que antes (o forte e os mobs da Difícil acordados).
- Na bateria, os roteiros travam: rodar sempre na tomada.
- A pasta de protótipos tem 51 MB de PNG (112 prints). Se pesar no GitHub, dá para passar o tema escuro para JPG.

## 10. Commits (no `jogo-dezembro`; publicados no `main` em `9ace646` e `1ca36c8`)

| Commit | O quê |
|---|---|
| `42934b1` | Parte 11: DPS das classes, forte em três partes, Caravana pela partida típica, lojas sem dica, mobs para as metas |
| `5748477` | Parte 11b: Fazenda e Mina desenhadas |
| `fd83c41` | Parte 12a: diagramas |
| `c2c6670` | PLANO: onde parei (bateria a 8%) |
| `1948d76` | roteiros na tomada; o Reino confere a Forja sem dica; Registro |
| `9ace646` | **merge no `main`** (Partes 11 e 11b) |
| `ce675fc` | publicadas; pontos de perigo menores no mapa da pausa |
| `696782a` | Parte 12b: protótipos |
| `ab0c4ca` | Parte 12c: requisitos, histórias, matriz, README, Supabase |
| `b6fcae3` | Parte 12d: Conceito e PDF |
| `2dd144b` | Registro e PLANO |
| `1ca36c8` | **merge no `main`** (Parte 12) |

## 11. Perguntas para o Pablo e o grupo

1. **Ouro do Ogro:** ele dá só 300 de ouro, bem menos que uma partida na Difícil (~4.700 se derrubar tudo). Por isso o Pouso do Caçador custa o mesmo que o Campo dos Cervos (2.815). Dar mais ouro ao Ogro (por exemplo 1.500) ou deixar assim?
2. **A primeira parada (175) não cabe nos 120 de ouro do começo:** o jogador só usa a Caravana depois de algumas partidas. É isso que vocês querem ("tem que doer")?
3. **"Partida típica" = 60% dos mobs da região:** serve, ou preferem outro número (os preços mudam junto)?
4. **O forte ficou com um xamã a menos** e a cura do xamã cresce menos na Difícil, para as metas valerem. Tudo bem?
5. **"Pergaminhos de treinamento"** entraram nos Trabalhos futuros só com o nome. O que eles fazem, para eu descrever uma frase no Conceito?
6. **O SQL 004 já foi rodado?** (Para eu marcar no `PLANO.md` e no README do Supabase.)
