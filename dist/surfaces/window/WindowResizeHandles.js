import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { ResizeHandle as ResizeHandleControl } from "./ResizeHandle.js";
export const ALL_WINDOW_RESIZE_EDGES = ["top", "bottom", "left", "right"];
const EDGE_ARIA_LABEL_KEY = {
    top: "resizeHeightAriaLabel",
    bottom: "resizeHeightAriaLabel",
    left: "resizeWidthAriaLabel",
    right: "resizeWidthAriaLabel",
};
export function WindowResizeHandles({ inactive = false, resizeWidthAriaLabel, resizeHeightAriaLabel, createResizePointerDown }) {
    const ariaLabels = {
        resizeWidthAriaLabel,
        resizeHeightAriaLabel,
    };
    return (_jsx(_Fragment, { children: ALL_WINDOW_RESIZE_EDGES.map((edge) => (_jsx(ResizeHandleControl, { edge: edge, ariaLabel: ariaLabels[EDGE_ARIA_LABEL_KEY[edge]], inactive: inactive, onPointerDown: createResizePointerDown({ kind: "edge", edge }) }, edge))) }));
}
//# sourceMappingURL=WindowResizeHandles.js.map