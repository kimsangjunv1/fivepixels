import { useMemo } from "react";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useReport } from "@/providers/reportContext.js";
import { getDraftMarkerPosition } from "@/utils/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";
import { PickTargetSnippet } from "./feedback/PickTargetSnippet.js";

const TOOLTIP_SURFACE_CLASS =
    "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
// ("overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]");
// "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-blackOpacity700)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";

export function ReportDraftForm() {
    const {
        draft,
        fields,
        authors,
        isCreating,
        selectedTarget,
        pickProbeOpen,
        togglePickProbe,
        messages,
        updateDraftCase,
        addDraftCase,
        removeDraftCase,
        updateDraftField,
        handleCreateSubmit,
        handleCreateSubmitWithGitHubIssue,
        canCreateGitHubIssueOnCreate,
        isDraftGitHubIssueSubmitting,
        draftAuthorName,
        setDraftAuthorName,
        errorMessage,
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
            pickProbeOpen={pickProbeOpen}
            togglePickProbe={togglePickProbe}
            probeEditLabel={messages.pickTarget.probeEdit}
            probeCloseLabel={messages.pickTarget.probeClose}
            updateDraftCase={updateDraftCase}
            addDraftCase={addDraftCase}
            removeDraftCase={removeDraftCase}
            updateDraftField={updateDraftField}
            handleCreateSubmit={handleCreateSubmit}
            handleCreateSubmitWithGitHubIssue={handleCreateSubmitWithGitHubIssue}
            canCreateGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
            isDraftGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
            draftAuthorName={draftAuthorName}
            setDraftAuthorName={setDraftAuthorName}
            errorMessage={errorMessage}
        />
    );
}

type ReportDraftFormContentProps = {
    draft: NonNullable<ReturnType<typeof useReport>["draft"]>;
    fields: ReturnType<typeof useReport>["fields"];
    authors: ReturnType<typeof useReport>["authors"];
    isCreating: boolean;
    selectedTarget: ReturnType<typeof useReport>["selectedTarget"];
    pickProbeOpen: boolean;
    togglePickProbe: () => void;
    probeEditLabel: string;
    probeCloseLabel: string;
    updateDraftCase: (caseId: string, text: string) => void;
    addDraftCase: () => void;
    removeDraftCase: (caseId: string) => void;
    updateDraftField: (key: string, value: string | boolean) => void;
    handleCreateSubmit: () => Promise<void>;
    handleCreateSubmitWithGitHubIssue: () => Promise<void>;
    canCreateGitHubIssueOnCreate: boolean;
    isDraftGitHubIssueSubmitting: boolean;
    draftAuthorName: string;
    setDraftAuthorName: (name: string) => void;
    errorMessage: string;
};

function ReportDraftFormContent({
    draft,
    fields,
    authors,
    isCreating,
    selectedTarget,
    pickProbeOpen,
    togglePickProbe,
    probeEditLabel,
    probeCloseLabel,
    updateDraftCase,
    addDraftCase,
    removeDraftCase,
    updateDraftField,
    handleCreateSubmit,
    handleCreateSubmitWithGitHubIssue,
    canCreateGitHubIssueOnCreate,
    isDraftGitHubIssueSubmitting,
    draftAuthorName,
    setDraftAuthorName,
    errorMessage,
}: ReportDraftFormContentProps) {
    const anchor = useMemo(() => getDraftMarkerPosition(draft, selectedTarget), [draft, selectedTarget]);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, true, true);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;

    if (!tooltipPosition || !tooltipAnchorStyle) {
        return null;
    }

    return (
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
                ...tooltipAnchorStyle,
            }}
        >
            <div
                className={TOOLTIP_SURFACE_CLASS}
                style={{
                    pointerEvents: "auto",
                }}
            >
                <div className="flex items-center justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                    <p className="text-[12px] font-semibold text-[var(--adaptive-black900)]">Feedback</p>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onClick={togglePickProbe}
                        className={`rounded-[8px] px-[10px] py-[4px] text-[11px] font-semibold ${
                            pickProbeOpen
                                ? "bg-[var(--adaptive-blue500)] text-white"
                                : "border border-[var(--adaptive-border-subtle)] text-[var(--adaptive-black700)]"
                        }`}
                    >
                        {pickProbeOpen ? probeCloseLabel : probeEditLabel}
                    </button>
                </div>
                {draft.targetSelector && draft.suggestedReportId ? (
                    <PickTargetSnippet suggestedReportId={draft.suggestedReportId} reportType={draft.reportType} />
                ) : null}
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
                    showTags
                    onSubmit={() => void handleCreateSubmit()}
                    isSubmitting={isCreating}
                    showGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
                    onGitHubIssueSubmit={() => void handleCreateSubmitWithGitHubIssue()}
                    isGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
                    autoFocus
                    errorMessage={errorMessage}
                />
            </div>
        </div>
    );
}
