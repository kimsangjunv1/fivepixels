import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeedbackDisplayStatus } from "../../../utils/feedbackThread.js";
import { getCaseCount } from "../../../utils/experimentalPanelTabs.js";
import { FeedbackStatusBadge } from "../../../components/panel/feedback/FeedbackStatusBadge.js";
import { useReport } from "../../../providers/reportContext.js";
export function ExperimentalFeedbackRow({ report, onOpen }) {
    const { messages } = useReport();
    const status = getFeedbackDisplayStatus(report, true);
    const caseCount = getCaseCount(report);
    const preview = report.cases[0]?.text?.trim() || report.latest_reply?.message?.trim() || report.report_id;
    return (_jsxs("button", { type: "button", onClick: () => onOpen(report.id), className: "flex w-full flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left hover:bg-[var(--adaptive-black100)]", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx(FeedbackStatusBadge, { status: status }), _jsx("span", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-black100)] px-[6px] py-[1px] text-[10px] font-semibold text-[var(--adaptive-black600)]", children: messages.panel.experimentalCaseCount.replace("{count}", String(caseCount)) })] }), _jsx("p", { className: "line-clamp-2 text-[12px] font-semibold text-[var(--adaptive-black900)]", children: preview }), _jsx("p", { className: "truncate text-[11px] text-[var(--adaptive-black500)]", children: report.pathname })] }));
}
//# sourceMappingURL=ExperimentalFeedbackRow.js.map