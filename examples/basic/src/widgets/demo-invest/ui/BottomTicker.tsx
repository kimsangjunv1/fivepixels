import { useState } from "react";

import { bottomTicker } from "../model/mockMarketData";

export function BottomTicker() {
    const [paused, setPaused] = useState(false);
    const tickerItems = [...bottomTicker, ...bottomTicker];

    return (
        <div className="demo-invest__bottom-ticker" data-report-id="demo-bottom-ticker" data-report-type="group" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <button type="button" className="demo-invest__ticker-toggle" onClick={() => setPaused((current) => !current)} aria-label={paused ? "시세 흐름 재생" : "시세 흐름 일시정지"}>{paused ? "▶" : "Ⅱ"}</button>
            <div className={`demo-invest__ticker-track${paused ? " is-paused" : ""}`} data-report-id="demo-ticker-marquee" data-report-type="item">
                {tickerItems.map((item, index) => (
                    <span key={`${item.name}-${index}`} className="demo-invest__ticker-item">
                        <span className="demo-invest__ticker-name">{item.name} </span>
                        {item.value}{" "}
                        <span className={`demo-invest__text-${item.direction}`}>
                            {item.change} ({item.changeRate})
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
