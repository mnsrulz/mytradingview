import { getHistoricalExposureWallsByDate, getHistoricalGreeksSummaryBySymbol } from "@/lib/mzDataService";
import { OptionGreeksExposureWallsByDateResponse, OptionGreeksSummaryBySymbolResponse } from "@/lib/types";
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
export const OptionsGreekWallReportBySymbol = (props: { symbol: string, dte: number, onClose: () => void, open: boolean }) => {
    const { onClose, open, symbol, dte } = props;
    const theme = useTheme();
    const showFullScreenDialog = useMediaQuery(theme.breakpoints.down('md'));    

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
                    Greeks Wall Summary ${symbol}
                </DialogTitle>
            </Stack>
            <IconButton size="small" sx={{ mr: 2, ...(showFullScreenDialog && { m: 0, p: 0.5 }) }} onClick={() => onClose()}><CloseIcon /></IconButton>
        </Stack>
        <DialogContent dividers={true} sx={{ p: 0 }}>
            <OptionsGreekReportBySymbol symbol={symbol} dte={dte} />
        </DialogContent>        
    </Dialog>

}

const OptionsGreekReportBySymbol = (props: { symbol: string, dte: number }) => {
    const { symbol, dte } = props;
    const [ds, setDs] = useState<OptionGreeksExposureWallsByDateResponse[]>([]);

    useEffect(() => {
        getHistoricalExposureWallsByDate('', dte, symbol).then(d => setDs(d));
    }, [symbol, dte]);

    if (ds.length === 0) {
        return <LinearProgress />;
    }

    const xAxisFormatter = (v: string) => dayjs(v).format("MMM D");
    return <Box sx={{ width: '100%' }}>
        <LineChart
            sx={{
                width: '100%',
                minWidth: 600,
                height: 400
            }}
            series={[
                { data: ds.map(k => k.price), label: 'price', yAxisId: 'leftAxisId', showMark: false },
                { data: ds.map(k => k.call_wall_strike), label: 'call wall', yAxisId: 'leftAxisId', showMark: false },
                { data: ds.map(k => k.put_wall_strike), label: 'put wall', yAxisId: 'leftAxisId', showMark: false },                
            ]}
            xAxis={[{ scaleType: 'point', data: ds.map(k => k.dt), valueFormatter: xAxisFormatter }]}
            yAxis={[
                { id: 'leftAxisId', label: 'Strike $', valueFormatter: fixedCurrencyFormatter }                
            ]}
            grid={{ horizontal: true, vertical: true }}
        />
    </Box>
}