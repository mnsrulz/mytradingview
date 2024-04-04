'use client';
import * as React from 'react';
import { RemoveItemFromMyList, useMyStockList } from '../lib/socket';
import { Button } from '@mui/material';

export const MyStockList = () => {
    const mytickers = useMyStockList();
    return <div>
        <h1>my stocks</h1>
        <ul>
            {mytickers.map(m => <li key={m.symbol}>{m.name} -- {m.symbol} <Button onClick={()=>RemoveItemFromMyList(m)}>Remove</Button></li>)}
        </ul>
    </div>
}