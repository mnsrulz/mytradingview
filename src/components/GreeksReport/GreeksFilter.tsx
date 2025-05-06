'use client';

import * as React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { dteOptions, volumeOptions, oiOptions } from './constants';

export const GreeksFilter = ({ dte, setDte, minVolume, setMinVolume, minOpenInterest, setMinOpenInterest }: {
    dte: number;
    setDte: React.Dispatch<React.SetStateAction<number>>;
    minVolume: number;
    setMinVolume: React.Dispatch<React.SetStateAction<number>>;
    minOpenInterest: number;
    setMinOpenInterest: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const dteFilter = <FormControl sx={{ m: 1, minWidth: 60 }} size="small">
        <InputLabel>DTE</InputLabel>
        <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
            {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
        </Select>
    </FormControl>

    const volumeFilter = <FormControl sx={{ m: 1 }} size="small">
        <InputLabel>Volume</InputLabel>
        <Select value={minVolume} label="Volume" onChange={(e) => setMinVolume(e.target.value as number)}>
            {volumeOptions.map(c => {
                return <MenuItem key={c.value} value={c.value}>{`${c.display}+`}</MenuItem>
            })}
        </Select>
    </FormControl>
    const oiFilter = <FormControl sx={{ m: 1 }} size="small">
        <InputLabel>OI</InputLabel>
        <Select value={minOpenInterest} label="OI" onChange={(e) => setMinOpenInterest(e.target.value as number)}>
            {oiOptions.map(c => {
                return <MenuItem key={c.value} value={c.value}>{`${c.display}+`}</MenuItem>
            })}
        </Select>
    </FormControl>
    return <>
        {dteFilter}
        {volumeFilter}
        {oiFilter}
    </>
}