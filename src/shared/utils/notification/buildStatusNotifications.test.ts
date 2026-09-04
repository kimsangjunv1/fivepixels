import { describe, expect, it } from "vitest";
import type { ReportMessages } from "@/shared/i18n/types.js";
import {
    buildStatusNotifications,
    HIDDEN_MARKER_NOTIFICATION_ID,
    MODAL_MARKER_NOTIFICATION_ID,
    PROBE_EDIT_NOTIFICATION_ID,
} from "./buildStatusNotifications.js";

const messages = {
    notifications: {
        elementMissingTitle: "hidden-title",
        elementMissingBody: "hidden-body",
        modalMarkerTitle: "modal-title",
        modalMarkerBody: "modal-body",
        probeEditTitle: "probe-title",
        probeEditBody: "probe-body",
    },
} as ReportMessages;

describe("buildStatusNotifications", () => {
    it("builds sticky status notifications from live flags", () => {
        const items = buildStatusNotifications({
            messages,
            hasHiddenMarker: true,
            hasModalMarker: true,
            hasProbeEdit: true,
            showHiddenDetachedMarkers: false,
            showModalDetachedMarkers: true,
            canUndoProbeSession: true,
            canRedoProbeSession: false,
        });

        expect(items.map((item) => item.id)).toEqual([
            PROBE_EDIT_NOTIFICATION_ID,
            HIDDEN_MARKER_NOTIFICATION_ID,
            MODAL_MARKER_NOTIFICATION_ID,
        ]);
        expect(items[0]?.payload).toEqual({ canUndo: true, canRedo: false });
        expect(items[1]?.payload).toEqual({ detachedKind: "hidden", markersVisible: false });
        expect(items[2]?.payload).toEqual({ detachedKind: "modal", markersVisible: true });
    });

    it("returns an empty list when no status conditions are active", () => {
        expect(
            buildStatusNotifications({
                messages,
                hasHiddenMarker: false,
                hasModalMarker: false,
                hasProbeEdit: false,
                showHiddenDetachedMarkers: true,
                showModalDetachedMarkers: true,
                canUndoProbeSession: false,
                canRedoProbeSession: false,
            }),
        ).toEqual([]);
    });
});
