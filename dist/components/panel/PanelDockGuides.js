import { jsx as _jsx } from "react/jsx-runtime";
import { PANEL_CORNERS } from "../../hooks/usePanelDock.js";
import { stitchableClass, stitchablePartProps } from "../report/parts.js";
export function PanelDockGuides({ visible, activeCorner }) {
    if (!visible) {
        return null;
    }
    return (_jsx("div", { ...stitchablePartProps("dock-guide-layer"), "aria-hidden": "true", children: PANEL_CORNERS.map((corner) => (_jsx("div", { ...stitchablePartProps("dock-guide", {
                modifier: corner,
                className: activeCorner === corner ? stitchableClass("dock-guide", "active") : undefined,
            }) }, corner))) }));
}
//# sourceMappingURL=PanelDockGuides.js.map