import { useLocation } from "react-router-dom";

const LIBRARY_GUIDE_URL = "https://fivepixels.codi-agit.com/fivepixels/guide";

const pageTitleByPath: Record<string, string> = {
    "/": "Overview",
    "/issues": "Issues",
    "/reviews": "Reviews",
    "/release": "Releases",
    "/settings": "Settings",
    "/edgecase": "Edgecase",
};

export function PulseHeader() {
    const { pathname } = useLocation();
    const pageTitle = pageTitleByPath[pathname] ?? "Pulse Board";

    return (
        <header className="pulse-header" data-fp-id="pulse-header" data-fp-type="group">
            <div className="pulse-header__title-wrap" data-fp-id="pulse-page-title" data-fp-type="item">
                <span className="pulse-header__eyebrow">Pulse Board</span>
                <h1 className="pulse-header__page-title">{pageTitle}</h1>
            </div>

            <label className="pulse-header__search" data-fp-id="pulse-search" data-fp-type="item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" aria-hidden>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input type="search" placeholder="Search issues, tags, or people..." />
            </label>

            <a
                className="pulse-header__back"
                href={LIBRARY_GUIDE_URL}
                data-fp-id="pulse-back-library"
                data-fp-type="item"
            >
                ← 라이브러리로 돌아가기
            </a>

            <div className="pulse-header__actions">
                <button type="button" className="pulse-header__icon-btn" aria-label="Notifications" data-fp-id="pulse-notifications" data-fp-type="item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M15 17H9l-1-4a5 5 0 0110 0l-1 4zM10 17a2 2 0 004 0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button type="button" className="pulse-header__filter" data-fp-id="pulse-filter" data-fp-type="item">
                    Filter
                </button>
                <div className="pulse-header__user" data-fp-id="pulse-user" data-fp-type="item">
                    <span className="pulse-header__avatar">SJ</span>
                    <span className="pulse-header__username">Sangjun</span>
                </div>
            </div>
        </header>
    );
}
