import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { stitchablePartProps } from "../report/parts.js";
const BLUR_LAYER_COUNT = 6;
export function PanelProgressiveBlur({ hidden }) {
    if (hidden) {
        return null;
    }
    return (_jsxs("div", { ...stitchablePartProps("panel-blur-stack"), "aria-hidden": "true", children: [Array.from({ length: BLUR_LAYER_COUNT }, (_, index) => (_jsx("div", { ...stitchablePartProps("panel-blur-layer") }, index))), _jsx("div", { ...stitchablePartProps("panel-blur-tint") })] }));
}
//# sourceMappingURL=PanelProgressiveBlur.js.map