import { green, red, deepOrange, lime, cyan, deepPurple, blueGrey, brown, yellow } from "@mui/material/colors";

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



/**
 * getColor - Smooth gradient from red → yellow → green
 * @param v  Current value
 * @param min  Minimum possible value (e.g., -5)
 * @param max  Maximum possible value (e.g., 5)
 */
export const getColorV2 = (v: number, min: number, max: number): string => {
  if (isNaN(v)) return "#ccc";

  // Clamp
  const clamped = Math.max(min, Math.min(max, v));

  // Normalize [-1, 1] around 0 midpoint
  const range = Math.max(Math.abs(min), Math.abs(max));
  const t = (clamped + range) / (2 * range); // map [-range, +range] → [0, 1]

  // Interpolate smoothly between red → yellow → green
  if (t < 0.5) {
    // red → yellow for negatives
    const localT = t / 0.5;
    return interpolateColor(red[500], yellow[600], localT);
  } else {
    // yellow → green for positives
    const localT = (t - 0.5) / 0.5;
    return interpolateColor(yellow[600], green[500], localT);
  }
};

/**
 * Interpolates two colors smoothly.
 */
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff,
    g1 = (c1 >> 8) & 0xff,
    b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff,
    g2 = (c2 >> 8) & 0xff,
    b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
};

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