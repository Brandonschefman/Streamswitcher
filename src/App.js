import { useState, useMemo } from ‘react’;
import Dashboard     from ‘./components/Dashboard.jsx’;
import Subscriptions from ‘./components/Subscriptions.jsx’;
import Watchlist     from ‘./components/Watchlist.jsx’;
import Suggestions   from ‘./components/Suggestions.jsx’;
import SwitchPlanner from ‘./components/SwitchPlanner.jsx’;
import Settings      from ‘./components/Settings.jsx’;
import Ico           from ‘./components/ui/Ico.jsx’;

import { SERVICES }           from ‘./utils/services.js’;
import { LS, genId, addDays, daysLeft } from ‘./utils/storage.js’;
import { calcSavings }        from ‘./utils/calculator.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

const CSS = `*{box-sizing:border-box;margin:0;padding:0} html,body{background:#08080f;color:#f0f0f8;font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh} ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px} .ss{max-width:900px;margin:0 auto;min-height:100vh} .scr{padding:0 16px 100px} .fu{animation:fu .3s ease forwards} @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .card{background:#14141f;border:1px solid #1e1e2e;border-radius:18px} .cardh{transition:border-color .2s,transform .15s;cursor:pointer} .cardh:hover{border-color:#2a2a42;transform:translateY(-1px)} .btn{font-family:'Outfit',sans-serif;font-weight:600;border:none;cursor:pointer;border-radius:12px;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1} .btn:active{transform:scale(.96)} .bp{background:#00e5a0;color:#08080f;padding:13px 22px;font-size:15px} .bp:hover{filter:brightness(1.1)} .bg{background:#1e1e2e;color:#f0f0f8;padding:10px 18px;font-size:14px} .bg:hover{background:#2a2a42} .bd{background:#2a1020;color:#ff3b5c;padding:8px 14px;font-size:13px;border-radius:10px} .bprem{background:linear-gradient(135deg,#f7c948,#ff9500);color:#08080f;padding:13px 22px;font-size:15px} .bsm{padding:7px 12px!important;font-size:12px!important;border-radius:9px!important} .ib{background:#1e1e2e;color:#5a5a7a;border:none;cursor:pointer;border-radius:9px;width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;transition:all .15s} .ib:hover{color:#f0f0f8;background:#2a2a42} .ib-del:hover{color:#ff3b5c;background:#2a1020} .nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:900px;background:#101018;border-top:1px solid #1e1e2e;display:flex;z-index:200;padding:8px 0 env(safe-area-inset-bottom,20px)} .nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-size:10px;font-weight:600;color:#5a5a7a;padding:8px 2px;transition:color .15s} .nb.on{color:#00e5a0} .inp{background:#101018;border:1px solid #1e1e2e;border-radius:11px;color:#f0f0f8;font-family:'Outfit',sans-serif;font-size:15px;padding:12px 14px;width:100%;outline:none;transition:border-color .18s;-webkit-appearance:none;appearance:none} .inp:focus{border-color:#00e5a0} .inp option{background:#101018;color:#f0f0f8} .iw{position:relative}.iw .inp{padding-right:44px} .eyeb{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#5a5a7a;display:flex;align-items:center;padding:4px} .lbl{font-size:12px;color:#5a5a7a;margin-bottom:5px;display:block;font-weight:500} .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600} .ta{background:#002a1a;color:#00e5a0}.tl{background:#2a1800;color:#ff6b35}.ti{background:#1a1a1a;color:#666}.tp{background:#2a2000;color:#f7c948} .ov{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:300;display:flex;align-items:flex-end;justify-content:center} .sh{background:#14141f;border-radius:24px 24px 0 0;width:100%;max-width:430px;padding:0;border-top:1px solid #1e1e2e;max-height:92vh;overflow:hidden} .hndl{width:40px;height:4px;background:#1e1e2e;border-radius:2px;margin:0 auto 20px} .hero{background:linear-gradient(135deg,#002a1a,#001a10);border:1px solid #004a30;border-radius:20px;padding:24px;text-align:center} .heroamt{font-size:52px;font-weight:900;color:#00e5a0;letter-spacing:-2px;line-height:1} .mrow{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none} .mrow::-webkit-scrollbar{display:none} .chip{flex-shrink:0;border-radius:10px;padding:8px 12px;font-size:11px;font-weight:700;text-align:center;min-width:52px} .sep{height:1px;background:#1e1e2e;margin:14px 0} .dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;flex-shrink:0} .binge-box{background:linear-gradient(135deg,#001a2a,#000a15);border:1px solid #003a5a;border-radius:14px;padding:14px 16px} .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px} .warnbox{background:#1a0a00;border:1px solid #ff6b3544;border-radius:18px;padding:14px 16px;margin-bottom:10px} input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:#1e1e2e;border-radius:2px;outline:none} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;background:#00e5a0;border-radius:50%;cursor:pointer} @media(min-width:600px){.pgrid{grid-template-columns:1fr 1fr 1fr}.scr{padding:0 24px 110px}.card{border-radius:22px}} @media(min-width:768px){.nb span{font-size:12px}.nb{padding:10px 4px}}`;

const DEF_SUBS = [
{ id: “s1”, serviceId: “netflix”, name: “Netflix”, price: 17.99, color: “#E50914”, icon: “🎬”, url: “https://netflix.com”,      renewalDate: addDays(4),  autoRenew: true },
{ id: “s2”, serviceId: “disney”,  name: “Disney+”, price: 13.99, color: “#113CCF”, icon: “🏰”, url: “https://disneyplus.com”, renewalDate: addDays(18), autoRenew: true },
];

const DEF_WL = [
{ id: “w1”, title: “The Bear”,    platform: “disney”, type: “series”, episodes: 9,  epDuration: 45,  seasons: 2, totalEpisodes: 18, status: “watching”,    evenings: 3 },
{ id: “w2”, title: “Oppenheimer”, platform: “prime”,  type: “movie”,  episodes: 1,  epDuration: 180, seasons: 1, totalEpisodes: 1,  status: “not_started”, evenings: 3 },
{ id: “w3”, title: “Succession”,  platform: “hbo”,    type: “series”, episodes: 10, epDuration: 60,  seasons: 4, totalEpisodes: 39, status: “finished”,    evenings: 3 },
];

const NAV = [
{ id: “dashboard”, label: “Dashboard”,     icon: “dashboard” },
{ id: “subs”,      label: “Subscriptions”, icon: “subs”      },
{ id: “watchlist”, label: “Watchlist”,     icon: “list”      },
{ id: “news”,      label: “Suggestions”,   icon: “movie”     },
{ id: “switch”,    label: “Switch”,        icon: “switch”    },
];

export default function App() {
const [user,      setUser]      = useState(() => LS.get(“ss_user”, null));
const [authMode,  setAuthMode]  = useState(“login”);
const [authEmail, setAuthEmail] = useState(””);
const [authPass,  setAuthPass]  = useState(””);
const [authError, setAuthError] = useState(””);
const [showPass,  setShowPass]  = useState(false);
const [tab,       setTab]       = useState(“dashboard”);
const [subs,      setSubs]      = useState(() => LS.get(“ss_subs”, DEF_SUBS));
const [watchlist, setWatchlist] = useState(() => LS.get(“ss_watchlist”, DEF_WL));
const [strategy,  setStrategy]  = useState(() => LS.get(“ss_strategy”, null));
const [notifs,    setNotifs]    = useState(() => LS.get(“ss_notifs”, { enabled: true }));

const totalMonthly = useMemo(() => subs.reduce((s, a) => s + a.price, 0), [subs]);
const savings      = useMemo(() => calcSavings(subs, strategy?.plan), [subs, strategy]);

const getStatus = (sub) => {
const wlCount = watchlist.filter(w => w.platform === sub.serviceId && w.status !== “finished”).length;
if (!sub.autoRenew)                                return { label: “Inactive”,  cls: “ti”, dot: G.muted  };
if (daysLeft(sub.renewalDate) <= 30 && wlCount === 0) return { label: “Low usage”, cls: “tl”, dot: G.warn   };
return { label: “Active”, cls: “ta”, dot: G.accent };
};

const upgradePremium = () => setUser(u => {
const n = { …u, isPremium: true };
LS.set(“ss_user”, n);
return n;
});

const handleAuth = () => {
if (!authEmail.trim() || !authPass.trim()) { setAuthError(“Please fill in all fields.”); return; }
if (authPass.length < 6)                   { setAuthError(“Password must be at least 6 characters.”); return; }
const u = { id: genId(), email: authEmail, isPremium: false, password: authPass };
setUser(u);
LS.set(“ss_user”, u);
};

// ── AUTH SCREEN ─────────────────────────────────────────────────────────────
if (!user) return (
<div style={{ minHeight: “100vh”, background: G.bg, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, padding: 24 }}>
<style>{CSS}</style>
<div style={{ textAlign: “center”, marginBottom: 36 }}>
<div style={{ fontSize: 52, marginBottom: 10 }}>📺</div>
<h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: “-1px”, color: G.text }}>
Stream<span style={{ color: G.accent }}>Switch</span>
</h1>
<p style={{ color: G.muted, marginTop: 8, fontSize: 15 }}>Smart streaming. Smarter spending.</p>
</div>
<div style={{ width: “100%”, maxWidth: 360, display: “flex”, flexDirection: “column”, gap: 12 }}>
<div style={{ display: “flex”, background: G.surface, borderRadius: 12, padding: 4, border: `1px solid ${G.border}` }}>
{[“login”, “register”].map(m => (
<button key={m} onClick={() => setAuthMode(m)}
style={{ flex: 1, padding: “9px”, border: “none”, cursor: “pointer”, fontFamily: “Outfit,sans-serif”, fontWeight: 600, fontSize: 14, borderRadius: 9, background: authMode === m ? G.card : “transparent”, color: authMode === m ? G.text : G.muted }}>
{m === “login” ? “Sign in” : “Sign up”}
</button>
))}
</div>
<input className=“inp” type=“email” placeholder=“Email address” value={authEmail}
onChange={e => setAuthEmail(e.target.value)} autoComplete=“email” />
<div className="iw">
<input className=“inp” type={showPass ? “text” : “password”} placeholder=“Password”
value={authPass} onChange={e => setAuthPass(e.target.value)}
onKeyDown={e => e.key === “Enter” && handleAuth()}
autoComplete={authMode === “login” ? “current-password” : “new-password”} />
<button className=“eyeb” onClick={() => setShowPass(v => !v)} tabIndex={-1}>
<Ico n={showPass ? “eyeoff” : “eye”} />
</button>
</div>
{authError && <p style={{ color: G.danger, fontSize: 13 }}>{authError}</p>}
<button className=“btn bp” style={{ width: “100%”, padding: “14px” }} onClick={handleAuth}>
{authMode === “login” ? “Sign in” : “Create account”}
</button>
<p style={{ textAlign: “center”, fontSize: 12, color: G.muted }}>Try for free — no credit card needed</p>
</div>
</div>
);

// ── MAIN APP ─────────────────────────────────────────────────────────────────
return (
<div className="ss">
<style>{CSS}</style>

```
  {tab === "dashboard" && (
    <Dashboard
      user={user} subs={subs} watchlist={watchlist}
      savings={savings} totalMonthly={totalMonthly}
      getStatus={getStatus} setSubs={setSubs} setTab={setTab}
    />
  )}
  {tab === "subs" && (
    <Subscriptions
      subs={subs} setSubs={setSubs} watchlist={watchlist}
      savings={savings} totalMonthly={totalMonthly} getStatus={getStatus}
    />
  )}
  {tab === "watchlist" && (
    <Watchlist watchlist={watchlist} setWatchlist={setWatchlist} />
  )}
  {tab === "news" && (
    <Suggestions watchlist={watchlist} setWatchlist={setWatchlist} subs={subs} />
  )}
  {tab === "switch" && (
    <SwitchPlanner
      user={user} subs={subs} watchlist={watchlist}
      savings={savings} strategy={strategy} setStrategy={setStrategy}
      upgradePremium={upgradePremium}
    />
  )}
  {tab === "settings" && (
    <Settings
      user={user} setUser={setUser}
      notifs={notifs} setNotifs={setNotifs}
      upgradePremium={upgradePremium}
    />
  )}

  <nav className="nav">
    {NAV.map(({ id, label, icon }) => (
      <button key={id} className={`nb${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
        <Ico n={icon} size={22} />
        <span>{label}</span>
      </button>
    ))}
  </nav>
</div>
```

);
}