'use client';
import { SymbolsSelector } from "@/components/IVHistorical/SymbolsSelector";
import { Stack, FormControl, InputLabel, Select, MenuItem, Divider, Checkbox, Tooltip, Box, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { ExpectedMoveChart } from "./ExpectedMoveChart";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs";

import AdfScannerIcon from '@mui/icons-material/AdfScanner'; // Magnet lookalike
import AdfScannerOutlinedIcon from '@mui/icons-material/AdfScannerOutlined';
import { useState } from "react";
import { ExpecteMoveDisplayOptions } from "../../../../../components/ExpectedMoveHistorical/ExpectedMovePrimitive";
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const modes = ['weekly', 'monthly'] as const;
export const Wrapper = (props: { symbols: string[], symbol: string }) => {
    const [mode, setMode] = useQueryState('mode', parseAsStringLiteral(modes).withDefault('weekly'));
    const [magnetMode, setMagnetMode] = useQueryState('magnetMode', parseAsBoolean.withDefault(false));
    const [expectedMoveDisplayOption, setExpectedMoveDisplayOption] = useState<ExpecteMoveDisplayOptions>('value');
    const { symbols, symbol } = props;
    const router = useRouter();
    const pathname = usePathname(); // e.g., "/chart/TSLA"
    const searchParams = useSearchParams();

    const goToSymbol = (newSymbol: string) => {
        // 2. Determine the new base path (e.g., "/chart/AAPL")
        const segments = pathname.split('/');
        segments[segments.length - 2] = newSymbol;
        const newPath = segments.join('/');

        // 3. Re-attach the query string if it exists
        const fullPath = searchParams.toString() ? `${newPath}?${searchParams.toString()}` : newPath;
        router.push(fullPath);
    };
    return <>
        <Stack direction="row" gap={1} p={1} alignItems="center">
            <FormControl sx={{ minWidth: 125 }} size="small">
                <SymbolsSelector symbols={symbols} symbol={symbol} handleSymbolChange={goToSymbol} />
            </FormControl>
            <FormControl sx={{ flexShrink: 0 }} size="small">
                <InputLabel>Mode</InputLabel>
                <Select id="expiry-mode" value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}>
                    <MenuItem key="weekly" value="weekly">Weekly</MenuItem>
                    <MenuItem key="monthly" value="monthly">Monthly</MenuItem>
                </Select>
            </FormControl>
            <Divider orientation="vertical" variant="middle" flexItem />
            <FormControl size="small">
                <Tooltip title="Magnet Mode">

                    <Checkbox slotProps={{
                        input: { 'aria-label': 'Turn Magnet Mode' }
                    }} icon={<AdfScannerOutlinedIcon />} checkedIcon={<AdfScannerIcon />} checked={magnetMode} onChange={(e) => setMagnetMode(e.target.checked)} />
                </Tooltip>
            </FormControl>
            <Divider orientation="vertical" variant="middle" flexItem />
            <FormControl size="small">
                <ToggleButtonGroup
                    value={expectedMoveDisplayOption}
                    exclusive
                    onChange={(event, newValue) => {
                        if (newValue !== null) {
                            setExpectedMoveDisplayOption(newValue);
                        }
                    }}
                    size="small"
                    aria-label="Expected move display mode">
                    <Tooltip title="View expected move as Dollar Value" arrow>
                        <ToggleButton value="value" aria-label="dollar value">
                            <AttachMoneyIcon />
                        </ToggleButton>
                    </Tooltip>

                    <Tooltip title="View expected move as Percentage" arrow>
                        <ToggleButton value="percent" aria-label="percentage">
                            <PercentIcon />
                        </ToggleButton>
                    </Tooltip>
                </ToggleButtonGroup>
            </FormControl>
        </Stack>
        <Divider />
        <ExpectedMoveChart symbol={symbol} mode={mode} useMagnetCrossHair={magnetMode} expectedMoveDisplayOption={expectedMoveDisplayOption} />
    </>;
}