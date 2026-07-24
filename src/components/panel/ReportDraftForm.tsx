import { useEffect, useMemo, useRef, useState } from "react";
import type { FeedbackCategory } from "@/constants/feedbackCategory.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useTooltipResize } from "@/hooks/useTooltipResize.js";
import { useReport, useReportPreferences } from "@/providers/reportContext.js";
import { getDraftMarkerPosition, TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT } from "@/utils/marker/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { DraftComposerToolbar } from "./feedback/DraftComposerToolbar.js";
import { DraftProbeSummaryBanner } from "./DraftProbeSummaryBanner.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";
import { CornerResizeGhost } from "@/components/ui/CornerResizeGhost.js";
import { MOTION } from "@/constants/motionClasses.js";
import { CornerResizeHandle } from "@/components/ui/CornerResizeHandle.js";

const TOOLTIP_SURFACE_CLASS = "rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[5px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";

export function ReportDraftForm() {
    const {
        draft,
        fields,
        authors,
        isCreating,
        selectedTarget,
        updateDraftCase,
        addDraftCase,
        removeDraftCase,
        updateDraftField,
        updateDraftCategory,
        handleCreateSubmit,
        handleCreateSubmitWithGitHubIssue,
        canCreateGitHubIssueOnCreate,
        isDraftGitHubIssueSubmitting,
        draftAuthorName,
        setDraftAuthorName,
        errorMessage,
        isPresentationMode,
        authorSelectionLocked,
        sessionActor,
    } = useReport();

    if (!draft) {
        return null;
    }

    return (
        <ReportDraftFormContent
            draft={draft}
            fields={fields}
            authors={authors}
            isCreating={isCreating}
            selectedTarget={selectedTarget}
            updateDraftCase={updateDraftCase}
            addDraftCase={addDraftCase}
            removeDraftCase={removeDraftCase}
            updateDraftField={updateDraftField}
            updateDraftCategory={updateDraftCategory}
            handleCreateSubmit={handleCreateSubmit}
            handleCreateSubmitWithGitHubIssue={handleCreateSubmitWithGitHubIssue}
            canCreateGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
            isDraftGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
            draftAuthorName={draftAuthorName}
            setDraftAuthorName={setDraftAuthorName}
            errorMessage={errorMessage}
            isPresentationMode={isPresentationMode}
            authorSelectionLocked={authorSelectionLocked}
            sessionActor={sessionActor}
        />
    );
}

type ReportDraftFormContentProps = {
    draft: NonNullable<ReturnType<typeof useReport>["draft"]>;
    fields: ReturnType<typeof useReport>["fields"];
    authors: ReturnType<typeof useReport>["authors"];
    isCreating: boolean;
    selectedTarget: ReturnType<typeof useReport>["selectedTarget"];
    updateDraftCase: (caseId: string, text: string) => void;
    addDraftCase: () => void;
    removeDraftCase: (caseId: string) => void;
    updateDraftField: (key: string, value: string | boolean) => void;
    updateDraftCategory: (value: FeedbackCategory | null) => void;
    handleCreateSubmit: () => Promise<void>;
    handleCreateSubmitWithGitHubIssue: () => Promise<void>;
    canCreateGitHubIssueOnCreate: boolean;
    isDraftGitHubIssueSubmitting: boolean;
    draftAuthorName: string;
    setDraftAuthorName: (name: string) => void;
    errorMessage: string;
    isPresentationMode: boolean;
    authorSelectionLocked: boolean;
    sessionActor: ReturnType<typeof useReport>["sessionActor"];
};

function ReportDraftFormContent({
    draft,
    fields,
    authors,
    isCreating,
    selectedTarget,
    updateDraftCase,
    addDraftCase,
    removeDraftCase,
    updateDraftField,
    updateDraftCategory,
    handleCreateSubmit,
    handleCreateSubmitWithGitHubIssue,
    canCreateGitHubIssueOnCreate,
    isDraftGitHubIssueSubmitting,
    draftAuthorName,
    setDraftAuthorName,
    errorMessage,
    isPresentationMode,
    authorSelectionLocked,
    sessionActor,
}: ReportDraftFormContentProps) {
    const { messages } = useReportPreferences();
    const tooltipSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [footerWarningMessage, setFooterWarningMessage] = useState<string | null>(null);
    const [activeCaseId, setActiveCaseId] = useState<string | null>(() => draft.cases[0]?.id ?? null);
    const [isGitHubIssueConfirming, setIsGitHubIssueConfirming] = useState(false);
    const anchor = useMemo(() => getDraftMarkerPosition(draft, selectedTarget), [draft, selectedTarget]);
    const { customSize, isResizing, ghostRef, handleResizePointerDown } = useTooltipResize({
        enabled: true,
        tooltipRef: tooltipSurfaceRef,
    });
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, true, true, {
        customWidth: customSize?.width,
    });
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;
    const isSubmitting = isCreating || isDraftGitHubIssueSubmitting;
    const categoryNeedsAttention = errorMessage === messages.errors.categoryRequired && !draft.category;
    const showStatusChip = Boolean(footerWarningMessage) || Boolean(draft.targetSelector && draft.suggestedReportId);

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

    const handleRemoveCase = (caseId: string) => {
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

    return (
        <>
            {isResizing ? <CornerResizeGhost ghostRef={ghostRef} /> : null}

            <div
                ref={setTooltipElement}
                data-fivepixels-interactive=""
                onClick={(event) => event.stopPropagation()}
                className={`${EXPANDED_TOOLTIP_ANCHOR_CLASS} flex flex-col gap-[8px]`}
                style={{
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    minWidth: 320,
                    ...tooltipAnchorStyle,
                }}
            >
                {showStatusChip ? (
                    <div className={`shrink-0 border border-[var(--adaptive-border-subtle)] ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`}>
                        <PickTargetSnippet
                            suggestedReportId={draft.suggestedReportId ?? undefined}
                            reportType={draft.reportType}
                            alertMessage={footerWarningMessage}
                        />
                    </div>
                ) : null}

                <div
                    ref={tooltipSurfaceRef}
                    className={`relative border border-[var(--adaptive-border-subtle)] ${TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipFadeIn}`}
                    style={{
                        pointerEvents: "auto",
                        height: customSize?.height,
                    }}
                >
                    <div
                        className="flex min-h-0 flex-col"
                        style={{
                            maxHeight: customSize?.height ?? TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT,
                            height: customSize?.height,
                        }}
                    >
                        {/* <div className="shrink-0 border-b border-b-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] px-[12px] py-[4px] flex items-center justify-between">
                            <div className="w-[3px] h-[3px] bg-[var(--adaptive-black400)] rounded-full" />
                            <p className="text-[12px] font-bold text-center leading-none text-[var(--adaptive-black600)]">{messages.composer.draftTooltipHeader}</p>
                            <div className="w-[3px] h-[3px] bg-[var(--adaptive-black400)] rounded-full" />
                        </div> */}

                        <DraftProbeSummaryBanner />
                        <FeedbackComposer
                            cases={draft.cases}
                            onCaseChange={updateDraftCase}
                            onAddCase={addDraftCase}
                            onRemoveCase={removeDraftCase}
                            authorName={draftAuthorName}
                            onAuthorNameChange={setDraftAuthorName}
                            authors={authors}
                            fields={fields}
                            fieldValues={draft.fieldValues}
                            onFieldChange={updateDraftField}
                            category={draft.category}
                            onCategoryChange={updateDraftCategory}
                            showCategory={false}
                            showTags
                            hideAuthorSelector={isPresentationMode || authorSelectionLocked}
                            lockedAuthorName={authorSelectionLocked ? (sessionActor?.name ?? draftAuthorName) : undefined}
                            onSubmit={() => void handleCreateSubmit()}
                            isSubmitting={isCreating}
                            autoFocus
                            errorMessage={errorMessage}
                            onFooterWarningChange={setFooterWarningMessage}
                            hideActions
                            hidePrimarySubmitAction
                            showCaseTabBar={false}
                            activeCaseId={activeCaseId}
                            onActiveCaseIdChange={setActiveCaseId}
                        />
                        <DraftComposerToolbar
                            cases={draft.cases}
                            activeCaseId={activeCaseId}
                            onSelectCase={setActiveCaseId}
                            onAddCase={addDraftCase}
                            onRemoveCase={handleRemoveCase}
                            category={draft.category}
                            onCategoryChange={updateDraftCategory}
                            categoryNeedsAttention={categoryNeedsAttention}
                            onSubmit={() => void handleCreateSubmit()}
                            isSubmitting={isSubmitting}
                            showGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
                            onGitHubIssueSubmit={() => void handleCreateSubmitWithGitHubIssue()}
                            isGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
                            isGitHubIssueConfirming={isGitHubIssueConfirming}
                            onGitHubIssueConfirmingChange={setIsGitHubIssueConfirming}
                        />

                    </div>

                    <CornerResizeHandle
                        corner="bottom-right"
                        ariaLabel={messages.marker.resizeAriaLabel}
                        onPointerDown={handleResizePointerDown}
                    />
                </div>
            </div>
        </>
    );
}
