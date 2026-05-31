import { jsx as _jsx } from "react/jsx-runtime";
import { stitchableClass, stitchablePartProps } from "../report/parts.js";
const EDGE_GUIDES = ["top", "bottom", "left", "right"];
export function PanelDockGuides({ visible, activeEdge }) {
    if (!visible) {
        return null;
    }
    return (_jsx("div", { ...stitchablePartProps("dock-guide-layer"), "aria-hidden": "true", children: EDGE_GUIDES.map((edge) => (_jsx("div", { ...stitchablePartProps("dock-guide", {
                modifier: edge,
                className: activeEdge === edge ? stitchableClass("dock-guide", "active") : undefined,
            }) }, edge))) }));
}
//# sourceMappingURL=PanelDockGuides.js.map