import numeral from 'numeral';

export const percentageFormatter = (v: number) => v && Number(v).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) || '';
export const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', }).format;
export const currencyCompactFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format;
export const numberFormatter = new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format;
export const numberCompactFormatter = new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2, notation: 'compact' }).format;
export const positiveNegativeNumberFormatter = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }).format;
export const positiveNegativeNonDecimalFormatter = new Intl.NumberFormat('en-US', { style: 'decimal', signDisplay: 'always' }).format;
export const fixedCurrencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format;

export const humanAbsCurrencyFormatter = (tick: number) => {    
    return numeral(Math.abs(tick)).format('0.[0]a').toUpperCase();    
}