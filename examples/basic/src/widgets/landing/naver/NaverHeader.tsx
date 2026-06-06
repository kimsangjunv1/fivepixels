import { navLinks } from "./data";

export function NaverHeader() {
    return (
        <header className="naver-header" data-report-id="naver-header" data-report-type="group">
            <div className="naver-header__inner">
                <div className="naver-header__top">
                    <a
                        className="naver-header__logo"
                        href="#"
                        data-report-id="naver-logo"
                        data-report-type="item"
                    >
                        NAVER
                    </a>
                    <nav className="naver-header__nav" aria-label="주요 메뉴">
                        {navLinks.map((link) => (
                            <a
                                key={link.id}
                                className="naver-header__nav-link"
                                href="#"
                                data-report-id={link.id}
                                data-report-type="item"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="naver-header__utilities">
                        <button
                            className="naver-header__utility"
                            type="button"
                            data-report-id="naver-lang"
                            data-report-type="item"
                        >
                            KR
                        </button>
                        <button
                            className="naver-header__utility naver-header__utility--search"
                            type="button"
                            aria-label="검색"
                            data-report-id="naver-search"
                            data-report-type="item"
                        >
                            <span aria-hidden="true">⌕</span>
                        </button>
                    </div>
                </div>
                <div className="naver-header__meta">
                    <span className="naver-header__update" data-report-id="naver-update-time" data-report-type="item">
                        업데이트 14:24:55
                    </span>
                    <div className="naver-header__stock" data-report-id="naver-stock" data-report-type="item">
                        <strong>280,000</strong>
                        <span>KRW</span>
                        <span className="naver-header__stock-change">▲ 1.82%</span>
                        <button className="naver-header__stock-link" type="button">
                            주가정보 바로가기
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
