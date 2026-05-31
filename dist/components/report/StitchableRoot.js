import { jsx as _jsx } from "react/jsx-runtime";
import { useLayoutEffect } from "react";
import { useReport } from "../../providers/reportContext.js";
import { ensureReportStyles } from "./ensureReportStyles.js";
import { createStitchableLayoutVars, STITCHABLE_ROOT_ATTR, STITCHABLE_THEME_ATTR } from "./parts.js";
export function StitchableRoot({ children, style }) {
    const { resolvedAppearance, isMobileViewport } = useReport();
    useLayoutEffect(() => {
        ensureReportStyles();
    }, []);
    return (_jsx("div", { [STITCHABLE_ROOT_ATTR]: "",
        [STITCHABLE_THEME_ATTR]: resolvedAppearance, style: {
            ...createStitchableLayoutVars(isMobileViewport),
            ...style,
        }, children: children }));
}
//# sourceMappingURL=StitchableRoot.js.map