import { useMemo, useRef, useState } from "react";
import type { FeedbackCategory } from "@/constants/feedbackCategory.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useTooltipResize } from "@/hooks/useTooltipResize.js";
import { useReport } from "@/providers/reportContext.js";
import { getDraftMarkerPosition, TOOLTIP_EXPANDED_DEFAULT_MAX_HEIGHT } from "@/utils/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { ComposerFooterWarning } from "./feedback/ComposerFooterWarning.js";
import { DraftProbeSummaryBanner } from "./DraftProbeSummaryBanner.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";
import { CornerResizeGhost } from "@/components/ui/CornerResizeGhost.js";
import { CornerResizeHandle } from "@/components/ui/CornerResizeHandle.js";

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[16px] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-blackOpacity500)] backdrop-blur-[5px]";
// "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] shadow-[var(--adaptive-popup-shadow)] bg-[var(--adaptive-blackOpacity500)] backdrop-blur-[5px]";
// const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
// "overflow-hidden rounded-[24px] border-[3px] border-[var(--adaptive-black200)] bg-[var(--adaptive-blackOpacity700)] backdrop-blur-[1px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
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
    const { messages } = useReport();
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
                    className={`relative ${TOOLTIP_SURFACE_CLASS}`}
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
                            showCategory
                            showTags
                            hideAuthorSelector={isPresentationMode || authorSelectionLocked}
                            lockedAuthorName={authorSelectionLocked ? (sessionActor?.name ?? draftAuthorName) : undefined}
                            onSubmit={() => void handleCreateSubmit()}
                            isSubmitting={isCreating}
                            showGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
                            onGitHubIssueSubmit={() => void handleCreateSubmitWithGitHubIssue()}
                            isGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
                            autoFocus
                            errorMessage={errorMessage}
                            onFooterWarningChange={setFooterWarningMessage}
                        />
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
