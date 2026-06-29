import { jsx as _jsx } from "react/jsx-runtime";
const POSITION_CLASS = {
    "bottom-right": "bottom-0 right-0 items-end justify-end rounded-br-[12px]",
    "bottom-left": "bottom-0 left-0 items-end justify-start rounded-bl-[12px]",
    "top-right": "top-0 right-0 items-start justify-end rounded-tr-[12px]",
    "top-left": "top-0 left-0 items-start justify-start rounded-tl-[12px]",
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
function DragHandleIcon({ corner }) {
    return (_jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true, className: `text-[var(--adaptive-text-muted)] ${ICON_TRANSFORM_CLASS[corner]}`, children: _jsx("path", { d: "M11 2.5C11 7.02 7.52 10.5 3 10.5", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round" }) }));
}
export function CornerResizeHandle({ corner, ariaLabel, inactive = false, onPointerDown }) {
    const handlePointerDown = (event) => {
        if (inactive) {
            return;
        }
        onPointerDown(event);
    };
    return (_jsx("div", { role: "button", tabIndex: inactive ? -1 : 0, "aria-label": ariaLabel, "aria-disabled": inactive, onPointerDown: handlePointerDown, className: `absolute z-20 flex h-[22px] w-[22px] p-[4px] outline-none ${POSITION_CLASS[corner]} ${inactive ? "pointer-events-none opacity-40" : CURSOR_CLASS[corner]}`, children: _jsx(DragHandleIcon, { corner: corner }) }));
}
//# sourceMappingURL=CornerResizeHandle.js.map