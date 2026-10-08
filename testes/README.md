# Testes

Esta pasta junta tudo o que é preciso para **testar o jogo à mão** e o **registro dos testes** que já rodaram. Ela fica fora de `documentacao` (que é a documentação do trabalho) e de `programacao` (o código).

| Arquivo | Para que serve |
|---|---|
| [Roteiros.md](Roteiros.md) | Situações de teste, passo a passo: o que preparar, o que fazer e o que deve acontecer. Cada uma tem um código (por exemplo, **Q-02**) para anotar o resultado. |
| [Registro.md](Registro.md) | O que já foi testado e quando: os testes automáticos de cada parte (quantos passaram e o que falhou), os problemas achados e corrigidos e a tabela dos testes à mão, para marcar quem testou, quando e o resultado. |

## Como usar

1. Abra o jogo: dentro de `programacao`, rode `npm run dev` e abra o endereço que aparecer (normalmente http://localhost:5173).
2. Escolha uma situação em [Roteiros.md](Roteiros.md) e siga os passos.
3. Anote o resultado na tabela "Testes à mão" do [Registro.md](Registro.md): a data, quem testou, **passou** ou **falhou**, e o que viu de diferente.
4. Se algo falhou, conte ao Claude o código da situação e o que aconteceu. Ele procura o problema e corrige.

## Testes automáticos (o Claude roda no fim de cada parte)

Dentro de `programacao`:

- `npm test`: as regras do jogo (taxa, XP, combate, IA, desmaio, fim da partida...) e as telas.
- `npm run lint`: procura erros de escrita no código.
- `npm run build`: monta a versão que vai para a internet.
- `npm run testar:navegador`: abre o jogo num navegador escondido, joga a arena sozinho e confere mais de 200 coisas. Os prints ficam em `programacao/testes-do-navegador/` (fora do git).
