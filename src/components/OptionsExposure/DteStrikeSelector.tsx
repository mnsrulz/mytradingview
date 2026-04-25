import { TickerSearchDialog } from "@/components/TickerSearchDialog";
import { DataModeType } from "@/lib/types";
import { FormControl, InputLabel, MenuItem, Paper, Select, useMediaQuery, useTheme, Stack } from "@mui/material";
import RefreshCboeData from "../RefreshCboeData";
import StrikesSelectorDropdown, { StrikeValueType } from "./StrikesSelectorDropdown";
import ExpirySelectorDropdown, { ExpiryValue } from "./ExpirySelectorDropdown";

const dteOptions = [0,
    1,
    7,
    30,
    50,
    90,
    180,
    400,
    1000];
const strikeOptions = [20,
    30,
    50,
    80,
    100, 150,
    200, 300,
    400, 500]

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export const DteStrikeSelector = (props: {
    symbol: string, availableDates: string[],
    strikeCounts: StrikeValueType,
    expiryValue: ExpiryValue,
    timestamp?: Date,
    onRefresh?: () => void,
    showZeroAndNextDte?: boolean,
    setExpiryValue: (v: ExpiryValue) => void,
    setStrikesCount: (value: StrikeValueType) => void,
    hasHistoricalData: boolean, dataMode: DataModeType, setDataMode: (v: DataModeType) => void
}) => {
    const { symbol, setStrikesCount, strikeCounts, expiryValue, dataMode, showZeroAndNextDte, setDataMode, hasHistoricalData, availableDates, timestamp, onRefresh, setExpiryValue } = props;

    const dataModes = hasHistoricalData ? ['CBOE', 'TRADIER', 'HISTORICAL'] : ['CBOE', 'TRADIER'];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return <Paper
        // sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        sx={{
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        }}
    >
        <Stack direction="row" gap={1} p={1} justifyContent="space-between" alignItems={"center"}>
            <FormControl size="small" sx={{ flexShrink: 0 }}>
                <TickerSearchDialog symbol={symbol} basePath='' clearQuery={true} />
            </FormControl>
            <Stack direction="row" gap={isMobile ? 0.5 : 1} >
                {timestamp && <RefreshCboeData dataMode={dataMode} timestamp={timestamp} symbol={symbol} onRefresh={onRefresh} />}
                <FormControl size="small" sx={{ flexShrink: 0 }}>
                    <InputLabel>Mode</InputLabel>
                    <Select id="dataMode" value={dataMode} label="Mode" onChange={(e) => setDataMode(e.target.value as DataModeType)}>
                        {dataModes.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                    </Select>
                </FormControl>
                <ExpirySelectorDropdown dteOptions={dteOptions.filter(k => k > 1 || showZeroAndNextDte)} expirations={availableDates}
                    value={expiryValue} onChange={setExpiryValue} size={isMobile ? 'small' : 'normal'} />
                <StrikesSelectorDropdown options={strikeOptions} value={strikeCounts} onChange={setStrikesCount} size={isMobile ? 'small' : 'normal'} />
            </Stack>
        </Stack>
    </Paper>
}