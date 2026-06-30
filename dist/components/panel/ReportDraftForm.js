import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useReport } from "../../providers/reportContext.js";
import { getDraftMarkerPosition } from "../../utils/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";
const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";
export function ReportDraftForm() {
    const { draft, fields, authors, isCreating, selectedTarget, updateDraftCase, addDraftCase, removeDraftCase, updateDraftField, handleCreateSubmit, handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting, draftAuthorName, setDraftAuthorName, errorMessage, } = useReport();
    if (!draft) {
        return null;
    }
    return (_jsx(ReportDraftFormContent, { draft: draft, fields: fields, authors: authors, isCreating: isCreating, selectedTarget: selectedTarget, updateDraftCase: updateDraftCase, addDraftCase: addDraftCase, removeDraftCase: removeDraftCase, updateDraftField: updateDraftField, handleCreateSubmit: handleCreateSubmit, handleCreateSubmitWithGitHubIssue: handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate: canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting: isDraftGitHubIssueSubmitting, draftAuthorName: draftAuthorName, setDraftAuthorName: setDraftAuthorName, errorMessage: errorMessage }));
}
function ReportDraftFormContent({ draft, fields, authors, isCreating, selectedTarget, updateDraftCase, addDraftCase, removeDraftCase, updateDraftField, handleCreateSubmit, handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting, draftAuthorName, setDraftAuthorName, errorMessage, }) {
    const anchor = useMemo(() => getDraftMarkerPosition(draft, selectedTarget), [draft, selectedTarget]);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, true, true);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    if (!tooltipPosition || !tooltipAnchorStyle) {
        return null;
    }
    return (_jsx("div", { ref: setTooltipElement, "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), className: EXPANDED_TOOLTIP_ANCHOR_CLASS, style: {
            left: tooltipPosition.left,
            top: tooltipPosition.top,
            width: tooltipPosition.width,
            minWidth: 320,
            ...tooltipAnchorStyle,
        }, children: _jsxs("div", { className: TOOLTIP_SURFACE_CLASS, style: {
                pointerEvents: "auto",
            }, children: [draft.targetSelector && draft.suggestedReportId ? (_jsx(PickTargetSnippet, { suggestedReportId: draft.suggestedReportId, reportType: draft.reportType })) : null, _jsx(FeedbackComposer, { cases: draft.cases, onCaseChange: updateDraftCase, onAddCase: addDraftCase, onRemoveCase: removeDraftCase, authorName: draftAuthorName, onAuthorNameChange: setDraftAuthorName, authors: authors, fields: fields, fieldValues: draft.fieldValues, onFieldChange: updateDraftField, showTags: true, onSubmit: () => void handleCreateSubmit(), isSubmitting: isCreating, showGitHubIssueOnCreate: canCreateGitHubIssueOnCreate, onGitHubIssueSubmit: () => void handleCreateSubmitWithGitHubIssue(), isGitHubIssueSubmitting: isDraftGitHubIssueSubmitting, autoFocus: true, errorMessage: errorMessage })] }) }));
}
//# sourceMappingURL=ReportDraftForm.js.map