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

export function ProbeEditModeBanner() {
    const {
        savedProbeEdits,
        savedProbeCompareMode,
        setSavedProbeCompareMode,
        revertAllSavedProbeEdits,
        messages,
    } = useReport();

    if (Object.keys(savedProbeEdits).length === 0) {
        return null;
    }

    return (
        <section
            className="flex shrink-0 items-center gap-[8px] rounded-t-[12px] bg-[#f6572d] px-[10px] py-[6px] text-white"
            data-fivepixels-interactive=""
        >
            <ProbeEditModeSpinner />
            <p className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3]">
                {messages.panel.probeEditModeActive}
            </p>
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
            <PickTargetCompareSegment
                mode={savedProbeCompareMode}
                onChange={setSavedProbeCompareMode}
                beforeLabel={messages.pickTarget.probeBefore}
                afterLabel={messages.pickTarget.probeAfter}
                tone="inverse"
            />
        </section>
    );
}
