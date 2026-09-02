import { jsx as _jsx } from "react/jsx-runtime";
const EDGE_CLASS = {
    top: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
    bottom: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
    left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
};
const CURSOR_CLASS = {
    top: "cursor-ns-resize",
    bottom: "cursor-ns-resize",
    left: "cursor-ew-resize",
    right: "cursor-ew-resize",
};
function EdgeHandleIcon({ edge, active }) {
    const isHorizontal = edge === "top" || edge === "bottom";
    return (_jsx("svg", { width: isHorizontal ? 28 : 6, height: isHorizontal ? 6 : 28, viewBox: isHorizontal ? "0 0 28 6" : "0 0 6 28", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true, className: "drop-shadow-[0_1px_4px_rgba(0,0,0,0.12)]", children: _jsx("rect", { x: "0.5", y: "0.5", width: isHorizontal ? 27 : 5, height: isHorizontal ? 5 : 27, rx: "2.5", fill: active ? "#F6572E" : "var(--adaptive-surface-overlay)", stroke: active ? "#F6572E" : "var(--adaptive-border-subtle)" }) }));
}
export function PanelResizeHandle({ edge, ariaLabel, inactive = false, active = false, onPointerDown }) {
    const handlePointerDown = (event) => {
        if (inactive) {
            return;
        }
        onPointerDown(event);
    };
    return (_jsx("div", { role: "button", tabIndex: inactive ? -1 : 0, "aria-label": ariaLabel, "aria-disabled": inactive, onPointerDown: handlePointerDown, className: `absolute z-20 flex items-center justify-center outline-none ${EDGE_CLASS[edge]} ${inactive ? "pointer-events-none opacity-40" : CURSOR_CLASS[edge]}`, children: _jsx(EdgeHandleIcon, { edge: edge, active: active }) }));
}
//# sourceMappingURL=PanelResizeHandle.js.map