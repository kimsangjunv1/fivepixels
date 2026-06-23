import { NavLink } from "react-router-dom";

const navItems = [
    { id: "nav-landing", to: "/", label: "랜딩" },
    { id: "nav-pricing", to: "/pricing", label: "요금" },
    { id: "nav-contact", to: "/contact", label: "문의" },
    { id: "nav-modals", to: "/modals", label: "모달" },
];

export function SiteHeader() {
    return (
        <header className="site-header" data-report-id="site-header" data-report-type="group">
            <div className="site-header__brand" data-report-id="site-brand" data-report-type="item">
                <span className="site-header__logo">fivepixels</span>
                <span className="site-header__tagline">feedback demo</span>
            </div>
            <nav className="site-nav" data-report-id="site-nav" data-report-type="group">
                {navItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.to}
                        className={({ isActive }) => (isActive ? "site-nav__link site-nav__link--active" : "site-nav__link")}
                        end={item.to === "/"}
                        data-report-id={item.id}
                        data-report-type="item"
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
