'use client';
import { Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { WidgetShell } from './WidgetShell';
import { useBullRunSignal } from '@/lib/bullrun/useBullRunSignal';
import { BullRunTally, BullRunWeek, MIN_BULL_RUN_WEEKS } from '@/lib/bullrun/types';

const BOXES: { key: keyof BullRunWeek; label: string; hint: string }[] = [
    { key: 'b_cheap', label: 'Cheap', hint: 'IV30 percentile ≤ 25' },
    { key: 'b_drought', label: 'Drought', hint: 'Unusual-trade count z ≤ −1 (8w)' },
    { key: 'b_dryup', label: 'Dryup', hint: 'Weekly volume z ≤ −1 (8w)' },
    { key: 'b_wing', label: 'Wing', hint: 'IV(15% OTM call) > ATM (30d)' },
];

const pct = (v: number | null) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v}%`);

const TallyLine = ({ label, tally: t }: { label: string; tally: BullRunTally }) => (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}:{' '}
        {t.n === 0
            ? 'no evaluated signals'
            : `${t.hits}/${t.n} hits · ${pct(t.mean)} avg · ${pct(t.worst)} worst`}
    </Typography>
);

export const BullRunSignalWidget = ({ symbol }: { symbol: string }) => {
    const { badge, summary, isLoading, error, noData, insufficientHistory } =
        useBullRunSignal(symbol);

    let content: React.ReactNode = null;
    if (noData) {
        content = (
            <Typography variant="body2" color="text.secondary">
                No signal data for this symbol.
            </Typography>
        );
    } else if (insufficientHistory) {
        content = (
            <Typography variant="body2" color="text.secondary">
                Insufficient history — needs {MIN_BULL_RUN_WEEKS} weeks.
            </Typography>
        );
    } else if (badge && summary) {
        content = (
            <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Chip
                        label={badge.rule_pass ? 'ON' : 'OFF'}
                        color={badge.rule_pass ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        as of {badge.wk} · score {badge.score}/4
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                    {BOXES.map(box => {
                        const passed = badge[box.key] === 1;
                        return (
                            <Tooltip key={box.key} title={box.hint} placement="top">
                                <Chip
                                    icon={passed ? <CheckCircleIcon /> : <CancelIcon />}
                                    label={box.label}
                                    size="small"
                                    variant={passed ? 'filled' : 'outlined'}
                                    color={passed ? 'success' : 'default'}
                                    sx={{ height: 22, '& .MuiChip-icon': { fontSize: 14 } }}
                                />
                            </Tooltip>
                        );
                    })}
                    <Tooltip
                        title="Price > SMA13 and SMA13 > SMA13 (4w ago)"
                        placement="top"
                    >
                        <Chip
                            icon={badge.trend_up ? <TrendingUpIcon /> : <TrendingDownIcon />}
                            label="Trend"
                            size="small"
                            variant={badge.trend_up ? 'filled' : 'outlined'}
                            color={badge.trend_up ? 'success' : 'default'}
                            sx={{ height: 22, '& .MuiChip-icon': { fontSize: 14 } }}
                        />
                    </Tooltip>
                </Stack>

                <Divider />

                <Stack>
                    <TallyLine label="All signals" tally={summary.all} />
                    <TallyLine label="Cheap ∧ trend" tally={summary.cheapTrend} />
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                        in-sample research · forward 4-week returns
                    </Typography>
                </Stack>
            </Stack>
        );
    } else {
        content = null;
    }

    return (
        <WidgetShell title="Bull-Run Signal" loading={isLoading} error={error}>
            {content}
        </WidgetShell>
    );
};
