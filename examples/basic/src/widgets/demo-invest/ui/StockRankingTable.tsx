import { useMemo, useState } from "react";

import type { StockRow } from "../model/mockMarketData";

type StockRankingTableProps = {
    stocks: StockRow[];
    selectedCode: string;
    summaryCollapsed: boolean;
    onSelect: (code: string) => void;
    onToggleSummary: () => void;
};

const contentTabs = ["실시간 차트", "지금 뜨는 산업", "외국인·기관 매매 동향"];
const regions = ["전체", "국내", "해외"];
const rankingFilters = ["토스증권 거래대금", "토스증권 거래량", "거래대금", "거래량", "급상승", "급하락"];
const overseasCodes = new Set(["KORU", "SOXL"]);

function readRate(stock: StockRow) {
    return Number.parseFloat(stock.changeRate.replace(/[^\d.-]/g, ""));
}

export function StockRankingTable({ stocks, selectedCode, summaryCollapsed, onSelect, onToggleSummary }: StockRankingTableProps) {
    const [contentTab, setContentTab] = useState(contentTabs[0]);
    const [region, setRegion] = useState(regions[0]);
    const [filter, setFilter] = useState(rankingFilters[0]);
    const [hideRisk, setHideRisk] = useState(true);
    const [realtimeOpen, setRealtimeOpen] = useState(false);
    const [realtime, setRealtime] = useState("실시간");

    const visibleStocks = useMemo(() => {
        let next = stocks.filter((stock) => {
            if (region === "해외") return overseasCodes.has(stock.code);
            if (region === "국내") return !overseasCodes.has(stock.code);
            return true;
        });

        if (hideRisk) {
            next = next.filter((stock) => Math.abs(readRate(stock)) < 20);
        }
        if (filter === "급상승") {
            next = [...next].filter((stock) => stock.direction === "up").sort((a, b) => readRate(b) - readRate(a));
        } else if (filter === "급하락") {
            next = [...next].filter((stock) => stock.direction === "down").sort((a, b) => readRate(a) - readRate(b));
        } else if (contentTab === "외국인·기관 매매 동향") {
            next = [...next].sort((a, b) => b.tradingRatio.buy - a.tradingRatio.buy);
        } else if (contentTab === "지금 뜨는 산업") {
            next = [...next].sort((a, b) => a.industry.localeCompare(b.industry));
        }

        return next;
    }, [contentTab, filter, hideRisk, region, stocks]);

    return (
        <section className="demo-invest__table-section" data-report-id="demo-stock-table" data-report-type="group">
            <div className="demo-invest__home-tabs" data-report-id="demo-home-content-tabs" data-report-type="group">
                {contentTabs.map((tab) => (
                    <button key={tab} type="button" className={contentTab === tab ? "is-active" : undefined} onClick={() => setContentTab(tab)} data-report-id={`demo-home-tab-${tab}`} data-report-type="item">{tab}</button>
                ))}
                <button type="button" className="demo-invest__summary-toggle" onClick={onToggleSummary} data-report-id="demo-summary-toggle" data-report-type="item">▣ 요약 {summaryCollapsed ? "펼치기" : "접기"}</button>
            </div>
            <div className="demo-invest__ranking-filters" data-report-id="demo-ranking-filters" data-report-type="group">
                <div>
                    {regions.map((tab) => <button key={tab} type="button" className={region === tab ? "is-active" : undefined} onClick={() => setRegion(tab)} data-report-id={`demo-region-${tab}`} data-report-type="item">{tab}</button>)}
                </div>
                <div>
                    {rankingFilters.map((item) => <button key={item} type="button" className={filter === item ? "is-active" : undefined} onClick={() => setFilter(item)} data-report-id={`demo-rank-filter-${item}`} data-report-type="item">{item}</button>)}
                </div>
                <div className="demo-invest__realtime-wrap">
                    <button type="button" className="demo-invest__realtime" onClick={() => setRealtimeOpen((current) => !current)} aria-expanded={realtimeOpen} data-report-id="demo-realtime-menu" data-report-type="item">{realtime}⌄</button>
                    {realtimeOpen ? (
                        <div className="demo-invest__compact-popover" data-report-id="demo-realtime-popover" data-report-type="group">
                            {["실시간", "1분", "5분", "15분"].map((option) => <button key={option} type="button" className={realtime === option ? "is-selected" : undefined} onClick={() => { setRealtime(option); setRealtimeOpen(false); }}>{option}</button>)}
                        </div>
                    ) : null}
                </div>
                <button type="button" className={`demo-invest__hide-risk${hideRisk ? " is-active" : ""}`} onClick={() => setHideRisk((current) => !current)} aria-pressed={hideRisk} data-report-id="demo-risk-toggle" data-report-type="item">● 투자위험 주식 {hideRisk ? "숨기기" : "보기"}</button>
            </div>

            {contentTab !== contentTabs[0] ? <div className="demo-invest__table-context-banner" data-report-id="demo-table-context" data-report-type="item">{contentTab} 기준으로 순위를 다시 정렬했어요.</div> : null}
            <div className="demo-invest__ranking-head">
                <span>순위 · {realtime === "실시간" ? "오늘 10:15 기준" : `${realtime} 단위`}</span><span>현재가</span><span>등락률</span><span>거래대금 순</span><span>시가총액</span><span>토스증권 거래 비율 ⓘ</span><span>산업</span>
            </div>
            <div className="demo-invest__ranking-body" data-report-id="demo-ranking-results" data-report-type="group">
                {visibleStocks.length > 0 ? visibleStocks.map((stock) => (
                    <button
                        key={stock.code}
                        type="button"
                        className={`demo-invest__ranking-row${stock.code === selectedCode ? " is-selected" : ""}`}
                        onClick={() => onSelect(stock.code)}
                        data-report-id={`demo-stock-row-${stock.code}`}
                        data-report-type="item"
                    >
                        <span className="demo-invest__ranking-stock"><i>♥</i><b>{stock.rank}</b><img src={stock.logoSrc} alt="" /><strong>{stock.name}</strong></span>
                        <span>{stock.price}</span>
                        <span className={`demo-invest__rate-chip demo-invest__text-${stock.direction}`}>{stock.changeRate}</span>
                        <span>{stock.tradingVolume}</span><span>{stock.marketCap}</span>
                        <span className="demo-invest__trade-ratio"><i style={{ width: `${stock.tradingRatio.buy}%` }} /><i style={{ width: `${stock.tradingRatio.sell}%` }} /><small><b>{stock.tradingRatio.buy}</b><em>{stock.tradingRatio.sell}</em></small></span>
                        <span><mark>{stock.industry}</mark></span>
                    </button>
                )) : <div className="demo-invest__table-empty" data-report-id="demo-table-empty" data-report-type="item">조건에 맞는 종목이 없어요.<button type="button" onClick={() => { setRegion("전체"); setFilter(rankingFilters[0]); }}>필터 초기화</button></div>}
            </div>
        </section>
    );
}
