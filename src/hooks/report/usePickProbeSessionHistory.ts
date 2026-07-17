import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { PickProbeCompareMode, ProbeSessionAction, SavedProbeDeletion, SavedProbeEntry } from "@/types/report-ui.js";
import {
    findElementByProbeKey,
    restoreProbeElementOriginal,
    restoreSavedProbeDeletion,
} from "@/utils/probe/pickProbeSession.js";
import { applyProbeSessionActionBackward, applyProbeSessionActionForward } from "@/utils/probe/probeSessionHistory.js";

export type UsePickProbeSessionHistoryParams = {
    setSavedProbeEdits: Dispatch<SetStateAction<Record<string, SavedProbeEntry>>>;
    setSavedProbeCompareModeState: Dispatch<SetStateAction<PickProbeCompareMode>>;
};

export function usePickProbeSessionHistory({
    setSavedProbeEdits,
    setSavedProbeCompareModeState,
}: UsePickProbeSessionHistoryParams) {
    const [savedProbeDeletions, setSavedProbeDeletions] = useState<SavedProbeDeletion[]>([]);
    const savedProbeDeletionsRef = useRef(savedProbeDeletions);
    savedProbeDeletionsRef.current = savedProbeDeletions;
    const [probeSessionHistoryState, setProbeSessionHistoryState] = useState<{
        actions: ProbeSessionAction[];
        index: number;
    }>({ actions: [], index: -1 });

    const pushProbeSessionAction = useCallback((action: ProbeSessionAction) => {
        setProbeSessionHistoryState((current) => {
            const actions = current.actions.slice(0, current.index + 1);
            actions.push(action);

            return {
                actions,
                index: actions.length - 1,
            };
        });
    }, []);

    const undoProbeSessionAction = useCallback(() => {
        setProbeSessionHistoryState((current) => {
            if (current.index < 0) {
                return current;
            }

            const action = current.actions[current.index];

            setSavedProbeEdits((edits) => {
                const next = applyProbeSessionActionBackward(action, {
                    edits,
                    deletions: savedProbeDeletionsRef.current,
                });
                setSavedProbeDeletions(next.deletions);

                return next.edits;
            });

            return {
                actions: current.actions,
                index: current.index - 1,
            };
        });
    }, [setSavedProbeEdits]);

    const redoProbeSessionAction = useCallback(() => {
        setProbeSessionHistoryState((current) => {
            if (current.index >= current.actions.length - 1) {
                return current;
            }

            const action = current.actions[current.index + 1];

            setSavedProbeEdits((edits) => {
                const next = applyProbeSessionActionForward(action, {
                    edits,
                    deletions: savedProbeDeletionsRef.current,
                });
                setSavedProbeDeletions(next.deletions);

                return next.edits;
            });

            return {
                actions: current.actions,
                index: current.index + 1,
            };
        });
    }, [setSavedProbeEdits]);

    const revertAllSavedProbeEdits = useCallback(() => {
        setProbeSessionHistoryState({ actions: [], index: -1 });

        setSavedProbeDeletions((deletions) => {
            for (const entry of [...deletions].reverse()) {
                restoreSavedProbeDeletion(entry);
            }

            return [];
        });

        setSavedProbeEdits((current) => {
            for (const entry of Object.values(current)) {
                const element = findElementByProbeKey(entry.elementKey);

                if (element) {
                    restoreProbeElementOriginal(element, entry);
                }
            }

            return {};
        });
        setSavedProbeCompareModeState("after");
    }, [setSavedProbeCompareModeState, setSavedProbeEdits]);

    const canUndoProbeSession = probeSessionHistoryState.index >= 0;
    const canRedoProbeSession = probeSessionHistoryState.index < probeSessionHistoryState.actions.length - 1;

    const hasProbeSessionChanges = useMemo(() => probeSessionHistoryState.index >= 0, [probeSessionHistoryState.index]);

    return {
        savedProbeDeletions,
        setSavedProbeDeletions,
        pushProbeSessionAction,
        undoProbeSessionAction,
        redoProbeSessionAction,
        revertAllSavedProbeEdits,
        canUndoProbeSession,
        canRedoProbeSession,
        hasProbeSessionChanges,
    };
}
