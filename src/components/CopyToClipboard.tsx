import { IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNotifications } from "@toolpad/core";
const CopyToClipboardButton = (props: { text: string }) => {
    const notifications = useNotifications();
    const handleClick = () => {
        navigator.clipboard.writeText(props.text);
        notifications.show('Copied to clipboard!', {
            autoHideDuration: 3000,
        });
    };

    return <IconButton onClick={handleClick} color="default" size="small" sx={{fontSize: '0.9rem'}} title="Copy to clipboard">
        <ContentCopyIcon fontSize="inherit"  />
    </IconButton>;
};

export default CopyToClipboardButton;
