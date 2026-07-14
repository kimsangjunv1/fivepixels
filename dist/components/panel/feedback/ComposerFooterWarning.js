import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from "../../../components/ui/Text";
export function ComposerFooterWarning({ message }) {
    return (_jsx("div", { role: "alert", className: "flex items-center gap-[6px] border-t border-[var(--adaptive-tintOpacity100)] px-[12px] py-[6px]", children: _jsx(Text.Shimmer, { className: "text-[12px] font-medium", color: { start: "#fb7185", end: "#ffffff" }, duration: 4, children: message }) }));
}
//# sourceMappingURL=ComposerFooterWarning.js.map