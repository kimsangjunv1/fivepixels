import { useMemo, useRef, useState } from "react";
import type { FeedbackCategory } from "@/constants/feedbackCategory.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useTooltipResize } from "@/hooks/useTooltipResize.js";
import { useReport, useReportPreferences } from "@/providers/reportContext.js";
import { getDraftMarkerPosition, TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT } from "@/utils/marker/coordinates.js";
import { getFieldError } from "@/utils/report/fields.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { ComposerFooterWarning } from "./feedback/ComposerFooterWarning.js";
import { DraftProbeSummaryBanner } from "./DraftProbeSummaryBanner.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";
import { CornerResizeGhost } from "@/components/ui/CornerResizeGhost.js";
import { MOTION } from "@/constants/motionClasses.js";
import { CornerResizeHandle } from "@/components/ui/CornerResizeHandle.js";

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[5px]";
// "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[5px]";
// const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
// "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] bg-[var(--adaptive-fillOpacity700)] backdrop-blur-[1px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";

export function ReportDraftForm() {
    const {
        draft,
        draftStep,
        setDraftStep,
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
        setErrorMessage,
        cancelDraft,
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
            draftStep={draftStep}
            setDraftStep={setDraftStep}
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
            setErrorMessage={setErrorMessage}
            cancelDraft={cancelDraft}
            isPresentationMode={isPresentationMode}
            authorSelectionLocked={authorSelectionLocked}
            sessionActor={sessionActor}
        />
    );
}

type ReportDraftFormContentProps = {
    draft: NonNullable<ReturnType<typeof useReport>["draft"]>;
    draftStep: ReturnType<typeof useReport>["draftStep"];
    setDraftStep: ReturnType<typeof useReport>["setDraftStep"];
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
    setErrorMessage: (message: string) => void;
    cancelDraft: () => void;
    isPresentationMode: boolean;
    authorSelectionLocked: boolean;
    sessionActor: ReturnType<typeof useReport>["sessionActor"];
};

function ReportDraftFormContent({
    draft,
    draftStep,
    setDraftStep,
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
    setErrorMessage,
    cancelDraft,
    isPresentationMode,
    authorSelectionLocked,
    sessionActor,
}: ReportDraftFormContentProps) {
    const { messages } = useReportPreferences();
    const tooltipSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [footerWarningMessage, setFooterWarningMessage] = useState<string | null>(null);
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

    return (
        <>
            {isResizing ? <CornerResizeGhost ghostRef={ghostRef} /> : null}

            <div
                ref={setTooltipElement}
                data-fivepixels-interactive=""
                onClick={(event) => event.stopPropagation()}
                className={EXPANDED_TOOLTIP_ANCHOR_CLASS}
                style={{
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    width: tooltipPosition.width,
                    minWidth: 320,
                    ...(customSize?.height !== undefined ? { height: customSize.height } : null),
                    ...tooltipAnchorStyle,
                }}
            >
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
                        <div className="shrink-0 border-b border-b-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] px-[12px] py-[4px] flex items-center justify-between">
                            <div className="w-[3px] h-[3px] bg-[var(--adaptive-black400)] rounded-full" />
                            <p className="text-[12px] font-bold text-center leading-none text-[var(--adaptive-black600)]">{messages.composer.draftTooltipHeader}</p>
                            <div className="w-[3px] h-[3px] bg-[var(--adaptive-black400)] rounded-full" />
                        </div>
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
                            showCategory={isCategoryStep}
                            showTags
                            hideAuthorSelector={isPresentationMode || authorSelectionLocked}
                            lockedAuthorName={authorSelectionLocked ? (sessionActor?.name ?? draftAuthorName) : undefined}
                            onSubmit={isCategoryStep ? () => void handleCreateSubmit() : handleNext}
                            isSubmitting={isCreating}
                            showGitHubIssueOnCreate={isCategoryStep && canCreateGitHubIssueOnCreate}
                            onGitHubIssueSubmit={() => void handleCreateSubmitWithGitHubIssue()}
                            isGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
                            autoFocus={!isCategoryStep}
                            errorMessage={errorMessage}
                            onFooterWarningChange={setFooterWarningMessage}
                            hideEditor={isCategoryStep}
                            hideActions={!isCategoryStep || !canCreateGitHubIssueOnCreate}
                            hidePrimarySubmitAction
                            categoryPrompt={isCategoryStep ? messages.composer.draftCategoryPrompt(draft.cases.length) : undefined}
                        />
                        <div className="grid grid-cols-2 border-y border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity50)]">
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                disabled={isSubmitting}
                                onClick={handlePrevious}
                                className="flex min-h-[24px] items-center justify-center border-r border-[var(--adaptive-border-subtle)] px-[16px] text-[14px] font-semibold text-[var(--adaptive-text-primary)] transition-colors hover:bg-[var(--adaptive-fillOpacity500)] disabled:opacity-50"
                            >
                                {messages.composer.draftPrevious}
                            </button>
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                disabled={isSubmitting}
                                onClick={isCategoryStep ? () => void handleCreateSubmit() : handleNext}
                                className="flex min-h-[24px] items-center justify-center bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)] px-[16px] text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {isCategoryStep ? (isSubmitting ? messages.composer.draftCompleting : messages.composer.draftComplete) : messages.composer.draftNext}
                            </button>
                        </div>

                        {draft.targetSelector && draft.suggestedReportId ? (
                            <PickTargetSnippet
                                suggestedReportId={draft.suggestedReportId}
                                reportType={draft.reportType}
                            />
                        ) : null}
                        {footerWarningMessage ? <ComposerFooterWarning message={footerWarningMessage} /> : null}
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
