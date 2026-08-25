const $ = s => document.querySelector(s);
const presets = {
  "New York": { hydration:62, salt:1.5, yeast:.25, oil:2.5, thickness:.075, primary:"Bread Flour", primaryPct:100, secondary:"00 Pizza Flour", secondaryPct:0 },
  Neapolitan: { hydration:65, salt:3, yeast:.2, oil:0, thickness:.065, primary:"00 Pizza Flour", primaryPct:100, secondary:"Bread Flour", secondaryPct:0 },
  Sicilian: { hydration:72, salt:2, yeast:.4, oil:4, thickness:.1, primary:"Bread Flour", primaryPct:70, secondary:"All-Purpose Flour", secondaryPct:30 },
  Custom: { hydration:62, salt:2, yeast:.25, oil:2, thickness:.075, primary:"Bread Flour", primaryPct:100, secondary:"00 Pizza Flour", secondaryPct:0 }
};
let s = JSON.parse(localStorage.getItem("doughwrite") || "null") || {
  style:"New York", pies:3, diameter:16, poolish:true, poolishPct:30, poolishHydration:100,
  poolishYeast:.15, temp:40, poolishTemp:70, poolishHours:14, oven:"Pizza Oven",
  pizzaTemp:750, homeTemp:550, bakeTime:new Date(Date.now()+86400000).toISOString().slice(0,16),
  extraDay:false, ...presets["New York"]
};
const num = v => Number(v) || 0;
function calc(){
  const area = Math.PI * (s.diameter / 2) ** 2;
  const ball = area * s.thickness * (375.73 / (Math.PI * 7.5 * 7.5 * .075));
  const total = ball * s.pies;
  const flour = total / (1 + s.hydration/100 + s.salt/100 + s.yeast/100 + s.oil/100);
  return {ball,total,flour,water:flour*s.hydration/100,salt:flour*s.salt/100,yeast:flour*s.yeast/100,oil:flour*s.oil/100};
}
function render(){
  localStorage.setItem("doughwrite", JSON.stringify(s));
  const d=calc(), pf=s.poolish?d.flour*s.poolishPct/100:0, pw=pf*s.poolishHydration/100, py=pf*s.poolishYeast/100;
  const finalHours=Math.max(2,Math.min(120,5.5*(.25/Math.max(s.yeast,.01))*Math.pow(2,(68-s.temp)/18)));
  const bake=new Date(s.bakeTime), extra=s.extraDay?24:0;
  const mix=new Date(bake-(finalHours+2+.75+extra)*3600000);
  const poolStart=new Date(mix-(s.poolish?s.poolishHours*3600000:0));
  const ovenText=s.oven==="Pizza Oven" ? `${s.pizzaTemp}°F pizza oven: ${s.pizzaTemp>=850?"60–120 seconds":"2–4 minutes"}.` : `${s.homeTemp}°F home oven: 8–14 minutes on steel/stone.`;
  $("#app").innerHTML=`
  <header class="brand"><h1>Dough<span>write</span></h1><p class="muted">Precision pizza dough, from formula to fire.</p></header>
  <section class="card"><h2>Formula</h2><div class="grid">
  <label>Style<select id="style">${Object.keys(presets).map(x=>`<option ${x===s.style?"selected":""}>${x}</option>`).join("")}</select></label>
  <label>Pizzas<input id="pies" type="number" value="${s.pies}"></label><label>Diameter (in)<input id="diameter" type="number" value="${s.diameter}"></label>
  <label>Hydration %<input id="hydration" type="number" value="${s.hydration}"></label><label>Salt %<input id="salt" type="number" value="${s.salt}"></label>
  <label>ADY yeast %<input id="yeast" type="number" step=".01" value="${s.yeast}"></label><label>Oil %<input id="oil" type="number" value="${s.oil}"></label>
  <label>Primary flour<select id="primary"><option>Bread Flour</option><option>00 Pizza Flour</option><option>All-Purpose Flour</option></select></label><label>Primary %<input id="primaryPct" type="number" value="${s.primaryPct}"></label>
  <label>Secondary flour<select id="secondary"><option>Bread Flour</option><option>00 Pizza Flour</option><option>All-Purpose Flour</option></select></label><label>Secondary %<input id="secondaryPct" type="number" value="${s.secondaryPct}"></label>
  </div><p class="muted">Blend: ${s.primaryPct}% ${s.primary} + ${s.secondaryPct}% ${s.secondary}</p></section>
  <section class="card"><h2>Dough results</h2><div class="results"><div class="result"><b>${Math.round(d.total)}g</b><span>Total dough</span></div><div class="result"><b>${Math.round(d.ball)}g</b><span>Per ball</span></div><div class="result"><b>${s.hydration}%</b><span>Hydration</span></div></div><table><tr><th>Ingredient</th><th>Amount</th></tr>${[["Flour",d.flour],["Water",d.water],["Salt",d.salt],["ADY yeast",d.yeast],["Oil",d.oil]].map(x=>`<tr><td>${x[0]}</td><td>${x[1].toFixed(1)}g</td></tr>`).join("")}</table></section>
  <section class="card"><h2>Poolish</h2><div class="grid"><label><input id="poolish" type="checkbox" ${s.poolish?"checked":""}> Use poolish</label><label>Flour %<input id="poolishPct" type="number" value="${s.poolishPct}"></label><label>Hydration %<input id="poolishHydration" type="number" value="${s.poolishHydration}"></label><label>Yeast %<input id="poolishYeast" type="number" step=".01" value="${s.poolishYeast}"></label><label>Temp °F<input id="poolishTemp" type="number" value="${s.poolishTemp}"></label><label>Hours<input id="poolishHours" type="number" value="${s.poolishHours}"></label></div><p class="notice">Poolish: ${pf.toFixed(1)}g flour, ${pw.toFixed(1)}g water, ${py.toFixed(2)}g ADY yeast. Final dough: ${(d.flour-pf).toFixed(1)}g flour, ${(d.water-pw).toFixed(1)}g water, ${d.salt.toFixed(1)}g salt, ${d.oil.toFixed(1)}g oil.</p></section>
  <section class="card"><h2>Timeline & oven</h2><div class="grid"><label>Storage temp °F<input id="temp" type="number" value="${s.temp}"></label><label>Bake date/time<input id="bakeTime" type="datetime-local" value="${s.bakeTime}"></label><label><input id="extraDay" type="checkbox" ${s.extraDay?"checked":""}> Hold another fridge day</label><label>Oven<select id="oven"><option>Pizza Oven</option><option>Home Oven</option></select></label><label>Pizza oven °F<input id="pizzaTemp" type="number" value="${s.pizzaTemp}"></label><label>Home oven °F<input id="homeTemp" type="number" value="${s.homeTemp}"></label></div><div class="schedule"><p><b>Poolish start:</b> ${s.poolish?poolStart.toLocaleString():"Not used"}</p><p><b>Final dough mix:</b> ${mix.toLocaleString()}</p><p><b>Final fermentation:</b> about ${finalHours.toFixed(1)} hours at ${s.temp}°F${s.extraDay?" + 24 additional refrigerator hours":""}.</p><p><b>Preheat:</b> ${(s.oven==="Pizza Oven"?25:50)} minutes before baking. ${ovenText}</p></div><button class="no-print" id="print">Print recipe card</button></section>
  <section class="card"><h2>Sauce</h2><p>14 oz Italian tomatoes · 3 Tbsp extra-virgin olive oil · ½ tsp sea salt · 2 basil leaves · pinch dried oregano · 1 fresh garlic clove.</p><p>Crush tomatoes, mix in remaining ingredients, taste for salt, and use a light layer on each pizza.</p></section>`;
  const ids=["style","pies","diameter","hydration","salt","yeast","oil","primary","primaryPct","secondary","secondaryPct","poolishPct","poolishHydration","poolishYeast","poolishTemp","poolishHours","temp","bakeTime","oven","pizzaTemp","homeTemp"];
  ids.forEach(id=>{const e=$("#"+id);if(e)e.onchange=()=>{s[id]=e.type==="number"?num(e.value):e.value;if(id==="style")Object.assign(s,presets[s.style]);render()}});
  $("#poolish").onchange=e=>{s.poolish=e.target.checked;render()};$("#extraDay").onchange=e=>{s.extraDay=e.target.checked;render()};$("#primary").value=s.primary;$("#secondary").value=s.secondary;$("#oven").value=s.oven;$("#print").onclick=()=>print();
}
render(); if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
