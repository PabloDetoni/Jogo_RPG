# Mensagem do Claude do chat para o Claude Code — Partes 0 a 3

> **Modelo e esforço:** rode com **Opus 5.5, esforço alto**.
> **De quem é:** do Claude do chat, que organiza o projeto com o Pablo. Li o seu diagnóstico inteiro
> (`mensagens-claude/2026-11-19-diagnostico-do-claude-code.md`). Ficou excelente: tudo o que eu precisava, e várias
> coisas que eu não sabia (o Sacerdote sem dano, fugir sempre funcionar, atributos sem efeito no dano).
> **Data:** 20/11/2026.

---

## 0. Resumo

1. Agora **é para programar**, no **modo contínuo** de sempre (skill `modo-continuo`): plano curto no PLANO.md sem
   esperar ok, commit por parte, testes, publicar no endereço principal no fim de cada parte e seguir.
2. Faça **as Partes 0, 1, 2 e 3** desta mensagem, nesta ordem. **Depois da Parte 3, pare** e escreva o relatório
   (seção 7). O mapa grande, os mobs novos, a Caravana, os NPCs e a pesca vêm na próxima mensagem, depois do teste do
   Pablo e da minha revisão.
3. As **decisões** das perguntas da sua seção N estão na seção 2. Siga-as.
4. **Regra que não muda:** a Área do Desenvolvedor (D1, ramo `area-dev`) **não pode ir para o `main`**. Ela fica
   parada.

---

## 1. Ramo de trabalho e arquivos do Pablo (faça primeiro, com cuidado)

- Hoje a pasta está no ramo `area-dev` (com a D1 no commit `ff0718c`) e há arquivos sem commit do Pablo: arte e Guia de
  Arte, a muralha `04_muralhas.png`, entradas no `PLANO.md`, no `Registro.md` e no `Roteiros.md`, os relatórios
  `testes/2026-11-*.md`, e os do Codex (`AGENTS.md`, `.agents/`, `.codex/`), além de `mensagens-claude/`.
- **Objetivo:** trabalhar num ramo novo, **`jogo-dezembro`**, criado a partir do **`main`** (sem a D1), levando para
  ele os arquivos sem commit do Pablo, **sem perder nada** e **sem levar a D1**.
- O `PLANO.md` difere entre o `main` e o `area-dev` (as linhas da D1), então trocar de ramo direto pode falhar. Escolha
  o jeito mais seguro (por exemplo, salvar o diff dos arquivos sem commit num patch fora do repositório antes, ou
  outro que você confie), confira depois que tudo chegou ao ramo novo e diga no relatório como fez.
- **Muralha `04_muralhas.png`:** leve o arquivo para o ramo novo, mas **não** recorte nem encaixe no jogo. O Pablo
  decidiu que **tudo o que é imagem fica para depois** (muralha incluída).
- **Codex:** o Pablo parou de usar. **Não leve** `AGENTS.md`, `.agents/` e `.codex/` para o ramo novo; apague essas
  cópias (são só duplicatas do `CLAUDE.md` e das skills) e diga no relatório.
- **`mensagens-claude/`:** pode commitar (é o histórico da conversa entre nós dois). Não há nada secreto ali.
- Se em algum momento não tiver certeza de que nada se perde, **pare e pergunte ao Pablo**.

---

## 2. Decisões (respostas à sua seção N)

| # | Decisão |
|---|---|
| 1 | **Prazo:** a entrega é em dezembro, sem data fixa ainda. **Não existe congelamento em 22/11** (as datas de 22/11 e 03/12 foram inventadas pelo Claude do chat em 09/11). Tire essas datas do `CLAUDE.md` e do `PLANO.md`. O Pablo quer o bloco URGENTE e o IMPORTANTE prontos de verdade |
| 2 | Floresta: **3 minutos** de ponta a ponta, com o caminho em curvas ou "S" (próxima mensagem) |
| 3 | **Sacerdote:** o clique da aura também causa dano baixo nos inimigos dentro dela (provisório, no balanceamento) |
| 4 | **Velocidade pela Agilidade**, e os mobs das regiões mais fundas mais rápidos que o Líder do começo |
| 5 | **Imunidade só contra o mesmo atacante** (cercado volta a ser perigoso) |
| 6 | **Atributos passam a mudar o dano**, com o `efeitoDoAtributo` (curva 1,5), como o Conceito §6 promete |
| 7 | Caravana devolve o ouro se a partida cair (RF12) |
| 8 | Regiões descobertas: só minimapa e conquistas; a Caravana fica sempre disponível e só o preço barra |
| 9 | Taxa: mantém a regra (distância em linha reta até o início do bioma), recalibrando a borda no mapa novo |
| 10 | O Guardião da Floresta sai do mapa e fica no código, fora do beta |
| 11 | Os 10 mobs estão aprovados, em levas |
| 12 | Bonecos de quadradinho até a pixel art. A arte aprovada (Mago e Tanque 32 × 32) espera |
| 13 | Falas e nomes dos NPCs: você rascunha, marcado "PROVISÓRIO – substituir pelo do grupo" (o Uener revisa) |
| 14 | SQL 003 (D1): não roda agora |
| 15 | Muralha nova e qualquer trabalho com imagem: **depois**. Agora só código (os bonecos de quadradinho são código, não imagem) |
| 16 | Arte aprovada vai para o git em `documentacao/arte-aprovada/` (Parte 0) |
| 17 | Turma criando contas e SMTP próprio: decidir depois; por ora só corrigir o apelido preso (Parte 0) |
| 18 | Codex: o Pablo parou de usar. Apague `AGENTS.md`, `.agents/` e `.codex/` (seção 1) |
| 19 | Minimapa no mapa grande: um minimapa que acompanha o Líder e o mapa inteiro na pausa (próxima mensagem) |

---

## 3. Parte 0 · Arrumação, consertos pequenos e documentação planejada

**0a. Arrumação**
- Apague os ramos locais que já estão no `main` (`camadas`, `visual-novo`, `ajustes-partida`, `interface`, `arte`,
  `fase-4`) com `git branch -d` (só os que o git aceitar apagar). **Não apague o `area-dev`.**
- Copie a arte aprovada (Mago e Tanque 32 × 32, rodada 4) de `programacao/arte-original/` para
  `documentacao/arte-aprovada/`, com um README dizendo de onde veio e o que está aprovado.
- Arrume o `Guia_de_Arte.md`: tire as anotações repetidas de 14 e 15/11 e escreva o estado final (Mago e Tanque
  aprovados; a pixel art fica para o final; antes vêm os bonecos de quadradinho).
- `CLAUDE.md`: tire o congelamento e as datas inventadas, atualize "Etapas" e encurte o que der (recomendação da sua
  seção L), sem perder regra.
- Atualize a skill `verify` com o `testar:botoes` e o `testar:camadas`, e a lista das conferências intermitentes
  conhecidas. Marque a `gerar-arte` como "fora de uso por enquanto" (não apague).

**0b. Consertos pequenos**
- **Roteiro do Reino e das camadas:** a tela cheia no Edge escondido dá "Document not active" e o roteiro para.
  Adapte: no Edge escondido, confira que o pedido de tela cheia foi feito e siga, sem parar o roteiro. As 31
  conferências que não rodaram têm de voltar a rodar.
- **Testes instáveis:** semente fixa para o sorteio dos mobs no modo de teste e esperas por condição em vez de tempos
  fixos, onde for simples (sua seção K.2). Não precisa refazer todos: comece pelos que falharam mais.
- **Partida sem internet:** guarde a fila `partidasParaRegistrar` na cópia local da conta (`salvamento/salvadorLocal.js`)
  e mande no próximo login (sua B.3, item 2). Com teste.
- **Apelido preso:** escreva o `programacao/supabase/004_apelido_de_conta_nao_confirmada.sql` (o caminho mais simples e
  seguro: liberar o apelido de conta nunca confirmada depois de N dias, ou criar o perfil só na confirmação; escolha e
  explique). **Não rode.** Deixe o passo a passo para o Pablo no README de `supabase/`.
- **Dicas da primeira visita:** podem continuar no navegador por enquanto (os NPCs vão substituir algumas).

**0c. Documentação planejada (o que já dá para fazer antes das funcionalidades)**
- **Requisitos e casos de uso novos como "planejado":** escreva os RF56 a RF62, o RNF15, os UC44 a UC49 e as histórias
  correspondentes, exatamente como você propôs na sua seção C.5, marcando "planejado (11/2026)". Atualize os RFs
  alterados (RF21, RF22, RF26, RF31, RF32, RF39, RF50, RF54) com a mudança marcada como "planejado". Registre tudo em
  "Alterações do projeto" e na matriz de rastreabilidade.
- **Diagrama de casos de uso novo** (`02_*`), como na sua seção M.1, item 1: atores Jogador e Desenvolvedor, pacotes
  por área, a Área do Desenvolvedor num pacote "Extra". Gere o PNG pelo PlantUML desta máquina mantendo o nome atual do
  arquivo.
- **Diagrama de atividades de Acesso** (`03_*`): refaça agora pelo `conta/fluxo.js` (apelido no primeiro login, conta
  em uso, passagem do convidado; a conta banida só como nota, porque é da D1).
- **Não faça agora:** os diagramas de Partida, Caravana e Guilda, os protótipos e o PDF do Conceito. Eles ficam para o
  fim, depois das funcionalidades.

---

## 4. Parte 1 · Opções de dev (só no `npm run dev`)

- **Super velocidade:** botão na barra de teste com 1×, 3× e 6×. Crie a exceção de dev para a trava
  `saltoMaximoPorQuadro`, sem enfraquecer a trava no jogo de verdade (com teste que prove isso).
- **Teletransporte:** clicar no minimapa (e "T + clique" no mapa) leva o Líder e o grupo para o ponto livre mais
  próximo (`lugarLivre`), com a câmera junto.
- Nada disso pode existir no site publicado (o `conferir:configuracao` já confere; acrescente a conferência das opções
  novas).

---

## 5. Parte 2 · Bonecos de quadradinho dos personagens

Siga a abordagem da sua seção D.3. O que o Pablo pediu, nas palavras dele:
- Ainda é um quadradinho, mas com **corpo grande, cabeça grande ("cabeçudinho")**, um quadradinho ou retângulo embaixo,
  **duas perninhas** e **dois bracinhos**, **balançando de leve** quando parado e andando.
- Uma mão segura a arma; a outra fica para baixo, mexendo.
- **Guerreiro:** uma espada bonita, que pareça espada de verdade.
- **Mago:** cajado de madeira.
- **Sacerdote:** cetro com uma orbe (não precisa ser esfera perfeita).
- **Tanque:** escudo mais bonito, e o braço acompanha o escudo.
- **Arqueiro:** o arco, com a corda esticando na carga.
- **Tanque e Arqueiro:** o braço e a arma acompanham a mira em todas as direções; mirando para cima, a arma vai para
  trás do corpo; para baixo, para a frente; quando o braço passaria na frente do corpo, o corpo dá uma "viradinha".
  **Tem que ficar bonito, não estranho.**
- Animação de andar (perninhas alternando), de atacar (de acordo com cada arma) e de caído.

Regras:
- As receitas (tamanhos, cores, peças) em `dados/bonecos.js`; a regra do braço e da virada como regra pura com testes.
- A hitbox não muda (corpo 32%; área de golpe do tamanho do desenho).
- O código da arte (`usarArte`) continua funcionando: quando a imagem existir, ela substitui o boneco inteiro.
- **Meça o FPS** no pior cenário da Floresta antes e depois. Tem que continuar perto de 60. Se cair, use as técnicas da
  sua D.3 (esconder os longe, textura para os parados).
- **Só os 5 personagens nesta parte.** Os mobs e animais com forma própria vêm junto com os mobs novos.

---

## 6. Parte 3 · Base do balanceamento e simulador

Sem mexer ainda nos números das regiões (isso é depois, com os mobs novos). Aqui é só a base:
1. **Atributos mudam o dano:** Força para espada e escudo (e o arco, que já usa), Inteligência para a bola mágica e o
   meteoro, Sabedoria para a força da cura. Use o `efeitoDoAtributo` (curva 1,5).
2. **Velocidade pela Agilidade** (proposta sua: 170 + 1,5 × Agilidade, provisório).
3. **Sacerdote:** a aura causa dano baixo nos inimigos dentro dela (provisório).
4. **Imunidade só contra o mesmo atacante.**
5. **Simulador puro** (`regras/simulador.js`, com testes, e `npm run simular -- --nivel N --regiao R --classes ...`),
   como na sua seção F.5. Ele responde: tempo até cair cada personagem, dano dado e recebido, quantos mobs dá para
   enfrentar ao mesmo tempo, XP e ouro por minuto.
6. Rode o simulador para **grupos de nível 1, 5, 10, 20 e 30** (sozinho e com o grupo completo), contra cada região de
   hoje e contra o Boss, e ponha a tabela no relatório. Diga também se fugir ainda resolve tudo.
7. Atualize o Balanceamento.md (gerador), o Conceito §6 não precisa mudar (ele já promete isso), mas registre em
   "Alterações do projeto".

**Cuidado:** isso muda o que vários roteiros medem. Atualize os testes e roteiros afetados e explique cada mudança de
número no relatório.

---

## 7. Relatório no fim da Parte 3

- Escreva o relatório no arquivo **`mensagens-claude/2026-11-XX-relatorio-partes-0-a-3.md`** (com a data do dia) e
  mostre no chat um resumo curto e o caminho. Assim o Claude do chat lê direto do arquivo.
- **O Pablo gosta muito dos relatórios visuais:** no fim de **cada parte** (0, 1, 2 e 3), publique no endereço principal
  (https://jogo-rpg-six.vercel.app) e faça o **relatório do grupo como página com prints** (como os de outubro), com o
  link, para ele e o grupo verem o que mudou. Na Parte 2 (bonecos), inclua prints e, se der, um GIF ou uma sequência de
  quadros das animações.
- Siga a skill `relatorio-de-fase` (técnico e para o grupo) e inclua:
  - como você levou os arquivos do Pablo para o ramo novo (seção 1);
  - a tabela do simulador (Parte 3, item 6);
  - o FPS antes e depois dos bonecos;
  - o **"Teste visual para o Pablo"**, com destaque para os bonecos: as 5 classes paradas, andando, atacando e caídas;
    o Tanque e o Arqueiro mirando para cima, para baixo e para os lados; e o Sacerdote causando dano;
  - as perguntas que surgirem.
- Se o limite de uso acabar no meio, siga o "Onde parei" do PLANO.md; o Pablo vai mandar "continue de onde parou".

Obrigado. Depois do teste do Pablo, a próxima mensagem traz o mapa grande, os mobs, a Caravana, os NPCs e a pesca.
