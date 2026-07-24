import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useRef, useState } from "react";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useTooltipResize } from "../../hooks/useTooltipResize.js";
import { useReport, useReportPreferences } from "../../providers/reportContext.js";
import { getDraftMarkerPosition, TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT } from "../../utils/marker/coordinates.js";
import { getFieldError } from "../../utils/report/fields.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { ComposerFooterWarning } from "./feedback/ComposerFooterWarning.js";
import { DraftProbeSummaryBanner } from "./DraftProbeSummaryBanner.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { MOTION } from "../../constants/motionClasses.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[5px]";
// "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[5px]";
// const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
// "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] bg-[var(--adaptive-fillOpacity700)] backdrop-blur-[1px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";
export function ReportDraftForm() {
    const { draft, draftStep, setDraftStep, fields, authors, isCreating, selectedTarget, updateDraftCase, addDraftCase, removeDraftCase, updateDraftField, updateDraftCategory, handleCreateSubmit, handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting, draftAuthorName, setDraftAuthorName, errorMessage, setErrorMessage, cancelDraft, isPresentationMode, authorSelectionLocked, sessionActor, } = useReport();
    if (!draft) {
        return null;
    }
    return (_jsx(ReportDraftFormContent, { draft: draft, draftStep: draftStep, setDraftStep: setDraftStep, fields: fields, authors: authors, isCreating: isCreating, selectedTarget: selectedTarget, updateDraftCase: updateDraftCase, addDraftCase: addDraftCase, removeDraftCase: removeDraftCase, updateDraftField: updateDraftField, updateDraftCategory: updateDraftCategory, handleCreateSubmit: handleCreateSubmit, handleCreateSubmitWithGitHubIssue: handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate: canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting: isDraftGitHubIssueSubmitting, draftAuthorName: draftAuthorName, setDraftAuthorName: setDraftAuthorName, errorMessage: errorMessage, setErrorMessage: setErrorMessage, cancelDraft: cancelDraft, isPresentationMode: isPresentationMode, authorSelectionLocked: authorSelectionLocked, sessionActor: sessionActor }));
}
function ReportDraftFormContent({ draft, draftStep, setDraftStep, fields, authors, isCreating, selectedTarget, updateDraftCase, addDraftCase, removeDraftCase, updateDraftField, updateDraftCategory, handleCreateSubmit, handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting, draftAuthorName, setDraftAuthorName, errorMessage, setErrorMessage, cancelDraft, isPresentationMode, authorSelectionLocked, sessionActor, }) {
    const { messages } = useReportPreferences();
    const tooltipSurfaceRef = useRef(null);
    const [footerWarningMessage, setFooterWarningMessage] = useState(null);
    const anchor = useMemo(() => getDraftMarkerPosition(draft, selectedTarget), [draft, selectedTarget]);
    const { customSize, isResizing, ghostRef, handleResizePointerDown } = useTooltipResize({
        enabled: true,
        tooltipRef: tooltipSurfaceRef,
    });
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, true, true, {
        customWidth: customSize?.width,
        customHeight: customSize?.height,
    });
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const isCategoryStep = draftStep === "category";
    const isSubmitting = isCreating || isDraftGitHubIssueSubmitting;
    const handlePrevious = () => {
        setErrorMessage("");
        if (isCategoryStep) {
            setDraftStep("content");
            return;
        }
        cancelDraft();
    };
    const handleNext = () => {
        const nextError = getFieldError(draft.cases, draft.fieldValues, fields, messages.errors);
        if (nextError) {
            setErrorMessage(nextError);
            return;
        }
        setErrorMessage("");
        setDraftStep("category");
    };
    if (!tooltipPosition || !tooltipAnchorStyle) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsx("div", { ref: setTooltipElement, "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), className: EXPANDED_TOOLTIP_ANCHOR_CLASS, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    minWidth: 320,
                    ...(customSize?.height !== undefined ? { height: customSize.height } : null),
                    ...tooltipAnchorStyle,
                }, children: _jsxs("div", { ref: tooltipSurfaceRef, className: `relative ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`, style: {
                        pointerEvents: "auto",
                        height: customSize?.height,
                    }, children: [_jsxs("div", { className: "flex min-h-0 flex-col", style: {
                                maxHeight: customSize?.height ?? TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT,
                                height: customSize?.height,
                            }, children: [_jsx("div", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-tintOpacity500)] px-[12px] py-[8px]", children: _jsx("p", { className: "text-[13px] font-semibold leading-none text-[var(--adaptive-black50)]", children: messages.composer.draftTooltipHeader }) }), _jsx(DraftProbeSummaryBanner, {}), _jsx(FeedbackComposer, { cases: draft.cases, onCaseChange: updateDraftCase, onAddCase: addDraftCase, onRemoveCase: removeDraftCase, authorName: draftAuthorName, onAuthorNameChange: setDraftAuthorName, authors: authors, fields: fields, fieldValues: draft.fieldValues, onFieldChange: updateDraftField, category: draft.category, onCategoryChange: updateDraftCategory, showCategory: isCategoryStep, showTags: true, hideAuthorSelector: isPresentationMode || authorSelectionLocked, lockedAuthorName: authorSelectionLocked ? (sessionActor?.name ?? draftAuthorName) : undefined, onSubmit: isCategoryStep ? () => void handleCreateSubmit() : handleNext, isSubmitting: isCreating, showGitHubIssueOnCreate: isCategoryStep && canCreateGitHubIssueOnCreate, onGitHubIssueSubmit: () => void handleCreateSubmitWithGitHubIssue(), isGitHubIssueSubmitting: isDraftGitHubIssueSubmitting, autoFocus: !isCategoryStep, errorMessage: errorMessage, onFooterWarningChange: setFooterWarningMessage, hideEditor: isCategoryStep, hideActions: !isCategoryStep || !canCreateGitHubIssueOnCreate, hidePrimarySubmitAction: true, categoryPrompt: isCategoryStep ? messages.composer.draftCategoryPrompt(draft.cases.length) : undefined }), _jsxs("div", { className: "grid grid-cols-2 border-y border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity50)]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isSubmitting, onClick: handlePrevious, className: "flex min-h-[24px] items-center justify-center border-r border-[var(--adaptive-border-subtle)] px-[16px] text-[14px] font-semibold text-[var(--adaptive-text-primary)] transition-colors hover:bg-[var(--adaptive-fillOpacity500)] disabled:opacity-50", children: messages.composer.draftPrevious }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", disabled: isSubmitting, onClick: isCategoryStep ? () => void handleCreateSubmit() : handleNext, className: "flex min-h-[24px] items-center justify-center bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)] px-[16px] text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50", children: isCategoryStep ? (isSubmitting ? messages.composer.draftCompleting : messages.composer.draftComplete) : messages.composer.draftNext })] }), draft.targetSelector && draft.suggestedReportId ? (_jsx(PickTargetSnippet, { suggestedReportId: draft.suggestedReportId, reportType: draft.reportType })) : null, footerWarningMessage ? _jsx(ComposerFooterWarning, { message: footerWarningMessage }) : null] }), _jsx(CornerResizeHandle, { corner: "bottom-right", ariaLabel: messages.marker.resizeAriaLabel, onPointerDown: handleResizePointerDown })] }) })] }));
}
//# sourceMappingURL=ReportDraftForm.js.map