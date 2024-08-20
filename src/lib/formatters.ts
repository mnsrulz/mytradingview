export const percentageFormatter = (v: number) => v && Number(v).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) || '';
export const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', }).format;
export const fixedCurrencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format;

export const humanAbsCurrencyFormatter = (tick: number) => {
    tick = Math.abs(tick);
    if (tick >= 1000000000) {
        return `${(tick / 1000000000).toFixed(1)}B`; // Billions
    } else if (tick >= 1000000) {
        return `${(tick / 1000000).toFixed(1)}M`; // Millions
    } else if (tick >= 1000) {
        return `${(tick / 1000).toFixed(1)}K`; // Thousands
    }
    return `${tick}`;
}