export interface BullRunWeek {
    wk: string;
    px: number;
    px4w_chg: number | null;
    atm30: number | null;
    c_skew: number | null;
    p_skew: number | null;
    term: number | null;
    ivpct: number | null;
    tot_vol: number | null;
    vol_z: number | null;
    n_unusual: number | null;
    unus_z: number | null;
    pc: number | null;
    score: number;
    b_cheap: number;
    b_drought: number;
    b_dryup: number;
    b_wing: number;
    trend_up: boolean;
    rule_pass: boolean;
    fwd4w_pct: number | null;
    fwd8w_pct: number | null;
}

export interface BullRunTally {
    n: number;
    hits: number;
    mean: number | null;
    worst: number | null;
}

export interface BullRunSummary {
    badge: BullRunWeek;
    signals: BullRunWeek[];
    evaluated: BullRunWeek[];
    all: BullRunTally;
    cheapTrend: BullRunTally;
    cheapTrendDrought: BullRunTally;
}

export const BULL_RUN_RULE = 'score >= 3 AND cheap AND trend';

// Trend gate needs 16 preceding weeks (sma13_prev) + the current week.
export const MIN_BULL_RUN_WEEKS = 17;

export const BULL_RUN_LOOKBACK_DAYS = 730;
