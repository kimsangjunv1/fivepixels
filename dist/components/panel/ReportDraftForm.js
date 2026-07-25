import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTooltipLayout } from "../../hooks/useTooltipLayout.js";
import { useTooltipResize } from "../../hooks/useTooltipResize.js";
import { useReport, useReportPreferences } from "../../providers/reportContext.js";
import { getDraftMarkerPosition, TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT } from "../../utils/marker/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { DraftComposerToolbar } from "./feedback/DraftComposerToolbar.js";
import { DraftProbeSummaryBanner } from "./DraftProbeSummaryBanner.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { MOTION } from "../../constants/motionClasses.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
const TOOLTIP_SURFACE_CLASS = "rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[5px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";
export function ReportDraftForm() {
    const { draft, fields, authors, isCreating, isUpdating, editingReportId, markers, selectedTarget, updateDraftCase, addDraftCase, removeDraftCase, updateDraftField, updateDraftCategory, handleCreateSubmit, handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting, draftAuthorName, setDraftAuthorName, errorMessage, isPresentationMode, authorSelectionLocked, sessionActor, } = useReport();
    if (!draft) {
        return null;
    }
    const isEditing = Boolean(editingReportId);
    const editingMarker = isEditing ? (markers.find((marker) => marker.report.id === editingReportId) ?? null) : null;
    return (_jsx(ReportDraftFormContent, { draft: draft, fields: fields, authors: authors, isCreating: isCreating, isUpdating: isUpdating, isEditing: isEditing, editingMarker: editingMarker, selectedTarget: selectedTarget, updateDraftCase: updateDraftCase, addDraftCase: addDraftCase, removeDraftCase: removeDraftCase, updateDraftField: updateDraftField, updateDraftCategory: updateDraftCategory, handleCreateSubmit: handleCreateSubmit, handleCreateSubmitWithGitHubIssue: handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate: canCreateGitHubIssueOnCreate && !isEditing, isDraftGitHubIssueSubmitting: isDraftGitHubIssueSubmitting, draftAuthorName: draftAuthorName, setDraftAuthorName: setDraftAuthorName, errorMessage: errorMessage, isPresentationMode: isPresentationMode, authorSelectionLocked: authorSelectionLocked, sessionActor: sessionActor }));
}
function ReportDraftFormContent({ draft, fields, authors, isCreating, isUpdating, isEditing, editingMarker, selectedTarget, updateDraftCase, addDraftCase, removeDraftCase, updateDraftField, updateDraftCategory, handleCreateSubmit, handleCreateSubmitWithGitHubIssue, canCreateGitHubIssueOnCreate, isDraftGitHubIssueSubmitting, draftAuthorName, setDraftAuthorName, errorMessage, isPresentationMode, authorSelectionLocked, sessionActor, }) {
    const { messages } = useReportPreferences();
    const tooltipSurfaceRef = useRef(null);
    const [footerWarningMessage, setFooterWarningMessage] = useState(null);
    const [activeCaseId, setActiveCaseId] = useState(() => draft.cases[0]?.id ?? null);
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const anchor = useMemo(() => {
        if (editingMarker) {
            return { left: editingMarker.left, top: editingMarker.top };
        }
        return getDraftMarkerPosition(draft, selectedTarget);
    }, [draft, editingMarker, selectedTarget]);
    const { customSize, isResizing, ghostRef, handleResizePointerDown } = useTooltipResize({
        enabled: true,
        tooltipRef: tooltipSurfaceRef,
    });
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, true, true, {
        customWidth: customSize?.width,
    });
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const isSubmitting = isCreating || isUpdating || isDraftGitHubIssueSubmitting;
    const categoryNeedsAttention = errorMessage === messages.errors.categoryRequired && !draft.category;
    const showStatusChip = Boolean(footerWarningMessage) || Boolean(draft.targetSelector && draft.suggestedReportId);
    const submitLabel = isEditing ? messages.cases.save : messages.composer.draftComplete;
    const submittingLabel = isEditing ? messages.cases.saving : messages.composer.draftCompleting;
    useEffect(() => {
        if (!isGitHubIssueConfirming) {
            return;
        }
        const timer = window.setTimeout(() => setIsGitHubIssueConfirming(false), 1500);
        return () => window.clearTimeout(timer);
    }, [isGitHubIssueConfirming]);
    useEffect(() => {
        if (activeCaseId && draft.cases.some((item) => item.id === activeCaseId)) {
            return;
        }
        setActiveCaseId(draft.cases[draft.cases.length - 1]?.id ?? draft.cases[0]?.id ?? null);
    }, [activeCaseId, draft.cases]);
    const handleRemoveCase = (caseId) => {
        const removeIndex = draft.cases.findIndex((item) => item.id === caseId);
        if (removeIndex < 0) {
            return;
        }
        const fallbackCase = draft.cases[removeIndex + 1] ?? draft.cases[removeIndex - 1];
        if (activeCaseId === caseId && fallbackCase) {
            setActiveCaseId(fallbackCase.id);
        }
        removeDraftCase(caseId);
    };
    if (!tooltipPosition || !tooltipAnchorStyle) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsxs("div", { ref: setTooltipElement, "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), className: `${EXPANDED_TOOLTIP_ANCHOR_CLASS} flex flex-col gap-[8px]`, style: {
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    minWidth: 320,
                    ...tooltipAnchorStyle,
                }, children: [showStatusChip ? (_jsx("div", { className: `shrink-0 border border-[var(--adaptive-border-subtle)] ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`, children: _jsx(PickTargetSnippet, { suggestedReportId: draft.suggestedReportId ?? undefined, reportType: draft.reportType, alertMessage: footerWarningMessage }) })) : null, _jsxs("div", { ref: tooltipSurfaceRef, className: `relative border border-[var(--adaptive-border-subtle)] ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`, style: {
                            pointerEvents: "auto",
                            height: customSize?.height,
                        }, children: [_jsxs("div", { className: "flex min-h-0 flex-col", style: {
                                    maxHeight: customSize?.height ?? TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT,
                                    height: customSize?.height,
                                }, children: [_jsx(DraftProbeSummaryBanner, {}), _jsx(FeedbackComposer, { cases: draft.cases, onCaseChange: updateDraftCase, onAddCase: addDraftCase, onRemoveCase: removeDraftCase, authorName: draftAuthorName, onAuthorNameChange: setDraftAuthorName, authors: authors, fields: fields, fieldValues: draft.fieldValues, onFieldChange: updateDraftField, category: draft.category, onCategoryChange: updateDraftCategory, showCategory: false, showTags: true, hideAuthorSelector: isPresentationMode || authorSelectionLocked, lockedAuthorName: authorSelectionLocked ? (sessionActor?.name ?? draftAuthorName) : undefined, onSubmit: () => void handleCreateSubmit(), isSubmitting: isCreating, autoFocus: true, errorMessage: errorMessage, onFooterWarningChange: setFooterWarningMessage, hideActions: true, hidePrimarySubmitAction: true, showCaseTabBar: false, activeCaseId: activeCaseId, onActiveCaseIdChange: setActiveCaseId }), _jsx(DraftComposerToolbar, { cases: draft.cases, activeCaseId: activeCaseId, onSelectCase: setActiveCaseId, onAddCase: addDraftCase, onRemoveCase: handleRemoveCase, category: draft.category, onCategoryChange: updateDraftCategory, categoryNeedsAttention: categoryNeedsAttention, onSubmit: () => void handleCreateSubmit(), isSubmitting: isSubmitting, submitLabel: submitLabel, submittingLabel: submittingLabel, showGitHubIssueOnCreate: canCreateGitHubIssueOnCreate, onGitHubIssueSubmit: () => void handleCreateSubmitWithGitHubIssue(), isGitHubIssueSubmitting: isDraftGitHubIssueSubmitting, isGitHubIssueConfirming: isGitHubIssueConfirming, onGitHubIssueConfirmingChange: setIsGitHubIssueConfirming })] }), _jsx(CornerResizeHandle, { corner: "bottom-right", ariaLabel: messages.marker.resizeAriaLabel, onPointerDown: handleResizePointerDown })] })] })] }));
}
//# sourceMappingURL=ReportDraftForm.js.map