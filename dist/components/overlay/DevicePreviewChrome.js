import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useReportPreferences } from "../../providers/reportContext.js";
import { DEVICE_PREVIEW_BRAND_ORDER, DEVICE_PREVIEW_SCALE_OPTIONS, formatDevicePreviewScale, getDevicePreviewLayoutSize, getDevicePreviewPreset, getDevicePreviewPresetsByBrand, getEmptyBezel, scaleDeviceChrome, } from "../../constants/devicePreview.js";
import { PanelOptionSwitch } from "../../components/panel/PanelOptionSwitch.js";
import { DeviceFrameArtwork } from "./DeviceFrameArtwork.js";
import { DeviceStatusBar, getDeviceStatusBarHeight } from "./DeviceStatusBar.js";
const HOST_STYLE_ID = "fivepixels-device-preview-host-style";
const HTML_ACTIVE_CLASS = "fivepixels-device-preview-active";
const RULER_WIDTH = 44;
const RULER_MAJOR_STEP = 100;
const RULER_MINOR_STEP = 50;
const FLOATING_BAR_RESERVE = 88;
const LABEL_RESERVE = 34;
function getPreviewContentRoot() {
    if (typeof document === "undefined") {
        return null;
    }
    return document.getElementById("root");
}
function readContentMetrics(fallbackWidth) {
    const root = getPreviewContentRoot();
    const rect = root?.getBoundingClientRect();
    return {
        scrollY: Math.round(root?.scrollTop ?? 0),
        scrollHeight: Math.round(root?.scrollHeight ?? 0),
        clientHeight: Math.round(root?.clientHeight ?? 0),
        left: Math.round(rect?.left ?? Math.max(0, (window.innerWidth - fallbackWidth) / 2)),
        top: Math.round(rect?.top ?? 0),
        width: Math.round(rect?.width ?? Math.min(fallbackWidth, window.innerWidth)),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
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
    const { layoutWidth, layoutHeight, bezelTop, bezelRight, bezelBottom, bezelLeft, viewportWidth, viewportHeight } = args;
    const availableWidth = Math.max(240, viewportWidth - 24);
    const availableHeight = Math.max(240, viewportHeight - FLOATING_BAR_RESERVE - LABEL_RESERVE);
    const idealFrameWidth = layoutWidth + bezelLeft + bezelRight;
    const idealFrameHeight = layoutHeight + bezelTop + bezelBottom;
    const fitScale = Math.min(1, availableWidth / idealFrameWidth, availableHeight / idealFrameHeight);
    const screenWidth = Math.max(1, Math.round(layoutWidth * fitScale));
    const screenHeight = Math.max(1, Math.round(layoutHeight * fitScale));
    const scaledBezel = {
        top: Math.round(bezelTop * fitScale),
        right: Math.round(bezelRight * fitScale),
        bottom: Math.round(bezelBottom * fitScale),
        left: Math.round(bezelLeft * fitScale),
    };
    const frameWidth = screenWidth + scaledBezel.left + scaledBezel.right;
    const frameHeight = screenHeight + scaledBezel.top + scaledBezel.bottom;
    const frameLeft = Math.round((viewportWidth - frameWidth) / 2);
    const frameTop = Math.round((availableHeight - frameHeight) / 2 + LABEL_RESERVE / 2);
    const screenLeft = frameLeft + scaledBezel.left;
    const screenTop = frameTop + scaledBezel.top;
    return {
        fitScale,
        screenWidth,
        screenHeight,
        frameWidth,
        frameHeight,
        frameLeft,
        frameTop,
        screenLeft,
        screenTop,
        bezel: scaledBezel,
    };
}
function clearRootInlineStyles(root) {
    const props = [
        "max-width",
        "width",
        "height",
        "max-height",
        "min-height",
        "margin",
        "margin-top",
        "margin-left",
        "margin-right",
        "margin-bottom",
        "overflow",
        "overflow-x",
        "overflow-y",
        "overscroll-behavior",
        "container-type",
        "container-name",
        "background",
        "position",
        "z-index",
        "box-sizing",
        "padding",
        "padding-top",
        "border-radius",
    ];
    for (const prop of props) {
        root.style.removeProperty(prop);
    }
}
function DevicePreviewFloatingBar() {
    const { messages, devicePreviewDeviceId, setDevicePreviewDeviceId, devicePreviewScale, setDevicePreviewScale, devicePreviewImageEnabled, setDevicePreviewImageEnabled, } = useReportPreferences();
    const selectClassName = "h-[30px] min-w-[148px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[11px] font-semibold text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]";
    return (_jsxs("div", { "data-fivepixels-interactive": "", className: "pointer-events-auto fixed z-[1000002] flex items-center gap-[10px] rounded-[14px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]/95 px-[12px] py-[10px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[8px]", style: {
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
        }, role: "toolbar", "aria-label": messages.settings.devicePreviewFloatingAriaLabel, children: [_jsxs("label", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewDeviceLabel }), _jsx("select", { value: devicePreviewDeviceId, onChange: (event) => setDevicePreviewDeviceId(event.target.value), "aria-label": messages.settings.devicePreviewDeviceAriaLabel, className: selectClassName, children: DEVICE_PREVIEW_BRAND_ORDER.map((brand) => (_jsx("optgroup", { label: brand === "apple"
                                ? messages.settings.devicePreviewBrandApple
                                : brand === "samsung"
                                    ? messages.settings.devicePreviewBrandSamsung
                                    : brand === "google"
                                        ? messages.settings.devicePreviewBrandGoogle
                                        : messages.settings.devicePreviewBrandDesktop, children: getDevicePreviewPresetsByBrand(brand).map((option) => (_jsxs("option", { value: option.id, children: [option.label, " (", option.width, "\u00D7", option.height, ")"] }, option.id))) }, brand))) })] }), _jsxs("label", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewScaleLabel }), _jsx("select", { value: String(devicePreviewScale), onChange: (event) => setDevicePreviewScale(Number(event.target.value)), "aria-label": messages.settings.devicePreviewScaleAriaLabel, className: `${selectClassName} min-w-[88px]`, children: DEVICE_PREVIEW_SCALE_OPTIONS.map((scale) => (_jsx("option", { value: String(scale), children: formatDevicePreviewScale(scale) }, scale))) })] }), _jsxs("div", { className: "flex min-w-[132px] flex-col gap-[3px]", children: [_jsx("span", { className: "text-[9px] font-semibold text-[var(--adaptive-black500)]", children: messages.settings.devicePreviewImageLabel }), _jsx(PanelOptionSwitch, { options: [
                            { value: "off", label: messages.settings.devicePreviewImageOff },
                            { value: "on", label: messages.settings.devicePreviewImageOn },
                        ], value: devicePreviewImageEnabled ? "on" : "off", onChange: (value) => setDevicePreviewImageEnabled(value === "on"), ariaLabel: messages.settings.devicePreviewImageAriaLabel })] })] }));
}
export function DevicePreviewChrome() {
    const { devicePreviewUiOpen, devicePreviewDeviceId, devicePreviewScale, devicePreviewImageEnabled, resolvedPanelAppearance, messages, } = useReportPreferences();
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
        : readContentMetrics(layout.width));
    const centered = useMemo(() => resolveCenteredLayout({
        layoutWidth: layout.width,
        layoutHeight: layout.height,
        bezelTop: chrome.bezel.top,
        bezelRight: chrome.bezel.right,
        bezelBottom: chrome.bezel.bottom,
        bezelLeft: chrome.bezel.left,
        viewportWidth: metrics.viewportWidth || (typeof window !== "undefined" ? window.innerWidth : 1280),
        viewportHeight: metrics.viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 800),
    }), [layout.width, layout.height, chrome.bezel, metrics.viewportWidth, metrics.viewportHeight]);
    useEffect(() => {
        if (!devicePreviewUiOpen) {
            document.documentElement.classList.remove(HTML_ACTIVE_CLASS);
            document.getElementById(HOST_STYLE_ID)?.remove();
            const root = getPreviewContentRoot();
            if (root) {
                clearRootInlineStyles(root);
            }
            return;
        }
        document.documentElement.classList.add(HTML_ACTIVE_CLASS);
        let style = document.getElementById(HOST_STYLE_ID);
        if (!style) {
            style = document.createElement("style");
            style.id = HOST_STYLE_ID;
            document.documentElement.append(style);
        }
        style.textContent = `
html.${HTML_ACTIVE_CLASS},
html.${HTML_ACTIVE_CLASS} body {
  height: 100% !important;
  max-height: 100% !important;
  overflow: hidden !important;
  background: #0C141C !important;
}

html.${HTML_ACTIVE_CLASS} #fivepixels-root {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  pointer-events: none !important;
  z-index: 2147483646 !important;
}

html.${HTML_ACTIVE_CLASS} #root .pulse-board,
html.${HTML_ACTIVE_CLASS} #root .pulse-sidebar,
html.${HTML_ACTIVE_CLASS} #root .pulse-main {
  height: auto !important;
  min-height: 100% !important;
  max-height: none !important;
  overflow: visible !important;
}

html.${HTML_ACTIVE_CLASS} #root .pulse-content {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  flex: none !important;
}
`;
        const root = getPreviewContentRoot();
        const statusBarHeight = getDeviceStatusBarHeight(preset, centered.screenWidth);
        if (root) {
            // Keep container-query width at logical device width (not fit-scaled),
            // while the visible box matches the centered screen hole.
            root.style.setProperty("max-width", `${centered.screenWidth}px`, "important");
            root.style.setProperty("width", `${centered.screenWidth}px`, "important");
            root.style.setProperty("height", `${centered.screenHeight}px`, "important");
            root.style.setProperty("max-height", `${centered.screenHeight}px`, "important");
            root.style.setProperty("min-height", "0px", "important");
            root.style.setProperty("margin-left", `${centered.screenLeft}px`, "important");
            root.style.setProperty("margin-right", "0", "important");
            root.style.setProperty("margin-top", `${centered.screenTop}px`, "important");
            root.style.setProperty("margin-bottom", "0", "important");
            root.style.setProperty("padding-top", `${statusBarHeight}px`, "important");
            root.style.setProperty("overflow-x", "hidden", "important");
            root.style.setProperty("overflow-y", "auto", "important");
            root.style.setProperty("overscroll-behavior", "contain", "important");
            root.style.setProperty("container-type", "inline-size", "important");
            root.style.setProperty("container-name", "fivepixels-device-preview", "important");
            root.style.setProperty("background", "#ffffff", "important");
            root.style.setProperty("position", "relative", "important");
            root.style.setProperty("z-index", "0", "important");
            root.style.setProperty("box-sizing", "border-box", "important");
            root.style.setProperty("border-radius", devicePreviewImageEnabled ? `${Math.max(0, Math.round(chrome.screenRadius * centered.fitScale))}px` : "0px", "important");
        }
        const sync = () => setMetrics(readContentMetrics(centered.screenWidth));
        sync();
        requestAnimationFrame(sync);
        return () => {
            document.documentElement.classList.remove(HTML_ACTIVE_CLASS);
            style?.remove();
            if (root) {
                clearRootInlineStyles(root);
            }
        };
    }, [
        devicePreviewUiOpen,
        devicePreviewImageEnabled,
        centered.screenWidth,
        centered.screenHeight,
        centered.screenLeft,
        centered.screenTop,
        centered.fitScale,
        chrome.screenRadius,
        preset,
    ]);
    useEffect(() => {
        if (!devicePreviewUiOpen) {
            return;
        }
        const sync = () => setMetrics(readContentMetrics(centered.screenWidth));
        const root = getPreviewContentRoot();
        root?.addEventListener("scroll", sync, { passive: true });
        window.addEventListener("resize", sync);
        const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => sync());
        if (root) {
            resizeObserver?.observe(root);
        }
        return () => {
            root?.removeEventListener("scroll", sync);
            window.removeEventListener("resize", sync);
            resizeObserver?.disconnect();
        };
    }, [devicePreviewUiOpen, centered.screenWidth, centered.screenHeight]);
    if (!devicePreviewUiOpen) {
        return null;
    }
    const screenLeft = metrics.left || centered.screenLeft;
    const screenTop = metrics.top || centered.screenTop;
    const screenWidth = centered.screenWidth;
    const screenHeight = centered.screenHeight;
    const frameLeft = screenLeft - centered.bezel.left;
    const frameTop = screenTop - centered.bezel.top;
    const fittedChrome = {
        ...chrome,
        frameRadius: Math.round(chrome.frameRadius * centered.fitScale),
        screenRadius: Math.round(chrome.screenRadius * centered.fitScale),
        bezel: centered.bezel,
    };
    const ticks = buildRulerTicks(metrics.scrollY, screenHeight, Math.max(metrics.scrollHeight, screenHeight));
    const rulerLeft = screenLeft >= RULER_WIDTH + 8 ? screenLeft - RULER_WIDTH : Math.max(0, screenLeft - 4);
    const sizeLabel = `${preset.label} · ${preset.width}×${preset.height} · ${formatDevicePreviewScale(devicePreviewScale)}`;
    const scrollLabel = messages.settings.devicePreviewScrollLabel(metrics.scrollY);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "pointer-events-none fixed inset-0 z-[999997]", "aria-hidden": true, "data-fivepixels-device-preview": "", children: [_jsx("div", { className: "absolute left-0 right-0 top-0 bg-[#0C141C]", style: { height: Math.max(0, frameTop) } }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-[#0C141C]", style: { top: frameTop + centered.frameHeight } }), _jsx("div", { className: "absolute left-0 bg-[#0C141C]", style: { top: frameTop, height: centered.frameHeight, width: Math.max(0, frameLeft) } }), _jsx("div", { className: "absolute right-0 bg-[#0C141C]", style: {
                            top: frameTop,
                            height: centered.frameHeight,
                            width: Math.max(0, metrics.viewportWidth - frameLeft - centered.frameWidth),
                        } }), devicePreviewImageEnabled ? (_jsx("div", { className: "absolute z-[3]", style: { left: frameLeft, top: frameTop }, children: _jsx(DeviceFrameArtwork, { preset: preset, chrome: fittedChrome, screenWidth: screenWidth, screenHeight: screenHeight }) })) : (_jsx("div", { className: "absolute z-[3] border border-white/20 bg-transparent", style: {
                            left: screenLeft,
                            top: screenTop,
                            width: screenWidth,
                            height: screenHeight,
                        } })), _jsx("div", { className: "absolute z-[2] overflow-hidden", style: {
                            left: screenLeft,
                            top: screenTop,
                            width: screenWidth,
                            height: screenHeight,
                            borderRadius: devicePreviewImageEnabled ? fittedChrome.screenRadius : 0,
                        }, children: _jsx(DeviceStatusBar, { preset: preset, width: screenWidth, appearance: resolvedPanelAppearance === "dark" ? "dark" : "light" }) }), _jsx("div", { className: "absolute left-1/2 z-[6] -translate-x-1/2 rounded-[999px] border border-[rgba(255,255,255,0.2)] bg-[rgba(15,23,42,0.88)] px-[10px] py-[4px] text-[10px] font-semibold tracking-[0.01em] text-white backdrop-blur-[6px]", style: { top: Math.max(8, frameTop - 28) }, children: sizeLabel }), _jsxs("div", { className: "absolute overflow-hidden border-r border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.9)] text-[rgba(226,232,240,0.92)] backdrop-blur-[4px]", style: { left: rulerLeft, top: screenTop, width: RULER_WIDTH, height: screenHeight, borderRadius: 6 }, children: [_jsx("div", { className: "absolute inset-x-0 top-0 z-[1] border-b border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.95)] px-[4px] py-[6px] text-center text-[9px] font-semibold leading-tight", children: scrollLabel }), ticks.map((tick) => {
                                const top = tick.documentY - metrics.scrollY;
                                if (top < 0 || top > screenHeight) {
                                    return null;
                                }
                                return (_jsxs("div", { className: "absolute right-0 flex items-center", style: { top, height: 0 }, children: [_jsx("span", { className: `mr-[3px] text-[8px] tabular-nums ${tick.major ? "font-semibold text-white" : "text-[rgba(203,213,225,0.75)]"}`, children: tick.major ? tick.documentY : "" }), _jsx("span", { className: `block bg-[rgba(226,232,240,0.75)] ${tick.major ? "h-[1px] w-[12px]" : "h-[1px] w-[7px]"}` })] }, tick.documentY));
                            })] })] }), _jsx(DevicePreviewFloatingBar, {})] }));
}
//# sourceMappingURL=DevicePreviewChrome.js.map