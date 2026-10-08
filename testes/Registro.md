# Registro dos testes

Tudo o que já foi testado: os testes automáticos de cada parte (o Claude roda no fim de cada uma), os problemas achados e o que foi feito, e os testes à mão (o Pablo e o grupo marcam aqui). As situações de teste à mão estão em [Roteiros.md](Roteiros.md).

## 1. Cada parte

| Parte | Data | Testes automáticos (`npm test`) | Lint e build | Roteiro do navegador | Teste à mão | Commit |
|---|---|---|---|---|---|---|
| Etapa 4 (regras) | 05/10 | 231 passando | ok | — | — | (com a Fase 0) |
| Fase 0 (base) | 06/10 | 266 passando | ok | — | — | `d938108` |
| 5a (arena, quadrados) | 06/10 | ok | ok | ok | Pablo aprovou (06/10) | `1143420` |
| Ajustes da 5a + 5b (colisão, IA, desmaio, habilidades) | 06/10 | 411 passando | ok | 116 de 116 | Pablo aprovou (07/10) | `e0c8d93` |
| 5b.1 (IA em três níveis, tremor, linha de tiro) | 07/10 | 449 passando (38 novos) | ok | 133 de 133 | Pablo aprovou (07/10) | `55a6025` |
| 5c (pausa, Q, F, fim com números reais, HUD, M) | 07/10 | 513 passando (64 novos) | ok | 202 de 202 | Pablo aprovou (08/10) | `5dcd43f` |
| 5d (Sacerdote sempre curando; um nível da IA não atrapalha o outro) | 08/10 | 530 passando (17 novos) | ok | 215 de 215 | esperando o fim da Fase 1 | local |
| 5e (DOC-003: ataques, esquiva e cores na documentação) | 08/10 | 530 passando | ok | — (só documentação) | esperando o fim da Fase 1 | local |
| 7a (TASK-079: contratos na Guilda) | 08/10 | 539 passando (9 novos) | ok | 222 de 222 | esperando o fim da Fase 1 | local |
| 7b (TASK-071: pentágono, Seleção, Árvores e HUD do Reino) | 08/10 | 544 passando (5 novos) | ok | 226 de 226 | Pablo aprovou a Fase 1 (08/10) | `a3567b7` |
| 5f (cura do Sacerdote sem pausa) | 08/10 | 544 passando | ok | 225 de 226 (a falha foi do teste, corrigida); aura ligada 100% do tempo | na Fase 2 | local |

## 2. Problemas achados na parte 5c e o que foi feito

| O que aconteceu | Onde apareceu | O que foi feito |
|---|---|---|
| O relógio do Phaser continuava correndo na pausa: os 30 s do desmaio e as recargas andavam com o jogo pausado. Vinha das partes 5a e 5b. | Lendo o código para a 5c | A partida ganhou um relógio próprio, que para na pausa e com a aba escondida. O roteiro confere que ele não anda na pausa. |
| 6 testes automáticos falharam depois da mudança no fim da partida. | `npm test` | Esperado: eles usavam o formato antigo (resultado sem números). Foram reescritos com os números reais. |
| O "Foco!" aparecia no HUD mesmo com a IA básica, quando alguém caía; só que o foco só existe na avançada. | Print do roteiro | Agora o "Foco!" e a contagem do foco só valem com algum aliado na IA avançada. |
| O texto "Fuga (F): 21%" do HUD saía partido em pedaços, com espaços sobrando. | Roteiro do navegador (198 de 200) | O texto virou um pedaço só no HUD. |
| O teste da fuga esperava uma taxa e veio outra: durante os 5 s, o Sacerdote ressuscitou o Líder (que andou) e os aliados derrotaram mobs (mais ouro). O jogo seguiu as regras; o teste é que estava mal montado. | Roteiro do navegador (198 de 200) | O teste agora tira os mobs, desliga a ajuda e a Ressurreição antes de derrubar o Líder. |
| O Balanceamento.md mostrava alguns tempos errados: a recarga da Ressurreição com 18 s (é 180 s), a da Provocação com 1 s (é 10 s) e a fragilidade com 1 s (é 10 s). Só o documento estava errado: o jogo usava os valores certos. | Lendo o documento gerado | O gerador do documento foi corrigido. |
| O script que escreve no Conceito (Word) não achava o parágrafo novo no fim do documento. Nada foi salvo nas tentativas que falharam. | Atualizando o Conceito | O script passou a achar o parágrafo pelo número dele. |

Depois das correções: 513 testes automáticos passando, lint e build ok, roteiro do navegador com 202 de 202 (rodado mais de uma vez).

## 2b. Problemas achados na parte 5d e o que foi feito

| O que aconteceu | Onde apareceu | O que foi feito |
|---|---|---|
| O Sacerdote só curava em combate e quem estivesse abaixo de 70%; na IA básica, ficava parado e não ia até quem precisava. | Pablo, jogando a 5c | Regra nova: cura sempre que alguém não está com a vida cheia (caídos, o mais ferido, empate → Líder). |
| Com alguém ferido o tempo todo, a aura ficou ligada só 50% do tempo (3 s ligada, 3 s esperando a recarga de 6 s). | Medição no roteiro do navegador | Proposta de ajuste mandada ao Pablo no fim da Fase 1 (ele pediu para perguntar antes de mudar). |
| O teste do Guerreiro avançado falhou: os outros aliados derrotavam o mob em meio segundo e todo mundo voltava a "seguir" antes da conferência. O jogo estava certo. | Roteiro do navegador (213 de 215) | O mob do teste ganhou muita vida, e a conferência lê o plano assim que ele muda. |

## 2c. Problemas achados na parte 7a e o que foi feito

| O que aconteceu | Onde apareceu | O que foi feito |
|---|---|---|
| Uma rodada do roteiro ficou parada por 6 horas na seção 2 (o computador dormiu no meio). | Roteiro do navegador | Vigia novo: se ficar 4 minutos sem nenhuma conferência, o roteiro para sozinho, avisa e fecha o navegador e o Vite. |
| "IA avançada no canto: ninguém treme" falhou (alguém andou 32 px). A seção anterior deixava gente ferida, e o Sacerdote agora vai curar fora de combate: andar para curar não é tremor. | Roteiro do navegador | O teste enche as vidas antes de medir e diz quem se mexeu. O desvio também ficou mais firme: o lado escolhido para contornar alguém não troca de um quadro para o outro. |
| "Todos caem durante a fuga" não virava Derrota: com o computador lento, o Sacerdote usava a Ressurreição num caído entre um clique e outro. | Roteiro do navegador | O teste desliga a ajuda e põe a Ressurreição em recarga antes de derrubar todo mundo. |

## 2d. Problema achado na parte 7b e o que foi feito

| O que aconteceu | Onde apareceu | O que foi feito |
|---|---|---|
| No canto, com a IA média e a avançada, o Guerreiro e o Arqueiro ficavam rodando (uns 30 px por segundo) sem parar: o desvio da 5d os fazia contornar quem estava parado para chegar à vaga exata, e no canto não havia espaço. | Roteiro do navegador (224 de 226) | Perto do Líder ("seguir"), não há desvio: qualquer ponto da zona confortável serve. O desvio continua para ir lutar, curar ou voltar quando está longe. |

## 2e. Testes que dependiam da velocidade do computador (parte 5f)

| O que aconteceu | O que foi feito |
|---|---|
| Numa rodada, 4 conferências antigas falharam sem nada ter mudado no jogo: dois mobs "encostados" por 0,04 px, um corpo 2 px dentro da pedra no aperto (risco já conhecido, de até cerca de 6 px), um pulo de 127 px contra o limite de 120 e o tremor no canto (IA média). Na rodada seguinte, todas passaram. | O tremor ganhou um relatório completo (plano, parado, voltando, desvio, distância e velocidade de cada aliado) para a próxima vez dizer a causa. As outras ficam de olho: se voltarem, o limite ou o jogo é revisto. |
| A seção 27 esperava 300 de ouro e veio 312: os aliados derrotaram um mob entre a "foto" e o fim. A taxa bateu (4%). | O teste tira os mobs antes. |

## 3. Testes à mão

Marque aqui cada situação dos [Roteiros](Roteiros.md) que você testar: a data, quem testou, **passou** ou **falhou**, e o que viu. As partes 5a, 5b e 5b.1 já foram aprovadas pelo Pablo no teste visual de cada uma; vale testar de novo de vez em quando, porque partes novas podem quebrar coisas antigas.

| Código | Situação | Data | Quem | Resultado | Observação |
|---|---|---|---|---|---|
| T-01 | Seleção de classe com pentágono | | | | |
| T-02 | HUD do Reino | | | | |
| T-03 | Árvores de Habilidades | | | | |
| G-01 | Guilda: contrato temporário | | | | |
| G-02 | O temporário vai junto, mas não é Líder | | | | |
| G-03 | Uma partida a menos no contrato | | | | |
| G-04 | Contrato permanente | | | | |
| G-05 | Contratar sem ouro | | | | |
| SA-01 | Sacerdote: cura fora de combate | | | | |
| SA-02 | Sacerdote: o mais ferido primeiro | | | | |
| SA-03 | Sacerdote básico vai até quem precisa | | | | |
| SA-04 | Sacerdote avançado protegido | | | | |
| SA-05 | Sacerdote se cura | | | | |
| NV-01 | Desvio de quem está parado | | | | |
| NV-02 | Guerreiro avançado não espera o Tanque | | | | |
| A-01 | Andar e mirar | | | | |
| A-02 | Ataque de cada classe | | | | |
| A-03 | Esquiva | | | | |
| A-04 | Mob vermelho | | | | |
| A-05 | Atirador e escudo | | | | |
| A-06 | Invencível | | | | |
| B-01 | Encher grupo | | | | |
| B-02 | Contornar pedras e o canto do L | | | | |
| B-03 | Juntar todos | | | | |
| B-04 | Aperto contra a pedra | | | | |
| B-05 | Aliado parado na frente | | | | |
| C-01 | Ninguém treme (3 níveis) | | | | |
| C-02 | Folga | | | | |
| C-03 | Combate em cada nível da IA | | | | |
| C-04 | Linha de tiro | | | | |
| D-01 | Aliado levantado pela ajuda | | | | |
| D-02 | Área suja | | | | |
| D-03 | Ressurreição | | | | |
| D-04 | Perdido | | | | |
| D-05 | Líder caído | | | | |
| E-01 | Tecla 1 de cada classe | | | | |
| E-02 | Sem mana, em recarga, tecla vazia | | | | |
| P-01 | Pausar fora de combate | | | | |
| P-02 | Tentar pausar em combate | | | | |
| P-03 | Configurações em combate | | | | |
| P-04 | Sair de combate | | | | |
| P-05 | A pausa congela o relógio | | | | |
| Q-01 | Q e Q de novo | | | | |
| Q-02 | Q em combate | | | | |
| Q-03 | O combate interrompe o Q | | | | |
| Q-04 | Voltar ao Reino pela pausa | | | | |
| F-01 | O custo muda com a distância | | | | |
| F-02 | Aviso e Esc | | | | |
| F-03 | Fugir (F e F) | | | | |
| F-04 | Fugir em combate | | | | |
| F-05 | O Líder cai durante a fuga | | | | |
| F-06 | Todos caem durante a fuga | | | | |
| R-01 | Grande Vitória | | | | |
| R-02 | Vitória com um perdido | | | | |
| R-03 | Retorno forçado pelo Líder não levantado | | | | |
| R-04 | Derrota só com o Líder | | | | |
| R-05 | Derrota com o grupo inteiro | | | | |
| R-06 | O Resumo completo e "Jogar novamente" | | | | |
| R-07 | O save recebeu | | | | |
| R-08 | Botões de resultado da barra | | | | |
| X-01 | Monstro dá XP e ouro | | | | |
| X-02 | Subir de nível com mobs | | | | |
| X-03 | A IA muda na partida seguinte (29 → 30) | | | | |
| X-04 | De 69 para 70 com "Subir nível" | | | | |
| X-05 | O painel DEV não mexe no save durante a partida | | | | |
| K-01 | Testar foco | | | | |
| K-02 | Foco com alguém caído | | | | |
| K-03 | Sem foco na IA básica | | | | |
| M-01 | Mudo na partida | | | | |
| M-02 | O mudo fica salvo | | | | |
| M-03 | M digitando | | | | |
| CR-01 | Crítico | | | | |
| S-01 | Recarregar no meio não dá ganho | | | | |
| H-01 | HUD em 1366×768 | | | | |
| H-02 | Janela menor | | | | |

## 4. O que o roteiro automático do navegador confere (parte 5c)

As 202 conferências cobrem as partes 5a a 5c. As novas da 5c:

- **Pausa:** Esc em combate não pausa e mostra o aviso; Esc fecha a janela antes de tudo; na pausa, o relógio da partida não anda.
- **Retorno com Q:**
  - Q em combate não começa;
  - o combate a 1 s do fim faz a contagem voltar a 15 s;
  - fora de combate, ela corre de novo;
  - Q cancela;
  - o "Voltar ao Reino" da pausa usa a mesma contagem.
- **Fuga:** o aviso mostra o custo igual ao do HUD e não pausa; Esc cancela; F e F começam, mesmo em combate; Q não faz nada durante a fuga; o Líder cai e a fuga continua; todos caem e é Derrota.
- **Os 4 resultados**, cada um com a taxa conferida pela mesma conta da etapa 4:
  - Grande Vitória com +10%;
  - Vitória com um perdido;
  - Retorno forçado por fuga e pelo Líder não levantado;
  - Derrota só com o Líder, com o grupo inteiro e durante a fuga.
- **Save:** ouro, XP, monstros e partidas no save depois da partida; recarregar a página no meio não dá ganho nenhum.
- **XP, nível e IA:** subir do 29 para o 30 com um mob, aviso na hora, a IA muda só na partida seguinte (básica → média) e, de 69 para 70 com "Subir nível", média → avançada.
- **Foco:** "Testar foco" mostra o "Foco!" e a contagem, com no máximo 20% de erros (deu 0 de 8).
- **Tecla M:** liga e desliga em combate e fica salva; digitando num campo, não muta.
- **Crítico:** número "CRÍTICO" e mensagem no HUD.
- **HUD:** cabe em 1366×768, com e sem o grupo cheio, e na janela menor.
