# Cinco miniaturas 32 × 32 — rodada 2

Escrito para: Pablo.

## 1. Resumo

Rodada com os cinco personagens em 32 × 32, conforme nova instrução após o teste 64. Mago, Guerreiro, Tanque e Arqueiro partiram dos desenhos 64 aproveitados pelo Pablo; Sacerdote voltou à referência original com o reino. Resultado pequeno ainda aguarda avaliação.

## 2. Onde o projeto está

Etapas 1–9 e interface sem alteração. Arte: cinco poses estáticas em revisão, ainda externas ao jogo. Animações, direções adicionais, integração e publicação não fazem parte desta rodada. Fases 5 e 6 sem conclusão nova declarada.

## 3. O que mudou

Pasta `programacao/arte-original/classes-pablo-32-r2-2026-11-12/`: referência principal, PNGs gerados e subpasta `finais/` com cinco PNGs individuais, folha `cinco-personagens.png` 160 × 32 e prévia 8×. Os originais de todas as rodadas foram preservados.

## 4. Testes e revisão

- Cinco PNGs: 32 × 32, transparência binária, nenhum alpha intermediário.
- Folha 160 × 32 comparada pixel a pixel com cada arquivo individual: 5/5 idênticos.
- Pés na linha 31: Mago 29, Guerreiro 30, Tanque 31, Sacerdote 29, Arqueiro 26 pixels de altura visível.
- Conectividade em oito direções: nenhum componente solto de um ou dois pixels.
- Inspeções ampliadas individuais dos cinco, depois dos rostos, corpo/cajado do Sacerdote, arco/mão do Arqueiro, elmo/espada e cajado do Mago. Nova revisão após correções e conferência final da folha ampliada.
- Testes unitários, lint, build e navegador não rodados: não houve alteração de código ou integração dos PNGs.

## 5. Teste visual para o Pablo

Abrir `finais/previa-8x.png` e comparar à referência principal. Conferir olhos escuros em L sem branco/boca/bochechas, contorno, elmo fechado, capuz branco/cabelo/faixa azul do Sacerdote, cajados, escudo e arco sem corda/flecha armada. Conferir também a folha em tamanho real. Aprovação estética depende do Pablo.

## 6. Decisões e custo

Seis gerações: quatro edições de 64 para 32; Sacerdote convertido da referência para 128 como intermediário e editado para 32. Saldo de bônus 20 → 14; contratado 0. Ajustes posteriores gratuitos no PixelLab Workbench: olhos em L, contorno de bordas expostas, novo rosto/capuz/cabelo e faixa azul do Sacerdote, arco aberto com mão relaxada, remoção de base cinza e alinhamento vertical dos pés. As sombras de pele ficaram nas bordas, sem marcas de bochecha. A interpretação do Arqueiro foi preservar o arco, retirando corda e flecha armada.

## 7. Pendências

Pablo avalia este conjunto. Toda classe permanece ativa na revisão até instrução explícita para parar de alterá-la. Elogio a uma referência 64 não congela automaticamente sua miniatura 32. Ao congelar uma classe, preservá-la exatamente e trabalhar só nas restantes.

## 8. Limites

São poses estáticas. Não possuem animações e não foram colocadas no jogo. A resolução exige simplificação, principalmente do emblema e dos bordados. Não declarar fidelidade percentual ou aprovação estética sem o Pablo.

## 9. Próximo passo

Receber avaliação por classe e preservar exatamente as que o Pablo mandar parar de alterar.

## 10. Commit

Sem commit ou publicação. Nenhum arquivo de código alterado por esta rodada.

## Relatório para o grupo

Escrito para: Uener e Lucas.

Os cinco personagens ganharam uma nova rodada de miniaturas, agora no tamanho pedido para jogar. O Sacerdote foi refeito com base na imagem original, o Guerreiro mantém o rosto coberto e os personagens usam olhos escuros simples. O arco ficou sem corda desenhada. As imagens estão em avaliação; nenhuma regra do jogo mudou.
