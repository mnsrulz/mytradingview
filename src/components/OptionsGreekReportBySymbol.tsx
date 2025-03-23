import { getHistoricalGreeksSummaryBySymbol } from "@/lib/mzDataService";
import { OptionGreeksSummaryBySymbolResponse } from "@/lib/types";
import { Box, FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme, Dialog, DialogContent, DialogTitle, Stack, IconButton, LinearProgress, DialogActions, Tab, Tabs } from "@mui/material";
// import { LineChart } from "@mui/x-charts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from "react";
import { currencyCompactFormatter, numberFormatter } from "@/lib/formatters";
type SelectedOptionType = 'call_put_oi_ratio' | 'net_gamma' | 'call_put_dex_ratio' | 'call_put_volume_ratio'
export const OptionsGreekReportBySymbolDialog = (props: { symbol: string, onClose: () => void, open: boolean }) => {
    const { onClose, open, symbol } = props;
    const theme = useTheme();
    const showFullScreenDialog = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedOption, setSelectedOption] = useState<SelectedOptionType>('call_put_oi_ratio');

    if (!open) return <div></div>

    return <Dialog
        open={open}
        maxWidth={'md'}
        fullScreen={showFullScreenDialog}
        fullWidth={true}
        onClose={onClose}>
        <Stack direction={"row"} sx={{
            justifyContent: "space-between",
            alignItems: "center",
        }}>
            <Stack direction={'row'} sx={{ alignItems: 'center' }}>
                <DialogTitle id="scroll-dialog-title">Greeks Summary ${symbol}</DialogTitle>
                {/* <FormControl>
                    <InputLabel id="select-label">Metric</InputLabel>
                    <Select
                        labelId="select-label"
                        value={selectedOption}
                        label="Metric"
                        onChange={(ev) => setSelectedOption(ev.target.value as SelectedOptionType)}
                        size="small"
                    >
                        <MenuItem value={'call_put_oi_ratio'}>C/P OI Ratio</MenuItem>
                        <MenuItem value={'net_gamma'}>Net Gamma</MenuItem>
                        <MenuItem value={'call_put_dex_ratio'}>C/P DEX Ratio</MenuItem>
                        <MenuItem value={'call_put_volume_ratio'}>C/P Volume Ratio</MenuItem>
                    </Select>
                </FormControl> */}
            </Stack>
            <IconButton size="small" sx={{ mr: 2 }} onClick={() => onClose()}><CloseIcon /></IconButton>
            {/* <Button onClick={() => onClose()}>Close</Button> */}
        </Stack>
        <DialogContent dividers={true}>
            <OptionsGreekReportBySymbol symbol={symbol} selectedOption={selectedOption} />
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
            <Box width='100%' >
                <Tabs
                    value={selectedOption}
                    onChange={(e, v) => { setSelectedOption(v) }}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    TabIndicatorProps={{
                        style: {
                            top: 0,
                            bottom: 'unset',
                        },
                    }}>
                    <Tab label="C/P OI Ratio" value={'call_put_oi_ratio'}></Tab>
                    <Tab label="Net Gamma" value={'net_gamma'}></Tab>
                    <Tab label="C/P DEX Ratio" value={'call_put_dex_ratio'}></Tab>
                    <Tab label="C/P Volume Ratio" value={'call_put_volume_ratio'}></Tab>
                </Tabs>
            </Box>
        </DialogActions>
    </Dialog>

}

export const OptionsGreekReportBySymbol = (props: { symbol: string, selectedOption: SelectedOptionType }) => {
    const { symbol, selectedOption } = props;
    const [ds, setDs] = useState<OptionGreeksSummaryBySymbolResponse[]>([]);

    useEffect(() => {
        getHistoricalGreeksSummaryBySymbol(symbol).then(d => setDs(d));
    }, [symbol]);

    if (ds.length === 0) {
        return <LinearProgress />;
    }

    return <Box >
        {/* <ResponsiveContainer width="400" height="400"> */}
        <LineChart data={ds} width={852} height={400}>
            <CartesianGrid strokeDasharray="3 3" />
            <Legend verticalAlign="top" />
            <XAxis dataKey="dt"
                tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
            />
            <YAxis yAxisId="left"
                domain={['auto', 'auto']}
                tickFormatter={(v) => {
                    return v.toFixed(0)
                }}
                label={{
                    value: 'Price $',
                    position: 'insideLeft',
                    angle: -90,
                    style: { textAnchor: 'middle' }
                }} />
            <YAxis yAxisId="right" orientation="right"
                domain={['auto', 'auto']}
                tickFormatter={(v) => {
                    return selectedOption == 'net_gamma' ? currencyCompactFormatter(v) : numberFormatter(v)
                }}
                label={{
                    value: 'Metric Value',
                    position: 'insideRight',
                    angle: 90,
                    style: { textAnchor: 'middle' }
                }} />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="price" stroke="#82ca9d" dot={{ r: 0 }} activeDot={{ r: 8 }} />
            <Line yAxisId="right" type="monotone" dataKey={selectedOption} stroke="#8884d8" dot={{ r: 0 }} activeDot={{ r: 8 }} />
        </LineChart>
        {/* </ResponsiveContainer> */}
        {/* <LineChart
            // width={800}
            height={400}
            series={[
                { data: ds.map(k => k.price), label: 'price', yAxisId: 'leftAxisId' },
                { data: ds.map(k => k[selectedOption]), label: selectedOption, yAxisId: 'rightAxisId', valueFormatter: (v => hf(v || 0)) },
            ]}
            xAxis={[{ scaleType: 'point', data: ds.map(k => k.dt) }]}
            yAxis={[{ id: 'leftAxisId', label: 'Price $' }, { id: 'rightAxisId' }]}
            rightAxis="rightAxisId"
        /> */}
    </Box>
}