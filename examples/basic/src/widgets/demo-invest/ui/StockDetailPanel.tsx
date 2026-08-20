import type { StockRow } from "../model/mockMarketData";
import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";

type StockDetailPanelProps = {
    stock: StockRow;
};

export function StockDetailPanel({ stock }: StockDetailPanelProps) {
    const { openDialog } = useDemoInvestInteractions();

    return (
        <aside className="demo-invest__detail-panel" data-stock-code={stock.code} data-report-id="demo-stock-detail" data-report-type="group">
            <div className="demo-invest__detail-header" data-report-id="demo-detail-header" data-report-type="item">
                <img src={stock.logoSrc} alt="" className="demo-invest__detail-logo" />
                <div>
                    <div className="demo-invest__detail-title">{stock.name}</div>
                    <div className="demo-invest__detail-sub">{stock.price} <span className={`demo-invest__text-${stock.direction}`}>{stock.changeRate}</span></div>
                </div>
                <button type="button" className="demo-invest__detail-order" data-fp-open="demo-modal-login" onClick={() => openDialog("investLogin")}>주문</button>
            </div>
            <div className="demo-invest__chart-label">일봉</div>
            <img
                src="/demo-invest/charts/home-stock-chart.png"
                alt={`${stock.name} 차트`}
                className="demo-invest__chart-img"
                data-report-id="demo-stock-chart"
                data-report-type="item"
            />

            <div className="demo-invest__detail-community">
                <h3>커뮤니티</h3>
                <article><b className="blue-avatar">송도맨1</b><small>43분</small><p>돈 버는게 어려워?<br />따라해보세요.<br />떨어지면? “산다”<br />오르면? “판다”<br />어렵지않아요</p><div><strong>KORU 565주</strong><b>+1,392,988원 (9.84%)</b><small>1주당 27,514원 · 8월 19일 15:57</small></div></article>
                <article><b className="photo-avatar">주주</b><small>22분</small><p>항의중<br />화이팅</p><div><strong>KORU 30주</strong><b>+46,409원 (5.80%)</b><small>1주당 28,232원 · 오늘 09:38</small></div></article>
                <article><b className="sun-avatar">주주</b><small>29분</small><p>자 이제 24퍼만 더 오르자</p></article>
            </div>
        </aside>
    );
}
