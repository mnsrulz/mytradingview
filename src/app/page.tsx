'use client';
import { Autocomplete, Button, ButtonGroup, Grid, TextField } from '@mui/material';
import * as React from 'react';
import { TickerSearch } from '../components/ticker-search';
import { AddTickerToMyList, SearchTickerItem } from '@/lib/socket';
import { MyStockList } from '@/components/mystocks';

export default function Page() {
  return (
    <Grid container>
      <Grid item xs={12}>
        <TickerSearch onChange={AddTickerToMyList} />
      </Grid>
      <Grid container columnSpacing={2}>
        {/* <Grid item xs={2}>
          <Button variant="outlined" onClick={() => AddTickerToMyList({ name: 'test', symbol: 'appl' })}>Add new stock</Button>
        </Grid> */}
      </Grid>
      <Grid item xs={12}>
        <MyStockList></MyStockList>
      </Grid>
    </Grid>
  );
}