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
| Fase 2, 8a a 9a (contas, sessão única, save na nuvem, ranking e histórico) | 08/10 | 608 passando (64 novos) | ok | 225 de 226 (a falha: dois mobs nascendo encostados, 0 px; intermitente, já registrada na 2e) | — | `c3313d3` (local) |
| Fase 2: configuração conferida e TEST-007 com o Supabase de verdade | 09/10 | 611 passando (3 novos) | ok | `testar:contas`: 51 de 52 na rodada do Pablo (a falha era do teste) e 51 de 51 depois da correção; `conferir:configuracao`: tudo certo | esperando o teste da Fase 2 | `bcda545` |
| Fase 2 publicada na Vercel (`main`) | 09/10 | 611 passando | ok | `conferir:configuracao`: tudo certo no site publicado; checagem no site: ranking carregou do banco, a conta A entrou (Reino com TesteA), a partida mostra só a faixa das teclas, nenhum erro no console | esperando o teste da Fase 2 | `f2afdf2` e seguinte (no GitHub) |
| Fase 3, 3a a 3e (Floresta, câmera, regiões, mobs, minimapa, Ponto de partida) | 09/10 | 653 passando (45 novos) | ok | arena 226 de 226 (as duas intermitentes da Fase 1 corrigidas); `testar:floresta` (novo) 45 de 45 | esperando o teste da Fase 3 | `e78687d` (local, ramo `fase-3`) |
| Fase 3, 3f a 3h (coleta, drops, mochila da partida, Boss e TEST-005) | 09/10 | 660 passando (7 novos) | ok | arena 226 de 226 (3f) e `testar:floresta` 65 de 65; TEST-005: 60 FPS de média em 2 minutos de pior cenário | esperando o teste da Fase 3 | `c6aab73` (ramo `fase-3`) |
| Fim da Fase 3: push do ramo e prévia da Vercel | 09/10 | — | ok | `conferir:configuracao` na prévia: Supabase, segurança, links de e-mail, contas de teste e o endereço principal ok; **a prévia pede login da Vercel** (Deployment Protection ligada), então o conferidor não consegue olhar dentro dela. `testar:contas`: 12 de 13 (ranking sem login e segurança ok); parou antes do login porque a conta de teste A estava aberta em outra aba ("Conta em uso"), a rodar de novo com ela fechada | esperando o teste da Fase 3 | ramo `fase-3` |

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

## 2f. Fase 2 (contas): o que foi achado e o que falta

| O que aconteceu | Onde apareceu | O que foi feito |
|---|---|---|
| Com o banco ainda sem o SQL, o Login e o ranking mostravam "Algo deu errado (PGRST202)". | Olhada nas telas novas com o Supabase de verdade | O erro de "tabela ou função que não existe" virou "As contas estão indisponíveis agora. Dá para jogar como convidado." (com teste). |
| Abrir o link de senha nova numa aba que já estava no jogo só mudava o `#` do endereço e não recarregava a página. Com o e-mail isso não acontece (o link abre do zero), mas o roteiro precisava abrir do zero. | Olhada nas telas novas | O roteiro das contas abre uma página em branco antes de cada endereço. |
| Revendo o SQL: alguém poderia gravar um número gigante no próprio save (ouro = 10^30, por exemplo) e derrubar o ranking de todos. | Revisão antes de mandar o SQL ao Pablo | A função que salva recusa números fora de limites folgados (ouro e monstros até 10^12, nível até 1000, até 10 personagens). |
| O lint barrou o estado do jogo sendo lido de dentro do caminho das contas na hora de desenhar. | `npm run lint` | O caminho das contas recebe a fila de partidas como parâmetro; ele não lê o estado sozinho. |

**TEST-007 com o Supabase de verdade (09/10).** Depois de o Pablo configurar o Supabase e a Vercel, o `npm run conferir:configuracao` deu "tudo certo" e o `npm run testar:contas` rodou duas vezes:

| Rodada | Resultado | O que aconteceu |
|---|---|---|
| Pablo, 09/10 | 51 de 52 | "A aba Por classe tem a escolha da classe" falhou por erro do teste: ele procurava os botões de classe depois de já ter ido para a última aba. Todo o resto passou, inclusive a passagem do convidado para a conta B (que só dá para testar enquanto a conta é nova). |
| Claude, 09/10 | 51 de 51 | Com o teste corrigido e duas conferências novas: trocar a classe no ranking "Por classe" e fechar a aba sem sair liberando a conta na hora. A passagem do convidado foi pulada (a conta B já tem save). |

Também apareceu e foi arrumado: na tela Senha nova sem um link válido, a mensagem era "Algo deu errado (Auth session missing!)". Agora diz para abrir o link do e-mail ou pedir outro em "Esqueci minha senha" (com teste). E o "token vencido" (jwt expired) era tratado como link expirado; agora pede para entrar de novo.

O que o TEST-007 conferiu: ranking sem login (6 abas), dois navegadores na mesma conta ("Conta em uso"), duas abas do mesmo navegador, save no banco ao começar e terminar a partida, histórico e destaque no ranking, save antigo recusado (pelo banco e pelo jogo, que carrega o mais novo com aviso), conta A tentando ler, criar, alterar e apagar coisas da B (tudo barrado), queda de internet (nada trava; tudo sobe quando volta), Sair e fechar a aba liberando a conta na hora, convidado virando conta, link expirado, senha nova sem link, Supabase fora do ar (o convidado continua) e nenhum erro no console.

**Publicação (09/10):** a pedido do Pablo, a Fase 2 foi para o `main` antes do teste visual, e a Vercel publicou em `https://jogo-rpg-six.vercel.app`. Na primeira conferência do site publicado, o conferidor acusou "chave secreta no código": era alarme falso (a biblioteca do Supabase só tem o começo `sb_secret_`, para conferir o tipo da chave). O conferidor passou a procurar uma chave de verdade (`sb_secret_` seguido da chave, ou uma chave antiga com o papel service_role).

**Ainda falta:** o teste à mão (CT-01 a CT-17).

## 2g. Fase 3 (Floresta): o que foi achado e o que foi feito

| O que aconteceu | Onde apareceu | O que foi feito |
|---|---|---|
| Na Floresta, o navegador escondido dava uns 24 FPS e o Líder andava "devagar". A lógica do jogo gastava só 0,2 ms por quadro: o lento era o desenho sem placa de vídeo (SwiftShader), e o Phaser encurta o tempo dos quadros quando a página não tem foco. | Medição no roteiro novo | O desenho da Floresta virou imagens feitas uma vez só, em pedaços escondidos fora da tela, e a mata deixou de ser desenhada por cima do fundo. O roteiro da Floresta passou a usar a placa de vídeo: 60 FPS. |
| A flecha do Arqueiro não acertava mais o boneco de treino (arena). | `testar:navegador` (224 de 226) | A busca rápida de obstáculos incluía o boneco como parede. Os tiros e a linha de tiro voltaram a olhar só pedras e árvores. |
| "Inimigos criados nascem em lugar livre" falhava de vez em quando (0,04 px), desde a Fase 1. | `testar:navegador` | Eles nasciam a 4 px uns dos outros e se encostavam passeando. Agora nascem com 24 px de folga, e a conferência mede sobreposição de verdade (mais de 1 px), não o contato normal da física. |
| "Sem pulo: em 0,1 s nenhum aliado foi longe" falhava de vez em quando (122 a 127 px). | `testar:navegador` | Entre o comando e a medida havia um print, que às vezes deixava passar 0,3 s. A medida passou a ser feita em exatamente 0,1 s do relógio do jogo. |
| O Boss nascia a 590 px da entrada do domínio ("Muito difícil"), dentro do raio em que ele percebe o grupo (620 px): quem nascesse ali já seria visto. | `testar:floresta` | O Boss foi para o fundo do domínio (740 px da entrada), com um teste que garante a distância. |
| O `conferir:configuracao` seguia o redirecionamento da prévia protegida e conferia a página de login da Vercel, sem dizer que a prévia estava fechada. | `conferir:configuracao` com `ENDERECO_DA_PREVIA` | Agora ele não segue o redirecionamento: se a prévia mandar para o login da Vercel, aparece "FALTA a prévia pede login da Vercel", com o caminho para desligar a proteção. |
| Conferências do roteiro novo que dependiam de outros mobs por perto (o lobo que desiste, o cervo que não ataca) e de mobs que se mexem depois de nascer. | `testar:floresta` | O roteiro limpa os mobs em volta antes desses testes e confere onde cada mob nasceu (a casa dele), não onde está depois. |

## 3. Testes à mão

Marque aqui cada situação dos [Roteiros](Roteiros.md) que você testar: a data, quem testou, **passou** ou **falhou**, e o que viu. As partes 5a, 5b e 5b.1 já foram aprovadas pelo Pablo no teste visual de cada uma; vale testar de novo de vez em quando, porque partes novas podem quebrar coisas antigas.

| Código | Situação | Data | Quem | Resultado | Observação |
|---|---|---|---|---|---|
| FL-01 | Andar até a borda | | | | |
| FL-02 | Câmera e mira | | | | |
| FL-03 | Descobrir regiões e ver o minimapa | | | | |
| FL-04 | Nascer numa região descoberta e conferir a taxa | | | | |
| FL-05 | Fugir de um mob até ele desistir | | | | |
| FL-06 | Passar por um mob não hostil | | | | |
| FL-07 | Coleta com E | | | | |
| FL-08 | Mochila cheia com item no chão | | | | |
| FL-09 | Enfrentar o Boss | | | | |
| FL-10 | O grupo atravessa a Floresta sem ninguém ficar preso | | | | |
| FL-11 | 60 FPS no pior cenário (TEST-005) | | | | |
| FL-12 | A arena de teste só no desenvolvimento | | | | |
| CT-01 | Criar conta e confirmar o e-mail | | | | |
| CT-02 | Cadastro com problema (apelido, senha, e-mail) | | | | |
| CT-03 | E-mail não confirmado e Reenviar | | | | |
| CT-04 | Senha errada | | | | |
| CT-05 | Continuar como ... | | | | |
| CT-06 | Esqueci minha senha e Senha nova | | | | |
| CT-07 | Dois navegadores na mesma conta | | | | |
| CT-08 | Duas abas do mesmo navegador | | | | |
| CT-09 | Convidado virando conta | | | | |
| CT-10 | Conta antiga não mistura o convidado | | | | |
| CT-11 | O progresso segue a conta em outro computador | | | | |
| CT-12 | Sem internet | | | | |
| CT-13 | Ranking sem login | | | | |
| CT-14 | Ranking e histórico com conta | | | | |
| CT-15 | Histórico com mais de 20 partidas | | | | |
| CT-16 | Vercel em outra máquina | | | | |
| CT-17 | Jogo publicado sem as ferramentas de teste | | | | |
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
