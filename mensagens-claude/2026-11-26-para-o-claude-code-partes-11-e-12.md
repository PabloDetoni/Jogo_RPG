# Mensagem do Claude do chat para o Claude Code — Partes 11 e 12

> **Modelo e esforço:** rode com **Opus 5.5, esforço alto**.
> **De quem é:** do Claude do chat. Li o relatório das Partes 4 a 10
> (`mensagens-claude/2026-11-24-relatorio-partes-4-a-10.md`). Excelente: as 10 partes no site, 1.031 testes, 60 FPS na
> Floresta grande e a tabela da Parte 8 muito clara.
> **Data:** 26/11/2026.

---

## 0. Resumo

1. Continue no **modo contínuo**, no ramo `jogo-dezembro`, com publicação e **página do grupo com prints** no fim de
   cada parte.
2. **Parte 11:** os ajustes de balanceamento que o Pablo decidiu (respostas às suas perguntas da seção 11). **Parte 11b:** a Fazenda e a Mina desenhadas, como a pesca.
3. **Parte 12:** a **documentação final** para a entrega da disciplina.
4. Depois da Parte 12, **pare** e escreva o relatório em `mensagens-claude/2026-11-XX-relatorio-partes-11-e-12.md`.
5. A D1 continua parada no `area-dev`. Imagens prontas (pixel art, muralha) continuam para depois.

---

## 1. Respostas do Pablo às suas perguntas (seção 11)

| # | Decisão |
|---|---|
| 1 | **Faixas e ritmo aprovados** (Fácil 1–6 em ~12 partidas, Média 7–15 em ~9, Difícil 15–28 em ~16, Ogro no 30). Continuam provisórios para ajustar depois de jogar |
| 2 | **Caravana: cada parada custa perto do ouro de uma partida inteira naquela região**, para doer de verdade. Calcule o ouro típico por partida em cada região (pelo simulador e pelos números de hoje) e ponha o preço de cada parada perto disso |
| 3 | **Equilibrar as classes pelo Conceito**, no nível 1: Guerreiro e Arqueiro perto de **55** de dano por segundo (o Arqueiro com o crítico mais alto e alvo único); Mago perto de **28 por alvo, em área**; Tanque perto de **15**; Sacerdote perto de **8** |
| 4 | **O forte acorda por partes:** portão, pátio e torre (3 levas), cada uma acordando quando o grupo chega perto dela, para a tática contar |
| 5 | **Coroa de raízes:** fica para o Guardião (fora do beta). O **Ogro ganha um drop especial próprio** (raro, por exemplo uma clava ou um cinto do Ogro; você escolhe e marca PROVISÓRIO) |
| 6 | **NPCs:** os nomes e o tom servem por enquanto (o Uener ainda revisa). **Tire a dica da primeira visita do Mercado, da Forja e da Guilda**, porque a apresentação do NPC já faz esse papel; ajuste o teste que exige uma dica em toda tela para aceitar a apresentação do NPC no lugar |

---

## 2. Parte 11 · Ajustes de balanceamento

1. **Caravana** com os preços novos (decisão 2). Mostre na tela, como hoje, o "antes → depois" do ouro.
2. **Classes** equilibradas (decisão 3), mexendo no dano base e nos tempos de cada ataque de clique, sem mudar a regra
   dos atributos. O Arqueiro continua com o arco que carrega (o número vale para a carga cheia). Confira com o
   simulador.
3. **Forte por partes** (decisão 4), com as três levas aparecendo no minimapa da pausa como pontos de perigo.
4. **Drop especial do Ogro** (decisão 5), com a chance no balanceamento.
5. **Dica dos NPCs** (decisão 6).
6. **Rode de novo o simulador** com as metas como testes e atualize a tabela. As metas da Parte 8 têm de continuar
   valendo com as classes equilibradas (sozinho na Fácil: vence 1 lobo com dificuldade, perde para 2; e assim por
   diante). Se alguma meta quebrar, ajuste os mobs, não a meta.
7. Regenere o `Balanceamento.md` e registre em "Alterações do projeto".

---

## 2b. Parte 11b · Fazenda e Mina desenhadas (como a pesca)

O Pablo quer os outros dois minijogos no mesmo nível da pesca (Parte 10): canvas em React, o **Líder em blocos** na
cena e as **mesmas regras de hoje** (tempos, rodadas do dia, XP, recursos).
- **Fazenda:** o bonequinho anda até o canteiro maduro e **colhe** (a planta sai do chão com um pulinho); os canteiros
  crescem em etapas visíveis (broto, planta, maduro com brilho) e murcham se passar do tempo.
- **Mina:** o bonequinho com uma **picareta** bate na pedra; cada clique racha a pedra e solta faíscas; no último, a
  pedra quebra e o minério pula para fora.
- Faça antes da Parte 12, para os prints dos protótipos já mostrarem os três minijogos desenhados. Publique com a
  página do grupo, como as outras partes.

## 3. Parte 12 · Documentação final (entrega da disciplina)

O professor avalia **diagramas, protótipos e código**. Tudo tem de bater com o jogo de hoje.

### 12a. Diagramas (PlantUML + PNG, pelo PlantUML desta máquina, mantendo os nomes dos arquivos)
- **Casos de uso (`02_*`):** confira contra o jogo final (UC44 Caravana, UC45 NPCs, UC46 e UC47 dev, os mobs novos, o
  Ogro), com os atores Jogador e Desenvolvedor e a Área do Desenvolvedor no pacote "Extra".
- **Atividades da Partida (`04_*`):** refaça pelo código de hoje: Mapa → Caravana → Preparação → partida (combate,
  coleta com E, mochila com Tab, Q, F, desmaio, ajuda, pausa) → fim (Grande Vitória, Vitória, Retorno forçado, Derrota)
  → resumo.
- **Atividades da Guilda (`05_*`):** com a Mestra Isolda (conversa, menu, missões e contratos).
- **Atividades da Caravana (novo, `06_Diagrama_Atividades_Caravana.puml`):** escolher a parada, conferir o ouro,
  começar, cobrar no fim, devolver se a partida cair.
- **Atividades de Acesso (`03_*`):** confira se ainda bate (foi refeito na Parte 0).
- Use `<<include>>` e `<<extend>>` onde fizer sentido, e mantenha os diagramas legíveis (sem cruzar linhas demais).

### 12b. Protótipos novos (prints do jogo)
- Estenda o `npm run prints` para tirar **todas as telas**, inclusive as que faltavam (Criar conta, Confirme o
  e-mail, Esqueci a senha, Senha nova, Escolher apelido, Configurações, Pausa, Confirmar fuga, Carregando a partida,
  Cutscene da derrota, janela de Ajuda, Caravana, cada NPC conversando, a pesca e a partida com os bonecos e os mobs).
- Em `documentacao/prototipos/`: os prints novos com o caso de uso no nome (ex.: `UC16_mercado_comerciante.png`), os
  antigos numa subpasta `iniciais/` e um **README com a tabela print → caso de uso → requisito**.
- Tire os prints **no tema claro e no escuro** (escuro numa subpasta), em 1366 × 768.

### 12c. Requisitos, histórias e matriz
- Todos os RFs, RNFs, UCs e HUs com o estado real (nada mais "planejado" que já esteja feito; o que ficou para depois,
  marcado "trabalho futuro").
- **Matriz de rastreabilidade** completa: cada RF com o caso de uso, a história, o diagrama de atividades, o protótipo
  (print) e o teste (roteiro ou teste automático) que o cobre.
- `documentacao/README.md` atualizado (lista dos arquivos, o que é cada um, como regerar diagramas, prints, PDF e o
  Balanceamento).
- `Supabase_passo_a_passo.md` com os SQL 002 e 004 (e o 003 marcado como "só para a Área do Desenvolvedor").

### 12d. Conceito
- No `.docx`: a seção **21.10** com as decisões de 18 a 26/11 (bonecos em blocos, Floresta grande, mobs novos,
  Caravana, números das regiões, NPCs, pesca) e uma seção **"Trabalhos futuros"**: multiplayer, versão mobile (só com o
  jogo entre 80 e 90% pronto), os outros biomas, o Guardião da Floresta como chefe avançado, pergaminhos de
  treinamento, XP que diminui com o mesmo mob, a Área do Desenvolvedor (D2 a D5) e a pixel art.
- Confira o §6 (atributos) e o §11 (combate) contra o jogo de hoje e corrija o que não bater.
- **Exporte o PDF pelo Word** (o script que você testou no diagnóstico) e confira o PDF aberto: nenhum título sozinho
  no fim de página, imagens no lugar, número de páginas.

### 12e. Página do grupo da documentação
- Uma página com os diagramas novos (as imagens), alguns protótipos e a matriz resumida, para o Pablo mostrar ao grupo
  e conferir antes da entrega.

---

## 4. Relatório no fim da Parte 12

No arquivo `mensagens-claude/2026-11-XX-relatorio-partes-11-e-12.md`, pela skill `relatorio-de-fase`, com:
- os links das páginas do grupo;
- a tabela nova do simulador e os preços novos da Caravana;
- o dano por segundo de cada classe antes e depois;
- a lista de cada arquivo de `documentacao/` com o que mudou;
- o **"Teste visual para o Pablo"** (o que conferir no jogo e o que abrir na documentação: os PNG dos diagramas, a
  pasta de protótipos e o PDF);
- o que ainda falta para a entrega, se faltar algo;
- as perguntas.

Obrigado.
