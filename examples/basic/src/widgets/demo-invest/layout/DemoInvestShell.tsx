import { Link, Outlet, useLocation } from "react-router-dom";

import { DemoInvestInteractionProvider } from "../model/DemoInvestInteractionContext";
import { useDemoInvestTheme } from "../model/DemoInvestThemeContext";
import { BottomTicker } from "../ui/BottomTicker";
import { DemoInvestHeader } from "../ui/DemoInvestHeader";
import { RightRail } from "../ui/RightRail";
import { WatchlistSidebar } from "../ui/WatchlistSidebar";

export function DemoInvestShell() {
    const { pathname } = useLocation();
    const { theme } = useDemoInvestTheme();
    const showMarketTicker = pathname === "/";
    const isResponsiveCheckPage = pathname === "/responsive-check";

    return (
        <DemoInvestInteractionProvider>
            <div
                className="demo-invest"
                data-theme={theme}
                data-page={isResponsiveCheckPage ? "responsive-check" : undefined}
                data-report-id="demo-invest-shell"
                data-report-type="group"
            >
                <DemoInvestHeader />
                <div className={`demo-invest__shell${isResponsiveCheckPage ? " demo-invest__shell--responsive-check" : ""}`}>
                    <main className="demo-invest__main">
                        <Outlet />
                    </main>
                    <WatchlistSidebar />
                    <RightRail />
                </div>
                {showMarketTicker ? <BottomTicker /> : null}
            </div>
        </DemoInvestInteractionProvider>
    );
}

export { Link as DemoInvestLink };
