import { jsx as _jsx } from "react/jsx-runtime";
import { PANEL_CORNERS } from "../../hooks/usePanelDock.js";
export function PanelDockGuides({ visible, activeCorner }) {
    if (!visible) {
        return null;
    }
    return (_jsx("div", { className: "stitchable-dock-guide-layer", "aria-hidden": "true", children: PANEL_CORNERS.map((corner) => (_jsx("div", { className: [
                "stitchable-dock-guide",
                `stitchable-dock-guide--${corner}`,
                activeCorner === corner ? "stitchable-dock-guide--active" : undefined,
            ]
                .filter(Boolean)
                .join(" ") }, corner))) }));
}
//# sourceMappingURL=PanelDockGuides.js.map