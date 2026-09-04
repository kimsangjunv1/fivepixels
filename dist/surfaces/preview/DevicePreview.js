import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { getDevicePreviewLayoutSize, getDevicePreviewPreset, getEmptyBezel, scaleDeviceChrome } from "../../shared/constants/devicePreview.js";
import { DEVICE_PREVIEW_FRAME_NAME, DEVICE_PREVIEW_HOST_STYLE_ID, HTML_DEVICE_PREVIEW_ACTIVE_CLASS, buildDevicePreviewHostStyle, clearGuestStatusBarStyle, getGuestDocument, getGuestWindow, isGuestDocumentReady, isInsideDevicePreviewFrame, readGuestContentMetrics, syncGuestStatusBarStyle, } from "../../shared/utils/overlay/devicePreviewFrame.js";
import { clearPageDocumentBridge, notifyPageDocumentBridge, setPageDocumentBridge } from "../../shared/utils/overlay/pageDocumentBridge.js";
import { DeviceFrameArtwork } from "./DeviceFrameArtwork.js";
import { DeviceStatusBar, getDeviceStatusBarHeight } from "./DeviceStatusBar.js";
const FLOATING_BAR_RESERVE = 32;
const RULER_WIDTH = 44;
const RULER_GAP = 6;
const RULER_MAJOR_STEP = 100;
const RULER_MINOR_STEP = 50;
const LABEL_RESERVE = 34;
const DEVICE_PREVIEW_CANVAS_GRID = 16;
/** Host document (html/body) is outside ThemeScope — resolve token hex by appearance. */
const DEVICE_PREVIEW_HOST_CANVAS = {
    light: {
        background: "#f5f5f5", // --adaptive-black100
        line: "rgba(0, 0, 0, 0.04)",
        screen: "#ffffff", // --adaptive-background
    },
    dark: {
        background: "#1F2125",
        line: "rgba(255, 255, 255, 0.04)",
        screen: "#17171c", // --adaptive-background
    },
};
function buildDevicePreviewCanvasStyle(hostCanvas) {
    return {
        backgroundColor: hostCanvas.background,
        backgroundImage: `linear-gradient(${hostCanvas.line} 1px, transparent 1px), linear-gradient(90deg, ${hostCanvas.line} 1px, transparent 1px)`,
        backgroundSize: `${DEVICE_PREVIEW_CANVAS_GRID}px ${DEVICE_PREVIEW_CANVAS_GRID}px`,
        backgroundAttachment: "fixed",
    };
}
function buildRulerTicks(scrollY, clientHeight, scrollHeight) {
    const start = Math.floor(scrollY / RULER_MINOR_STEP) * RULER_MINOR_STEP;
    const end = Math.ceil((scrollY + clientHeight) / RULER_MINOR_STEP) * RULER_MINOR_STEP;
    const ticks = [];
    for (let documentY = Math.max(0, start); documentY <= Math.min(scrollHeight, end + RULER_MINOR_STEP); documentY += RULER_MINOR_STEP) {
        ticks.push({
            documentY,
            major: documentY % RULER_MAJOR_STEP === 0,
        });
    }
    return ticks;
}
function resolveCenteredLayout(args) {
    const { layoutWidth, layoutHeight, bezelTop, bezelRight, bezelBottom, bezelLeft, viewportWidth, viewportHeight, fitToViewport } = args;
    const availableWidth = Math.max(240, viewportWidth - 24);
    const availableHeight = Math.max(240, viewportHeight - FLOATING_BAR_RESERVE - LABEL_RESERVE);
    // Logical screen stays at the selected device × user scale — never shrink for the viewport.
    const screenWidth = Math.max(1, Math.round(layoutWidth));
    const screenHeight = Math.max(1, Math.round(layoutHeight));
    const bezel = {
        top: Math.max(0, Math.round(bezelTop)),
        right: Math.max(0, Math.round(bezelRight)),
        bottom: Math.max(0, Math.round(bezelBottom)),
        left: Math.max(0, Math.round(bezelLeft)),
    };
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    // Optional visual-only shrink; CSS size / container queries stay at the real device width.
    const fitScale = fitToViewport ? Math.min(1, availableWidth / frameWidth, availableHeight / frameHeight) : 1;
    const visualFrameWidth = frameWidth * fitScale;
    const visualFrameHeight = frameHeight * fitScale;
    const visualScreenWidth = screenWidth * fitScale;
    const visualScreenHeight = screenHeight * fitScale;
    const frameLeft = Math.round((viewportWidth - visualFrameWidth) / 2);
    const frameTop = Math.round((availableHeight - visualFrameHeight) / 2 + LABEL_RESERVE / 2);
    const screenLeft = frameLeft + bezel.left * fitScale;
    const screenTop = frameTop + bezel.top * fitScale;
    return {
        fitScale,
        screenWidth,
        screenHeight,
        visualScreenWidth,
        visualScreenHeight,
        frameWidth,
        frameHeight,
        visualFrameWidth,
        visualFrameHeight,
        frameLeft,
        frameTop,
        screenLeft,
        screenTop,
        bezel,
    };
}
export function DevicePreview() {
    const { devicePreviewUiOpen, devicePreviewDeviceId, devicePreviewScale, devicePreviewImageEnabled, devicePreviewFitToViewport, devicePreviewStatusBarEnabled, resolvedPanelAppearance, messages } = useReportPreferences();
    const { mode } = useReportSession();
    const isPreviewGuest = isInsideDevicePreviewFrame();
    const preset = useMemo(() => getDevicePreviewPreset(devicePreviewDeviceId), [devicePreviewDeviceId]);
    const layout = useMemo(() => getDevicePreviewLayoutSize(preset, devicePreviewScale), [preset, devicePreviewScale]);
    const chrome = useMemo(() => {
        if (!devicePreviewImageEnabled) {
            return {
                frameRadius: 0,
                screenRadius: 0,
                bezel: getEmptyBezel(),
            };
        }
        return scaleDeviceChrome(preset, devicePreviewScale);
    }, [devicePreviewImageEnabled, preset, devicePreviewScale]);
    const hostCanvas = DEVICE_PREVIEW_HOST_CANVAS[resolvedPanelAppearance === "dark" ? "dark" : "light"];
    const canvasStyle = useMemo(() => buildDevicePreviewCanvasStyle(hostCanvas), [hostCanvas]);
    const iframeRef = useRef(null);
    const [frameLoadState, setFrameLoadState] = useState("loading");
    const [frameSrc] = useState(() => (typeof window === "undefined" ? "" : window.location.href));
    const [metrics, setMetrics] = useState(() => typeof window === "undefined"
        ? {
            scrollY: 0,
            scrollHeight: 800,
            clientHeight: 800,
            left: 0,
            top: 0,
            width: 390,
            viewportWidth: 1280,
            viewportHeight: 800,
        }
        : readGuestContentMetrics(null, layout.width));
    const centered = useMemo(() => resolveCenteredLayout({
        layoutWidth: layout.width,
        layoutHeight: layout.height,
        bezelTop: chrome.bezel.top,
        bezelRight: chrome.bezel.right,
        bezelBottom: chrome.bezel.bottom,
        bezelLeft: chrome.bezel.left,
        viewportWidth: metrics.viewportWidth || (typeof window !== "undefined" ? window.innerWidth : 1280),
        viewportHeight: metrics.viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 800),
        fitToViewport: devicePreviewFitToViewport,
    }), [layout.width, layout.height, chrome.bezel, metrics.viewportWidth, metrics.viewportHeight, devicePreviewFitToViewport]);
    const statusBarHeight = useMemo(() => (devicePreviewStatusBarEnabled ? getDeviceStatusBarHeight(preset, centered.screenWidth) : 0), [devicePreviewStatusBarEnabled, preset, centered.screenWidth]);
    const handleFrameLoad = useCallback(() => {
        const iframe = iframeRef.current;
        if (!isGuestDocumentReady(iframe)) {
            setFrameLoadState("blocked");
            clearPageDocumentBridge();
            return;
        }
        setFrameLoadState("ready");
        setPageDocumentBridge({ iframe, fitScale: centered.fitScale });
        syncGuestStatusBarStyle(getGuestDocument(iframe), statusBarHeight);
        setMetrics(readGuestContentMetrics(iframe, centered.screenWidth));
        notifyPageDocumentBridge();
        iframe?.focus();
    }, [centered.fitScale, centered.screenWidth, statusBarHeight]);
    useEffect(() => {
        if (!devicePreviewUiOpen || frameLoadState !== "ready") {
            return;
        }
        setPageDocumentBridge({ iframe: iframeRef.current, fitScale: centered.fitScale });
    }, [centered.fitScale, devicePreviewUiOpen, frameLoadState]);
    useEffect(() => {
        if (!devicePreviewUiOpen || frameLoadState !== "ready") {
            return;
        }
        const guestWindow = getGuestWindow(iframeRef.current);
        if (!guestWindow) {
            return;
        }
        const notify = () => notifyPageDocumentBridge();
        const originalPushState = guestWindow.history.pushState.bind(guestWindow.history);
        const originalReplaceState = guestWindow.history.replaceState.bind(guestWindow.history);
        guestWindow.addEventListener("popstate", notify);
        guestWindow.history.pushState = (...args) => {
            originalPushState(...args);
            notify();
        };
        guestWindow.history.replaceState = (...args) => {
            originalReplaceState(...args);
            notify();
        };
        return () => {
            guestWindow.removeEventListener("popstate", notify);
            guestWindow.history.pushState = originalPushState;
            guestWindow.history.replaceState = originalReplaceState;
        };
    }, [devicePreviewUiOpen, frameLoadState, frameSrc]);
    useEffect(() => {
        if (!devicePreviewUiOpen) {
            clearPageDocumentBridge();
            document.documentElement.classList.remove(HTML_DEVICE_PREVIEW_ACTIVE_CLASS);
            document.getElementById(DEVICE_PREVIEW_HOST_STYLE_ID)?.remove();
            return;
        }
        document.documentElement.classList.add(HTML_DEVICE_PREVIEW_ACTIVE_CLASS);
        let style = document.getElementById(DEVICE_PREVIEW_HOST_STYLE_ID);
        if (!style) {
            style = document.createElement("style");
            style.id = DEVICE_PREVIEW_HOST_STYLE_ID;
            document.documentElement.append(style);
        }
        style.textContent = buildDevicePreviewHostStyle({
            background: hostCanvas.background,
            line: hostCanvas.line,
            gridSize: DEVICE_PREVIEW_CANVAS_GRID,
        });
        const sync = () => setMetrics(readGuestContentMetrics(iframeRef.current, centered.screenWidth));
        sync();
        requestAnimationFrame(sync);
        return () => {
            document.documentElement.classList.remove(HTML_DEVICE_PREVIEW_ACTIVE_CLASS);
            style?.remove();
            clearPageDocumentBridge();
        };
    }, [devicePreviewUiOpen, centered.screenWidth, hostCanvas.background, hostCanvas.line]);
    useEffect(() => {
        if (!devicePreviewUiOpen) {
            return;
        }
        const iframe = iframeRef.current;
        syncGuestStatusBarStyle(getGuestDocument(iframe), statusBarHeight);
        return () => {
            clearGuestStatusBarStyle(getGuestDocument(iframe));
        };
    }, [devicePreviewUiOpen, statusBarHeight, frameLoadState]);
    useEffect(() => {
        if (!devicePreviewUiOpen) {
            return;
        }
        const sync = () => setMetrics(readGuestContentMetrics(iframeRef.current, centered.screenWidth));
        const iframe = iframeRef.current;
        const guestWindow = getGuestWindow(iframe);
        guestWindow?.addEventListener("scroll", sync, { passive: true });
        guestWindow?.addEventListener("resize", sync);
        window.addEventListener("resize", sync);
        const resizeObserver = typeof ResizeObserver === "undefined" || !iframe ? null : new ResizeObserver(() => sync());
        if (iframe) {
            resizeObserver?.observe(iframe);
        }
        return () => {
            guestWindow?.removeEventListener("scroll", sync);
            guestWindow?.removeEventListener("resize", sync);
            window.removeEventListener("resize", sync);
            resizeObserver?.disconnect();
        };
    }, [devicePreviewUiOpen, centered.screenWidth, centered.screenHeight, frameLoadState]);
    if (!devicePreviewUiOpen || isPreviewGuest) {
        return null;
    }
    const screenLeft = metrics.left || centered.screenLeft;
    const screenTop = metrics.top || centered.screenTop;
    const screenWidth = centered.screenWidth;
    const screenHeight = centered.screenHeight;
    const visualScreenHeight = centered.visualScreenHeight;
    const frameLeft = centered.frameLeft;
    const frameTop = centered.frameTop;
    const ticks = buildRulerTicks(metrics.scrollY, metrics.clientHeight || screenHeight, Math.max(metrics.scrollHeight, screenHeight));
    const visualBezelLeft = centered.bezel.left * centered.fitScale;
    const actualFrameLeft = screenLeft - visualBezelLeft;
    const rulerLeft = actualFrameLeft >= RULER_WIDTH + RULER_GAP ? actualFrameLeft - RULER_WIDTH - RULER_GAP : Math.max(0, actualFrameLeft - RULER_WIDTH);
    const visualStatusBarHeight = statusBarHeight * centered.fitScale;
    const rulerTop = screenTop + visualStatusBarHeight;
    const rulerHeight = Math.max(0, visualScreenHeight - visualStatusBarHeight);
    const contentScrollY = Math.max(0, metrics.scrollY - statusBarHeight);
    const scrollLabel = messages.settings.devicePreviewScrollLabel(contentScrollY);
    const stageTransform = {
        transform: `scale(${centered.fitScale})`,
        transformOrigin: "top left",
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "pointer-events-none fixed inset-0 z-[999997]", "data-fivepixels-device-preview": "", children: [_jsx("div", { className: "absolute left-0 right-0 top-0", style: { ...canvasStyle, height: Math.max(0, frameTop) } }), _jsx("div", { className: "absolute bottom-0 left-0 right-0", style: { ...canvasStyle, top: frameTop + centered.visualFrameHeight } }), _jsx("div", { className: "absolute left-0", style: {
                        ...canvasStyle,
                        top: frameTop,
                        height: centered.visualFrameHeight,
                        width: Math.max(0, frameLeft),
                    } }), _jsx("div", { className: "absolute right-0", style: {
                        ...canvasStyle,
                        top: frameTop,
                        height: centered.visualFrameHeight,
                        width: Math.max(0, metrics.viewportWidth - frameLeft - centered.visualFrameWidth),
                    } }), _jsx("iframe", { ref: iframeRef, name: DEVICE_PREVIEW_FRAME_NAME, title: messages.settings.devicePreviewIframeTitle, src: frameSrc, onLoad: handleFrameLoad, "data-fivepixels-device-preview-frame": "", tabIndex: -1, className: `${mode === "report" ? "pointer-events-none" : "pointer-events-auto"} absolute z-[1] border-0`, style: {
                        left: centered.screenLeft,
                        top: centered.screenTop,
                        width: screenWidth,
                        height: screenHeight,
                        transform: `scale(${centered.fitScale})`,
                        transformOrigin: "top left",
                        borderRadius: devicePreviewImageEnabled ? chrome.screenRadius : 0,
                        background: hostCanvas.screen,
                        overflow: "hidden",
                    } }), frameLoadState === "blocked" ? (_jsx("div", { className: "pointer-events-none absolute z-[2] flex items-center justify-center px-[16px] text-center text-[12px] font-semibold text-[var(--adaptive-black900)]", style: {
                        left: centered.screenLeft,
                        top: centered.screenTop,
                        width: centered.visualScreenWidth,
                        height: centered.visualScreenHeight,
                    }, children: messages.settings.devicePreviewIframeBlocked })) : null, _jsxs("div", { className: "absolute z-[3]", "data-fivepixels-device-preview-stage": "", style: {
                        left: frameLeft,
                        top: frameTop,
                        width: centered.frameWidth,
                        height: centered.frameHeight,
                        ...stageTransform,
                    }, children: [devicePreviewImageEnabled ? (_jsx(DeviceFrameArtwork, { preset: preset, chrome: chrome, screenWidth: screenWidth, screenHeight: screenHeight })) : (_jsx("div", { className: "absolute border border-[var(--adaptive-border-subtle)] bg-transparent", "data-fivepixels-skip-capture": "", style: {
                                left: centered.bezel.left,
                                top: centered.bezel.top,
                                width: screenWidth,
                                height: screenHeight,
                            } })), devicePreviewStatusBarEnabled ? (_jsx("div", { className: "absolute z-[1] overflow-hidden", style: {
                                left: centered.bezel.left,
                                top: centered.bezel.top,
                                width: screenWidth,
                                height: screenHeight,
                                borderRadius: devicePreviewImageEnabled ? chrome.screenRadius : 0,
                            }, children: _jsx(DeviceStatusBar, { preset: preset, width: screenWidth, appearance: resolvedPanelAppearance === "dark" ? "dark" : "light", showCutout: devicePreviewImageEnabled }) })) : null] }), _jsxs("div", { className: "absolute overflow-hidden border-r border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] text-[var(--adaptive-black900)] backdrop-blur-[4px]", "data-fivepixels-skip-capture": "", style: { left: rulerLeft, top: rulerTop, width: RULER_WIDTH, height: rulerHeight, borderRadius: 6 }, children: [_jsx("div", { className: "absolute inset-x-0 top-0 z-[1] border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-neutralTintOpacity900)] px-[4px] py-[6px] text-center text-[12px] font-semibold leading-tight text-[var(--adaptive-black900)]", children: scrollLabel }), ticks.map((tick) => {
                            const top = (tick.documentY - metrics.scrollY - statusBarHeight) * centered.fitScale;
                            if (top < 0 || top > rulerHeight) {
                                return null;
                            }
                            const labelY = Math.max(0, tick.documentY - statusBarHeight);
                            return (_jsxs("div", { className: "absolute right-0 flex items-center", style: { top, height: 0 }, children: [_jsx("span", { className: `mr-[3px] text-[12px] tabular-nums ${tick.major ? "font-semibold text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black500)]"}`, children: tick.major ? labelY : "" }), _jsx("span", { className: `block bg-[var(--adaptive-black500)] ${tick.major ? "h-[1px] w-[12px]" : "h-[1px] w-[7px]"}` })] }, tick.documentY));
                        })] })] }) }));
}
//# sourceMappingURL=DevicePreview.js.map