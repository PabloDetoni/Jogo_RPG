---
name: verify
description: Verificação do Jogo RPG antes de cada commit e antes de publicar - npm test, lint, build e o roteiro do navegador que cobre a mudança (arena, Floresta, Reino, arte, contas). Use para "verificar", "rodar os testes", "conferir antes do commit", "testar a mudança".
---

# Verificar o Jogo RPG

Tudo roda em `programacao/`. Registre cada rodada em `testes/Registro.md` (data, comando, quantos passaram, o que falhou).

## 1. Sempre (antes de cada commit)

```bash
cd programacao
npm test          # Vitest, ~1 min; toda regra pura nova precisa de teste ao lado (src/regras/*.test.js)
npm run lint
npm run build
```

Os três precisam passar. Se um teste falhar, conserte a causa; nunca apague nem afrouxe um teste para passar.

## 2. O roteiro do navegador que cobre a mudança

Rode com `run_in_background` (1 a 6 minutos cada) e **não edite `src/` nem o `vite.config.js` enquanto rodam** (o Vite recarrega a página e a partida reinicia).

| A mudança mexe em... | Roteiro |
|---|---|
| partida, combate, IA, HUD, teclas, ponte Phaser↔React, arena | `npm run testar:navegador` (arena, ~230 conferências) |
| Floresta, mundo, mobs, Boss, coleta, câmera, FPS | `npm run testar:floresta` (TEST-005, 60 FPS) |
| movimento, colisão com pedras e mata, travamento (`regras/movimento.js`) | `npm run testar:paredes` (nenhum salto de lugar) |
| telas do Reino, Mochila, Mercado, Forja, Guilda, Árvores, Preparação, mochila da partida | `npm run testar:reino` (TEST-006) |
| arte, imagens, ícones, fundos, molduras | `npm run testar:arte` e `npm run conferir:arte` |
| contas, save no banco, sessão, ranking | `npm run testar:contas` (precisa das contas de teste no `.env.local`) |
| botões, foco, tema, fonte, CSS de botão (`identidade.css`) | `npm run testar:botoes` (nenhum botão sai do lugar) |
| Reino e Mapa em camadas, peças, clique pelo desenho, animações do cenário | `npm run testar:camadas` |
| Som: música de cada tela, efeitos, mudo, partituras (`audio/`, `dados/sons.js`, `dados/musicas.js`, `regras/som.js`, `regras/partitura.js`) | `npm run testar:som` |
| aparência de qualquer tela | `npm run prints -- <pasta>` (e `escuro`) e olhar os PNGs |

Para uma conferência rápida de uma tela, use a skill `run-jogo-rpg` (driver com prints).

## 3. Antes de publicar (fim de fase)

Todos, **um de cada vez** (dois Vite ao mesmo tempo disputam o cache e as FPS caem): `npm test`, lint, build, `testar:navegador`, `testar:floresta`, `testar:reino`, `testar:paredes`, `testar:botoes`, `testar:camadas`, `testar:som` e `testar:arte`. Depois do push,
`conferir:configuracao` e `testar:contas:publicado` (ou `conferir:site`, se a conta de teste A estiver em uso). Ver a skill `publicar`.

## Conferências que às vezes falham sem defeito (rodar de novo antes de investigar)

Conhecidas até 21/11/2026:
- arena: "aperto 6 px" e "área suja 50 ms" (tempo de quadro); "IA avançada: Arqueiro e Mago não atiram na pedra"; "EM RECARGA" (o print sai entre dois quadros); "corredor estreito"; "mobs no Tanque"; "campo aberto" (sorteio dos mobs);
- Floresta: território do lobo quando o lado escolhido cai perto do limite; a mira do Arqueiro com diferença de 0,001 rad; "não achei um cervo vivo" (sorteio);
- **Vitest no terminal Bash:** entre na pasta com `cd "C:/Users/..."` (C maiúsculo). Com a letra do disco em minúscula (`c:\...`, o caminho que o VS Code dá), o Vitest carrega duas cópias dele e todo teste falha com "Cannot read properties of undefined (reading 'config')" (27/11). No PowerShell não acontece.
- Reino e camadas: a **tela cheia** não funciona no Edge escondido ("Document not active"); os roteiros conferem só que o pedido foi feito (desde a Parte 0b de 21/11).
- arena com o notebook **na bateria**: o `testar:navegador` desenha no processador (SwiftShader) e cai para uns 18 FPS (no `main` também); as conferências de tempo falham. Rode com `NAVEGADOR_GPU=1` (placa de vídeo).
Se falhar duas vezes seguidas, é defeito: investigue. Quando uma delas for consertada, tire da lista.
