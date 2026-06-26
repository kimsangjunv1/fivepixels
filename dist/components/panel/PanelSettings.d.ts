import type { ReportAppearance } from "../../types/report.js";
type PanelSettingsProps = {
    transferDisabled?: boolean;
    appearance: ReportAppearance;
    onAppearanceChange: (appearance: ReportAppearance) => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onPublicKeyCopy: () => void;
    onKeyInsert: () => void;
    onKeyRotate: () => void;
};
export declare function PanelSettings({ transferDisabled, appearance, onAppearanceChange, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onPublicKeyCopy, onKeyInsert, onKeyRotate, }: PanelSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PanelSettings.d.ts.map