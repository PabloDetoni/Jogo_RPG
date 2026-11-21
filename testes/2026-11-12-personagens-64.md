# Cinco personagens — teste final de 64 × 64

Escrito para: Pablo.

## 1. Resumo

Concluído o teste individual das cinco classes a partir da imagem própria aprovada do Pablo. Cada PNG tem 64 × 64 pixels, fundo transparente e uma pose estática. A folha conjunta tem 320 × 64; a prévia 5× amplia os pixels sem suavização.

## 2. Onde o projeto está

| Trabalho | Situação |
|---|---|
| Etapas 1–9 e interface | Sem alteração neste pedido |
| Arte: cinco poses estáticas | Teste entregue para avaliação visual |
| Direções e animações | Ainda não produzidas neste lote |
| Integração e publicação | Aguardam aprovação da aparência; este pedido não alterou o jogo |
| Fases 5 e 6 | Sem avanço ou conclusão declarados neste pedido |

## 3. O que mudou

Arquivos finais em `programacao/arte-original/classes-pablo-64-final-2026-11-12/`: `mago.png`, `guerreiro.png`, `tanque.png`, `sacerdote.png`, `arqueiro.png`, `cinco-personagens.png`, `previa-5x.png` e `LEIA-ME.md`. Pacote irmão `personagens-64-final-2026-11-12.zip`.

Originais de geração preservados em `classes-pablo-64-2026-11-08/`. Referência própria do Pablo preservada em `classes-pablo-2026-11-08/referencia-pablo.png`. Nenhuma arte aprovada foi sobrescrita no jogo.

## 4. Testes rodados e resultado

Conferidos os cinco PNGs baixados: 64 × 64, transparência binária, nenhuma borda semitransparente, altura prevista, base na linha 62. Cada célula da folha confere pixel a pixel com o arquivo individual. Conferência de conectividade em oito direções não encontrou componentes soltos de um ou dois pixels. Revisão visual da folha ampliada concluída.

| Verificação | Resultado |
|---|---|
| PNGs e folha | 5/5, dimensões, transparência e igualdade exata |
| Alturas e base | Mago 57, Guerreiro 59, Tanque 61, Sacerdote 55, Arqueiro 47 px; base y=62 |
| Revisão visual | Capuz, cruz, viseira, olhos, armas e pés conferidos |
| Unitários, lint, build | Não executados; nenhum código alterado por este pedido |
| Arena, Floresta, Reino, arte e contas no site | Não executados; PNGs ainda externos ao jogo |

## 5. Teste visual para o Pablo

Abrir `previa-5x.png` e conferir as cinco classes, na ordem Mago, Guerreiro, Tanque, Sacerdote e Arqueiro. Comparar com a referência própria: chapéu e dourados do Mago; elmo fechado e capa vermelha; escudo azul/dourado; capuz branco e cruz; capuz verde, arco e aljava. Conferir também `cinco-personagens.png` em tamanho real. O site público ainda não contém este lote.

## 6. Decisões tomadas

64 × 64 autorizado pelo Pablo. Conversão fiel individual e edição individual no PixelLab; cinco imagens, duas gerações cada, concluídas antes da retomada. Na retomada de 12/11, edição exata gratuita pelo PixelLab Workbench: boca do Mago removida, olhos do Arqueiro definidos, olhos do Tanque ajustados e cruz redesenhada. Ajustes seletivos de linhas do chapéu/armadura/pernas corrigiram as alturas na grade nativa; não foi aplicada uma redução ou ampliação geral aos sprites. A montagem da folha apenas posiciona os PNGs finais.

## 7. Pendências

- Pablo: avaliar a aparência do teste em 64 × 64.
- Após aprovação: preparar direções, animações e integração, com orçamento próprio.
- Grupo: nenhuma ação nova exigida por este teste.

## 8. Problemas conhecidos e limites

É um estudo de uma pose por personagem, não um conjunto animado pronto para combate. Simplificação da referência é inevitável na grade, e a avaliação estética final pertence ao Pablo. As cores das roupas seguem a nova referência; as cores do HUD e os números do jogo não foram alterados.

## 9. Próximo passo

Avaliação visual deste lote. Preservar os desenhos aceitos como referência das direções e animações, evitando regenerar o visual a cada etapa.

## 10. Commit e custo

Sem commit ou publicação. Lote de geração: 10 gerações (saldo contratado 4 → 0, contador de bônus 12 → 2 na geração). Retomada em 12/11: 0 gerações; bônus consultado disponível 20. Bônus não representa cobrança dupla; ele foi renovado entre as datas.

## Relatório para o grupo

Escrito para: Uener e Lucas.

Os cinco personagens ganharam versões pequenas a partir da imagem aprovada pelo Pablo. O teste usa mais pixels para preservar roupas, armas, olhos e símbolos. O cavaleiro tem o rosto coberto, o Sacerdote mantém o capuz branco e a cruz, e o Tanque é o maior. As imagens estão prontas para avaliação; ainda não foram colocadas no jogo e não têm animações. Nenhuma regra de gameplay mudou.
