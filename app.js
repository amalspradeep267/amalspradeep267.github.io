(() => {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, html = "") => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (html) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVG = "http://www.w3.org/2000/svg";

  /* ---------- Content ---------- */
  const p = S.profile;
  $("#hudName").textContent = p.shortName;
  $("#hudNumber").textContent = "#" + p.number;
  $("#hudStatus").textContent = p.status;
  $("#eyebrow").textContent = p.eyebrow;
  const [first, ...rest] = p.name.split(" ");
  $("#heroName").innerHTML = `${esc(first)}<span>${esc(rest.join(" "))}</span>`;
  $("#heroRole").textContent = p.role;
  $("#heroTagline").textContent = p.tagline;
  $("#facts").innerHTML = p.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");

  const buttons = (primaryLabel) => {
    const out = [];
    if (p.email) out.push(`<a class="btn btn--primary" href="mailto:${esc(p.email)}">${esc(primaryLabel)}</a>`);
    if (p.resumeUrl) out.push(`<a class="btn" href="${esc(p.resumeUrl)}" target="_blank" rel="noopener">Resume</a>`);
    for (const l of S.links) out.push(`<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`);
    return out.join("");
  };
  $("#cta").innerHTML = buttons("Get in touch");

  // Experience tower
  $("#tower").innerHTML = S.experience.map((e, i) => `
    <li class="reveal">
      <div class="tower__pos">P${i + 1}</div>
      <div class="tower__body">
        <div class="tower__head">
          <div><p class="tower__role">${esc(e.role)}</p><p class="tower__org">${esc(e.org)}</p></div>
          <span class="tower__date">${esc(e.date)}</span>
        </div>
        <ul>${e.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>
      </div>
    </li>`).join("");

  // Setup sheet
  $("#setup").innerHTML = S.skills.map((g, i) => `
    <div class="setup__card reveal" data-code="S-0${i + 1}">
      <h3>${esc(g.group)}</h3>
      <ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
    </div>`).join("");

  // Education
  $("#edu").innerHTML = S.education.map((e) => `
    <div class="edu__card reveal">
      <span class="edu__date">${esc(e.date)}</span>
      <h3>${esc(e.degree)}</h3>
      <p>${esc(e.school)}</p>
      <p class="edu__detail">${esc(e.detail)}</p>
    </div>`).join("");

  // Contact
  $("#radio").innerHTML = `
    <div class="radio__label"><span class="wave">${"<i></i>".repeat(9)}</span> RADIO · ${esc(p.shortName)} #${esc(p.number)}</div>
    <h3>${esc(S.contact.heading)}</h3>
    <p>${esc(S.contact.body)}</p>
    <div class="cta">${buttons("Email me")}</div>`;

  $("#footer").innerHTML = `<span>© ${new Date().getFullYear()} ${esc(p.name)}</span><span>Keys 0–6 change gear · ↑↓ to scroll</span>`;

  /* ---------- Start lights (once per session) ---------- */
  const lights = $("#lights");
  let seen = false;
  try { seen = sessionStorage.getItem("lightsOut") === "1"; } catch (e) {}
  const finishLights = () => {
    lights.classList.add("is-done");
    document.body.classList.add("is-racing");
    try { sessionStorage.setItem("lightsOut", "1"); } catch (e) {}
  };
  if (matchMedia("(hover: none)").matches) $(".lights__hint", lights).textContent = "Tap to skip";
  if (seen || reduced) {
    lights.classList.add("is-done");
  } else {
    const bulbs = [...lights.querySelectorAll(".lights__gantry span")];
    let timers = bulbs.map((b, i) => setTimeout(() => b.classList.add("on"), 300 + i * 420));
    timers.push(setTimeout(() => { bulbs.forEach((b) => b.classList.remove("on")); finishLights(); }, 300 + bulbs.length * 420 + 450 + Math.random() * 400));
    const skip = () => { timers.forEach(clearTimeout); finishLights(); };
    addEventListener("keydown", skip, { once: true });
    lights.addEventListener("click", skip, { once: true });
  }

  /* ---------- Clock ---------- */
  const clock = $("#clock");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false }); };
  tick(); setInterval(tick, 1000);

  /* ---------- Hero track car ---------- */
  const track = $("#trackPath");
  const car = $("#trackCar");
  const trackSvg = track.ownerSVGElement;
  const line = document.createElementNS(SVG, "path");
  line.setAttribute("d", track.getAttribute("d"));
  line.setAttribute("class", "racing-line");
  trackSvg.insertBefore(line, car);
  const trail = document.createElementNS(SVG, "path");
  trail.setAttribute("d", track.getAttribute("d"));
  trail.setAttribute("class", "trail");
  trackSvg.insertBefore(trail, car);
  const L = track.getTotalLength();
  const trailLen = L * 0.08;
  trail.style.strokeDasharray = `${trailLen} ${L}`;
  const place = (d) => {
    const pt = track.getPointAtLength(d % L);
    car.setAttribute("cx", pt.x); car.setAttribute("cy", pt.y);
    trail.style.strokeDashoffset = String(-((d % L) - trailLen));
  };
  if (reduced) place(L * 0.3);
  else {
    const lap = 9000;
    const run = (t) => { place(((t % lap) / lap) * L); requestAnimationFrame(run); };
    requestAnimationFrame(run);
  }

  /* ---------- Dials ---------- */
  const START = 135, SWEEP = 270, R = 80, CX = 100, CY = 100;
  const polar = (deg, r) => { const a = (deg * Math.PI) / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
  const arcPath = (r) => {
    const [x1, y1] = polar(START, r), [x2, y2] = polar(START + SWEEP, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  };
  const arcLen = (2 * Math.PI * R * SWEEP) / 360;
  const dialsHost = $("#dials");
  S.telemetry.forEach((m) => {
    const frac = Math.min(m.value / m.max, 1);
    let ticks = "";
    for (let i = 0; i <= 40; i++) {
      const major = i % 10 === 0;
      const deg = START + (SWEEP * i) / 40;
      const [x1, y1] = polar(deg, major ? 62 : 66), [x2, y2] = polar(deg, 71);
      ticks += `<line class="tick${major ? " tick--major" : ""}" data-f="${i / 40}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    const [sx, sy] = polar(START, 50), [ex, ey] = polar(START + SWEEP, 50);
    const card = el("div", { class: "dial reveal" }, `
      <svg viewBox="0 0 200 200" role="img" aria-label="${esc(m.label)}: ${m.value}${esc(m.unit)}">
        <circle class="ring" cx="100" cy="100" r="96"/>
        <path class="track" d="${arcPath(R)}"/>
        <path class="fill" d="${arcPath(R)}" style="stroke-dasharray:${arcLen};stroke-dashoffset:${arcLen}"/>
        ${ticks}
        <text class="scale" x="${sx}" y="${sy + 4}" text-anchor="middle">0</text>
        <text class="scale" x="${ex}" y="${ey + 4}" text-anchor="middle">${m.max}</text>
        <text class="value" x="100" y="106" text-anchor="middle">0</text>
        <text class="unit" x="100" y="128" text-anchor="middle">${esc(m.unit || "")}</text>
      </svg>
      <p class="dial__label">${esc(m.label)}</p>
      <p class="dial__src">${esc(m.source)}</p>`);
    card._run = () => {
      card.querySelector(".fill").style.strokeDashoffset = String(arcLen * (1 - frac));
      card.querySelectorAll(".tick").forEach((t) => { if (+t.dataset.f <= frac) t.classList.add("is-lit"); });
      const out = card.querySelector(".value");
      const dec = m.decimals || 0;
      if (reduced) { out.textContent = m.value.toFixed(dec); return; }
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
        out.textContent = (m.value * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    dialsHost.appendChild(card);
  });
  // Shared gradient for the dial fills
  const defs = el("div", {}, `<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="dialGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7a0400"/><stop offset=".6" stop-color="#e10600"/><stop offset="1" stop-color="#ff5a3c"/></linearGradient></defs></svg>`);
  document.body.appendChild(defs.firstChild);

  /* ---------- Projects wheel ---------- */
  const projects = S.projects;
  const N = projects.length;
  const STEP = 360 / N;
  const wheelSec = $("#projects");
  const wheelHost = $("#wheel");
  const panel = $("#panel");
  const stint = $("#stint");

  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = i * 72;
    return [-8, 8].map((o) => `<g transform="rotate(${a + o})"><path class="spoke" d="M -7 -74 L -13 -346 L 13 -346 L 7 -74 Z"/></g>`).join("");
  }).join("");
  const sidewall = `${p.name} · ${p.role} · `.toUpperCase().repeat(3);
  const badges = projects.map((pr, i) => `
    <g class="badge" data-i="${i}" transform="rotate(${-i * STEP}) translate(410 0)">
      <g class="badge__up"><circle r="40"/><text>${String(i + 1).padStart(2, "0")}</text></g>
    </g>`).join("");
  wheelHost.innerHTML = `
    <svg viewBox="-520 -520 1040 1040" aria-hidden="true">
      <defs><path id="sidewallPath" d="M -425 0 A 425 425 0 1 1 425 0 A 425 425 0 1 1 -425 0"/></defs>
      <g id="wheelRot">
        <circle class="tyre" r="470"/>
        <circle class="tyre-edge" r="468"/>
        <text class="sidewall"><textPath href="#sidewallPath">${esc(sidewall)}</textPath></text>
        <circle class="band" r="378"/>
        <circle class="rim" r="358"/>
        ${spokes}
        <circle class="hub" r="78"/>
        <polygon class="nut" points="0,-34 29,-17 29,17 0,34 -29,17 -29,-17"/>
        ${badges}
      </g>
      <polygon class="pointer" points="492,0 516,-16 516,16"/>
    </svg>`;
  const rot = $("#wheelRot", wheelHost);
  const badgeEls = [...wheelHost.querySelectorAll(".badge")];
  stint.innerHTML = `<span id="stintText">STINT 1/${N}</span><span class="stint__bars">${"<i></i>".repeat(N)}</span>`;
  const bars = [...stint.querySelectorAll(".stint__bars i")];

  const renderPanel = (i) => {
    const pr = projects[i];
    panel.innerHTML = `
      <div class="panel__top"><span class="panel__num">${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}</span><span>${esc(pr.date)}</span></div>
      <h3>${esc(pr.name)}</h3>
      <p class="panel__kind">${esc(pr.kind)}</p>
      ${pr.image ? `<div class="panel__media" role="img" aria-label="${esc(pr.name)}" style="background-image:url('${esc(pr.image)}')"></div>` : ""}
      <p class="panel__desc">${esc(pr.description)}</p>
      <div class="tags">${pr.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="panel__row">
        ${pr.metric ? `<div class="metric"><b>${esc(pr.metric.value)}</b><span>${esc(pr.metric.label)}</span></div>` : "<span></span>"}
        <div class="panel__links">${(pr.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>
      </div>`;
    panel.classList.remove("is-swap"); void panel.offsetWidth; panel.classList.add("is-swap");
    badgeEls.forEach((b, j) => b.classList.toggle("is-focus", j === i));
    bars.forEach((b, j) => { b.classList.toggle("is-done", j < i); b.classList.toggle("is-now", j === i); });
    $("#stintText").textContent = `STINT ${i + 1}/${N}`;
  };

  const sizeWheelSection = () => { wheelSec.style.height = `${N * 80 + 20}svh`; };
  sizeWheelSection();

  let current = -1, target = 0, shown = 0;
  const progress = () => {
    const r = wheelSec.getBoundingClientRect();
    const span = wheelSec.offsetHeight - innerHeight;
    return Math.min(Math.max(-r.top / span, 0), 1);
  };
  const setAngle = (deg) => {
    rot.setAttribute("transform", `rotate(${deg})`);
    // keep badge numbers upright
    badgeEls.forEach((b, i) => b.querySelector(".badge__up").setAttribute("transform", `rotate(${i * STEP - deg})`));
  };
  const update = () => {
    const prog = progress();
    target = prog * (N - 1) * STEP;
    const idx = Math.round(prog * (N - 1));
    if (idx !== current) { current = idx; renderPanel(idx); }
  };
  const animate = () => {
    shown += (target - shown) * (reduced ? 1 : 0.14);
    if (Math.abs(target - shown) < 0.01) shown = target;
    setAngle(shown);
    requestAnimationFrame(animate);
  };
  update(); setAngle(0); requestAnimationFrame(animate);
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", () => { sizeWheelSection(); update(); });

  const scrollToProject = (i) => {
    const span = wheelSec.offsetHeight - innerHeight;
    scrollTo({ top: wheelSec.offsetTop + (span * i) / (N - 1), behavior: reduced ? "auto" : "smooth" });
  };
  badgeEls.forEach((b) => b.addEventListener("click", () => scrollToProject(+b.dataset.i)));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      if (en.target._run) en.target._run();
      io.unobserve(en.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

  /* ---------- Gears, lap counter, keyboard ---------- */
  const sections = [...document.querySelectorAll("main > section")];
  const gearLinks = [...document.querySelectorAll(".gears a")];
  $("#lapTotal").textContent = sections.length;
  const setGear = () => {
    const mid = innerHeight * 0.4;
    let active = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) active = i; });
    gearLinks.forEach((a, i) => a.classList.toggle("is-active", i === active));
    $("#lapNum").textContent = active + 1;
    $("#lapName").textContent = sections[active].dataset.name;
  };
  setGear();
  addEventListener("scroll", setGear, { passive: true });

  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[0-6]$/.test(e.key)) sections[+e.key]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  });
})();
