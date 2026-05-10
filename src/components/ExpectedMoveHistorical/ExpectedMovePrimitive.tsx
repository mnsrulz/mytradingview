import {
    ISeriesPrimitive,
    IPrimitivePaneView,
    IPrimitivePaneRenderer,
    IChartApi,
    ISeriesApi,
    Time,
    SeriesAttachedParameter,
    Logical,
    TimePointIndex
} from 'lightweight-charts';
import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { alpha } from '@mui/material/styles';

type ExpectedMoveData = {
    startTime: Time;
    endTime: Time;
    straddlePrice: number;
    lastClose: number;
    high: number;
    low: number;
    spanDays: number;
};

export type ExpecteMoveDisplayOptions = 'value' | 'percent';
type WeeklyBoxOptions = {
    useDarkTheme: boolean;
    expectedMoveDisplayOption: ExpecteMoveDisplayOptions
}

const baseGreen = '#4caf50'; // MUI Success color
const baseRed = '#f44336';   // MUI Error color
// Inside your draw loop
const themeColors = {
    dark: {
        success: baseGreen,
        error: baseRed,
        text: '#ffffff',
        alphaSuccess: (alphaValue: number) => alpha(baseGreen, alphaValue),
        alphaError: (alphaValue: number) => alpha(baseRed, alphaValue),
    },
    light: {
        success: baseGreen,
        error: baseRed,
        text: '#000000',
        alphaSuccess: (alphaValue: number) => alpha(baseGreen, alphaValue),
        alphaError: (alphaValue: number) => alpha(baseRed, alphaValue),
    }
};

export class ExpectedMovePrimitive implements ISeriesPrimitive {
    private _paneView: ExpectedMovePaneView;

    constructor(
        data: ExpectedMoveData[],
        isDarkMode: boolean
    ) {
        this._paneView = new ExpectedMovePaneView(data, isDarkMode);
    }

    attached({ chart, series, requestUpdate }: SeriesAttachedParameter): void {
        this._paneView.update(chart, series);
        requestUpdate();
    }

    updateOptions(options: WeeklyBoxOptions) {
        this._paneView.updateOptions(options);
    }

    paneViews(): IPrimitivePaneView[] {
        return [this._paneView];
    }
}

class ExpectedMovePaneView implements IPrimitivePaneView {
    private _renderer: ExpectedMoveRenderer;

    constructor(data: ExpectedMoveData[], isDarkMode: boolean) {
        this._renderer = new ExpectedMoveRenderer(data, isDarkMode);
    }

    // Called by the Primitive's attached() method
    update(chart: IChartApi, series: ISeriesApi<any>) {
        this._renderer.update(chart, series);
    }

    updateOptions(options: WeeklyBoxOptions) {
        this._renderer.updateOptions(options);
    }

    renderer(): IPrimitivePaneRenderer {
        return this._renderer;
    }
}

class ExpectedMoveRenderer implements IPrimitivePaneRenderer {
    private _chart: IChartApi | null = null;
    private _series: ISeriesApi<any> | null = null;
    private _data: ExpectedMoveData[];
    private _isDarkMode: boolean;
    private _valueMode: ExpecteMoveDisplayOptions = 'value';

    constructor(data: ExpectedMoveData[], isDarkMode: boolean) {
        this._data = data;
        this._isDarkMode = isDarkMode;
    }

    updateOptions(options: WeeklyBoxOptions) {
        this._isDarkMode = options.useDarkTheme;
        this._valueMode = options.expectedMoveDisplayOption;
    }

    update(chart: IChartApi, series: ISeriesApi<any>) {
        this._chart = chart;
        this._series = series;
    }

    draw(target: CanvasRenderingTarget2D) {
        // Safety check: Don't draw if not yet attached to the chart
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();

        target.useBitmapCoordinateSpace(scope => {
            const ctx = scope.context;
            ctx.save();
            const { success, error, text, alphaSuccess, alphaError } = themeColors[this._isDarkMode ? 'dark' : 'light'];

            // Get chart defaults
            const options = this._chart!.options();
            const family = options.layout.fontFamily;
            const baseSize = options.layout.fontSize;

            // Scale font size for high-DPI screens
            const scaledSize = baseSize * scope.verticalPixelRatio;

            // Apply to context
            ctx.font = `${scaledSize}px ${family}`;

            try {
                for (const box of this._data) {
                    const startIndex = timeScale.timeToIndex(box.startTime);
                    let endIndex = timeScale.timeToIndex(box.endTime);
                    let noEnd = false;

                    if (startIndex == null) continue;
                    if (endIndex == null) {
                        endIndex = (startIndex as number + box.spanDays) as TimePointIndex;
                        noEnd = true;
                    }

                    const x1 = timeScale.logicalToCoordinate(startIndex as unknown as Logical);
                    const x2 = timeScale.logicalToCoordinate(endIndex as unknown as Logical);
                    

                    if (x1 == null || x2 == null) continue;

                    const yHigh = this._series?.priceToCoordinate(box.straddlePrice + box.lastClose);
                    const yLow = this._series?.priceToCoordinate(box.lastClose - box.straddlePrice);

                    if (yHigh == null || yLow == null) continue;

                    // normalize coords
                    const left = Math.min(x1, x2);
                    const right = Math.max(x1, x2);
                    const top = Math.min(yHigh, yLow);
                    const bottom = Math.max(yHigh, yLow);

                    // ⚠️ IMPORTANT: scale to bitmap space
                    const x = left * scope.horizontalPixelRatio;
                    const y = top * scope.verticalPixelRatio;
                    const width = (right - left) * scope.horizontalPixelRatio;
                    const height = (bottom - top) * scope.verticalPixelRatio;

                    const isOutsideRange = ((box.lastClose + box.straddlePrice) > box.high) && ((box.lastClose - box.straddlePrice) < box.low);

                    ctx.setLineDash(noEnd ? [5, 5] : []);
                    if (noEnd) {
                        ctx.fillStyle = isOutsideRange ? alpha(success, 0.26) : alpha(error, 0.28);
                        ctx.strokeStyle = isOutsideRange ? alpha(success, 0.6) : alpha(error, 0.6);
                        ctx.strokeRect(x, y, width, height);
                    } else {
                        ctx.fillStyle = isOutsideRange ? alpha(success, 0.4) : alpha(error, 0.4);
                        ctx.strokeStyle = isOutsideRange ? alpha(success, 0.6) : alpha(error, 0.6);
                        ctx.strokeRect(x, y, width, height);
                    }

                    ctx.fillRect(x, y, width, height);

                    //set the stroke style to dashed if noEnd, otherwise solid

                    ctx.fillStyle = text;
                    const expectedPercentMove = `${Math.round((box.straddlePrice / box.lastClose) * 100)}%`;
                    const expectedMove = box.straddlePrice < 1 ? box.straddlePrice.toFixed(2) : `$${Math.round(box.straddlePrice)}`;
                    ctx.fillText(this._valueMode == 'value' ? expectedMove : expectedPercentMove, x + 5, y + 20);
                }
            } finally {
                ctx.restore();
            }
        });
    }
}