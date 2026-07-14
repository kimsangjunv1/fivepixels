import type { PickProbeCompareMode } from "../../types/report-ui.js";
type PickTargetCompareSegmentProps = {
    mode: PickProbeCompareMode;
    onChange: (mode: PickProbeCompareMode) => void;
    beforeLabel: string;
    afterLabel: string;
    className?: string;
    tone?: "default" | "inverse";
};
export declare function PickTargetCompareSegment({ mode, onChange, beforeLabel, afterLabel, className, tone, }: PickTargetCompareSegmentProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PickTargetCompareSegment.d.ts.map