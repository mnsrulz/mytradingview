import { PositionPayload } from '@/lib/types';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Box, ListItemText } from '@mui/material';
import { useDialogs, useNotifications } from '@toolpad/core';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fixedCurrencyFormatter, humanAbsCurrencyFormatter, numberFormatter, percentageFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
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
  onEdit: (position: PositionPayload) => void;
  onDelete: (positionId: string) => Promise<any>;
  onDeleted: () => void;
}) {
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const handleDelete = async (position: AggregatedPosition) => {
    const selectedPosition = position.accounts.length == 1 ? position.accounts[0].rawPosition : await dialogs.open(PositionPickerDialog, position);
    if (selectedPosition && selectedPosition?.id) {
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
    { field: 'symbol', headerName: 'Symbol', minWidth: 70, flex:1, renderCell: (p) => <span onClick={() => dialogs.open(TradingViewWidgetDialog, { symbol: p.row.symbol })}>{p.value}</span> },
    { field: 'totalQuantity', headerName: 'Qty', type: 'number', flex:0.8, minWidth: 50 },
    { field: 'weightedAverageCostBasis', headerName: 'Cost Basis', minWidth: 70, flex:1, type: 'number', valueFormatter: humanAbsCurrencyFormatter },
    { field: 'price', headerName: 'Price', type: 'number', minWidth: 50, flex:1, valueFormatter: humanAbsCurrencyFormatter },
    { field: 'portfolioWeight', headerName: 'Allocation', type: 'number', flex:1, minWidth: 70, valueFormatter: percentageFormatter },
    { field: 'totalValue', headerName: 'Total Value', type: 'number', flex: 1.1, minWidth: 120, valueFormatter: (v, r) => fixedCurrencyFormatter(r.totalValue) },
    { field: 'totalValueChange', headerName: 'Total Change', type: 'number', flex: 1.1, minWidth: 120, valueFormatter: (v, r) => fixedCurrencyFormatter(r.totalValueChange) },
    { field: 'todaysValueChange', headerName: 'Todays Change', type: 'number', flex: 1.1, minWidth: 120, valueFormatter: (v, r) => fixedCurrencyFormatter(r.todaysValueChange) },
    {
      field: 'actions',
      type: 'actions',
      width: 50,
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
        // disableColumnResize
        getRowId={r => r.symbol}
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
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

