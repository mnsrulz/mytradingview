import { BullRunWeek } from './types';

type RawRow = Record<string, unknown>;

// The dynamic query service returns some integer columns (score, b_*, vol_z…)
// as JSON strings; coerce everything numeric in one place (design.md D3).
const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const toBool = (v: unknown): boolean =>
    typeof v === 'boolean' ? v : v === 'true' || v === 1 || v === '1';

export const normalizeWeek = (raw: RawRow): BullRunWeek | null => {
    const wk = typeof raw.wk === 'string' ? raw.wk : null;
    const px = toNum(raw.px);
    if (!wk || px === null) return null;
    return {
        wk,
        px,
        px4w_chg: toNum(raw.px4w_chg),
        atm30: toNum(raw.atm30),
        c_skew: toNum(raw.c_skew),
        p_skew: toNum(raw.p_skew),
        term: toNum(raw.term),
        ivpct: toNum(raw.ivpct),
        tot_vol: toNum(raw.tot_vol),
        vol_z: toNum(raw.vol_z),
        n_unusual: toNum(raw.n_unusual),
        unus_z: toNum(raw.unus_z),
        pc: toNum(raw.pc),
        score: toNum(raw.score) ?? 0,
        b_cheap: toNum(raw.b_cheap) ?? 0,
        b_drought: toNum(raw.b_drought) ?? 0,
        b_dryup: toNum(raw.b_dryup) ?? 0,
        b_wing: toNum(raw.b_wing) ?? 0,
        trend_up: toBool(raw.trend_up),
        rule_pass: toBool(raw.rule_pass),
        fwd4w_pct: toNum(raw.fwd4w_pct),
        fwd8w_pct: toNum(raw.fwd8w_pct),
    };
};

export const normalizeWeeks = (rows: RawRow[]): BullRunWeek[] =>
    rows.map(normalizeWeek).filter((r): r is BullRunWeek => r !== null);
