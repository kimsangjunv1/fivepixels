import { jsxs as _jsxs } from "react/jsx-runtime";
import { getIssueProgressLabel, shouldShowCaseProgress } from "../../../utils/reportCases.js";
export function CaseProgressLabel({ report, className = "ml-[6px] tabular-nums text-[var(--adaptive-black500)]" }) {
    if (!shouldShowCaseProgress(report)) {
        return null;
    }
    const label = getIssueProgressLabel(report);
    if (!label) {
        return null;
    }
    return _jsxs("span", { className: className, children: ["(", label, ")"] });
}
//# sourceMappingURL=CaseProgressLabel.js.map