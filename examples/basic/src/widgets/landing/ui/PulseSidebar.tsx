import { NavLink } from "react-router-dom";

import { useLandingProvider } from "../../../features/landing/model/LandingContext";

function NavIcon({ type }: { type: string }) {
    const paths: Record<string, string> = {
        grid: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z",
        list: "M4 6h16M4 12h16M4 18h16",
        review: "M7 8h10M7 12h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
        release: "M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5",
        settings: "M12 8a4 4 0 100 8 4 4 0 000-8zm8-2l-1.5 2.5L16 7.5 17.5 5 20 6zM4 6l1.5 2.5L8 7.5 6.5 5 4 6z",
    };

    return (
        <svg className="pulse-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d={paths[type] ?? paths.grid} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function PulseSidebar() {
    const { navItems } = useLandingProvider();

    return (
        <aside className="pulse-sidebar" data-report-id="pulse-sidebar" data-report-type="group">
            <div className="pulse-sidebar__brand" data-report-id="pulse-brand" data-report-type="item">
                <span className="pulse-sidebar__logo">QA</span>
                <div className="pulse-sidebar__titles">
                    <span className="pulse-sidebar__title">Pulse Board</span>
                    <span className="pulse-sidebar__subtitle">stitchable-demo</span>
                </div>
            </div>

            <nav className="pulse-sidebar__nav" data-report-id="pulse-nav" data-report-type="group">
                {navItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) => (isActive ? "pulse-sidebar__link pulse-sidebar__link--active" : "pulse-sidebar__link")}
                        data-report-id={item.id}
                        data-report-type="item"
                    >
                        <NavIcon type={item.icon} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                className="pulse-sidebar__create"
                data-report-id="pulse-create-issue"
                data-report-type="item"
            >
                Create issue
            </button>
        </aside>
    );
}
