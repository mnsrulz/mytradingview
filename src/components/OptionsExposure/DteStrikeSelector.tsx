import { TickerSearchDialog } from "@/components/TickerSearchDialog";
import { DataModeType } from "@/lib/types";
import { FormControl, InputLabel, MenuItem, Paper, Select, Checkbox, ListItemText, SelectChangeEvent, useMediaQuery, useTheme, Stack } from "@mui/material";
import { useState } from "react";
import RefreshCboeData from "../RefreshCboeData";
import StrikesSelectorDropdown from "./StrikesSelectorDropdown";

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
    symbol: string, dte: number, availableDates: string[], strikeCounts: string, timestamp?: Date,
    setCustomExpirations: (v: string[]) => void,
    onRefresh?: () => void,
    showZeroAndNextDte?: boolean,
    setDte: (v: number) => void, setStrikesCount: (value: string) => void, hasHistoricalData: boolean, dataMode: DataModeType, setDataMode: (v: DataModeType) => void
}) => {
    const { symbol, setDte, setStrikesCount, strikeCounts, dte, dataMode, setDataMode, hasHistoricalData, availableDates, setCustomExpirations, timestamp, onRefresh, showZeroAndNextDte } = props;
    const dataModes = hasHistoricalData ? ['CBOE', 'TRADIER', 'HISTORICAL'] : ['CBOE', 'TRADIER'];
    const [selectedExpirations, setSelectedExpirations] = useState<string[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const enableCustomDte = dte == -1;
    const handleCustomDteSelectionChange = (event: SelectChangeEvent<typeof selectedExpirations>) => {
        const {
            target: { value },
        } = event;
        setSelectedExpirations(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
        setCustomExpirations(typeof value === 'string' ? value.split(',') : value)
    };

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
                <FormControl size="small" sx={{ flexShrink: 0 }}>
                    <InputLabel>DTE</InputLabel>
                    <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
                        {dteOptions.filter(k => k > 1 || showZeroAndNextDte).map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
                        <MenuItem key="custom" value="-1">Custom</MenuItem>
                    </Select>
                </FormControl>
                {
                    enableCustomDte && <FormControl sx={{ flexShrink: 0, maxWidth: 120 }} size="small">
                        <InputLabel>Custom DTE</InputLabel>
                        <Select
                            multiple
                            value={selectedExpirations}
                            onChange={handleCustomDteSelectionChange}
                            label="Custom DTE"
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                        >
                            {availableDates.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox size="small" checked={selectedExpirations.includes(name)} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                }
                    <StrikesSelectorDropdown options={strikeOptions} value={strikeCounts} onChange={setStrikesCount} />
                {/* <FormControl size="small" sx={{ flexShrink: 0, maxWidth: 120 }}>
                </FormControl> */}
            </Stack>
        </Stack>
    </Paper>
}