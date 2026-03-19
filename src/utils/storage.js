export const LS = {
get: (k, d) => {
try {
const v = localStorage.getItem(k);
return v ? JSON.parse(v) : d;
} catch(e) {
return d;
}
},
set: (k, v) => {
try {
localStorage.setItem(k, JSON.stringify(v));
} catch(e) {}
}
};

export const genId = () => Math.random().toString(36).slice(2, 9);

export const addDays = (n) => {
const d = new Date();
d.setDate(d.getDate() + n);
return d.toISOString().split(“T”)[0];
};

export const daysLeft = (s) => {
if (!s) return 999;
return Math.ceil((new Date(s) - new Date()) / 864e5);
};

export const fmt = (n) => n != null ? `\u20AC${Number(n).toFixed(0)}` : “-”;
