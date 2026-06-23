import type { Marker } from "../types/report-ui.js";
export type TooltipAnchor = Pick<Marker, "left" | "top">;
export declare function useTooltipLayout(anchor: TooltipAnchor | null, expanded: boolean, visible: boolean): {
    layout: {
        position: {
            left: number;
            top: number;
            width: number;
            placement: import("../utils/coordinates.js").TooltipPlacement;
        };
        anchorStyle: {
            readonly transform: "translateY(-100%)";
            readonly transformOrigin: "bottom left";
        } | {
            readonly transformOrigin: "top left";
            readonly transform?: undefined;
        };
    } | null;
    setTooltipElement: (node: HTMLElement | null) => void;
};
//# sourceMappingURL=useTooltipLayout.d.ts.map