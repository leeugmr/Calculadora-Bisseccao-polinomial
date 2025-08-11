class Polynomial {
    constructor(expression) {
      this.expression = expression;
      this.terms = this.parseExpression(expression);
    }
    parseExpression(expression) {
      let expr = (expression || '').toString().trim().toLowerCase();
      expr = expr.replace(/\s+/g, '');
      if (expr.length === 0) throw new Error('Expressão vazia.');
      expr = expr.replace(/-/g, '+-');
      if (expr[0] === '+') expr = expr.slice(1);
      const tokens = expr.split('+').filter(t => t.length > 0);
      if (tokens.length === 0) throw new Error('Expressão inválida.');
      const byExp = new Map();
      for (const t of tokens) {
        let coef, exp;
        if (t.includes('x')) {
          const xIdx = t.indexOf('x');
          const coefPart = t.slice(0, xIdx);
          if (coefPart === '' || coefPart === '+') coef = 1;
          else if (coefPart === '-') coef = -1;
          else {
            coef = parseFloat(coefPart);
            if (Number.isNaN(coef)) throw new Error(`Coeficiente inválido em "${t}".`);
          }
          if (t.includes('^')) {
            const powPart = t.split('^')[1];
            exp = parseInt(powPart, 10);
            if (!Number.isInteger(exp) || exp < 0) throw new Error(`Expoente inválido em "${t}".`);
          } else {
            exp = 1;
          }
        } else {
          coef = parseFloat(t);
          if (Number.isNaN(coef)) throw new Error(`Constante inválida em "${t}".`);
          exp = 0;
        }
        const prev = byExp.get(exp) || 0;
        const sum = prev + coef;
        if (Math.abs(sum) > 0) byExp.set(exp, sum);
      }
      const terms = [...byExp.entries()]
        .map(([exponent, coefficient]) => ({ exponent, coefficient }))
        .sort((a, b) => b.exponent - a.exponent);
      if (terms.length === 0) throw new Error('Todos os coeficientes zeraram.');
      return terms;
    }
    evaluate(x) {
      let result = 0;
      for (const { coefficient, exponent } of this.terms) {
        result += coefficient * Math.pow(x, exponent);
      }
      return result;
    }
    toString() {
      return this.terms.map(({ coefficient, exponent }, i) => {
        const sign = coefficient >= 0 ? (i === 0 ? '' : '+') : '-';
        const abs = Math.abs(coefficient);
        const coefStr = (exponent === 0 || abs !== 1) ? abs.toString() : '';
        const xStr = exponent === 0 ? '' : (exponent === 1 ? 'x' : `x^${exponent}`);
        return `${sign}${coefStr}${xStr}`;
      }).join('') || '0';
    }
  }
  
  function bisection(poly, a, b, tol = 1e-6, maxIt = 50) {
    if (!(a < b)) throw new Error('Exija a < b.');
    let fa = poly.evaluate(a);
    let fb = poly.evaluate(b);
    if (fa === 0) return { root: a, rows: [], iterations: 0, width: 0, froot: 0, reason: 'f(a)=0' };
    if (fb === 0) return { root: b, rows: [], iterations: 0, width: 0, froot: 0, reason: 'f(b)=0' };
    if (fa * fb > 0) throw new Error('Não há mudança de sinal em [a, b].');
    const rows = [];
    let it = 0, m, fm;
    while (it < maxIt) {
      it++;
      m = (a + b) / 2;
      fm = poly.evaluate(m);
      const halfWidth = (b - a) / 2;
      rows.push({ k: it, a, b, m, fa, fm, fb, halfWidth });
      if (fm === 0 || Math.abs(fm) <= tol) break;
      if (halfWidth <= tol) break;
      if (fa * fm < 0) {
        b = m;
        fb = fm;
      } else {
        a = m;
        fa = fm;
      }
    }
    const width = (b - a);
    const root = (a + b) / 2;
    const froot = poly.evaluate(root);
    return { root, rows, iterations: it, width, froot, reason: '' };
  };