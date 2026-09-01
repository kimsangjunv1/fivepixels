import { useDemoInvestTheme } from "../model/DemoInvestThemeContext";

export function RightRail() {
    const { theme, toggleTheme } = useDemoInvestTheme();
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
            <button
                type="button"
                className="demo-invest__theme-button"
                onClick={toggleTheme}
                aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
                data-report-id="demo-theme-toggle"
                data-report-type="item"
            >
                {theme === "light" ? "☾" : "☀"}
            </button>
        </aside>
    );
}
