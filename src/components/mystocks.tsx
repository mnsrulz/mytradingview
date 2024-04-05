'use client';
import * as React from 'react';
import { RemoveItemFromMyList, SearchTickerItem, useMyStockList } from '../lib/socket';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { DataGrid, GridActionsCellItem, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useState } from 'react';
import { StockOptionsView } from './stock-options-view';
import { StockTickerView } from './stock-ticker';

export const MyStockList = () => {
    const mytickers = useMyStockList();
    const apiRef = useGridApiRef();
    const [currentStock, setCurrentStock] = useState<SearchTickerItem | null>(null);
    const columns: GridColDef<SearchTickerItem>[] = [
        { field: 'symbol', headerName: 'Ticker', width: 150 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'price', headerName: 'Price', flex: 1, renderCell:(p)=>{
          return <StockTickerView item={p.row}></StockTickerView>
        }},
        {
            field: 'actions',
            type: 'actions',
            width: 150,
            getActions: ({ id, row }) => {
                return [<GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Remove from my list"
                    onClick={() => RemoveItemFromMyList(row)}
                />, 
                <GridActionsCellItem
                icon={<InfoIcon />}
                label="View options data"
                onClick={() => {
                    setCurrentStock(row);
                    setOpen(true);
                }}
            />]
            }
        }
    ];

    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
      };
      const descriptionElementRef = React.useRef<HTMLElement>(null);
    return <div>
        <h1>my stocks</h1>
        {/* <ul>
            {mytickers.map(m => <li key={m.symbol}>{m.name} -- {m.symbol} <Button onClick={()=>RemoveItemFromMyList(m)}>Remove</Button></li>)}
        </ul> */}
        <DataGrid rows={mytickers}
            columns={columns}
            sx={{ display: 'grid' }}
            apiRef={apiRef}
            getRowId={(r) => `${r.symbol} - ${r.name}`} />
        {/* <DataGrid sx={{display: 'grid'}} rows={rows} columns={columns} autoHeight={false} disableVirtualization  /> */}
        <Dialog
        open={open}
        onClose={handleClose}
        // scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Subscribe</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {currentStock && <StockOptionsView item={currentStock} />}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Subscribe</Button>
        </DialogActions>
      </Dialog>
    </div>
}