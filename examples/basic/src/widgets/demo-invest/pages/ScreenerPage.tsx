import { useMemo, useState } from "react";

import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";

type ScreenerRow = {
    name: string;
    price: string;
    change: string;
    rate: string;
    category: string;
    cap: string;
    volume: string;
    down?: boolean;
    color: string;
};

const presets = [
    "연속 상승세", "저평가 성장주", "아직 저렴한 가치주", "꾸준한 배당주", "돈 잘버는 회사 찾기",
    "저평가 탈출", "미래의 배당왕 찾기", "성장 기대주", "쌍끌이 매수", "고수익 저평가", "안정 성장주",
];

const rows: ScreenerRow[] = [
    { name: "미래에셋생명", price: "24,750원", change: "+1,700원", rate: "+7.37%", category: "보험", cap: "3.1조원", volume: "462,666주", color: "#2b66b1" },
    { name: "엔바이오니아", price: "6,620원", change: "+570원", rate: "+9.42%", category: "생활가전", cap: "534.9억원", volume: "56,122주", color: "#2747a9" },
    { name: "티엘비", price: "34,600원", change: "+750원", rate: "+2.21%", category: "전자부품", cap: "8,378.4억원", volume: "1,585,411주", color: "#2770ad" },
    { name: "나인앤컴퍼니", price: "5,520원", change: "+120원", rate: "+2.22%", category: "의류브랜드", cap: "1,223.3억원", volume: "119,645주", color: "#444" },
    { name: "한화손해보험", price: "7,310원", change: "+10원", rate: "+0.13%", category: "보험", cap: "8,521.9억원", volume: "1,814,700주", color: "#ff6b16" },
    { name: "알비더블유", price: "1,673원", change: "-22원", rate: "-1.29%", category: "연예기획사", cap: "487.2억원", volume: "45,287주", down: true, color: "#43539a" },
    { name: "에스디시스템", price: "2,410원", change: "+50원", rate: "+2.11%", category: "IT솔루션구축", cap: "313.7억원", volume: "103,076주", color: "#36aa3c" },
    { name: "기가비스", price: "120,500원", change: "-8,400원", rate: "-6.52%", category: "반도체장비", cap: "1.7조원", volume: "298,771주", down: true, color: "#eee" },
    { name: "신성에스티", price: "23,050원", change: "+450원", rate: "+1.99%", category: "배터리부품", cap: "2,083.7억원", volume: "41,467주", color: "#2c46a4" },
    { name: "아이컴포넌트", price: "6,670원", change: "+10원", rate: "+0.15%", category: "디스플레이부품소재", cap: "453.9억원", volume: "57,407주", color: "#4b9b4b" },
    { name: "플래티어", price: "3,405원", change: "+5원", rate: "+0.14%", category: "온라인쇼핑", cap: "285.2억원", volume: "6,522주", color: "#555" },
    { name: "평화산업", price: "1,059원", change: "-14원", rate: "-1.30%", category: "자동차부품", cap: "589.1억원", volume: "304,114주", down: true, color: "#315fe3" },
    { name: "KISCO홀딩스", price: "27,300원", change: "-450원", rate: "-1.62%", category: "지주사", cap: "3,941.0억원", volume: "18,148주", down: true, color: "#202390" },
    { name: "파인디지털", price: "3,075원", change: "-20원", rate: "-0.64%", category: "자동차부품", cap: "316.0억원", volume: "1,615주", down: true, color: "#ef7332" },
    { name: "HLB파나진", price: "1,166원", change: "-30원", rate: "-2.50%", category: "의료기기", cap: "544.5억원", volume: "117,122주", down: true, color: "#f06b00" },
];

export function ScreenerPage() {
    const [activePreset, setActivePreset] = useState(0);
    const [hoveredPreset, setHoveredPreset] = useState<number | null>(8);
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<"cap" | "volume" | null>(null);
    const [selectedRow, setSelectedRow] = useState<string | null>(null);
    const { openDialog, showToast } = useDemoInvestInteractions();
    const displayedRows = useMemo(() => {
        if (!sortKey) return rows;
        return [...rows].sort((a, b) => (sortKey === "cap" ? b.cap.localeCompare(a.cap) : b.volume.localeCompare(a.volume)));
    }, [sortKey]);
    const filterOptions = openFilter === "시장" ? ["코스피", "코스닥", "나스닥"] : openFilter === "산업" ? ["반도체", "보험", "자동차부품"] : ["1천억원 이상", "1조원 이상", "10조원 이상"];

    return (
        <div className="demo-invest__screener-page" data-report-id="demo-screener-page" data-report-type="group">
            <aside className="demo-invest__screener-nav">
                <h2>주식 골라보기 목록</h2>
                <small>내가 만든</small>
                <button type="button" className="demo-invest__make-preset" onClick={() => openDialog("investFilter")} data-fp-open="demo-modal-filter" data-report-id="demo-create-screener" data-report-type="item">⊕ 직접 만들기</button>
                <small>토스증권이 만든</small>
                <ul>
                    {presets.map((preset, index) => (
                        <li key={preset}>
                            <button
                                type="button"
                                className={activePreset === index ? "is-active" : undefined}
                                onClick={() => { setActivePreset(index); showToast(`${preset} 조건으로 결과를 갱신했어요.`); }}
                                onMouseEnter={() => setHoveredPreset(index)}
                                onMouseLeave={() => setHoveredPreset(null)}
                                onFocus={() => setHoveredPreset(index)}
                                data-report-id={`demo-screener-preset-${index}`}
                                data-report-type="item"
                            >{preset}{index < 2 || index === 3 ? <em>인기</em> : null}</button>
                        </li>
                    ))}
                </ul>
                {hoveredPreset !== null ? <div className="demo-invest__preset-tooltip" data-report-id="demo-preset-tooltip" data-report-type="item">
                    <strong>{presets[hoveredPreset]}</strong>
                    <p>{hoveredPreset === 8 ? "기관과 외국인이 동시에 사들이는 주식" : "토스증권 데이터로 찾은 조건에 맞는 주식"}</p>
                    <b>주가등락률 · 하루 전 보다 · 0% 이상</b>
                    <b>외국인 순매수 비교 · 하루 전 보다 · 외국인 순매수량이 늘어난 주식</b>
                    <b>기관 순매수 비교 · 하루 전 보다 · 기관 순매수량이 늘어난 주식</b>
                </div> : null}
            </aside>

            <section className="demo-invest__screener-results">
                <header>
                    <h1>{presets[activePreset]}</h1>
                    <p>{activePreset === 0 ? "일주일 연속 상승세를 보이는 주식" : "선택한 투자 조건을 만족하는 주식"}</p>
                </header>
                <div className="demo-invest__screener-filters">
                    <button type="button" onClick={() => openDialog("investFilter")} data-fp-open="demo-modal-filter" data-report-id="demo-add-filter" data-report-type="item">☷ 필터추가</button>
                    <button type="button" className="is-blue">🇰🇷 국내⌄</button>
                    {["시장", "산업", "시가총액"].map((filter) => <div key={filter} className="demo-invest__screener-filter-wrap"><button type="button" className={openFilter === filter ? "is-open" : undefined} onClick={() => setOpenFilter((current) => current === filter ? null : filter)} aria-expanded={openFilter === filter}>{filter}⌄</button>{openFilter === filter ? <div className="demo-invest__compact-popover demo-invest__screener-popover" data-report-id={`demo-${filter}-popover`} data-report-type="group">{filterOptions.map((option) => <button key={option} type="button" onClick={() => { setOpenFilter(null); showToast(`${option} 필터를 적용했어요.`); }}>{option}</button>)}</div> : null}</div>)}
                    <button type="button" className="is-blue">주가등락률 · 1주일 전 보다 · 0% 이상</button>
                    <button type="button" className="is-blue">주가 연속상승 · 5일 이상 연속⌄</button>
                </div>
                <div className="demo-invest__screener-table" role="grid">
                    <div className="demo-invest__screener-row demo-invest__screener-row--head" role="row">
                        <span>검색된 주식 · 15개 ⟳</span><span>현재가</span><span>등락액</span><span>등락률</span>
                        <span>카테고리</span><button type="button" onClick={() => setSortKey((current) => current === "cap" ? null : "cap")}>시가총액 ↕</button><button type="button" onClick={() => setSortKey((current) => current === "volume" ? null : "volume")}>거래량 ↕</button><span>애널리스트 분석</span>
                    </div>
                    {displayedRows.map((row, index) => (
                        <button key={row.name} type="button" className={`demo-invest__screener-row${selectedRow === row.name ? " is-selected" : ""}`} role="row" onClick={() => setSelectedRow(row.name)} data-report-id={`demo-screener-row-${index}`} data-report-type="item">
                            <span className="demo-invest__screener-name">
                                <i>♥</i><b>{index + 1}</b><em style={{ background: row.color }}>{row.name.slice(0, 2)}</em><strong>{row.name}</strong>
                            </span>
                            <span>{row.price}</span>
                            <span className={row.down ? "is-down" : "is-up"}>{row.change}</span>
                            <span className={row.down ? "is-down" : "is-up"}>{row.rate}</span>
                            <span><mark>{row.category}</mark></span>
                            <span>{row.cap}</span><span>{row.volume}</span><span>{selectedRow === row.name ? "선택됨" : ""}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
