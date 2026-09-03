import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { ResizeHandle as ResizeHandleControl } from "../../surfaces/window/ResizeHandle.js";
import { isVerticalResizeEdge } from "../../shared/utils/panel/resizeHandles.js";
const EDGE_ARIA_LABEL = {
    top: "resizeHeightAriaLabel",
    bottom: "resizeHeightAriaLabel",
    left: "resizeWidthAriaLabel",
    right: "resizeWidthAriaLabel",
};
export function PanelResizeHandles({ edges, inactive = false, heightResizeEnabled = true, messages, createResizePointerDown }) {
    return (_jsx(_Fragment, { children: edges.map((edge) => (_jsx(ResizeHandleControl, { edge: edge, ariaLabel: messages.panel[EDGE_ARIA_LABEL[edge]], inactive: inactive || (!heightResizeEnabled && isVerticalResizeEdge(edge)), onPointerDown: createResizePointerDown({ kind: "edge", edge }) }, edge))) }));
}
//# sourceMappingURL=PanelResizeHandles.js.map