import type { TargetSnapshot } from "../types/report-ui.js";
export declare function escapeAttribute(value: string): string;
export declare function toSnapshot(element: HTMLElement | null): TargetSnapshot | null;
export declare function findTargetElement(baseElement: HTMLElement | null): HTMLElement | null;
export declare function getSelectableTargets(): TargetSnapshot[];
export declare function findTargetByPoint(overlay: HTMLDivElement | null, clientX: number, clientY: number): HTMLElement | null;
//# sourceMappingURL=dom.d.ts.map