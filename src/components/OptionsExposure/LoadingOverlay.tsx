import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useDrawingArea, useXScale, useYScale } from '@mui/x-charts/hooks';

const ratios = [0.2, 0.8, 0.6, 0.5];

const LoadingReact = styled('rect')({
    opacity: 0.2,
    fill: 'lightgray',
});

const LoadingText = styled('text')(({ theme }) => ({
    stroke: 'none',
    fill: theme.palette.text.primary,
    shapeRendering: 'crispEdges',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
}));

export const LoadingOverlay = () => {
    const xScale = useXScale();
    const yScale = useYScale<'band'>();
    const { left, width, height } = useDrawingArea();

    const bandWidth = yScale.bandwidth();

    const [bottom, top] = xScale.range();

    return (
        <g>
            {xScale.domain().map((item, index) => {
                const ratio = ratios[index % ratios.length];
                const barHeight = ratio * (bottom - top);

                return (
                    <LoadingReact
                        key={index}
                        x={yScale(item)}
                        width={bandWidth}
                        y={bottom - barHeight}
                        height={height}
                    />
                );
            })}
            <LoadingText x={left + width / 2} y={top + height / 2}>
                Loading data ...
            </LoadingText>
        </g>
    );
}