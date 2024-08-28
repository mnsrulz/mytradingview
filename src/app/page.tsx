'use client';
import { Grid, LinearProgress } from '@mui/material';
import * as React from 'react';
import { TickerSearch } from '../components/ticker-search';
import { useMyStockList } from '@/lib/socket';
import { MyStockList } from '@/components/mystocks';

export default function Page() {
  const { mytickers, addToWatchlist, removeFromWatchlist, loading } = useMyStockList();
  return loading ? <LinearProgress /> : (
    <Grid container style={{
      padding: '0px 8px'
    }}>
      <Grid item xs={12}>
        <TickerSearch onChange={addToWatchlist} label='Add' />
      </Grid>
      <Grid item xs={12} marginTop={1}>
        <MyStockList mytickers={mytickers} removFromWatchlist={removeFromWatchlist} loading={loading}  ></MyStockList>
      </Grid>
    </Grid>
  );
}