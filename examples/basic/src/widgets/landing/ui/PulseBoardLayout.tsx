import { Outlet } from "react-router-dom";

import { DashboardModals } from "./DashboardModals";
import { PulseHeader } from "./PulseHeader";
import { PulseSidebar } from "./PulseSidebar";

export function PulseBoardLayout() {
    return (
        <div className="pulse-board" data-report-id="pulse-board" data-report-type="group">
            <PulseSidebar />
            <div className="pulse-main">
                <PulseHeader />
                <div className="pulse-content">
                    <Outlet />
                </div>
            </div>
            <DashboardModals />
        </div>
    );
}
