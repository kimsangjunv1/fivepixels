import { type Dispatch, type SetStateAction } from "react";
import type { PickProbeCompareMode, ProbeSessionAction, SavedProbeDeletion, SavedProbeEntry } from "../../types/report-ui.js";
export type UsePickProbeSessionHistoryParams = {
    setSavedProbeEdits: Dispatch<SetStateAction<Record<string, SavedProbeEntry>>>;
    setSavedProbeCompareModeState: Dispatch<SetStateAction<PickProbeCompareMode>>;
};
export declare function usePickProbeSessionHistory({ setSavedProbeEdits, setSavedProbeCompareModeState, }: UsePickProbeSessionHistoryParams): {
    savedProbeDeletions: SavedProbeDeletion[];
    setSavedProbeDeletions: Dispatch<SetStateAction<SavedProbeDeletion[]>>;
    pushProbeSessionAction: (action: ProbeSessionAction) => void;
    undoProbeSessionAction: () => void;
    redoProbeSessionAction: () => void;
    revertAllSavedProbeEdits: () => void;
    canUndoProbeSession: boolean;
    canRedoProbeSession: boolean;
    hasProbeSessionChanges: boolean;
};
//# sourceMappingURL=usePickProbeSessionHistory.d.ts.map