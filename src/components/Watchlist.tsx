'use client';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { Button, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { StockTickerSymbolView, StockTickerView } from './StockTicker';
import AddTradeIcon from '@mui/icons-material/Add';
import { AddTradeDialog } from './AddTradeDialog';
import { GridLinkAction } from './GridLinkAction';
import { SearchTickerItem } from '@/lib/types';
import { TickerSearch } from './TickerSearch';
import { TradingViewWidgetDialog } from './TradingViewWidgetDialog';
import { subscribeStockPriceBatchRequest } from '@/lib/socket';
import collect from 'collect.js';

interface IWatchlistProps {
  tickers: SearchTickerItem[]
  removFromWatchlist: (value: SearchTickerItem) => void,
  addToWatchlist: (item: SearchTickerItem) => void,
  loading: boolean
}

export const Watchlist = (props: IWatchlistProps) => {
  const { tickers, removFromWatchlist, loading, addToWatchlist } = props;
  const apiRef = useGridApiRef();
  const [currentStock, setCurrentStock] = useState<SearchTickerItem | null>(null);
  const [sortMode, setSortMode] = useState('symbol');

  useEffect(() => {
    const interval = setInterval(() => {
      subscribeStockPriceBatchRequest(tickers);
    }, 1000); //every one second just ping the server to resubscribe

    return () => clearInterval(interval);
  }, [tickers]);

  const columns: GridColDef<SearchTickerItem>[] = [
    {
      field: 'symbol', headerName: 'Watchlist', flex: 1,
      resizable: false,
      renderHeader: () => {
        return <div>
          Watchlist <Button variant='text' onClick={() => setOpenAddToWatchlist(true)}>Add new</Button>
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
        return <StockTickerView item={p.row}></StockTickerView>
      }, renderHeader: () => {
        return <>Sort <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} size='small'>
          {/* <InputLabel id="sort-by-label">Sort by</InputLabel> */}
          
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
        </FormControl></>
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 1,
      getActions: ({ id, row }) => {
        return [<GridActionsCellItem
          key='Remove'
          icon={<DeleteIcon />}
          label="Remove from my list"
          onClick={() => removFromWatchlist(row)}
          showInMenu
        />,
        <GridLinkAction
          key='ViewOptionsData'
          icon={<InfoIcon />}
          label="View options data"
          LinkComponent={Button}
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
  const [openAddToWatchlist, setOpenAddToWatchlist] = useState(false);

  const handleCloseAddTrade = () => { setOpenAddTrade(false); };
  const handleAddToWatchlist = (item: SearchTickerItem) => { addToWatchlist(item); setOpenAddToWatchlist(false); }

  return <div>
    {/* <Typography variant='body2'>Watchlist</Typography> */}


    <DataGrid rows={collect(tickers).sortBy(sortMode).all()}
      columns={columns}
      //sx={{ '& .MuiDataGrid-columnSeparator': { display: 'none' } }}
      sx={{ display: 'grid', '& .MuiDataGrid-columnSeparator': { display: 'none' } }}
      // columnHeaderHeight={0}
      // slots={{
      //   columnHeaders: () => <div></div>,
      // }}
      loading={loading}
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

    <Dialog
      open={openAddToWatchlist}
      fullWidth={true}
      onClose={() => setOpenAddToWatchlist(false)}
    >
      <DialogTitle id="add-to-watchlist-dialog-title">Add to Watchlist</DialogTitle>
      <DialogContent dividers={true}>
        <TickerSearch onChange={handleAddToWatchlist} />
      </DialogContent>
    </Dialog>

    {openTradingViewDialog && currentStock?.symbol && <TradingViewWidgetDialog symbol={currentStock.symbol} onClose={() => { setOpenTradingViewDialog(false) }} />}
  </div>
}

