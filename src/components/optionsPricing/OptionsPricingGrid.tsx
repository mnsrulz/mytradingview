'use client';
import { DataGrid, GridColDef, GridRenderCellParams, gridClasses } from '@mui/x-data-grid';
import { Box, Link } from '@mui/material';
import { ConditionalFormattingBox } from '@/components/ConditionalFormattingBox';
import { buildColumns, getConditionalFormatting, StrikePriceItem } from '@/lib/optionsPricing/calculator';
import { OptionsPricingGridRow, ValueModeTypeEnum } from '@/lib/types';

export type OptionContractSelection = { expiration: string, strike: number }

interface OptionsPricingGridProps {
    rows: OptionsPricingGridRow[];
    workingStrikes: StrikePriceItem[];
    valueMode: ValueModeTypeEnum;
    onExpiryClick: (expiry: string) => void;
    onContractClick: (contract: OptionContractSelection) => void;
}

export const OptionsPricingGrid = (props: OptionsPricingGridProps) => {
    const { rows, workingStrikes, valueMode, onExpiryClick, onContractClick } = props;
    const conditionalFormatting = getConditionalFormatting(valueMode);
    const strikeColumns = buildColumns(workingStrikes, valueMode);
    const columns: GridColDef[] = [
        {
            field: 'id',
            width: 120,
            headerName: 'expiry',
            renderCell: (v) => <Link title='View put call ratio' onClick={() => onExpiryClick(v.value)}>{v.value}</Link>
        },
        ...strikeColumns.map(col => ({
            ...col,
            renderCell: (p: GridRenderCellParams) => {
                const content = conditionalFormatting.enabled
                    ? <ConditionalFormattingBox value={p.value * conditionalFormatting.multiplier} formattedValue={p.formattedValue} />
                    : <>{p.formattedValue}</>;
                return (
                    <Box
                        title="View price history"
                        onClick={() => onContractClick({ expiration: p.id as string, strike: Number(p.field) })}
                        sx={{
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}>
                        {content}
                    </Box>
                );
            }
        }))
    ];

    return <DataGrid rows={rows}
        autoHeight
        disableColumnMenu={true}
        disableColumnFilter={true}
        disableColumnSorting={true}
        columns={columns}
        density="compact"
        columnHeaderHeight={32}
        rowHeight={32}
        hideFooter={true}
        showColumnVerticalBorder={true}
        showCellVerticalBorder={true}
        sx={{
            [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                outline: 'none',
            },
            [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
            {
                outline: 'none',
            },
            [`& .${gridClasses.columnHeader}`]:
            {
                fontSize: '0.7rem',
                fontWeight: 500
            },
            [`& .${gridClasses.cell}`]:
            {
                fontSize: '0.7rem',
                padding: 0
            },
        }}
    />;
}