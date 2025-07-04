'use client';

import { SeriesChart } from "./SeriesChart";
import { useEffect, useState } from "react";
import { Checkbox, Container, FormControl, InputLabel, ListItemText, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
import { TickerSearchMini } from "@/components/TickerSearchMini";
import { getHistoricalExpirationsBySymbol } from "@/lib/mzDataService";
import { OIExpirationsDataResponse } from "@/lib/types";


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

export const Wrapper = (props: { symbols: string[] }) => {
    const { symbols } = props;
    const [symbol, setSymbol] = useState('');
    const [expirationData, setExpirationData] = useState<string[]>([]);
    const [selectedExpirations, setSelectedExpirations] = useState<string[]>([]);
    const handleCustomDteSelectionChange = (event: SelectChangeEvent<typeof selectedExpirations>) => {
        const {
            target: { value },
        } = event;
        setSelectedExpirations(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    useEffect(() => {
        getHistoricalExpirationsBySymbol(symbol).then((data) => {
            setExpirationData(data.map(k=> k.expiration).sort());
            setSelectedExpirations([])
        });
    }, [symbol]);

    return <Container maxWidth="xl" sx={{ p: 0 }}>
        <Paper sx={{ p: 1, mb: 1 }}>
            <TickerSearchMini symbols={symbols} onChange={setSymbol} />
            {symbol && <FormControl sx={{ width: 240 }} size="small">
                <InputLabel>Expirations</InputLabel>
                <Select
                    multiple
                    value={selectedExpirations}
                    onChange={handleCustomDteSelectionChange}
                    label="Expirations"
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {expirationData.map((name) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox size="small" checked={selectedExpirations.includes(name)} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            }
        </Paper>
        <Paper sx={{ p: 1, mb: 1 }}>
            {symbol ? <SeriesChart symbol={symbol} expirationDates={selectedExpirations} /> : <div>Select a symbol to view OI report</div>}
        </Paper>
    </Container>
}