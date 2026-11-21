# Perna posterior do Tanque em 64 × 64

Escrito para Pablo.

## 1. Resumo

A canela, o tornozelo e a bota de trás foram redesenhados seguindo a pose da referência. A borda do escudo encobre a maior parte da perna.

## 2. Situação do projeto

| Etapa | Situação |
| --- | --- |
| 1 a 9 e Fase 4.5 | Concluídas conforme o plano |
| 10 | Arte em avaliação. Tanque entregue para revisão |
| Fases 5 e 6 | Testes, protótipos e entrega conforme o plano |

## 3. Arquivos

- [Prévia ampliada 8×](../programacao/arte-original/tanque-64-perna-2026-11-15/tanque-selecao-previa-8x.png)
- [PNG nativo 64 × 64](../programacao/arte-original/tanque-64-perna-2026-11-15/tanque-selecao-64.png)
- [Comando completo do Ateliê](../programacao/arte-original/tanque-64-perna-2026-11-15/tanque-selecao.json)

## 4. Conferências

| Verificação | Resultado |
| --- | --- |
| Visual | Revisado em 1× e 8×, sobre fundo claro e escuro |
| Formato e imagem | 64 linhas de 64 símbolos, paleta RGBA, 4.096 pixels idênticos ao PNG e ampliação por vizinho mais próximo |
| Região editada | 66 pixels alterados, dentro de x=29–42 e y=55–63 |
| Unitários, lint, build, arena, Floresta, Reino, arte no jogo e contas | Fora do escopo da revisão estática |

## 5. Teste visual para Pablo

Abra **IA → Mais opções → Colar ou abrir** no Ateliê e escolha o JSON. Depois de clicar em **Criar desenho com isto**, confira o encaixe da canela junto ao escudo, a ponta da bota voltada para a direita e as duas solas na linha 62.

## 6. Decisões

Foi usada a matriz local em `classes-64-revisao/tank.json`. A grade anexada orientou a inspeção, e o recorte do Tanque da referência orientou a silhueta e os tons. O metal da bota posterior recebeu menos luz porque fica atrás do escudo.

## 7. Pendências

Pablo avalia a perna. A edição do Sacerdote começa após essa avaliação.

## 8. Limites da conferência

O comando foi validado por leitura do JSON e comparação com os PNGs. A importação na interface do Ateliê fica no roteiro visual.

## 9. Próximo passo

Aplicar o retorno de Pablo ao Tanque e, com sinal verde, revisar a cobertura e a haste do cajado do Sacerdote.

## 10. Commit

Nenhum commit nesta revisão.

## Relatório para o grupo

Escrito para Uener e Lucas.

O Tanque ganhou uma perna posterior com canela e bota ligadas sob o escudo. A imagem está pronta para a avaliação visual do Pablo. O Sacerdote segue na fila após essa avaliação.
