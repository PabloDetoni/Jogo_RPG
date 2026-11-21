# Correções 64 × 64 e comandos do Ateliê
Escrito para: Pablo.

## 1. Resumo
Corrigidos Tanque, Guerreiro, Sacerdote e Arqueiro a partir das matrizes enviadas. No Mago, somente contorno externo adicional: rosto e pixels existentes preservados.

## 2. Onde o projeto está
Etapas 1–9 conforme PLANO; arte em avaliação. Sem integração, alteração de regras, animação ou publicação.

## 3. Arquivos
Pasta programacao/arte-original/classes-64-comandos-corrigidos-2026-11-15: COMANDOS-PARA-COLAR.txt, cinco comandos JSON individuais em comandos/, cinco PNGs em png/, folha 320 × 64 e prévia 4×. Cada comando mantém schemaVersion 1.0, kind pixel-matrix, assetId, dimensões, paleta e rows do formato enviado.

## 4. Conferências
5/5 comandos válidos em JSON, 64 linhas de 64 símbolos e cores RGBA válidas. Cada comando foi decodificado e comparado por SHA-256 dos 4096 pixels RGBA ao PNG: 5/5 idênticos. Transparência binária e dimensões verificadas. Revisão visual das cinco imagens e da folha conjunta.
- mago: 82 pixels alterados, dos quais 0 já eram opacos.
- guerreiro: 155 pixels alterados, dos quais 100 já eram opacos.
- tank: 170 pixels alterados, dos quais 0 já eram opacos.
- sacerdote: 169 pixels alterados, dos quais 3 já eram opacos.
- arqueiro: 109 pixels alterados, dos quais 7 já eram opacos.
Não foi executada a interface do ateliê; conferência feita sobre o formato enviado e a equivalência dos pixels. Testes de código/navegador do jogo não se aplicam.

## 5. Teste visual para o Pablo
Ateliê > IA > Mais opções > Colar ou abrir. Colar um JSON completo e escolher Criar desenho com isto. Conferir pé visível do Tanque, máscara metálica fechada com faixa dourada vertical, cobertura branca/cajado do Sacerdote e furos corrigidos no rosto do Arqueiro. No Mago, conferir o contorno da roupa e do chapéu sem mudança dos olhos.

## 6. Decisões
Contorno adicional de um pixel com os tons escuros já existentes; sem linhas sobre o cristal luminoso. Completar o pé atrás do tecido do Tanque, preservar emblema e escudo. Fechar o elmo com metal e manter o dourado descendo pela frente. Repor pequena parte superior da cobertura do Sacerdote e ligar trechos da haste. No Arqueiro, corrigir três pixels transparentes do rosto, sombras pontuais do capuz e contorno externo.

## 7. Pendências
Avaliação visual do Pablo. Comandos prontos para importar; integração/animações não fazem parte desta entrega.

## 8. Limites
Uma pose estática por personagem. Não substituir automaticamente versões aprovadas anteriores.

## 9. Próximo passo
Importar os comandos individualmente e revisar as regiões solicitadas.

## 10. Custo e commit
Zero gerações adicionais no PixelLab Workbench; contador de gerações permaneceu em 52. Sem commit ou publicação.

## Relatório para o grupo
Escrito para: Uener e Lucas.
Os personagens receberam correções pontuais de contorno e equipamento. O Tanque ganhou o pé faltante, o Cavaleiro recebeu uma máscara fechada e Sacerdote/Arqueiro tiveram pequenos reparos. O rosto do Mago foi preservado. Foram preparados comandos compatíveis com o modelo de importação fornecido pelo Pablo; nenhuma regra do jogo mudou.

