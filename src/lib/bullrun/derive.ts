import { BullRunSummary, BullRunTally, BullRunWeek, MIN_BULL_RUN_WEEKS } from './types';

const round1 = (n: number) => Math.round(n * 10) / 10;

export const tally = (rows: BullRunWeek[]): BullRunTally => {
    const fwd = rows
        .map(r => r.fwd4w_pct)
        .filter((v): v is number => v !== null);
    if (fwd.length === 0) return { n: 0, hits: 0, mean: null, worst: null };
    return {
        n: fwd.length,
        hits: fwd.filter(v => v > 0).length,
        mean: round1(fwd.reduce((a, b) => a + b, 0) / fwd.length),
        worst: round1(Math.min(...fwd)),
    };
};

export const isEvaluated = (r: BullRunWeek) => r.score >= 3 && r.fwd4w_pct !== null;
export const passesCheapTrend = (r: BullRunWeek) => r.b_cheap === 1 && r.trend_up;

export const deriveSummary = (rows: BullRunWeek[]): BullRunSummary | null => {
    if (rows.length < MIN_BULL_RUN_WEEKS) return null;
    const badge = rows[rows.length - 1];
    const signals = rows.filter(r => r.score >= 3);
    const evaluated = signals.filter(isEvaluated);
    const cheapTrend = evaluated.filter(passesCheapTrend);
    const cheapTrendDrought = cheapTrend.filter(r => r.b_drought === 1);
    return {
        badge,
        signals,
        evaluated,
        all: tally(evaluated),
        cheapTrend: tally(cheapTrend),
        cheapTrendDrought: tally(cheapTrendDrought),
    };
};
