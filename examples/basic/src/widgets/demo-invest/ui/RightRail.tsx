export function RightRail() {
    const items = [
        { label: "내 투자", active: false, icon: "▰" },
        { label: "관심", active: true, icon: "♥" },
        { label: "최근 본", active: false, icon: "◕" },
        { label: "실시간", active: false, icon: "♟" },
    ];

    return (
        <aside className="demo-invest__right-rail" data-report-id="demo-right-rail" data-report-type="group">
            {items.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    className={`demo-invest__rail-btn${item.active ? " demo-invest__rail-btn--active" : ""}`}
                    data-report-id={`demo-rail-${item.label}`}
                    data-report-type="item"
                >
                    <span>{item.icon}</span>
                    {item.label}
                </button>
            ))}
            <button type="button" className="demo-invest__theme-button">◔</button>
        </aside>
    );
}
