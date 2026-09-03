import type { PickTargetFontStyle } from "../../../shared/types/report-ui.js";
export declare function getPickTargetBoxStyle(element: HTMLElement): {
    display: string;
    padding: string;
    margin: string;
    borderRadius: string;
};
export declare function shouldInspectFontStyle(element: HTMLElement): boolean;
export declare function getPickTargetFontStyle(element: HTMLElement): PickTargetFontStyle | null;
export declare function getPickTargetTagName(element: HTMLElement): string;
export declare function getPickTargetReportIdAttribute(element: HTMLElement): string | null;
export declare function getPickTargetFpOpenAttribute(element: HTMLElement): string | null;
export declare function getPickTargetFpViewAttribute(element: HTMLElement): string | null;
//# sourceMappingURL=pickTargetInspect.d.ts.map