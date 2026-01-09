'use client';
import { useLivePageTrackingViews } from "@/lib/socket";
import { LinearProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export const LiveTrackPages = () => {
    const { views, isLoading } = useLivePageTrackingViews();

    const columns: GridColDef[] = [
        { field: "page", headerName: "Page", flex: 1, minWidth: 200 },
        { field: "count", headerName: "Count", type: "number", width: 120, align: "right", headerAlign: "right" }
    ];

    return isLoading ? <LinearProgress /> : <DataGrid
        getRowId={(row) => row.page}
        rows={views}
        columns={columns}
        initialState={
            {
                sorting: {
                    sortModel: [{ field: "count", sort: "desc" }]
                }
            }
        }
        sx={{
            display: 'grid',
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none'
            }
        }}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSelector
        disableColumnResize
    />
}
