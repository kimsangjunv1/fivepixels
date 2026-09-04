import type { ReportAppearance, QuestionThreadDisplay, ThreadLayoutStyle } from "../../shared/types/report.js";
export type PanelSettingsInitialCategory = "appearance";
type PanelSettingsProps = {
    transferDisabled?: boolean;
    panelAppearance: ReportAppearance;
    onPanelAppearanceChange: (appearance: ReportAppearance) => void;
    tooltipAppearance: ReportAppearance;
    onTooltipAppearanceChange: (appearance: ReportAppearance) => void;
    questionThreadDisplay: QuestionThreadDisplay;
    onQuestionThreadDisplayChange: (display: QuestionThreadDisplay) => void;
    threadLayout: ThreadLayoutStyle;
    onThreadLayoutChange: (layout: ThreadLayoutStyle) => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onPublicKeyCopy: () => void;
    onKeyInsert: () => void;
    onKeyRotate: () => void;
    initialCategory?: PanelSettingsInitialCategory | null;
};
export declare function PanelSettings({ transferDisabled, panelAppearance, onPanelAppearanceChange, tooltipAppearance, onTooltipAppearanceChange, questionThreadDisplay, onQuestionThreadDisplayChange, threadLayout, onThreadLayoutChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, initialCategory, }: PanelSettingsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelSettings.d.ts.map