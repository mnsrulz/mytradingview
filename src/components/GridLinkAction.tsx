import {GridActionsCellItem, GridActionsCellItemProps} from "@mui/x-data-grid";
import Link from "next/link";
import React, {RefAttributes} from "react";

type GridLinkActionProps = {to: string} & GridActionsCellItemProps & RefAttributes<HTMLButtonElement>;

export const GridLinkAction = ({to, ...props}: GridLinkActionProps) => {
    return (<Link href={to}>
        <GridActionsCellItem {...props} />
    </Link>);
};