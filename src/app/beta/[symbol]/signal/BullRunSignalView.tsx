'use client';
import { useMemo, useState } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, Divider, Skeleton, Stack, Table, TableBody,
    TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { green, red, grey } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';
import { useBullRunSignal } from '@/lib/bullrun/useBullRunSignal';
import {
    BullRunTally, BullRunWeek, MIN_BULL_RUN_WEEKS, BULL_RUN_RULE,
} from '@/lib/bullrun/types';

const BOXES: { key: 'b_cheap' | 'b_drought' | 'b_dryup' | 'b_wing'; label: string; hint: string }[] = [
    { key: 'b_cheap', label: 'Cheap', hint: 'IV30 percentile ≤ 25' },
    { key: 'b_drought', label: 'Drought', hint: 'Unusual-trade count z ≤ −1 (8w)' },
    { key: 'b_dryup', label: 'Dryup', hint: 'Weekly volume z ≤ −1 (8w)' },
    { key: 'b_wing', label: 'Wing', hint: 'IV(15% OTM call) > ATM (30d)' },
];

const pct = (v: number | null) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v}%`);

type HistoryRow = BullRunWeek & { id: string };

const BoxIcon = ({ passed }: { passed: boolean }) =>
    passed
        ? <CheckCircleIcon color="success" fontSize="small" />
        : <CancelIcon sx={{ color: grey[400] }} fontSize="small" />;

const StatTable = ({ rows }: { rows: { label: string; tally: BullRunTally }[] }) => (
    <Table size="small">
        <TableHead>
            <TableRow>
                <TableCell>Variant</TableCell>
                <TableCell align="right">Signals</TableCell>
                <TableCell align="right">Hits</TableCell>
                <TableCell align="right">Mean fwd 4w</TableCell>
                <TableCell align="right">Worst fwd 4w</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {rows.map(({ label, tally: t }) => (
                <TableRow key={label}>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">{t.n}</TableCell>
                    <TableCell align="right">{t.n === 0 ? '—' : `${t.hits}/${t.n}`}</TableCell>
                    <TableCell align="right">{pct(t.mean)}</TableCell>
                    <TableCell align="right" sx={{ color: t.worst !== null && t.worst < 0 ? red[700] : undefined }}>
                        {pct(t.worst)}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
            <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                    {title}
                </Typography>
                {children}
            </Stack>
        </CardContent>
    </Card>
);

export const BullRunSignalView = ({ symbol }: { symbol: string }) => {
    const { rows, badge, summary, isLoading, error, noData, insufficientHistory } =
        useBullRunSignal(symbol);
    const [signalsOnly, setSignalsOnly] = useState(true);

    const historyRows: HistoryRow[] = useMemo(() => {
        const source = summary
            ? signalsOnly
                ? summary.signals
                : rows
            : [];
        return source.map(r => ({ ...r, id: r.wk }));
    }, [signalsOnly, rows, summary]);

    const columns = useMemo<GridColDef<HistoryRow>[]>(() => [
        { field: 'wk', headerName: 'Week', width: 110 },
        { field: 'px', headerName: 'Price', width: 90, type: 'number' },
        { field: 'score', headerName: 'Score', width: 75, type: 'number' },
        ...(['b_cheap', 'b_drought', 'b_dryup', 'b_wing'] as const).map(k => ({
            field: k,
            headerName: BOXES.find(b => b.key === k)!.label,
            width: 95,
            renderCell: (params: GridRenderCellParams<HistoryRow>) =>
                <BoxIcon passed={params.row[k] === 1} />,
        })),
        {
            field: 'trend_up',
            headerName: 'Trend',
            width: 80,
            renderCell: (params: GridRenderCellParams<HistoryRow>) =>
                params.row.trend_up
                    ? <TrendingUpIcon color="success" fontSize="small" />
                    : <TrendingDownIcon sx={{ color: grey[400] }} fontSize="small" />,
        },
        {
            field: 'rule_pass',
            headerName: 'Rule',
            width: 80,
            renderCell: (params: GridRenderCellParams<HistoryRow>) =>
                params.row.rule_pass
                    ? <Chip label="ON" color="success" size="small" sx={{ height: 20, fontWeight: 700 }} />
                    : <Typography variant="caption" color="text.secondary">—</Typography>,
        },
        ...(['fwd4w_pct', 'fwd8w_pct'] as const).map(k => ({
            field: k,
            headerName: k === 'fwd4w_pct' ? 'Fwd 4w' : 'Fwd 8w',
            width: 100,
            type: 'number' as const,
            renderCell: (params: GridRenderCellParams<HistoryRow>) => {
                const v = params.value ?? null;
                return v === null
                    ? <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>open</Typography>
                    : <Typography variant="caption" sx={{ color: v > 0 ? green[700] : red[700] }}>{pct(v)}</Typography>;
            },
        })),
    ], []);

    if (isLoading) {
        return (
            <Stack spacing={2}>
                <Skeleton variant="rounded" height={90} />
                <Skeleton variant="rounded" height={260} />
                <Skeleton variant="rounded" height={320} />
            </Stack>
        );
    }
    if (error) return <Alert severity="error">{error}</Alert>;
    if (noData) return <Alert severity="info">No bull-run signal data for {symbol}.</Alert>;
    if (insufficientHistory || !badge || !summary) {
        return (
            <Alert severity="info">
                Insufficient history — the signal needs {MIN_BULL_RUN_WEEKS} weeks of data for {symbol}.
            </Alert>
        );
    }

    const labels = rows.map(r => r.wk.slice(5));
    const priceData = rows.map(r => r.px);
    const signalData = rows.map(r => (r.rule_pass ? r.px : null));

    return (
        <Stack spacing={2}>
            <Card variant="outlined" sx={{ flexShrink: 0 }}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
                        <Chip
                            label={badge.rule_pass ? 'SIGNAL ON' : 'SIGNAL OFF'}
                            color={badge.rule_pass ? 'success' : 'default'}
                            sx={{ fontWeight: 700, fontSize: 14, height: 32, flexShrink: 0 }}
                        />
                        <Stack sx={{ minWidth: 0 }}>
                            <Typography variant="body2" color="text.secondary">
                                as of {badge.wk} · score {badge.score}/4
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="baseline">
                                <Typography variant="h5" fontWeight="bold">
                                    ${badge.px.toFixed(2)}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                    sx={{ color: (badge.px4w_chg ?? 0) >= 0 ? green[700] : red[700] }}
                                >
                                    {pct(badge.px4w_chg)} (4w)
                                </Typography>
                            </Stack>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', ml: 'auto', minWidth: 0 }}>
                            ON = {BULL_RUN_RULE}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <BoxFlex>
                    <SectionCard title="CHECKLIST">
                        <Stack spacing={0.75}>
                            {BOXES.map(box => (
                                <Stack key={box.key} direction="row" spacing={1} alignItems="center">
                                    <BoxIcon passed={badge[box.key] === 1} />
                                    <Typography variant="body2" fontWeight={badge[box.key] === 1 ? 600 : 400}>
                                        {box.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {box.hint}
                                    </Typography>
                                </Stack>
                            ))}
                            <Divider sx={{ my: 0.5 }} />
                            <Stack direction="row" spacing={1} alignItems="center">
                                {badge.trend_up
                                    ? <TrendingUpIcon color="success" fontSize="small" />
                                    : <TrendingDownIcon sx={{ color: grey[400] }} fontSize="small" />}
                                <Typography variant="body2" fontWeight={badge.trend_up ? 600 : 400}>
                                    Trend up
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Price &gt; SMA13 &amp; SMA13 rising (4w)
                                </Typography>
                            </Stack>
                        </Stack>
                    </SectionCard>
                </BoxFlex>

                <BoxFlex>
                    <SectionCard title="BACKTEST (fwd 4w, IN-SAMPLE)">
                        <StatTable
                            rows={[
                                { label: 'All signals', tally: summary.all },
                                { label: 'Cheap ∧ trend', tally: summary.cheapTrend },
                                { label: 'Cheap ∧ trend ∧ drought', tally: summary.cheapTrendDrought },
                            ]}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Count of score ≥ 3 weeks since 2025 with realized 4-week forward
                            returns; overlapping windows, in-sample research — not a performance guarantee.
                        </Typography>
                    </SectionCard>
                </BoxFlex>
            </Stack>

            <SectionCard title="WEEKLY SERIES">
                <LineChart
                    xAxis={[{ data: labels, scaleType: 'point' }]}
                    yAxis={[{ label: 'Price' }]}
                    series={[
                        { data: priceData, label: 'Price', color: '#1976d2', showMark: false },
                        { data: signalData, label: 'Signal ON', color: '#2e7d32', showMark: true },
                    ]}
                    height={240}
                    margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                    slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
                />
                <Divider />
                <LineChart
                    xAxis={[{ data: labels, scaleType: 'point' }]}
                    yAxis={[{ min: 0, max: 4, label: 'Score' }]}
                    series={[
                        { data: rows.map(r => r.score), label: 'Score /4', color: '#9c27b0', showMark: false },
                    ]}
                    height={180}
                    margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                />
            </SectionCard>

            <SectionCard title="HISTORY">
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        label={signalsOnly ? 'Signals only (score ≥ 3)' : 'All weeks'}
                        onClick={() => setSignalsOnly(v => !v)}
                        size="small"
                        variant="outlined"
                        clickable
                    />
                    <Typography variant="caption" color="text.secondary">
                        {historyRows.length} rows · forward returns shown once realized, otherwise “open”
                    </Typography>
                </Stack>
                <Box sx={{ height: 420 }}>
                    <DataGrid
                        rows={historyRows}
                        columns={columns}
                        density="compact"
                        initialState={{
                            sorting: { sortModel: [{ field: 'wk', sort: 'desc' }] },
                            pagination: { paginationModel: { pageSize: 25 } },
                        }}
                        pageSizeOptions={[25, 50, 100]}
                        disableRowSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-cell': { py: 0.25 },
                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12 },
                        }}
                    />
                </Box>
            </SectionCard>
        </Stack>
    );
};

const BoxFlex = ({ children }: { children: React.ReactNode }) => (
    <Stack sx={{ flex: 1, minWidth: 0 }}>{children}</Stack>
);
