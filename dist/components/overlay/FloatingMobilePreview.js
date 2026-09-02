import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from "react";
import { DEFAULT_DEVICE_PREVIEW_ID, getDevicePreviewLayoutSize, getDevicePreviewPreset, scaleDeviceChrome, } from "../../constants/devicePreview.js";
import { OverlayShell } from "../../components/ui/OverlayShell.js";
import { useReportPreferences } from "../../providers/reportContext.js";
import { DeviceFrameArtwork } from "./DeviceFrameArtwork.js";
import { MOBILE_PREVIEW_FRAME_NAME, getMobilePreviewGuestDocument, getMobilePreviewGuestWindow, isInsideMobilePreviewFrame, isMobilePreviewGuestDocumentReady, syncMobilePreviewGuestViewport, } from "../../utils/overlay/mobilePreviewFrame.js";
const MOBILE_PREVIEW_POSITION_STORAGE_KEY = "fivepixels:mobile-preview-position:v1";
const MOBILE_PREVIEW_SCALE = 0.75;
const CONTENT_PADDING = 16;
function readMobilePreviewPosition() {
    const fallback = getDefaultMobilePreviewPosition();
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const raw = window.localStorage.getItem(MOBILE_PREVIEW_POSITION_STORAGE_KEY);
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === "number" && Number.isFinite(parsed.left) && typeof parsed.top === "number" && Number.isFinite(parsed.top)) {
            return { left: parsed.left, top: parsed.top };
        }
    }
    catch {
        // Ignore storage failures.
    }
    return fallback;
}
function getDefaultMobilePreviewPosition() {
    if (typeof window === "undefined") {
        return { left: 80, top: 80 };
    }
    return {
        left: Math.max(16, window.innerWidth - 340),
        top: Math.max(16, window.innerHeight - 720),
    };
}
function persistMobilePreviewPosition(position) {
    try {
        window.localStorage.setItem(MOBILE_PREVIEW_POSITION_STORAGE_KEY, JSON.stringify(position));
    }
    catch {
        // Ignore storage failures.
    }
}
export function FloatingMobilePreview() {
    const { mobilePreviewUiOpen, setMobilePreviewUiOpen, messages, resolvedPanelAppearance } = useReportPreferences();
    const preset = useMemo(() => getDevicePreviewPreset(DEFAULT_DEVICE_PREVIEW_ID), []);
    const layout = useMemo(() => getDevicePreviewLayoutSize(preset, MOBILE_PREVIEW_SCALE), [preset]);
    const chrome = useMemo(() => scaleDeviceChrome(preset, MOBILE_PREVIEW_SCALE), [preset]);
    const logicalWidth = preset.width;
    const logicalHeight = preset.height;
    const frameWidth = layout.width + chrome.bezel.left + chrome.bezel.right;
    const frameHeight = layout.height + chrome.bezel.top + chrome.bezel.bottom;
    const windowWidth = frameWidth + CONTENT_PADDING * 2;
    const windowHeight = frameHeight + CONTENT_PADDING * 2;
    const screenBackground = resolvedPanelAppearance === "dark" ? "#17171c" : "#ffffff";
    const [position, setPosition] = useState(() => readMobilePreviewPosition());
    const [mode, setMode] = useState("normal");
    const [frameLoadState, setFrameLoadState] = useState("loading");
    const [frameSrc] = useState(() => (typeof window === "undefined" ? "" : window.location.href));
    const iframeRef = useRef(null);
    const handlePositionChange = useCallback((next) => {
        setPosition(next);
        persistMobilePreviewPosition(next);
    }, []);
    const handleClose = useCallback(() => {
        setMobilePreviewUiOpen(false);
    }, [setMobilePreviewUiOpen]);
    const handleFrameLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!isMobilePreviewGuestDocumentReady(iframe)) {
            setFrameLoadState("blocked");
            return;
        }
        const guestDocument = getMobilePreviewGuestDocument(iframe);
        syncMobilePreviewGuestViewport(guestDocument, logicalWidth);
        getMobilePreviewGuestWindow(iframe)?.dispatchEvent(new Event("resize"));
        setFrameLoadState("ready");
    }, [logicalWidth]);
    if (!mobilePreviewUiOpen || isInsideMobilePreviewFrame()) {
        return null;
    }
    return (_jsx(OverlayShell, { windowId: "mobile-preview", minimizePolicy: "dock", dataChrome: "mobile-preview", ariaLabel: messages.panel.mobilePreview, position: position, onPositionChange: handlePositionChange, mode: mode, onModeChange: setMode, width: windowWidth, height: windowHeight, minWidth: 280, minHeight: 360, resizable: true, resizeAriaLabel: messages.marker.resizeAriaLabel, contentClassName: "flex items-center justify-center p-[16px]", minimizedDockSubtitle: messages.panel.mobilePreview, controls: {
            onClose: handleClose,
            closeAriaLabel: messages.marker.windowCloseAriaLabel,
            minimizeAriaLabel: messages.marker.windowMinimizeAriaLabel,
            maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel,
            restoreAriaLabel: messages.marker.windowRestoreAriaLabel,
            moreAriaLabel: messages.marker.windowControlsMoreAriaLabel,
        }, title: _jsx("span", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.panel.mobilePreview }), children: _jsxs("div", { className: "relative shrink-0", style: { width: frameWidth, height: frameHeight }, children: [_jsx("iframe", { ref: iframeRef, name: MOBILE_PREVIEW_FRAME_NAME, title: messages.settings.mobilePreviewIframeTitle, src: frameSrc, onLoad: handleFrameLoad, "data-fivepixels-mobile-preview-frame": "", className: "absolute z-[0] border-0", style: {
                        left: chrome.bezel.left,
                        top: chrome.bezel.top,
                        width: logicalWidth,
                        height: logicalHeight,
                        transform: `scale(${MOBILE_PREVIEW_SCALE})`,
                        transformOrigin: "top left",
                        borderRadius: preset.chrome.screenRadius,
                        background: screenBackground,
                    } }), frameLoadState === "blocked" ? (_jsx("div", { className: "pointer-events-none absolute z-[1] flex items-center justify-center px-[12px] text-center text-[11px] font-semibold text-[var(--adaptive-black900)]", style: {
                        left: chrome.bezel.left,
                        top: chrome.bezel.top,
                        width: layout.width,
                        height: layout.height,
                        borderRadius: chrome.screenRadius,
                        background: screenBackground,
                    }, children: messages.settings.mobilePreviewIframeBlocked })) : null, _jsx("div", { className: "pointer-events-none absolute inset-0 z-[2]", children: _jsx(DeviceFrameArtwork, { preset: preset, chrome: chrome, screenWidth: layout.width, screenHeight: layout.height }) })] }) }));
}
//# sourceMappingURL=FloatingMobilePreview.js.map