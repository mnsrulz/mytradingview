'use client';
import { Box, Dialog } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DialogContent, DialogTitle, Typography } from '@mui/material';
import { DialogProps } from "@toolpad/core";
import { LivePageTrackingView } from "@/lib/types";
import dayjs from "dayjs";

export function LivePageDetailsDialog({
    payload,
    open,
    onClose,
}: DialogProps<LivePageTrackingView>) {
    const columns: GridColDef[] = [
        { field: "origin", headerName: "Origin", flex: 1, minWidth: 250, sortable: false, },
        { field: "ip", headerName: "IP", flex: 1, sortable: false, cellClassName: "mono", },
        { field: "lastActive", headerName: "Last Active", width: 120, sortable: true, valueFormatter: (value) => dayjs(value).format("HH:mm:ss"), cellClassName: "mono", }
    ];

    const rows =
        payload?.clients.map((c, idx) => ({
            id: `${c.ip}-${idx}`,
            ...c,
        })) ?? [];

    return (
        <Dialog fullWidth maxWidth="md" open={open} onClose={() => onClose()}>
            <DialogTitle>{payload?.page}</DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    <strong>Views:</strong> {payload?.count ?? 0}
                </Typography>

                <Box sx={{ height: 360 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        density="compact"
                        hideFooter
                        disableColumnMenu
                        disableColumnSelector
                        disableRowSelectionOnClick
                        sx={{
                            display: 'grid',
                            '& .MuiDataGrid-columnSeparator': { display: 'none' },
                            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                                outline: 'none'
                            }
                        }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
}