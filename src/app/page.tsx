'use client';
import * as React from 'react';
import { Watchlist } from '@/components/Watchlist';
import { NoSsr } from '@mui/material';
export default function Page() {  
  return <NoSsr><Watchlist /></NoSsr>;
}