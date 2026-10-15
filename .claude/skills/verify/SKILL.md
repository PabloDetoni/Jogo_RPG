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
| aparência de qualquer tela | `npm run prints -- <pasta>` (e `escuro`) e olhar os PNGs |

Para uma conferência rápida de uma tela, use a skill `run-jogo-rpg` (driver com prints).

## 3. Antes de publicar (fim de fase)

Todos, **um de cada vez** (dois Vite ao mesmo tempo disputam o cache e as FPS caem): `npm test`, lint, build, `testar:navegador`, `testar:floresta`, `testar:reino`, `testar:paredes` e `testar:arte`. Depois do push,
`conferir:configuracao` e `testar:contas:publicado` (ou `conferir:site`, se a conta de teste A estiver em uso). Ver a skill `publicar`.

## Conferências que às vezes falham sem defeito (rodar de novo antes de investigar)

- arena: "aperto 6 px" e "área suja 50 ms" (tempo de quadro);
- Floresta: território do lobo quando o lado escolhido cai perto do limite.
Se falhar duas vezes seguidas, é defeito: investigue.
