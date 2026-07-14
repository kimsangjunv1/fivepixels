import type { ReportAppearance } from "../../types/report.js";
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
};
export declare function AppearanceThemePicker({ options, value, onChange, disabled, ariaLabel }: AppearanceThemePickerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AppearanceThemePicker.d.ts.map