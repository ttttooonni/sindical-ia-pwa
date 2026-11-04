const $=s=>document.querySelector(s),main=$("#main");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let favs=JSON.parse(localStorage.getItem("sia-favs")||"[]"),day="2026-11-04";
const DIAS={"2026-11-04":"Mié 4","2026-11-05":"Jue 5","2026-11-06":"Vie 6"};
function madrid(){const p=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date()).map(x=>[x.type,x.value]));return{d:`${p.year}-${p.month}-${p.day}`,t:`${p.hour==="24"?"00":p.hour}:${p.minute}`}}
const key=s=>s.d+" "+s.s;
function estado(){const n=madrid(),k=n.d+" "+n.t;const now=SESIONES.find(s=>s.d===n.d&&s.s<=n.t&&n.t<s.e);const next=SESIONES.find(s=>key(s)>k);return{now,next}}
function pintaAhora(){const{now,next}=estado();$("#now").textContent=now?`● Ahora: ${now.t}`:next?`Siguiente: ${DIAS[next.d]} ${next.s} · ${next.t}`:"Jornadas finalizadas"}
function sesion(s){const{now}=estado(),f=favs.includes(s.id);return`<article class="card${now&&now.id===s.id?" live":""}"><div class="time">${s.s}–${s.e}${now&&now.id===s.id?' <span class="badge ok">EN DIRECTO</span>':""}</div><h3>${esc(s.t)}</h3>
${s.p.length?`<p><strong>Ponentes:</strong> ${s.p.map(esc).join(", ")}</p>`:""}${s.m?`<p class="meta">Modera: ${esc(s.m)}</p>`:""}
${s.o?`<p><strong>Objetivo:</strong> ${esc(s.o)}</p>`:""}${s.q?`<p><strong>Pregunta clave:</strong> ${esc(s.q)}</p>`:""}
${s.p.length||s.o?`<button class="fav" aria-pressed="${f}" data-fav="${s.id}">${f?"★ En mi agenda":"☆ Añadir a mi agenda"}</button>`:""}</article>`}
const V={
inicio:()=>`<p class="kicker">La acción sindical del futuro, ahora</p><h1>SINDICAL-IA</h1><div class="pix" aria-hidden="true">${"<i></i>".repeat(14)}</div>
<p><strong>Jornadas Confederales de Política Sindical y Negociación Colectiva</strong></p>
<div class="card"><p class="time">4 · 5 · 6 NOVIEMBRE 2026</p><p>Salón de Actos UGT<br>Avda. de América, 25 · Madrid</p></div>
<h2>Objetivos</h2><ul>${OBJETIVOS.map(o=>`<li>${esc(o)}</li>`).join("")}</ul>`,
agenda:()=>`<h2>Agenda</h2><div class="days" role="tablist">${Object.entries(DIAS).map(([d,l])=>`<button role="tab" aria-selected="${d===day}" data-day="${d}">${l} nov</button>`).join("")}</div>${SESIONES.filter(s=>s.d===day).map(sesion).join("")}`,
ponentes:()=>`<h2>Ponentes</h2><label for="q" class="meta">Buscar por nombre, cargo o tema</label><input id="q" type="search" placeholder="p. ej. renta básica, Supremo…"><div id="pl"></div><p class="meta">«Según cartel»: dato que solo consta en el programa. «No verificado»: no hemos revisado ninguna fuente.</p>`,
analisis:()=>`<h2>Análisis</h2>${Object.entries(ANALISIS).map(([k,v])=>`<section class="card"><h3>${k}</h3><ul>${v.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`).join("")}`,
mia:()=>{const l=SESIONES.filter(s=>favs.includes(s.id));return`<h2>Mi agenda</h2>${l.length?l.map(s=>`<p class="kicker">${DIAS[s.d]} nov</p>`+sesion(s)).join(""):'<p class="meta">Pulsa ☆ en la agenda para guardar sesiones aquí. Se guardan en este dispositivo.</p>'}`}};
function ponentes(q=""){q=q.toLowerCase();$("#pl").innerHTML=PONENTES.filter(p=>p.join(" ").toLowerCase().includes(q)).map(([n,c,b,v])=>`<article class="card"><h3>${esc(n)}</h3><p class="meta">${esc(c)}</p>${b?`<p>${esc(b)}</p>`:""}<span class="badge${v==="Verificado"?" ok":""}">${esc(v)}</span></article>`).join("")||'<p class="meta">Sin resultados.</p>'}
function go(v){if(!V[v])v="inicio";main.innerHTML=V[v]();document.querySelectorAll(".tabs button").forEach(b=>b.dataset.v===v?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current"));if(v==="ponentes"){ponentes();$("#q").addEventListener("input",e=>ponentes(e.target.value))}if(location.hash!=="#"+v)history.replaceState(null,"","#"+v)}
document.querySelector(".tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(b){go(b.dataset.v);main.focus()}});
main.addEventListener("click",e=>{const d=e.target.closest("[data-day]"),f=e.target.closest("[data-fav]");if(d){day=d.dataset.day;go("agenda")}if(f){const id=f.dataset.fav;favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];localStorage.setItem("sia-favs",JSON.stringify(favs));go(location.hash.slice(1))}});
const n=madrid();if(DIAS[n.d])day=n.d;
go(location.hash.slice(1));pintaAhora();setInterval(pintaAhora,30000);
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
