# Limites e boas práticas

- No máximo **500 produtos** por chamada de `saveInventories`
- Token válido por **24 horas**
- Produtos sem estoque devem ir com `supply: 0`

Se a carga for maior que 500 itens, divida em várias requisições.
