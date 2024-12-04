import { green, red, deepOrange, lime, cyan, deepPurple, blueGrey, brown } from "@mui/material/colors";

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

export const getColorPallete = () => {
    
    return [
        deepOrange[900],
        deepOrange[700],
        deepOrange[500],
        deepOrange[300],
        deepOrange[100],

        lime[900],
        lime[700],
        lime[500],
        lime[300],
        lime[100],

        cyan[900],
        cyan[700],
        cyan[500],
        cyan[300],
        cyan[100],

        green[900],
        green[700],
        green[500],
        green[300],
        green[100],
        
        deepPurple[900],
        deepPurple[700],
        deepPurple[500],
        deepPurple[300],
        deepPurple[100],
        
        blueGrey[900],
        blueGrey[700],
        blueGrey[500],
        blueGrey[300],
        blueGrey[100],
 
        brown[900],
        brown[700],
        brown[500],
        brown[300],
        brown[100],
    ]
}