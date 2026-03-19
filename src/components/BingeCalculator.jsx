import Ico from ‘./ui/Ico.jsx’;
import { calcBinge } from ‘../utils/calculator.js’;

const G = {
bg: “#08080f”, surface: “#101018”, card: “#14141f”, border: “#1e1e2e”,
accent: “#00e5a0”, warn: “#ff6b35”, danger: “#ff3b5c”,
text: “#f0f0f8”, muted: “#5a5a7a”, premium: “#f7c948”
};

export default function BingeCalculator({ totalEpisodes, epDuration, setEpDuration, evenings, setEvenings }) {
if (!totalEpisodes || totalEpisodes < 2) return null;
const result = calcBinge(totalEpisodes, epDuration, evenings);

return (
<div className=“binge-box” style={{ marginTop: 14 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8, marginBottom: 12 }}>
<Ico n="clock" size={16} />
<p style={{ fontWeight: 700, fontSize: 14, color: G.accent }}>Binge Calculator</p>
</div>

```
  <div style={{ marginBottom: 12 }}>
    <label className="lbl">Episode duration</label>
    <div style={{ display: "flex", gap: 8 }}>
      {[30, 45, 60].map(m => (
        <button
          key={m}
          className="btn bsm"
          onClick={() => setEpDuration(m)}
          style={{
            flex: 1,
            background: epDuration === m ? G.accent : G.border,
            color: epDuration === m ? "#08080f" : G.text,
          }}
        >
          {m} min
        </button>
      ))}
    </div>
  </div>

  <div style={{ marginBottom: 12 }}>
    <label className="lbl">
      Evenings per week: <strong style={{ color: G.text }}>{evenings}</strong>
    </label>
    <input
      type="range" min={1} max={7} value={evenings}
      onChange={e => setEvenings(Number(e.target.value))}
    />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted, marginTop: 4 }}>
      <span>1 evening</span>
      <span>7 evenings</span>
    </div>
  </div>

  {result && (
    <div style={{ background: "rgba(0,229,160,.08)", border: "1px solid rgba(0,229,160,.2)", borderRadius: 12, padding: 12, textAlign: "center" }}>
      <p style={{ fontSize: 13, color: G.muted, marginBottom: 4 }}>
        {totalEpisodes} eps &times; {epDuration} min ={" "}
        <strong style={{ color: G.text }}>
          {Math.floor(result.totalMins / 60)}h {result.totalMins % 60}m
        </strong>{" "}total
      </p>
      <p style={{ fontSize: 16, fontWeight: 800, color: G.accent }}>
        &asymp; {result.weeks} {result.weeks === 1 ? "week" : "weeks"} to finish
      </p>
      <p style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
        &rarr; Recommended:{" "}
        <strong style={{ color: G.text }}>
          {result.months} month{result.months !== 1 ? "s" : ""} subscription
        </strong>
      </p>
    </div>
  )}
</div>
```

);
}