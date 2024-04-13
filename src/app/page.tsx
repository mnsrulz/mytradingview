'use client';
import { Grid } from '@mui/material';
import * as React from 'react';
import { TickerSearch } from '../components/ticker-search';
import { useMyStockList } from '@/lib/socket';
import { MyStockList } from '@/components/mystocks';

export default function Page() {
  const { mytickers, addToWatchlist, removeFromWatchlist } = useMyStockList();
  return (
    <Grid container>
      <Grid item xs={12}>
        <TickerSearch onChange={addToWatchlist} />
      </Grid>
      <Grid container columnSpacing={2}>
        {/* <Grid item xs={2}>
          <Button variant="outlined" onClick={() => AddTickerToMyList({ name: 'test', symbol: 'appl' })}>Add new stock</Button>
        </Grid> */}
      </Grid>
      <Grid item xs={12}>
        <MyStockList mytickers={mytickers} removFromWatchlist={removeFromWatchlist}  ></MyStockList>
      </Grid>
    </Grid>
  );
}