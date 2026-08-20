export type MarketDirection = "up" | "down";

export type IndexCard = {
    id: string;
    name: string;
    value: string;
    change: string;
    changeRate: string;
    direction: MarketDirection;
    sparklineSrc?: string;
};

export type StockRow = {
    rank: number;
    code: string;
    name: string;
    logoSrc: string;
    price: string;
    changeRate: string;
    direction: MarketDirection;
    tradingVolume: string;
    marketCap: string;
    tradingRatio: { buy: number; sell: number };
    industry: string;
    aiSummary: string;
    favorited?: boolean;
};

export type WatchlistItem = {
    code: string;
    name: string;
    logoSrc: string;
    price: string;
    change: string;
    changeRate: string;
    direction: MarketDirection;
};

export type DailyPriceRow = {
    date: string;
    close: string;
    change: string;
    changeRate: string;
    direction: MarketDirection;
    volume: string;
    open: string;
    high: string;
    low: string;
};

export type RelatedEtf = {
    code: string;
    name: string;
    logoSrc: string;
    price: string;
    changeRate: string;
    direction: MarketDirection;
};

export type IndexListItem = {
    name: string;
    value: string;
    changeRate: string;
    direction: MarketDirection;
};

export const indexCards: IndexCard[] = [
    { id: "kospi", name: "코스피", value: "3,357.84", change: "+322.61", changeRate: "4.98%", direction: "up" },
    { id: "kosdaq", name: "코스닥", value: "861.72", change: "+31.59", changeRate: "3.81%", direction: "up" },
    { id: "nasdaq", name: "나스닥", value: "23,384.28", change: "+98.94", changeRate: "0.42%", direction: "up" },
    { id: "sp500", name: "S&P 500", value: "7,707.98", change: "+16.22", changeRate: "0.21%", direction: "up" },
];

export const keySchedules = [
    { label: "주간 신규실업수당 청구건수 발표", color: "#3182f6" },
    { label: "7월 소매판매 발표", color: "#f04452" },
    { label: "7월 산업생산 발표", color: "#f04452" },
];

export const stockRanking: StockRow[] = [
    {
        rank: 1,
        code: "005930",
        name: "삼성전자",
        logoSrc: "/demo-invest/logos/samsung.png",
        price: "79,200원",
        changeRate: "+6.06%",
        direction: "up",
        tradingVolume: "862억원",
        marketCap: "1,186.3조원",
        tradingRatio: { buy: 67, sell: 33 },
        industry: "종합반도체",
        aiSummary: "AI 수익화 기대감으로 삼성전자 +6.06% 상승",
        favorited: true,
    },
    {
        rank: 2,
        code: "000660",
        name: "SK하이닉스",
        logoSrc: "/demo-invest/logos/sk-hynix.png",
        price: "278,500원",
        changeRate: "+8.93%",
        direction: "up",
        tradingVolume: "1,200억원",
        marketCap: "203.1조원",
        tradingRatio: { buy: 72, sell: 28 },
        industry: "종합반도체",
        aiSummary: "40조 자사주 소각으로 SK하이닉스 +8.93% 상승",
    },
    {
        rank: 3,
        code: "042660",
        name: "한화오션",
        logoSrc: "/demo-invest/logos/hanwha-ocean.png",
        price: "98,400원",
        changeRate: "+5.02%",
        direction: "up",
        tradingVolume: "420억원",
        marketCap: "32.4조원",
        tradingRatio: { buy: 58, sell: 42 },
        industry: "조선",
        aiSummary: "LNG선 수주 기대감으로 한화오션 +5.02% 상승",
    },
    {
        rank: 4,
        code: "005380",
        name: "현대차",
        logoSrc: "/demo-invest/logos/hyundai.png",
        price: "228,000원",
        changeRate: "+2.47%",
        direction: "up",
        tradingVolume: "380억원",
        marketCap: "48.7조원",
        tradingRatio: { buy: 55, sell: 45 },
        industry: "자동차",
        aiSummary: "2분기 실적 호조로 현대차 +2.47% 상승",
    },
    {
        rank: 5,
        code: "035420",
        name: "NAVER",
        logoSrc: "/demo-invest/logos/naver.png",
        price: "245,500원",
        changeRate: "-1.21%",
        direction: "down",
        tradingVolume: "290억원",
        marketCap: "40.2조원",
        tradingRatio: { buy: 44, sell: 56 },
        industry: "인터넷",
        aiSummary: "플랫폼 규제 우려로 NAVER -1.21% 하락",
    },
    { rank: 6, code: "402340", name: "SK스퀘어", logoSrc: "/demo-invest/logos/watch-1.png", price: "1,074,000원", changeRate: "+6.97%", direction: "up", tradingVolume: "81억원", marketCap: "145.2조원", tradingRatio: { buy: 51, sell: 49 }, industry: "지주사", aiSummary: "반도체 투자 가치 부각" },
    { rank: 7, code: "091160", name: "TIGER 반도체TOP10레버리지", logoSrc: "/demo-invest/logos/etf-spy.png", price: "33,315원", changeRate: "+13.02%", direction: "up", tradingVolume: "70억원", marketCap: "4,907억원", tradingRatio: { buy: 55, sell: 45 }, industry: "반도체", aiSummary: "반도체 지수 강세" },
    { rank: 8, code: "KORU", name: "KORU", logoSrc: "/demo-invest/logos/watch-3.png", price: "28,709원", changeRate: "+7.11%", direction: "up", tradingVolume: "68억원", marketCap: "1.9조원", tradingRatio: { buy: 60, sell: 40 }, industry: "", aiSummary: "한국 증시 3배 레버리지" },
    { rank: 9, code: "114800", name: "KODEX 인버스", logoSrc: "/demo-invest/logos/etf-voo.png", price: "1,030원", changeRate: "-5.41%", direction: "down", tradingVolume: "63억원", marketCap: "7,943억원", tradingRatio: { buy: 36, sell: 64 }, industry: "", aiSummary: "지수 상승으로 약세" },
    { rank: 10, code: "SOXL", name: "SOXL", logoSrc: "/demo-invest/logos/etf-spy.png", price: "176,686원", changeRate: "+4.33%", direction: "up", tradingVolume: "62억원", marketCap: "30.5조원", tradingRatio: { buy: 46, sell: 54 }, industry: "반도체", aiSummary: "미국 반도체 3배 ETF" },
    { rank: 11, code: "475150", name: "SK이터닉스", logoSrc: "/demo-invest/logos/watch-1.png", price: "61,700원", changeRate: "+6.74%", direction: "up", tradingVolume: "59억원", marketCap: "2.0조원", tradingRatio: { buy: 56, sell: 44 }, industry: "태양광에너지", aiSummary: "신재생에너지 기대" },
    { rank: 12, code: "122630", name: "KODEX SK하이닉스단일종목레버리지", logoSrc: "/demo-invest/logos/etf-voo.png", price: "9,835원", changeRate: "+21.94%", direction: "up", tradingVolume: "42억원", marketCap: "2.0조원", tradingRatio: { buy: 87, sell: 13 }, industry: "종합반도체", aiSummary: "SK하이닉스 급등 반영" },
    { rank: 13, code: "069500", name: "KODEX 200", logoSrc: "/demo-invest/logos/etf-spy.png", price: "107,465원", changeRate: "+5.60%", direction: "up", tradingVolume: "41억원", marketCap: "24.0조원", tradingRatio: { buy: 54, sell: 46 }, industry: "", aiSummary: "코스피200 강세" },
    { rank: 14, code: "462330", name: "SOL AI반도체TOP2플러스", logoSrc: "/demo-invest/logos/samsung.png", price: "17,460원", changeRate: "+5.30%", direction: "up", tradingVolume: "38억원", marketCap: "5.3조원", tradingRatio: { buy: 49, sell: 51 }, industry: "", aiSummary: "AI 반도체 강세" },
    { rank: 15, code: "233740", name: "KODEX 코스닥150레버리지", logoSrc: "/demo-invest/logos/etf-voo.png", price: "7,485원", changeRate: "+4.10%", direction: "up", tradingVolume: "38억원", marketCap: "3.7조원", tradingRatio: { buy: 60, sell: 40 }, industry: "", aiSummary: "코스닥 레버리지" },
    { rank: 16, code: "252670", name: "KODEX 200선물인버스2X", logoSrc: "/demo-invest/logos/etf-voo.png", price: "79원", changeRate: "-10.22%", direction: "down", tradingVolume: "32억원", marketCap: "7,516억원", tradingRatio: { buy: 20, sell: 80 }, industry: "", aiSummary: "지수 상승으로 하락" },
    { rank: 17, code: "035420B", name: "NAVER", logoSrc: "/demo-invest/logos/naver.png", price: "221,000원", changeRate: "+6.25%", direction: "up", tradingVolume: "28억원", marketCap: "32.9조원", tradingRatio: { buy: 79, sell: 21 }, industry: "인터넷", aiSummary: "플랫폼 기대감" },
];

export const watchlistTop10: WatchlistItem[] = [
    { code: "MRNA", name: "모더나", logoSrc: "/demo-invest/logos/watch-0.png", price: "230,571원", change: "-13,996원", changeRate: "(5.72%)", direction: "down" },
    { code: "000660", name: "SK하이닉스", logoSrc: "/demo-invest/logos/watch-1.png", price: "1,663,000원", change: "+163,000원", changeRate: "(10.86%)", direction: "up" },
    { code: "005930", name: "삼성전자", logoSrc: "/demo-invest/logos/watch-2.png", price: "266,000원", change: "+18,500원", changeRate: "(7.47%)", direction: "up" },
    { code: "009150", name: "삼성전기", logoSrc: "/demo-invest/logos/watch-2.png", price: "1,397,000원", change: "+10,000원", changeRate: "(0.72%)", direction: "up" },
    { code: "475150", name: "SK이터닉스", logoSrc: "/demo-invest/logos/watch-1.png", price: "61,700원", change: "+3,900원", changeRate: "(6.74%)", direction: "up" },
    { code: "001510", name: "SK증권", logoSrc: "/demo-invest/logos/watch-1.png", price: "2,810원", change: "+645원", changeRate: "(29.79%)", direction: "up" },
    { code: "950160", name: "코오롱티슈진", logoSrc: "/demo-invest/logos/watch-0.png", price: "22,150원", change: "-3,750원", changeRate: "(14.47%)", direction: "down" },
    { code: "064260", name: "다날", logoSrc: "/demo-invest/logos/watch-3.png", price: "5,380원", change: "+735원", changeRate: "(15.82%)", direction: "up" },
    { code: "402340", name: "SK스퀘어", logoSrc: "/demo-invest/logos/watch-1.png", price: "1,074,000원", change: "+70,000원", changeRate: "(6.97%)", direction: "up" },
    { code: "403870", name: "HPSP", logoSrc: "/demo-invest/logos/watch-5.png", price: "48,300원", change: "+2,600원", changeRate: "(5.68%)", direction: "up" },
];

export const spxDailyPrices: DailyPriceRow[] = [
    { date: "2026-08-19", close: "7,707.98", change: "+16.22", changeRate: "+0.21%", direction: "up", volume: "30억 4,136만", open: "7,716.74", high: "7,743.93", low: "7,700.07" },
    { date: "2026-08-18", close: "7,691.76", change: "-46.30", changeRate: "-0.60%", direction: "down", volume: "26억 7,958만", open: "7,700.04", high: "7,713.95", low: "7,688.63" },
    { date: "2026-08-17", close: "7,745.06", change: "-40.70", changeRate: "-0.52%", direction: "down", volume: "25억 6,367만", open: "7,790.68", high: "7,790.68", low: "7,744.88" },
    { date: "2026-08-14", close: "7,785.76", change: "-13.23", changeRate: "-0.17%", direction: "down", volume: "22억 4,795만", open: "7,806.60", high: "7,810.01", low: "7,776.31" },
    { date: "2026-08-13", close: "7,798.99", change: "+50.49", changeRate: "+0.65%", direction: "up", volume: "27억 1,061만", open: "7,763.18", high: "7,816.70", low: "7,763.18" },
    { date: "2026-08-12", close: "7,748.50", change: "+20.30", changeRate: "+0.26%", direction: "up", volume: "27억 5,378만", open: "7,765.46", high: "7,766.01", low: "7,737.95" },
    { date: "2026-08-11", close: "7,728.20", change: "-24.91", changeRate: "-0.32%", direction: "down", volume: "25억 5,914만", open: "7,767.51", high: "7,767.51", low: "7,717.25" },
    { date: "2026-08-10", close: "7,753.11", change: "-4.53", changeRate: "-0.06%", direction: "down", volume: "27억 7,428만", open: "7,751.74", high: "7,773.76", low: "7,743.11" },
];

export const indexListItems: IndexListItem[] = [
    { name: "코스피", value: "3,357.84", changeRate: "4.98%", direction: "up" },
    { name: "코스닥", value: "861.72", changeRate: "3.81%", direction: "up" },
    { name: "나스닥", value: "23,384.28", changeRate: "0.42%", direction: "up" },
    { name: "S&P 500", value: "7,707.98", changeRate: "0.21%", direction: "up" },
    { name: "다우존스", value: "45,012.34", changeRate: "0.15%", direction: "up" },
    { name: "VIX", value: "14.89", changeRate: "5.99%", direction: "down" },
    { name: "필라델피아 반도체", value: "11,738.22", changeRate: "2.12%", direction: "down" },
];

export const relatedEtfs: RelatedEtf[] = [
    { code: "SPY", name: "SPDR S&P 500 ETF", logoSrc: "/demo-invest/logos/etf-spy.png", price: "$643.20", changeRate: "+0.21%", direction: "up" },
    { code: "VOO", name: "Vanguard S&P 500", logoSrc: "/demo-invest/logos/etf-voo.png", price: "$592.80", changeRate: "+0.20%", direction: "up" },
    { code: "IVV", name: "iShares Core S&P 500", logoSrc: "/demo-invest/logos/etf-ivv.png", price: "$658.40", changeRate: "+0.21%", direction: "up" },
    { code: "360750", name: "TIGER 미국S&P500", logoSrc: "/demo-invest/logos/etf-spy.png", price: "22,450원", changeRate: "+0.18%", direction: "up" },
    { code: "379800", name: "KODEX 미국S&P500", logoSrc: "/demo-invest/logos/etf-voo.png", price: "21,890원", changeRate: "+0.19%", direction: "up" },
];

export const bottomTicker = [
    { name: "필라델피아 반도체", value: "11,738.22", change: "-254.24", changeRate: "2.11%", direction: "down" as MarketDirection },
    { name: "VIX", value: "14.89", change: "-0.95", changeRate: "5.99%", direction: "down" as MarketDirection },
    { name: "코스피", value: "3,357.84", change: "+322.61", changeRate: "4.98%", direction: "up" as MarketDirection },
    { name: "S&P 500", value: "7,707.98", change: "+16.22", changeRate: "0.21%", direction: "up" as MarketDirection },
];

export function findStockByCode(code: string) {
    return stockRanking.find((stock) => stock.code === code);
}
