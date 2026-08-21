'use client';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Skeleton, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { OptionPriceHistoryChart } from "./OptionPriceHistoryChart";
import { useOptionPriceHistory, filterOptionPriceHistory, PriceHistoryPeriod, OptionPriceHistoryParams } from "@/lib/optionPriceHistory";

const periodOptions: PriceHistoryPeriod[] = ['YTD', '6M', '1Y', 'ALL'];

interface OptionPriceHistoryPanelProps {
    onClose: () => void;
    params: OptionPriceHistoryParams;
}

export const OptionPriceHistoryPanel = (props: OptionPriceHistoryPanelProps) => {
    const { onClose, params } = props;
    const { data, isLoading, hasError, error } = useOptionPriceHistory(params);
    const [period, setPeriod] = useState<PriceHistoryPeriod>('1Y');

    const filteredData = useMemo(() => filterOptionPriceHistory(data, period), [data, period]);

    return (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" gap={1}>
                <Typography variant="h6">
                    {params.symbol} {params.strike} {params.putCallType} expiring {params.expiration}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1}>
                    <FormControl size="small">
                        <InputLabel>PERIOD</InputLabel>
                        <Select id="period" value={period} label="PERIOD" onChange={(e) => setPeriod(e.target.value as PriceHistoryPeriod)}>
                            {periodOptions.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Button variant="outlined" onClick={onClose} color="secondary" size="small">
                        Close
                    </Button>
                </Stack>
            </Stack>
            {
                isLoading ? <Skeleton variant="rectangular" height={440} /> :
                    hasError ? <Typography color="error">{error}</Typography> :
                        filteredData.dt.length == 0 ? <Typography color="text.secondary">No price history found for this contract.</Typography> :
                            <OptionPriceHistoryChart data={filteredData} />
            }
        </Paper>
    );
}