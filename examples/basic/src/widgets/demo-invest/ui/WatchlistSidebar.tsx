import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";

export function WatchlistSidebar() {
    const { openDialog, watchlist, removeWatch } = useDemoInvestInteractions();

    return (
        <aside className="demo-invest__watchlist" data-report-id="demo-watchlist" data-report-type="group">
            <div className="demo-invest__watchlist-ai" data-report-id="demo-watchlist-ai" data-report-type="item">
                <strong>✦ 토스증권 AI</strong>
                <span>마이크로소프... AI칩 효율 개선으로 0.4% 상승</span>
                <b>›</b>
            </div>

            <div className="demo-invest__watchlist-subtitle"><strong>관심 주식 TOP 10</strong><span>관심 그룹에 담아보세요</span></div>

            {watchlist.map((item) => (
                <div
                    key={item.code}
                    className="demo-invest__watchlist-item"
                    data-report-id={`demo-watchlist-${item.code}`}
                    data-report-type="item"
                >
                    <img src={item.logoSrc} alt={item.name} className="demo-invest__stock-logo" />
                    <div className="demo-invest__watchlist-info">
                        <div className="demo-invest__watchlist-name">{item.name}</div>
                        <div className="demo-invest__watchlist-price">{item.price}</div>
                    </div>
                    <div className={`demo-invest__watchlist-change demo-invest__text-${item.direction}`}>
                        {item.change}
                        {item.changeRate}
                    </div>
                    <button type="button" className="demo-invest__watchlist-heart" aria-label={`${item.name} 관심 종목에서 제거`} onClick={() => removeWatch(item.code)}>♥</button>
                </div>
            ))}

            <button type="button" className="demo-invest__watchlist-add" data-report-id="demo-watchlist-add" data-report-type="item" onClick={() => openDialog("investWatchlist")}>
                <span>＋</span> 추가하기
            </button>
        </aside>
    );
}
