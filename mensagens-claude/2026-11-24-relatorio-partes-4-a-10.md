# Relatório do Claude Code — Partes 4 a 10 (mensagem de 22/11)

> **Escrito para:** o Claude do chat e o Pablo.
> **Data:** 24/11/2026 (o trabalho começou em 22/11).
> **Ramo:** `jogo-dezembro`. **No `main` (site):** as Partes 4 a 10 estão publicadas em https://jogo-rpg-six.vercel.app. Os commits estão na seção 10.

---

## 1. Resumo

As sete partes (com a Parte 6 em quatro levas) estão feitas, testadas e publicadas, cada uma com a sua página para o grupo. Os números da Parte 8 são provisórios e estão numa tabela para o Pablo discutir (seção 6). Os 60 FPS continuam no pior cenário da Floresta em todas as partes (seção 5).

| Parte | O que é | No `main` | Página do grupo |
|---|---|---|---|
| 4 | bonecos e bichos em blocos | `4967aa8` | https://claude.ai/artifact/9SKPsZKrabRBWjN4WC8X8k |
| 5 | Floresta grande e fixa (caminho em "S", zonas neutras) | `a0782a1` | https://claude.ai/artifact/EdHA9zi6L1RiB8BWUB2vEX |
| 6a | Lobo Alfa e a matilha, animais pacíficos, cada mob na sua área | `716ca76` | https://claude.ai/artifact/1JwCr824cwBWh9c7yKMr9T |
| 6b | acampamentos goblin (lanceiro, arqueiro, xamã) | `2cd915f` | https://claude.ai/artifact/PjdUwBfCeqzhHqWunm3zRp |
| 6c | forte goblin, Orc e Aranha-Mãe | `7f9af5b` | https://claude.ai/artifact/EjibuiCZfeC5Dh5LwzzM3C |
| 6d | o Ogro, chefe da Floresta | `2fe63ba` | https://claude.ai/artifact/2mprrxTXrufgmZ4o1btHN1 |
| 7 | a Caravana | `0f433a6` | https://claude.ai/artifact/TEmeEinEPMKH8pmensPQb1 |
| 8 | números das regiões (provisórios) | `e2fdbe6` | https://claude.ai/artifact/SGoTiJrSPhcaEno4tb8RV2 |
| 9 | os NPCs do Reino | `e38128b` | https://claude.ai/artifact/HBdwBW3iiHxgUqstAeSNxk |
| 10 | a pesca do Lago desenhada | `PARTE10_COMMIT` | PARTE10_PAGINA |

As páginas são privadas: o Pablo compartilha com o Uener e o Lucas pelo botão Share de cada uma.

Os achados que mais importam:
- **Os roteiros deixavam o navegador escondido aberto** desde uma atualização do Edge (o `msedge.exe` passa a tarefa para outro processo e sai). Juntaram umas 20 janelas escondidas, a máquina ficou sem fôlego e as páginas pararam de abrir. Corrigido nos três lugares que fecham o Edge (agora fecham também pelo perfil temporário).
- **Na bateria, o notebook roda o jogo a uns 30 FPS** e as conferências de tempo falham. Todos os roteiros desta rodada foram rodados na tomada.
- **Uma conferência da arena estava impossível desde a Parte 3** ("fuga com F": exigia 220 px em 1,2 s, mas o Mago anda 182 px/s). Agora ela usa a velocidade de verdade do Líder.

---

## 2. Onde o projeto está

| Etapa ou fase | Situação |
|---|---|
| Etapas 1 a 9, Fase 4.5, ajustes de 14/10, visual novo, Reino e Mapa em camadas | ✔ |
| Partes 0 a 3 (mensagem de 20/11) | ✔ publicadas |
| **Partes 4 a 10 (mensagem de 22/11)** | **✔ publicadas (este relatório)** |
| Documentação final (diagramas de atividade, protótipos, PDF do Conceito) | próxima mensagem (não feita agora, como pedido) |
| Pixel art e a muralha | para o final (nada gerado) |
| Fase 5 (testes, protótipos, DOC-006) e Fase 6 (entrega) | depois |
| Área do Desenvolvedor (D1) | continua só no ramo `area-dev`; nunca foi para o `main` |

---

## 3. O que mudou, parte por parte

**Parte 4 · bonecos em blocos.** O desenho vem de `regras/bonecos.js` (formas puras, com teste) e de `dados/bonecos.js` (as receitas), e a partida desenha em `jogo/desenhoEmBlocos.js`:
- quadrado grande de cantos arredondados, tronco menor, mãos e pés flutuando e olhinhos;
- o chapéu de cada classe (elmo, chapéu de mago, nada no Tanque, mitra e capuz);
- o "soquinho" na direção da mira e o escudo simples do Tanque de volta;
- quem caiu tomba e escurece;
- os bichos: o lobo, o javali e o cervo deitados com 4 pés, e a aranha redonda;
- **desempenho:** cada pose é desenhada uma vez numa textura e guardada (a primeira versão redesenhava tudo a cada quadro e caiu para 35 FPS);
- o Sacerdote aliado solta a aura sempre que há inimigo perto, mesmo com o grupo de vida cheia.

**Parte 5 · Floresta grande e fixa.**
- **Mapa:** `dados/mundo/floresta.js`, de 10.400 × 8.000 px, com o caminho em "S" de uns 3 minutos e as zonas em polígono. O terreno vira uma grade de 80 px (`regras/terreno.js`) e a mata sai dessa grade.
- **Zonas:** a zona segura, a Fácil, a Média, a Difícil e o domínio do chefe, com 4 zonas neutras entre elas.
- **Caminho dos aliados:** grades locais por busca (`jogo/navegador.js`).
- **Minimapa:** uma janela em volta do Líder e o mapa inteiro na pausa.
- **Névoa:** a do mapa antigo é descartada, e as áreas descobertas ficam.
- **Guardião:** saiu do mapa.

**Parte 6 · mobs novos.**
- **6a, Fácil e zonas neutras:**
  - o território é a área: o mob nunca sai da zona onde nasceu e só persegue quem está nela (`Inimigo.andar`, `passoNaArea`);
  - o bando acorda junto;
  - o Lobo Alfa nasce com 2 lobos em volta;
  - o cervo e o coelho são pacíficos (`AnimalPacifico`): nunca atacam, fogem e dão XP 1.
- **6b, acampamentos goblin na Média (`regras/acampamento.js`):**
  - uma paliçada de troncos com 1 ou 2 entradas e uma fogueira;
  - o lanceiro, o arqueiro e o xamã, que cura o goblin mais ferido;
  - o acampamento acorda junto e é o território dos goblins;
  - os aliados não começam briga com o acampamento dormindo e, na IA média e avançada, miram o xamã primeiro.
- **6c, forte, Orc e Aranha-Mãe:**
  - o forte goblin na Difícil tem muros de pedra, portões a oeste e a leste e uma torre em cada canto, com um arqueiro parado que atira 30% mais longe;
  - dentro, os goblins e o Orc; mais 2 Orcs soltos na Difícil;
  - a Aranha-Mãe atira uma teia que prende por 1,3 s (o Líder não anda nem esquiva).
- **6d, o Ogro (`jogo/entidades/Ogro.js`, sobre o Guardião):**
  - três golpes avisados no chão: a pancada em volta dele, a investida em faixa e o arremesso de pedra na marca onde o alvo está;
  - bônus de 600, o couro e o Cinto do Ogro (especial);
  - a missão e a conquista do chefe passam a valer para ele.

**Parte 7 · Caravana (`regras/caravana.js`).**
- A tela do Ponto de partida virou a Caravana, que aparece sempre.
- O início é de graça; as 4 zonas neutras custam de 70 a 675 de ouro, pela distância andada pelo caminho.
- Cada parada mostra o ouro antes → depois, e o botão apagado diz quanto falta.
- O preço sai do ouro no fim da partida, e o Resumo mostra a linha "Caravana". Se a partida cair, nada é cobrado.

**Parte 8 · números das regiões.**
- `fichaDoMob` aplica a força (vida e ouro), o dano, o XP e a velocidade de cada região.
- O simulador ganhou o Ogro, os acampamentos e o forte, a cura do xamã e a prioridade de alvo.
- As metas do Pablo viraram 13 testes (`regras/metasDoBalanceamento.test.js`).
- A tabela está na seção 6.

**Parte 9 · NPCs (`dados/npcs.js`, `telas/reino/ComNpc.jsx`).**
- Bartolomeu (comerciante), Gunnar (ferreiro) e a Mestra Isolda (Guilda), desenhados em blocos com o detalhe do ofício.
- Na primeira visita, a apresentação em 3 partes; depois, uma fala sorteada.
- O menu abre a tela na aba certa; "Falar com ..." volta à conversa.
- O NPC conhecido fica no save (`npcsConhecidos`, campo novo pelo `normalizarProgresso`, sem formato novo).

**Parte 10 · pesca visual (`telas/partida/CenaDaPesca.jsx`).**
- Um canvas com o Líder em blocos, a vara, a linha e a boia.
- O "!" quando afunda; no puxão certo, a vara sobe e o peixe pula.
- Regras iguais às de antes.

---

## 4. Testes rodados

| Teste | Resultado no fim da Parte 10 |
|---|---|
| Unitários (Vitest) | 1.031 passando (eram 974 no fim da Parte 3; 57 novos, incluindo as 13 metas) |
| Lint e build | ok |
| Floresta (TEST-005) | PARTE10_FLORESTA (eram 77 conferências no fim da Parte 3) |
| Arena | PARTE10_ARENA |
| Reino (TEST-006) | PARTE10_REINO |
| Camadas, botões, paredes, arte | PARTE10_OUTROS |
| Site (`conferir:configuracao`, contas no site) | tudo certo e 54/54 em cada parte (a da Parte 10 na seção 10) |

O que falhou no caminho e foi resolvido (detalhes em `testes/Registro.md`):
- **Roteiros que ainda esperavam o jogo antigo**, ajustados em cada parte:
  - o Guardião no lugar do chefe;
  - a missão pelo nome antigo;
  - a Floresta indo direto para a Preparação;
  - a loja sem o NPC;
  - a pancada do Ogro derrubando o Arqueiro de teste.
- **Uma falha de verdade no jogo, achada pelo roteiro:** um mob empurrado para fora da área seguia o grupo para longe. Agora ele volta para casa.
- **Conferências de tempo que oscilam:**
  - a mira com a câmera andando (erra por 0,008 de ângulo de vez em quando);
  - "um aliado mira o xamã" (a janela de observação subiu de 3 para 6 s);
  - a da fuga, que estava impossível (seção 1).

---

## 5. FPS no pior cenário da Floresta (grupo de 5 e todos os mobs da Difícil, 2 minutos)

| Momento | Média | Mínimo | 5% piores |
|---|---|---|---|
| Antes da Parte 4 (fim da Parte 3) | 56 a 60 | 55 | — |
| Parte 4, primeira versão (redesenho a cada quadro) | **35** | — | — |
| Parte 4, com as poses guardadas em textura | 60 | 49 | — |
| Parte 5 (mapa grande) | 60 | 48 | 56 |
| Parte 6a | 60 | 53 | — |
| Parte 6b | 60 | 49 | — |
| Parte 6c | 60 | 50 | 58 |
| Parte 6d | 60 | 55 | 59 |
| Partes 7, 8 e 9 | 60 | 56 a 57 | 59 a 60 |

(Na bateria, os mesmos roteiros dão uns 30 FPS: é o notebook economizando energia, não o jogo.)

---

## 6. Parte 8: os números para o Pablo discutir

**Faixas (provisórias):** Fácil 1 a 6 (o jogador começa sozinho), Média 7 a 15, Difícil 16 a 28, o Ogro por volta do 30. Os níveis acima ficam para os outros biomas.

**Velocidade:**
- Os bichos hostis da Fácil andam no máximo a 165 px/s; o Líder do começo anda de 181 a 203, então dá para fugir de um lobo.
- Os da Média andam no mínimo a 205 e os da Difícil a 220: fugir não resolve sempre.

**O simulador** (modelo simples: todos parados e ao alcance de todos, sem desviar nem recuar; por isso as metas de "sozinho" usam o Guerreiro e o Tanque):

| Região (faixa) | Quem | Contra | Resultado no simulador |
|---|---|---|---|
| Fácil (1 a 6) | Guerreiro sozinho, nível 1 | 1 lobo | vence em 3 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 1 | 2 lobos | perde em 2 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 1 | Lobo Alfa | perde em 5 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 3 | 1 lobo | vence em 3 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 3 | 2 lobos | vence em 3 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 3 | Lobo Alfa | perde em 7 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 6 | 1 lobo | vence em 3 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 6 | 2 lobos | vence em 3 s |
| Fácil (1 a 6) | Guerreiro sozinho, nível 6 | Lobo Alfa | vence em 7 s |
| Fácil (1 a 6) | Tanque sozinho, nível 1 | 1 lobo | vence em 14 s |
| Média (7 a 15) | Guerreiro sozinho, nível 1 | 3 mobs da Média | perde em 2 s |
| Média (7 a 15) | Guerreiro sozinho, nível 7 | 3 mobs da Média | perde em 4 s |
| Média (7 a 15) | grupo de 4, nível 3 | acampamento (6), xamã primeiro | perde em 14 s |
| Média (7 a 15) | grupo de 4, nível 3 | acampamento (6), sem prioridade | perde em 15 s |
| Média (7 a 15) | grupo de 4, nível 7 | acampamento (6), xamã primeiro | vence em 16 s (1 caem) |
| Média (7 a 15) | grupo de 4, nível 7 | acampamento (6), sem prioridade | perde em 24 s |
| Média (7 a 15) | grupo de 4, nível 11 | acampamento (6), xamã primeiro | vence em 13 s |
| Média (7 a 15) | grupo de 4, nível 11 | acampamento (6), sem prioridade | vence em 14 s |
| Média (7 a 15) | grupo de 4, nível 15 | acampamento (6), xamã primeiro | vence em 11 s |
| Média (7 a 15) | grupo de 4, nível 15 | acampamento (6), sem prioridade | vence em 13 s |
| Difícil (16 a 28) | grupo de 5, nível 11 | 3 mobs da Difícil | perde em 38 s |
| Difícil (16 a 28) | grupo de 5, nível 16 | 3 mobs da Difícil | vence em 17 s (1 caem) |
| Difícil (16 a 28) | grupo de 5, nível 22 | 3 mobs da Difícil | vence em 14 s |
| Difícil (16 a 28) | grupo de 5, nível 28 | 3 mobs da Difícil | vence em 12 s |
| Difícil (16 a 28) | grupo de 5, nível 16 | uma leva de 5 do forte | perde em 9 s |
| Difícil (16 a 28) | grupo de 5, nível 22 | uma leva de 5 do forte | perde em 21 s |
| Difícil (16 a 28) | grupo de 5, nível 28 | uma leva de 5 do forte | vence em 17 s (1 caem) |
| Ogro (~30) | Guerreiro sozinho, nível 1 | o Ogro | perde em 2 s |
| Ogro (~30) | grupo de 5, nível 22 | o Ogro | perde em 40 s |
| Ogro (~30) | grupo de 5, nível 26 | o Ogro | perde em 53 s |
| Ogro (~30) | grupo de 5, nível 30 | o Ogro | vence em 55 s (3 caem) |

**Os monstros em cada região** (a região multiplica a vida e o ouro por 2,2 e 5,5, o dano por 1,2 e 2,6 e o XP por 7,7 e 22):

| Mob | Fácil | Média | Difícil |
|---|---|---|---|
| lobo | 185 vida · 30 dano · 25 XP · 150 px/s | 407 vida · 36 dano · 193 XP · 205 px/s | 1018 vida · 78 dano · 550 XP · 220 px/s |
| loboAlfa | 520 vida · 34 dano · 45 XP · 150 px/s | 1144 vida · 41 dano · 347 XP · 205 px/s | 2860 vida · 88 dano · 990 XP · 220 px/s |
| aranha | 130 vida · 18 dano · 22 XP · 105 px/s | 286 vida · 22 dano · 169 XP · 205 px/s | 715 vida · 47 dano · 484 XP · 220 px/s |
| javali | 380 vida · 40 dano · 35 XP · 125 px/s | 836 vida · 48 dano · 270 XP · 205 px/s | 2090 vida · 104 dano · 770 XP · 220 px/s |
| aranhaMae | 450 vida · 26 dano · 60 XP · 110 px/s | 990 vida · 31 dano · 462 XP · 205 px/s | 2475 vida · 68 dano · 1320 XP · 220 px/s |
| goblinLanceiro | 280 vida · 24 dano · 26 XP · 165 px/s | 616 vida · 29 dano · 200 XP · 205 px/s | 1540 vida · 62 dano · 572 XP · 220 px/s |
| goblinArqueiro | 200 vida · 20 dano · 24 XP · 150 px/s | 440 vida · 24 dano · 185 XP · 205 px/s | 1100 vida · 52 dano · 528 XP · 220 px/s |
| goblinXama | 240 vida · 14 dano · 40 XP · 140 px/s | 528 vida · 17 dano · 308 XP · 205 px/s | 1320 vida · 36 dano · 880 XP · 220 px/s |
| orc | 600 vida · 45 dano · 90 XP · 150 px/s | 1320 vida · 54 dano · 693 XP · 205 px/s | 3300 vida · 117 dano · 1980 XP · 220 px/s |

Líder do começo (nível 1): Guerreiro 190, Mago 182, Tanque 181, Sacerdote 181, Arqueiro 203 px/s

**O Ogro:** 14.000 de vida, golpes de 90 (pancada em área), 110 (investida) e 70 (pedra), 6.000 de XP. O xamã cura 100 × a força da região a cada 2,2 s.

**XP:** a curva continua 100 × o nível; o lobo da Fácil dá 25 (do 1 para o 2 em uma partida, uns 4 lobos). Conta de cabeça, sem o XP de exploração e de missões:
- **Fácil (1 → 7):** sozinho, uns 7 mobs por partida: cerca de 12 partidas.
- **Média (7 → 15):** grupo de 3 (o XP é dividido), um acampamento e uns 6 mobs por partida: cerca de 9 partidas.
- **Difícil (15 → 28):** grupo de 5, uns 12 mobs por partida: cerca de 16 partidas, mais o Ogro.

| Nível | XP para o próximo | XP desde o 1 |
|---|---|---|
| 1 | 100 | 0 |
| 2 | 200 | 100 |
| 3 | 300 | 300 |
| 5 | 500 | 1000 |
| 7 | 700 | 2100 |
| 10 | 1000 | 4500 |
| 15 | 1500 | 10500 |
| 20 | 2000 | 19000 |
| 25 | 2500 | 30000 |
| 28 | 2800 | 37800 |
| 30 | 3000 | 43500 |

---

## 7. Teste visual para o Pablo (no site, https://jogo-rpg-six.vercel.app)

Comece com **Iniciar jogo → Jogar como convidado** (ou a sua conta). O que está marcado "dev" só aparece no `npm run dev`.

1. **Bonecos e chapéus (Parte 4).**
   - Jogue uma partida com cada classe e repare no chapéu: elmo no Guerreiro, chapéu pontudo no Mago, nada no Tanque, mitra no Sacerdote e capuz no Arqueiro.
   - Ataque: a mãozinha vai na direção da mira. O Tanque tem o escudo.
   - (dev: "Derrubar Líder") quem cai tomba e escurece.
2. **Cada mob.**
   - **Fácil:** o lobo cinza, o Lobo Alfa (maior e mais escuro, com a juba clara) com 2 lobos perto, e a aranha.
   - **Zonas neutras:** o cervo e o coelho fogem de você e nunca atacam.
   - **Média:** o javali, a Aranha-Mãe (roxa, com a marca vermelha; a teia prende por um instante) e os goblins do acampamento.
   - **Difícil:** o forte e o Orc (o grande, com machado e presas).
3. **Atravessar o mapa em uns 3 minutos (Parte 5).**
   - Saia do Reino e ande pelo caminho em "S" até o domínio do chefe (embaixo à direita), sem lutar (dev: "Invencível").
   - O minimapa acompanha o Líder; com Esc (pausa), aparece o mapa inteiro com a névoa.
4. **O acampamento e o forte (Partes 6b e 6c).**
   - Na Média, ache o círculo de troncos com a fogueira. Passe por fora, longe: ninguém acorda. Entre pela abertura: todos vêm juntos.
   - O xamã (cocar de penas) cura os outros (partículas verdes); com a IA média, os aliados vão nele primeiro.
   - Na Difícil, perto do fim, o forte de pedra: chegando no portão, ele acorda inteiro e os arqueiros das torres atiram de longe sem sair do lugar.
5. **O Ogro (Parte 6d).**
   - No domínio do fim, a barra "Ogro" aparece no alto.
   - Fique perto (círculo em volta dele), a média distância (faixa reta) e longe (um círculo embaixo de você): saia das marcas a tempo.
   - (dev: "Drop especial do Boss: 100%") derrotado: "+600 pontos", o couro e o Cinto do Ogro.
6. **A Caravana (Parte 7).**
   - Jogar → Floresta: aparece a Caravana, com o Início de graça e 4 paradas de 70 a 675 de ouro; as que custam mais que o seu ouro ficam apagadas com "Falta N de ouro".
   - Com ouro (dev: painel `</> DEV`, "Itens de teste, +1000 de ouro"), escolha o Vau do Riacho: a Preparação mostra "Caravana: 265 de ouro".
   - Na partida, o grupo nasce na zona neutra; volte com Q e o Resumo mostra "Caravana −265 de ouro".
   - Feche a aba no meio de uma partida paga: ao voltar, o ouro é o mesmo de antes.
7. **Os três NPCs (Parte 9).**
   - Com um convidado novo, entre no Mercado (Bartolomeu, chapéu de aba e bigode), na Forja (Gunnar, barba e avental) e na Guilda (Mestra Isolda, chapéu com pena).
   - Na primeira vez, a apresentação em 3 partes ("Continuar"); nas outras, uma fala curta.
   - O menu abre a tela na aba certa; "Falar com ..." volta.
8. **A pesca (Parte 10).**
   - Jogar → Lago → Começar rodada. O seu Líder pesca na margem.
   - Quando a boia afunda e aparece o "!", clique: a vara sobe e o peixe pula. Clicando cedo, aparece "…".
9. **Os números (Parte 8).** Com um personagem novo, sozinho, na Fácil: um lobo dá trabalho; dois de uma vez derrubam. Vá à Média de nível 1: os bichos são mais rápidos que você.

---

## 8. Documentação de "planejado" para "feito"

- **Requisitos (`08_Requisitos.md`):**
  - RF31 (Floresta grande) e RF39 (o Ogro);
  - RF56 (Caravana), com o RF32 marcado como substituído;
  - RF57 (NPCs), com RF21, RF22 e RF26 (o Mercado, a Forja e a Guilda começam pelo NPC);
  - RF58 (animais pacíficos), RF59 (cada mob na sua área), RF60 (acampamento e forte) e RF54 (pesca visual).
  - Cada parte tem a sua linha em "Alterações do projeto".
- **Casos de uso (`06_Descricao_dos_Casos_de_Uso.md`):**
  - UC44 (Caravana), com o UC28 substituído;
  - UC45 (NPC), com UC16, UC17 e UC21;
  - UC31 (mapa maior, pacíficos) e UC43 (pesca).
- **Matriz e histórias:** UC44 e UC45 sem "planejado"; HU44 e HU45 "feito".
- **Outros:** `Arquitetura_do_Codigo.md` (uma linha por parte); `Balanceamento.md` regenerado (a ficha de cada mob na Fácil, na Média e na Difícil, a velocidade, a Caravana e o Ogro).
- **Roteiros manuais (`testes/Roteiros.md`):** FL-04 (Caravana), FL-06 a FL-06d (pacíficos, matilha, acampamento, forte e teia), FL-09 (Ogro), NPC-01 e NPC-02 (NPCs) e PE-01 (pesca).
- **Ainda "planejado"** (não era desta mensagem): a Área do Desenvolvedor (D1) e o que depende da arte.

---

## 9. Decisões que tomei por conta própria

1. **Caravana:** o preço é conferido no "Começar partida", mas só sai do ouro **no fim** (como os itens levados da Mochila do Reino). Assim, "devolver se a partida cair" vale também no save do banco, em outro computador, sem nenhum caso especial. Para o jogador, o efeito é o mesmo.
2. **Lugares fixos:** os acampamentos ficam onde cabe um círculo inteiro dentro da Média; o forte ficou no único lugar da Difícil onde cabe (perto do fim do caminho, em (6.420, 6.833)).
3. **Território e bando:**
   - mob empurrado para fora da área volta para casa;
   - provocado (apanhou ou o bando chamou), ele só desiste a mais de 1.100 px;
   - o acampamento e o forte acordam inteiros, mesmo longe.
4. **Missão e conquista do chefe:** mantive o id da missão "oGuardiao" (saves antigos) e ela agora pede o Ogro. Quem já tinha aceitado com o Guardião termina derrotando o Ogro.
5. **A Coroa de raízes** era o especial do Guardião e não aparece no beta agora. No catálogo, ela diz "fora do beta". A casca antiga continua saindo pela troca no Mercado.
6. **Simulador:** do Ogro, só a pancada pega todo mundo; a investida e a pedra pegam um só. O forte é medido em levas de 5, porque os 14 juntos derrubam qualquer grupo no modelo.
7. **Parte 8:** separei o multiplicador do dano do da vida (senão a Média derrubava o grupo de uma vez); a curva de XP ficou igual e mudei o XP dos mobs.
8. **NPCs:** o menu fica sempre visível (não é preciso ler a apresentação toda). A dica da primeira visita continua, porque um teste exige uma dica em toda tela. Chamei a mestra da Guilda de "Mestra Isolda" (a mensagem dizia "mestre"; é fácil trocar em `dados/npcs.js`).

---

## 10. Pendências, riscos, próximo passo e commits

**Com o Pablo:**
- discutir a tabela da seção 6 com o grupo;
- compartilhar as páginas;
- testar no site (seção 7);
- rodar o SQL 004, se ainda não rodou;
- deixar o notebook na tomada quando eu rodar os roteiros.

**Com o grupo:** o Uener revisa os nomes e as falas dos NPCs (`dados/npcs.js`, marcados PROVISÓRIO).

**Riscos:**
- o simulador não desvia nem recua: o Mago, o Arqueiro e o Sacerdote do começo dependem disso na Fácil;
- o dano das classes é bem diferente (pergunta 3);
- teletransportar para longe faz o HUD demorar um instante para trocar (só no dev);
- algumas conferências de tempo oscilam (seção 4).

**Próximo passo:** **parei aqui**, como pedido. A próxima mensagem é a da documentação final (diagramas de atividade, protótipos, PDF do Conceito).

**Commits no `main`:**
`4967aa8` (Parte 4), `a0782a1` (5), `716ca76` (6a), `2cd915f` (6b), `7f9af5b` (6c), `2fe63ba` (6d), `0f433a6` (7), `e2fdbe6` (8), `e38128b` (9), `PARTE10_COMMIT` (10).

---

## 11. Perguntas para o Pablo e o grupo

1. **As faixas e o ritmo** (Fácil 1–6 em umas 12 partidas, Média 7–15 em 9, Difícil 15–28 em 16, o Ogro no 30) estão bons?
2. **A Caravana** (70 a 675 de ouro) está cara o bastante? Com os números novos, um grupo na Média ganha bem mais ouro por partida.
3. **As classes:** no nível 1, o Guerreiro dá uns 66 de dano por segundo, o Arqueiro 27, o Mago 21 (em 3 alvos), o Tanque 14 e o Sacerdote 6. Querem equilibrar isso numa próxima rodada?
4. **O forte acorda inteiro** (14 goblins). Está difícil demais, ou é isso mesmo (a última prova antes do Ogro)?
5. **A Coroa de raízes:** dar ao Ogro como segundo especial, ou deixar só para o Guardião (fora do beta)?
6. **NPCs:** os nomes (Bartolomeu, Gunnar, Mestra Isolda) e o tom servem? Manter a dica da primeira visita junto com a apresentação, ou tirar a dica dessas três telas?
