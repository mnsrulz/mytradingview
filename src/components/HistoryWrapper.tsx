'use client';
import { Box, Tab, Tabs } from '@mui/material';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { HistoryBySymbol } from './HistoryBySymbol';
import { HistoryByDate } from './HistoryByDate';

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
        <Tabs sx={{ mb: 2 }} value={tab} onChange={(e, v) => handleTabChange(v)} variant="fullWidth" indicatorColor="secondary" textColor="secondary">
            <Tab label="By Date" value='DATE' />
            <Tab label="By Symbol" value='SYMBOL' />
        </Tabs>
        {renderS}
    </Box>
}