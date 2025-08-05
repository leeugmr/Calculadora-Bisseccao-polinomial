
class Polynomial {
    constructor(expression) {
        this.expression = expression;
        this.terms = this.parseExpression(expression);
    }

    parseExpression(expression) {
        let cleanExpr = expression.replace(/\s/g, '').toLowerCase();
        
        if (!cleanExpr.startsWith('+') && !cleanExpr.startsWith('-')) {
            cleanExpr = '+' + cleanExpr;
        }

        const terms = [];
        const termRegex = /([+-])([0-9]*\.?[0-9]*)?x?(\^[0-9]+)?/g;
        let match;

        while ((match = termRegex.exec(cleanExpr)) !== null) {
            const sign = match[1] === '+' ? 1 : -1;
            const coefficient = match[2] === '' ? 1 : parseFloat(match[2] || 1);
            const hasX = match[0].includes('x');
            const exponent = match[3] ? parseInt(match[3].substring(1)) : (hasX ? 1 : 0);

            terms.push({
                coefficient: sign * coefficient,
                exponent: exponent
            });
        }

        return terms;
    }

    evaluate(x) {
        let result = 0;
        
        for (const term of this.terms) {
            result += term.coefficient * Math.pow(x, term.exponent);
        }
        
        return result;
    }}
