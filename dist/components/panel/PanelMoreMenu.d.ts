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
};
export declare function PanelMoreMenu({ open, disabled, appearance, onAppearanceChange, onToggle, onClose, onExport, onImport, onCommand }: PanelMoreMenuProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PanelMoreMenu.d.ts.map