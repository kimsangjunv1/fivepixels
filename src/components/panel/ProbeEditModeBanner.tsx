import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/Icons.js";
import { PickTargetCompareSegment } from "@/components/overlay/PickTargetCompareSegment.js";
import { useReport } from "@/providers/reportContext.js";

function ProbeEditModeSpinner() {
    return (
        <span
            className="fivepixels-spin inline-block h-[12px] w-[12px] shrink-0 rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
        />
    );
}

function ProbeEditModeDivider() {
    return <span className="shrink-0 text-[11px] text-white/50">|</span>;
}

function ProbeEditModeHistoryButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            data-fivepixels-interactive=""
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="inline-flex shrink-0 items-center justify-center rounded-[4px] p-[2px] text-white transition-opacity enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
        >
            {children}
        </button>
    );
}

export function ProbeEditModeBanner() {
    const {
        hasProbeSessionChanges,
        savedProbeCompareMode,
        setSavedProbeCompareMode,
        revertAllSavedProbeEdits,
        savedProbeEdits,
        canUndoProbeSession,
        canRedoProbeSession,
        undoProbeSessionAction,
        redoProbeSessionAction,
        messages,
    } = useReport();

    if (!hasProbeSessionChanges) {
        return null;
    }

    const showCompare = Object.keys(savedProbeEdits).length > 0;

    return (
        <section
            className="flex shrink-0 items-center gap-[8px] rounded-t-[12px] bg-[#f6572d] px-[10px] py-[6px] text-white"
            data-fivepixels-interactive=""
        >
            <ProbeEditModeSpinner />
            <p className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3]">{messages.panel.probeEditModeActive}</p>
            <ProbeEditModeDivider />
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => revertAllSavedProbeEdits()}
                className="shrink-0 text-[11px] font-semibold text-white underline-offset-2 hover:underline"
            >
                {messages.panel.probeEditModeReset}
            </button>
            <ProbeEditModeDivider />
            <div className="flex shrink-0 items-center gap-[2px]">
                <ProbeEditModeHistoryButton
                    label={messages.panel.probeEditModeUndo}
                    disabled={!canUndoProbeSession}
                    onClick={() => undoProbeSessionAction()}
                >
                    <ChevronLeftIcon className="h-[14px] w-[14px]" />
                </ProbeEditModeHistoryButton>
                <ProbeEditModeHistoryButton
                    label={messages.panel.probeEditModeRedo}
                    disabled={!canRedoProbeSession}
                    onClick={() => redoProbeSessionAction()}
                >
                    <ChevronRightIcon className="h-[14px] w-[14px]" />
                </ProbeEditModeHistoryButton>
            </div>
            {showCompare ? (
                <>
                    <ProbeEditModeDivider />
                    <PickTargetCompareSegment
                        mode={savedProbeCompareMode}
                        onChange={setSavedProbeCompareMode}
                        beforeLabel={messages.pickTarget.probeBefore}
                        afterLabel={messages.pickTarget.probeAfter}
                        tone="inverse"
                    />
                </>
            ) : null}
        </section>
    );
}
