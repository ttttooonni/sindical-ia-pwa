"use strict";
(() => {
const $ = s => document.querySelector(s), main = $("#main");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DIAS = {"2026-11-04":"Mié 4","2026-11-05":"Jue 5","2026-11-06":"Vie 6"};
const VISTAS = ["inicio","agenda","ponentes","analisis","fotos","mia"];
const CAPA = {
  expuesto: "Expuesto por el ponente",
  investiga: "Investigación posterior",
  sindical: "Análisis y propuestas sindicales"
};
const foto = n => { const p = D.PONENTES.find(x => x.n === n.replace(/\s*\(.*\)$/, "")); return p && p.f ? `<img class="av" src="${esc(p.f)}" alt="${esc(p.n)}" width="48" height="48" loading="lazy" decoding="async">` : ""; };
const persona = n => `<li class="per">${foto(n)}<span>${esc(n)}</span></li>`;
let D = null, day = "2026-11-04", query = "", lastNow = "";

function loadFavs() {
  try { const v = JSON.parse(localStorage.getItem("sia-favs") || "[]"); return Array.isArray(v) ? v.filter(x => typeof x === "string") : []; }
  catch { return []; }
}
let favs = loadFavs();
const saveFavs = () => { try { localStorage.setItem("sia-favs", JSON.stringify(favs)); } catch {} };

function madrid() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date()).map(x => [x.type, x.value]));
  return {d:`${p.year}-${p.month}-${p.day}`, t:`${p.hour === "24" ? "00" : p.hour}:${p.minute}`};
}
function estado() {
  const n = madrid(), k = n.d + " " + n.t;
  return {
    now: D.SESIONES.find(s => s.d === n.d && s.s <= n.t && n.t < s.e),
    next: D.SESIONES.find(s => s.d + " " + s.s > k)
  };
}
function tick() {
  if (!D) return;
  const {now, next} = estado();
  const txt = now ? `● Ahora: ${now.t}` : next ? `Siguiente: ${DIAS[next.d]} ${next.s} · ${next.t}` : "Jornadas finalizadas";
  if (txt !== lastNow) { $("#now").textContent = txt; lastNow = txt; }
  document.querySelectorAll("article[data-id]").forEach(a => {
    const live = !!now && a.dataset.id === now.id;
    a.classList.toggle("live", live);
    const b = a.querySelector(".livebadge"); if (b) b.hidden = !live;
  });
}
function favBtn(id) { const f = favs.includes(id); return `<button type="button" class="fav" aria-pressed="${f}" data-fav="${id}">${f ? "★ En mi agenda" : "☆ Añadir a mi agenda"}</button>`; }
function tieneFicha(id) { return !!(D.FICHAS && D.FICHAS[id]); }
function fichaLink(id) {
  return tieneFicha(id) ? `<p><a class="ficha-link" href="#ficha/${id}">Abrir ficha de la ponencia</a></p>` : "";
}
function sesion(s) {
  return `<article class="card" data-id="${s.id}"><div class="time">${s.s}–${s.e}${s.est ? ' <span class="est">(fin aprox.)</span>' : ""} <span class="badge ok livebadge" hidden>EN DIRECTO</span></div><h3>${esc(s.t)}</h3>
${s.p.length ? `<p class="lbl"><strong>Ponentes</strong></p><ul class="pers">${s.p.map(persona).join("")}</ul>` : ""}${s.m ? `<p class="lbl meta">Modera</p><ul class="pers">${persona(s.m)}</ul>` : ""}
${s.o ? `<p><strong>Objetivo:</strong> ${esc(s.o)}</p>` : ""}${s.q ? `<p><strong>Pregunta clave:</strong> ${esc(s.q)}</p>` : ""}
${(s.fotos||(s.foto?[s.foto]:[])).map(f=>`<figure class="ses-foto"><img src="${esc(f)}" alt="Foto de la mesa ${esc(s.t)}" width="600" height="400" loading="lazy" decoding="async"></figure>`).join("")}${s.nota ? `<p class="nota"><strong>Contenido de la mesa:</strong> ${esc(s.nota)}</p>` : ""}${fichaLink(s.id)}${s.p.length || s.o ? favBtn(s.id) : ""}</article>`;
}
function ordenFichas() {
  return D.SESIONES.filter(s => tieneFicha(s.id)).map(s => s.id);
}
function bloquesHTML(bls) {
  return (bls || []).map(b => {
    const ps = (b.ps || []).map(p => `<p>${esc(p)}</p>`).join("");
    const ul = (b.ul || []).length ? `<ul>${b.ul.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
    const cita = b.cita ? `<blockquote>${esc(b.cita)}</blockquote>` : "";
    const aviso = b.aviso ? `<p class="aviso">${esc(b.aviso)}</p>` : "";
    const clause = b.clausula ? `<div class="clausula"><span class="badge">Propuesta negociable, no legislación vigente</span><pre>${esc(b.clausula)}</pre></div>` : "";
    const links = (b.links || []).length ? `<ul class="fuentes">${b.links.map(l => `<li><a href="${esc(l.url)}" rel="noopener noreferrer" target="_blank">${esc(l.t)}</a></li>`).join("")}</ul>` : "";
    const capa = CAPA[b.capa] ? b.capa : "investiga";
    return `<div class="capa capa-${capa}"><p class="capa-lbl">${CAPA[capa]}</p>${aviso}${ps}${cita}${ul}${clause}${links}</div>`;
  }).join("");
}
function vistaFicha(id) {
  const f = D.FICHAS && D.FICHAS[id];
  const s = D.SESIONES.find(x => x.id === id);
  if (!f) {
    return `<p class="kicker">Ficha</p><h1>Ponencia no encontrada</h1><p><a href="#agenda">Volver a la agenda</a></p>`;
  }
  const ids = ordenFichas();
  const i = ids.indexOf(id);
  const prev = i > 0 ? D.FICHAS[ids[i - 1]] : null;
  const next = i >= 0 && i < ids.length - 1 ? D.FICHAS[ids[i + 1]] : null;
  const pon = (f.ponentes || []).map(p => `<li class="per">${foto(p.n)}<span><strong>${esc(p.n)}</strong><br><span class="meta">${esc(p.c)}</span></span></li>`).join("");
  const mod = f.modera ? `<p class="lbl meta">Modera</p><ul class="pers"><li class="per">${foto(f.modera.n)}<span><strong>${esc(f.modera.n)}</strong><br><span class="meta">${esc(f.modera.c)}</span></span></li></ul>` : "";
  const fotos = (f.fotos && f.fotos.length ? f.fotos : (s && s.fotos) || []).map(src => `<figure class="ses-foto"><img src="${esc(src)}" alt="${esc(f.fotoNota || f.titulo)}" width="600" height="400" loading="lazy" decoding="async"></figure>`).join("");
  const abiertas = new Set(["contexto", "resumen"]);
  const secciones = (f.secciones || []).map(sec => {
    const open = abiertas.has(sec.id) ? " open" : "";
    return `<details class="ficha-sec card"${open}><summary>${esc(sec.t)}</summary>${bloquesHTML(sec.bloques)}</details>`;
  }).join("");
  return `<p class="kicker">${esc(f.fecha)}</p>
<nav class="ficha-nav" aria-label="Ponencias">${prev ? `<a href="#ficha/${prev.id}">← ${esc(prev.titulo)}</a>` : `<span></span>`}${next ? `<a href="#ficha/${next.id}">${esc(next.titulo)} →</a>` : `<span></span>`}</nav>
<p class="time">${esc(f.horario)}</p>
<h1>${esc(f.titulo)}</h1>
<div class="card">
<p class="lbl"><strong>Ponentes</strong></p>
<ul class="pers">${pon}</ul>
${mod}
${fotos}
${f.fotoNota ? `<p class="nota">${esc(f.fotoNota)}</p>` : ""}
<p><a href="#agenda">Volver a la agenda</a></p>
${favBtn(f.id)}
</div>
${secciones}`;
}
const V = {
  inicio: () => `<p class="kicker">La acción sindical del futuro, ahora</p><h1>SINDICAL-IA</h1><div class="pix" aria-hidden="true">${"<i></i>".repeat(14)}</div>
<p><strong>Jornadas Confederales de Política Sindical y Negociación Colectiva</strong></p>
<div class="card"><p class="time">4 · 5 · 6 NOVIEMBRE 2026</p><p>Salón de Actos UGT<br>Avda. de América, 25 · Madrid</p></div>
<h2>Objetivos</h2><ul>${D.OBJETIVOS.map(o => `<li>${esc(o)}</li>`).join("")}</ul>`,
  agenda: () => `<h1>Agenda</h1><div class="days" role="group" aria-label="Día">${Object.entries(DIAS).map(([d, l]) => `<button type="button" aria-pressed="${d === day}" data-day="${d}">${l} nov</button>`).join("")}</div>
<p class="meta">Horas de fin marcadas «aprox.»: estimadas, el programa no las indica. Cada ponencia tiene una ficha propia con legislación, casos y propuestas de convenio.</p><div id="sl">${D.SESIONES.filter(s => s.d === day).map(sesion).join("")}</div>`,
  ponentes: () => `<h1>Ponentes</h1><label for="q" class="meta">Buscar por nombre, cargo o tema</label><input id="q" type="search" autocomplete="off" placeholder="p. ej. renta básica, Supremo…" value="${esc(query)}"><p id="pc" class="meta" role="status" aria-live="polite"></p><div id="pl"></div><p class="meta">«Según cartel»: dato que solo consta en el programa. «No verificado»: sin fuente revisada.</p><p class="credit">Fotografías recortadas del cartel oficial de las jornadas (UGT).</p>`,
  analisis: () => `<h1>Análisis</h1>${D.ANALISIS.map(a => `<section class="card" aria-labelledby="h-${a.id}"><h2 id="h-${a.id}">${esc(a.t)}</h2><ul>${a.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>`).join("")}`,
  fotos: () => `<h1>Fotos</h1><p class="meta">Imágenes tomadas en el Salón de Actos durante las jornadas.</p>${D.GALERIA.map(g => `<figure class="card gal"><img src="${esc(g.src)}" alt="${esc(g.alt)}" width="600" height="800" loading="lazy" decoding="async"><figcaption><span class="kicker">${DIAS[g.d]} nov</span><br>${esc(g.cap)}${g.s && tieneFicha(g.s) ? ` · <a href="#ficha/${g.s}">Ver ficha</a>` : ""}</figcaption></figure>`).join("")}`,
  mia: () => { const l = D.SESIONES.filter(s => favs.includes(s.id)); return `<h1>Mi agenda</h1>${l.length ? l.map(s => `<p class="kicker">${DIAS[s.d]} nov</p>` + sesion(s)).join("") : '<p class="meta">Pulsa ☆ en la agenda para guardar sesiones aquí.</p>'}<p class="meta">Privacidad: tu agenda se guarda solo en este dispositivo (localStorage). La app no usa cookies, analítica ni recursos externos.</p>`; }
};
function pintaPonentes() {
  const q = query.toLowerCase().trim();
  const l = D.PONENTES.filter(p => [p.n, p.c, p.b, p.v].join(" ").toLowerCase().includes(q));
  $("#pl").innerHTML = l.map(p => `<article class="card"><div class="phead">${p.f ? `<img class="av big" src="${esc(p.f)}" alt="${esc(p.n)}" width="64" height="64" loading="lazy" decoding="async">` : ""}<h2>${esc(p.n)}</h2></div><p class="meta">${esc(p.c)}</p>${p.b ? `<p>${esc(p.b)}</p>` : ""}<span class="badge${p.v === "Verificado" ? " ok" : ""}">${esc(p.v)}</span></article>`).join("") || '<p class="meta">Sin resultados.</p>';
  $("#pc").textContent = `${l.length} ponentes`;
}
function parseHash() {
  const raw = location.hash.slice(1);
  const m = raw.match(/^ficha\/([\w-]+)$/) || raw.match(/^ficha-([\w-]+)$/);
  if (m) return {v: "ficha", id: m[1]};
  return {v: raw};
}
function render(focus = true) {
  const h = parseHash();
  let v = h.v, tab = v;
  if (v === "ficha") {
    const ses = D.SESIONES.find(x => x.id === h.id);
    if (ses && DIAS[ses.d]) day = ses.d;
    main.innerHTML = vistaFicha(h.id);
    tab = "agenda";
    const f = D.FICHAS && D.FICHAS[h.id];
    document.title = `${f ? f.titulo : "Ficha"} · Sindical-IA`;
  } else {
    if (!VISTAS.includes(v)) v = "inicio";
    main.innerHTML = V[v]();
    document.title = `${v === "inicio" ? "Inicio" : main.querySelector("h1").textContent} · Sindical-IA`;
    if (v === "ponentes") { pintaPonentes(); $("#q").addEventListener("input", e => { query = e.target.value; pintaPonentes(); }); }
  }
  document.querySelectorAll(".tabs a").forEach(a => a.dataset.v === tab ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  tick();
  if (focus) main.focus();
}
window.addEventListener("hashchange", () => render());
main.addEventListener("click", e => {
  const d = e.target.closest("[data-day]"), f = e.target.closest("[data-fav]");
  if (d) {
    day = d.dataset.day;
    main.querySelectorAll("[data-day]").forEach(b => b.setAttribute("aria-pressed", b === d));
    const sl = $("#sl");
    if (sl) { sl.innerHTML = D.SESIONES.filter(s => s.d === day).map(sesion).join(""); tick(); }
  }
  if (f) {
    const id = f.dataset.fav;
    favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; saveFavs();
    if (parseHash().v === "mia" && !favs.includes(id)) { render(false); main.querySelector("h1").setAttribute("tabindex", "-1"); main.querySelector("h1").focus(); return; }
    const on = favs.includes(id); f.setAttribute("aria-pressed", on); f.textContent = on ? "★ En mi agenda" : "☆ Añadir a mi agenda";
  }
});
fetch("data.json").then(r => r.json()).then(j => {
  D = j; const n = madrid(); if (DIAS[n.d]) day = n.d;
  render(false); setInterval(tick, 30000);
}).catch(() => { main.innerHTML = "<p>No se han podido cargar los datos. Comprueba la conexión y recarga.</p>"; });

if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!refreshing) { refreshing = true; location.reload(); } });
  navigator.serviceWorker.register("sw.js").then(reg => {
    const show = w => { $("#update").hidden = false; $("#reload").onclick = () => w.postMessage("SKIP_WAITING"); };
    if (reg.waiting && navigator.serviceWorker.controller) show(reg.waiting);
    reg.addEventListener("updatefound", () => { const w = reg.installing; w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) show(w); }); });
    setInterval(() => reg.update(), 60 * 60 * 1000);
  });
}
})();
