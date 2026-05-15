/* ============================================================
   HEARTAI — app.js
   Premium medical AI dashboard interactions
============================================================ */

"use strict";

/* ── PARTICLE BACKGROUND ──────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W,
    H,
    particles = [];

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.1;
      const colors = ["0,212,255", "123,95,255", "0,255,157"];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Draw connections
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach((b) => {
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    requestAnimationFrame(loop);
  };
  loop();
})();

/* ── MOBILE SIDEBAR TOGGLE ────────────────────────────────── */
(function initSidebar() {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (!menuBtn || !sidebar || !overlay) return;

  let isOpen = false;

  const open = () => {
    isOpen = true;
    sidebar.classList.add("open");
    menuBtn.classList.add("open");
    overlay.classList.add("visible");
    setTimeout(() => overlay.classList.add("show"), 10);
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    isOpen = false;
    sidebar.classList.remove("open");
    menuBtn.classList.remove("open");
    overlay.classList.remove("show");
    setTimeout(() => overlay.classList.remove("visible"), 350);
    document.body.style.overflow = "";
  };

  menuBtn.addEventListener("click", () => (isOpen ? close() : open()));
  overlay.addEventListener("click", close);

  // Close on nav link click (mobile)
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 900) close();
    });
  });
})();

/* ── ACTIVE NAV HIGHLIGHT (Intersection Observer) ─────────── */
(function initNavHighlight() {
  const links = document.querySelectorAll(".nav-link[data-section]");
  const sections = document.querySelectorAll(".section[id]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const link = document.querySelector(
            `.nav-link[data-section="${entry.target.id}"]`,
          );
          if (link) link.classList.add("active");
        }
      });
    },
    { threshold: 0.3 },
  );

  sections.forEach((s) => observer.observe(s));
})();

/* ── SCROLL ANIMATIONS ────────────────────────────────────── */
(function initScrollAnimations() {
  const elements = document.querySelectorAll(
    ".glass-card, .about-card, .kpi, .tc-1, .tc-2, .tc-3",
  );
  elements.forEach((el) => el.classList.add("fade-up"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 60);
        }
      });
    },
    { threshold: 0.1 },
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ── SCROLL TO SECTION ─────────────────────────────────────── */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// Nav link clicks
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    const section = link.getAttribute("data-section");

    // Sirf section wale links ke liye preventDefault
    if (section) {
      e.preventDefault();
      scrollTo(section);
    }

    // Agar href="/developer" hai to normal redirect hone do
  });
});

/* ── SAMPLE DATA FILL ─────────────────────────────────────── */
document.getElementById("sampleBtn")?.addEventListener("click", () => {
  const sample = {
    BeatStat_HR_N: "-0.45",
    BeatStat_HR_mean: "0.82",
    BeatStat_CI_vc: "-1.20",
    BeatStat_CI_mean: "0.35",
    BeatStat_mBP_var: "-0.70",
    BeatStat_mBP_mean: "0.15",
    HRS_RRI_LF_min: "1.10",
    HRS_RRI_HFnu_max: "-0.60",
    dBPS_LF_HF_dBP_min: "0.90",
    HRS_RRI_LF_HF_max: "-1.50",
  };

  Object.entries(sample).forEach(([id, val]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = val;
      // Trigger the floating label
      input.dispatchEvent(new Event("input"));
    }
  });
});

/* ── FORM SUBMISSION ──────────────────────────────────────── */
const form = document.getElementById("predForm");
const runBtn = document.getElementById("runBtn");
const loader = document.getElementById("loadingScreen");
const lsSub = document.getElementById("lsSub");

const loadingMessages = [
  "Preprocessing biomarkers…",
  "Applying StandardScaler…",
  "Running PCA transform…",
  "Classifying with Logistic Regression…",
  "Calculating risk probability…",
];

function showLoader() {
  loader?.classList.add("show");
  let i = 0;
  const cycle = setInterval(() => {
    if (!loader?.classList.contains("show")) {
      clearInterval(cycle);
      return;
    }
    if (lsSub) lsSub.textContent = loadingMessages[i % loadingMessages.length];
    i++;
  }, 900);
  return cycle;
}

function hideLoader(cycleId) {
  clearInterval(cycleId);
  loader?.classList.remove("show");
}

function validateForm() {
  const inputs = form.querySelectorAll(".f-input[required]");
  let valid = true;
  inputs.forEach((inp) => {
    const wrap = inp.closest(".field-wrap");
    const val = inp.value.trim();
    if (!val || isNaN(parseFloat(val))) {
      wrap?.classList.add("has-error");
      inp.classList.add("invalid");
      valid = false;
    } else {
      wrap?.classList.remove("has-error");
      inp.classList.remove("invalid");
    }
  });
  return valid;
}

// Live validation remove on input
document.querySelectorAll(".f-input").forEach((inp) => {
  inp.addEventListener("input", () => {
    if (inp.value.trim()) {
      inp.closest(".field-wrap")?.classList.remove("has-error");
      inp.classList.remove("invalid");
    }
  });
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  runBtn?.classList.add("loading");
  const cycleId = showLoader();

  const inputs = form.querySelectorAll(".f-input[name]");
  const body = {};

  inputs.forEach((inp) => {
    body[inp.name] = parseFloat(inp.value);
  });

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    hideLoader(cycleId);
    runBtn?.classList.remove("loading");

    if (data.error) throw new Error(data.error);

    showModal(data);
    addHistory(data);

  } catch (err) {
    hideLoader(cycleId);
    runBtn?.classList.remove("loading");

    const demo = buildDemoResult(body);
    showModal(demo);
    addHistory(demo);
  }
});

/* ── BUILD DEMO RESULT (when backend unavailable) ─────────── */
function buildDemoResult(body) {
  // Simple heuristic from the input values
  const vals = Object.values(body);
  const avg = vals.reduce((s, v) => s + Math.abs(v), 0) / vals.length;
  const prob = Math.min(
    Math.max(avg * 0.28 + 0.2 + Math.random() * 0.15, 0.05),
    0.95,
  );
  const isRisk = prob > 0.5;
  return {
    prediction: isRisk ? 1 : 0,
    label: isRisk
      ? "Heart Disease Risk Detected"
      : "No Significant Risk Detected",
    probability: { risk: prob, healthy: 1 - prob },
    risk_level: prob > 0.7 ? "HIGH" : prob > 0.4 ? "MODERATE" : "LOW",
    confidence: Math.max(prob, 1 - prob),
    _demo: true,
  };
}

/* ══════════════════════════════════════════════════════════════
   MODAL DISPLAY
══════════════════════════════════════════════════════════════ */
function showModal(data) {
  const backdrop = document.getElementById("modalBackdrop");
  const mvIcon = document.getElementById("mvIcon");
  const mvStatus = document.getElementById("mvStatus");
  const mvDesc = document.getElementById("mvDesc");
  const riskBadge = document.getElementById("modalRiskBadge");
  const modalTs = document.getElementById("modalTs");
  const mmFill = document.getElementById("mmFill");
  const mmPct = document.getElementById("mmPct");
  const mmRiskBar = document.getElementById("mmRiskBar");
  const mmRiskVal = document.getElementById("mmRiskVal");
  const mmOkBar = document.getElementById("mmOkBar");
  const mmOkVal = document.getElementById("mmOkVal");
  const gaugeNeedle = document.getElementById("gaugeNeedle");
  const aiSummary = document.getElementById("aiSummary");

  const isRisk = data.prediction === 1;
  const riskProb = data.probability?.risk ?? data.risk_probability ?? 0.5;
  const okProb = data.probability?.healthy ?? 1 - riskProb;
  const level = (data.risk_level || "").toUpperCase();

  /* ── Icon & Status ── */
  mvIcon.textContent = isRisk ? "⚠️" : "✅";
  mvStatus.textContent = isRisk ? "Risk Detected" : "Low Risk";
  mvStatus.style.color = isRisk ? "var(--red)" : "var(--green)";
  mvDesc.textContent =
    data.label ||
    (isRisk
      ? "Cardiac risk indicators found"
      : "Biomarkers within normal range");

  /* ── Risk badge ── */
  riskBadge.textContent = level || (isRisk ? "HIGH" : "LOW");
  riskBadge.className =
    "modal-risk-badge " +
    (level === "HIGH" || (isRisk && !level)
      ? "badge badge-high"
      : level === "LOW" || (!isRisk && !level)
        ? "badge badge-low"
        : "badge badge-medium");

  /* ── Timestamp ── */
  modalTs.textContent = new Date().toLocaleTimeString();

  /* ── Donut ── */
  const pct = Math.round(riskProb * 100);
  const circumference = 188.5;
  const offset = circumference - (pct / 100) * circumference;

  // Reset then animate
  mmFill.style.transition = "none";
  mmFill.style.strokeDashoffset = circumference;
  mmFill.setAttribute("stroke", isRisk ? "var(--red)" : "var(--green)");
  mmPct.textContent = "0%";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mmFill.style.transition =
        "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
      mmFill.style.strokeDashoffset = offset;
      animateCount(mmPct, 0, pct, 1200, (v) => `${v}%`);
    });
  });

  /* ── Confidence bars ── */
  const riskPct = Math.round(riskProb * 100);
  const okPct = Math.round(okProb * 100);

  setTimeout(() => {
    mmRiskBar.style.width = `${riskPct}%`;
    mmOkBar.style.width = `${okPct}%`;
  }, 200);

  mmRiskVal.textContent = `${riskPct}%`;
  mmOkVal.textContent = `${okPct}%`;

  /* ── Gauge needle ── */
  // Map risk 0→1 to angle -90→+90
  const angle = riskProb * 180 - 90;
  gaugeNeedle.style.transition = "none";
  gaugeNeedle.setAttribute("transform", "rotate(-90,80,80)");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      gaugeNeedle.style.transition = "transform 1.2s cubic-bezier(0.4,0,0.2,1)";
      gaugeNeedle.setAttribute("transform", `rotate(${angle},80,80)`);
    });
  });

  /* ── AI Summary ── */
  aiSummary.textContent = buildSummary(data, riskProb, level);

  /* ── Show modal ── */
  backdrop?.classList.add("show");
  document.body.style.overflow = "hidden";
}

function buildSummary(data, riskProb, level) {
  const pct = Math.round(riskProb * 100);
  const isRisk = data.prediction === 1;

  if (data._demo) {
    return `In production, the model analyzes your 10 cardiac biomarkers through a Logistic Regression pipeline with PCA dimensionality reduction and returns a calibrated cardiac risk probability. Predicted risk probability: ${pct}%.`;
  }

  if (isRisk) {
    return `The ML model detected elevated cardiac risk indicators with ${pct}% probability. The biomarker pattern shows anomalies consistent with cardiac stress markers. Risk level classified as ${level}. Recommend clinical review of heart rate variability, cardiac index variance, and mean arterial pressure metrics. This analysis is for research purposes only — please consult a qualified cardiologist.`;
  }

  return `Biomarker analysis indicates low cardiac risk with ${100 - pct}% confidence in normal classification. Heart rate metrics, cardiac index, blood pressure, and HRV spectral features are within expected population ranges. Risk level: ${level || "LOW"}. Continue routine monitoring and healthy lifestyle practices. This analysis is for research purposes only.`;
}

/* ── Animate number counter ── */
function animateCount(el, from, to, duration, format = (v) => v) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(Math.round(from + (to - from) * ease));
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── Close modal ── */
function closeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  backdrop?.classList.remove("show");
  document.body.style.overflow = "";
}

document.getElementById("modalClose")?.addEventListener("click", closeModal);
document.getElementById("modalCloseBtn")?.addEventListener("click", closeModal);

document.getElementById("modalBackdrop")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById("analyzeAgainBtn")?.addEventListener("click", () => {
  closeModal();
  scrollTo("predict");
});

/* Escape key */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ══════════════════════════════════════════════════════════════
   PREDICTION HISTORY
══════════════════════════════════════════════════════════════ */
let predHistory = JSON.parse(localStorage.getItem("heartai_history") || "[]");
let histCount = predHistory.length;

function addHistory(data) {
  histCount++;

  const entry = {
    id: histCount,
    result: data.prediction === 1 ? "At Risk" : "Healthy",
    riskLevel: (
      data.risk_level || (data.prediction === 1 ? "HIGH" : "LOW")
    ).toUpperCase(),
    prob: Math.round((data.probability?.risk ?? 0.5) * 100),
    conf: Math.round(
      (data.confidence ??
        Math.max(
          data.probability?.risk ?? 0.5,
          data.probability?.healthy ?? 0.5,
        )) * 100,
    ),
    ts: new Date().toLocaleString(),
  };

  predHistory.unshift(entry);
  if (predHistory.length > 50) predHistory.pop();

  try {
    localStorage.setItem("heartai_history", JSON.stringify(predHistory));
  } catch { }

  renderHistory();
}

function renderHistory() {
  const tbody = document.getElementById("histBody");
  const countEl = document.getElementById("histCount");
  if (!tbody) return;

  if (countEl)
    countEl.textContent = `${predHistory.length} prediction${predHistory.length !== 1 ? "s" : ""}`;

  if (predHistory.length === 0) {
    tbody.innerHTML = `<tr class="hist-empty"><td colspan="6">
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <p>No predictions yet — run your first analysis above</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = predHistory
    .map((e) => {
      const badgeClass =
        e.riskLevel === "HIGH"
          ? "badge-high"
          : e.riskLevel === "LOW"
            ? "badge-low"
            : "badge-medium";
      const resultClass =
        e.result === "At Risk" ? "badge-result-risk" : "badge-result-ok";
      return `<tr>
      <td><span style="font-family:JetBrains Mono,monospace;color:var(--muted);font-size:0.78rem;">#${e.id}</span></td>
      <td><span class="badge ${resultClass}">${e.result}</span></td>
      <td><span class="badge ${badgeClass}">${e.riskLevel}</span></td>
      <td><span style="font-family:JetBrains Mono,monospace;color:var(--white);font-weight:600;">${e.prob}%</span></td>
      <td><span style="font-family:JetBrains Mono,monospace;color:var(--muted);">${e.conf}%</span></td>
      <td><span style="font-size:0.78rem;">${e.ts}</span></td>
    </tr>`;
    })
    .join("");
}

/* Clear history */
document.getElementById("clearBtn")?.addEventListener("click", () => {
  if (predHistory.length === 0) return;

  predHistory = [];
  histCount = 0;

  try {
    localStorage.removeItem("heartai_history");
  } catch { }

  renderHistory();
});

/* Load history on start */
renderHistory();

/* ── TOPBAR SHADOW ON SCROLL ────────────────────────────────── */
window.addEventListener(
  "scroll",
  () => {
    const topbar = document.getElementById("topbar");
    if (!topbar) return;
    topbar.style.boxShadow =
      window.scrollY > 10 ? "0 4px 30px rgba(0,0,0,0.4)" : "none";
  },
  { passive: true },
);

/* ── INPUT FOCUS EFFECTS ─────────────────────────────────────── */
document.querySelectorAll(".f-input").forEach((inp) => {
  const field = inp.closest(".field");
  inp.addEventListener("focus", () => field?.classList.add("focused"));
  inp.addEventListener("blur", () => field?.classList.remove("focused"));
});

console.log(
  "%cHeartAI · Cardiac Intelligence Platform",
  "color:#00d4ff;font-weight:800;font-size:14px;",
);
console.log(
  "%cv1.0 · Scikit-learn · Flask · Vanilla JS",
  "color:#6b7a9e;font-size:11px;",
);

/* =========================================
   SMOOTH SCROLL FUNCTION
========================================= */

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
