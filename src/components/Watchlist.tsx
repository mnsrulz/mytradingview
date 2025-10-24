'use client';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { StockTickerSymbolView, StockTickerView } from './StockTicker';
import AddTradeIcon from '@mui/icons-material/Add';
import { AddTradeDialog } from './AddTradeDialog';
import { GridLinkAction } from './GridLinkAction';
import { SearchTickerItem, WatchlistItem } from '@/lib/types';
import { TickerSearch } from './TickerSearch';
import { TradingViewWidgetDialog } from './TradingViewWidgetDialog';
import { subscribeStockPriceBatchRequest } from '@/lib/socket';
import collect from 'collect.js';
import { useMultiWatchlists } from "@/lib/hooks";
import { DialogProps, DialogsProvider, useDialogs } from '@toolpad/core';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Delete';

export const Watchlist = () => {
  const dialogs = useDialogs();
  const { watchlists, addWatchlist, removeWatchlist, addTickerToWatchlist, removeTickerFromWatchlist } = useMultiWatchlists();
  const [watchlistId, setWatchlistId] = useState('');

  const selectedWatchListId = watchlistId || watchlists[0]?.id;

  const wl = watchlists.find(w => w.id === selectedWatchListId)?.tickers || [];

  const [currentStock, setCurrentStock] = useState<SearchTickerItem | null>(null);
  const [sortMode, setSortMode] = useState('symbol');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      subscribeStockPriceBatchRequest(wl);
    }, 1000); //every one second just ping the server to resubscribe

    return () => clearInterval(interval);
  }, [wl]);

  const handleAddToWatchlistClick = async () => {
    const result = await dialogs.open(AddToWatchlistDialog);
    debugger;
    if (!result) return;
    addTickerToWatchlist(selectedWatchListId, result);
  }

  const columns: GridColDef<SearchTickerItem>[] = [
    {
      field: 'symbol', headerName: 'Watchlist', flex: 1,
      resizable: false,
      renderHeader: () => {
        return <div>
          Ticker <Button variant='text' onClick={handleAddToWatchlistClick}>Add new</Button>
        </div>
      },
      disableColumnMenu: true, disableReorder: true, renderCell: (p) => {
        return <StockTickerSymbolView item={p.row}></StockTickerSymbolView>
      }
    },
    // { field: 'name', headerName: 'Name', flex: 1 },
    {
      resizable: false,
      field: 'price', headerName: '', headerAlign: 'right', align: 'right', flex: 0.5, renderCell: (p) => {
        return <StockTickerView item={p.row} />
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 1,
      getActions: ({ row }) => {
        return [<GridActionsCellItem
          key='Remove'
          icon={<DeleteIcon />}
          label="Remove"
          onClick={() => removeTickerFromWatchlist(selectedWatchListId, row.symbol)}
          showInMenu
        />,
        <GridLinkAction
          key='ViewOptionsData'
          icon={<InfoIcon />}
          label="View options data"
          // LinkComponent={Button}
          to={"/options/analyze/" + row.symbol}
          showInMenu
        />,
        <GridActionsCellItem
          key='AddTrade'
          icon={<AddTradeIcon />}
          label="Add trade"
          showInMenu
          onClick={() => {
            setCurrentStock(row);
            setOpenAddTrade(true);
          }}
        />,
        <GridActionsCellItem
          key='ViewTradingView'
          icon={<AddTradeIcon />}
          label="Show in Trading view"
          showInMenu
          onClick={() => {
            setCurrentStock(row);
            setOpenTradingViewDialog(true);
          }}
        />
        ]
      }
    }
  ];

  const [openAddTrade, setOpenAddTrade] = useState(false);
  const [openTradingViewDialog, setOpenTradingViewDialog] = useState(false);  

  const handleNewWatchlistClick = async () => {
    const watchlistName = await dialogs.prompt("Watchlist Name");
    if (watchlistName) {
      addWatchlist(watchlistName);
    }
  }

  const handleRemoveWatchlistClick = async (watchlist: WatchlistItem) => {
    const confirmed = await dialogs.confirm('Are you sure you want to delete this watchlist?', {
      okText: 'Yes',
      cancelText: 'No',
    });
    if (confirmed) {
      removeWatchlist(watchlist.id);
      setWatchlistId('');
    }
  }

  const handleCloseAddTrade = () => { setOpenAddTrade(false); };

  return <DialogsProvider>
    <Grid container>
      <Grid size={12}>
        <Stack direction="row" spacing={1} alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
          <Box>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 220 }} size='small'>
              <InputLabel id="watchlist-select-label">Watchlists</InputLabel>
              <Select
                labelId="watchlist-select-label"
                value={selectedWatchListId}
                onChange={(e) => {
                  setWatchlistId(e.target.value);
                }}
                label="Watchlist"
                size='small'
                autoWidth
                // Track open state to show delete icon only when menu is open
                MenuProps={{
                  PaperProps: {
                    sx: { minWidth: 220 }
                  }
                }}
                onOpen={() => setMenuOpen(true)}
                onClose={() => setMenuOpen(false)}
                renderValue={(value) => { return <span>{watchlists.find(w => w.id === value)?.name}</span> }}
              >
                {watchlists.map((w) => (
                  <MenuItem key={w.id} value={w.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{w.name}</span>
                    {menuOpen && watchlists.length > 1 && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            handleRemoveWatchlistClick(w);
                          }}
                          title="Remove"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    handleNewWatchlistClick();
                  }}
                  sx={{ display: 'flex', justifyContent: 'center', color: 'primary.main' }}
                >
                  <AddIcon fontSize="small" sx={{ mr: 1 }} /> Add new watchlist
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} size='small'>
              <InputLabel id="sort-by-label">Sort by</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                label="Sort by"
                size='small'
                autoWidth
              >
                <MenuItem value="symbol">Ticker</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Grid>
      <DataGrid rows={collect(wl).sortBy(sortMode).all()}
        columns={columns}
        //sx={{ '& .MuiDataGrid-columnSeparator': { display: 'none' } }}
        sx={{ display: 'grid', '& .MuiDataGrid-columnSeparator': { display: 'none' } }}
        // columnHeaderHeight={0}
        // slots={{
        //   columnHeaders: () => <div></div>,
        // }}      
        disableColumnMenu
        disableColumnSorting
        disableColumnSelector
        disableColumnResize
        rowHeight={72}
        //apiRef={apiRef}
        // rowSelection={true}
        disableRowSelectionOnClick
        hideFooter={true}
        density='compact'
        getRowId={(r) => `${r.symbol} - ${r.name}`} />
      <AddTradeDialog onClose={handleCloseAddTrade}
        open={openAddTrade}
        ticker={currentStock} />


      {openTradingViewDialog && currentStock?.symbol && <TradingViewWidgetDialog symbol={currentStock.symbol} onClose={() => { setOpenTradingViewDialog(false) }} />}
    </Grid>
  </DialogsProvider>
}

function AddToWatchlistDialog({ open, onClose }: DialogProps<undefined, SearchTickerItem | null>) {
  return <Dialog
    open={open}
    fullWidth={true}
    onClose={() => onClose(null)}
  >
    <DialogTitle id="add-to-watchlist-dialog-title">Add to Watchlist</DialogTitle>
    <DialogContent dividers={true}>
      <TickerSearch onChange={onClose} />
    </DialogContent>
  </Dialog>
}