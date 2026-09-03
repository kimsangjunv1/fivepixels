import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEVICE_PREVIEW_BRAND_ORDER, getDevicePreviewPresetsByBrand, getEmptyBezel, scaleDeviceChrome } from "../../constants/devicePreview.js";
import { CaptureIcon, QrCodeIcon, ScreenRotateIcon } from "../../components/icons/Icons.js";
import { useDraggableWindow } from "../../hooks/useDraggableWindow.js";
import { useMinimizedDockDragReorder } from "../../hooks/useMinimizedDockDragReorder.js";
import { useOverlayMinimizedDock } from "../../hooks/useOverlayMinimizedDock.js";
import { useReportPreferences } from "../../providers/reportContext.js";
import { DeviceFrameArtwork } from "./DeviceFrameArtwork.js";
import { DevicePreviewQrPanel } from "./DevicePreviewQrPanel.js";
import { DeviceStatusBar, getDeviceStatusBarHeight } from "./DeviceStatusBar.js";
import { MobilePreviewCaptureWindow } from "./MobilePreviewCaptureWindow.js";
import { MinimizedDockSimpleSubtitleRow, MinimizedDockWindowChrome } from "../../components/ui/window/MinimizedDockWindowChrome.js";
import { WINDOW_HEADER_BUTTON_CLASS, WindowModeControls } from "../../components/ui/window/WindowModeControls.js";
import { claimFloatingWindowZIndex } from "../../utils/overlay/floatingWindowStack.js";
import { syncGuestStatusBarStyle } from "../../utils/overlay/devicePreviewFrame.js";
import { buildDevicePreviewCaptureFilename, captureDevicePreview, defaultRasterizeElement, downloadCanvasPng, getDevicePreviewCaptureLayout, } from "../../utils/overlay/devicePreviewCapture.js";
import { MINIMIZED_WINDOW_HEIGHT } from "../../utils/overlay/minimizedDockLayout.js";
import { resolveMobilePreviewChrome, resolveMobilePreviewFrameMetrics, resolveMobilePreviewLayout, resolveMobilePreviewScreenSize, resolveMobilePreviewStatusBarReferenceWidth, } from "../../utils/overlay/mobilePreviewLayout.js";
import { MOBILE_PREVIEW_FRAME_NAME, getMobilePreviewCaptureRoot, getMobilePreviewGuestDocument, getMobilePreviewGuestWindow, isInsideMobilePreviewFrame, isMobilePreviewGuestDocumentReady, syncMobilePreviewGuestViewport, } from "../../utils/overlay/mobilePreviewFrame.js";
import { normalizeMobilePreviewUrl, persistMobilePreviewUrl, readMobilePreviewUrl } from "../../utils/overlay/mobilePreviewUrl.js";
const MOBILE_PREVIEW_WINDOW_ID = "mobile-preview";
const MOBILE_PREVIEW_POSITION_STORAGE_KEY = "fivepixels:mobile-preview-position:v1";
const MOBILE_PREVIEW_SCALE = 0.75;
const MOBILE_PREVIEW_BRANDS = DEVICE_PREVIEW_BRAND_ORDER.filter((brand) => brand !== "desktop");
const TOOLBAR_DEVICE_GAP = 10;
const TOOLBAR_CONTROLS_HEIGHT = 38;
const TOOLBAR_URL_ROW_HEIGHT = 28;
const TOOLBAR_INNER_GAP = 6;
const TOOLBAR_APPROX_HEIGHT = TOOLBAR_CONTROLS_HEIGHT + TOOLBAR_INNER_GAP + TOOLBAR_URL_ROW_HEIGHT;
const QR_PANEL_WIDTH = 220;
const QR_DEVICE_GAP = 16;
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
    const guestViewportSize = useMemo(() => resolveMobilePreviewScreenSize(mobilePreviewPreset, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const layout = useMemo(() => resolveMobilePreviewLayout(mobilePreviewPreset, MOBILE_PREVIEW_SCALE, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const portraitChrome = useMemo(() => scaleDeviceChrome(mobilePreviewPreset, MOBILE_PREVIEW_SCALE), [mobilePreviewPreset]);
    const deviceChrome = useMemo(() => resolveMobilePreviewChrome(portraitChrome, mobilePreviewOrientation), [mobilePreviewOrientation, portraitChrome]);
    const [captureWindowOpen, setCaptureWindowOpen] = useState(false);
    const [captureState, setCaptureState] = useState("idle");
    const [captureScale, setCaptureScale] = useState(1);
    const [captureImageEnabled, setCaptureImageEnabled] = useState(true);
    const [captureStatusBarEnabled, setCaptureStatusBarEnabled] = useState(true);
    const chrome = useMemo(() => captureImageEnabled
        ? deviceChrome
        : {
            frameRadius: 0,
            screenRadius: 0,
            bezel: getEmptyBezel(),
        }, [captureImageEnabled, deviceChrome]);
    const { frameWidth, frameHeight } = useMemo(() => resolveMobilePreviewFrameMetrics(layout, chrome.bezel), [chrome.bezel, layout]);
    const statusBarReferenceWidth = useMemo(() => resolveMobilePreviewStatusBarReferenceWidth(mobilePreviewPreset, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const statusBarHeight = useMemo(() => (captureStatusBarEnabled ? getDeviceStatusBarHeight(mobilePreviewPreset, layout.width, 1, statusBarReferenceWidth) : 0), [captureStatusBarEnabled, layout.width, mobilePreviewPreset, statusBarReferenceWidth]);
    const statusBarAppearance = resolvedPanelAppearance === "dark" ? "dark" : "light";
    const screenBackground = resolvedPanelAppearance === "dark" ? "#17171c" : "#ffffff";
    const [storedPosition] = useState(() => readMobilePreviewPosition());
    const [windowMode, setWindowMode] = useState("normal");
    const [zIndex, setZIndex] = useState(() => claimFloatingWindowZIndex());
    const [frameLoadState, setFrameLoadState] = useState("loading");
    const [frameSrc, setFrameSrc] = useState(() => (typeof window === "undefined" ? "" : readMobilePreviewUrl(window.location.href)));
    const [urlDraft, setUrlDraft] = useState(() => (typeof window === "undefined" ? "" : readMobilePreviewUrl(window.location.href)));
    const [qrPanelOpen, setQrPanelOpen] = useState(false);
    const rootRef = useRef(null);
    const iframeRef = useRef(null);
    const captureStageRef = useRef(null);
    const statusBarRef = useRef(null);
    const captureResetTimerRef = useRef(null);
    const isMinimized = windowMode === "minimized";
    const overlayDock = useOverlayMinimizedDock({
        windowId: MOBILE_PREVIEW_WINDOW_ID,
        enabled: mobilePreviewUiOpen,
        isMinimized,
        onMinimizedChange: (minimized) => setWindowMode(minimized ? "minimized" : "normal"),
    });
    const { dockMorph } = overlayDock;
    const showMinimizedChrome = isMinimized && dockMorph?.phase !== "restoring";
    const dockDrag = useMinimizedDockDragReorder({
        windowId: MOBILE_PREVIEW_WINDOW_ID,
        windowRef: rootRef,
        enabled: showMinimizedChrome && overlayDock.dockCount >= 2,
        blockDrag: dockMorph !== null,
        minimizedWidth: overlayDock.minimizedWidth,
        dockPosition: overlayDock.dockPosition,
        dockRegion: overlayDock.dockRegion,
    });
    const isDockDragging = dockDrag.isDockDragging;
    const { position: dragPosition, isDragging, handleDragHandlePointerDown, } = useDraggableWindow({
        enabled: mobilePreviewUiOpen && windowMode === "normal" && dockMorph === null,
        windowRef: rootRef,
    });
    const restoredPosition = dragPosition ?? storedPosition;
    useEffect(() => {
        if (!dragPosition || windowMode !== "normal") {
            return;
        }
        persistMobilePreviewPosition(dragPosition);
    }, [dragPosition, windowMode]);
    useEffect(() => {
        if (!mobilePreviewUiOpen) {
            setQrPanelOpen(false);
            setCaptureWindowOpen(false);
        }
    }, [mobilePreviewUiOpen]);
    useEffect(() => {
        return () => {
            if (captureResetTimerRef.current !== null) {
                window.clearTimeout(captureResetTimerRef.current);
            }
        };
    }, []);
    const contentWidth = qrPanelOpen ? frameWidth + QR_DEVICE_GAP + QR_PANEL_WIDTH : frameWidth;
    useEffect(() => {
        if (frameLoadState !== "ready") {
            return;
        }
        syncGuestViewport(iframeRef.current, guestViewportSize.width, statusBarHeight);
    }, [frameLoadState, guestViewportSize.width, statusBarHeight]);
    const handleClose = useCallback(() => {
        setWindowMode("normal");
        setMobilePreviewUiOpen(false);
    }, [setMobilePreviewUiOpen]);
    const handleToggleMinimize = useCallback(() => {
        if (dockMorph) {
            return;
        }
        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        if (windowMode === "minimized") {
            overlayDock.restoreFromDock({
                left: restoredPosition.left,
                top: restoredPosition.top,
                width: contentWidth,
                height: TOOLBAR_DEVICE_GAP + TOOLBAR_APPROX_HEIGHT + frameHeight,
            });
            return;
        }
        overlayDock.minimizeToDock({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
        });
    }, [contentWidth, dockMorph, frameHeight, overlayDock, restoredPosition.left, restoredPosition.top, windowMode]);
    const handleFrameLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!isMobilePreviewGuestDocumentReady(iframe)) {
            setFrameLoadState("blocked");
            return;
        }
        syncGuestViewport(iframe, guestViewportSize.width, statusBarHeight);
        setFrameLoadState("ready");
    }, [guestViewportSize.width, statusBarHeight]);
    const handleFocus = useCallback(() => {
        setZIndex(claimFloatingWindowZIndex());
    }, []);
    const handleCapture = useCallback(async () => {
        if (captureState === "capturing" || frameLoadState !== "ready") {
            return;
        }
        const contentRoot = getMobilePreviewCaptureRoot(iframeRef.current);
        if (captureResetTimerRef.current !== null) {
            window.clearTimeout(captureResetTimerRef.current);
            captureResetTimerRef.current = null;
        }
        setCaptureState("capturing");
        try {
            if (!contentRoot) {
                throw new Error("Mobile preview content is missing.");
            }
            const screenWidth = Math.max(1, Math.round(guestViewportSize.width * captureScale));
            const screenHeight = Math.max(1, Math.round(guestViewportSize.height * captureScale));
            const scaledChrome = resolveMobilePreviewChrome(scaleDeviceChrome(mobilePreviewPreset, captureScale), mobilePreviewOrientation);
            const captureLayout = getDevicePreviewCaptureLayout({
                screenWidth,
                screenHeight,
                bezel: captureImageEnabled ? scaledChrome.bezel : getEmptyBezel(),
                deviceImageEnabled: captureImageEnabled,
            });
            const canvas = await captureDevicePreview({
                contentRoot,
                chromeStage: captureStageRef.current,
                statusBarLayer: statusBarRef.current,
                deviceImageEnabled: captureImageEnabled,
                statusBarEnabled: captureStatusBarEnabled,
                layout: captureLayout,
                background: screenBackground,
                rasterize: async (element, options) => {
                    if (element === contentRoot) {
                        return defaultRasterizeElement(element, {
                            ...options,
                            width: guestViewportSize.width,
                            height: guestViewportSize.height,
                            cropToViewport: true,
                        });
                    }
                    if (element === captureStageRef.current) {
                        return defaultRasterizeElement(element, {
                            ...options,
                            width: frameWidth,
                            height: frameHeight,
                            cropToViewport: false,
                        });
                    }
                    if (element === statusBarRef.current) {
                        return defaultRasterizeElement(element, {
                            ...options,
                            width: layout.width,
                            height: layout.height,
                            cropToViewport: false,
                        });
                    }
                    return defaultRasterizeElement(element, options);
                },
            });
            await downloadCanvasPng(canvas, buildDevicePreviewCaptureFilename({
                deviceId: mobilePreviewPreset.id,
                width: screenWidth,
                height: screenHeight,
            }));
            setCaptureState("saved");
        }
        catch {
            setCaptureState("failed");
        }
        finally {
            captureResetTimerRef.current = window.setTimeout(() => {
                setCaptureState("idle");
                captureResetTimerRef.current = null;
            }, 1600);
        }
    }, [
        captureImageEnabled,
        captureScale,
        captureState,
        captureStatusBarEnabled,
        frameHeight,
        frameLoadState,
        frameWidth,
        guestViewportSize.height,
        guestViewportSize.width,
        layout.height,
        layout.width,
        mobilePreviewOrientation,
        mobilePreviewPreset,
        screenBackground,
    ]);
    const navigatePreviewUrl = useCallback((rawInput) => {
        if (typeof window === "undefined") {
            return;
        }
        const nextUrl = normalizeMobilePreviewUrl(rawInput, window.location.href);
        if (!nextUrl || nextUrl === frameSrc) {
            if (nextUrl) {
                setUrlDraft(nextUrl);
            }
            return;
        }
        setFrameLoadState("loading");
        setFrameSrc(nextUrl);
        setUrlDraft(nextUrl);
        persistMobilePreviewUrl(nextUrl);
    }, [frameSrc]);
    const handleUrlSubmit = useCallback((event) => {
        event.preventDefault();
        navigatePreviewUrl(urlDraft);
    }, [navigatePreviewUrl, urlDraft]);
    const handleRootPointerDown = useCallback((event) => {
        handleFocus();
        if (showMinimizedChrome) {
            dockDrag.handleMinimizedDockPointerDown(event);
        }
    }, [dockDrag, handleFocus, showMinimizedChrome]);
    const selectClassName = "h-[26px] min-w-0 flex-1 rounded-[6px] border-0 bg-transparent px-[4px] font-[14px] text-[var(--adaptive-black600)] outline-none";
    const urlInputClassName = "h-[24px] min-w-0 flex-1 rounded-[6px] border-0 bg-[var(--adaptive-fillOpacity500)] px-[8px] font-[12px] text-[var(--adaptive-black600)] outline-none";
    const displayRect = useMemo(() => {
        if (dockMorph) {
            return dockMorph;
        }
        if (showMinimizedChrome) {
            return {
                left: dockDrag.displayLeft,
                top: dockDrag.displayTop,
                width: overlayDock.minimizedWidth,
                height: MINIMIZED_WINDOW_HEIGHT,
            };
        }
        return {
            left: restoredPosition.left,
            top: restoredPosition.top,
            width: contentWidth,
            height: undefined,
        };
    }, [contentWidth, dockDrag.displayLeft, dockDrag.displayTop, dockMorph, overlayDock.minimizedWidth, restoredPosition.left, restoredPosition.top, showMinimizedChrome]);
    const qrPanelMessages = useMemo(() => ({
        title: messages.settings.devicePreviewQrTitle,
        hintLocalhost: messages.settings.devicePreviewQrHintLocalhost,
        urlInputLabel: messages.settings.devicePreviewQrUrlInputLabel,
        urlInputPlaceholder: messages.settings.devicePreviewQrUrlInputPlaceholder,
        urlInputAriaLabel: messages.settings.devicePreviewQrUrlInputAriaLabel,
        invalidUrlMessage: messages.settings.devicePreviewQrInvalidUrl,
        emptyUrlMessage: messages.settings.devicePreviewQrEmptyUrl,
        copyLabel: messages.settings.devicePreviewQrCopyLabel,
        copiedLabel: messages.settings.devicePreviewQrCopiedLabel,
        copyAriaLabel: messages.settings.devicePreviewQrCopyAriaLabel,
        qrAriaLabel: messages.settings.devicePreviewQrAriaLabel,
    }), [messages.settings]);
    if (!mobilePreviewUiOpen || isInsideMobilePreviewFrame()) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: rootRef, "data-fivepixels-interactive": "", "data-chrome": "mobile-preview-simulator", "data-mode": windowMode, "data-orientation": mobilePreviewOrientation, className: `fixed select-none ${showMinimizedChrome ? "" : "flex flex-col items-start"}`, style: {
                    left: displayRect.left,
                    top: displayRect.top,
                    zIndex: isDockDragging ? zIndex + 100 : zIndex,
                    width: displayRect.width,
                    height: displayRect.height,
                    transition: overlayDock.layoutTransition,
                    touchAction: "none",
                    cursor: isDragging || isDockDragging ? "grabbing" : undefined,
                    ...(isDockDragging ? { transform: "scale(1.03)", willChange: "left, top, transform" } : null),
                }, onPointerDown: handleRootPointerDown, children: showMinimizedChrome ? (_jsx(MinimizedDockWindowChrome, { badgeLabel: messages.panel.mobilePreview, badgeValue: mobilePreviewPreset.label, restoreAriaLabel: messages.marker.windowRestoreAriaLabel, restoreTitle: messages.marker.windowRestoreAriaLabel, onRestore: handleToggleMinimize, restoreDisabled: dockMorph !== null, closeAriaLabel: messages.marker.windowCloseAriaLabel, closeTitle: messages.marker.windowCloseAriaLabel, onClose: handleClose, closeDisabled: dockMorph !== null || isDockDragging, dockCount: overlayDock.dockCount, isDockDragging: isDockDragging, onPointerDown: dockDrag.handleMinimizedDockPointerDown, onClickCapture: dockDrag.handleMinimizedDockClickCapture, children: _jsx(MinimizedDockSimpleSubtitleRow, { label: mobilePreviewPreset.label, onRestore: handleToggleMinimize, restoreDisabled: dockMorph !== null, restoreAriaLabel: messages.marker.windowRestoreAriaLabel }) })) : (_jsxs(_Fragment, { children: [_jsxs("header", { className: "mb-[10px] flex w-full min-w-0 flex-col gap-[6px] rounded-[12px] bg-[var(--adaptive-fillOpacity700)] px-[10px] py-[6px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px]", style: { marginBottom: TOOLBAR_DEVICE_GAP, width: frameWidth, maxWidth: "100%" }, onPointerDown: handleDragHandlePointerDown, children: [_jsxs("div", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsxs("label", { className: "flex min-w-0 flex-1 items-center gap-[6px]", children: [_jsx("span", { className: "sr-only", children: messages.settings.mobilePreviewDeviceAriaLabel }), _jsx("select", { value: mobilePreviewDeviceId, onChange: (event) => setMobilePreviewDeviceId(event.target.value), onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.settings.mobilePreviewDeviceAriaLabel, className: selectClassName, children: MOBILE_PREVIEW_BRANDS.map((brand) => (_jsx("optgroup", { label: brand === "apple"
                                                            ? messages.settings.devicePreviewBrandApple
                                                            : brand === "samsung"
                                                                ? messages.settings.devicePreviewBrandSamsung
                                                                : messages.settings.devicePreviewBrandGoogle, children: getDevicePreviewPresetsByBrand(brand).map((option) => (_jsxs("option", { value: option.id, children: [option.label, " (", option.width, "\u00D7", option.height, ")"] }, option.id))) }, brand))) })] }), _jsx("button", { type: "button", onClick: () => setCaptureWindowOpen((open) => !open), onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.settings.mobilePreviewCaptureOpenAriaLabel, title: messages.settings.mobilePreviewCaptureOpenLabel, "aria-pressed": captureWindowOpen, className: WINDOW_HEADER_BUTTON_CLASS, children: _jsx(CaptureIcon, { className: "h-[16px] w-[16px]" }) }), _jsx("button", { type: "button", onClick: () => setQrPanelOpen((open) => !open), onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.settings.mobilePreviewQrOpenAriaLabel, title: messages.settings.mobilePreviewQrOpenLabel, "aria-pressed": qrPanelOpen, className: WINDOW_HEADER_BUTTON_CLASS, children: _jsx(QrCodeIcon, { className: "h-[16px] w-[16px]" }) }), _jsx("button", { type: "button", onClick: toggleMobilePreviewOrientation, onPointerDown: (event) => event.stopPropagation(), "aria-label": messages.settings.mobilePreviewRotateAriaLabel, title: messages.settings.mobilePreviewRotateLabel, className: WINDOW_HEADER_BUTTON_CLASS, children: _jsx(ScreenRotateIcon, { className: "h-[16px] w-[16px]" }) }), _jsx("div", { className: "flex shrink-0 items-center gap-[2px]", children: _jsx(WindowModeControls, { closeAriaLabel: messages.marker.windowCloseAriaLabel, minimizeAriaLabel: isMinimized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMinimizeAriaLabel, maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel, showMaximize: false, isMaximized: false, onClose: handleClose, onMinimize: handleToggleMinimize }) })] }), _jsxs("form", { className: "flex min-w-0 items-center gap-[6px]", onSubmit: handleUrlSubmit, onPointerDown: (event) => event.stopPropagation(), children: [_jsxs("label", { className: "flex min-w-0 flex-1 items-center", children: [_jsx("span", { className: "sr-only", children: messages.settings.mobilePreviewUrlAriaLabel }), _jsx("input", { type: "text", value: urlDraft, onChange: (event) => setUrlDraft(event.target.value), placeholder: messages.settings.mobilePreviewUrlPlaceholder, "aria-label": messages.settings.mobilePreviewUrlAriaLabel, className: urlInputClassName, spellCheck: false, autoCapitalize: "off", autoCorrect: "off" })] }), _jsx("button", { type: "submit", className: "h-[24px] shrink-0 rounded-[6px] bg-[var(--adaptive-fillOpacity500)] px-[10px] text-[12px] font-semibold text-[var(--adaptive-black600)]", children: messages.settings.mobilePreviewUrlGoLabel })] })] }), _jsxs("div", { className: "relative shrink-0 overflow-visible", style: {
                                width: contentWidth,
                                height: frameHeight,
                            }, children: [_jsxs("div", { className: "relative shrink-0", style: {
                                        width: frameWidth,
                                        height: frameHeight,
                                        filter: "drop-shadow(0 28px 56px rgba(0, 0, 0, 0.42))",
                                    }, children: [_jsx("iframe", { ref: iframeRef, name: MOBILE_PREVIEW_FRAME_NAME, title: messages.settings.mobilePreviewIframeTitle, src: frameSrc, onLoad: handleFrameLoad, "data-fivepixels-mobile-preview-frame": "", className: "absolute z-[0] border-0", style: {
                                                left: chrome.bezel.left,
                                                top: chrome.bezel.top,
                                                width: guestViewportSize.width,
                                                height: guestViewportSize.height,
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
                                            }, children: messages.settings.mobilePreviewIframeBlocked })) : null, _jsxs("div", { ref: captureStageRef, className: "pointer-events-none absolute inset-0 z-[2]", children: [captureImageEnabled ? (_jsx("div", { "data-fivepixels-mobile-preview-stage": "", children: _jsx(DeviceFrameArtwork, { preset: mobilePreviewPreset, chrome: chrome, screenWidth: layout.width, screenHeight: layout.height, orientation: mobilePreviewOrientation }) })) : null, captureStatusBarEnabled ? (_jsx("div", { ref: statusBarRef, className: `pointer-events-none absolute z-[1] ${mobilePreviewOrientation === "landscape" ? "overflow-visible" : "overflow-hidden"}`, style: {
                                                        left: chrome.bezel.left,
                                                        top: chrome.bezel.top,
                                                        width: layout.width,
                                                        height: layout.height,
                                                        borderRadius: captureImageEnabled ? chrome.screenRadius : 0,
                                                    }, children: _jsx(DeviceStatusBar, { preset: mobilePreviewPreset, width: layout.width, screenHeight: layout.height, appearance: statusBarAppearance, showCutout: captureImageEnabled, orientation: mobilePreviewOrientation, referenceLogicalWidth: statusBarReferenceWidth }) })) : null] })] }), qrPanelOpen ? (_jsx("div", { className: "z-[1000]", 
                                    // className="px-[10px] py-[6px] bg-[var(--adaptive-fillOpacity700)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px] rounded-[12px] z-[1000]"
                                    style: { position: "absolute", top: "50%", left: frameWidth + QR_DEVICE_GAP, transform: "translateY(-50%)" }, onPointerDown: (event) => event.stopPropagation(), children: _jsx(DevicePreviewQrPanel, { ...qrPanelMessages, pageHref: frameSrc, width: QR_PANEL_WIDTH }) })) : null] })] })) }), captureWindowOpen ? (_jsx(MobilePreviewCaptureWindow, { captureState: captureState, captureScale: captureScale, captureImageEnabled: captureImageEnabled, captureStatusBarEnabled: captureStatusBarEnabled, onCaptureScaleChange: setCaptureScale, onCaptureImageEnabledChange: setCaptureImageEnabled, onCaptureStatusBarEnabledChange: setCaptureStatusBarEnabled, onCapture: () => void handleCapture(), onClose: () => setCaptureWindowOpen(false) })) : null] }));
}
//# sourceMappingURL=FloatingMobilePreview.js.map