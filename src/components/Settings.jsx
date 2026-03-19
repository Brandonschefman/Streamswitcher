import { useState } from ‘react’;
import Ico from ‘./ui/Ico.jsx’;
import Toggle from ‘./ui/Toggle.jsx’;
import { LS } from ‘../utils/storage.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

// ── PASSWORD SHEET ────────────────────────────────────────────────────────────
function PwSheet({ user, setUser, onClose }) {
const [form, setForm] = useState({ current: “”, next: “”, confirm: “” });
const [err,  setErr]  = useState(””);
const [ok,   setOk]   = useState(false);
const [show, setShow] = useState({ current: false, next: false, confirm: false });

const save = () => {
setErr(””);
if (!form.current || !form.next || !form.confirm) { setErr(“Please fill in all fields.”); return; }
if (form.current !== user.password)               { setErr(“Current password is incorrect.”); return; }
if (form.next.length < 6)                         { setErr(“Minimum 6 characters.”); return; }
if (form.next !== form.confirm)                   { setErr(“Passwords do not match.”); return; }
setUser(u => { const n = { …u, password: form.next }; LS.set(“ss_user”, n); return n; });
setOk(true);
setTimeout(() => onClose(), 1600);
};

return (
<div className=“ov” onClick={e => e.target === e.currentTarget && onClose()}>
<div className=“sh” style={{ display: “flex”, flexDirection: “column”, padding: “20px 20px 0” }}>
<div className=“hndl” style={{ flexShrink: 0 }} />
<h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, flexShrink: 0 }}>Change password</h3>
<div style={{ overflowY: “auto”, flex: 1 }}>
{ok ? (
<div style={{ textAlign: “center”, padding: “30px 0” }}>
<p style={{ fontSize: 52, marginBottom: 12 }}>✅</p>
<p style={{ fontWeight: 700, color: G.accent, fontSize: 18 }}>Password changed!</p>
</div>
) : (
<div style={{ display: “flex”, flexDirection: “column”, gap: 13, paddingBottom: 8 }}>
{[
{ k: “current”, l: “Current password”,  p: “••••••••”,           a: “current-password” },
{ k: “next”,    l: “New password”,       p: “Minimum 6 characters”, a: “new-password”  },
{ k: “confirm”, l: “Confirm password”,   p: “Repeat password”,    a: “new-password”    },
].map(({ k, l, p, a }) => (
<div key={k}>
<label className="lbl">{l}</label>
<div className="iw">
<input
className=“inp”
type={show[k] ? “text” : “password”}
placeholder={p}
autoComplete={a}
value={form[k]}
onChange={e => setForm(f => ({ …f, [k]: e.target.value }))}
/>
<button className=“eyeb” onClick={() => setShow(v => ({ …v, [k]: !v[k] }))} tabIndex={-1}>
<Ico n={show[k] ? “eyeoff” : “eye”} />
</button>
</div>
</div>
))}
{err && (
<p style={{ color: G.danger, fontSize: 13, background: “#2a1020”, padding: “10px 14px”, borderRadius: 10 }}>{err}</p>
)}
</div>
)}
</div>
{!ok && (
<div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 20, background: G.card }}>
<button className=“btn bp” style={{ width: “100%”, padding: “14px”, marginBottom: 8 }} onClick={save}>Save</button>
<button className=“btn bg” style={{ width: “100%” }} onClick={onClose}>Cancel</button>
</div>
)}
</div>
</div>
);
}

// ── SETTINGS SCREEN ───────────────────────────────────────────────────────────
export default function Settings({ user, setUser, notifs, setNotifs, upgradePremium }) {
const [showPwSheet,  setShowPwSheet]  = useState(false);
const [showPayment,  setShowPayment]  = useState(false);
const [notifEnabled, setNotifEnabled] = useState(notifs?.enabled !== false);

const shareApp = () => {
if (navigator.share) {
navigator.share({ title: “StreamSwitch”, text: “Manage your streaming subscriptions smarter!”, url: “https://streamswitcher.vercel.app” });
} else {
navigator.clipboard?.writeText(“https://streamswitcher.vercel.app”);
alert(“Link copied to clipboard!”);
}
};

const toggleNotifs = async () => {
if (!notifEnabled) {
if (“Notification” in window) {
const perm = await Notification.requestPermission();
if (perm === “granted”) {
setNotifEnabled(true);
setNotifs(n => ({ …n, enabled: true }));
new Notification(“StreamSwitch”, { body: “Notifications enabled! 🎉”, icon: “/icon.png” });
} else {
alert(“Please allow notifications in your browser settings.”);
}
}
} else {
setNotifEnabled(false);
setNotifs(n => ({ …n, enabled: false }));
}
};

return (
<div className="scr fu">
<div style={{ padding: “14px 0 16px” }}>
<h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px” }}>Settings</h2>
</div>

```
  {/* Account */}
  <div className="card" style={{ marginBottom: 14 }}>
    <div style={{ padding: "16px 16px 12px" }}>
      <p style={{ fontSize: 11, color: G.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Account</p>
      <p style={{ fontSize: 11, color: G.muted }}>Email</p>
      <p style={{ fontWeight: 600, marginBottom: 10 }}>{user.email}</p>
      <p style={{ fontSize: 11, color: G.muted }}>Plan</p>
      <p style={{ fontWeight: 600, color: user.isPremium ? G.premium : G.text }}>{user.isPremium ? "⭐ Premium" : "Free"}</p>
    </div>
    <div style={{ height: 1, background: G.border }} />
    <button className="btn bg" style={{ margin: 12, width: "calc(100% - 24px)", justifyContent: "flex-start", gap: 10 }}
      onClick={() => setShowPwSheet(true)}>
      🔑 Change password
    </button>
  </div>

  {/* Notifications */}
  <div className="card" style={{ marginBottom: 14, padding: "16px" }}>
    <p style={{ fontSize: 11, color: G.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Notifications</p>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: 15 }}>🔔 Push notifications</p>
        <p style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Renewal reminders &amp; updates</p>
      </div>
      <Toggle value={notifEnabled} onChange={toggleNotifs} />
    </div>
  </div>

  {/* Premium upgrade */}
  {!user.isPremium && (
    <div className="card" style={{ marginBottom: 14, padding: 16, background: "linear-gradient(135deg,#1a1400,#0a0a00)", border: "1px solid #f7c94833" }}>
      <p style={{ fontSize: 11, color: G.premium, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Premium</p>
      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Unlock Switch Strategy</p>
      <p style={{ fontSize: 13, color: G.muted, marginBottom: 12 }}>Save up to 50% on your subscriptions with smart rotation planning.</p>
      <button className="btn bprem" style={{ width: "100%" }} onClick={() => setShowPayment(true)}>
        ✨ Upgrade to Premium &mdash; &euro;10/year
      </button>
    </div>
  )}

  {/* Share */}
  <div className="card" style={{ marginBottom: 14, padding: 16 }}>
    <p style={{ fontSize: 11, color: G.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Share</p>
    <button className="btn bg" style={{ width: "100%", justifyContent: "flex-start", gap: 10 }} onClick={shareApp}>
      📤 Share StreamSwitch
    </button>
  </div>

  {/* Sign out */}
  <button className="btn bd" style={{ width: "100%", marginTop: 4 }}
    onClick={() => { setUser(null); LS.set("ss_user", null); }}>
    Sign out
  </button>
  <p style={{ textAlign: "center", fontSize: 11, color: G.muted, marginTop: 14 }}>StreamSwitch v4.0</p>

  {/* Password sheet */}
  {showPwSheet && <PwSheet user={user} setUser={setUser} onClose={() => setShowPwSheet(false)} />}

  {/* Payment demo sheet */}
  {showPayment && (
    <div className="ov" onClick={e => e.target === e.currentTarget && setShowPayment(false)}>
      <div className="sh" style={{ display: "flex", flexDirection: "column", padding: "20px 20px 0" }}>
        <div className="hndl" style={{ flexShrink: 0 }} />
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, flexShrink: 0 }}>Upgrade to Premium</h3>
        <p style={{ color: G.muted, fontSize: 13, marginBottom: 20, flexShrink: 0 }}>One-time payment, lifetime access</p>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ background: G.card, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: G.muted }}>StreamSwitch Premium</span>
              <span style={{ fontWeight: 700 }}>&euro;10.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.muted }}>VAT</span>
              <span style={{ fontWeight: 700 }}>&euro;0.00</span>
            </div>
            <div style={{ height: 1, background: G.border, margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, color: G.accent }}>&euro;10.00</span>
            </div>
          </div>
          <div style={{ background: G.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: G.muted, marginBottom: 8 }}>💳 Card number</p>
            <input className="inp" placeholder="1234 5678 9012 3456" style={{ marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <input className="inp" placeholder="MM/YY" style={{ flex: 1 }} />
              <input className="inp" placeholder="CVV" style={{ flex: 1 }} />
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 20, background: G.card }}>
          <button className="btn bprem" style={{ width: "100%", padding: 16, marginBottom: 8 }}
            onClick={() => { upgradePremium(); setShowPayment(false); alert("🎉 Welcome to Premium! (Demo mode)"); }}>
            Pay &euro;10.00
          </button>
          <button className="btn bg" style={{ width: "100%" }} onClick={() => setShowPayment(false)}>Cancel</button>
          <p style={{ textAlign: "center", fontSize: 11, color: G.muted, marginTop: 12 }}>🔒 Demo mode &mdash; no real payment processed</p>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}
