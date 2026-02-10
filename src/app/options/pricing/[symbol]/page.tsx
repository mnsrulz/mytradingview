import { StockOptionsView } from "@/components/StockOptionsView";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    return (
        // <span>{JSON.stringify({symbol: decodeURIComponent(symbol).replace(/\W/g, '')})}</span>
        // symbols like BRK.B not loading with replace regex
        <StockOptionsView symbol={symbol} />
    );
}