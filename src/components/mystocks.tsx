'use client';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { Button, Paper, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { useState } from 'react';
import { StockTickerSymbolView, StockTickerView } from './stock-ticker';
import AddTradeIcon from '@mui/icons-material/Add';
import { AddTradeDialog } from './add-trade';
import { GridLinkAction } from './GridLinkAction';
import { SearchTickerItem } from '@/lib/types';


interface ITickerProps {
  mytickers: SearchTickerItem[]
  removFromWatchlist: (value: SearchTickerItem) => void,
  loading: boolean
}

export const MyStockList = (props: ITickerProps) => {
  const { mytickers, removFromWatchlist, loading } = props;
  const apiRef = useGridApiRef();
  const [currentStock, setCurrentStock] = useState<SearchTickerItem | null>(null);
  const columns: GridColDef<SearchTickerItem>[] = [
    {
      field: 'symbol', headerName: 'Watchlist', flex: 1, 
      resizable: false,
      disableColumnMenu: true, disableReorder: true, renderCell: (p) => {
        return <StockTickerSymbolView item={p.row}></StockTickerSymbolView>
      }
    },
    // { field: 'name', headerName: 'Name', flex: 1 },
    {
      resizable: false,
      field: 'price', headerName: '', headerAlign: 'right', align: 'right', flex: 0.5, renderCell: (p) => {
        return <StockTickerView item={p.row}></StockTickerView>
      }
    },
    {
      field: 'actions',
      type: 'actions',
      width: 20,
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
        />
        ]
      }
    }
  ];

  const [open, setOpen] = useState(false);
  const [openAddTrade, setOpenAddTrade] = useState(false);
  const handleClose = () => { setOpen(false); };
  const handleCloseAddTrade = () => { setOpenAddTrade(false); };
  return <div >
    {/* <Typography variant='body2'>Watchlist</Typography> */}
    <DataGrid rows={mytickers}
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
      rowHeight={64}
      //apiRef={apiRef}
      // rowSelection={true}
      disableRowSelectionOnClick
      hideFooter={true}
      density='compact'
      getRowId={(r) => `${r.symbol} - ${r.name}`} />
    <AddTradeDialog onClose={handleCloseAddTrade}
      open={openAddTrade}
      ticker={currentStock} />
  </div>
}