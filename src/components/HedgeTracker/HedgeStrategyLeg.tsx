'use client'

import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import dayjs from 'dayjs'

export type StrategyLeg = {
    id: string;
    type: 'CALL' | 'PUT';
    mode: 'BUY' | 'SELL';
    strike: number;
    expiration: string;
    quantity: number;
}

type HedgeStrategyLegProps = {
    leg: StrategyLeg;
    availableExpirations: string[];
    availableStrikes: number[];
    onChange: (leg: StrategyLeg) => void;
    lockTypeSide?: boolean;
}

export const HedgeStrategyLeg = ({
    leg,
    availableExpirations,
    availableStrikes,
    onChange,
    lockTypeSide = false,
}: HedgeStrategyLegProps) => {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 70 }}>
                <InputLabel>Type</InputLabel>
                <Select
                    value={leg.type}
                    label="Type"
                    disabled={lockTypeSide}
                    onChange={(e) => onChange({ ...leg, type: e.target.value as 'CALL' | 'PUT' })}
                >
                    <MenuItem value="CALL">Call</MenuItem>
                    <MenuItem value="PUT">Put</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 70 }}>
                <InputLabel>Side</InputLabel>
                <Select
                    value={leg.mode}
                    label="Side"
                    disabled={lockTypeSide}
                    onChange={(e) => onChange({ ...leg, mode: e.target.value as 'BUY' | 'SELL' })}
                >
                    <MenuItem value="BUY">Buy</MenuItem>
                    <MenuItem value="SELL">Sell</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Expiry</InputLabel>
                <Select
                    value={leg.expiration}
                    label="Expiry"
                    onChange={(e) => onChange({ ...leg, expiration: e.target.value })}
                >
                    {availableExpirations.map(exp => (
                        <MenuItem key={exp} value={exp}>
                            {dayjs(exp).format('MM/DD/YY')}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Strike</InputLabel>
                <Select
                    value={leg.strike}
                    label="Strike"
                    onChange={(e) => onChange({ ...leg, strike: Number(e.target.value) })}
                >
                    {availableStrikes.map(strike => (
                        <MenuItem key={strike} value={strike}>
                            {'$'}{strike}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 70 }}>
                <InputLabel>Qty</InputLabel>
                <Select
                    value={leg.quantity}
                    label="Qty"
                    onChange={(e) => onChange({ ...leg, quantity: Number(e.target.value) })}
                >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                        <MenuItem key={n} value={n}>{n}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    )
}
