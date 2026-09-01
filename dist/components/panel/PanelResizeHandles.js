import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
import { PanelResizeHandle } from "../../components/panel/PanelResizeHandle.js";
const EDGE_ARIA_LABEL = {
    top: "resizeHeightAriaLabel",
    bottom: "resizeHeightAriaLabel",
    left: "resizeWidthAriaLabel",
    right: "resizeWidthAriaLabel",
};
export function PanelResizeHandles({ edges, corner, inactive = false, messages, createResizePointerDown }) {
    return (_jsxs(_Fragment, { children: [edges.map((edge) => (_jsx(PanelResizeHandle, { edge: edge, ariaLabel: messages.panel[EDGE_ARIA_LABEL[edge]], inactive: inactive, onPointerDown: createResizePointerDown({ kind: "edge", edge }) }, edge))), _jsx(CornerResizeHandle, { corner: corner, ariaLabel: messages.panel.resizeAriaLabel, inactive: inactive, onPointerDown: createResizePointerDown({ kind: "corner", corner }) })] }));
}
//# sourceMappingURL=PanelResizeHandles.js.map