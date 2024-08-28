'use client';
import { Grid, LinearProgress } from '@mui/material';
import * as React from 'react';
import { TickerSearch } from '../components/TickerSearch';
import { useMyStockList } from '@/lib/socket';
import { Watchlist } from '@/components/Watchlist';

export default function Page() {
  const { mytickers, addToWatchlist, removeFromWatchlist, loading } = useMyStockList();
  return loading ? <LinearProgress /> : (
    <Grid container>
      {/* <Grid item xs={12}>
        <TickerSearch onChange={addToWatchlist} label='Add' />
      </Grid> */}
      <Grid item xs={12} marginTop={1} marginBottom={1}>
        <Watchlist tickers={mytickers}
          removFromWatchlist={removeFromWatchlist}
          loading={loading}
          addToWatchlist={addToWatchlist}>
        </Watchlist>
      </Grid>
    </Grid>
  );
}