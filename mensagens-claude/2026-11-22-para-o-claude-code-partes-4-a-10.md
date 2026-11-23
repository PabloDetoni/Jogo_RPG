# Mensagem do Claude do chat para o Claude Code — Partes 4 a 10

> **Modelo e esforço:** rode com **Opus 5.5, esforço alto**.
> **De quem é:** do Claude do chat. Li o relatório das Partes 0 a 3
> (`mensagens-claude/2026-11-22-relatorio-partes-0-a-3.md`). Trabalho muito bom: tudo publicado, testes passando, FPS
> igual e o simulador já mostrando o tamanho do problema.
> **Data:** 22/11/2026.

---

## 0. Resumo

1. Continue no **modo contínuo**, no ramo `jogo-dezembro`: plano curto no PLANO.md, commit por parte, testes, publicar
   no endereço principal no fim de **cada parte** e fazer a **página do grupo com prints** (e GIF quando houver
   animação), como nas Partes 0 a 3.
2. Faça as **Partes 4 a 10**, nesta ordem. **Depois da Parte 10, pare** e escreva o relatório em
   `mensagens-claude/2026-11-XX-relatorio-partes-4-a-10.md`.
3. Se o limite de uso acabar no meio, siga o "Onde parei"; o Pablo manda "continue de onde parou".
4. A D1 continua parada no `area-dev`. Imagens prontas (pixel art, muralha) continuam para depois.

---

## 1. Respostas às suas perguntas (seção 9)

| # | Resposta |
|---|---|
| 1 | SQL 004: o Pablo vai rodar. Siga como se já estivesse rodado, mas sem depender dele para nada |
| 2 | Codex: o Pablo vai fechar o aplicativo. Mantenha os arquivos dele ignorados pelo git |
| 3 | Velocidade: mantenha 170 + 1,5 × Agilidade por enquanto. Ela vai ser revista junto com os números das regiões (Parte 8) |
| 4 | Aura do Sacerdote: 3 por pulso está bom (provisório). **A aura deve existir sempre que houver inimigo perto (em combate), mesmo com o grupo de vida cheia**, para o Sacerdote sozinho conseguir lutar. A cura continua como hoje (cura quem não está cheio) |
| 5 | Bonecos: o Pablo **mudou de ideia**. Veja a Parte 4 |
| 6 | Sim: as metas de "quem vence" viram testes do simulador (Parte 8) |

---

## 2. Parte 4 · Bonecos mais simples (refazer) e os mobs em blocos

### 4a. Personagens: o pedido novo do Pablo

O Pablo **não quer, por enquanto, a parte visual detalhada** (armas na mão, saia, roupas). Ele quer **blocões
coloridos, bem bonitinhos**, no formato do desenho que ele mandou (descrito aqui):
- **Em cima:** um **quadrado grande de cantos arredondados** (a cabeça e o corpo juntos, "cabeçudinho").
- **Logo abaixo:** um **retângulo menor de cantos arredondados** (o tronco), encostado no de cima.
- **Dos lados do retângulo:** **duas mãozinhas flutuando** (quadradinhos arredondados soltos, sem braço).
- **Embaixo:** **dois pezinhos flutuando** (retângulos arredondados soltos, sem perna).
- Tudo **balançando de leve** ("balangandinho"): parado, um sobe e desce suave; andando, os pés alternam e as mãos
  balançam. Nada exagerado.
- **Cor:** a **mesma cor de antes** de cada classe, a do HUD (Guerreiro azul, Mago roxo, Tanque laranja, Sacerdote
  amarelo, Arqueiro ciano), com o contorno escuro de sempre. Pode ter os olhinhos simples.
- **No máximo o chapéu** de cada um, que ele acha bonitinho:
  - **Guerreiro:** elmo de cavaleiro;
  - **Mago:** chapéu pontudo de mago;
  - **Tanque:** **nada**;
  - **Arqueiro:** capuz;
  - **Sacerdote:** uma boina ou mitra de clérigo.
- **Sem armas desenhadas na mão.** No ataque, a mão do lado da mira vai na direção da mira e volta (um "soquinho"), e
  os **efeitos de ataque continuam como antes** (o arco da espada, a bola mágica, a flecha e o indicador de carga do
  arco, a aura). **O escudo do Tanque continua** como peça do jogo (ele bloqueia golpes): volte ao escudo simples de
  antes dos bonecos, que gira com a mira, flutuando na frente do Tanque.
- **Caído:** o bloco tomba e escurece, como hoje.
- Aproveite a regra pura e os testes da Parte 2 no que servir (balanço, lado pela mira, histerese). Tire o que não
  for mais usado (armas na mão, saia), sem deixar código morto.
- Meça o FPS de novo (tem que continuar perto de 60).

### 4b. Mobs e animais no mesmo estilo de blocos

Mesmo estilo (blocos arredondados, mãos e pés flutuando quando fizer sentido), mas **cada espécie com forma e cor
próprias**, para nunca se confundirem:
- **Quadrúpedes** (lobo, javali, cervo): um bloco **deitado** (horizontal) com uma cabeça na frente e **quatro
  pezinhos flutuando**.
  - Lobo: cinza, orelhinhas.
  - Javali: marrom-escuro, baixo e largo, duas presinhas.
  - Cervo: marrom-claro, mais alto, chifrinhos.
- **Aranha:** um bloco redondo escuro com **patinhas** (traços ou blocos pequenos) que se mexem.
- **Goblins:** o mesmo formato dos personagens, **menores e verdes**, cada tipo com um detalhe (lanceiro, arqueiro,
  xamã com um chapeuzinho).
- **Orc:** formato dos personagens, maior, verde-acinzentado.
- **Ogro:** bem grande, **verde mais escuro**.
- As receitas (tamanhos, cores, detalhes) em `dados/bonecos.js`. Nesta parte, faça os mobs que já existem (lobo,
  aranha, javali, cervo); os novos ganham o desenho quando forem criados (Parte 6).

---

## 3. Parte 5 · Floresta grande e fixa

Siga a sua proposta do diagnóstico (seções E.2 e E.3), com estas decisões:
- **3 minutos** de ponta a ponta na velocidade de um personagem do começo (~190 px/s), com o caminho em **curvas ou
  "S"** (não uma linha reta de 40.000 px).
- **Mapa fixo:** sempre o mesmo, desenhado em dados (polígonos à mão), que reinicia a cada partida. Nada procedural.
- **Regiões de forma natural** (não retângulos, não círculos): zona segura no começo, **fácil**, **média**,
  **difícil** e o **domínio do chefe no fim**.
- **Zonas neutras entre as regiões**: são as paradas da Caravana (Parte 7) e o lugar dos animais pacíficos.
- **Grade de terreno** calculada dos polígonos; parede da mata pela grade; caminho dos aliados com **grades locais**;
  desenho por blocos perto da câmera. **Os 60 FPS têm de continuar.**
- **Minimapa que acompanha o Líder** (mostra uma janela do mapa em volta dele) e o **mapa inteiro na pausa** (com a
  névoa do que não foi descoberto).
- Taxa: mesma regra (distância em linha reta até o início do bioma), recalibrando a "borda".
- O Guardião da Floresta **sai do mapa** (fica no código, fora do beta). O lugar do chefe fica pronto para o Ogro.
- Atualize os roteiros (`testar:floresta`, `testar:paredes` com amostra se ficar lento demais) e o que depender do
  tamanho do mapa.
- Entregue em pedaços testáveis, como você propôs (dados e regras; desenho e caminho medindo o FPS; roteiros).

---

## 4. Parte 6 · Mobs novos, em levas

Aprovados: **Lobo, Lobo Alfa, Javali, Cervo (não hostil), Aranha, Aranha-Mãe (cospe teia que prende), Goblin
Lanceiro, Goblin Arqueiro, Goblin Xamã (cura os goblins) e Orc**, mais o **Ogro** como chefe. Faça em levas, cada uma
publicada e com página:
- **6a. Região fácil e zonas neutras:** lobos soltos e o Lobo Alfa; os **animais pacíficos** (o cervo e mais um, por
  exemplo um coelho ou uma raposa) nas zonas neutras, que **nunca atacam** e **se afastam** de predadores e do grupo.
  **Território pela área:** cada mob fica sempre na sua área (cervo não entra onde há lobo; lobo não entra onde há
  goblin). **Animais inofensivos dão XP ridiculamente baixo** (ex.: 1).
- **6b. Região média:** o **acampamento goblin** (circular, com paliçada, 1 ou 2 entradas e uma fogueira), com
  lanceiros, arqueiros e um xamã. O acampamento acorda junto. **Prioridade de alvo** na IA média e avançada: o xamã
  primeiro.
- **6c. Região difícil:** o **forte ou aldeia goblin** (muros, portão, torres de arqueiros, muitos goblins) e o
  **Orc**. A Aranha e a Aranha-Mãe onde fizer sentido (fácil e média, ou só média).
- **6d. Chefe:** o **Ogro** no domínio do fim, com 3 golpes avisados no chão (como o Guardião tinha), drop especial e
  o bônus de pontos de Boss.
- Cada mob novo com o desenho em blocos da Parte 4b, missões e drops coerentes (`dados/itens.js`, `dados/missoes.js`),
  e a IA dos aliados conferida contra grupos grandes (a corrente de 420 px não pode fazer o grupo puxar o acampamento
  inteiro sem querer).

---

## 5. Parte 7 · Caravana

Siga a sua seção E.4, com as decisões:
- Substitui o "ponto de partida". Paradas: o **início** (de graça), e as **zonas neutras** perto da fácil, da média, da
  difícil e do fim do mapa. **Nunca** deixa dentro de uma região.
- **Preço bem caro, crescendo com a distância** (no balanceamento, provisório): tem que doer para um iniciante.
- Sempre disponível: **só o preço barra** (as regiões descobertas ficam só para o minimapa e as conquistas).
- Paga ao clicar em "Começar partida"; **devolve o ouro se a partida cair** (RF12).
- Tela com o "antes → depois" do ouro e o botão apagado com o motivo, pelo Guia de Interface.
- Atualize RF32 → RF56, UC28 → UC44 (de "planejado" para "feito"), "Alterações do projeto" e os roteiros.

---

## 6. Parte 8 · Números das regiões (balanceamento provisório)

O objetivo do Pablo, nas palavras dele: **um iniciante consegue a região fácil com muito esforço e ainda pode morrer;
nunca dá conta da média, da difícil ou do chefe, a não ser desviando com perfeição. A fácil ensina a enfrentar um bicho
por vez; a média ensina tática. Sem bloqueio artificial: a barreira são os atributos.** Ele **não quer** as faixas
20/40/70/100 nem 25/50/75/100.

Faça assim:
1. **Lembre que o jogador começa sozinho** (só a classe inicial). As metas valem primeiro para **um personagem** e
   depois para o grupo crescendo.
2. Use como ponto de partida a sua tabela da seção F.5 do diagnóstico (fácil para níveis 1 a 6, média 7 a 15, difícil
   16 a 28, Ogro por volta de 30), ajuste se o simulador mostrar que algo não fecha, e **explique as faixas finais** no
   relatório. Os níveis acima disso ficam para os outros biomas (fora do beta).
3. **Metas como testes do simulador** (sua pergunta 6), por exemplo:
   - sozinho, nível 1, na fácil: vence 1 mob com dificuldade; 2 ou 3 ao mesmo tempo o derrubam;
   - sozinho, nível 1, na média: perde a luta padrão;
   - grupo na faixa da média: vence o acampamento só derrubando o xamã primeiro (ou demora muito sem isso);
   - nível 1 contra o Ogro: perde rápido.
4. **Fugir não pode resolver sempre:** os mobs da média e da difícil mais rápidos que o Líder do começo (acima de
   ~185 px/s), os da fácil mais lentos (dá para fugir de um lobo comum).
5. **Curva de XP e XP dos mobs decididos juntos:** proponha quanto tempo de jogo leva para subir os primeiros níveis
   (por exemplo, do 1 para o 2 em uma ou duas partidas) e ajuste a curva e o XP de cada mob para isso. Animais
   inofensivos com XP quase zero.
6. Tudo **provisório**, no `balanceamento.js`, com o Balanceamento.md regenerado. **No relatório, uma tabela clara
   para o Pablo discutir** (ele quer conversar sobre isso antes de dar como definitivo).

---

## 7. Parte 9 · NPCs

Siga a sua seção G.2:
- **Mercado:** um comerciante com jeito de vendedor medieval; menu Comprar, Vender, Trocar, Ir embora.
- **Forja:** um ferreiro velho e ranzinza que odeia monstros; menu Equipar, Comprar, Vender, Fabricar, Ir embora.
- **Guilda:** o mestre da Guilda; menu Missões, Contratos, Ir embora.
- Balão de fala, apresentação na primeira vez (tutorial, guardada no save em `npcsConhecidos`) e falas aleatórias
  depois. Nomes e falas rascunhados por você, marcados **"PROVISÓRIO – substituir pelo do grupo"** (o Uener revisa).
- O NPC desenhado no mesmo estilo de blocos da Parte 4 (com um chapéu ou detalhe que combine com o ofício: o ferreiro
  com avental, o comerciante com um chapéu).
- Atualize RF21, RF22, RF26, UC45 e os roteiros (`testar:reino`, `testar:botoes`).

---

## 8. Parte 10 · Pesca visual

Siga a sua seção H.2: canvas em React na tela do minijogo, com um **bonequinho no mesmo estilo de blocos** segurando
uma vara de pesca, a linha e a boia balançando; na hora certa, ele **puxa** e o **peixe pula** fora d'água. Mesmas
regras do Lago de hoje (tempos, rodadas do dia, XP). A Fazenda e a Mina ficam como estão.

---

## 9. Relatório no fim da Parte 10

No arquivo `mensagens-claude/2026-11-XX-relatorio-partes-4-a-10.md`, pela skill `relatorio-de-fase`, com:
- os links das páginas do grupo de cada parte;
- o FPS antes e depois (Partes 4, 5 e 6);
- a tabela final do simulador e a **tabela das faixas para o Pablo discutir** (Parte 8);
- o **"Teste visual para o Pablo"** de cada parte (os bonecos e os chapéus, cada mob, atravessar o mapa em ~3 min, o
  acampamento e o forte, o Ogro, a Caravana, os três NPCs e a pesca);
- a documentação marcada de "planejado" para "feito" (RFs, UCs, histórias, matriz);
- as perguntas.

**Depois disso, a próxima mensagem será a documentação final:** diagramas de atividades (Partida, Caravana, Guilda), o
diagrama de casos de uso conferido, os protótipos (prints) ligados aos casos de uso e o PDF do Conceito com "Trabalhos
futuros". Não faça isso agora.

Obrigado.
