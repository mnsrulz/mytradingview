import { Position } from '@/lib/types';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Box, ListItemText } from '@mui/material';
import { useDialogs, useNotifications } from '@toolpad/core';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { StockTickerViewInternal } from '../StockTicker';
import { numberFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { green, red } from '@mui/material/colors';
import { TradingViewWidgetDialog } from '@/components/TradingViewWidgetDialog';
import { AggregatedPosition } from '@/lib/usePortfolio';
import { PositionPickerDialog } from './PositionPickerDialog';

export function PositionsDataGrid({
  loading,
  aggregatedPositions,
  onEdit,
  onDelete,
  onDeleted,
}: {
  loading: boolean;
  aggregatedPositions: AggregatedPosition[];
  onEdit: (position: Position) => void;
  onDelete: (positionId: string) => Promise<any>;
  onDeleted: () => void;
}) {
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const handleDelete = async (position: AggregatedPosition) => {
    const selectedPosition = position.accounts.length == 1 ? position.accounts[0].rawPosition : await dialogs.open(PositionPickerDialog, position);
    if (selectedPosition) {
      const confirm = await dialogs.confirm('Delete Position?', { okText: 'Yes', cancelText: 'No' });
      if (confirm) {
        await onDelete(selectedPosition.id).then(onDeleted);
        notifications.show('Position deleted', { severity: 'success' });
      }
    }
  };

  const handleEdit = async (position: AggregatedPosition) => {
    const selectedPosition = position.accounts.length == 1 ? position.accounts[0].rawPosition : await dialogs.open(PositionPickerDialog, position);
    if (selectedPosition) {
      onEdit(selectedPosition)
    }
  };

  if (loading) return <p>Loading...</p>;

  const columns: GridColDef<AggregatedPosition>[] = [
    { field: 'symbol', headerName: 'Symbol', renderCell: (p) => <span onClick={() => dialogs.open(TradingViewWidgetDialog, { symbol: p.row.symbol })}>{p.value}</span>, width: 150 },
    { field: 'totalQuantity', headerName: 'Qty', type: 'number', },
    { field: 'weightedAverageCostBasis', headerName: 'Cost Basis', type: 'number' },
    { field: 'price', headerName: 'Price', type: 'number' },
    // {
    //   resizable: false,
    //   field: 'price', headerName: 'Price', headerAlign: 'right', align: 'right', sortable: true, width: 120, renderCell: (p) => {
    //     return <StockTickerViewInternal  {...p.row} />
    //   }
    // },
    // {
    //   field: 'totalValue', headerName: 'Total Value', headerAlign: 'right', align: 'right', sortable: true, width: 140, renderCell: (p) => {
    //     return <TotalValue
    //       positionSize={p.row.totalQuantity}
    //       costBasis={p.row.weightedAverageCostBasis}
    //       stockPrice={p.row.price} />
    //   }
    // },
    //{ field: 'notes', headerName: 'Notes', flex: 1 },
    { field: 'totalValue', headerName: 'Total Value', type: 'number', width: 160, valueFormatter: (v, r) => numberFormatter(r.totalValue) },
    { field: 'totalValueChange', headerName: 'Total Change', type: 'number', width: 160, valueFormatter: (v, r) => numberFormatter(r.totalValueChange) },
    { field: 'todaysValueChange', headerName: 'Todays Change', type: 'number', width: 160, valueFormatter: (v, r) => numberFormatter(r.todaysValueChange) },
    {
      field: 'actions',
      type: 'actions',
      width: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(row)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(row)}
          showInMenu
        />
      ]
    }
  ];

  return (
    <Box sx={{ width: '100%', mt: 1 }} >
      <DataGrid
        rows={aggregatedPositions}
        columns={columns}
        hideFooter
        autoHeight
        density="compact"
        rowHeight={40}

        disableColumnMenu
        disableColumnSelector
        disableColumnResize
        getRowId={r => r.symbol}
        // sx={{
        //   display: 'grid',
        //   '& .MuiDataGrid-columnSeparator': { display: 'none' },
        //   '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
        //     outline: 'none'
        //   }
        // }}

        sx={{
          // height: '15vh',
          fontFamily: "Roboto Mono, monospace",
          fontSize: 12,
          //display: 'grid',
          //'& .MuiDataGrid-columnSeparator': { display: 'none' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none'
          }
        }}
      />
    </Box>
  );
}

//TODO: REFACTOR NEEDED. 
const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];
const TotalValue = (props: { positionSize: number, costBasis: number | null, stockPrice: number | undefined }) => {
  //const [stockPrice, setStockPrice] = useState(0);
  //  const stockPrice = useStockPrice({ symbol: props.symbol, name: props.symbol });

  const { stockPrice } = props;
  if (!stockPrice) return <>-</>;

  const totalCostBasis = props.positionSize * (props.costBasis ?? 0);
  const totalValue = stockPrice * props.positionSize;
  const change = totalValue - totalCostBasis;
  const changePercent = totalCostBasis !== 0 ? (change / totalCostBasis) * 100 : 0;
  const secondaryColor = change < 0 ? red[500] : green[500];

  return <ListItemText
    slotProps={{
      primary: {
        fontSize: primaryTextSize
      },
      secondary: {
        fontSize: secondaryTextSize,
        color: secondaryColor
      }
    }}
    primary={numberFormatter(totalValue)}
    secondary={`${positiveNegativeNumberFormatter(change)} (${positiveNegativeNumberFormatter(changePercent)}%)`}
  />
}

