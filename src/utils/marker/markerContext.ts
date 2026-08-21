import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
import { hasFixedPositionAncestor } from "../shared/dom.js";
import { normalizeReportPosition } from "../report/reportPosition.js";

const MODAL_REPORT_ID_PATTERN = /(?:^|-)(modal|overlay|dialog)(?:-|$)/i;

export type ModalGhostFrame = {
    backdrop: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    dialog: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
};

const MODAL_GHOST_DIALOG_WIDTH = 480;
const MODAL_GHOST_DIALOG_HEIGHT = 280;
const MODAL_GHOST_DIALOG_MAX_WIDTH_RATIO = 0.92;
const MODAL_GHOST_DIALOG_MAX_HEIGHT_RATIO = 0.7;

export function isModalReportId(reportId: string) {
    return MODAL_REPORT_ID_PATTERN.test(reportId);
}

export function usesViewportDetachedCoords(report: Pick<ReportFeedback, "position">) {
    const position = normalizeReportPosition(report.position);
    return !position.anchor && position.viewport.width > 0;
}

export function resolveDetachedKind(
    report: Pick<ReportFeedback, "report_id" | "position">,
    targetElement: HTMLElement | null,
    detached: boolean,
): MarkerDetachedKind {
    if (!detached) {
        return null;
    }

    // Treat saved declarative views as modal-like restore targets alongside
    // overlay/dialog ids and fixed-position ancestors.
    // Viewport-coordinate fallback alone must not imply modal — that mislabels
    // ordinary page markers that scrolled out of view.
    if (isModalReportId(report.report_id)) {
        return "modal";
    }

    if (normalizeReportPosition(report.position).viewPath?.length) {
        return "modal";
    }

    if (targetElement && hasFixedPositionAncestor(targetElement)) {
        return "modal";
    }

    return "hidden";
}

export function formatModalReportLabel(reportId: string) {
    const withoutPrefix = reportId.replace(/^modal-/, "");
    const name = withoutPrefix
        .replace(/-(overlay|target|open|demo)$/, "")
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return name ? `${name} modal` : "Modal";
}

/**
 * Renders a consistent centered modal silhouette. Saved viewport ratios are
 * intentionally ignored — they drift after scroll/resize and confuse users.
 */
export function getModalGhostFrame(_report?: Pick<ReportFeedback, "position">): ModalGhostFrame {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const dialogWidth = Math.min(MODAL_GHOST_DIALOG_WIDTH, viewportWidth * MODAL_GHOST_DIALOG_MAX_WIDTH_RATIO);
    const dialogHeight = Math.min(MODAL_GHOST_DIALOG_HEIGHT, viewportHeight * MODAL_GHOST_DIALOG_MAX_HEIGHT_RATIO);

    return {
        backdrop: {
            left: 0,
            top: 0,
            width: viewportWidth,
            height: viewportHeight,
        },
        dialog: {
            left: (viewportWidth - dialogWidth) / 2,
            top: (viewportHeight - dialogHeight) / 2,
            width: dialogWidth,
            height: dialogHeight,
        },
    };
}

export function getDetachedMarkerHint(
    detachedKind: MarkerDetachedKind,
    messages: {
        detachedHint: string;
        detachedModalHint: string;
    },
) {
    if (detachedKind === "modal") {
        return messages.detachedModalHint;
    }

    if (detachedKind === "hidden") {
        return messages.detachedHint;
    }

    return null;
}

export function getDetachedMarkerAriaLabel(
    detachedKind: MarkerDetachedKind,
    messages: {
        detachedAriaLabel: string;
        detachedModalAriaLabel: string;
    },
) {
    if (detachedKind === "modal") {
        return messages.detachedModalAriaLabel;
    }

    if (detachedKind === "hidden") {
        return messages.detachedAriaLabel;
    }

    return messages.detachedAriaLabel;
}
