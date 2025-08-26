const $ = (s) => document.querySelector(s);
const on = (el, ev, fn) => el.addEventListener(ev, fn);

function fmt(n){
  if (!isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a === 0) return "0";
  if (a >= 1e6 || a < 1e-3) return n.toExponential(6);
  return n.toFixed(8).replace(/0+$/,"").replace(/\.$/,"");
}
function showAlert(el, msg){ el.hidden = false; el.textContent = msg; }
function clearAlert(el){ el.hidden = true; el.textContent = ""; }

document.querySelectorAll(".tab").forEach(tab=>{
  on(tab,"click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    tab.classList.add("active");
    $("#"+tab.dataset.tab).classList.add("active");
  });
});

class Polynomial {
  constructor(expr){ this.coeffs = Polynomial.parse(expr); }
  static parse(expression){
    if(!expression || !expression.toString().trim()) throw new Error("Expressão vazia.");
    let expr = expression.toString().toLowerCase().replace(/\s+/g,"").replace(/\*/g,"");
    expr = expr.replace(/-/g,"+-"); if(expr[0]==="+") expr = expr.slice(1);
    const tokens = expr.split("+").filter(Boolean);
    if(tokens.length===0) throw new Error("Expressão inválida.");
    const map = new Map();
    for(const t of tokens){
      let c=0, e=0;
      if(t.includes("x")){
        const [L,R] = t.split("x");
        if(L===""||L==="+") c=1; else if(L==="-" ) c=-1; else c=Number(L);
        if(Number.isNaN(c)) throw new Error(`Coeficiente inválido em "${t}"`);
        if(!R) e=1; else {
          const m = R.match(/^\^(-?\d+)$/);
          if(!m) throw new Error(`Expoente inválido em "${t}" (use "^")`);
          e = Number(m[1]); if(!Number.isInteger(e)) throw new Error(`Expoente não-inteiro em "${t}"`);
        }
      }else{ c = Number(t); e = 0; if(Number.isNaN(c)) throw new Error(`Termo inválido "${t}"`); }
      map.set(e, (map.get(e)??0)+c);
    }
    for(const [k,v] of map){ if(Math.abs(v)<1e-14) map.delete(k); }
    if(map.size===0) throw new Error("Polinômio nulo.");
    return map;
  }
  eval(x){ let s=0; for(const [e,c] of this.coeffs){ s += c*Math.pow(x,e); } return s; }
}

function bisection(f, a, b, tol=1e-6, maxIter=50){
  const fa = f(a), fb = f(b);
  if(!isFinite(a)||!isFinite(b)) throw new Error("Intervalo inválido.");
  if(a>=b) throw new Error("Necessário que a < b.");
  if(fa===0) return {root:a,froot:0,iters:0,error:0,steps:[]};
  if(fb===0) return {root:b,froot:0,iters:0,error:0,steps:[]};
  if(fa*fb > 0) throw new Error("f(a)·f(b) > 0: não há garantia de raiz no intervalo (Bolzano).");

  const steps=[];
  let L=a,R=b, fL=fa, fR=fb, m=(L+R)/2, fM=f(m), err=Math.abs(R-L)/2;
  let k=0;
  while(k<maxIter && err>tol && Math.abs(fM)>tol){
    steps.push({k:k+1,a:L,b:R,m,fm:fM,error:err});
    if(fL*fM<0){ R=m; fR=fM; } else { L=m; fL=fM; }
    const prev=m; m=(L+R)/2; fM=f(m); err=Math.abs(R-L)/2;
    if(prev===m) break; k++;
  }
  steps.push({k:steps.length+1,a:L,b:R,m,fm:fM,error:err});
  return {root:m,froot:fM,iters:steps.length,error:err,steps};
}

function detectSignChange(f, xMin=-10, xMax=10, step=0.5){
  let x=xMin, fx=f(x);
  for(x=xMin+step; x<=xMax+1e-12; x+=step){
    const fy=f(x);
    if(!Number.isNaN(fx)&&!Number.isNaN(fy) && fx*fy<=0){
      return {a:x-step,b:x,fa:fx,fb:fy};
    }
    fx=fy;
  }
  return null;
}

function plotFunction(canvas, f, xMin, xMax, hl={}){
  const ctx=canvas.getContext("2d"), W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#0a111a"; ctx.fillRect(0,0,W,H);

  const N=600, xs=[], ys=[];
  let yMin=Infinity,yMax=-Infinity;
  for(let i=0;i<=N;i++){
    const t=i/N, x=xMin+t*(xMax-xMin); let y=f(x);
    if(!isFinite(y)) y=NaN; xs.push(x); ys.push(y);
    if(isFinite(y)){ yMin=Math.min(yMin,y); yMax=Math.max(yMax,y); }
  }
  if(!isFinite(yMin)||!isFinite(yMax)){ yMin=-1; yMax=1; }
  const pad=Math.max(1e-6,0.1*(yMax-yMin)||1); yMin-=pad; yMax+=pad;
  const X=x=>((x-xMin)/(xMax-xMin))*W, Y=y=>H-((y-yMin)/(yMax-yMin))*H;

  ctx.strokeStyle="#1c2a40"; ctx.lineWidth=1.2;
  if(yMin<0 && yMax>0){ const y0=Y(0); ctx.beginPath(); ctx.moveTo(0,y0); ctx.lineTo(W,y0); ctx.stroke(); }
  if(xMin<0 && xMax>0){ const x0=X(0); ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0,H); ctx.stroke(); }

  ctx.lineWidth=2; ctx.strokeStyle="#5cc8ff"; ctx.beginPath(); let first=true;
  for(let i=0;i<=N;i++){ if(!isFinite(ys[i])){ first=true; continue; }
    const px=X(xs[i]), py=Y(ys[i]); if(first){ctx.moveTo(px,py); first=false;} else ctx.lineTo(px,py); }
  ctx.stroke();

  const vline=(x,color)=>{ const px=X(x); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke(); };
  if(isFinite(hl.a)) vline(hl.a,"#ff9e9e");
  if(isFinite(hl.b)) vline(hl.b,"#ff9e9e");
  if(isFinite(hl.m)) vline(hl.m,"#39d98a");

  ctx.fillStyle="#cfe6ff"; ctx.font="12px Poppins, sans-serif";
  ["Curva: f(x)", "Vermelho: a & b", "Verde: m"].forEach((t,i)=>ctx.fillText(t,12,18+i*16));
}

const formBis = $("#form-bis");
const alertBis = $("#alert-bis");
const summaryBis = $("#summary-bis");
const outRoot = $("#out-root");
const outFRoot = $("#out-froot");
const outIters = $("#out-iters");
const outError = $("#out-error");
const tableBisBody = $("#table-bis tbody");
const canvasBis = $("#plot");

on($("#btn-example"), "click", ()=>{
  $("#poly").value = "-x^3 + 2x + 5";
  $("#a").value = "0";
  $("#b").value = "3";
  $("#tol").value = "1e-6";
  $("#maxit").value = "50";
});

on($("#btn-detect"), "click", ()=>{
  try{
    const p = new Polynomial($("#poly").value);
    const res = detectSignChange(x=>p.eval(x), -10, 10, 0.5);
    if(res){
      $("#a").value = String(res.a);
      $("#b").value = String(res.b);
      showAlert(alertBis, `Intervalo detectado: [${fmt(res.a)}, ${fmt(res.b)}] (f(a)=${fmt(res.fa)}, f(b)=${fmt(res.fb)})`);
      alertBis.style.borderLeftColor = "#39d98a";
    }else{
      showAlert(alertBis, "Nenhuma troca de sinal encontrada em [-10,10] com passo 0.5.");
      alertBis.style.borderLeftColor = "#ffd166";
    }
  }catch(e){ showAlert(alertBis, e.message); }
});

on(formBis,"submit",(ev)=>{
  ev.preventDefault();
  clearAlert(alertBis); summaryBis.hidden = true; tableBisBody.innerHTML = "";
  try{
    const p = new Polynomial($("#poly").value);
    const a = Number($("#a").value), b = Number($("#b").value);
    const tol = Number($("#tol").value), maxit = Number($("#maxit").value);
    if([a,b,tol,maxit].some(v=>Number.isNaN(v))) throw new Error("Preencha os valores corretamente.");
    if(tol<=0) throw new Error("A tolerância deve ser positiva.");
    if(maxit<1) throw new Error("Máximo de iterações deve ser ≥ 1.");

    const f = x=>p.eval(x);
    const result = bisection(f,a,b,tol,maxit);

    summaryBis.hidden=false;
    outRoot.textContent = fmt(result.root);
    outFRoot.textContent = fmt(result.froot);
    outIters.textContent = String(result.iters);
    outError.textContent = fmt(result.error);

    const frag = document.createDocumentFragment();
    for(const s of result.steps){
      const tr=document.createElement("tr");
      tr.innerHTML = `<td>${s.k}</td><td>${fmt(s.a)}</td><td>${fmt(s.b)}</td><td>${fmt(s.m)}</td><td>${fmt(s.fm)}</td><td>${fmt(s.error)}</td>`;
      frag.appendChild(tr);
    }
    tableBisBody.appendChild(frag);

    const xMin = Math.min(a,b) - Math.max(1, Math.abs(b-a)*0.2);
    const xMax = Math.max(a,b) + Math.max(1, Math.abs(b-a)*0.2);
    plotFunction(canvasBis, f, xMin, xMax, {a,b,m:result.root});
  }catch(e){ showAlert(alertBis, e.message); }
});

window.addEventListener("load", ()=>{ $("#btn-example").click(); formBis.dispatchEvent(new Event("submit")); });

const formGauss = $("#form-gauss");
const alertGauss = $("#alert-gauss");
const summaryGauss = $("#summary-gauss");
const outType = $("#out-type");
const outSteps = $("#out-steps");
const tableGaussBody = $("#table-gauss tbody");
const solBox = $("#solution");
const solVector = $("#sol-vector");
const bsLines = $("#bs-lines");
const matGrid = $("#mat-grid");
const matrixArea = $("#matrix-area");

on($("#btn-build"), "click", buildMatrix);
on($("#btn-eg"), "click", fillExample);
on(formGauss, "reset", ()=>{ setTimeout(()=>{ matrixArea.hidden=true; matGrid.innerHTML=""; clearAlert(alertGauss); summaryGauss.hidden=true; solBox.hidden=true; tableGaussBody.innerHTML=""; },0); });

function buildMatrix(){
  const n = Math.max(2, Math.min(8, Number($("#n").value)||3));
  $("#n").value = String(n);
  matGrid.innerHTML = ""; matrixArea.hidden=false;

  matGrid.style.gridTemplateColumns = `repeat(${n}, 1fr) 12px 1fr`;
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      const inp = document.createElement("input"); inp.type="number"; inp.step="any"; inp.placeholder=`a${i+1}${j+1}`;
      inp.id=`a_${i}_${j}`; matGrid.appendChild(inp);
    }
    const sep=document.createElement("div"); sep.className="sep"; sep.setAttribute("aria-hidden","true"); matGrid.appendChild(sep);
    const b=document.createElement("input"); b.type="number"; b.step="any"; b.placeholder=`b${i+1}`; b.id=`b_${i}`; matGrid.appendChild(b);
  }
}

function fillExample(){
  if(matrixArea.hidden) buildMatrix();
  const n = Number($("#n").value)||3;
  const A = [[2,3,-1],[4,1,5],[-2,2,3]], b=[5,6,-4];
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++) $("#a_"+i+"_"+j).value = A[i]?.[j] ?? 0;
    $("#b_"+i).value = b[i] ?? 0;
  }
}

on(formGauss,"submit",(ev)=>{
  ev.preventDefault();
  clearAlert(alertGauss); summaryGauss.hidden=true; solBox.hidden=true; tableGaussBody.innerHTML="";
  try{
    const {A,b} = readAugmented();
    const {upper, ops, type } = gaussianEliminationNoPivot(clone2D(A), b.slice());
    outType.textContent = type;
    outSteps.textContent = String(ops.length);
    summaryGauss.hidden=false;

    const frag = document.createDocumentFragment();
    ops.forEach((op,idx)=>{
      const tr=document.createElement("tr");
      tr.innerHTML = `<td>${op.k}</td><td>${op.desc}</td><td><pre>${formatAugmented(op.mat, op.vec)}</pre></td>`;
      frag.appendChild(tr);
    });
    tableGaussBody.appendChild(frag);

    if(type==="Única solução"){
      const {x, lines} = backSubstitution(upper.A, upper.b);
      bsLines.innerHTML = "";
      lines.forEach(li => {
        const el = document.createElement("li"); el.textContent = li; bsLines.appendChild(el);
      });
      solVector.textContent = "x = ( " + x.map(fmt).join(", ") + " )";
      solBox.hidden=false;
    }else{
      solBox.hidden=true;
    }
  }catch(e){ showAlert(alertGauss, e.message); }
});

function readAugmented(){
  const n = Number($("#n").value)||3;
  if(matrixArea.hidden) throw new Error("Clique em 'Construir matriz' primeiro.");
  const A = Array.from({length:n},()=>Array(n).fill(0));
  const b = Array(n).fill(0);
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      const v = Number($("#a_"+i+"_"+j).value);
      if(Number.isNaN(v)) throw new Error("Preencha todos os coeficientes A.");
      A[i][j]=v;
    }
    const bi = Number($("#b_"+i).value);
    if(Number.isNaN(bi)) throw new Error("Preencha todos os termos b.");
    b[i]=bi;
  }
  return {A,b};
}

function gaussianEliminationNoPivot(A, b){
  const n = A.length;
  const ops = [];
  const record = (k,desc)=>ops.push({k, desc, mat:clone2D(A), vec:b.slice()});

  let k=1; 
  record(0,"Estado inicial");

  for(let j=0;j<n-1;j++){
    const pivot = A[j][j];
    if(Math.abs(pivot)<1e-14){
      record(k++ , `Pivô ~ 0 na coluna ${j+1} (prosseguindo sem pivoteamento)`);
    }
    for(let i=j+1;i<n;i++){
      const m = (A[i][j]/(A[j][j]||1));
      if(!isFinite(m)) throw new Error("Divisão por zero: método sem pivoteamento falhou (pivô nulo).");
      for(let col=j; col<n; col++){ A[i][col] = A[i][col] - m*A[j][col]; }
      b[i] = b[i] - m*b[j];
      record(k++, `L${i+1} = L${i+1} - (${fmt(m)})·L${j+1}`);
    }
  }

  const type = classifySystem(A,b);
  return { upper:{A, b}, ops, type };
}

