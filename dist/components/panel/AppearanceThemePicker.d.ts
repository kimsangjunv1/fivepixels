import type { ReportAppearance } from "../../types/report.js";
import { type ThemePreviewKind } from "./ThemePreviewSkeleton.js";
type AppearanceThemeOption = {
    value: ReportAppearance;
    label: string;
};
type AppearanceThemePickerProps = {
    options: readonly AppearanceThemeOption[];
    value: ReportAppearance;
    onChange: (value: ReportAppearance) => void;
    disabled?: boolean;
    ariaLabel?: string;
    previewKind?: ThemePreviewKind;
};
export declare function AppearanceThemePicker({ options, value, onChange, disabled, ariaLabel, previewKind, }: AppearanceThemePickerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AppearanceThemePicker.d.ts.map