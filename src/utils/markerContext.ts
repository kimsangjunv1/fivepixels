import type { ReportFeedback } from "@/types/report.js";
import type { MarkerDetachedKind } from "@/types/report-ui.js";
import { hasFixedPositionAncestor } from "./dom.js";

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

export function isModalReportId(reportId: string) {
    return MODAL_REPORT_ID_PATTERN.test(reportId);
}

export function usesViewportDetachedCoords(report: Pick<ReportFeedback, "anchor_report_id" | "viewport_width">) {
    return !report.anchor_report_id && report.viewport_width > 0;
}

export function resolveDetachedKind(
    report: Pick<ReportFeedback, "report_id" | "anchor_report_id" | "viewport_width">,
    targetElement: HTMLElement | null,
    detached: boolean,
): MarkerDetachedKind {
    if (!detached) {
        return null;
    }

    if (isModalReportId(report.report_id)) {
        return "modal";
    }

    if (usesViewportDetachedCoords(report)) {
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

export function getModalGhostFrame(report: Pick<ReportFeedback, "x_ratio" | "y_ratio" | "viewport_width" | "viewport_height">): ModalGhostFrame {
    const widthScale = report.viewport_width > 0 ? window.innerWidth / report.viewport_width : 1;
    const heightScale = report.viewport_height > 0 ? window.innerHeight / report.viewport_height : 1;
    const centerX = report.viewport_width * report.x_ratio * widthScale;
    const centerY = report.viewport_height * report.y_ratio * heightScale;
    const dialogWidth = Math.min(MODAL_GHOST_DIALOG_WIDTH * widthScale, window.innerWidth * MODAL_GHOST_DIALOG_MAX_WIDTH_RATIO);
    const dialogHeight = MODAL_GHOST_DIALOG_HEIGHT * heightScale;

    return {
        backdrop: {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
        },
        dialog: {
            left: centerX - dialogWidth / 2,
            top: centerY - dialogHeight / 2,
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
