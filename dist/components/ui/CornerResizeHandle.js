import { jsx as _jsx } from "react/jsx-runtime";
const POSITION_CLASS = {
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
};
const CURSOR_CLASS = {
    "bottom-right": "cursor-nwse-resize",
    "bottom-left": "cursor-nesw-resize",
    "top-right": "cursor-nesw-resize",
    "top-left": "cursor-nwse-resize",
};
const ICON_TRANSFORM_CLASS = {
    "bottom-right": "",
    "bottom-left": "-scale-x-100",
    "top-right": "-scale-y-100",
    "top-left": "-scale-x-100 -scale-y-100",
};
function CornerHandleIcon({ corner }) {
    return (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true, className: `drop-shadow-[0_1px_4px_rgba(0,0,0,0.12)] ${ICON_TRANSFORM_CLASS[corner]}`, children: _jsx("path", { d: "M2 14C2 7.82 7.82 2 14 2", stroke: "var(--adaptive-surface-overlay)", strokeWidth: "3", strokeLinecap: "round" }) }));
}
export function CornerResizeHandle({ corner, ariaLabel, inactive = false, onPointerDown }) {
    const handlePointerDown = (event) => {
        if (inactive) {
            return;
        }
        onPointerDown(event);
    };
    return (_jsx("div", { role: "button", tabIndex: inactive ? -1 : 0, "aria-label": ariaLabel, "aria-disabled": inactive, onPointerDown: handlePointerDown, className: `absolute z-20 flex h-[24px] w-[24px] items-center justify-center outline-none ${POSITION_CLASS[corner]} ${inactive ? "pointer-events-none opacity-40" : CURSOR_CLASS[corner]}`, children: _jsx(CornerHandleIcon, { corner: corner }) }));
}
//# sourceMappingURL=CornerResizeHandle.js.map