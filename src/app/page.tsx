import * as React from 'react';
import { Watchlist } from '@/components/Watchlist';
import { getWatchlist } from '@/lib/dataService';
import { ClientOnly } from '@/components/ClientOnly';
import { Container } from '@mui/material';

export default async function Page() {
  const watchlist = await getWatchlist();
  return <ClientOnly><Watchlist tickers={watchlist} /></ClientOnly>
}