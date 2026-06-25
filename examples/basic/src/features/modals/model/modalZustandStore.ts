import type { ReportFeedback } from "@fivepixels-js/react";
import { create } from "zustand";

import { isDashboardPath } from "../../landing/model/dashboardPaths";

export const MODAL_ZUSTAND_TARGET_ID = "modal-zustand-target";
export const MODAL_ZUSTAND_OVERLAY_ID = "modal-zustand-overlay";

const MODAL_ZUSTAND_REVEAL_IDS = new Set([MODAL_ZUSTAND_TARGET_ID, MODAL_ZUSTAND_OVERLAY_ID]);

type ModalZustandState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

export const useModalZustandStore = create<ModalZustandState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));

export function revealZustandModal(report: Pick<ReportFeedback, "report_id" | "pathname">) {
    if (!report.pathname || !isDashboardPath(report.pathname) || !MODAL_ZUSTAND_REVEAL_IDS.has(report.report_id)) {
        return false;
    }

    useModalZustandStore.getState().open();
    return true;
}
