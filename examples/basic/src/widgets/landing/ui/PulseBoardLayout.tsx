import { Outlet } from "react-router-dom";

import { DashboardModals } from "./DashboardModals";
import { PulseHeader } from "./PulseHeader";
import { PulseSidebar } from "./PulseSidebar";

export function PulseBoardLayout() {
    return (
        <div className="pulse-board" data-fp-id="pulse-board" data-fp-type="group">
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
