import { Position, PriceMap } from '@/lib/types';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Box, ListItemText } from '@mui/material';
import { useDialogs, useNotifications } from '@toolpad/core';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { StockTickerViewInternal } from '../StockTicker';
import { numberFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { green, red } from '@mui/material/colors';
import { TradingViewWidgetDialog } from '@/components/TradingViewWidgetDialog';


export function PositionsDataGrid({
  loading,
  priceMap,
  positions,
  selectedAccountId,
  onEdit,
  onDelete,
  onDeleted,
}: {
  loading: boolean;
  priceMap: PriceMap;
  positions: Position[];
  selectedAccountId: string;
  onEdit: (p: Position) => void;
  onDelete: (positionId: string) => Promise<any>;
  onDeleted: () => void;
}) {
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const handleDelete = async (positionId: string) => {
    const confirm = await dialogs.confirm('Delete Position?', { okText: 'Yes', cancelText: 'No' });
    if (confirm) {
      await onDelete(positionId).then(onDeleted);
      notifications.show('Position deleted', { severity: 'success' });
    }
  };

  if (loading) return <p>Loading...</p>;

  const filtered = selectedAccountId ? positions.filter((p) => p.brokerAccountId === selectedAccountId) : positions;

  const columns: GridColDef<Position>[] = [
    { field: 'symbol', headerName: 'Symbol', renderCell: (p) => <span onClick={() => dialogs.open(TradingViewWidgetDialog, { symbol: p.row.symbol })}>{p.value}</span>, width: 150 },
    { field: 'quantity', headerName: 'Qty', type: 'number', },
    { field: 'costBasis', headerName: 'Cost Basis', type: 'number' },
    {
      resizable: false,
      field: 'price', headerName: 'Price', headerAlign: 'right', align: 'right', sortable: false, width: 120, renderCell: (p) => {
        if(!priceMap) return '-';
        const v = priceMap[p.row.symbol] || {};
        return <StockTickerViewInternal  {...v} />
      }
    },
    {
      field: 'totalValue', headerName: 'Total Value', headerAlign: 'right', align: 'right', sortable: false, width: 140, renderCell: (p) => {
        if(!priceMap) return '-';
        return <TotalValue
          symbol={p.row.symbol}
          positionSize={p.row.quantity}
          costBasis={p.row.costBasis}
          stockPrice={priceMap[p.row.symbol]?.price} />
      }
    },
    { field: 'notes', headerName: 'Notes', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      width: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEdit(row)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(row.id)}
          showInMenu
        />
      ]
    }
  ];

  return (
    <Box sx={{ width: '100%', mt: 1 }} >
      <DataGrid
        rows={filtered}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableColumnSelector
        disableColumnResize
        sx={{
          display: 'grid',
          '& .MuiDataGrid-columnSeparator': { display: 'none' },
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
const TotalValue = (props: { symbol: string, positionSize: number, costBasis: number | null, stockPrice: number | undefined }) => {
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