# Método da Bissecção Polinomial

Um aplicativo web para encontrar raízes de polinômios usando o método da bissecção.

## Funcionalidades

- Interface web moderna e responsiva
- Parser de expressões polinomiais
- Implementação do método da bissecção
- Visualização detalhada das iterações
- Validação de entrada de dados
- Histórico completo de iterações

## Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. Digite o polinômio no formato: `x^3 - 2x - 5`
3. Defina os limites do intervalo [a, b]
4. Configure a tolerância e número máximo de iterações
5. Clique em "Calcular"

## Formato dos Polinômios

O aplicativo aceita polinômios nos seguintes formatos:
- `x^3 - 2x - 5`
- `2x^2 + 3x + 1`
- `x^4 - 5x^2 + 4`
- `3x - 7`

### Regras:
- Use `x` como variável
- Use `^` para potências
- Use `+` e `-` para adição e subtração
- Coeficientes podem ser decimais
- Termos constantes são aceitos

## Exemplo de Uso

**Polinômio:** `x^3 - 2x - 5`
**Intervalo:** [1, 3]
**Tolerância:** 0.0001
**Máximo de iterações:** 100

**Resultado esperado:** Aproximadamente 2.094551

## Arquivos do Projeto

- `index.html` - Interface principal
- `styles.css` - Estilos da interface
- `script.js` - Lógica do método da bissecção
- `README.md` - Este arquivo

## Requisitos

- Navegador web moderno com suporte a JavaScript ES6+
- Não requer instalação de dependências externas

## Método da Bissecção

O método da bissecção é um algoritmo iterativo para encontrar raízes de funções contínuas. Ele funciona dividindo repetidamente o intervalo [a, b] ao meio e verificando em qual metade a raiz está localizada.

### Algoritmo:
1. Verifica se há mudança de sinal no intervalo [a, b]
2. Calcula o ponto médio c = (a + b) / 2
3. Avalia f(c)
4. Se |f(c)| < tolerância, c é a raiz
5. Caso contrário, atualiza o intervalo baseado no sinal de f(c)
6. Repete até encontrar a raiz ou atingir o máximo de iterações

## Limitações

- Requer que a função seja contínua no intervalo [a, b]
- Requer que f(a) e f(b) tenham sinais opostos
- Pode não convergir se houver múltiplas raízes próximas
- A convergência é linear (mais lenta que outros métodos)

## Próximos Passos

Este é o início do projeto. Funcionalidades que podem ser adicionadas:
- Gráfico da função
- Outros métodos numéricos (Newton-Raphson, Secante)
- Exportação de resultados
- Mais opções de formatação de polinômios
- Análise de convergência 