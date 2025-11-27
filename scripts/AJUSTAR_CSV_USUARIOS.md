# Como Ajustar o CSV de Usuários para Importação

## Problema
O CSV não tem as colunas `id` e `user_id`, mas a tabela espera essas colunas.

## Solução
Adicione duas colunas vazias no INÍCIO do CSV.

### Estrutura Atual do CSV:
```
orgao_id;setor_id;papel;nome;matricula;...
```

### Estrutura Necessária:
```
id;user_id;orgao_id;setor_id;papel;nome;matricula;...
```

## Passo a Passo:

### Opção 1: Editar no Excel/LibreOffice
1. Abra o arquivo CSV
2. Insira 2 colunas ANTES da primeira coluna
3. Nomeie a primeira coluna como `id`
4. Nomeie a segunda coluna como `user_id`
5. **Deixe todas as células dessas colunas VAZIAS** (o banco vai gerar automaticamente)
6. Salve o arquivo

### Opção 2: Editar no Editor de Texto
1. Abra o CSV em um editor de texto
2. Na primeira linha (cabeçalho), adicione `id;user_id;` no início
3. Em todas as outras linhas, adicione `;;` no início (dois pontos e vírgulas vazios)
4. Salve o arquivo

### Exemplo:

**ANTES:**
```csv
orgao_id;setor_id;papel;nome;matricula
04e86ec7-8fdd-4e80-ade9-1d4eb45447a3;abc123;servidor;João Silva;12345
```

**DEPOIS:**
```csv
id;user_id;orgao_id;setor_id;papel;nome;matricula
;;04e86ec7-8fdd-4e80-ade9-1d4eb45447a3;abc123;servidor;João Silva;12345
```

## Importante:
- As colunas `id` e `user_id` devem estar VAZIAS
- O PostgreSQL vai gerar UUIDs automaticamente para `id`
- O `user_id` ficará NULL (será preenchido depois quando criar usuários no Auth)

## Ordem Completa das Colunas:

1. **id** (vazio)
2. **user_id** (vazio)
3. orgao_id
4. setor_id
5. papel
6. nome
7. matricula
8. vinculo_funcional
9. cpf
10. pis_pasep
11. sexo
12. estado_civil
13. data_nascimento
14. pai
15. mae
16. rg
17. tipo_rg
18. orgao_expedidor
19. uf_rg
20. expedicao_rg
21. cidade_nascimento
22. uf_nascimento
23. tipo_sanguineo
24. raca_cor
25. pne
26. tipo_vinculo
27. categoria
28. regime_juridico
29. regime_previdenciario
30. evento_tipo
31. forma_provimento
32. codigo_cargo
33. cargo
34. escolaridade_cargo
35. escolaridade_servidor
36. formacao_profissional_1
37. formacao_profissional_2
38. jornada
39. nivel_referencia
40. comissao_funcao
41. data_inicio_comissao
42. telefone
43. endereco
44. numero_endereco
45. complemento_endereco
46. bairro_endereco
47. cidade_endereco
48. uf_endereco
49. cep_endereco
50. latitude
51. longitude
52. email
53. senha
54. senha_alterada
55. usuario_ativo
56. ultimo_login
57. tentativas_login
58. data_criacao
59. data_atualizacao
60. bloqueado_ate

Após ajustar o CSV, tente importar novamente!
