import type { ReportMessages } from "../../shared/i18n/types.js";
import type { PickProbeFieldKey, PickProbeLayoutMode, PickProbeValues } from "../../shared/types/report-ui.js";
type ProbeLayoutControlsProps = {
    layoutMode: PickProbeLayoutMode;
    values: PickProbeValues;
    messages: ReportMessages;
    onChange: (key: PickProbeFieldKey, value: string) => void;
};
export declare function ProbeLayoutControls({ layoutMode, values, messages, onChange }: ProbeLayoutControlsProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ProbeLayoutControls.d.ts.map