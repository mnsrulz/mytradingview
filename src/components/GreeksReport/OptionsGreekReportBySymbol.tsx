import { getHistoricalGreeksSummaryBySymbol } from "@/lib/mzDataService";
import { OptionGreeksSummaryBySymbolResponse } from "@/lib/types";
import { Box, FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme, Dialog, DialogContent, DialogTitle, Stack, IconButton, LinearProgress, DialogActions, Tab, Tabs } from "@mui/material";
import { LineChart } from "@mui/x-charts";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from "react";
import { currencyCompactFormatter, fixedCurrencyFormatter, numberFormatter } from "@/lib/formatters";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'; // Import the UTC plugin for dayjs
dayjs.extend(utc); // Import and extend dayjs with utc plugin

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
            ...(showFullScreenDialog && {
                minHeight: 40,
                px: 1,
                py: 0.5,
            })
        }}>
            <Stack direction={'row'} sx={{ alignItems: 'center' }}>
                <DialogTitle id="scroll-dialog-title" sx={showFullScreenDialog ? { fontSize: '1rem', p: 0.5, pr: 1 } : {}}>
                    Greeks Summary ${symbol}
                </DialogTitle>
            </Stack>
            <IconButton size="small" sx={{ mr: 2, ...(showFullScreenDialog && { m: 0, p: 0.5 }) }} onClick={() => onClose()}><CloseIcon /></IconButton>
        </Stack>
        <DialogContent dividers={true} sx={{ p: 0 }}>
            <OptionsGreekReportBySymbol symbol={symbol} selectedOption={selectedOption} />
        </DialogContent>
        <DialogActions sx={{ p: 0, ...(showFullScreenDialog && { minHeight: 36, px: 0.5, py: 0.5 }) }}>
            <Box width='100%' >
                <Tabs
                    value={selectedOption}
                    onChange={(e, v) => { setSelectedOption(v) }}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    slotProps={{
                        indicator: {
                            style: {
                                top: 0,
                                bottom: 'unset',
                            },
                        }
                    }}
                    sx={showFullScreenDialog ? { minHeight: 32, '.MuiTab-root': { minHeight: 32, fontSize: '0.9rem', p: 0.5 } } : {}}
                >
                    <Tab label="C/P OI Ratio" value={'call_put_oi_ratio'}></Tab>
                    <Tab label="Net Gamma" value={'net_gamma'}></Tab>
                    <Tab label="C/P DEX Ratio" value={'call_put_dex_ratio'}></Tab>
                    <Tab label="C/P Volume Ratio" value={'call_put_volume_ratio'}></Tab>
                </Tabs>
            </Box>
        </DialogActions>
    </Dialog>

}

//"call_put_oi_ratio" | "net_gamma" | "call_put_dex_ratio" | "call_put_volume_ratio"
const MetricLabel = {
    'call_put_oi_ratio': 'Call Put Open Interest Ratio',
    'net_gamma': 'NET GAMMA $',
    'call_put_dex_ratio': 'Call Put Delta Exposure Ratio',
    'call_put_volume_ratio': 'Call Put Volume Ratio',

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

    const yAxisFormatter = (v: number) => selectedOption == 'net_gamma' ? currencyCompactFormatter(v) : numberFormatter(v)
    const xAxisFormatter = (v: string) => dayjs(v).format("MMM D");
    // debugger;
    // const aspectRatio = 16 / 9;
    return <Box sx={{ width: '100%' }}>
        <LineChart
            sx={{
                width: '100%',
                minWidth: 600,
                height: 400
            }}
            // height={Math.round(window.innerWidth / aspectRatio)}
            series={[
                { data: ds.map(k => k.price), label: 'price', yAxisId: 'leftAxisId', showMark: false },
                { data: ds.map(k => k[selectedOption]), label: selectedOption, yAxisId: 'rightAxisId', showMark: false },
            ]}
            xAxis={[{ scaleType: 'point', data: ds.map(k => k.dt), valueFormatter: xAxisFormatter }]}
            yAxis={[
                { id: 'leftAxisId', label: 'Price $', valueFormatter: fixedCurrencyFormatter },
                { id: 'rightAxisId', position: 'right', label: MetricLabel[selectedOption], valueFormatter: yAxisFormatter }
            ]}
            grid={{ horizontal: true, vertical: true }}
        />
    </Box>
}