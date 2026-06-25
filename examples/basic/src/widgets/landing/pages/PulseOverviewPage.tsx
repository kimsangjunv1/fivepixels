import { PulseKanban } from "../ui/PulseKanban";
import { PulseQuickActions } from "../ui/PulseQuickActions";
import { PulseRecentActivity } from "../ui/PulseRecentActivity";
import { PulseStats } from "../ui/PulseStats";

export function PulseOverviewPage() {
    return (
        <>
            <PulseStats />
            <PulseKanban />
            <div className="pulse-bottom">
                <PulseRecentActivity />
                <PulseQuickActions />
            </div>
        </>
    );
}
