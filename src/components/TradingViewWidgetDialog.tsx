import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { useRef, useEffect } from "react";

interface ITickerProps {
    symbol: string,
    onClose: () => void
}

const TradingViewWidget = (props: { symbol: string }) => {
    const container = useRef(null);
    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
          {
            "container_id": "technical-analysis-chart-demo",
            "width": "100%",
            "height": "100%",
            "autosize": true,
            "symbol": "${props.symbol}",
            "interval": "D",
            "timezone": "exchange",
            "theme": "light",
            "style": "1",
            "withdateranges": true,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "save_image": false,
            "studies": [
              "ROC@tv-basicstudies",
              "StochasticRSI@tv-basicstudies",
              "MASimple@tv-basicstudies"
            ],
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650",
            "support_host": "https://www.tradingview.com"
          }`;
            const c = (container.current as unknown as HTMLDivElement);
            c?.appendChild(script);

            return () => {
                script.remove();    //removes self. In dev mode react somehow adding two nodes, so need to remove it explicitly.
            }
        }, [props.symbol]);

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
            <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
        </div>
    );
}


export const TradingViewWidgetDialog = (props: ITickerProps) => {
    const { onClose } = props;

    return (
        <Dialog fullWidth={true} fullScreen={true} open={true} onClose={onClose} aria-labelledby="trading-view-dialog" >
            <DialogContent style={{ padding: '8px' }}>
                <TradingViewWidget symbol={props.symbol} />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};