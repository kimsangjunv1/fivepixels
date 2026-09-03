import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { DEVICE_PREVIEW_BRAND_ORDER, getDevicePreviewPresetsByBrand, getEmptyBezel, scaleDeviceChrome, type DevicePreviewScale } from "@/shared/constants/devicePreview.js";
import { CaptureIcon, QrCodeIcon, ScreenRotateIcon } from "@/shared/components/icons/Icons.js";
import type { WindowPosition } from "@/shared/hooks/useDraggableWindow.js";
import { useDraggableWindow } from "@/shared/hooks/useDraggableWindow.js";
import { useMinimizedDockDragReorder } from "@/shared/hooks/useMinimizedDockDragReorder.js";
import { useOverlayMinimizedDock } from "@/shared/hooks/useOverlayMinimizedDock.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { DeviceFrameArtwork } from "@/surfaces/preview/DeviceFrameArtwork.js";
import { DevicePreviewQrPanel } from "@/surfaces/preview/DevicePreviewQrPanel.js";
import { DeviceStatusBar, getDeviceStatusBarHeight } from "@/surfaces/preview/DeviceStatusBar.js";
import { CapturePanel } from "@/surfaces/preview/CapturePanel.js";
import { MinimizedDockSimpleSubtitleRow, MinimizedDockWindowChrome } from "@/surfaces/window/MinimizedDockWindowChrome.js";
import { WINDOW_HEADER_BUTTON_CLASS, WindowModeControls } from "@/surfaces/window/WindowModeControls.js";
import { claimFloatingWindowZIndex } from "@/shared/utils/overlay/floatingWindowStack.js";
import { syncGuestStatusBarStyle } from "@/shared/utils/overlay/devicePreviewFrame.js";
import {
    buildDevicePreviewCaptureFilename,
    captureDevicePreview,
    defaultRasterizeElement,
    downloadCanvasPng,
    getDevicePreviewCaptureLayout,
    resolveCaptureViewportScroll,
    type DevicePreviewCaptureState,
} from "@/surfaces/preview/devicePreviewCapture.js";
import { MINIMIZED_WINDOW_HEIGHT } from "@/shared/utils/overlay/minimizedDockLayout.js";
import {
    resolveMobilePreviewChrome,
    resolveMobilePreviewFrameMetrics,
    resolveMobilePreviewLayout,
    resolveMobilePreviewScreenRadius,
    resolveMobilePreviewScreenSize,
    resolveMobilePreviewStatusBarReferenceWidth,
} from "@/surfaces/preview/mobilePreviewLayout.js";
import type { MobilePreviewCornerStyle } from "@/surfaces/preview/mobilePreviewLayout.js";
import {
    MOBILE_PREVIEW_FRAME_NAME,
    getMobilePreviewCaptureRoot,
    getMobilePreviewGuestDocument,
    getMobilePreviewGuestWindow,
    isInsideMobilePreviewFrame,
    isMobilePreviewGuestDocumentReady,
    syncMobilePreviewGuestViewport,
} from "@/surfaces/preview/mobilePreviewFrame.js";
import { normalizeMobilePreviewUrl, persistMobilePreviewUrl, readMobilePreviewUrl } from "@/surfaces/preview/mobilePreviewUrl.js";
import {
    MOBILE_PREVIEW_SIDE_PANEL_GAP,
    MOBILE_PREVIEW_SIDE_PANEL_STACK_GAP,
    MOBILE_PREVIEW_SIDE_PANEL_WIDTH,
    isMobilePreviewSidePanelOpen,
    toggleMobilePreviewSidePanel,
    type MobilePreviewSidePanelId,
} from "@/surfaces/preview/mobilePreviewSidePanels.js";

const MOBILE_PREVIEW_WINDOW_ID = "mobile-preview";
const MOBILE_PREVIEW_POSITION_STORAGE_KEY = "fivepixels:mobile-preview-position:v1";
const MOBILE_PREVIEW_SCALE = 0.75 satisfies DevicePreviewScale;
const MOBILE_PREVIEW_BRANDS = DEVICE_PREVIEW_BRAND_ORDER.filter((brand) => brand !== "desktop");
const TOOLBAR_DEVICE_GAP = 10;
const TOOLBAR_CONTROLS_HEIGHT = 38;
const TOOLBAR_URL_ROW_HEIGHT = 28;
const TOOLBAR_INNER_GAP = 6;
const TOOLBAR_APPROX_HEIGHT = TOOLBAR_CONTROLS_HEIGHT + TOOLBAR_INNER_GAP + TOOLBAR_URL_ROW_HEIGHT;

type FrameLoadState = "loading" | "ready" | "blocked";
type MobilePreviewWindowMode = "normal" | "minimized";

function readMobilePreviewPosition(): WindowPosition {
    const fallback = getDefaultMobilePreviewPosition();

    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(MOBILE_PREVIEW_POSITION_STORAGE_KEY);

        if (!raw) {
            return fallback;
        }

        const parsed = JSON.parse(raw) as Partial<WindowPosition>;

        if (typeof parsed.left === "number" && Number.isFinite(parsed.left) && typeof parsed.top === "number" && Number.isFinite(parsed.top)) {
            return { left: parsed.left, top: parsed.top };
        }
    } catch {
        // Ignore storage failures.
    }

    return fallback;
}

function getDefaultMobilePreviewPosition(): WindowPosition {
    if (typeof window === "undefined") {
        return { left: 80, top: 80 };
    }

    return {
        left: Math.max(16, window.innerWidth - 360),
        top: Math.max(16, window.innerHeight - 760),
    };
}

function persistMobilePreviewPosition(position: WindowPosition) {
    try {
        window.localStorage.setItem(MOBILE_PREVIEW_POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch {
        // Ignore storage failures.
    }
}

function syncGuestViewport(iframe: HTMLIFrameElement | null, viewportWidth: number, statusBarHeight: number) {
    const guestDocument = getMobilePreviewGuestDocument(iframe);
    syncMobilePreviewGuestViewport(guestDocument, viewportWidth);
    syncGuestStatusBarStyle(guestDocument, statusBarHeight);
    getMobilePreviewGuestWindow(iframe)?.dispatchEvent(new Event("resize"));
}

export function MobilePreviewWindow() {
    const {
        mobilePreviewUiOpen,
        setMobilePreviewUiOpen,
        mobilePreviewDeviceId,
        setMobilePreviewDeviceId,
        mobilePreviewOrientation,
        toggleMobilePreviewOrientation,
        mobilePreviewPreset,
        messages,
        resolvedPanelAppearance,
    } = useReportPreferences();

    const guestViewportSize = useMemo(() => resolveMobilePreviewScreenSize(mobilePreviewPreset, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const layout = useMemo(() => resolveMobilePreviewLayout(mobilePreviewPreset, MOBILE_PREVIEW_SCALE, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const portraitChrome = useMemo(() => scaleDeviceChrome(mobilePreviewPreset, MOBILE_PREVIEW_SCALE), [mobilePreviewPreset]);
    const deviceChrome = useMemo(() => resolveMobilePreviewChrome(portraitChrome, mobilePreviewOrientation), [mobilePreviewOrientation, portraitChrome]);
    const [captureState, setCaptureState] = useState<DevicePreviewCaptureState>("idle");
    const [captureImageEnabled, setCaptureImageEnabled] = useState(true);
    const [captureCornerStyle, setCaptureCornerStyle] = useState<MobilePreviewCornerStyle>("rounded");
    const [captureStatusBarEnabled, setCaptureStatusBarEnabled] = useState(true);
    const chrome = useMemo(
        () =>
            captureImageEnabled
                ? deviceChrome
                : {
                      frameRadius: 0,
                      screenRadius: 0,
                      bezel: getEmptyBezel(),
                  },
        [captureImageEnabled, deviceChrome],
    );
    const previewRadius = useMemo(
        () =>
            resolveMobilePreviewScreenRadius({
                deviceChrome,
                deviceImageEnabled: captureImageEnabled,
                cornerStyle: captureCornerStyle,
            }),
        [captureCornerStyle, captureImageEnabled, deviceChrome],
    );
    const { frameWidth, frameHeight } = useMemo(() => resolveMobilePreviewFrameMetrics(layout, chrome.bezel), [chrome.bezel, layout]);
    const statusBarReferenceWidth = useMemo(() => resolveMobilePreviewStatusBarReferenceWidth(mobilePreviewPreset, mobilePreviewOrientation), [mobilePreviewOrientation, mobilePreviewPreset]);
    const guestStatusBarHeight = useMemo(
        () => (captureStatusBarEnabled ? getDeviceStatusBarHeight(mobilePreviewPreset, guestViewportSize.width, 1, statusBarReferenceWidth) : 0),
        [captureStatusBarEnabled, guestViewportSize.width, mobilePreviewPreset, statusBarReferenceWidth],
    );
    const statusBarAppearance = resolvedPanelAppearance === "dark" ? "dark" : "light";
    const screenBackground = resolvedPanelAppearance === "dark" ? "#17171c" : "#ffffff";

    const [storedPosition] = useState(() => readMobilePreviewPosition());
    const [windowMode, setWindowMode] = useState<MobilePreviewWindowMode>("normal");
    const [zIndex, setZIndex] = useState(() => claimFloatingWindowZIndex());
    const [frameLoadState, setFrameLoadState] = useState<FrameLoadState>("loading");
    const [frameSrc, setFrameSrc] = useState(() => (typeof window === "undefined" ? "" : readMobilePreviewUrl(window.location.href)));
    const [urlDraft, setUrlDraft] = useState(() => (typeof window === "undefined" ? "" : readMobilePreviewUrl(window.location.href)));
    const [openSidePanels, setOpenSidePanels] = useState<MobilePreviewSidePanelId[]>([]);
    const rootRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const captureStageRef = useRef<HTMLDivElement>(null);
    const statusBarRef = useRef<HTMLDivElement>(null);
    const captureResetTimerRef = useRef<number | null>(null);

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

    const {
        position: dragPosition,
        isDragging,
        handleDragHandlePointerDown,
    } = useDraggableWindow({
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
            setOpenSidePanels([]);
        }
    }, [mobilePreviewUiOpen]);

    useEffect(() => {
        return () => {
            if (captureResetTimerRef.current !== null) {
                window.clearTimeout(captureResetTimerRef.current);
            }
        };
    }, []);

    const contentWidth = openSidePanels.length > 0 ? frameWidth + MOBILE_PREVIEW_SIDE_PANEL_GAP + MOBILE_PREVIEW_SIDE_PANEL_WIDTH : frameWidth;
    const capturePanelOpen = isMobilePreviewSidePanelOpen(openSidePanels, "capture");
    const qrPanelOpen = isMobilePreviewSidePanelOpen(openSidePanels, "qr");

    const toggleSidePanel = useCallback((panelId: MobilePreviewSidePanelId) => {
        setOpenSidePanels((panels) => toggleMobilePreviewSidePanel(panels, panelId));
    }, []);

    useEffect(() => {
        if (frameLoadState !== "ready") {
            return;
        }

        syncGuestViewport(iframeRef.current, guestViewportSize.width, guestStatusBarHeight);
    }, [frameLoadState, guestViewportSize.width, guestStatusBarHeight]);

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

        syncGuestViewport(iframe, guestViewportSize.width, guestStatusBarHeight);
        setFrameLoadState("ready");
    }, [guestViewportSize.width, guestStatusBarHeight]);

    const handleFocus = useCallback(() => {
        setZIndex(claimFloatingWindowZIndex());
    }, []);

    const handleCapture = useCallback(async () => {
        if (captureState === "capturing" || frameLoadState !== "ready") {
            return;
        }

        const documentRoot = getMobilePreviewCaptureRoot(iframeRef.current);

        if (captureResetTimerRef.current !== null) {
            window.clearTimeout(captureResetTimerRef.current);
            captureResetTimerRef.current = null;
        }

        setCaptureState("capturing");

        try {
            if (!documentRoot) {
                throw new Error("Mobile preview content is missing.");
            }

            // Re-apply safe-area padding immediately before capture so the guest bitmap matches the live preview.
            syncGuestStatusBarStyle(getMobilePreviewGuestDocument(iframeRef.current), guestStatusBarHeight);

            const screenWidth = guestViewportSize.width;
            const screenHeight = guestViewportSize.height;
            const captureChrome = resolveMobilePreviewChrome(scaleDeviceChrome(mobilePreviewPreset, 1), mobilePreviewOrientation);
            const captureLayout = getDevicePreviewCaptureLayout({
                screenWidth,
                screenHeight,
                bezel: captureImageEnabled ? captureChrome.bezel : getEmptyBezel(),
                deviceImageEnabled: captureImageEnabled,
            });
            const screenCornerRadius = resolveMobilePreviewScreenRadius({
                deviceChrome: captureChrome,
                deviceImageEnabled: captureImageEnabled,
                cornerStyle: captureCornerStyle,
            });
            const contentRoot = documentRoot;
            const captureScroll = resolveCaptureViewportScroll(documentRoot, getMobilePreviewGuestWindow(iframeRef.current));
            const viewportScroll = {
                scrollX: captureScroll.scrollX,
                scrollY: captureScroll.scrollY,
                scrollWidth: Math.max(captureScroll.scrollWidth, screenWidth + captureScroll.scrollX),
                scrollHeight: Math.max(captureScroll.scrollHeight, screenHeight + captureScroll.scrollY),
            };
            const statusBarPixelRatio = guestViewportSize.width / Math.max(1, layout.width);

            const canvas = await captureDevicePreview({
                contentRoot,
                chromeStage: captureStageRef.current,
                statusBarLayer: statusBarRef.current,
                deviceImageEnabled: captureImageEnabled,
                statusBarEnabled: captureStatusBarEnabled,
                layout: captureLayout,
                background: screenBackground,
                // Always clip screen content — including when the device frame is on —
                // so rectangular page pixels do not poke through the rounded screen hole.
                screenCornerRadius,
                contentScrollX: viewportScroll.scrollX,
                contentScrollY: viewportScroll.scrollY,
                contentScrollWidth: viewportScroll.scrollWidth,
                contentScrollHeight: viewportScroll.scrollHeight,
                rasterize: async (element, options) => {
                    if (element === contentRoot) {
                        return defaultRasterizeElement(element, {
                            ...options,
                            width: guestViewportSize.width,
                            height: guestViewportSize.height,
                            cropToViewport: true,
                            scrollX: viewportScroll.scrollX,
                            scrollY: viewportScroll.scrollY,
                            scrollWidth: viewportScroll.scrollWidth,
                            scrollHeight: viewportScroll.scrollHeight,
                        });
                    }

                    if (element === captureStageRef.current) {
                        return defaultRasterizeElement(element, {
                            ...options,
                            width: frameWidth,
                            height: frameHeight,
                            cropToViewport: false,
                            pixelRatio: statusBarPixelRatio,
                        });
                    }

                    if (element === statusBarRef.current) {
                        return defaultRasterizeElement(element, {
                            ...options,
                            width: layout.width,
                            height: layout.height,
                            cropToViewport: false,
                            pixelRatio: statusBarPixelRatio,
                        });
                    }

                    return defaultRasterizeElement(element, options);
                },
            });

            await downloadCanvasPng(
                canvas,
                buildDevicePreviewCaptureFilename({
                    deviceId: mobilePreviewPreset.id,
                    width: screenWidth,
                    height: screenHeight,
                }),
            );
            setCaptureState("saved");
        } catch {
            setCaptureState("failed");
        } finally {
            captureResetTimerRef.current = window.setTimeout(() => {
                setCaptureState("idle");
                captureResetTimerRef.current = null;
            }, 1600);
        }
    }, [
        captureCornerStyle,
        captureImageEnabled,
        captureState,
        captureStatusBarEnabled,
        frameHeight,
        frameLoadState,
        frameWidth,
        guestStatusBarHeight,
        guestViewportSize.height,
        guestViewportSize.width,
        layout.height,
        layout.width,
        mobilePreviewOrientation,
        mobilePreviewPreset,
        screenBackground,
    ]);

    const navigatePreviewUrl = useCallback(
        (rawInput: string) => {
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
        },
        [frameSrc],
    );

    const handleUrlSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            navigatePreviewUrl(urlDraft);
        },
        [navigatePreviewUrl, urlDraft],
    );

    const handleRootPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLDivElement>) => {
            handleFocus();

            if (showMinimizedChrome) {
                dockDrag.handleMinimizedDockPointerDown(event);
            }
        },
        [dockDrag, handleFocus, showMinimizedChrome],
    );

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
            height: undefined as number | undefined,
        };
    }, [contentWidth, dockDrag.displayLeft, dockDrag.displayTop, dockMorph, overlayDock.minimizedWidth, restoredPosition.left, restoredPosition.top, showMinimizedChrome]);

    const qrPanelMessages = useMemo(
        () => ({
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
        }),
        [messages.settings],
    );

    if (!mobilePreviewUiOpen || isInsideMobilePreviewFrame()) {
        return null;
    }

    return (
        <div
            ref={rootRef}
            data-fivepixels-interactive=""
            data-chrome="mobile-preview-simulator"
            data-mode={windowMode}
            data-orientation={mobilePreviewOrientation}
            className={`fixed select-none ${showMinimizedChrome ? "" : "flex flex-col items-start"}`}
            style={{
                left: displayRect.left,
                top: displayRect.top,
                zIndex: isDockDragging ? zIndex + 100 : zIndex,
                width: displayRect.width,
                height: displayRect.height,
                transition: overlayDock.layoutTransition,
                touchAction: "none",
                cursor: isDragging || isDockDragging ? "grabbing" : undefined,
                ...(isDockDragging ? { transform: "scale(1.03)", willChange: "left, top, transform" } : null),
            }}
            onPointerDown={handleRootPointerDown}
        >
            {showMinimizedChrome ? (
                <MinimizedDockWindowChrome
                    badgeLabel={messages.panel.mobilePreview}
                    badgeValue={mobilePreviewPreset.label}
                    restoreAriaLabel={messages.marker.windowRestoreAriaLabel}
                    restoreTitle={messages.marker.windowRestoreAriaLabel}
                    onRestore={handleToggleMinimize}
                    restoreDisabled={dockMorph !== null}
                    closeAriaLabel={messages.marker.windowCloseAriaLabel}
                    closeTitle={messages.marker.windowCloseAriaLabel}
                    onClose={handleClose}
                    closeDisabled={dockMorph !== null || isDockDragging}
                    dockCount={overlayDock.dockCount}
                    isDockDragging={isDockDragging}
                    onPointerDown={dockDrag.handleMinimizedDockPointerDown}
                    onClickCapture={dockDrag.handleMinimizedDockClickCapture}
                >
                    <MinimizedDockSimpleSubtitleRow
                        label={mobilePreviewPreset.label}
                        onRestore={handleToggleMinimize}
                        restoreDisabled={dockMorph !== null}
                        restoreAriaLabel={messages.marker.windowRestoreAriaLabel}
                    />
                </MinimizedDockWindowChrome>
            ) : (
                <>
                    <header
                        className="mb-[10px] flex w-full min-w-0 flex-col gap-[6px] rounded-[12px] bg-[var(--adaptive-fillOpacity700)] px-[10px] py-[6px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px]"
                        style={{ marginBottom: TOOLBAR_DEVICE_GAP, width: frameWidth, maxWidth: "100%" }}
                        onPointerDown={handleDragHandlePointerDown}
                    >
                        <div className="flex min-w-0 items-center gap-[6px]">
                            <label className="flex min-w-0 flex-1 items-center gap-[6px]">
                                <span className="sr-only">{messages.settings.mobilePreviewDeviceAriaLabel}</span>
                                <select
                                    value={mobilePreviewDeviceId}
                                    onChange={(event) => setMobilePreviewDeviceId(event.target.value)}
                                    onPointerDown={(event) => event.stopPropagation()}
                                    aria-label={messages.settings.mobilePreviewDeviceAriaLabel}
                                    className={selectClassName}
                                >
                                    {MOBILE_PREVIEW_BRANDS.map((brand) => (
                                        <optgroup
                                            key={brand}
                                            label={
                                                brand === "apple"
                                                    ? messages.settings.devicePreviewBrandApple
                                                    : brand === "samsung"
                                                      ? messages.settings.devicePreviewBrandSamsung
                                                      : messages.settings.devicePreviewBrandGoogle
                                            }
                                        >
                                            {getDevicePreviewPresetsByBrand(brand).map((option) => (
                                                <option
                                                    key={option.id}
                                                    value={option.id}
                                                >
                                                    {option.label} ({option.width}×{option.height})
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </label>

                            <div className="flex shrink-0 items-center gap-[2px]">
                                <WindowModeControls
                                    closeAriaLabel={messages.marker.windowCloseAriaLabel}
                                    minimizeAriaLabel={isMinimized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMinimizeAriaLabel}
                                    maximizeAriaLabel={messages.marker.windowMaximizeAriaLabel}
                                    showMaximize={false}
                                    isMaximized={false}
                                    onClose={handleClose}
                                    onMinimize={handleToggleMinimize}
                                />
                            </div>
                        </div>

                        <form
                            className="flex min-w-0 items-center gap-[6px]"
                            onSubmit={handleUrlSubmit}
                            onPointerDown={(event) => event.stopPropagation()}
                        >
                            <label className="flex min-w-0 flex-1 items-center">
                                <span className="sr-only">{messages.settings.mobilePreviewUrlAriaLabel}</span>
                                <input
                                    type="text"
                                    value={urlDraft}
                                    onChange={(event) => setUrlDraft(event.target.value)}
                                    placeholder={messages.settings.mobilePreviewUrlPlaceholder}
                                    aria-label={messages.settings.mobilePreviewUrlAriaLabel}
                                    className={urlInputClassName}
                                    spellCheck={false}
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                />
                            </label>
                            <button
                                type="submit"
                                className="h-[24px] shrink-0 rounded-[6px] bg-[var(--adaptive-fillOpacity500)] px-[10px] text-[12px] font-semibold text-[var(--adaptive-black600)]"
                            >
                                {messages.settings.mobilePreviewUrlGoLabel}
                            </button>
                        </form>
                    </header>

                    <div
                        className="relative shrink-0 overflow-visible"
                        style={{
                            width: contentWidth,
                            height: frameHeight,
                        }}
                    >
                        <div
                            className="relative shrink-0"
                            style={{
                                width: frameWidth,
                                height: frameHeight,
                                filter: "drop-shadow(0 28px 56px rgba(0, 0, 0, 0.42))",
                            }}
                        >
                            <div
                                className="absolute z-[0] overflow-hidden"
                                style={{
                                    left: chrome.bezel.left,
                                    top: chrome.bezel.top,
                                    width: layout.width,
                                    height: layout.height,
                                    borderRadius: previewRadius,
                                    background: screenBackground,
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    name={MOBILE_PREVIEW_FRAME_NAME}
                                    title={messages.settings.mobilePreviewIframeTitle}
                                    src={frameSrc}
                                    onLoad={handleFrameLoad}
                                    data-fivepixels-mobile-preview-frame=""
                                    className="absolute left-0 top-0 z-[0] border-0"
                                    style={{
                                        width: guestViewportSize.width,
                                        height: guestViewportSize.height,
                                        transform: `scale(${MOBILE_PREVIEW_SCALE})`,
                                        transformOrigin: "top left",
                                        background: screenBackground,
                                    }}
                                />
                                {frameLoadState === "blocked" ? (
                                    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-[12px] text-center text-[11px] font-semibold text-[var(--adaptive-black900)]" style={{ background: screenBackground }}>
                                        {messages.settings.mobilePreviewIframeBlocked}
                                    </div>
                                ) : null}
                            </div>
                            <div
                                ref={captureStageRef}
                                className="pointer-events-none absolute inset-0 z-[2]"
                            >
                                {captureImageEnabled ? (
                                    <div data-fivepixels-mobile-preview-stage="">
                                        <DeviceFrameArtwork
                                            preset={mobilePreviewPreset}
                                            chrome={chrome}
                                            screenWidth={layout.width}
                                            screenHeight={layout.height}
                                            orientation={mobilePreviewOrientation}
                                        />
                                    </div>
                                ) : null}
                                {captureStatusBarEnabled ? (
                                    <div
                                        ref={statusBarRef}
                                        className={`pointer-events-none absolute z-[1] ${
                                            captureImageEnabled && mobilePreviewOrientation === "landscape" ? "overflow-visible" : "overflow-hidden"
                                        }`}
                                        style={{
                                            left: chrome.bezel.left,
                                            top: chrome.bezel.top,
                                            width: layout.width,
                                            height: layout.height,
                                            borderRadius: previewRadius,
                                        }}
                                    >
                                        <DeviceStatusBar
                                            preset={mobilePreviewPreset}
                                            width={layout.width}
                                            screenHeight={layout.height}
                                            appearance={statusBarAppearance}
                                            showCutout={captureImageEnabled}
                                            orientation={mobilePreviewOrientation}
                                            referenceLogicalWidth={statusBarReferenceWidth}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div
                            className="absolute z-[20] flex justify-center"
                            style={{ top: frameHeight + 8, left: 0, width: frameWidth }}
                            onPointerDown={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center rounded-full bg-[var(--adaptive-fillOpacity700)] p-[4px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px]">
                                <button
                                    type="button"
                                    onClick={() => toggleSidePanel("capture")}
                                    aria-label={messages.settings.mobilePreviewCaptureOpenAriaLabel}
                                    title={messages.settings.mobilePreviewCaptureOpenLabel}
                                    aria-pressed={capturePanelOpen}
                                    className={WINDOW_HEADER_BUTTON_CLASS}
                                >
                                    <CaptureIcon className="h-[16px] w-[16px]" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleSidePanel("qr")}
                                    aria-label={messages.settings.mobilePreviewQrOpenAriaLabel}
                                    title={messages.settings.mobilePreviewQrOpenLabel}
                                    aria-pressed={qrPanelOpen}
                                    className={WINDOW_HEADER_BUTTON_CLASS}
                                >
                                    <QrCodeIcon className="h-[16px] w-[16px]" />
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleMobilePreviewOrientation}
                                    aria-label={messages.settings.mobilePreviewRotateAriaLabel}
                                    title={messages.settings.mobilePreviewRotateLabel}
                                    className={WINDOW_HEADER_BUTTON_CLASS}
                                >
                                    <ScreenRotateIcon className="h-[16px] w-[16px]" />
                                </button>
                            </div>
                        </div>
                        {openSidePanels.length > 0 ? (
                            <div
                                className="absolute z-[1000] flex flex-col"
                                style={{
                                    left: frameWidth + MOBILE_PREVIEW_SIDE_PANEL_GAP,
                                    top: "50%",
                                    width: MOBILE_PREVIEW_SIDE_PANEL_WIDTH,
                                    gap: MOBILE_PREVIEW_SIDE_PANEL_STACK_GAP,
                                    transform: "translateY(-50%)",
                                }}
                                onPointerDown={(event) => event.stopPropagation()}
                            >
                                {openSidePanels.map((panelId) => {
                                    if (panelId === "capture") {
                                        return (
                                            <CapturePanel
                                                key={panelId}
                                                captureState={captureState}
                                                captureImageEnabled={captureImageEnabled}
                                                captureStatusBarEnabled={captureStatusBarEnabled}
                                                captureCornerStyle={captureCornerStyle}
                                                onCaptureImageEnabledChange={setCaptureImageEnabled}
                                                onCaptureStatusBarEnabledChange={setCaptureStatusBarEnabled}
                                                onCaptureCornerStyleChange={setCaptureCornerStyle}
                                                onCapture={() => void handleCapture()}
                                                width={MOBILE_PREVIEW_SIDE_PANEL_WIDTH}
                                            />
                                        );
                                    }

                                    if (panelId === "qr") {
                                        return (
                                            <DevicePreviewQrPanel
                                                key={panelId}
                                                {...qrPanelMessages}
                                                pageHref={frameSrc}
                                                width={MOBILE_PREVIEW_SIDE_PANEL_WIDTH}
                                            />
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}
