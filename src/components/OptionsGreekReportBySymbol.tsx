import { getHistoricalGreeksSummaryBySymbol } from "@/lib/mzDataService";
import { OptionGreeksSummaryBySymbolResponse } from "@/lib/types";
import { Box, FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { useState, useEffect } from "react";
import hf from 'human-format';

export const OptionsGreekReportBySymbolDialog = (props: { symbol: string, onClose: () => void, open: boolean }) => {
    const { onClose, open, symbol } = props;
    const theme = useTheme();
    const showFullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));

    if (!open) return <div></div>

    return <Dialog
        open={open}
        maxWidth={'md'}
        fullScreen={showFullScreenDialog}
        fullWidth={true}
        onClose={onClose}>
        <DialogTitle id="scroll-dialog-title">Greeks Summary for {symbol}</DialogTitle>
        <DialogContent dividers={true}>
            <OptionsGreekReportBySymbol symbol={symbol} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>Close</Button>
        </DialogActions>
    </Dialog>

}

export const OptionsGreekReportBySymbol = (props: { symbol: string }) => {
    const [selectedOption, setSelectedOption] = useState<'call_put_oi_ratio' | 'net_gamma' | 'call_put_dex_ratio'>('call_put_oi_ratio');
    const { symbol } = props;
    const [ds, setDs] = useState<OptionGreeksSummaryBySymbolResponse[]>([]);

    useEffect(() => {
        getHistoricalGreeksSummaryBySymbol(symbol).then(d => setDs(d));
    }, [symbol]);

    return <Box>
        <FormControl>
            <InputLabel id="select-label">Metric</InputLabel>
            <Select
                labelId="select-label"
                value={selectedOption}
                label="Metric"
                onChange={(ev) => setSelectedOption(ev.target.value as 'call_put_oi_ratio' | 'net_gamma' | 'call_put_dex_ratio')}
                size="small"
            >
                <MenuItem value={'call_put_oi_ratio'}>C/P OI Ratio</MenuItem>
                <MenuItem value={'net_gamma'}>Net Gamma</MenuItem>
                <MenuItem value={'call_put_dex_ratio'}>C/P DEX Ratio</MenuItem>
            </Select>
        </FormControl>
        <LineChart
            // width={800}
            height={400}
            series={[
                { data: ds.map(k => k.price), label: 'price', yAxisId: 'leftAxisId' },
                { data: ds.map(k => k[selectedOption]), label: selectedOption, yAxisId: 'rightAxisId', valueFormatter: (v => hf(v || 0)) },
            ]}
            xAxis={[{ scaleType: 'point', data: ds.map(k => k.dt) }]}
            yAxis={[{ id: 'leftAxisId', label: 'Price $' }, { id: 'rightAxisId' }]}
            rightAxis="rightAxisId"
        />
    </Box>
}