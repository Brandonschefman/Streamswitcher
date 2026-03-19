export const SERVICES = [
{ id: “netflix”,   name: “Netflix”,     price: 17.99, color: “#E50914”, icon: “🎬”, url: “https://netflix.com”,        deepLink: “netflix://”    },
{ id: “prime”,     name: “Prime Video”, price: 8.99,  color: “#00A8E0”, icon: “📦”, url: “https://primevideo.com”,     deepLink: “aiv://”        },
{ id: “disney”,    name: “Disney+”,     price: 13.99, color: “#113CCF”, icon: “🏰”, url: “https://disneyplus.com”,     deepLink: “disneyplus://” },
{ id: “hbo”,       name: “HBO Max”,     price: 15.99, color: “#7B2FBE”, icon: “👑”, url: “https://play.max.com”,       deepLink: “max://”        },
{ id: “apple”,     name: “Apple TV+”,   price: 9.99,  color: “#888888”, icon: “🍎”, url: “https://tv.apple.com”,       deepLink: “videos://”     },
{ id: “videoland”, name: “Videoland”,   price: 7.99,  color: “#FF6B00”, icon: “🇳🇱”, url: “https://www.videoland.com”,  deepLink: “videoland://”  },
];

export const TMDB_PROV = [
{ tmdbId: 8,    serviceId: “netflix”   },
{ tmdbId: 119,  serviceId: “prime”     },
{ tmdbId: 337,  serviceId: “disney”    },
{ tmdbId: 118,  serviceId: “hbo”       },
{ tmdbId: 1899, serviceId: “hbo”       },
{ tmdbId: 350,  serviceId: “apple”     },
{ tmdbId: 39,   serviceId: “videoland” },
];

export const MONTHS = [“Jan”,“Feb”,“Mar”,“Apr”,“May”,“Jun”,“Jul”,“Aug”,“Sep”,“Oct”,“Nov”,“Dec”];

export const svc = (id) => SERVICES.find(s => s.id === id) || SERVICES[0];

export const openApp = (url, deepLink) => {
const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
if (isMobile && deepLink) {
const a = document.createElement(“a”);
a.href = deepLink;
a.style.display = “none”;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
const t = setTimeout(() => window.open(url, “_blank”), 1500);
window.addEventListener(“blur”, () => clearTimeout(t), { once: true });
} else {
window.open(url, “_blank”);
}
};
