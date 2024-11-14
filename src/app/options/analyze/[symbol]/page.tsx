import { StockOptionsView } from "@/components/StockOptionsView";

export default function Page({ params }: { params: { symbol: string } }) {
    const { symbol } = params;
    return (
        // <span>{JSON.stringify({symbol: decodeURIComponent(symbol).replace(/\W/g, '')})}</span>
        <StockOptionsView symbol={decodeURIComponent(symbol).replace(/\W/g, '')} />
    );
}