import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEVICE_PREVIEW_BRAND_ORDER, getDevicePreviewPresetsByBrand, scaleDeviceChrome, } from "../../constants/devicePreview.js";
import { CloseIcon, ScreenRotateIcon } from "../../components/icons/Icons.js";
import { useDraggableWindow } from "../../hooks/useDraggableWindow.js";
import { useReportPreferences } from "../../providers/reportContext.js";
import { DeviceFrameArtwork } from "./DeviceFrameArtwork.js";
import { DeviceStatusBar, getDeviceStatusBarHeight } from "./DeviceStatusBar.js";
import { claimFloatingWindowZIndex } from "../../utils/overlay/floatingWindowStack.js";
import { syncGuestStatusBarStyle } from "../../utils/overlay/devicePreviewFrame.js";
import { resolveMobilePreviewScreenSize } from "../../utils/overlay/mobilePreviewLayout.js";
import { MOBILE_PREVIEW_FRAME_NAME, getMobilePreviewGuestDocument, getMobilePreviewGuestWindow, isInsideMobilePreviewFrame, isMobilePreviewGuestDocumentReady, syncMobilePreviewGuestViewport, } from "../../utils/overlay/mobilePreviewFrame.js";
const MOBILE_PREVIEW_POSITION_STORAGE_KEY = "fivepixels:mobile-preview-position:v1";
const MOBILE_PREVIEW_SCALE = 0.75;
const MOBILE_PREVIEW_BRANDS = DEVICE_PREVIEW_BRAND_ORDER.filter((brand) => brand !== "desktop");
const TOOLBAR_DEVICE_GAP = 10;
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
        left: Math.max(16, window.innerWidth - 360),
        top: Math.max(16, window.innerHeight - 760),
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
function syncGuestViewport(iframe, viewportWidth, statusBarHeight) {
    const guestDocument = getMobilePreviewGuestDocument(iframe);
    syncMobilePreviewGuestViewport(guestDocument, viewportWidth);
    syncGuestStatusBarStyle(guestDocument, statusBarHeight);
    getMobilePreviewGuestWindow(iframe)?.dispatchEvent(new Event("resize"));
}
export function FloatingMobilePreview() {
    const { mobilePreviewUiOpen, setMobilePreviewUiOpen, mobilePreviewDeviceId, setMobilePreviewDeviceId, mobilePreviewOrientation, toggleMobilePreviewOrientation, mobilePreviewPreset, messages, resolvedPanelAppearance, } = useReportPreferences();
    const screenSize = useMemo(() => resolveMobilePreviewScreenSize(mobilePreviewPreset, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const layout = useMemo(() => ({
        width: Math.max(1, Math.round(screenSize.width * MOBILE_PREVIEW_SCALE)),
        height: Math.max(1, Math.round(screenSize.height * MOBILE_PREVIEW_SCALE)),
    }), [screenSize.height, screenSize.width]);
    const chrome = useMemo(() => scaleDeviceChrome(mobilePreviewPreset, MOBILE_PREVIEW_SCALE), [mobilePreviewPreset]);
    const frameWidth = layout.width + chrome.bezel.left + chrome.bezel.right;
    const frameHeight = layout.height + chrome.bezel.top + chrome.bezel.bottom;
    const statusBarHeight = useMemo(() => getDeviceStatusBarHeight(mobilePreviewPreset, screenSize.width), [mobilePreviewPreset, screenSize.width]);
    const statusBarAppearance = resolvedPanelAppearance === "dark" ? "dark" : "light";
    const screenBackground = resolvedPanelAppearance === "dark" ? "#17171c" : "#ffffff";
    const [storedPosition] = useState(() => readMobilePreviewPosition());
    const [zIndex, setZIndex] = useState(() => claimFloatingWindowZIndex());
    const [frameLoadState, setFrameLoadState] = useState("loading");
    const [frameSrc] = useState(() => (typeof window === "undefined" ? "" : window.location.href));
    const rootRef = useRef(null);
    const iframeRef = useRef(null);
    const { position: dragPosition, isDragging, handleDragHandlePointerDown } = useDraggableWindow({
        enabled: mobilePreviewUiOpen,
        windowRef: rootRef,
    });
    const resolvedPosition = dragPosition ?? storedPosition;
    useEffect(() => {
        if (!dragPosition) {
            return;
        }
        persistMobilePreviewPosition(dragPosition);
    }, [dragPosition]);
    useEffect(() => {
        if (frameLoadState !== "ready") {
            return;
        }
        syncGuestViewport(iframeRef.current, screenSize.width, statusBarHeight);
    }, [frameLoadState, screenSize.width, statusBarHeight]);
    const handleClose = useCallback(() => {
        setMobilePreviewUiOpen(false);
    }, [setMobilePreviewUiOpen]);
    const handleFrameLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!isMobilePreviewGuestDocumentReady(iframe)) {
            setFrameLoadState("blocked");
            return;
        }
        syncGuestViewport(iframe, screenSize.width, statusBarHeight);
        setFrameLoadState("ready");
    }, [screenSize.width, statusBarHeight]);
    const handleFocus = useCallback(() => {
        setZIndex(claimFloatingWindowZIndex());
    }, []);
    const selectClassName = "h-[26px] min-w-0 flex-1 rounded-[6px] border-0 bg-transparent px-[4px] text-[12px] font-medium text-white/95 outline-none";
    if (!mobilePreviewUiOpen || isInsideMobilePreviewFrame()) {
        return null;
    }
    return (_jsxs("div", { ref: rootRef, "data-fivepixels-interactive": "", "data-chrome": "mobile-preview-simulator", className: "fixed flex flex-col select-none", style: {
            left: resolvedPosition.left,
            top: resolvedPosition.top,
            zIndex,
            width: frameWidth,
            touchAction: "none",
            cursor: isDragging ? "grabbing" : undefined,
        }, onPointerDown: handleFocus, children: [_jsxs("header", { className: "mb-[10px] flex items-center gap-[6px] rounded-[10px] border border-white/10 bg-[rgba(48,48,52,0.82)] px-[10px] py-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-[18px]", style: { marginBottom: TOOLBAR_DEVICE_GAP }, onPointerDown: handleDragHandlePointerDown, children: [_jsxs("label", { className: "flex min-w-0 flex-1 items-center gap-[6px]", children: [_jsx("span", { className: "sr-only", children: messages.settings.mobilePreviewDeviceAriaLabel }), _jsx("select", { value: mobilePreviewDeviceId, onChange: (event) => setMobilePreviewDeviceId(event.target.value), onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.settings.mobilePreviewDeviceAriaLabel, className: selectClassName, children: MOBILE_PREVIEW_BRANDS.map((brand) => (_jsx("optgroup", { label: brand === "apple"
                                        ? messages.settings.devicePreviewBrandApple
                                        : brand === "samsung"
                                            ? messages.settings.devicePreviewBrandSamsung
                                            : messages.settings.devicePreviewBrandGoogle, children: getDevicePreviewPresetsByBrand(brand).map((option) => (_jsxs("option", { value: option.id, children: [option.label, " (", option.width, "\u00D7", option.height, ")"] }, option.id))) }, brand))) })] }), _jsx("button", { type: "button", onClick: toggleMobilePreviewOrientation, onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.settings.mobilePreviewRotateAriaLabel, title: messages.settings.mobilePreviewRotateLabel, className: "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] text-white/90 hover:bg-white/10", children: _jsx(ScreenRotateIcon, { className: "h-[16px] w-[16px]" }) }), _jsx("button", { type: "button", onClick: handleClose, onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.marker.windowCloseAriaLabel, className: "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] text-white/90 hover:bg-white/10", children: _jsx(CloseIcon, { className: "h-[14px] w-[14px]" }) })] }), _jsxs("div", { className: "relative", style: {
                    width: frameWidth,
                    height: frameHeight,
                    filter: "drop-shadow(0 28px 56px rgba(0, 0, 0, 0.42))",
                }, children: [_jsx("iframe", { ref: iframeRef, name: MOBILE_PREVIEW_FRAME_NAME, title: messages.settings.mobilePreviewIframeTitle, src: frameSrc, onLoad: handleFrameLoad, "data-fivepixels-mobile-preview-frame": "", className: "absolute z-[0] border-0", style: {
                            left: chrome.bezel.left,
                            top: chrome.bezel.top,
                            width: screenSize.width,
                            height: screenSize.height,
                            transform: `scale(${MOBILE_PREVIEW_SCALE})`,
                            transformOrigin: "top left",
                            borderRadius: chrome.screenRadius,
                            background: screenBackground,
                        } }), frameLoadState === "blocked" ? (_jsx("div", { className: "pointer-events-none absolute z-[1] flex items-center justify-center px-[12px] text-center text-[11px] font-semibold text-[var(--adaptive-black900)]", style: {
                            left: chrome.bezel.left,
                            top: chrome.bezel.top,
                            width: layout.width,
                            height: layout.height,
                            borderRadius: chrome.screenRadius,
                            background: screenBackground,
                        }, children: messages.settings.mobilePreviewIframeBlocked })) : null, _jsx("div", { className: "pointer-events-none absolute inset-0 z-[2]", "data-fivepixels-mobile-preview-stage": "", children: _jsx(DeviceFrameArtwork, { preset: mobilePreviewPreset, chrome: chrome, screenWidth: layout.width, screenHeight: layout.height }) }), _jsx("div", { className: "pointer-events-none absolute z-[3] overflow-hidden", style: {
                            left: chrome.bezel.left,
                            top: chrome.bezel.top,
                            width: layout.width,
                            height: layout.height,
                            borderRadius: chrome.screenRadius,
                        }, children: _jsx(DeviceStatusBar, { preset: mobilePreviewPreset, width: layout.width, appearance: statusBarAppearance, showCutout: true }) })] })] }));
}
//# sourceMappingURL=FloatingMobilePreview.js.map