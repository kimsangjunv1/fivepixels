import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/Icons.js";
import { PickTargetCompareSegment } from "@/tooltip/PickTargetCompareSegment.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { PanelStatusBanner, type PanelStatusBannerAction } from "./PanelStatusBanner.js";

function ProbeEditModeSpinner() {
    return (
        <span
            className="fivepixels-spin inline-block h-[12px] w-[12px] shrink-0 rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
        />
    );
}

function BannerDivider() {
    return <span className="shrink-0 text-[11px] text-white/50">|</span>;
}

type StackBanner = {
    id: string;
    message: string;
    actions: PanelStatusBannerAction[];
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
};

/**
 * Stacks all active panel status banners (edit mode, hidden markers, modal markers).
 */
export function PanelStatusBannerStack() {
    const {
        messages,
        showHiddenDetachedMarkers,
        setShowHiddenDetachedMarkers,
        showModalDetachedMarkers,
        setShowModalDetachedMarkers,
    } = useReportPreferences();
    const {
        markers,
        hasProbeSessionChanges,
        savedProbeCompareMode,
        setSavedProbeCompareMode,
        revertAllSavedProbeEdits,
        savedProbeEdits,
        canUndoProbeSession,
        canRedoProbeSession,
        undoProbeSessionAction,
        redoProbeSessionAction,
    } = useReportSession();

    const hasHiddenMarker = useMemo(() => markers.some((marker) => marker.detachedKind === "hidden"), [markers]);
    const hasModalMarker = useMemo(() => markers.some((marker) => marker.detachedKind === "modal"), [markers]);
    const showCompare = Object.keys(savedProbeEdits).length > 0;

    const banners = useMemo(() => {
        const next: StackBanner[] = [];

        if (hasProbeSessionChanges) {
            const editActions: PanelStatusBannerAction[] = [
                {
                    id: "edit-reset",
                    label: messages.panel.probeEditModeReset,
                    onClick: () => revertAllSavedProbeEdits(),
                },
                {
                    id: "edit-undo",
                    label: messages.panel.probeEditModeUndo,
                    ariaLabel: messages.panel.probeEditModeUndo,
                    disabled: !canUndoProbeSession,
                    onClick: () => undoProbeSessionAction(),
                    children: <ChevronLeftIcon className="h-[14px] w-[14px]" />,
                },
                {
                    id: "edit-redo",
                    label: messages.panel.probeEditModeRedo,
                    ariaLabel: messages.panel.probeEditModeRedo,
                    disabled: !canRedoProbeSession,
                    onClick: () => redoProbeSessionAction(),
                    children: <ChevronRightIcon className="h-[14px] w-[14px]" />,
                },
            ];

            next.push({
                id: "probe-edit",
                message: messages.panel.probeEditModeActive,
                actions: editActions,
                leading: <ProbeEditModeSpinner />,
                trailing: showCompare ? (
                    <>
                        <BannerDivider />
                        <PickTargetCompareSegment
                            mode={savedProbeCompareMode}
                            onChange={setSavedProbeCompareMode}
                            beforeLabel={messages.pickTarget.probeBefore}
                            afterLabel={messages.pickTarget.probeAfter}
                            tone="inverse"
                        />
                    </>
                ) : null,
            });
        }

        if (hasHiddenMarker) {
            next.push({
                id: "hidden-markers",
                message: messages.panel.hiddenMarkerBannerMessage,
                actions: [
                    {
                        id: "hidden-hide",
                        label: messages.panel.detachedMarkerHide,
                        active: !showHiddenDetachedMarkers,
                        onClick: () => setShowHiddenDetachedMarkers(false),
                    },
                    {
                        id: "hidden-show",
                        label: messages.panel.detachedMarkerShow,
                        active: showHiddenDetachedMarkers,
                        onClick: () => setShowHiddenDetachedMarkers(true),
                    },
                ],
            });
        }

        if (hasModalMarker) {
            next.push({
                id: "modal-markers",
                message: messages.panel.modalMarkerBannerMessage,
                actions: [
                    {
                        id: "modal-hide",
                        label: messages.panel.detachedMarkerHide,
                        active: !showModalDetachedMarkers,
                        onClick: () => setShowModalDetachedMarkers(false),
                    },
                    {
                        id: "modal-show",
                        label: messages.panel.detachedMarkerShow,
                        active: showModalDetachedMarkers,
                        onClick: () => setShowModalDetachedMarkers(true),
                    },
                ],
            });
        }

        return next;
    }, [
        canRedoProbeSession,
        canUndoProbeSession,
        hasHiddenMarker,
        hasModalMarker,
        hasProbeSessionChanges,
        messages.panel.detachedMarkerHide,
        messages.panel.detachedMarkerShow,
        messages.panel.hiddenMarkerBannerMessage,
        messages.panel.modalMarkerBannerMessage,
        messages.panel.probeEditModeActive,
        messages.panel.probeEditModeRedo,
        messages.panel.probeEditModeReset,
        messages.panel.probeEditModeUndo,
        messages.pickTarget.probeAfter,
        messages.pickTarget.probeBefore,
        redoProbeSessionAction,
        revertAllSavedProbeEdits,
        savedProbeCompareMode,
        setSavedProbeCompareMode,
        setShowHiddenDetachedMarkers,
        setShowModalDetachedMarkers,
        showCompare,
        showHiddenDetachedMarkers,
        showModalDetachedMarkers,
        undoProbeSessionAction,
    ]);

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="flex shrink-0 flex-col">
            {banners.map((banner, index) => (
                <PanelStatusBanner
                    key={banner.id}
                    message={banner.message}
                    actions={banner.actions}
                    leading={banner.leading}
                    trailing={banner.trailing}
                    roundedTop={index === 0}
                />
            ))}
        </div>
    );
}
