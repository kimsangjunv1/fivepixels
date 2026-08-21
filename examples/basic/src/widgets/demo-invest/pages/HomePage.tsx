import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { findStockByCode, stockRanking } from "../model/mockMarketData";
import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";
import { MarketIndexBar } from "../ui/MarketIndexBar";
import { StockDetailPanel } from "../ui/StockDetailPanel";
import { StockRankingTable } from "../ui/StockRankingTable";

export function HomePage() {
    const [searchParams] = useSearchParams();
    const focusedCode = searchParams.get("focusedProductCode") ?? "000660";
    const initialStock = findStockByCode(focusedCode) ?? stockRanking[1];
    const [selectedCode, setSelectedCode] = useState(initialStock.code);
    const [summaryCollapsed, setSummaryCollapsed] = useState(false);
    const { showToast } = useDemoInvestInteractions();

    const selectedStock = useMemo(
        () => findStockByCode(selectedCode) ?? stockRanking[0],
        [selectedCode],
    );

    return (
        <div data-report-id="demo-home-page" data-report-type="group">
            <MarketIndexBar />

            <div className={`demo-invest__home-grid${summaryCollapsed ? " is-summary-collapsed" : ""}`}>
                <StockRankingTable
                    stocks={stockRanking}
                    selectedCode={selectedCode}
                    summaryCollapsed={summaryCollapsed}
                    onSelect={(code) => {
                        setSelectedCode(code);
                        const stock = findStockByCode(code);
                        if (stock) showToast(`${stock.name} 상세 패널을 갱신했어요.`);
                    }}
                    onToggleSummary={() => setSummaryCollapsed((current) => !current)}
                />
                {summaryCollapsed ? null : <StockDetailPanel stock={selectedStock} />}
            </div>
        </div>
    );
}
