import { FeedbackActivityHeatmap } from "./FeedbackActivityHeatmap.js";

export function ReportOverview() {
    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]">
            <FeedbackActivityHeatmap />
        </section>
    );
}
