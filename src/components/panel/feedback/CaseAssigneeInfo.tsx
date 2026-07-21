import type { ReportAuthor, ReportCase } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { InfoIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { formatAssigneeLabel, resolveAuthorDepartment } from "@/utils/report/reportCases.js";

type CaseAssigneeInfoProps = {
    caseItem: ReportCase;
    authors: ReportAuthor[];
};

export function CaseAssigneeInfo({ caseItem, authors }: CaseAssigneeInfoProps) {
    const { messages } = useReportPreferences();
    const currentAssignee = caseItem.assignee_name?.trim() ?? "";
    const previousAssignee = caseItem.previous_assignee_name?.trim() ?? "";

    if (!currentAssignee) {
        return null;
    }

    const currentDepartment = resolveAuthorDepartment(authors, currentAssignee);
    const previousDepartment = previousAssignee ? resolveAuthorDepartment(authors, previousAssignee) : null;
    const currentLabel = formatAssigneeLabel(currentAssignee, currentDepartment);
    const previousLabel = previousAssignee ? formatAssigneeLabel(previousAssignee, previousDepartment) : messages.common.none;

    const tooltipContent = (
        <span className="flex flex-col gap-[2px]">
            <span className="text-[var(--adaptive-red500)]">
                - {messages.marker.previousAssignee}: {previousLabel}
            </span>
            <span className="text-[var(--adaptive-green500)]">
                + {messages.marker.currentAssignee}: {currentLabel}
            </span>
        </span>
    );

    return (
        <div className="flex min-w-0 items-center gap-[6px] text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">
            <span
                className="min-w-0 truncate"
                title={currentLabel}
            >
                {currentLabel}
            </span>
            <HoverTooltip
                multiline
                content={tooltipContent}
            >
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    aria-label={messages.marker.assigneeInfoAriaLabel}
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"
                >
                    <InfoIcon className="h-[13px] w-[13px]" />
                </button>
            </HoverTooltip>
        </div>
    );
}
