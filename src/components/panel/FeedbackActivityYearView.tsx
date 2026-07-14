import { FeedbackActivityHeatmap } from "./FeedbackActivityHeatmap.js";
import { useReport } from "@/providers/reportContext.js";

type FeedbackActivityYearViewProps = {
    onClose: () => void;
};

export function FeedbackActivityYearView({ onClose }: FeedbackActivityYearViewProps) {
    const { messages } = useReport();

    return (
        <div className="absolute inset-0 z-[40] flex min-h-0 flex-col overflow-hidden rounded-[0_0_12px_12px] bg-[var(--adaptive-black50)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--adaptive-black200)] px-[16px] py-[10px]">
                <p className="text-[13px] font-[700] text-[var(--adaptive-black900)]">{messages.panel.yearViewTitle}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-[12px] font-[600] text-[var(--adaptive-blue500)] hover:underline"
                >
                    {messages.panel.yearViewBack}
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <FeedbackActivityHeatmap />
            </div>
        </div>
    );
}
