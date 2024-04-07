import { green, red } from "@mui/material/colors";

const fn1 = (v: number) => {
    const v1 = v;
    switch (true) {
        case v1 <= 50:
            return 50;
        case v1 <= 100:
            return 100;
        case v1 <= 200:
            return 200;
        case v1 <= 300:
            return 300;
        case v1 <= 400:
            return 400;
        case v1 <= 500:
            return 500;
        case v1 <= 600:
            return 600;
        default:
        // case v1 <= 700:
            return 700;
        // case v1 <= 800:
        //     return 800;
        //     return 900;
    }
}

export const getColor = (v: number) => {
    const colorvalue = fn1(Math.abs(v));
    return v >= 0 ? green[colorvalue] : red[colorvalue];
}