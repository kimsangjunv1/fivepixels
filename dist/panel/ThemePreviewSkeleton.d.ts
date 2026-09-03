import type { ReportAppearance } from "../types/report.js";
export type ThemePreviewKind = "panel" | "tooltip";
type ThemePreviewSkeletonProps = {
    variant: ReportAppearance;
    kind?: ThemePreviewKind;
};
export declare function ThemePreviewSkeleton({ variant, kind }: ThemePreviewSkeletonProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ThemePreviewSkeleton.d.ts.map