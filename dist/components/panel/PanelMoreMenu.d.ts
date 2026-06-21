import type { ReportAppearance } from "../../types/report.js";
type PanelMoreMenuProps = {
    open: boolean;
    disabled?: boolean;
    appearance: ReportAppearance;
    onAppearanceChange: (appearance: ReportAppearance) => void;
    onToggle: () => void;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onKeyInsert: () => void;
};
export declare function PanelMoreMenu({ open, disabled, appearance, onAppearanceChange, onToggle, onClose, onExport, onImport, onCommand, hasPersonalKey, onKeyCopy, onKeyInsert, }: PanelMoreMenuProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PanelMoreMenu.d.ts.map