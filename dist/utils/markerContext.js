import { hasFixedPositionAncestor } from "./dom.js";
const MODAL_REPORT_ID_PATTERN = /(?:^|-)(modal|overlay|dialog)(?:-|$)/i;
const MODAL_GHOST_DIALOG_WIDTH = 480;
const MODAL_GHOST_DIALOG_HEIGHT = 280;
const MODAL_GHOST_DIALOG_MAX_WIDTH_RATIO = 0.92;
export function isModalReportId(reportId) {
    return MODAL_REPORT_ID_PATTERN.test(reportId);
}
export function usesViewportDetachedCoords(report) {
    return !report.anchor_report_id && report.viewport_width > 0;
}
export function resolveDetachedKind(report, targetElement, detached) {
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
export function formatModalReportLabel(reportId) {
    const withoutPrefix = reportId.replace(/^modal-/, "");
    const name = withoutPrefix
        .replace(/-(overlay|target|open|demo)$/, "")
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return name ? `${name} modal` : "Modal";
}
export function getModalGhostFrame(report) {
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
export function getDetachedMarkerHint(detachedKind, messages) {
    if (detachedKind === "modal") {
        return messages.detachedModalHint;
    }
    if (detachedKind === "hidden") {
        return messages.detachedHint;
    }
    return null;
}
export function getDetachedMarkerAriaLabel(detachedKind, messages) {
    if (detachedKind === "modal") {
        return messages.detachedModalAriaLabel;
    }
    if (detachedKind === "hidden") {
        return messages.detachedAriaLabel;
    }
    return messages.detachedAriaLabel;
}
//# sourceMappingURL=markerContext.js.map