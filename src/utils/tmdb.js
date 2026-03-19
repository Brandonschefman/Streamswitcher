import { TMDB_PROV } from ‘./services.js’;

export const TMDB_KEY  = “8a6c1e23359e4993fe7f24755991788d”;
export const TMDB_BASE = “https://api.themoviedb.org/3”;
export const TMDB_IMG  = “https://image.tmdb.org/t/p/w500”;

// Get provider IDs for a service (some services have multiple IDs)
export const getProviderIds = (serviceId) => {
if (serviceId === “all”) return “all”;
const ids = TMDB_PROV.filter(x => x.serviceId === serviceId).map(x => x.tmdbId);
return ids.length ? ids.join(”|”) : “all”;
};

// Fetch movies or series from TMDB
export const fetchTMDB = async (mediaType, providerId) => {
const url = providerId === “all”
? `${TMDB_BASE}/discover/${mediaType}?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&watch_region=NL&with_watch_monetization_types=flatrate|free|subscription`
: `${TMDB_BASE}/discover/${mediaType}?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&watch_region=NL&with_watch_providers=${providerId}&with_watch_monetization_types=flatrate|free|subscription`;

const res  = await fetch(url);
if (!res.ok) throw new Error(“TMDB fetch failed”);
const data = await res.json();
return data.results?.slice(0, 20) || [];
};

// Fetch details for a single movie or series
export const fetchTMDBDetail = async (mediaType, id) => {
const res = await fetch(`${TMDB_BASE}/${mediaType}/${id}?api_key=${TMDB_KEY}&language=en-US`);
if (!res.ok) throw new Error(“TMDB detail fetch failed”);
return res.json();
};
