import { applyPickProbeCompareMode } from "./pickProbe.js";
import { findElementByProbeKey, restoreProbeElementOriginal, restoreSavedProbeDeletion, } from "./pickProbeSession.js";
function applyStyleEntry(elementKey, entry) {
    const element = findElementByProbeKey(elementKey);
    if (element) {
        applyPickProbeCompareMode(element, "after", entry.baseline, entry.applied);
    }
}
function withoutDeletion(deletions, id) {
    return deletions.filter((entry) => entry.id !== id);
}
function withDeletion(deletions, deletion) {
    if (deletions.some((entry) => entry.id === deletion.id)) {
        return deletions;
    }
    return [...deletions, deletion];
}
export function applyProbeSessionActionForward(action, maps) {
    switch (action.kind) {
        case "style-apply": {
            applyStyleEntry(action.elementKey, action.nextEntry);
            return {
                edits: {
                    ...maps.edits,
                    [action.elementKey]: action.nextEntry,
                },
                deletions: maps.deletions,
            };
        }
        case "style-revert": {
            const element = findElementByProbeKey(action.elementKey);
            if (element) {
                restoreProbeElementOriginal(element, action.revertedEntry);
            }
            const edits = { ...maps.edits };
            delete edits[action.elementKey];
            return {
                edits,
                deletions: maps.deletions,
            };
        }
        case "delete": {
            const element = findElementByProbeKey(action.deletion.elementKey);
            if (element?.isConnected) {
                element.remove();
            }
            const edits = { ...maps.edits };
            if (action.previousStyleEntry) {
                delete edits[action.deletion.elementKey];
            }
            return {
                edits,
                deletions: withDeletion(maps.deletions, action.deletion),
            };
        }
    }
}
export function applyProbeSessionActionBackward(action, maps) {
    switch (action.kind) {
        case "style-apply": {
            const edits = { ...maps.edits };
            if (action.previousEntry) {
                applyStyleEntry(action.elementKey, action.previousEntry);
                edits[action.elementKey] = action.previousEntry;
            }
            else {
                const element = findElementByProbeKey(action.elementKey);
                if (element) {
                    restoreProbeElementOriginal(element, action.nextEntry);
                }
                delete edits[action.elementKey];
            }
            return {
                edits,
                deletions: maps.deletions,
            };
        }
        case "style-revert": {
            applyStyleEntry(action.elementKey, action.revertedEntry);
            return {
                edits: {
                    ...maps.edits,
                    [action.elementKey]: action.revertedEntry,
                },
                deletions: maps.deletions,
            };
        }
        case "delete": {
            restoreSavedProbeDeletion(action.deletion);
            const edits = { ...maps.edits };
            if (action.previousStyleEntry) {
                edits[action.deletion.elementKey] = action.previousStyleEntry;
                applyStyleEntry(action.deletion.elementKey, action.previousStyleEntry);
            }
            return {
                edits,
                deletions: withoutDeletion(maps.deletions, action.deletion.id),
            };
        }
    }
}
//# sourceMappingURL=probeSessionHistory.js.map