'use client';
import { Box, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, Tab, Tabs } from '@mui/material';
import { HistoricalDex } from '@/components/HistoricalDex';
import { parseAsBoolean, parseAsStringEnum, parseAsStringLiteral, useQueryState } from 'nuqs';
import { HistoryBySymbol } from './HistoryBySymbol';
import { HistoryByDate } from './History';

enum ModeEnum {
    'DATE' = 'DATE',
    'SYMBOL' = 'SYMBOL'
}

export const HistoryWrapper = (props: {
    cachedDates: string[], symbols: string[]
}) => {
    const [tab, handleTabChange] = useQueryState<ModeEnum>('tab', parseAsStringEnum<ModeEnum>(Object.values(ModeEnum)).withDefault(ModeEnum.DATE));
    const renderS = (tab === ModeEnum.SYMBOL ? <HistoryBySymbol symbols={props.symbols} /> : <HistoryByDate {...props} />)
    return <Box>
        <Tabs value={tab} onChange={(e, v) => handleTabChange(v)} variant="fullWidth" indicatorColor="secondary" textColor="secondary">
            <Tab label="By Date" value='DATE' />
            <Tab label="By Symbol" value='SYMBOL' />
        </Tabs>
        {renderS}
    </Box>
}