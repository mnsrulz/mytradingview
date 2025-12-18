'use client';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
dayjs.extend(require("dayjs/plugin/relativeTime"));

type ContactMessage = {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    adminNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export const ContactMessages = (props: {data: ContactMessage[]})=> {
    const { data } = props;
    const columns: GridColDef[] = [
        { field: "name", headerName: "Name" },
        { field: "email", headerName: "Email" },
        { field: "subject", headerName: "Subject" },
        { field: "message", headerName: "Message" },
        { field: "createdAt", headerName: "Created At", valueFormatter: (value) => dayjs(value).fromNow() },
    ];
    return (
        <DataGrid
            rows={data}
            columns={columns}
            checkboxSelection={false}
            disableColumnFilter
            disableRowSelectionOnClick
            disableColumnMenu={true}
            density="compact"
            showToolbar
        />
    );
}