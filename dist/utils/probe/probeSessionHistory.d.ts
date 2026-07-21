import type { ProbeSessionAction, SavedProbeDeletion, SavedProbeEntry } from "../../types/report-ui.js";
export type ProbeSessionMaps = {
    edits: Record<string, SavedProbeEntry>;
    deletions: SavedProbeDeletion[];
};
export declare function applyProbeSessionActionForward(action: ProbeSessionAction, maps: ProbeSessionMaps): ProbeSessionMaps;
export declare function applyProbeSessionActionBackward(action: ProbeSessionAction, maps: ProbeSessionMaps): ProbeSessionMaps;
//# sourceMappingURL=probeSessionHistory.d.ts.map