import { jsx as _jsx } from "react/jsx-runtime";
import { PANEL_CORNERS } from "../../hooks/usePanelDock.js";
export function PanelDockGuides({ visible, activeCorner }) {
    if (!visible) {
        return null;
    }
    return (_jsx("div", { className: "fivepixels-dock-guide-layer", "aria-hidden": "true", children: PANEL_CORNERS.map((corner) => (_jsx("div", { className: [
                "fivepixels-dock-guide",
                `fivepixels-dock-guide--${corner}`,
                activeCorner === corner ? "fivepixels-dock-guide--active" : undefined,
            ]
                .filter(Boolean)
                .join(" ") }, corner))) }));
}
//# sourceMappingURL=PanelDockGuides.js.map