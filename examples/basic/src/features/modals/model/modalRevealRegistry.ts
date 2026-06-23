import type { ReportFeedback } from "@fivepixels-js/react";

import { revealZustandModal } from "./modalZustandStore";

export type ModalRevealHandler = (report: ReportFeedback) => boolean | Promise<boolean>;

let revealHandler: ModalRevealHandler | null = null;

export function registerModalRevealHandler(handler: ModalRevealHandler | null) {
    revealHandler = handler;
}

export async function invokeModalRevealHandler(report: ReportFeedback) {
    if (report.pathname !== "/modals") {
        return false;
    }

    if (revealZustandModal(report)) {
        return true;
    }

    if (!revealHandler) {
        return false;
    }

    return Boolean(await revealHandler(report));
}
