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

  // Slick tyre with a split compound stripe and sidewall lettering, black wheel cover and centre-lock nut
  const vents = Array.from({ length: 5 }, (_, i) =>
    `<path class="vent" transform="rotate(${i * 72})" d="M -20 -148 L -30 -236 Q 0 -250 30 -236 L 20 -148 Q 0 -140 -20 -148 Z"/>`).join("");
  const badges = projects.map((pr, i) => `
    <g class="badge" data-i="${i}" transform="rotate(${-i * STEP}) translate(342 0)">
      <g class="badge__up"><circle r="30"/><text>${String(i + 1).padStart(2, "0")}</text></g>
    </g>`).join("");
  const topText = (p.name).toUpperCase();
  const bottomText = p.role.split(" ")[0].toUpperCase();
  wheelHost.innerHTML = `
    <svg viewBox="-520 -520 1040 1040" aria-hidden="true">
      <defs>
        <radialGradient id="tyreShade" r=".5"><stop offset=".6" stop-color="#060607"/><stop offset=".86" stop-color="#151517"/><stop offset=".96" stop-color="#0d0d0e"/><stop offset="1" stop-color="#050505"/></radialGradient>
        <radialGradient id="rimFace" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#1c1d21"/><stop offset=".8" stop-color="#0a0a0c"/><stop offset="1" stop-color="#050506"/></radialGradient>
        <radialGradient id="hubGrad" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#2b2d32"/><stop offset="1" stop-color="#0b0b0d"/></radialGradient>
        <radialGradient id="nutTip" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#f3ff8a"/><stop offset=".6" stop-color="#c3d531"/><stop offset="1" stop-color="#6f7a12"/></radialGradient>
        <filter id="rubber" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/>
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
        <path id="topArc" d="${arcD(380, 202, 338)}"/>
        <path id="botArc" d="M ${pt(158, 428).join(" ")} A 428 428 0 0 0 ${pt(22, 428).join(" ")}"/>
      </defs>
      <g id="wheelRot">
        <circle r="472" fill="url(#tyreShade)"/>
        <circle r="472" fill="#fff" filter="url(#rubber)"/>
        <circle r="468" fill="none" stroke="#1e1f22" stroke-width="2"/>
        <path class="stripe" d="${arcD(392, -50, 50)}"/>
        <path class="stripe" d="${arcD(392, 130, 230)}"/>
        <text class="wall-text"><textPath href="#topArc" startOffset="50%" text-anchor="middle">${esc(topText)}</textPath></text>
        <text class="wall-text wall-text--sm"><textPath href="#botArc" startOffset="50%" text-anchor="middle">${esc(bottomText)}</textPath></text>
        <circle r="306" fill="#020203"/>
        <circle r="298" fill="url(#rimFace)" stroke="#2c2e33" stroke-width="3"/>
        <circle r="262" fill="none" stroke="#17181b" stroke-width="10"/>
        <circle r="196" fill="none" stroke="#141518" stroke-width="2"/>
        ${vents}
        <circle r="72" fill="url(#hubGrad)" stroke="#2e3036" stroke-width="4"/>
        <polygon points="0,-36 31,-18 31,18 0,36 -31,18 -31,-18" fill="#17181b" stroke="#3a3c42" stroke-width="2"/>
        <circle r="15" fill="url(#nutTip)"/>
        ${badges}
      </g>
      <ellipse class="gloss" cx="-150" cy="-250" rx="230" ry="90" transform="rotate(-35 -150 -250)"/>
      <polygon class="pointer" points="492,0 516,-16 516,16"/>
    </svg>`;
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
      ${pr.image ? `<div class="panel__media" role="img" aria-label="${esc(pr.name)}" style="background-image:url('${esc(pr.image)}')"><span class="panel__open">View project ↗</span></div>` : ""}
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
  panel.addEventListener("click", (e) => {
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
