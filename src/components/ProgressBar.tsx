import * as React from 'react';
import { styled } from '@mui/material/styles';
import { getColor } from '@/lib/color';

interface ProgressBarProps {
    value: number;
    formattedValue: string
}

const Center = styled('div')({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
});

const Element = styled('div')(({ theme }) => ({
    // border: `1px solid`,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: 26,
    // borderRadius: 2,
}));

const Value = styled('div')({
    position: 'absolute',
    lineHeight: '24px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
});

const Bar = styled('div')({
    height: '100%',
    '&.low': {
        backgroundColor: '#f44336',
    },
    '&.medium': {
        backgroundColor: '#efbb5aa3',
    },
    '&.high': {
        backgroundColor: '#088208a3',
    },
});

export const ProgressBar = React.memo(function ProgressBar(props: ProgressBarProps) {
    const { value, formattedValue } = props;
    const valueInPercent = value * 100;
    let color = getColor(valueInPercent * 10);
    if (!Number.isNaN(value)) {
        return (
            <Element>
                {/* <ConditionalFormattingBox
                value={value}
                formattedValue={formattedValue}
                maxWidth={valueInPercent}
            /> */}
                {/* <Center></Center> */}
                <Value>{formattedValue} ({valueInPercent.toFixed()}%)</Value>
                <Bar sx={{
                    backgroundColor: color,
                    width: "100%",
                    maxWidth: `${Math.abs(valueInPercent)}%`,
                    height: "100%",
                    padding: "2px"
                }}>
                    {/* {formattedValue} */}
                </Bar>                
            </Element>
        );
    }
});

// export function renderProgress(params: GridRenderCellParams<any, number, any>) {
//   if (params.value == null) {
//     return '';
//   }

//   // If the aggregated value does not have the same unit as the other cell
//   // Then we fall back to the default rendering based on `valueGetter` instead of rendering a progress bar.
//   if (params.aggregation && !params.aggregation.hasCellUnit) {
//     return null;
//   }

//   return (
//     <Center>
//       <ProgressBar value={params.value} />
//     </Center>
//   );
// }