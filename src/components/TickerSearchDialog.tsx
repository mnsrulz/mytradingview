'use client'

import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useState } from "react";
import { TickerSearchNavigation } from "./TickerSearchNavigation";
import EditIcon from "@mui/icons-material/Edit";

export const TickerSearchDialog = (props: { symbol: string, basePath: string, clearQuery?: boolean }) => {
    const [openSearchTickerDialog, setOpenSearchTickerDialog] = useState(false);

    return <>
        <IconButton onClick={() => { setOpenSearchTickerDialog(true) }} sx={{ p: 0 }} size='small' disableFocusRipple disableRipple>
            <EditIcon /> {decodeURIComponent(props.symbol)}
        </IconButton>
        <Dialog
            open={openSearchTickerDialog}
            fullWidth={true}
            onClose={() => setOpenSearchTickerDialog(false)}
        >
            <DialogTitle id="search-ticker-dialog-title">Search</DialogTitle>
            <DialogContent dividers={true}>
                {/* <TickerSearch onChange={(v) => router.push(`/options/analyze/${v.symbol}`)} /> */}
                <TickerSearchNavigation {...props}  />
            </DialogContent>
        </Dialog></>
}