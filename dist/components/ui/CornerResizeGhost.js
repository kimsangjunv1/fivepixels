import { jsx as _jsx } from "react/jsx-runtime";
import { MOTION } from "../../constants/motionClasses.js";
export function CornerResizeGhost({ ghostRef, zIndexClassName = "z-[1000002]" }) {
    return (_jsx("div", { ref: ghostRef, "aria-hidden": true, className: `pointer-events-none fixed ${zIndexClassName} rounded-[12px] border-2 border-[var(--adaptive-blue500)] bg-[color-mix(in_srgb,var(--adaptive-blue500)_18%,transparent)] ${MOTION.ghostIn}` }));
}
//# sourceMappingURL=CornerResizeGhost.js.map