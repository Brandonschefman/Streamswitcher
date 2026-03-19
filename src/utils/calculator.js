// Calculates how long it takes to finish a series
export const calcBinge = (totalEpisodes, epDuration, eveningsPerWeek, minsPerEvening = 120) => {
if (!totalEpisodes || totalEpisodes < 1) return null;
const totalMins   = totalEpisodes * epDuration;
const minsPerWeek = eveningsPerWeek * minsPerEvening;
const weeks       = Math.ceil(totalMins / minsPerWeek);
const months      = Math.ceil(weeks / 4.3);
return { totalMins, weeks, months };
};

// Calculates yearly savings with Switch Strategy
export const calcSavings = (subs, plan) => {
const huidigJaar = subs.reduce((s, a) => s + a.price, 0) * 12;
if (!plan?.length) return { huidigJaar, strategieJaar: null, besparing: null };
const strategieJaar = plan
.filter(m => m.type === “active”)
.reduce((s, m) => s + m.price, 0);
return {
huidigJaar,
strategieJaar,
besparing: Math.max(0, huidigJaar - strategieJaar)
};
};
