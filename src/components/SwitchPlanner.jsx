import { useState, useEffect } from ‘react’;
import Ico from ‘./ui/Ico.jsx’;
import { SERVICES, MONTHS, svc } from ‘../utils/services.js’;
import { LS, fmt } from ‘../utils/storage.js’;
import { calcBinge } from ‘../utils/calculator.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

// ── PLAN SETTINGS SHEET ───────────────────────────────────────────────────────
function PlanSettingsSheet({ planSettings, setPlanSettings, subs, onCalculate, onClose }) {
const [local, setLocal] = useState({ …planSettings });
const upd = (k, v) => setLocal(f => ({ …f, [k]: v }));

const togglePause = (m) => {
setLocal(f => ({
…f,
pauseMonths: f.pauseMonths.includes(m)
? f.pauseMonths.filter(x => x !== m)
: […f.pauseMonths, m]
}));
};

return (
<div className=“ov” onClick={e => e.target === e.currentTarget && onClose()}>
<div className=“sh” style={{ display: “flex”, flexDirection: “column”, padding: “20px 20px 0”, maxHeight: “88vh” }}>
<div className=“hndl” style={{ flexShrink: 0 }} />
<h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, flexShrink: 0 }}>Plan Settings</h3>
<p style={{ color: G.muted, fontSize: 13, marginBottom: 20, flexShrink: 0 }}>Customize your Switch Strategy</p>

```
    <div style={{ overflowY: "auto", flex: 1 }}>
      {/* Evenings per week */}
      <div style={{ marginBottom: 20 }}>
        <label className="lbl">Evenings per week: <strong style={{ color: G.text }}>{local.evenings}</strong></label>
        <input type="range" min={1} max={7} value={local.evenings} onChange={e => upd("evenings", Number(e.target.value))} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted, marginTop: 4 }}>
          <span>1</span><span>7</span>
        </div>
      </div>

      {/* Max budget */}
      <div style={{ marginBottom: 20 }}>
        <label className="lbl">Max budget per month</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {[8, 12, 16, 20].map(b => (
            <button key={b} className="btn bsm"
              style={{ flex: 1, background: local.maxBudget === b ? G.accent : G.border, color: local.maxBudget === b ? "#08080f" : G.text }}
              onClick={() => upd("maxBudget", b)}>
              &euro;{b}
            </button>
          ))}
        </div>
        <input className="inp" type="text" inputMode="numeric" placeholder="Custom..."
          value={local.maxBudget} onChange={e => upd("maxBudget", Number(e.target.value) || 20)} />
      </div>

      {/* Always keep */}
      <div style={{ marginBottom: 20 }}>
        <label className="lbl">Always keep active</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button className="btn bsm"
            style={{ background: local.alwaysKeep === "" ? G.accent : G.border, color: local.alwaysKeep === "" ? "#08080f" : G.text }}
            onClick={() => upd("alwaysKeep", "")}>
            None
          </button>
          {subs.map(sub => {
            const sv = svc(sub.serviceId);
            return (
              <button key={sub.id} className="btn bsm"
                style={{ background: local.alwaysKeep === sub.serviceId ? sv.color : G.border, color: local.alwaysKeep === sub.serviceId ? "white" : G.text }}
                onClick={() => upd("alwaysKeep", sub.serviceId)}>
                {sv.icon} {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pause months */}
      <div style={{ marginBottom: 24 }}>
        <label className="lbl">Pause months (tap to select)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MONTHS.map((name, idx) => (
            <button key={idx} className="btn bsm"
              style={{
                background: local.pauseMonths.includes(idx) ? G.warn + "33" : G.border,
                color: local.pauseMonths.includes(idx) ? G.warn : G.muted,
                border: `1px solid ${local.pauseMonths.includes(idx) ? G.warn + "66" : "transparent"}`,
                minWidth: 44,
              }}
              onClick={() => togglePause(idx)}>
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Sticky buttons */}
    <div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 20, background: G.card }}>
      <button className="btn bp" style={{ width: "100%", padding: 16, fontSize: 16 }}
        onClick={() => { setPlanSettings(local); onCalculate(local); }}>
        ⚡ Calculate Plan
      </button>
      <button className="btn bg" style={{ width: "100%", marginTop: 8 }} onClick={onClose}>Cancel</button>
    </div>
  </div>
</div>
```

);
}

// ── SWITCH PLANNER SCREEN ─────────────────────────────────────────────────────
export default function SwitchPlanner({ user, subs, watchlist, savings, strategy, setStrategy, upgradePremium }) {
const [showSettings, setShowSettings] = useState(false);
const [planSettings, setPlanSettings] = useState({ evenings: 3, maxBudget: 20, alwaysKeep: “”, pauseMonths: [] });
const [wide,         setWide]         = useState(false);

useEffect(() => {
const check = () => setWide(window.innerWidth >= 768);
check();
window.addEventListener(“resize”, check);
return () => window.removeEventListener(“resize”, check);
}, []);

const NOW_MONTH = new Date().getMonth();

const generateStrategy = (settings) => {
const s = settings || planSettings;
const platformMonths = {};

```
watchlist.filter(w => w.status !== "finished").forEach(w => {
  if (!platformMonths[w.platform]) platformMonths[w.platform] = 0;
  if (w.type === "series") {
    const totalEps = w.totalEpisodes != null ? w.totalEpisodes : (w.episodes || 0) * (w.seasons || 1);
    const b = calcBinge(totalEps, w.epDuration || 45, s.evenings || 3);
    platformMonths[w.platform] += b?.months || 1;
  } else {
    platformMonths[w.platform] += 1;
  }
});

const sorted = Object.entries(platformMonths)
  .sort((a, b) => b[1] - a[1])
  .map(([serviceId, months]) => ({
    serviceId, months: Math.min(months, 4),
    sub: subs.find(s2 => s2.serviceId === serviceId),
    service: SERVICES.find(s2 => s2.id === serviceId),
  }))
  .filter(p => p.service);

subs.forEach(sub => {
  if (!sorted.find(p => p.serviceId === sub.serviceId))
    sorted.push({ serviceId: sub.serviceId, months: 1, sub, service: SERVICES.find(s2 => s2.id === sub.serviceId) });
});

if (s.alwaysKeep) {
  const idx = sorted.findIndex(p => p.serviceId === s.alwaysKeep);
  if (idx > 0) { const [item] = sorted.splice(idx, 1); sorted.unshift(item); }
}

const plan = [];
let svcIdx    = 0;
let monthsLeft = sorted[0]?.months || 0;

for (let slot = 0; slot < 12; slot++) {
  const calMonth = (NOW_MONTH + slot) % 12;
  if (s.pauseMonths.includes(calMonth)) {
    plan.push({ month: slot, calMonth, type: "pause", userPause: true });
  } else {
    let placed = false;
    let tries  = 0;
    while (!placed && svcIdx < sorted.length && tries < sorted.length) {
      const p     = sorted[svcIdx];
      const price = p.sub?.price || p.service?.price || 0;
      if (price <= (s.maxBudget || 999) || s.alwaysKeep === p.serviceId) {
        plan.push({ month: slot, calMonth, type: "active", serviceId: p.serviceId, svc: p.service, price });
        monthsLeft--;
        if (monthsLeft <= 0) { svcIdx++; monthsLeft = sorted[svcIdx]?.months || 0; }
        placed = true;
      } else {
        svcIdx++;
        monthsLeft = sorted[svcIdx]?.months || 0;
        tries++;
      }
    }
    if (!placed) plan.push({ month: slot, calMonth, type: "pause" });
  }
}

const newStrat = { plan, settings: s };
setStrategy(newStrat);
LS.set("ss_strategy", newStrat);
setShowSettings(false);
```

};

// Non-premium screen
if (!user.isPremium) return (
<div className="scr fu">
<div style={{ padding: “14px 0 16px” }}>
<h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px” }}>Switch Strategy</h2>
<p style={{ color: G.muted, fontSize: 14, marginTop: 4 }}>Rotate smart, pay less</p>
</div>
<div className=“hero” style={{ marginBottom: 16 }}>
<p style={{ fontSize: 13, color: “#7abf9a”, marginBottom: 6 }}>You can save</p>
<div className="heroamt">{fmt(savings.huidigJaar * 0.5)}</div>
<p style={{ fontSize: 13, color: “#7abf9a”, marginTop: 6 }}>per year (estimate)</p>
</div>
<div className=“card” style={{ padding: 20, marginBottom: 14 }}>
<p style={{ fontWeight: 700, marginBottom: 12 }}>Comparison</p>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 8, fontSize: 14 }}>
<span style={{ color: G.muted }}>Current per year</span>
<span style={{ fontWeight: 700, color: G.danger }}>{fmt(savings.huidigJaar)}</span>
</div>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 14, fontSize: 14 }}>
<span style={{ color: G.muted }}>With Switch Strategy</span>
<span style={{ fontWeight: 700, color: G.accent }}>{fmt(savings.huidigJaar * 0.5)}</span>
</div>
<div style={{ background: “#00e5a010”, border: “1px solid #00e5a030”, borderRadius: 12, padding: 14, textAlign: “center” }}>
<p style={{ fontSize: 18, color: G.accent, fontWeight: 800 }}>{fmt(savings.huidigJaar * 0.5)} per year</p>
<p style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>Exact figures after upgrading</p>
</div>
</div>
<button className=“btn bprem” style={{ width: “100%”, padding: “16px” }} onClick={upgradePremium}>
<Ico n="crown" /> Upgrade to Premium — €10/year
</button>
</div>
);

const wlItems     = watchlist.filter(w => w.status !== “finished”);
const byPlatform  = SERVICES.map(sv => ({
…sv,
items: wlItems.filter(w => w.platform === sv.id),
totalMonths: wlItems.filter(w => w.platform === sv.id && w.type === “series”).reduce((sum, w) => {
const totalEps = w.totalEpisodes != null ? w.totalEpisodes : (w.episodes || 0) * (w.seasons || 1);
const b = calcBinge(totalEps, w.epDuration || 45, planSettings.evenings || 3);
return sum + (b?.months || 0);
}, 0),
})).filter(sv => sv.items.length > 0);

return (
<div className="scr fu">
{/* Header */}
<div style={{ padding: “14px 0 16px”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div>
<h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px” }}>Switch Strategy</h2>
<span className=“tag tp” style={{ marginTop: 4, display: “inline-flex” }}><Ico n="crown" size={12} /> Premium</span>
</div>
<button className=“btn bp bsm” onClick={() => setShowSettings(true)}>
{strategy ? “↺ Recalculate” : “⚡ Generate Plan”}
</button>
</div>

```
  {/* Watchlist analysis */}
  {byPlatform.length > 0 && (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Ico n="zap" size={16} />
        <p style={{ fontWeight: 700, fontSize: 15 }}>Watchlist analysis</p>
      </div>
      {byPlatform.map(sv => (
        <div key={sv.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "10px 12px", background: G.surface, borderRadius: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: sv.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {sv.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{sv.name}</p>
            <p style={{ fontSize: 12, color: G.muted }}>{sv.items.length} title{sv.items.length !== 1 ? "s" : ""}</p>
          </div>
          {sv.totalMonths > 0 && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 700, color: G.accent, fontSize: 14 }}>{sv.totalMonths} mo</p>
              <p style={{ fontSize: 11, color: G.muted }}>needed</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {/* Empty state */}
  {!strategy && (
    <div className="card" style={{ padding: 40, textAlign: "center", color: G.muted }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>🔄</p>
      <p style={{ fontWeight: 600, color: G.text, marginBottom: 6 }}>Ready to save?</p>
      <p style={{ fontSize: 14 }}>Tap "Generate Plan" to set your preferences and get a personalized yearly schedule.</p>
    </div>
  )}

  {/* Plan output */}
  {strategy && (
    <>
      {/* Savings hero */}
      <div className="hero" style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: "#7abf9a", marginBottom: 6 }}>Annual savings</p>
        <div className="heroamt">{fmt(savings.besparing)}</div>
        <p style={{ fontSize: 13, color: "#7abf9a", marginTop: 6 }}>
          {fmt(savings.strategieJaar)} with plan vs {fmt(savings.huidigJaar)} current
        </p>
      </div>

      {/* Settings summary chips */}
      {strategy.settings && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <span className="tag ti">🌙 {strategy.settings.evenings || 3} evenings/wk</span>
          <span className="tag ti">💰 max &euro;{strategy.settings.maxBudget || 20}/mo</span>
          {strategy.settings.alwaysKeep && (
            <span className="tag ta">&hearts; {svc(strategy.settings.alwaysKeep).name}</span>
          )}
          {strategy.settings.pauseMonths?.length > 0 && (
            <span className="tag tl">⏸ {strategy.settings.pauseMonths.map(m => MONTHS[m]).join(", ")}</span>
          )}
        </div>
      )}

      {/* Calendar grid — iPad/desktop only */}
      {wide && (
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📅 Year Overview</p>
          {[strategy.plan.slice(0, 4), strategy.plan.slice(4, 8), strategy.plan.slice(8, 12)].map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              {row.map(m => {
                const color = m.type === "pause" ? G.border : (m.svc?.color || G.muted);
                return (
                  <div key={m.month} style={{ background: m.type === "pause" ? G.surface : color + "18", border: `1px solid ${m.type === "pause" ? G.border : color + "44"}`, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{MONTHS[m.calMonth]}</div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{m.type === "pause" ? "⏸" : m.svc?.icon || "📺"}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: m.type === "pause" ? G.muted : color }}>{m.type === "pause" ? "Pause" : (m.svc?.name || "").split(" ")[0]}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: G.text, marginTop: 4 }}>{m.type === "pause" ? "€0" : `€${m.price?.toFixed(2) || "0"}`}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>Monthly breakdown</p>
        {strategy.plan.map((m, i) => {
          const shows = wlItems.filter(w => w.platform === m.serviceId);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${G.border}` }}>
              <div style={{ width: 36, fontWeight: 700, color: G.muted, fontSize: 13 }}>{MONTHS[m.calMonth]}</div>
              <div style={{ fontSize: 20 }}>{m.type === "pause" ? "⏸" : m.svc?.icon || "📺"}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>
                  {m.type === "pause" ? (m.userPause ? "Pause — your choice" : "Pause month") : m.svc?.name}
                </p>
                {m.type === "active" && (
                  <p style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                    {shows.length > 0 ? shows.map(s => s.title).join(", ") : "No titles planned yet"}
                  </p>
                )}
              </div>
              <div style={{ fontWeight: 700, color: m.type === "pause" ? G.accent : G.text }}>
                {m.type === "pause" ? "€0" : `€${m.price?.toFixed(2) || "0"}`}
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 800 }}>
          <span style={{ color: G.muted }}>Total with Switch Strategy</span>
          <span style={{ color: G.accent }}>{fmt(savings.strategieJaar)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0" }}>
          <span style={{ color: G.muted, fontSize: 13 }}>Savings vs. current</span>
          <span style={{ color: G.accent, fontSize: 13, fontWeight: 700 }}>{fmt(savings.besparing)}</span>
        </div>
      </div>
    </>
  )}

  {showSettings && (
    <PlanSettingsSheet
      planSettings={planSettings}
      setPlanSettings={setPlanSettings}
      subs={subs}
      onCalculate={generateStrategy}
      onClose={() => setShowSettings(false)}
    />
  )}
</div>
```

);
}
