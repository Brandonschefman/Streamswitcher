import Ico from ‘./ui/Ico.jsx’;
import { svc, openApp } from ‘../utils/services.js’;
import { daysLeft, fmt } from ‘../utils/storage.js’;
import { calcBinge } from ‘../utils/calculator.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

export default function Dashboard({ user, subs, watchlist, savings, totalMonthly, getStatus, setSubs, setTab }) {
const warnings = subs.filter(s => daysLeft(s.renewalDate) <= 7);
const activeWL = watchlist.filter(w => w.status !== “finished”);

const totalBingeMonths = activeWL.reduce((sum, item) => {
if (item.type !== “series”) return sum;
const totalEps = item.totalEpisodes != null ? item.totalEpisodes : (item.episodes || 0) * (item.seasons || 1);
const b = calcBinge(totalEps, item.epDuration || 45, item.evenings || 3);
return sum + (b?.months || 0);
}, 0);

return (
<div className="scr fu">
{/* Header */}
<div style={{ padding: “14px 0 12px”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div>
<p style={{ fontSize: 13, color: G.muted }}>Welcome back 👋</p>
<h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px” }}>{user.email.split(”@”)[0]}</h2>
</div>
<div style={{ display: “flex”, alignItems: “center”, gap: 8 }}>
{user.isPremium
? <span className="tag tp"><Ico n="crown" size={13} /> Premium</span>
: <button className=“btn bg bsm” style={{ color: G.premium, background: “#2a2000” }} onClick={() => setTab(“settings”)}>✨ Upgrade</button>
}
<button className=“ib” onClick={() => setTab(“settings”)} title=“Settings” style={{ fontSize: 18 }}>⚙️</button>
</div>
</div>

```
  {/* Renewal warnings */}
  {warnings.map(sub => {
    const days   = daysLeft(sub.renewalDate);
    const st     = getStatus(sub);
    const urgent = days <= 5 && st.label === "Low usage";
    return (
      <div key={sub.id} className={urgent ? "warnbox" : "card"} style={{ marginBottom: 10, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: urgent ? 12 : 0 }}>
          <span style={{ fontSize: 22 }}>{sub.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>⚠️ {sub.name} renews in {days} day{days !== 1 ? "s" : ""}</p>
            {urgent && <p style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>No recent activity</p>}
          </div>
        </div>
        {urgent && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn bd bsm" onClick={() => setSubs(p => { const n = p.filter(s => s.id !== sub.id); LS.set("ss_subs", n); return n; })}>Cancel</button>
            <button className="btn bg bsm">Keep</button>
          </div>
        )}
      </div>
    );
  })}

  {/* Monthly total */}
  <div className="card" style={{ padding: 22, marginBottom: 12 }}>
    <p style={{ fontSize: 12, color: G.muted, marginBottom: 4 }}>Total per month</p>
    <p style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-2px" }}>
      &euro;{totalMonthly.toFixed(2).replace(".", ",")}
      <span style={{ fontSize: 16, color: G.muted, fontWeight: 400 }}>/mo</span>
    </p>
    <div className="sep" />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: 11, color: G.muted }}>Current per year</p>
        <p style={{ fontWeight: 700, fontSize: 18 }}>{fmt(savings.huidigJaar)}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 11, color: G.muted }}>With Switch Strategy</p>
        <p style={{ fontWeight: 700, fontSize: 18, color: G.accent }}>
          {savings.strategieJaar !== null ? fmt(savings.strategieJaar) : "Generate plan →"}
        </p>
      </div>
    </div>
  </div>

  {/* Savings hero */}
  <div className="hero" style={{ marginBottom: 12 }}>
    {savings.besparing !== null ? (
      <>
        <p style={{ fontSize: 13, color: "#7abf9a", marginBottom: 6 }}>Savings with Switch Strategy</p>
        <div className="heroamt">{fmt(savings.besparing)}</div>
        <p style={{ fontSize: 13, color: "#7abf9a", marginTop: 6 }}>per year &middot; based on your plan</p>
      </>
    ) : (
      <>
        <p style={{ fontSize: 13, color: "#7abf9a", marginBottom: 6 }}>Potential savings</p>
        <div className="heroamt">{fmt(savings.huidigJaar * 0.5)}</div>
        <p style={{ fontSize: 13, color: "#7abf9a", marginTop: 6 }}>per year &middot; generate a Switch Plan for exact figures</p>
      </>
    )}
    {!user.isPremium && (
      <button className="btn bp" style={{ marginTop: 16 }} onClick={() => setTab("switch")}>See how &rarr;</button>
    )}
  </div>

  {/* Watchlist summary */}
  {activeWL.length > 0 && (
    <div className="card" style={{ padding: 16, marginBottom: 12, cursor: "pointer" }} onClick={() => setTab("switch")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontWeight: 700, fontSize: 15 }}>Watchlist summary</p>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn bg bsm" onClick={e => { e.stopPropagation(); setTab("watchlist"); }}>Watchlist</button>
          <button className="btn bg bsm" onClick={e => { e.stopPropagation(); setTab("switch"); }}>Analysis &rarr;</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontSize: 28, fontWeight: 900, color: G.accent }}>{activeWL.length}</p>
          <p style={{ fontSize: 11, color: G.muted }}>To watch</p>
        </div>
        <div style={{ width: 1, background: G.border }} />
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontSize: 28, fontWeight: 900, color: G.premium }}>{totalBingeMonths}</p>
          <p style={{ fontSize: 11, color: G.muted }}>Months needed</p>
        </div>
        <div style={{ width: 1, background: G.border }} />
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontSize: 28, fontWeight: 900, color: G.warn }}>{new Set(activeWL.map(w => w.platform)).size}</p>
          <p style={{ fontSize: 11, color: G.muted }}>Services</p>
        </div>
      </div>
    </div>
  )}

  {/* Quick Launch */}
  {subs.length > 0 && (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Quick Launch</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {subs.map(sub => {
          const service = svc(sub.serviceId);
          return (
            <button key={sub.id}
              onClick={() => openApp(service.url, service.deepLink)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: service.color + "22", border: `1px solid ${service.color}44`, borderRadius: 14, padding: "10px 16px", cursor: "pointer", minWidth: 72, flex: 1 }}>
              <span style={{ fontSize: 24 }}>{service.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: service.color }}>{service.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  )}

  {/* Subscriptions preview */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
    <p style={{ fontWeight: 700, fontSize: 16 }}>Subscriptions</p>
    <button className="btn bg bsm" onClick={() => setTab("subs")}>View all</button>
  </div>
  {subs.slice(0, 3).map(sub => {
    const days = daysLeft(sub.renewalDate);
    const st   = getStatus(sub);
    return (
      <div key={sub.id} className="card cardh" style={{ padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }} onClick={() => setTab("subs")}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: sub.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{sub.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700 }}>{sub.name}</p>
          <p style={{ fontSize: 12, color: G.muted }}>Renews in {days} day{days !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontWeight: 700 }}>&euro;{sub.price.toFixed(2)}</p>
          <span className={`tag ${st.cls}`}><span className="dot" style={{ background: st.dot }} />{st.label}</span>
        </div>
      </div>
    );
  })}
</div>
```

);
}
