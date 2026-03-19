import { useState, useEffect, useRef } from ‘react’;
import Ico from ‘./ui/Ico.jsx’;
import { SERVICES, TMDB_PROV, svc } from ‘../utils/services.js’;
import { LS, genId } from ‘../utils/storage.js’;
import { fetchTMDB, fetchTMDBDetail, TMDB_IMG, getProviderIds } from ‘../utils/tmdb.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

export default function Suggestions({ watchlist, setWatchlist, subs }) {
const [items,      setItems]      = useState([]);
const [loading,    setLoading]    = useState(false);
const [error,      setError]      = useState(””);
const [filter,     setFilter]     = useState(“all”);
const [type,       setType]       = useState(“movie”);
const [detail,     setDetail]     = useState(null);
const [added,      setAdded]      = useState({});
const [pullY,      setPullY]      = useState(0);
const [refreshing, setRefreshing] = useState(false);
const touchStartY = useRef(0);
const wlTitles    = new Set(watchlist.map(w => w.title.toLowerCase()));

const load = async (mediaType, providerId) => {
setLoading(true);
setError(””);
try {
const results = await fetchTMDB(mediaType, providerId);
setItems(results);
} catch(e) {
setError(“Failed to load suggestions.”);
} finally {
setLoading(false);
setRefreshing(false);
}
};

useEffect(() => { load(“movie”, “all”); }, []);

const handleFilter = (f) => {
setFilter(f);
load(type, getProviderIds(f));
};

const handleType = (t) => {
setType(t);
load(t, getProviderIds(filter));
};

const addToWatchlist = async (item) => {
const title     = item.title || item.name || “Unknown”;
const platform  = filter !== “all” ? filter : subs[0]?.serviceId || “netflix”;
const mediaType = type === “movie” ? “movie” : “tv”;
let episodes = type === “movie” ? 1 : 10;
let seasons  = 1;
let epDuration = type === “movie” ? 120 : 45;
try {
const d = await fetchTMDBDetail(mediaType, item.id);
if (mediaType === “tv”) {
seasons    = d.number_of_seasons || 1;
episodes   = Math.round((d.number_of_episodes || 10) / (d.number_of_seasons || 1));
epDuration = d.episode_run_time?.[0] || 45;
} else {
epDuration = d.runtime || 120;
}
} catch(e) {}
const totalEpisodes = type === “movie” ? 1 : episodes * seasons;
const newItem = { id: genId(), title, platform, type: type === “movie” ? “movie” : “series”, episodes, seasons, epDuration, totalEpisodes, status: “not_started”, evenings: 3 };
setWatchlist(prev => { const n = […prev, newItem]; LS.set(“ss_watchlist”, n); return n; });
setAdded(a => ({ …a, [item.id]: true }));
setDetail(null);
};

const isAdded = (item) => added[item.id] || wlTitles.has((item.title || item.name || “”).toLowerCase());

// Pull to refresh
const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
const handleTouchMove  = (e) => {
const dy = e.touches[0].clientY - touchStartY.current;
if (dy > 0 && window.scrollY <= 10) setPullY(Math.min(dy, 72));
};
const handleTouchEnd   = () => {
if (pullY > 55) {
setRefreshing(true);
setPullY(0);
load(type, getProviderIds(filter));
} else {
setPullY(0);
}
};

const myProvs = TMDB_PROV
.filter(p => subs.some(s => s.serviceId === p.serviceId))
.filter((p, i, arr) => arr.findIndex(x => x.serviceId === p.serviceId) === i)
.map(p => ({ …p, …SERVICES.find(s => s.id === p.serviceId) }));

return (
<div className="scr fu" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>

```
  {(pullY > 0 || refreshing) && (
    <div style={{ textAlign: "center", padding: "10px 0 4px", fontSize: 13, color: G.muted, transform: `translateY(${pullY}px)`, transition: pullY === 0 ? "transform .3s" : "none" }}>
      {refreshing ? "🔄 Loading new titles..." : pullY > 55 ? "↑ Release to refresh" : "↓ Pull for new titles"}
    </div>
  )}

  <div style={{ padding: "14px 0 12px", transform: `translateY(${pullY}px)`, transition: pullY === 0 ? "transform .3s" : "none" }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>Suggestions</h2>
    <p style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>New movies &amp; series on your services</p>
  </div>

  {/* Movie / Series toggle */}
  <div style={{ display: "flex", background: G.surface, borderRadius: 12, padding: 4, border: `1px solid ${G.border}`, marginBottom: 12 }}>
    {[{ v: "movie", l: "🎬 Movies" }, { v: "tv", l: "📺 Series" }].map(({ v, l }) => (
      <button key={v} onClick={() => handleType(v)}
        style={{ flex: 1, padding: "9px", border: "none", cursor: "pointer", fontFamily: "Outfit,sans-serif", fontWeight: 600, fontSize: 14, borderRadius: 9, background: type === v ? G.card : "transparent", color: type === v ? G.text : G.muted }}>
        {l}
      </button>
    ))}
  </div>

  {/* Service filter */}
  <div className="mrow" style={{ marginBottom: 14 }}>
    <button onClick={() => handleFilter("all")}
      style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Outfit,sans-serif", fontWeight: 600, fontSize: 12, background: filter === "all" ? G.accent : G.border, color: filter === "all" ? "#08080f" : G.text }}>
      All
    </button>
    {myProvs.map(p => (
      <button key={p.serviceId} onClick={() => handleFilter(p.serviceId)}
        style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Outfit,sans-serif", fontWeight: 600, fontSize: 12, background: filter === p.serviceId ? p.color : G.border, color: filter === p.serviceId ? "white" : G.text }}>
        {p.icon} {p.name}
      </button>
    ))}
  </div>

  {loading && (
    <div style={{ textAlign: "center", padding: "60px 0", color: G.muted }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>⏳</p>
      <p>Loading...</p>
    </div>
  )}

  {error && (
    <div className="card" style={{ padding: 20, textAlign: "center", color: G.danger }}>
      <p>{error}</p>
      <button className="btn bg" style={{ marginTop: 12 }} onClick={() => load(type, getProviderIds(filter))}>Retry</button>
    </div>
  )}

  {!loading && !error && (
    <div className="pgrid">
      {items.map(item => {
        const title  = item.title || item.name || "Unknown";
        const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : "?";
        const year   = (item.release_date || item.first_air_date || "").slice(0, 4);
        const al     = isAdded(item);
        return (
          <div key={item.id} className="card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => setDetail(item)}>
            <div style={{ width: "100%", aspectRatio: "2/3", background: G.surface, position: "relative", overflow: "hidden" }}>
              {poster
                ? <img src={poster} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎬</div>
              }
              <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.75)", borderRadius: 8, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3 }}>
                <Ico n="star" size={10} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f7c948" }}>{rating}</span>
              </div>
              {al && (
                <div style={{ position: "absolute", top: 8, right: 8, background: G.accent, borderRadius: 8, padding: "3px 7px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#08080f" }}>✓</span>
                </div>
              )}
            </div>
            <div style={{ padding: "10px 10px 12px" }}>
              <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>{year}</p>
              <button className="btn"
                style={{ width: "100%", padding: "7px", fontSize: 12, borderRadius: 9, background: al ? G.border : G.accent, color: al ? G.muted : "#08080f", fontWeight: 700 }}
                onClick={e => { e.stopPropagation(); if (!al) addToWatchlist(item); }}>
                {al ? "✓ Added" : "+ Watchlist"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* Detail sheet */}
  {detail && (
    <div className="ov" onClick={e => e.target === e.currentTarget && setDetail(null)}>
      <div className="sh" style={{ display: "flex", flexDirection: "column", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, flexShrink: 0 }}>
          <button className="ib" onClick={() => setDetail(null)}><Ico n="x" /></button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, paddingBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            {detail.poster_path
              ? <img src={`${TMDB_IMG}${detail.poster_path}`} alt="" style={{ width: 90, height: 135, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: 90, height: 135, borderRadius: 12, background: G.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🎬</div>
            }
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.3, marginBottom: 6 }}>{detail.title || detail.name}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="tag ta"><Ico n="star" size={11} /> {detail.vote_average?.toFixed(1) || "?"}</span>
                <span className="tag ti">{(detail.release_date || detail.first_air_date || "").slice(0, 4)}</span>
              </div>
            </div>
          </div>
          {detail.overview && <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.6, marginBottom: 16 }}>{detail.overview}</p>}
          <button className="btn bp" style={{ width: "100%", padding: "14px" }}
            onClick={() => addToWatchlist(detail)} disabled={isAdded(detail)}>
            {isAdded(detail) ? "✓ Already in your watchlist" : "+ Add to watchlist"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}