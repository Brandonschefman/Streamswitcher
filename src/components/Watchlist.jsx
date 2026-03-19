import { useState } from ‘react’;
import Ico from ‘./ui/Ico.jsx’;
import Toggle from ‘./ui/Toggle.jsx’;
import BingeCalculator from ‘./BingeCalculator.jsx’;
import { svc, openApp, SERVICES } from ‘../utils/services.js’;
import { LS, genId } from ‘../utils/storage.js’;
import { calcBinge } from ‘../utils/calculator.js’;
import { fetchTMDBDetail, TMDB_IMG } from ‘../utils/tmdb.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

// ── WATCH CARD ────────────────────────────────────────────────────────────────
function WatchCard({ item, onEdit, onDelete, onToggleWatched }) {
const service  = svc(item.platform);
const totalEps = item.totalEpisodes != null ? item.totalEpisodes : (item.episodes || 0) * (item.seasons || 1);
const binge    = item.type === “series” ? calcBinge(totalEps, item.epDuration || 45, item.evenings || 3) : null;
const watched  = item.status === “finished”;
const watching = item.status === “watching”;

return (
<div className=“card” style={{ marginBottom: 10, padding: 16, opacity: watched ? 0.55 : 1 }}>
<div style={{ display: “flex”, alignItems: “flex-start”, gap: 12 }}>
<div
style={{ width: 48, height: 48, borderRadius: 12, background: service.color + “22”, border: `2px solid ${service.color}40`, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 24, flexShrink: 0, cursor: “pointer” }}
onClick={() => openApp(service.url, service.deepLink)}
>
{service.icon}
</div>
<div style={{ flex: 1, minWidth: 0 }}>
<p style={{ fontWeight: 700, fontSize: 15, textDecoration: watched ? “line-through” : “none”, overflow: “hidden”, textOverflow: “ellipsis”, whiteSpace: “nowrap” }}>
{item.title}
</p>
<div style={{ display: “flex”, gap: 6, flexWrap: “wrap”, marginTop: 5 }}>
<span className=“tag ti” style={{ fontSize: 10 }}>{service.name}</span>
<span className=“tag ti” style={{ fontSize: 10 }}>{item.type === “movie” ? “🎬 Movie” : “📺 Series”}</span>
{watching && <span className=“tag tl” style={{ fontSize: 10 }}>▶ Watching</span>}
{watched  && <span className=“tag ta” style={{ fontSize: 10 }}>✓ Done</span>}
</div>
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: 6 }}>
<button className=“ib” onClick={() => onEdit(item)}><Ico n="edit" /></button>
<button className=“ib ib-del” onClick={() => onDelete(item.id)}><Ico n="trash" /></button>
</div>
</div>

```
  {binge && !watched && (
    <div style={{ marginTop: 10, padding: "10px 12px", background: G.surface, borderRadius: 12, border: `1px solid ${G.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Ico n="clock" size={12} />
        <p style={{ fontSize: 12, color: G.muted }}>Estimated watch time</p>
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: G.accent }}>
        {binge.weeks} week{binge.weeks !== 1 ? "s" : ""} &middot; {binge.months} month{binge.months !== 1 ? "s" : ""} on {service.name}
      </p>
      {binge.months > 1 && (
        <p style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
          💡 Plan {binge.months} consecutive months of {service.name}
        </p>
      )}
    </div>
  )}

  {!watched && (
    <button
      className="btn bg"
      style={{ width: "100%", marginTop: 10, padding: "8px", fontSize: 13 }}
      onClick={() => onToggleWatched(item.id, watched)}
    >
      {watching ? "✅ Mark as finished" : "▶ Start watching"}
    </button>
  )}
</div>
```

);
}

// ── WATCH SHEET ───────────────────────────────────────────────────────────────
function WatchSheet({ item, onSave, onClose }) {
const [form, setForm] = useState(item || {
title: “”, platform: “netflix”, type: “series”,
episodes: 10, epDuration: 45, seasons: 1, status: “not_started”, evenings: 3
});
const upd      = (k, v) => setForm(f => ({ …f, [k]: v }));
const totalEps = (form.episodes || 0) * (form.seasons || 1);
const binge    = form.type === “series” ? calcBinge(totalEps, form.epDuration, form.evenings) : null;

return (
<div className=“ov” onClick={e => e.target === e.currentTarget && onClose()}>
<div className=“sh” style={{ display: “flex”, flexDirection: “column”, padding: “20px 20px 0” }}>
<div className=“hndl” style={{ flexShrink: 0 }} />
<h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 18, flexShrink: 0 }}>
{item ? “Edit” : “Add to watchlist”}
</h3>
<div style={{ overflowY: “auto”, flex: 1 }}>
<div style={{ display: “flex”, flexDirection: “column”, gap: 13, paddingBottom: 8 }}>
<div>
<label className="lbl">Title</label>
<input className=“inp” placeholder=“E.g. The Bear” value={form.title} onChange={e => upd(“title”, e.target.value)} />
</div>
<div>
<label className="lbl">Streaming service</label>
<select className=“inp” value={form.platform} onChange={e => upd(“platform”, e.target.value)}>
{SERVICES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
</select>
</div>
<div>
<label className="lbl">Type</label>
<div style={{ display: “flex”, gap: 8 }}>
{[{ v: “series”, l: “📺 Series” }, { v: “movie”, l: “🎬 Movie” }].map(({ v, l }) => (
<button key={v} className=“btn bsm”
style={{ flex: 1, background: form.type === v ? G.accent : G.border, color: form.type === v ? “#08080f” : G.text }}
onClick={() => upd(“type”, v)}>{l}</button>
))}
</div>
</div>
{form.type === “series” && (
<>
<div style={{ display: “flex”, gap: 10 }}>
<div style={{ flex: 1 }}>
<label className="lbl">Episodes per season</label>
<input className=“inp” type=“text” inputMode=“numeric” placeholder=“10”
value={form.episodes} onChange={e => upd(“episodes”, parseInt(e.target.value) || 0)} />
</div>
<div style={{ flex: 1 }}>
<label className="lbl">Seasons</label>
<input className=“inp” type=“text” inputMode=“numeric” placeholder=“1”
value={form.seasons} onChange={e => upd(“seasons”, parseInt(e.target.value) || 1)} />
</div>
</div>
{totalEps > 1 && (
<p style={{ fontSize: 12, color: G.muted, marginTop: -4 }}>
Total: <strong style={{ color: G.text }}>{totalEps}</strong> episodes
</p>
)}
<BingeCalculator
totalEpisodes={totalEps}
epDuration={form.epDuration}
setEpDuration={v => upd(“epDuration”, v)}
evenings={form.evenings}
setEvenings={v => upd(“evenings”, v)}
/>
</>
)}
</div>
</div>
<div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 20, background: G.card }}>
<div style={{ display: “flex”, gap: 8 }}>
<button className=“btn bp” style={{ flex: 1, padding: “13px” }}
onClick={() => { if (form.title.trim()) onSave({ …form, totalEpisodes: totalEps }); }}>
{item ? “Save” : “Add”}
</button>
<button className=“btn bg” style={{ flex: 1 }} onClick={onClose}>Cancel</button>
</div>
</div>
</div>
</div>
);
}

// ── WATCHLIST SCREEN ──────────────────────────────────────────────────────────
export default function Watchlist({ watchlist, setWatchlist }) {
const [showSheet, setShowSheet] = useState(false);
const [editItem,  setEditItem]  = useState(null);
const [filter,    setFilter]    = useState(“all”);

const save = (form) => {
const updated = { …form, id: editItem?.id || genId() };
setWatchlist(prev => {
const next = editItem ? prev.map(x => x.id === editItem.id ? updated : x) : […prev, updated];
LS.set(“ss_watchlist”, next);
return next;
});
setShowSheet(false);
setEditItem(null);
};

const del = (id) => setWatchlist(prev => {
const n = prev.filter(x => x.id !== id);
LS.set(“ss_watchlist”, n);
return n;
});

const toggleWatched = (id, wasWatched) => setWatchlist(prev => {
const n = prev.map(x => x.id === id
? { …x, status: wasWatched ? “not_started” : x.status === “watching” ? “finished” : “watching” }
: x
);
LS.set(“ss_watchlist”, n);
return n;
});

const filters = [
{ v: “all”,         l: “All”,      count: watchlist.length },
{ v: “not_started”, l: “To watch”, count: watchlist.filter(w => w.status === “not_started”).length },
{ v: “watching”,    l: “Watching”, count: watchlist.filter(w => w.status === “watching”).length },
{ v: “finished”,    l: “Finished”, count: watchlist.filter(w => w.status === “finished”).length },
];
const filtered = filter === “all” ? watchlist : watchlist.filter(w => w.status === filter);

return (
<div className="scr fu">
<div style={{ padding: “14px 0 12px”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px” }}>Watchlist</h2>
<button className=“btn bp bsm” onClick={() => { setEditItem(null); setShowSheet(true); }}>
<Ico n="plus" /> Add
</button>
</div>

```
  <div className="mrow" style={{ marginBottom: 14 }}>
    {filters.map(f => (
      <button key={f.v} onClick={() => setFilter(f.v)}
        style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Outfit,sans-serif", fontWeight: 600, fontSize: 12, background: filter === f.v ? G.accent : G.border, color: filter === f.v ? "#08080f" : G.text }}>
        {f.l}{f.count > 0 && <span style={{ opacity: 0.7 }}> ({f.count})</span>}
      </button>
    ))}
  </div>

  {filtered.length === 0 && (
    <div className="card" style={{ padding: 40, textAlign: "center", color: G.muted }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>🎬</p>
      <p style={{ fontWeight: 600, color: G.text, marginBottom: 6 }}>Nothing here yet</p>
      <p style={{ fontSize: 14 }}>Add a movie or series to get started</p>
    </div>
  )}

  {filtered.map(item => (
    <WatchCard
      key={item.id}
      item={item}
      onEdit={i => { setEditItem(i); setShowSheet(true); }}
      onDelete={del}
      onToggleWatched={toggleWatched}
    />
  ))}

  {showSheet && (
    <WatchSheet
      item={editItem}
      onSave={save}
      onClose={() => { setShowSheet(false); setEditItem(null); }}
    />
  )}
</div>
```

);
}
