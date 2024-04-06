import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
interface IConfirmDialogProps {
    title: string,
    text: string,
    open: boolean,
    onClose: () => void
    onConfirm: () => void
}

export const ConfirmDialog = (props: IConfirmDialogProps) => {
    const { title, text, open, onClose, onConfirm } = props;
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog">
            <DialogTitle id="confirm-dialog">{title}</DialogTitle>
            <DialogContent>{text}</DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    No
                </Button>
                <Button variant="contained" onClick={()=>{onClose(); onConfirm();}}>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
};