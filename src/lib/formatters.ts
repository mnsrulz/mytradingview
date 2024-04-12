export const percentageFormatter = (v: number) => v && Number(v).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) || '';
export const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', }).format;
export const fixedCurrencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format;
