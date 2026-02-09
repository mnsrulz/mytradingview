'use client';
import { useLivePageTrackingViews } from "@/lib/socket";
import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useDialogs } from "@toolpad/core";
import { LivePageTrackingView } from "@/lib/types";
import { LivePageDetailsDialog } from "./LivePageDetailsDialog";
import { useMemo } from "react";

export const LiveTrackPages = () => {
    const { views, isLoading } = useLivePageTrackingViews();
    const dialogs = useDialogs();

    const columns: GridColDef<LivePageTrackingView>[] = [
        { field: "page", headerName: "Page", flex: 1, minWidth: 200 },
        { field: "count", headerName: "Count", type: "number", width: 120, align: "right", headerAlign: "right" }
    ];

    const uniqueClientCount = useMemo(() => {
        const ips = new Set<string>();
        views.forEach((v) =>
            v.clients.forEach((c) => ips.add(c.ip))
        );
        return ips.size;
    }, [views]);

    if (isLoading) return <LinearProgress />

    return <Box>
        <Card variant="outlined" sx={{ mb: 1, maxWidth: 240 }}>
            <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                    Unique Clients
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                    {uniqueClientCount}
                </Typography>
            </CardContent>
        </Card>
        <DataGrid
            getRowId={(row) => row.page}
            rows={views}
            columns={columns}
            //            density="compact"
            hideFooter
            onRowClick={(p) => dialogs.open(LivePageDetailsDialog, p.row)}
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
    </Box>
}
