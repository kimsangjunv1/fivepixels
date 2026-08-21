import { Link } from "react-router-dom";

import { indexListItems, relatedEtfs, spxDailyPrices } from "../model/mockMarketData";

export function IndexDetailPage() {
    return (
        <div className="demo-invest__index-page" data-report-id="demo-index-page" data-report-type="group">
            <div className="demo-invest__index-header">
                <div className="demo-invest__index-title-wrap">
                    <h1>S&amp;P 500</h1>
                    <div className="demo-invest__index-price">7,707.98</div>
                    <div className="demo-invest__index-meta">
                        <span className="up">전일대비 +16.22 (0.21%)</span> · 장마감 시세 · 🇺🇸 미국
                    </div>
                </div>

                <div className="demo-invest__index-stats" data-report-id="demo-index-stats" data-report-type="group">
                    {[
                        { label: "거래량", value: "30억 4,136만" },
                        { label: "시가", value: "7,716.74" },
                        { label: "1일 최저", value: "7,700.07" },
                        { label: "1일 최고", value: "7,743.93" },
                        { label: "52주 최저", value: "6,106.20" },
                        { label: "52주 최고", value: "7,816.70" },
                    ].map((stat) => (
                        <div key={stat.label} className="demo-invest__index-stat">
                            <div className="demo-invest__index-stat-label">{stat.label}</div>
                            <div className="demo-invest__index-stat-value">{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="demo-invest__index-layout">
                <div>
                    <section className="demo-invest__chart-panel" data-report-id="demo-index-chart" data-report-type="group">
                        <div className="demo-invest__chart-toolbar">
                            <div className="demo-invest__chart-tabs">
                                {["60분", "일", "주", "월", "년"].map((tab, index) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        className={`demo-invest__chart-tab${index === 1 ? " demo-invest__chart-tab--active" : ""}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="demo-invest__chart-links">
                                <span>+ 보조지표</span>
                                <span>그리기</span>
                                <span>차트 크게보기</span>
                            </div>
                        </div>

                        <img
                            src="/demo-invest/charts/spx-candlestick.png"
                            alt="S&P 500 캔들 차트"
                            className="demo-invest__chart-img"
                        />
                    </section>

                    <section className="demo-invest__insight-locked" data-report-id="demo-index-ai-insight" data-report-type="item">
                        <div className="demo-invest__insight-blur">
                            <div className="demo-invest__ai-block-title">
                                <img src="/demo-invest/icons/sparkle.png" alt="" />
                                왜 올랐을까?
                            </div>
                            <p className="demo-invest__ai-block-text">장기금리 완화로 S&amp;P 500 0.1% 상승</p>
                            <p className="demo-invest__ai-block-text">
                                미국 장기국채 금리 하락과 함께 위험자산 선호 심리가 회복되며 대형주 중심으로
                                S&amp;P 500 지수가 소폭 상승했습니다.
                            </p>
                        </div>
                        <div className="demo-invest__insight-overlay">
                            <img src="/demo-invest/icons/icon-lock-mono.png" alt="" />
                            <button type="button">로그인하고 자세히 보기</button>
                        </div>
                    </section>

                    <section className="demo-invest__daily-table" data-report-id="demo-daily-prices" data-report-type="group">
                        <h3>일별 시세</h3>
                        <div className="demo-invest__table-wrap">
                            <table className="demo-invest__table">
                                <thead>
                                    <tr>
                                        <th>일자</th>
                                        <th>종가</th>
                                        <th>전일대비</th>
                                        <th>등락률</th>
                                        <th>거래량</th>
                                        <th>시가</th>
                                        <th>고가</th>
                                        <th>저가</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {spxDailyPrices.map((row) => (
                                        <tr key={row.date}>
                                            <td>{row.date}</td>
                                            <td>{row.close}</td>
                                            <td className={`demo-invest__text-${row.direction}`}>{row.change}</td>
                                            <td className={`demo-invest__text-${row.direction}`}>{row.changeRate}</td>
                                            <td>{row.volume}</td>
                                            <td>{row.open}</td>
                                            <td>{row.high}</td>
                                            <td>{row.low}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="demo-invest__side-column">
                    <section className="demo-invest__side-card" data-report-id="demo-indices-list" data-report-type="group">
                        <div className="demo-invest__side-tabs">
                            {["지수·환율", "채권", "원자재", "가상자산"].map((tab, index) => (
                                <button
                                    key={tab}
                                    type="button"
                                    className={`demo-invest__side-tab${index === 0 ? " demo-invest__side-tab--active" : ""}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {indexListItems.map((item) => (
                            <div key={item.name} className="demo-invest__side-list-item">
                                <span>{item.name}</span>
                                <span>
                                    {item.value}{" "}
                                    <span className={`demo-invest__text-${item.direction}`}>{item.changeRate}</span>
                                </span>
                            </div>
                        ))}
                    </section>

                    <section className="demo-invest__side-card" data-report-id="demo-related-etfs" data-report-type="group">
                        <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>S&amp;P 500 관련 ETF</h3>
                        {relatedEtfs.map((etf) => (
                            <div key={etf.code} className="demo-invest__etf-item">
                                <img src={etf.logoSrc} alt="" />
                                <div className="demo-invest__etf-info">
                                    <div className="demo-invest__etf-name">{etf.name}</div>
                                    <div className="demo-invest__etf-code">{etf.code}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div>{etf.price}</div>
                                    <div className={`demo-invest__text-${etf.direction}`}>{etf.changeRate}</div>
                                </div>
                            </div>
                        ))}
                    </section>

                    <Link to="/" className="demo-invest__filter" style={{ textAlign: "center", textDecoration: "none" }}>
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
