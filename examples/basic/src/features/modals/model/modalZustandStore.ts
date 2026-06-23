import type { ReportFeedback } from "@fivepixels-js/react";
import { create } from "zustand";

export const MODAL_ZUSTAND_TARGET_ID = "modal-zustand-target";

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
    if (report.pathname !== "/modals" || report.report_id !== MODAL_ZUSTAND_TARGET_ID) {
        return false;
    }

    useModalZustandStore.getState().open();
    return true;
}
