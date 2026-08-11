import { jsx as _jsx } from "react/jsx-runtime";
export function PinDockGuides({ visible, activeEdge }) {
    if (!visible) {
        return null;
    }
    return (_jsx("div", { className: "fivepixels-dock-guide-layer", "aria-hidden": "true", children: ["left", "right"].map((edge) => (_jsx("div", { className: [
                "fivepixels-dock-guide",
                "fivepixels-dock-guide--edge-rail",
                `fivepixels-dock-guide--edge-${edge}`,
                activeEdge === edge ? "fivepixels-dock-guide--active" : undefined,
            ]
                .filter(Boolean)
                .join(" ") }, edge))) }));
}
//# sourceMappingURL=PinDockGuides.js.map