import { useEffect, useState } from "react";

type BreakpointLabel = "desktop" | "tablet" | "mobile";

function resolveBreakpoint(width: number): BreakpointLabel {
    if (width < 480) {
        return "mobile";
    }

    if (width < 900) {
        return "tablet";
    }

    return "desktop";
}

const breakpointLabels: Record<BreakpointLabel, string> = {
    desktop: "데스크톱 (900px 이상)",
    tablet: "태블릿 (480px ~ 899px)",
    mobile: "모바일 (479px 이하)",
};

const cards = [
    { title: "실시간 시세", body: "현재 viewport 폭에 맞춰 카드 열 수가 바뀝니다." },
    { title: "관심 종목", body: "모바일에서는 1열, 태블릿 2열, 데스크톱 3열로 배치됩니다." },
    { title: "뉴스 요약", body: "가로 스크롤 없이 세로로 쌓이는지 확인하세요." },
    { title: "배당 캘린더", body: "플로팅 모바일 미리보기에서 레이아웃이 바뀌는지 비교해 보세요." },
    { title: "AI 인사이트", body: "반응형 breakpoint가 정상 동작하면 이 영역 폭도 함께 줄어듭니다." },
    { title: "커뮤니티", body: "데스크톱 전용 고정 폭이 아닌 유동 레이아웃 데모입니다." },
];

const metrics = [
    { label: "KOSPI", value: "2,734.21", change: "+0.84%" },
    { label: "NASDAQ", value: "18,204.03", change: "+1.12%" },
    { label: "환율 USD", value: "1,382.4", change: "-0.21%" },
    { label: "금 1돈", value: "412,000", change: "+0.35%" },
];

export function ResponsiveCheckPage() {
    const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 0 : window.innerWidth));
    const breakpoint = resolveBreakpoint(viewportWidth);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="demo-invest__responsive-page" data-report-id="demo-responsive-page" data-report-type="group">
            <section className="demo-invest__responsive-hero" data-report-id="demo-responsive-hero" data-report-type="group">
                <div>
                    <p className="demo-invest__responsive-eyebrow">Fivepixels demo</p>
                    <h1>반응형 레이아웃 확인</h1>
                    <p className="demo-invest__responsive-lead">
                        모바일 플로팅 미리보기에서 이 페이지를 열면 viewport 폭에 따라 레이아웃이 바뀌는지 확인할 수 있어요.
                    </p>
                </div>
                <div className="demo-invest__responsive-metrics" data-report-id="demo-responsive-metrics" data-report-type="group">
                    <div className="demo-invest__responsive-metric">
                        <span>현재 viewport</span>
                        <strong>{viewportWidth}px</strong>
                    </div>
                    <div className="demo-invest__responsive-metric">
                        <span>적용 breakpoint</span>
                        <strong>{breakpointLabels[breakpoint]}</strong>
                    </div>
                </div>
            </section>

            <section className="demo-invest__responsive-stats" data-report-id="demo-responsive-stats" data-report-type="group">
                {metrics.map((metric) => (
                    <article key={metric.label} className="demo-invest__responsive-stat" data-report-type="item">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                        <em>{metric.change}</em>
                    </article>
                ))}
            </section>

            <section className="demo-invest__responsive-grid" data-report-id="demo-responsive-grid" data-report-type="group">
                {cards.map((card) => (
                    <article key={card.title} className="demo-invest__responsive-card" data-report-type="item">
                        <h2>{card.title}</h2>
                        <p>{card.body}</p>
                    </article>
                ))}
            </section>

            <section className="demo-invest__responsive-split" data-report-id="demo-responsive-split" data-report-type="group">
                <div className="demo-invest__responsive-panel">
                    <h2>좌측 패널</h2>
                    <p>900px 미만에서는 아래로 내려가 1열 스택으로 보여야 합니다.</p>
                    <ul>
                        <li>카드 padding 축소</li>
                        <li>표 헤더 줄바꿈</li>
                        <li>사이드 패널 숨김</li>
                    </ul>
                </div>
                <div className="demo-invest__responsive-panel demo-invest__responsive-panel--accent">
                    <h2>우측 패널</h2>
                    <p>모바일 미리보기에서 가로 스크롤이 없고 이 박스 폭이 화면에 맞게 줄어드는지 확인하세요.</p>
                    <button type="button">샘플 CTA</button>
                </div>
            </section>
        </div>
    );
}
