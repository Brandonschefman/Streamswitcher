export default function Toggle({ value, onChange, disabled = false }) {
return (
<button
onClick={() => !disabled && onChange(!value)}
style={{
width: 46,
height: 26,
borderRadius: 13,
border: “none”,
cursor: disabled ? “not-allowed” : “pointer”,
background: value && !disabled ? “#00e5a0” : “#1e1e2e”,
transition: “background .18s”,
position: “relative”,
flexShrink: 0,
opacity: disabled ? 0.4 : 1,
}}
>
<div style={{
width: 20,
height: 20,
borderRadius: “50%”,
background: “white”,
position: “absolute”,
top: 3,
left: value && !disabled ? 23 : 3,
transition: “left .18s”,
}} />
</button>
);
}