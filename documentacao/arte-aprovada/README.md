# Arte aprovada

Aqui fica só a arte que o Pablo **aprovou**. É a referência para a pixel art final dos personagens.

| Arquivo | O que é | Tamanho |
|---|---|---|
| `mago-32.png` | Mago, pose parada, de frente | 32 × 32, fundo transparente |
| `tanque-32.png` | Tanque, pose parada, com o escudo | 32 × 32, fundo transparente |
| `previa-8x.png` | Os dois lado a lado, ampliados 8 vezes, sem suavização (só para ver) | 576 × 256 |

## De onde veio

- Rodada 4 das miniaturas 32 × 32 (14/11/2026): `programacao/arte-original/classes-pablo-32-r4-2026-11-14/finais/`
  (essa pasta fica fora do git).
- Na rodada 5 (14/11/2026) o Pablo aprovou o Mago e o Tanque da rodada 4 e mandou congelá-los. Os dois arquivos da
  rodada 5 são idênticos aos da rodada 4 (mesmo MD5). Os relatórios estão em `testes/2026-11-14-personagens-32-r4.md`
  e `testes/2026-11-14-personagens-32-r5.md`.
- Cópias exatas, sem nenhuma mudança de pixel:
  - `mago-32.png`: MD5 `0ce16bd38b05d427f4ee3ddd1b602edd`;
  - `tanque-32.png`: MD5 `fc7fca4d8d9a7b7cc7141f7bad9940a9`.

## O que está aprovado e o que não está

- **Aprovados:** Mago e Tanque, 32 × 32, esta pose.
- **Ainda não aprovados:** Guerreiro, Sacerdote e Arqueiro (rodada 5 em avaliação), as versões 16 × 16 e 64 × 64 e
  qualquer animação.

## O que acontece agora

A pixel art fica para o final do projeto (decisão do Pablo, 20/11/2026). Até lá, os personagens são **bonecos de
quadradinho desenhados em código** (RNF15). Quando a arte final existir, ela entra pelos nomes de
`programacao/src/dados/arte.js` e substitui o boneco inteiro (`Entidade.usarArte`). Veja o `documentacao/Guia_de_Arte.md`.
