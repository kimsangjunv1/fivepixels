import type { ReportAppearance, QuestionThreadDisplay } from "../../types/report.js";
type PanelSettingsProps = {
    transferDisabled?: boolean;
    panelAppearance: ReportAppearance;
    onPanelAppearanceChange: (appearance: ReportAppearance) => void;
    tooltipAppearance: ReportAppearance;
    onTooltipAppearanceChange: (appearance: ReportAppearance) => void;
    questionThreadDisplay: QuestionThreadDisplay;
    onQuestionThreadDisplayChange: (display: QuestionThreadDisplay) => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onPublicKeyCopy: () => void;
    onKeyInsert: () => void;
    onKeyRotate: () => void;
};
export declare function PanelSettings({ transferDisabled, panelAppearance, onPanelAppearanceChange, tooltipAppearance, onTooltipAppearanceChange, questionThreadDisplay, onQuestionThreadDisplayChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, }: PanelSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PanelSettings.d.ts.map