import type { ReportAppearance, QuestionThreadDisplay, ThreadLayoutStyle } from "../../shared/types/report.js";
export type PanelSettingsInitialCategory = "appearance";
export type PanelSettingsInitialAppearanceSection = "theme-language" | "thread-layout" | "feedback-mode" | "marker";
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
    initialAppearanceSection?: PanelSettingsInitialAppearanceSection | null;
};
export declare function PanelSettings({ transferDisabled, panelAppearance, onPanelAppearanceChange, tooltipAppearance, onTooltipAppearanceChange, questionThreadDisplay, onQuestionThreadDisplayChange, threadLayout, onThreadLayoutChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, initialCategory, initialAppearanceSection, }: PanelSettingsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelSettings.d.ts.map