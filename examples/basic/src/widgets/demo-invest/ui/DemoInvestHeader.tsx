import { Link, useLocation } from "react-router-dom";

import { useDemoInvestInteractions } from "../model/DemoInvestInteractionContext";
import { useDemoInvestTheme } from "../model/DemoInvestThemeContext";

const navItems = [
    { label: "홈", href: "/" },
    { label: "피드", href: "/feed" },
    { label: "주식 골라보기", href: "/screener" },
    { label: "내 계좌", href: "/signin" },
];

export function DemoInvestHeader() {
    const { pathname } = useLocation();
    const { theme } = useDemoInvestTheme();
    const { openDialog } = useDemoInvestInteractions();
    const logoSrc = theme === "light" ? "/demo-invest/logo-toss-blue.svg" : "/demo-invest/logo-toss-white.png";

    return (
        <header className="demo-invest__header" data-report-id="demo-invest-header" data-report-type="group">
            <div className="demo-invest__header-main">
                <Link to="/" className="demo-invest__brand" data-report-id="demo-invest-brand" data-report-type="item">
                    <img src={logoSrc} alt="토스증권" />
                </Link>

                <nav className="demo-invest__nav" data-report-id="demo-invest-nav" data-report-type="group">
                    {navItems.map((item) => {
                        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`demo-invest__nav-link${active ? " demo-invest__nav-link--active" : ""}`}
                                data-report-id={`demo-nav-${item.label}`}
                                data-report-type="item"
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button type="button" className="demo-invest__search" data-fp-open="demo-modal-search" data-report-id="demo-invest-search" data-report-type="item" onClick={() => openDialog("investSearch")}>
                    <img src="/demo-invest/icons/icon-search-mono.png" alt="" />
                    <kbd>/</kbd>
                    <span>를 눌러 검색하세요</span>
                </button>

                <button type="button" className="demo-invest__login" data-fp-open="demo-modal-login" data-report-id="demo-invest-login" data-report-type="item" onClick={() => openDialog("investLogin")}>
                    로그인
                </button>
            </div>
            <div className="demo-invest__header-watch">
                <strong>관심</strong>
                <span className="demo-invest__currency">$</span>
                <span className="demo-invest__currency demo-invest__currency--active">원</span>
            </div>
            <div className="demo-invest__header-rail">≫</div>
        </header>
    );
}
