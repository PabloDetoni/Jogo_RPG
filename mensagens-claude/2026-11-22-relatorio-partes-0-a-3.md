# Relatório do Claude Code — Partes 0 a 3 (mensagem de 20/11)

> **Escrito para:** o Claude do chat e o Pablo.
> **Data:** 22/11/2026 (o trabalho começou em 21/11).
> **Ramo:** `jogo-dezembro`. **No `main` (site):** Partes 0, 1, 2 e 3 publicadas (detalhes na seção 4).

---

## 1. Resumo

As quatro partes estão feitas, testadas e publicadas em https://jogo-rpg-six.vercel.app, cada uma com a sua página de
relatório para o grupo:

| Parte | O que é | Publicada | Página do grupo |
|---|---|---|---|
| 0 | arrumação, consertos dos testes e do jogo, fila de partidas guardada, SQL 004, documentação planejada | `96e9947` | https://claude.ai/artifact/1SuACNcG3J2M5U5pbREY51 |
| 1 | super velocidade e teletransporte, só no `npm run dev` | `3c4071b` | https://claude.ai/artifact/QLTt6PME9N282yRxhWRLz4 |
| 2 | os 5 personagens como bonecos de quadradinho | `5cb80b3` | https://claude.ai/artifact/R5VAm1XTKXkhQ7du6XaAJR |
| 3 | atributos no dano, na cura e na velocidade; aura com dano; imunidade por atacante; simulador | `7da5785` | https://claude.ai/artifact/SRhTCSGSHBNyxyVgmZob7K |

As páginas são privadas: o Pablo compartilha pelo botão Share.

Os achados que mais importam:
- **Os bonecos não custaram FPS:** no pior cenário da Floresta, 60 de média antes e depois (seção 6).
- **O simulador confirma o diagnóstico:** com os números de hoje, o grupo completo vence as três regiões com folga
  desde o nível 1; só o Boss é um desafio; **fugir ainda resolve tudo** (seção 7).
- **Três defeitos de verdade foram corrigidos** no caminho: os aliados atacavam o cervo sozinhos, o Arqueiro da IA às
  vezes atirava na pedra e uma partida terminada sem internet se perdia ao fechar a aba.

---

## 2. Como os arquivos do Pablo foram para o ramo novo (seção 1 da mensagem)

1. **Backup antes de tudo**, fora do repositório (na pasta temporária da sessão):
   - o diff dos arquivos sem commit num patch;
   - a lista do `git status`;
   - uma cópia de cada arquivo e pasta sem commit (PLANO, Guia de Arte, muralha, Registro, Roteiros, os 15
     `testes/2026-11-*.md`, `mensagens-claude/`, `AGENTS.md`, `.agents/`, `.codex/`);
   - o MD5 de cada um (23 arquivos).
2. `git stash` dos 5 arquivos rastreados alterados → `git checkout -b jogo-dezembro main` → `git stash pop`.
   - O git juntou o PLANO.md sozinho (3 vias). Os outros entraram sem conflito.
3. **Conferência:** todos os arquivos com o MD5 igual ao do backup, menos o PLANO.md.
   - No PLANO.md, a seção do plano da Área do Desenvolvedor tinha vindo junto. Eu a tirei à mão.
   - Conferi que a diferença para o backup é **só** essas linhas da D1.
   - Conferi também que a diferença para o `main` é **só** as anotações de arte do Pablo (12 a 15/11).
4. Commit `8cdf10c` no `jogo-dezembro`: os arquivos do Pablo e `mensagens-claude/`.
   - Sem nada da D1: `src/areaDev` não existe no ramo, e o CLAUDE.md do `main` não tem a linha da D1.
   - A D1 continua só no ramo `area-dev` (`ff0718c`) e nunca foi para o `main`.
5. **Codex:**
   - Apaguei `AGENTS.md`, `.agents/` e `.codex/` em 21/11.
   - **Em 22/11 às 13:58 eles voltaram, com conteúdo novo.** O `AGENTS.md` novo é uma cópia automática do
     `CLAUDE.md` de hoje, com "Claude" trocado por "Codex". O aplicativo do Codex está aberto no computador (vi o
     processo dele) e é ele quem recria esses arquivos.
   - Apaguei de novo e criei um `.gitignore` na raiz com os três nomes, para nunca irem para o git.
   - **Sugestão:** fechar o aplicativo do Codex (pergunta 2).
6. A muralha `04_muralhas.png` veio junto, sem nenhuma mudança (nada de imagem nesta rodada).

---

## 3. O que mudou, parte por parte

### Parte 0 · arrumação, consertos e documentação planejada

**0a, arrumação:**
- Apaguei 6 ramos locais já juntados, com `git branch -d` (o `area-dev` ficou).
- `documentacao/arte-aprovada/`: Mago e Tanque 32 × 32 da rodada 4, cópias exatas com o mesmo MD5, mais uma prévia
  8× e um README.
- `Guia_de_Arte.md`: um "estado final" no lugar das anotações repetidas de 12 a 15/11.
- `CLAUDE.md`:
  - sem o congelamento e sem as datas inventadas; "Etapas" atualizado;
  - de 17 para 11 KB. Os detalhes de cada área do código foram para `documentacao/Arquitetura_do_Codigo.md`, sem
    perder regra.
- Skills:
  - `verify`: com o `testar:botoes`, o `testar:camadas` e a lista das intermitentes;
  - `gerar-arte`: marcada "fora de uso por enquanto";
  - `modo-continuo`: sem o congelamento.

**0b, consertos:**
- **Tela cheia no Edge escondido:**
  - Os roteiros do Reino e das camadas trocam a API de tela cheia por uma "de mentira". Ela só aceita o pedido
    dentro de um clique de verdade e avisa o jogo como o navegador faria.
  - O Reino voltou a rodar as 84 conferências (antes parava em 50 de 53).
- **Instáveis:**
  - semente fixa do sorteio dos mobs e dos recursos, só no dev (`window.__sementeDeTeste`; `SEMENTE=sorteio` volta
    ao sorteio);
  - lobo e cervo vivos no roteiro da Floresta;
  - a Ressurreição em recarga no "Derrubar aliado";
  - `NAVEGADOR_GPU=1` na arena.
- **Três defeitos de verdade, achados pelos roteiros:**
  - **os aliados atacavam o cervo sozinhos.** O cervo, que "só reage se for atacado", revidava no Líder. Agora o
    mob não hostil só vira alvo dos aliados depois de provocado (`alvosDosAliados`, com teste);
  - **o Arqueiro da IA às vezes atirava na pedra:** ele conferia a linha de tiro ao começar a puxar, mas soltava
    depois sem conferir. Agora confere de novo ao soltar;
  - **partida sem internet:** a fila `partidasParaRegistrar` fica guardada no navegador
    (`jogo-rpg:conta:<id>:partidas`, fora do arquivo de save, sem mudar o formato) e sobe no próximo login.
    Tem 6 testes novos, incluindo "fechou a aba sem internet e entrou de novo depois".
- **Apelido preso:** `programacao/supabase/004_apelido_de_conta_nao_confirmada.sql`. **Não rodei.**
  - Escolha: **criar o perfil só quando a conta confirma o e-mail**, por dois gatilhos (no cadastro, se a conta já
    nasce confirmada; e na confirmação).
  - No fim, o arquivo solta os apelidos já presos (perfis de contas nunca confirmadas).
  - Se outra conta pegou o apelido no meio tempo, a confirmação não falha. A conta só fica sem perfil, e o jogo já
    pede outro apelido no primeiro login.
  - Por que não "liberar depois de N dias": precisaria de tarefa agendada e deixaria o apelido preso por N dias.
  - O passo a passo para o Pablo está em `programacao/supabase/README.md`.

**0c, documentação planejada:**
- RF56 a RF62, RNF15, UC44 a UC49 e HU44 a HU49, marcados "planejado (11/2026)".
- Os RFs alterados (RF21, RF22, RF26, RF31, RF32, RF39, RF50, RF54) com a mudança marcada "planejado".
- Os UCs alterados, a matriz e "Alterações do projeto".
- Diagramas refeitos, com o PNG gerado pelo PlantUML e o **mesmo nome de arquivo**:
  - `02_Diagrama_Casos_de_Uso`: atores Jogador e Desenvolvedor (que herda do Jogador), pacotes por área (Conta e
    acesso, Informações, Reino, Partida, Planalto, Desenvolvedor, Extra) e legenda (feito, planejado, extra);
  - `03_Diagrama_Atividades_Acesso`: feito pelo `conta/fluxo.js` (uma aba por navegador, conta em uso, apelido no
    primeiro login, a escolha do progresso, a passagem do convidado, as partidas guardadas; a conta banida só como
    nota).
- Não fiz os diagramas de Partida, Caravana e Guilda, os protótipos nem o PDF do Conceito, como pedido.

### Parte 1 · opções de desenvolvedor (só no `npm run dev`)

- **Super velocidade:** botão "Super velocidade: 1×" na barra de teste (1× → 3× → 6×), para o grupo inteiro.
  - A trava `saltoMaximoPorQuadro` ganhou a exceção de dev (`regras/opcoesDeDev.js`, `saltoMaximoComDev`).
  - O teste prova que, com `dev = false`, ela é **exatamente** a de antes, mesmo pedindo 6×.
- **Teletransporte:** clique no minimapa ou "T + clique" no mapa.
  - O Líder vai para o `lugarLivre` mais perto do ponto, e cada aliado para a vaga dele em volta (também por
    `lugarLivre`), com a câmera junto.
  - Com o T apertado, o clique não ataca.
- **Fora do site:**
  - O código das opções fica em `jogo/opcoesDeDev.js`, carregado com `import()` dentro de
    `if (import.meta.env.DEV)`. No build, ele nem entra no pacote; conferi no `dist/`.
  - O `conferir:configuracao` ganhou a conferência "o endereço principal não tem a super velocidade nem o
    teletransporte" (passou nas três publicações seguintes).
- **No navegador** (seção 11b nova do `testar:floresta`):
  - 3× andou 341 px contra 110 px em 1×;
  - em 6×, a trava de dev vai a 132 px por quadro contra 32 da normal;
  - o minimapa e o T + clique levaram o grupo ao ponto, sem ninguém dentro de parede, com a câmera em cima.

### Parte 2 · bonecos de quadradinho (os 5 personagens)

- **Receitas** em `dados/bonecos.js`:
  - as medidas das peças, as cores de cada classe (pela referência própria do Pablo e pelo Guia de Arte), a arma de
    cada um e os números da pose;
  - **a saia tem a cor-assinatura da classe** (a mesma do HUD), para o boneco continuar ligado à cor de sempre.
- **Regra pura** em `regras/bonecos.js`, com 13 testes:
  - o lado do corpo pela mira, com histerese (a "viradinha" só perto da vertical, sem piscar);
  - a arma atrás (mira para cima) ou na frente (para baixo), com histerese;
  - o ângulo do braço espelhado e limitado (o braço nunca cruza o corpo; as 8 direções testadas);
  - o balanço parado e andando, o golpe de cada arma e a corda do arco pela carga.
- **Desenho** em `jogo/entidades/BonecoDeQuadradinho.js`:
  - um `Graphics` por personagem, redesenhado a cada quadro dentro do container que já existia;
  - a posição, o tombo de quem cai e o piscar continuam com a `Entidade`.
- **Armas:**
  - espada com cabo, pomo, guarda dourada, lâmina com brilho e ponta;
  - cajado de madeira com a ponta mais grossa;
  - cetro dourado com uma orbe octogonal que brilha;
  - escudo em forma de escudo (borda dourada, cruz), na mão do Tanque e seguindo a mira; visto de trás quando vai
    para trás do corpo; treme e fica vermelho quando rompe;
  - arco curvo com a corda que estica na carga e a flecha armada; a mão livre do Arqueiro segura a corda.
- **Animações:**
  - andar: pernas alternando, corpo subindo e descendo, braço livre balançando;
  - atacar: a espada varre de cima para a frente, o cajado e o cetro inclinam, o escudo empurra, o arco recua;
  - caído: tomba, escurece e fecha os olhos; o anel do Líder some enquanto ele está caído.
- **Hitbox igual.** Com a imagem da classe (`usarArte`), ela substitui o boneco inteiro. Os mobs continuam
  quadrados.

### Parte 3 · base do balanceamento (sem mexer nos números das regiões)

1. **Atributos mudam o dano:**
   - `fatorDoAtributo` = (1 + efeito(valor) ÷ 30) ÷ (1 + efeito(valor inicial da classe) ÷ 30), com o
     `efeitoDoAtributo` da curva 1,5. No valor inicial da classe o fator é 1, então **o nível 1 continua igual** e
     os roteiros não precisaram mudar de número.
   - Força: espada, escudo e Giro. Inteligência: bola mágica e Meteoro. Sabedoria: a aura (dano) e a cura.
   - O Arqueiro continua com a Força só no arco (sem contar duas vezes).
   - Exemplos (referência 14): Força 25 = 1,2×; 50 = 2,0×; 75 = 2,8×; 100 = 3,7×.
2. **Velocidade:** 170 + 1,5 × Agilidade.
   - O grupo do começo anda entre 180 (Tanque) e 203 px/s (Arqueiro); antes, todos andavam a 220.
   - Os aliados andam na maior velocidade entre a deles e a do Líder (× 1,15), para não ficarem para trás.
3. **Sacerdote:** a aura tira **3 de vida por pulso** (6 por segundo) dos inimigos dentro dela, pela Sabedoria.
   - O cervo não provocado fica de fora.
   - Provisório, em `balanceamento.js` (`ataques.sacerdote.danoPorPulso`).
4. **Imunidade só contra o mesmo atacante:**
   - Cada personagem guarda quem bateu e até quando (`imuneContra` e `registrarImunidade`, com testes).
   - O tiro da aranha conta pela aranha, não pela bolinha.
   - A imunidade da Ressurreição continua valendo contra todos.
   - O piscar depois de apanhar continua igual.
5. **Simulador puro:**
   - `regras/simulador.js` com 6 testes; números do modelo em `dados/simulador.js`.
   - `npm run simular -- --nivel N --regiao R --classes ...` ou `npm run simular -- --tabela`.
6. **Tabela:** na seção 7.
7. **Documentação:**
   - `Balanceamento.md` regenerado, com a seção nova "Atributos no combate e simulador";
   - "Alterações do projeto" dos Requisitos;
   - RF61, RF62, UC46 e UC47 marcados "feito"; RNF15 "em parte" (faltam os mobs).

**Mudança de número que os roteiros sentem:**
- a velocidade (de 220 para 180–205);
- a imunidade (agora por atacante).

Os roteiros que zeravam a imunidade antes de um golpe de teste passaram a limpar também a de cada atacante. Nenhuma
conferência precisou de número novo, porque nenhuma media a velocidade exata nem o dano depois de subir de nível.

---

## 4. Testes rodados

| O quê | Parte 0 | Parte 1 | Parte 2 | Parte 3 |
|---|---|---|---|---|
| `npm test` | 939 | 946 | 959 | 974 |
| lint e build | ok | ok | ok | ok |
| arena (`testar:navegador`) | 254/254 | 254/254 | 254/254 | 254/254 |
| Floresta | 73/73 | 77/77 | 77/77 | 77/77 |
| Reino | 84/84 | 84/84 | 84/84 | 84/84 |
| camadas | 34/34 | 34/34 | 34/34 | 34/34 |
| paredes | 9/9 | 9/9 | 9/9 | 9/9 |
| botões | 52/52 | 52/52 | 52/52 | 52/52 |
| arte | 39/39 | 39/39 | 39/39 | 39/39 |
| `conferir:configuracao` | tudo certo | tudo certo | tudo certo | tudo certo |
| contas no site | 54/54 | 54/54 | 54/54 | 54/54 |

**Como cada parte foi validada:** os roteiros das Partes 1, 2 e 3 rodaram numa cópia do repositório (`git worktree`)
no commit exato de cada parte. Assim cada publicação foi testada como foi para o `main`, enquanto eu já programava a
parte seguinte.

**O que deu errado no caminho (e já está resolvido):**
- **Notebook na bateria (21/11):** com a bateria em 30% e depois 5%, o desenho pelo processador (SwiftShader) caiu
  para 18 FPS. Comparei com uma cópia do `main` e deu igual, então era a máquina e não o código. Avisei o Pablo, que
  ligou na tomada. A arena agora aceita `NAVEGADOR_GPU=1` (placa de vídeo), e anotei isso na skill `verify`.
- **`node_modules` apagado (21/11):**
  - Para comparar com o `main`, liguei o `node_modules` por um atalho (junction) dentro da cópia temporária. O
    `git worktree remove --force` seguiu o atalho e apagou o conteúdo do `node_modules` do projeto.
  - Nenhum arquivo do projeto se perdeu. Reinstalei as mesmas versões com `npm ci` (pelo `package-lock.json`, sem
    biblioteca nova), e os 939 testes, o lint, o build e o `.env.local` conferiram depois.
  - Guardei na memória como evitar (apagar o atalho com `rmdir` antes); na segunda cópia, fiz assim.
- **Intermitentes vistas:**
  - "a mira segue o ponto embaixo do mouse" (Floresta, uma vez; passou na rodada seguinte);
  - "IA média: Mago na pedra" (arena, uma vez, desenhando pelo processador na bateria).
  - As duas estão na lista da `verify`.

---

## 5. Teste visual para o Pablo

No site (https://jogo-rpg-six.vercel.app), com uma conta ou como convidado:

1. **As 5 classes paradas:** na Guilda, contrate as classes (ou use as que já tem) e comece uma partida na Floresta.
   - Deve aparecer cada um como boneco: cabeça grande, corpo, saia na cor da classe, perninhas e bracinhos.
   - Guerreiro de elmo cinza e capa vermelha com a espada; Mago com chapéu pontudo e cajado; Tanque de cabelo
     castanho com o escudo azul e dourado; Sacerdote de capuz branco com o cetro de orbe azul; Arqueiro de capuz
     verde com o arco.
   - Parados, respiram de leve. O Líder tem o anel branco no chão.
2. **Andando:** ande com WASD. As pernas alternam, o corpo sobe e desce e a mão livre balança. O boneco vira para o
   lado em que anda.
3. **Atacando:** clique com cada classe como Líder.
   - Guerreiro: a espada sobe e varre para a frente.
   - Mago e Sacerdote: o cajado e o cetro inclinam para a frente.
   - Tanque: o escudo empurra.
   - Arqueiro: segure o clique; a corda estica, a flecha aparece armada e, ao soltar, ela sai.
4. **Tanque e Arqueiro mirando:** com o Tanque de Líder, gire o mouse devagar em volta dele.
   - Para cima, o escudo vai para trás do corpo (aparece a parte de trás, marrom).
   - Para baixo, vem para a frente (aparece o emblema).
   - Para os lados, o corpo vira; perto da vertical, ele não fica piscando.
   - Faça o mesmo com o Arqueiro.
5. **Caídos:** deixe um aliado cair. Ele tomba, fica mais escuro e de olhos fechados, com a contagem dos 30 s.
6. **O Sacerdote causando dano:** jogue com o Sacerdote (ou com ele de aliado) perto de lobos.
   - A aura cura o grupo e tira um pouco de vida dos lobos dentro dela (números pequenos em cima deles).
   - O cervo, se ninguém bater nele, não leva dano da aura.
7. **Cercado é perigoso:** deixe 3 lobos cercarem o Líder. Cada um acerta; antes, depois do primeiro golpe, os outros
   não acertavam por meio segundo.
8. **Velocidade:** o grupo anda um pouco mais devagar que antes (180 a 205 px/s contra 220), e o Arqueiro (Agilidade
   22) é o mais rápido.
9. **Só no `npm run dev`:** o botão "Super velocidade", o clique no minimapa e o T + clique (roteiros DV-01 a DV-03 em
   `testes/Roteiros.md`). No site, nada disso aparece.

Os roteiros manuais novos estão em `testes/Roteiros.md` (DV-01 a DV-03, BO-01 a BO-03, BA-01 a BA-03).

---

## 6. FPS antes e depois dos bonecos

Pior cenário da Floresta (TEST-005: grupo de 5 e todos os mobs da Difícil acordados, 2 minutos, placa de vídeo Intel
Iris Xe):

| | Média | Mínimo | 5% piores |
|---|---|---|---|
| Antes (Parte 1, `81132c4`) | 60 | 55 | 59 |
| Depois (Parte 2, `bd3859b`) | 60 | 54 | 58 |

Ficou praticamente igual. Não precisei das técnicas da D.3 (esconder os longe, textura dos parados). O boneco já não é
redesenhado quando a entidade está fora da tela.

---

## 7. A tabela do simulador (Parte 3, item 6)

**Como ler:**
- **Luta padrão:** 3 mobs da região ao mesmo tempo (no Boss, ele sozinho).
- **Mobs sem cair:** o maior bando (de 1 a 12) que o grupo vence sem ninguém cair; 12 quer dizer "12 ou mais".
- **XP/min e ouro/min:** lutas seguidas com esse bando, mais 12 s andando até o próximo.
- **Fugir resolve:** o personagem mais lento do grupo é mais rápido que o mob mais rápido da região?
- **Atributos de cada nível:** os pontos do nível vão para o atributo da classe, a Vitalidade e a Agilidade, na
  receita de `dados/simulador.js`. Sem equipamento e sem habilidades.
- **É um modelo:** não há física, pedras, bote, caminho nem a IA de verdade. Serve para comparar, não para cronometrar.

| Nível | Grupo | Região | Luta padrão (3 mobs; Boss sozinho) | Quem cai (tempo) | Dano dado | Dano recebido | Mobs ao mesmo tempo sem cair | XP/min | Ouro/min | Fugir resolve |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | guerreiro | Fácil | vence em 2.3 s | ninguém cai | 148 | 28 | 8 | 591 | 325 | sim |
| 1 | guerreiro | Média | vence em 4.3 s | ninguém cai | 305 | 81 | 3 | 417 | 222 | sim |
| 1 | guerreiro | Difícil | perde em 2.9 s | guerreiro 2.8 s | 258 | 142 | 2 | 371 | 202 | sim |
| 1 | guerreiro | Domínio do Boss | perde em 2.3 s | guerreiro 2.3 s | 264 | 130 | 2 | 385 | 213 | sim |
| 1 | guerreiro | Boss | perde em 5.3 s | guerreiro 5.3 s | 317 | 120 | 0 | 0 | 0 | sim |
| 1 | grupo de 5 | Fácil | vence em 0.7 s | ninguém cai | 147 | 0 | 12 | 957 | 526 | sim |
| 1 | grupo de 5 | Média | vence em 2.1 s | ninguém cai | 305 | 0 | 12 | 1568 | 832 | sim |
| 1 | grupo de 5 | Difícil | vence em 2.5 s | ninguém cai | 447 | 40 | 7 | 1294 | 693 | sim |
| 1 | grupo de 5 | Domínio do Boss | vence em 2.2 s | ninguém cai | 429 | 0 | 9 | 1467 | 812 | sim |
| 1 | grupo de 5 | Boss | perde em 11.3 s | guerreiro 8.3 s, mago 6.8 s, tanque 11.3 s, sacerdote 6.8 s, arqueiro 3.8 s | 998 | 810 | 0 | 0 | 0 | sim |
| 5 | guerreiro | Fácil | vence em 1.9 s | ninguém cai | 148 | 28 | 11 | 767 | 422 | sim |
| 5 | guerreiro | Média | vence em 3.5 s | ninguém cai | 305 | 81 | 5 | 623 | 335 | sim |
| 5 | guerreiro | Difícil | perde em 4.5 s | guerreiro 4.5 s | 407 | 182 | 2 | 371 | 202 | sim |
| 5 | guerreiro | Domínio do Boss | vence em 4.3 s | ninguém cai | 429 | 156 | 3 | 521 | 288 | sim |
| 5 | guerreiro | Boss | perde em 8.3 s | guerreiro 8.3 s | 577 | 180 | 0 | 0 | 0 | sim |
| 5 | grupo de 5 | Fácil | vence em 0.7 s | ninguém cai | 148 | 0 | 12 | 983 | 541 | sim |
| 5 | grupo de 5 | Média | vence em 2.1 s | ninguém cai | 305 | 0 | 12 | 1581 | 840 | sim |
| 5 | grupo de 5 | Difícil | vence em 2.3 s | ninguém cai | 447 | 0 | 11 | 1876 | 1004 | sim |
| 5 | grupo de 5 | Domínio do Boss | vence em 2.1 s | ninguém cai | 429 | 0 | 11 | 1719 | 951 | sim |
| 5 | grupo de 5 | Boss | perde em 18.9 s | guerreiro 15.8 s, mago 11.3 s, tanque 18.8 s, sacerdote 12.8 s, arqueiro 9.8 s | 2100 | 1440 | 0 | 0 | 0 | sim |
| 10 | guerreiro | Fácil | vence em 1.9 s | ninguém cai | 148 | 28 | 12 | 845 | 465 | sim |
| 10 | guerreiro | Média | vence em 3.5 s | ninguém cai | 305 | 81 | 6 | 814 | 432 | sim |
| 10 | guerreiro | Difícil | vence em 4.7 s | ninguém cai | 447 | 160 | 4 | 721 | 387 | sim |
| 10 | guerreiro | Domínio do Boss | vence em 4.3 s | ninguém cai | 429 | 156 | 3 | 521 | 288 | sim |
| 10 | guerreiro | Boss | perde em 11.3 s | guerreiro 11.3 s | 887 | 240 | 0 | 0 | 0 | sim |
| 10 | grupo de 5 | Fácil | vence em 0.7 s | ninguém cai | 148 | 0 | 12 | 1011 | 556 | sim |
| 10 | grupo de 5 | Média | vence em 1.4 s | ninguém cai | 305 | 0 | 12 | 1629 | 865 | sim |
| 10 | grupo de 5 | Difícil | vence em 2.1 s | ninguém cai | 447 | 0 | 12 | 2170 | 1157 | sim |
| 10 | grupo de 5 | Domínio do Boss | vence em 2.1 s | ninguém cai | 429 | 0 | 12 | 1896 | 1049 | sim |
| 10 | grupo de 5 | Boss | vence em 14.2 s | ninguém cai | 2400 | 1350 | 1 | 918 | 574 | sim |
| 20 | guerreiro | Fácil | vence em 1.4 s | ninguém cai | 148 | 20 | 12 | 909 | 500 | sim |
| 20 | guerreiro | Média | vence em 2.6 s | ninguém cai | 305 | 54 | 10 | 1230 | 655 | sim |
| 20 | guerreiro | Difícil | vence em 3.9 s | ninguém cai | 447 | 120 | 5 | 890 | 479 | sim |
| 20 | guerreiro | Domínio do Boss | vence em 3.5 s | ninguém cai | 429 | 104 | 6 | 992 | 549 | sim |
| 20 | guerreiro | Boss | perde em 15.8 s | guerreiro 15.8 s | 1632 | 330 | 0 | 0 | 0 | sim |
| 20 | grupo de 5 | Fácil | vence em 0.7 s | ninguém cai | 148 | 0 | 12 | 1040 | 572 | sim |
| 20 | grupo de 5 | Média | vence em 1.1 s | ninguém cai | 306 | 0 | 12 | 1733 | 920 | sim |
| 20 | grupo de 5 | Difícil | vence em 2.0 s | ninguém cai | 447 | 0 | 12 | 2371 | 1265 | sim |
| 20 | grupo de 5 | Domínio do Boss | vence em 1.4 s | ninguém cai | 430 | 0 | 12 | 2026 | 1121 | sim |
| 20 | grupo de 5 | Boss | vence em 11.1 s | ninguém cai | 2400 | 1050 | 1 | 1041 | 651 | sim |
| 30 | guerreiro | Fácil | vence em 1.4 s | ninguém cai | 148 | 20 | 12 | 909 | 500 | sim |
| 30 | guerreiro | Média | vence em 2.6 s | ninguém cai | 305 | 54 | 11 | 1284 | 685 | sim |
| 30 | guerreiro | Difícil | vence em 3.0 s | ninguém cai | 447 | 120 | 8 | 1437 | 770 | sim |
| 30 | guerreiro | Domínio do Boss | vence em 2.6 s | ninguém cai | 429 | 104 | 8 | 1323 | 732 | sim |
| 30 | guerreiro | Boss | vence em 18.3 s | ninguém cai | 2400 | 360 | 1 | 793 | 496 | sim |
| 30 | grupo de 5 | Fácil | vence em 0.7 s | ninguém cai | 148 | 0 | 12 | 1040 | 572 | sim |
| 30 | grupo de 5 | Média | vence em 0.7 s | ninguém cai | 305 | 0 | 12 | 1802 | 957 | sim |
| 30 | grupo de 5 | Difícil | vence em 1.3 s | ninguém cai | 447 | 0 | 12 | 2498 | 1332 | sim |
| 30 | grupo de 5 | Domínio do Boss | vence em 1.3 s | ninguém cai | 429 | 0 | 12 | 2162 | 1196 | sim |
| 30 | grupo de 5 | Boss | vence em 8.3 s | ninguém cai | 2400 | 750 | 1 | 1185 | 741 | sim |

**O que a tabela diz:**
- **O grupo completo vence as três regiões com folga desde o nível 1.** Já no nível 1, enfrenta 12 mobs da Fácil e da
  Média e 7 da Difícil ao mesmo tempo sem ninguém cair. Só o **Boss** é um desafio: o grupo perde no nível 1 e no 5 e
  vence a partir do 10.
- **Sozinho**, o Guerreiro de nível 1 vence 8 mobs da Fácil e 3 da Média, mas cai na Difícil e no Domínio do Boss
  (com 2 mobs). No nível 5 ele ainda perde a luta padrão da Difícil (aguenta 2 mobs) e vence a partir do 10; o Boss, só no 30.
- **Fugir ainda resolve tudo:** em todas as linhas, o personagem mais lento (180 px/s, o Tanque) é mais rápido que o
  mob mais rápido (o lobo, 150; o cervo, que não ataca, 160). Para mudar isso (decisão 4), os mobs das regiões fundas
  precisam passar de ~185 px/s. Isso fica para os números das regiões, com os mobs novos.
- **XP:** o grupo de nível 1 faz ~1.000 a 1.600 de XP por minuto nas regiões (dividido por 5). O nível 10 pede 4.500
  de XP por personagem. Então a curva de XP e o XP dos mobs também precisam ser decididos com os mobs novos.

---

## 8. Decisões que eu tomei

1. **O fator do atributo é 1 no valor inicial da classe:** o nível 1 ficou igual (nenhum número dos roteiros mudou), e
   o atributo só passa a pesar quando sobe. A escala (30) faz o 100 valer cerca de 1,8× o 50 e 3,7× o inicial.
2. **O Arqueiro não ganhou fator novo:** o arco já usa a Força (o Tiro perfurante também ficou como estava).
3. **A aura só machuca quando existe:** ela já roda sem parar enquanto alguém do grupo estiver ferido (regra de 08/10).
   Com o grupo de vida cheia, não há aura, então não há dano. Ver a pergunta 4.
4. **Aliados na velocidade do mais rápido (deles ou do Líder):** senão, um Líder Arqueiro deixaria o Tanque para trás.
5. **A fila de partidas fica numa chave própria do navegador**, fora do arquivo de save: assim o formato do save não
   mudou.
6. **SQL 004:** o perfil só na confirmação (seção 3, 0b).
7. **Os roteiros da arena e da Floresta foram validados pela placa de vídeo** (`NAVEGADOR_GPU=1`), porque na bateria o
   processador não dava conta. O padrão da arena continua sendo o processador, como ela foi ajustada.
8. **A saia na cor da classe**, para o boneco continuar ligado ao HUD (as roupas seguem a referência do Pablo).

---

## 9. Perguntas

1. **SQL 004:** o Pablo pode rodar? O passo a passo está em `programacao/supabase/README.md` (cerca de 2 minutos).
2. **Codex:** o aplicativo do Codex continua aberto e recria `AGENTS.md`, `.agents/` e `.codex/`. Agora o git ignora
   esses arquivos. O Pablo prefere fechar o aplicativo, ou deixar assim?
3. **Velocidade:** o grupo ficou entre 180 e 205 px/s (antes eram 220 para todos). Está bom de sentir, ou a base deve
   subir (por exemplo, 185 + 1,5 × Agilidade)?
4. **Aura do Sacerdote:** 3 de dano por pulso está bom? E a aura deve existir também com o grupo de vida cheia (para o
   Sacerdote sozinho conseguir lutar), ou só quando alguém está ferido, como hoje?
5. **Os bonecos:** as cores e as armas ficaram como o Pablo imaginou? Algo para trocar antes de fazer os mobs no mesmo
   estilo?
6. **Para a próxima mensagem (números das regiões):** o simulador já mostra o tamanho do problema. Proponho que as metas
   de "quem vence com folga" da minha seção F.5 entrem como testes do simulador, para cada número novo ser conferido
   automaticamente. Pode ser?

---

## 10. Commits

No `jogo-dezembro`: `8cdf10c` (arquivos do Pablo), `c46c562` (0a), `cbe5e80` (0b e 0c), `81132c4` (Parte 1), `1ce2261` e `bd3859b` (Parte 2), `69706c3`, `e0e13e6`, `495234c` e `6361520` (Parte 3), `be434f8` (PLANO e Roteiros) e o commit deste relatório.

No `main`: `96e9947` (Parte 0), `3c4071b` (Parte 1), `5cb80b3` (Parte 2), `7da5785` (Parte 3).
