import { NumberRange, OptionsPricingDataResponse, PriceModeTypeEnum } from '@/lib/types';
import { getPriceByMode } from './calculator';

export type PutPremiumPoint = {
    symbol: string;
    strike: number;
    movePct: number;
    premium: number;
    premiumPct: number;
    dte: number;
    annualizedPremiumPct: number;
}

export type BuildPutPremiumPointsParams = {
    data: Map<string, OptionsPricingDataResponse>;
    symbols: string[];
    expiry: string | null;
    moveRange: NumberRange;
    priceMode: PriceModeTypeEnum;
}

export const buildPutPremiumPoints = (params: BuildPutPremiumPointsParams): { points: PutPremiumPoint[], warnings: string[] } => {
    const { data, symbols, expiry, moveRange, priceMode } = params;
    const points: PutPremiumPoint[] = [];
    const warnings: string[] = [];

    const isLastDayOfThirdWeek = (dateStr: string): boolean => {
        const d = new Date(`${dateStr}T00:00:00Z`);
        return d.getUTCDay() === 5 && d.getUTCDate() > 14 && d.getUTCDate() <= 21;
    };

    const resolveExpiry = (expiryKeys: string[]): string | null => {
        const sorted = [...expiryKeys].sort();
        if (expiry) {
            return sorted.find(d => d >= expiry) ?? null;
        }
        const today = new Date().toISOString().slice(0, 10);
        return sorted.find(d => d >= today && isLastDayOfThirdWeek(d)) ?? sorted[0] ?? null;
    };

    for (const symbol of symbols) {
        const pricing = data.get(symbol);
        if (!pricing) {
            warnings.push(`${symbol}: no pricing data`);
            continue;
        }
        const { spotPrice } = pricing;
        if (!spotPrice || spotPrice <= 0) {
            warnings.push(`${symbol}: no valid spot price`);
            continue;
        }
        const expiryKeys = Object.keys(pricing.options);
        if (expiryKeys.length === 0) {
            warnings.push(`${symbol}: no expiry data`);
            continue;
        }

        const resolvedExpiry = resolveExpiry(expiryKeys);
        if (!resolvedExpiry) {
            warnings.push(`${symbol}: no expiry at or after ${expiry}`);
            continue;
        }

        const quoteEntries = Object.entries(pricing.options[resolvedExpiry]?.p ?? {});
        if (quoteEntries.length === 0) {
            warnings.push(`${symbol}: no puts for expiry ${resolvedExpiry}`);
            continue;
        }

        let pointCount = 0;
        const dte = Math.max(1, Math.round((new Date(`${resolvedExpiry}T00:00:00Z`).getTime() - Date.now()) / 86400000));
        for (const [strikeKey, quote] of quoteEntries) {
            const strike = Number(strikeKey);
            if (!Number.isFinite(strike) || strike <= 0) continue;
            const movePct = (spotPrice - strike) / spotPrice * 100;
            if (movePct < moveRange.start || movePct > moveRange.end) continue;
            const premium = getPriceByMode(quote, priceMode);
            if (premium == null || premium <= 0) continue;
            const premiumPct = premium / strike * 100;
            points.push({
                symbol,
                strike,
                movePct,
                premium,
                premiumPct,
                dte,
                annualizedPremiumPct: premiumPct * (365 / dte),
            });
            pointCount++;
        }
        if (pointCount === 0) {
            warnings.push(`${symbol}: no strikes in ${moveRange.start}%–${moveRange.end}% move range for expiry ${resolvedExpiry}`);
        }
    }
    return { points, warnings };
}