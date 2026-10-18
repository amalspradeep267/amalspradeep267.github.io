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

  const emails = p.emails || [];
  const buttons = (primaryLabel) => {
    const out = [];
    if (emails[0]) out.push(`<a class="btn btn--primary" href="mailto:${esc(emails[0])}">${esc(primaryLabel)}</a>`);
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
    <ul class="radio__emails">${emails.map((m) => `<li><a href="mailto:${esc(m)}">${esc(m)}</a></li>`).join("")}</ul>
    <div class="cta">${buttons("Email me")}</div>`;

  $("#footer").innerHTML = `<span>© ${new Date().getFullYear()} ${esc(p.name)}</span><span>Keys 0–6 change gear · ↑↓ to scroll</span>`;

  /* ---------- Start lights (once per session) ---------- */
  const lights = $("#lights");
  let seen = false, lightsDoneAt = -1e9;
  try { seen = sessionStorage.getItem("lightsOut") === "1"; } catch (e) {}
  const finishLights = () => {
    lights.classList.add("is-done");
    lightsDoneAt = performance.now();
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

  /* ---------- Instrument cluster (Telemetry) ---------- */
  const A0 = 135, SWEEP = 270;                                   // scale runs from 7:30 round to 4:30
  const pt = (deg, r) => { const a = (deg * Math.PI) / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
  const arcD = (r, a0, a1) => {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  // Shared gradients for pods and wheel
  document.body.insertAdjacentHTML("beforeend", `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="bezelGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2c31"/><stop offset=".5" stop-color="#0d0e10"/><stop offset="1" stop-color="#1a1b1f"/></linearGradient>
      <linearGradient id="chromeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dbe0"/><stop offset=".35" stop-color="#4a4d55"/><stop offset=".65" stop-color="#9a9da5"/><stop offset="1" stop-color="#2a2c31"/></linearGradient>
      <radialGradient id="faceDark" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#17191d"/><stop offset=".75" stop-color="#08090a"/><stop offset="1" stop-color="#030304"/></radialGradient>
      <radialGradient id="faceTrack" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#d0141c"/><stop offset=".7" stop-color="#8e0a10"/><stop offset="1" stop-color="#4a0407"/></radialGradient>
    </defs></svg>`);

  const podSvg = (m) => {
    const span = m.max - m.min;
    let ticks = "", nums = "";
    const minor = 48;
    for (let i = 0; i <= minor; i++) {
      const [x1, y1] = pt(A0 + (SWEEP * i) / minor, 88), [x2, y2] = pt(A0 + (SWEEP * i) / minor, 94);
      ticks += `<line class="pod__tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    for (let v = m.min; v <= m.max + 1e-9; v += m.step) {
      const a = A0 + (SWEEP * (v - m.min)) / span;
      const [x1, y1] = pt(a, 82), [x2, y2] = pt(a, 95), [tx, ty] = pt(a, 68);
      ticks += `<line class="pod__tick pod__tick--major" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      nums += `<text class="pod__num" x="${tx}" y="${ty}">${+v.toFixed(2)}</text>`;
    }
    return `
      <svg viewBox="-120 -120 240 240" role="img" aria-label="${esc(m.label)}: ${m.value} ${esc(m.unit || "")}">
        <circle r="118" fill="url(#bezelGrad)"/>
        <circle r="110" fill="none" stroke="url(#chromeGrad)" stroke-width="3"/>
        <circle class="pod__face" r="106"/>
        <path class="pod__sweep" d="${arcD(99, A0, A0 + 0.01)}"/>
        ${ticks}${nums}
        <text class="pod__value" x="0" y="48">${(m.min).toFixed(m.decimals || 0)}</text>
        <text class="pod__unit" x="0" y="68">${esc(m.unit || "")}</text>
        <g class="pod__needle"><path d="M -16 -2.2 L 92 -0.7 L 92 0.7 L -16 2.2 Z"/></g>
        <circle class="pod__hub" r="9"/>
        <ellipse class="pod__glass" cx="-26" cy="-58" rx="70" ry="34" transform="rotate(-24)"/>
      </svg>`;
  };

  const tele = S.telemetry;
  const mainIdx = Math.max(0, tele.findIndex((m) => m.main));
  const left = [], right = [];
  tele.filter((_, i) => i !== mainIdx).forEach((m, i) => (i % 2 ? right : left).push(m));
  const ordered = [...left.slice().reverse(), tele[mainIdx], ...right];
  const clusterHost = $("#dials");
  ordered.forEach((m, k) => {
    const dist = Math.abs(k - left.length);
    const pod = el("div", { class: `pod reveal ${dist === 0 ? "pod--main pod--track" : dist === 1 ? "pod--near" : "pod--far"}` },
      `${podSvg(m)}<p class="pod__label">${esc(m.label)}</p><p class="pod__detail">${esc(m.detail || "")}</p>`);
    if (dist !== 0 && matchMedia("(hover: hover)").matches) {
      pod.addEventListener("mouseenter", () => pod.classList.add("pod--track"));
      pod.addEventListener("mouseleave", () => pod.classList.remove("pod--track"));
    }
    pod._run = () => {
      const needle = pod.querySelector(".pod__needle"), sweep = pod.querySelector(".pod__sweep");
      const out = pod.querySelector(".pod__value");
      const frac = Math.min(Math.max((m.value - m.min) / (m.max - m.min), 0), 1);
      const dec = m.decimals || 0;
      const draw = (e) => {
        const a = A0 + SWEEP * frac * e;
        needle.setAttribute("transform", `rotate(${a})`);
        sweep.setAttribute("d", arcD(99, A0, Math.max(a, A0 + 0.01)));
        out.textContent = (m.min + (m.value - m.min) * e).toFixed(dec);
      };
      if (reduced) return draw(1);
      const t0 = performance.now(), dur = 1900;
      const step = (t) => {
        const k2 = Math.min((t - t0) / dur, 1);
        const e = k2 < 1 ? 1 - Math.pow(1 - k2, 3) + Math.sin(k2 * Math.PI) * 0.04 : 1;   // slight overshoot, like a sweeping needle
        draw(Math.min(e, 1.03));
        if (k2 < 1) requestAnimationFrame(step); else draw(1);
      };
      needle.setAttribute("transform", `rotate(${A0})`);
      requestAnimationFrame(step);
    };
    pod.querySelector(".pod__needle").setAttribute("transform", `rotate(${A0})`);
    clusterHost.appendChild(pod);
  });

  /* ---------- Projects wheel ---------- */
  const projects = S.projects;
  const N = projects.length;
  const STEP = 360 / N;
  const wheelSec = $("#projects");
  const wheelHost = $("#wheel");
  const panel = $("#panel");
  const stint = $("#stint");

  // Front wheel of a faded F1 car. Units: wheel radius 472 ≈ 360 mm, so 1 mm ≈ 1.31 units.
  // The car faces left; the front axle is at (0, 0) and the ground at y = 472.
  const MM = 1.31;
  const X = (mm) => (mm * MM).toFixed(1);                 // mm behind the front axle
  const Y = (h) => (472 - h * MM).toFixed(1);             // h = mm above the ground
  const P = (pts) => pts.map(([x, h], i) => `${i ? "L" : "M"} ${X(x)} ${Y(h)}`).join(" ") + " Z";
  const carSvg = `
    <g class="car">
      <ellipse class="car__shadow" cx="${X(1900)}" cy="${Y(0)}" rx="${X(3400)}" ry="34"/>
      <!-- floor and plank -->
      <path class="car__body" d="${P([[1400, 70], [4300, 70], [4400, 40], [1450, 30], [1300, 50]])}"/>
      <!-- sidepod, engine cover, airbox -->
      <path class="car__body" d="${P([[1550, 300], [1650, 640], [2150, 700], [2250, 860], [2350, 1010], [2560, 1000],
                                       [3000, 860], [3600, 720], [4200, 560], [4450, 470], [4450, 300], [4100, 260],
                                       [3500, 280], [3300, 380], [2900, 300], [1900, 280]])}"/>
      <path class="car__dark" d="${P([[1600, 340], [1680, 620], [1760, 600], [1700, 360]])}"/>
      <!-- shark fin -->
      <path class="car__fin" d="${P([[2700, 980], [4300, 820], [4300, 640], [2900, 860]])}"/>
      <!-- rear wing, beam wing and endplate -->
      <path class="car__body" d="${P([[4250, 960], [4950, 1000], [4960, 900], [4300, 880]])}"/>
      <path class="car__body" d="${P([[4350, 860], [4900, 890], [4910, 830], [4360, 820]])}"/>
      <path class="car__body" d="${P([[4400, 520], [4880, 540], [4880, 500], [4400, 490]])}"/>
      <path class="car__plate" d="${P([[4880, 1010], [4980, 1010], [4980, 330], [4880, 360]])}"/>
      <!-- rear wheel -->
      <g class="cw" data-x="${X(3600)}" transform="translate(${X(3600)} 0)"><circle r="472" class="car__tyre"/><circle r="392" class="car__stripe"/><circle r="300" class="car__rim"/><path class="car__spokes" d="M 0 -280 V -120 M 0 280 V 120 M -280 0 H -120 M 280 0 H 120"/><circle r="60" class="car__hub"/></g>
      <!-- monocoque and nose -->
      <path class="car__body" d="${P([[-1050, 250], [-700, 330], [-300, 420], [100, 500], [600, 580], [1200, 660],
                                       [1450, 720], [1600, 720], [1700, 660], [1700, 300], [1100, 260], [400, 240],
                                       [-200, 210], [-800, 180], [-1050, 190]])}"/>
      <!-- livery pinstripe -->
      <path class="car__livery" d="M ${X(-1000)} ${Y(225)} L ${X(0)} ${Y(440)} L ${X(1200)} ${Y(600)} L ${X(1650)} ${Y(610)} L ${X(3000)} ${Y(560)} L ${X(4300)} ${Y(430)}"/>
      <!-- halo and driver -->
      <circle class="car__helmet" cx="${X(1900)}" cy="${Y(860)}" r="${X(125)}"/>
      <path class="car__halo" d="M ${X(1450)} ${Y(720)} Q ${X(1520)} ${Y(960)} ${X(1800)} ${Y(965)} L ${X(2180)} ${Y(950)} Q ${X(2260)} ${Y(900)} ${X(2240)} ${Y(760)}"/>
      <path class="car__arm" d="M ${X(1350)} ${Y(760)} L ${X(1300)} ${Y(840)}"/>
      <rect class="car__body" x="${X(1220)}" y="${Y(880)}" width="${X(160)}" height="${X(55)}" rx="10"/>
      <!-- front suspension -->
      <path class="car__arm" d="M 0 -40 L ${X(650)} ${Y(560)} M 0 40 L ${X(700)} ${Y(330)} M 0 0 L ${X(800)} ${Y(470)}"/>
      <!-- front wheel -->
      <g class="cw" data-x="0" transform="translate(0 0)"><circle r="472" class="car__tyre"/><circle r="392" class="car__stripe"/><circle r="300" class="car__rim"/><path class="car__spokes" d="M 0 -280 V -120 M 0 280 V 120 M -280 0 H -120 M 280 0 H 120"/><circle r="60" class="car__hub"/></g>
      <!-- front wing: endplate and three elements -->
      <path class="car__body" d="${P([[-1080, 80], [-560, 110], [-560, 140], [-1080, 120]])}"/>
      <path class="car__body" d="${P([[-1020, 150], [-640, 190], [-650, 215], [-1020, 175]])}"/>
      <path class="car__body" d="${P([[-960, 215], [-700, 265], [-715, 285], [-965, 235]])}"/>
      <path class="car__plate" d="${P([[-1110, 40], [-1040, 40], [-1010, 300], [-1090, 290]])}"/>
    </g>`;

  // Seeded scatter for rubber marbles on the shoulder
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const marbles = Array.from({ length: 46 }, () => {
    const a = rnd() * 360, r = 452 + rnd() * 16, [x, y] = pt(a, r);
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(2 + rnd() * 5).toFixed(1)}" ry="${(1.5 + rnd() * 3).toFixed(1)}" transform="rotate(${(a + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }).join("");
  const fasteners = Array.from({ length: 5 }, (_, i) => { const [x, y] = pt(i * 72 + 18, 248); return `<circle cx="${x}" cy="${y}" r="8"/>`; }).join("");
  const badges = projects.map((pr, i) => `
    <g class="badge" data-i="${i}" transform="rotate(${-i * STEP}) translate(342 0)">
      <g class="badge__up"><circle r="30"/><text>${String(i + 1).padStart(2, "0")}</text></g>
    </g>`).join("");
  const topText = p.name.toUpperCase();
  const bottomText = p.role.split(" ")[0].toUpperCase();
  const [vx, vy] = pt(-28, 304);
  wheelHost.innerHTML = `
    <svg viewBox="-520 -520 1040 1040" aria-hidden="true">
      <defs>
        <radialGradient id="tyreShade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="472">
          <stop offset=".63" stop-color="#030303"/><stop offset=".67" stop-color="#0d0d0e"/><stop offset=".76" stop-color="#19191b"/>
          <stop offset=".84" stop-color="#1e1e20"/><stop offset=".91" stop-color="#141415"/><stop offset=".97" stop-color="#0a0a0b"/><stop offset="1" stop-color="#030303"/>
        </radialGradient>
        <linearGradient id="lightDir" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/>
          <stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
        </linearGradient>
        <linearGradient id="lipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#9ea2aa"/><stop offset=".3" stop-color="#3a3d43"/><stop offset=".55" stop-color="#6f737b"/><stop offset="1" stop-color="#1c1d21"/>
        </linearGradient>
        <radialGradient id="coverSheen" cx=".32" cy=".28" r=".75">
          <stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
        </radialGradient>
        <radialGradient id="nutGrad" cx=".35" cy=".3" r=".8">
          <stop offset="0" stop-color="#eef77a"/><stop offset=".45" stop-color="#b9c933"/><stop offset="1" stop-color="#4d5509"/>
        </radialGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7dade"/><stop offset=".5" stop-color="#6a6e76"/><stop offset="1" stop-color="#2a2c31"/></linearGradient>
        <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#0e0f12"/></linearGradient>
        <linearGradient id="carFade" gradientUnits="userSpaceOnUse" x1="-1500" y1="0" x2="6600" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".22" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/>
        </linearGradient>
        <mask id="carMask" maskUnits="userSpaceOnUse" x="-2000" y="-1200" width="9000" height="2000"><rect x="-2000" y="-1200" width="9000" height="2000" fill="url(#carFade)"/></mask>
        <pattern id="carbon" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#0e0f11"/><rect width="7" height="7" fill="#17181b"/><rect x="7" y="7" width="7" height="7" fill="#17181b"/>
          <path d="M0 3.5 H7 M7 10.5 H14" stroke="#1d1f23" stroke-width="1"/>
        </pattern>
        <filter id="rubber" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" seed="7"/>
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
        <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="emboss" x="-5%" y="-5%" width="110%" height="110%">
          <feOffset dx="-1.2" dy="-1.2" in="SourceAlpha" result="hi"/><feFlood flood-color="#fff" flood-opacity=".09"/><feComposite in2="hi" operator="in" result="hiC"/>
          <feOffset dx="1.5" dy="1.5" in="SourceAlpha" result="lo"/><feFlood flood-color="#000" flood-opacity=".8"/><feComposite in2="lo" operator="in" result="loC"/>
          <feMerge><feMergeNode in="loC"/><feMergeNode in="hiC"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <path id="topArc" d="${arcD(380, 202, 338)}"/>
        <path id="botArc" d="M ${pt(158, 426).join(" ")} A 426 426 0 0 0 ${pt(22, 426).join(" ")}"/>
        <path id="sizeArc" d="${arcD(328, -40, 40)}"/>
        <path id="sizeArc2" d="${arcD(328, 140, 220)}"/>
        <clipPath id="tyreClip"><circle r="472"/></clipPath>
      </defs>


      <g id="wheelRot">
        <!-- tyre -->
        <circle r="472" fill="url(#tyreShade)"/>
        <path class="stripe" d="${arcD(392, -50, 50)}"/>
        <path class="stripe" d="${arcD(392, 130, 230)}"/>
        <path class="stripe-edge" d="${arcD(383, -50, 50)} ${arcD(401, -50, 50)} ${arcD(383, 130, 230)} ${arcD(401, 130, 230)}"/>
        <g filter="url(#emboss)">
          <text class="wall-text"><textPath href="#topArc" startOffset="50%" text-anchor="middle">${esc(topText)}</textPath></text>
          <text class="wall-text wall-text--sm"><textPath href="#botArc" startOffset="50%" text-anchor="middle">${esc(bottomText)}</textPath></text>
          <text class="wall-mould"><textPath href="#sizeArc" startOffset="50%" text-anchor="middle">305/720 R18 · FRONT</textPath></text>
          <text class="wall-mould"><textPath href="#sizeArc2" startOffset="50%" text-anchor="middle">ROTATION ▸ · MS ROBOTICS</textPath></text>
        </g>
        <g class="marbles">${marbles}</g>
        <circle r="472" fill="#fff" filter="url(#rubber)"/>
        <!-- bead seat and machined rim lip -->
        <circle r="306" fill="#020202"/>
        <circle r="300" fill="#08090a"/>
        <circle r="293" fill="none" stroke="#2c2e33" stroke-width="12"/>
        <circle r="287" fill="none" stroke="#55585f" stroke-width="1.5"/>
        <rect x="${vx - 5}" y="${vy - 9}" width="10" height="18" rx="3" fill="url(#steel)" transform="rotate(62 ${vx} ${vy})"/>
        <!-- carbon wheel cover -->
        <circle r="282" fill="url(#carbon)"/>
        <circle r="282" fill="none" stroke="#000" stroke-width="5" opacity=".7"/>
        <circle r="232" fill="none" stroke="#08090a" stroke-width="3"/>
        <circle r="234" fill="none" stroke="#2a2c31" stroke-width="1"/>
        <g fill="url(#steel)">${fasteners}</g>
        <!-- hub and centre-lock nut -->
        <circle r="98" fill="#030304"/>
        <circle r="86" fill="#141518" stroke="#2c2e33" stroke-width="3"/>
        <polygon points="0,-56 48.5,-28 48.5,28 0,56 -48.5,28 -48.5,-28" fill="url(#nutGrad)" stroke="#2f3507" stroke-width="2"/>
        <circle r="30" fill="#141516" stroke="#5c6113" stroke-width="2"/>
        <circle r="13" fill="url(#steel)"/>
        <rect x="-5" y="-78" width="10" height="26" rx="3" fill="url(#steel)"/>
        ${badges}
      </g>

      <!-- fixed studio lighting over the whole wheel -->
      <circle r="472" fill="url(#lightDir)" pointer-events="none"/>
      <circle r="282" fill="url(#coverSheen)" pointer-events="none"/>
      <path d="${arcD(462, 196, 252)}" class="spec" filter="url(#soft)"/>
      <circle r="471" fill="none" stroke="#000" stroke-width="3" pointer-events="none"/>
      <polygon class="pointer" points="492,0 516,-16 516,16"/>
    </svg>`;
  // Whole car, faded, along the bottom of the section; its wheels turn with the big one
  const carHost = el("div", { class: "carbg", "aria-hidden": "true" },
    `<svg viewBox="-1560 -930 8200 1440" preserveAspectRatio="xMidYMax meet">${carSvg}</svg>`);
  $(".wheelsec__sticky").prepend(carHost);
  const carWheels = [...carHost.querySelectorAll(".cw")];
  const rot = $("#wheelRot", wheelHost);
  const badgeEls = [...wheelHost.querySelectorAll(".badge")];
  stint.innerHTML = `<span id="stintText">STINT 1/${N}</span><span class="stint__bars">${"<i></i>".repeat(N)}</span>`;
  const bars = [...stint.querySelectorAll(".stint__bars i")];

  const renderPanel = (i) => {
    const pr = projects[i];
    const primary = (pr.links || [])[0];
    const title = primary
      ? `<a class="panel__title" href="${esc(primary.url)}" target="_blank" rel="noopener">${esc(pr.name)}</a>`
      : esc(pr.name);
    panel.innerHTML = `
      <div class="panel__top"><span class="panel__num">${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}</span><span>${esc(pr.date)}</span></div>
      <h3>${title}</h3>
      <p class="panel__kind">${esc(pr.kind)}</p>
      ${pr.image ? `<button class="panel__media" type="button" style="--img:url('${esc(pr.image)}')" aria-label="Enlarge image: ${esc(pr.name)}"><img src="${esc(pr.image)}" alt="${esc(pr.name)}"/><span class="panel__open">⤢ Enlarge</span></button>` : ""}
      <p class="panel__desc"><span class="d-long">${esc(pr.description)}</span><span class="d-short">${esc(pr.summary || pr.description)}</span></p>
      <div class="tags">${pr.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="panel__row">
        ${pr.metric ? `<div class="metric"><b>${esc(pr.metric.value)}</b><span>${esc(pr.metric.label)}</span></div>` : "<span></span>"}
        <div class="panel__links">${(pr.links || []).map((l, j) => `<a class="btn${j === 0 ? " btn--primary" : ""}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>
      </div>`;
    panel.dataset.href = primary ? primary.url : "";
    panel.classList.remove("is-swap"); void panel.offsetWidth; panel.classList.add("is-swap");
    badgeEls.forEach((b, j) => b.classList.toggle("is-focus", j === i));
    bars.forEach((b, j) => { b.classList.toggle("is-done", j < i); b.classList.toggle("is-now", j === i); });
    $("#stintText").textContent = `STINT ${i + 1}/${N}`;
  };
  // Clicking anywhere on the card opens the project (links inside it still work on their own)
  const lightbox = el("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Project image" }, `<img alt=""/><span>Click or press Esc to close</span>`);
  document.body.appendChild(lightbox);
  const closeLightbox = () => lightbox.classList.remove("is-open");
  lightbox.addEventListener("click", closeLightbox);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  panel.addEventListener("click", (e) => {
    const media = e.target.closest(".panel__media");
    if (media) {
      const img = media.querySelector("img");
      lightbox.querySelector("img").src = img.src; lightbox.querySelector("img").alt = img.alt;
      lightbox.classList.add("is-open");
      return;
    }
    if (e.target.closest("a") || !panel.dataset.href) return;
    window.open(panel.dataset.href, "_blank", "noopener");
  });

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
    carWheels.forEach((w) => w.setAttribute("transform", `translate(${w.dataset.x} 0) rotate(${deg})`));
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
    sections.forEach((s, i) => { if (s.offsetParent && s.getBoundingClientRect().top <= mid) active = i; });
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
  /* ---------- Ignition key: seen head-on, twisted about its own axis ---------- */
  const ign = $("#ignition");
  const keyHost = $("#ignitionKey");
  const hint = $("#ignitionHint");
  const sub = $("#ignitionSub");
  const KEY_ON = 90;                        // OFF (12 o'clock) to START (3 o'clock)
  const HOLE = [0, 58];                     // lanyard loop near the bottom of the key head
  const POS = ["OFF", "ACC", "ON", "START"];
  let engineOn = false;
  try { engineOn = sessionStorage.getItem("engineOn") === "1"; } catch (e) {}

  const posLabels = POS.map((t, i) => {
    const a = -90 + i * 30, [x, y] = pt(a, 116), [x1, y1] = pt(a, 90), [x2, y2] = pt(a, 98);
    return `<line class="ig__pip" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
            <text class="ig__label" data-i="${i}" x="${x}" y="${y}" transform="rotate(${a + 90} ${x} ${y})">${t}</text>`;
  }).join("");
  const knurl = Array.from({ length: 40 }, (_, i) => {
    const a = 96 + i * 4.3, [x1, y1] = pt(a, 74), [x2, y2] = pt(a, 86);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join("");
  const keyHead = `
    <path d="M -30 -84 Q -36 -84 -36 -76 L -38 72 Q -38 92 -18 92 L 18 92 Q 38 92 38 72 L 36 -76 Q 36 -84 30 -84 Z"/>`;
  keyHost.innerHTML = `
    <svg viewBox="-132 -132 264 330" aria-hidden="true">
      <defs>
        <linearGradient id="alu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e9199"/><stop offset=".22" stop-color="#eef0f3"/><stop offset=".5" stop-color="#b7bac1"/><stop offset=".78" stop-color="#e6e8ec"/><stop offset="1" stop-color="#7d8088"/></linearGradient>
        <linearGradient id="chromeBit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b6e76"/><stop offset=".35" stop-color="#f2f3f5"/><stop offset=".6" stop-color="#9a9da4"/><stop offset="1" stop-color="#4b4e55"/></linearGradient>
        <radialGradient id="barrelFace" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#1d1f23"/><stop offset="1" stop-color="#08090a"/></radialGradient>
        <pattern id="braid" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="9" height="9" fill="#b3121a"/><rect width="9" height="3.5" fill="#7c0a10"/>
        </pattern>
        <filter id="keyShadowBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <!-- barrel, seen head-on -->
      ${posLabels}
      <circle r="88" class="ig__bezel"/>
      <circle r="86" class="ig__ring"/>
      <g class="ig__knurl">${knurl}</g>
      <circle r="62" fill="url(#barrelFace)" stroke="#26282d" stroke-width="3"/>
      <circle r="46" class="ig__throat"/>
      <!-- key shadow (fixed light, so it stays offset as the key turns) -->
      <g transform="translate(9 13)" opacity=".55"><g id="keyShadow" filter="url(#keyShadowBlur)" fill="#000">${keyHead}</g></g>
      <!-- key head -->
      <g id="keyRot">
        <g class="ig__fob">${keyHead}</g>
        <path class="ig__fobhi" d="M -26 -78 L -28 64"/>
        <rect x="-21" y="-50" width="42" height="46" rx="9" class="ig__badge"/>
        <text x="0" y="-26" class="ig__mono">AP</text>
        <rect x="-14" y="44" width="28" height="30" rx="11" class="ig__hole"/>
      </g>
      <!-- lanyard, kept hanging under gravity -->
      <g id="lanyard">
        <path d="M -5 0 C -6 36 -3 74 -2 104 L 2 104 C 3 74 6 36 5 0 Z" fill="url(#braid)"/>
        <rect x="-12" y="102" width="24" height="32" rx="4" fill="url(#chromeBit)"/>
        <rect x="-12" y="122" width="24" height="2.5" fill="#c3121a"/>
      </g>
    </svg>`;
  const keyRot = $("#keyRot", keyHost);
  const keyShadow = $("#keyShadow", keyHost);
  const lanyard = $("#lanyard", keyHost);
  const keySvg = keyHost.querySelector("svg");
  const labelEls = [...keyHost.querySelectorAll(".ig__label")];

  let angle = engineOn ? KEY_ON : 0, swing = 0, swingV = 0, lastHx = null, animTo = null;
  const holeAt = (deg) => { const a = (deg * Math.PI) / 180; return [HOLE[0] * Math.cos(a) - HOLE[1] * Math.sin(a), HOLE[0] * Math.sin(a) + HOLE[1] * Math.cos(a)]; };
  const drawKey = () => {
    keyRot.setAttribute("transform", `rotate(${angle})`);
    keyShadow.setAttribute("transform", `rotate(${angle})`);
    const lit = Math.min(Math.round(angle / 30), 3);
    labelEls.forEach((l, i) => l.classList.toggle("is-lit", i === lit));
    const [hx, hy] = holeAt(angle);
    if (lastHx !== null && !reduced) swingV -= (hx - lastHx) * 0.3;
    lastHx = hx;
    swingV += -swing * 0.06; swingV *= 0.93; swing += swingV;
    lanyard.setAttribute("transform", `translate(${hx} ${hy}) rotate(${swing})`);
  };
  const loop = (t) => {
    if (animTo) {
      const k = Math.min((t - animTo.t0) / animTo.dur, 1);
      const e = 1 - Math.pow(1 - k, 3);
      angle = animTo.from + (animTo.to - animTo.from) * e;
      if (k >= 1) { const done = animTo.done; animTo = null; done && done(); }
    }
    drawKey();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  const turnTo = (to, done) => { animTo = { from: angle, to, t0: performance.now(), dur: reduced ? 1 : 300 + Math.abs(to - angle) * 6, done }; };

  const setLocked = (locked) => {
    document.body.classList.toggle("is-locked", locked);
    ign.classList.toggle("is-on", !locked);
    hint.textContent = locked ? "Turn the key to start" : "Engine on";
    sub.textContent = locked ? "Twist it, click it, or press Enter" : "Scroll, or pick a gear";
  };
  const startEngine = () => {
    if (engineOn) return;
    engineOn = true;
    try { sessionStorage.setItem("engineOn", "1"); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(35);
    setLocked(false);
    sizeWheelSection(); update(); setGear();
    setTimeout(() => $("#telemetry").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), reduced ? 0 : 750);
  };
  const turnKey = () => { if (!engineOn) turnTo(KEY_ON, startEngine); };
  const nudge = () => {
    ign.classList.remove("is-nudge"); void ign.offsetWidth; ign.classList.add("is-nudge");
    swingV += 5;
  };

  // Twist by dragging round the barrel, or click / press Enter
  let drag = null;
  const pointerAngle = (e) => {
    const m = keySvg.getScreenCTM();
    return (Math.atan2(e.clientY - m.f, e.clientX - m.e) * 180) / Math.PI;
  };
  keyHost.addEventListener("pointerdown", (e) => {
    if (engineOn) return;
    drag = { a0: pointerAngle(e), start: angle, x: e.clientX, y: e.clientY, moved: false };
    keyHost.setPointerCapture(e.pointerId);
    animTo = null;
  });
  keyHost.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) drag.moved = true;
    let d = pointerAngle(e) - drag.a0;
    if (d < -180) d += 360; if (d > 180) d -= 360;
    angle = Math.min(Math.max(drag.start + d, 0), KEY_ON);
  });
  const endDrag = () => {
    if (!drag) return;
    const { moved } = drag; drag = null;
    if (!moved || angle > KEY_ON * 0.6) turnKey();
    else turnTo(0);                           // spring back to OFF
  };
  keyHost.addEventListener("pointerup", endDrag);
  keyHost.addEventListener("pointercancel", endDrag);
  keyHost.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turnKey(); } });

  // While locked, the gears and number keys point you back to the key
  gearLinks.forEach((a, i) => a.addEventListener("click", (e) => { if (!engineOn && i > 0) { e.preventDefault(); nudge(); } }));
  addEventListener("keydown", (e) => {
    if (engineOn || performance.now() - lightsDoneAt < 400) return;
    if (/^[1-6]$/.test(e.key)) nudge();
    if (e.key === "Enter" && e.target === document.body) turnKey();
  });

  setLocked(!engineOn);
})();
