import type { PickProbeCompareMode } from "@/types/report-ui.js";

type PickTargetCompareSegmentProps = {
    mode: PickProbeCompareMode;
    onChange: (mode: PickProbeCompareMode) => void;
    beforeLabel: string;
    afterLabel: string;
    className?: string;
};

export function PickTargetCompareSegment({
    mode,
    onChange,
    beforeLabel,
    afterLabel,
    className = "",
}: PickTargetCompareSegmentProps) {
    return (
        <div
            className={`inline-flex overflow-hidden rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] p-[2px] shadow-[var(--adaptive-popup-shadow)] ${className}`.trim()}
            data-fivepixels-interactive=""
            onClick={(event) => event.stopPropagation()}
        >
            {(["before", "after"] as const).map((option) => {
                const active = mode === option;

                return (
                    <button
                        key={option}
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={() => onChange(option)}
                        className={`rounded-[6px] px-[8px] py-[3px] text-[11px] font-semibold transition-colors ${
                            active
                                ? "bg-[var(--adaptive-blue500)] text-white"
                                : "text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black100)]"
                        }`}
                    >
                        {option === "before" ? beforeLabel : afterLabel}
                    </button>
                );
            })}
        </div>
    );
}
