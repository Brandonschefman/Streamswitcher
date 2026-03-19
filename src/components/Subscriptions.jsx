import { useState } from ‘react’;
import Ico from ‘./ui/Ico.jsx’;
import Toggle from ‘./ui/Toggle.jsx’;
import { SERVICES, svc, openApp } from ‘../utils/services.js’;
import { LS, genId, addDays, daysLeft, fmt } from ‘../utils/storage.js’;
import { calcSavings } from ‘../utils/calculator.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

// ── SUB SHEET ─────────────────────────────────────────────────────────────────
function SubSheet({ editingSub, subForm, setSubForm, saveSub, onClose }) {
const upd = (k, v) => setSubForm(f => ({ …f, [k]: v }));

return (
<div className=“ov” onClick={e => e.target === e.currentTarget && onClose()}>
<div className=“sh” style={{ display: “flex”, flexDirection: “column”, padding: “20px 20px 0” }}>
<div className=“hndl” style={{ flexShrink: 0 }} />
<h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 18, flexShrink: 0 }}>
{editingSub ? “Edit subscription” : “Add subscription”}
</h3>
<div style={{ overflowY: “auto”, flex: 1 }}>
<div style={{ paddingBottom: 8 }}>
{!editingSub && (
<div style={{ marginBottom: 18 }}>
<p style={{ fontSize: 12, color: G.muted, fontWeight: 600, marginBottom: 10 }}>Choose a service</p>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: 8 }}>
{SERVICES.map(p => (
<button key={p.id} className=“btn bsm”
onClick={() => setSubForm(f => ({ …f, serviceId: p.id, name: p.name, price: String(p.price), color: p.color, icon: p.icon, url: p.url }))}
style={{ background: subForm.serviceId === p.id ? p.color : G.border, color: subForm.serviceId === p.id ? “white” : G.text }}>
{p.icon} {p.name}
</button>
))}
</div>
</div>
)}
<div style={{ display: “flex”, flexDirection: “column”, gap: 13 }}>
<div>
<label className="lbl">Name</label>
<input className=“inp” placeholder=“Netflix” value={subForm.name} onChange={e => upd(“name”, e.target.value)} />
</div>
<div>
<label className="lbl">Monthly price (€)</label>
<input className=“inp” type=“text” inputMode=“decimal” placeholder=“17.99” value={subForm.price} onChange={e => upd(“price”, e.target.value)} />
</div>
<div>
<label className="lbl">Renewal date</label>
<input className=“inp” type=“date” value={subForm.renewalDate} onChange={e => upd(“renewalDate”, e.target.value)} />
</div>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, padding: “12px 14px”, background: G.surface, borderRadius: 11, border: `1px solid ${G.border}` }}>
<p style={{ fontWeight: 600 }}>Auto-renew</p>
<Toggle value={subForm.autoRenew} onChange={v => upd(“autoRenew”, v)} />
</div>
</div>
</div>
</div>
<div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 20, background: G.card }}>
<button className=“btn bp” style={{ width: “100%”, padding: “14px”, marginBottom: 8 }} onClick={saveSub}>
{editingSub ? “Save” : “Add”}
</button>
<button className=“btn bg” style={{ width: “100%” }} onClick={onClose}>Cancel</button>
</div>
</div>
</div>
);
}

// ── SUBSCRIPTIONS SCREEN ──────────────────────────────────────────────────────
export default function Subscriptions({ subs, setSubs, watchlist, savings, totalMonthly, getStatus }) {
const [showSheet,  setShowSheet]  = useState(false);
const [editingSub, setEditingSub] = useState(null);
const [subForm,    setSubForm]    = useState({ serviceId: “”, name: “”, price: “”, renewalDate: addDays(30), autoRenew: true, color: “#00e5a0”, icon: “📺”, url: “” });

const openAdd = () => {
setEditingSub(null);
setSubForm({ serviceId: “”, name: “”, price: “”, renewalDate: addDays(30), autoRenew: true, color: “#00e5a0”, icon: “📺”, url: “” });
setShowSheet(true);
};

const openEdit = (s) => {
setEditingSub(s);
setSubForm({ …s, price: String(s.price) });
setShowSheet(true);
};

const saveSub = () => {
if (!subForm.name.trim() || !subForm.price) return;
const preset = SERVICES.find(p => p.id === subForm.serviceId);
const s = {
id: editingSub?.id || genId(),
serviceId: subForm.serviceId,
name: subForm.name,
price: parseFloat(subForm.price.replace(”,”, “.”)),
renewalDate: subForm.renewalDate,
autoRenew: subForm.autoRenew,
color: preset?.color || subForm.color,
icon: preset?.icon || subForm.icon,
url: preset?.url || subForm.url,
};
setSubs(prev => {
const n = editingSub ? prev.map(x => x.id === editingSub.id ? s : x) : […prev, s];
LS.set(“ss_subs”, n);
return n;
});
setShowSheet(false);
};

return (
<div className="scr fu">
<div style={{ padding: “14px 0 12px”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px” }}>Subscriptions</h2>
<button className="btn bp bsm" onClick={openAdd}>
<Ico n="plus" /> Add
</button>
</div>

```
  <div className="card" style={{ padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
    <div>
      <p style={{ fontSize: 11, color: G.muted }}>Monthly</p>
      <p style={{ fontWeight: 800, fontSize: 20 }}>&euro;{totalMonthly.toFixed(2)}</p>
    </div>
    <div style={{ textAlign: "right" }}>
      <p style={{ fontSize: 11, color: G.muted }}>Current per year</p>
      <p style={{ fontWeight: 800, fontSize: 20 }}>{fmt(savings.huidigJaar)}</p>
    </div>
  </div>

  {subs.length === 0 && (
    <div className="card" style={{ padding: 40, textAlign: "center", color: G.muted }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
      <p>No subscriptions yet. Add one!</p>
    </div>
  )}

  {subs.map(sub => {
    const days    = daysLeft(sub.renewalDate);
    const st      = getStatus(sub);
    const wlCount = watchlist.filter(w => w.platform === sub.serviceId && w.status !== "finished").length;
    return (
      <div key={sub.id} className="card" style={{ marginBottom: 10, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: sub.color + "20", border: `2px solid ${sub.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            {sub.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{sub.name}</p>
            <p style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
              Renews {days <= 0 ? "today" : `in ${days} days`} &middot; {wlCount} title{wlCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 800, fontSize: 18 }}>&euro;{sub.price.toFixed(2)}</p>
            <p style={{ fontSize: 11, color: G.muted }}>/mo</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <span className={`tag ${st.cls}`}>
            <span className="dot" style={{ background: st.dot }} />{st.label}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="ib" title="Open app" onClick={() => openApp(sub.url, SERVICES.find(p => p.id === sub.serviceId)?.deepLink)}>
              <Ico n="open" />
            </button>
            <button className="ib" onClick={() => openEdit(sub)}><Ico n="edit" /></button>
            <button className="ib ib-del" onClick={() => setSubs(p => { const n = p.filter(s => s.id !== sub.id); LS.set("ss_subs", n); return n; })}>
              <Ico n="trash" />
            </button>
          </div>
        </div>
      </div>
    );
  })}

  {showSheet && (
    <SubSheet
      editingSub={editingSub}
      subForm={subForm}
      setSubForm={setSubForm}
      saveSub={saveSub}
      onClose={() => setShowSheet(false)}
    />
  )}
</div>
```

);
}
