import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";

type MiniMarketProps = {
    name: string;
    value: string;
    change: string;
    tone?: "up" | "down";
    tag?: string;
    points?: string;
};

function MiniMarket({ name, value, change, tone = "up", tag, points = "2,38 9,25 18,21 27,12 35,18 45,8 56,7" }: MiniMarketProps) {
    const color = tone === "up" ? "#f04452" : "#3182f6";

    return (
        <div className="demo-invest__mini-market">
            <div className="demo-invest__mini-copy">
                <span>{name}{tag ? <small>{tag}</small> : null}</span>
                <strong>{value} <b className={`demo-invest__text-${tone}`}>{change}</b></strong>
            </div>
            <svg viewBox="0 0 60 44" aria-hidden="true">
                <polyline points={points} fill="none" stroke={color} strokeWidth="1.7" />
            </svg>
        </div>
    );
}

export function MarketIndexBar() {
    const { openDialog } = useDemoInvestInteractions();

    return (
        <section className="demo-invest__market-overview" data-report-id="demo-index-cards" data-report-type="group">
            <div className="demo-invest__market-bar" data-report-id="demo-market-hours" data-report-type="group">
                <span className="demo-invest__market-dot" />
                <span><strong>국내 정규장</strong> 09:00 ~ 15:30</span>
                <span className="demo-invest__market-dot" />
                <span><strong>해외 데이마켓</strong> 09:00 ~ 17:00</span>
                <button type="button" onClick={() => openDialog("investLogin")} data-fp-open="demo-modal-login" data-report-id="demo-ai-intro" data-report-type="item">✦ 토스증권 AI 소개</button>
            </div>

            <div className="demo-invest__market-grid">
                <div className="demo-invest__market-primary">
                    <MiniMarket name="코스피" tag="장기금리 진정" value="6,792.12" change="+320.95 (4.95%)" points="2,41 8,30 15,25 22,22 29,14 37,11 45,6 54,7" />
                    <div className="demo-invest__investors"><span>개인 <b>-4,848</b></span><span>외국인 <b className="up">+4,912</b></span><span>기관 <b>-2,216</b></span></div>
                </div>
                <div>
                    <MiniMarket name="코스닥" tag="미국 금리 진정" value="836.62" change="+12.16 (1.47%)" />
                    <MiniMarket name="달러 환율" tag="달러 금융완화" value="1,394.15" change="-8.35 (0.59%)" tone="down" points="2,34 7,39 13,23 19,19 24,34 32,15 42,25 55,27" />
                    <MiniMarket name="VIX" value="14.89" change="-0.95 (5.99%)" tone="down" points="2,9 9,13 17,12 25,20 34,21 43,29 51,27 58,35" />
                </div>
                <div>
                    <MiniMarket name="나스닥 100 선물" value="실시간 시세 보기  ›" change="" points="2,34 8,25 14,31 21,18 29,28 38,29 47,25 56,29" />
                    <MiniMarket name="나스닥" tag="장기금리 급락" value="26,331.09" change="+41.38 (0.15%)" />
                    <MiniMarket name="S&P 500" tag="장기금리 완화" value="7,707.98" change="+16.22 (0.21%)" />
                </div>
                <div>
                    <MiniMarket name="필라델피아 반도체" value="11,738.22" change="-254.24" tone="down" points="2,11 7,34 13,15 20,19 26,13 35,21 43,15 52,20 58,18" />
                    <MiniMarket name="비트코인" tag="정체 전환" value="95,603,000" change="›" />
                    <MiniMarket name="금" tag="달러 약세 금리" value="실시간 시세 보기" change="›" />
                </div>
                <aside className="demo-invest__schedule-card">
                    <div><strong>주요 일정</strong><span>›</span></div>
                    <p>필라델피아 연은 제조업 지수와 월마트 실적<br />발표가 주목받고 있어요</p>
                    <ul>
                        <li><b>오늘</b> 주간 신규실업수당 청구건수...</li>
                        <li><b>오늘</b> 필라델피아 연은 제조업 활동...</li>
                        <li><b>25일</b> CB 소비자신뢰지수 발표</li>
                    </ul>
                </aside>
            </div>
        </section>
    );
}
