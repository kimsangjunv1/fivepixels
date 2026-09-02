import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    DEVICE_PREVIEW_BRAND_ORDER,
    getDevicePreviewPresetsByBrand,
    scaleDeviceChrome,
    type DevicePreviewScale,
} from "@/constants/devicePreview.js";
import { CloseIcon, ScreenRotateIcon } from "@/components/icons/Icons.js";
import type { WindowPosition } from "@/hooks/useDraggableWindow.js";
import { useDraggableWindow } from "@/hooks/useDraggableWindow.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { DeviceFrameArtwork } from "./DeviceFrameArtwork.js";
import { claimFloatingWindowZIndex } from "@/utils/overlay/floatingWindowStack.js";
import { resolveMobilePreviewScreenSize } from "@/utils/overlay/mobilePreviewLayout.js";
import {
    MOBILE_PREVIEW_FRAME_NAME,
    getMobilePreviewGuestDocument,
    getMobilePreviewGuestWindow,
    isInsideMobilePreviewFrame,
    isMobilePreviewGuestDocumentReady,
    syncMobilePreviewGuestViewport,
} from "@/utils/overlay/mobilePreviewFrame.js";

const MOBILE_PREVIEW_POSITION_STORAGE_KEY = "fivepixels:mobile-preview-position:v1";
const MOBILE_PREVIEW_SCALE = 0.75 satisfies DevicePreviewScale;
const MOBILE_PREVIEW_BRANDS = DEVICE_PREVIEW_BRAND_ORDER.filter((brand) => brand !== "desktop");

type FrameLoadState = "loading" | "ready" | "blocked";

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

function syncGuestViewport(iframe: HTMLIFrameElement | null, viewportWidth: number) {
    const guestDocument = getMobilePreviewGuestDocument(iframe);
    syncMobilePreviewGuestViewport(guestDocument, viewportWidth);
    getMobilePreviewGuestWindow(iframe)?.dispatchEvent(new Event("resize"));
}

export function FloatingMobilePreview() {
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

    const screenSize = useMemo(
        () => resolveMobilePreviewScreenSize(mobilePreviewPreset, mobilePreviewOrientation),
        [mobilePreviewOrientation, mobilePreviewPreset],
    );
    const layout = useMemo(
        () => ({
            width: Math.max(1, Math.round(screenSize.width * MOBILE_PREVIEW_SCALE)),
            height: Math.max(1, Math.round(screenSize.height * MOBILE_PREVIEW_SCALE)),
        }),
        [screenSize.height, screenSize.width],
    );
    const chrome = useMemo(() => scaleDeviceChrome(mobilePreviewPreset, MOBILE_PREVIEW_SCALE), [mobilePreviewPreset]);
    const frameWidth = layout.width + chrome.bezel.left + chrome.bezel.right;
    const frameHeight = layout.height + chrome.bezel.top + chrome.bezel.bottom;
    const screenBackground = resolvedPanelAppearance === "dark" ? "#17171c" : "#ffffff";

    const [storedPosition] = useState(() => readMobilePreviewPosition());
    const [zIndex, setZIndex] = useState(() => claimFloatingWindowZIndex());
    const [frameLoadState, setFrameLoadState] = useState<FrameLoadState>("loading");
    const [frameSrc] = useState(() => (typeof window === "undefined" ? "" : window.location.href));
    const rootRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

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

        syncGuestViewport(iframeRef.current, screenSize.width);
    }, [frameLoadState, screenSize.width]);

    const handleClose = useCallback(() => {
        setMobilePreviewUiOpen(false);
    }, [setMobilePreviewUiOpen]);

    const handleFrameLoad = useCallback(() => {
        const iframe = iframeRef.current;

        if (!isMobilePreviewGuestDocumentReady(iframe)) {
            setFrameLoadState("blocked");
            return;
        }

        syncGuestViewport(iframe, screenSize.width);
        setFrameLoadState("ready");
    }, [screenSize.width]);

    const handleFocus = useCallback(() => {
        setZIndex(claimFloatingWindowZIndex());
    }, []);

    const selectClassName =
        "h-[28px] min-w-0 flex-1 rounded-[6px] border border-white/10 bg-white/10 px-[8px] text-[11px] font-semibold text-white outline-none focus:border-[#5b9dff]";

    if (!mobilePreviewUiOpen || isInsideMobilePreviewFrame()) {
        return null;
    }

    return (
        <div
            ref={rootRef}
            data-fivepixels-interactive=""
            data-chrome="mobile-preview-simulator"
            className="fixed select-none"
            style={{
                left: resolvedPosition.left,
                top: resolvedPosition.top,
                zIndex,
                width: frameWidth,
                boxShadow: "0 28px 80px rgba(0, 0, 0, 0.42)",
                borderRadius: 14,
                overflow: "hidden",
                touchAction: "none",
                cursor: isDragging ? "grabbing" : undefined,
            }}
            onPointerDown={handleFocus}
        >
            <header
                className="flex items-center gap-[8px] border-b border-white/10 bg-[#2b2b2f] px-[10px] py-[8px]"
                onPointerDown={handleDragHandlePointerDown}
            >
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

                <button
                    type="button"
                    onClick={toggleMobilePreviewOrientation}
                    onPointerDown={(event) => event.stopPropagation()}
                    aria-label={messages.settings.mobilePreviewRotateAriaLabel}
                    title={messages.settings.mobilePreviewRotateLabel}
                    className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] text-white/90 hover:bg-white/10"
                >
                    <ScreenRotateIcon className="h-[16px] w-[16px]" />
                </button>

                <button
                    type="button"
                    onClick={handleClose}
                    onPointerDown={(event) => event.stopPropagation()}
                    aria-label={messages.marker.windowCloseAriaLabel}
                    className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] text-white/90 hover:bg-white/10"
                >
                    <CloseIcon className="h-[14px] w-[14px]" />
                </button>
            </header>

            <div
                className="relative bg-[#101010]"
                style={{ width: frameWidth, height: frameHeight }}
            >
                <iframe
                    ref={iframeRef}
                    name={MOBILE_PREVIEW_FRAME_NAME}
                    title={messages.settings.mobilePreviewIframeTitle}
                    src={frameSrc}
                    onLoad={handleFrameLoad}
                    data-fivepixels-mobile-preview-frame=""
                    className="absolute z-[0] border-0"
                    style={{
                        left: chrome.bezel.left,
                        top: chrome.bezel.top,
                        width: screenSize.width,
                        height: screenSize.height,
                        transform: `scale(${MOBILE_PREVIEW_SCALE})`,
                        transformOrigin: "top left",
                        borderRadius: mobilePreviewPreset.chrome.screenRadius,
                        background: screenBackground,
                    }}
                />
                {frameLoadState === "blocked" ? (
                    <div
                        className="pointer-events-none absolute z-[1] flex items-center justify-center px-[12px] text-center text-[11px] font-semibold text-white"
                        style={{
                            left: chrome.bezel.left,
                            top: chrome.bezel.top,
                            width: layout.width,
                            height: layout.height,
                            borderRadius: chrome.screenRadius,
                            background: screenBackground,
                        }}
                    >
                        {messages.settings.mobilePreviewIframeBlocked}
                    </div>
                ) : null}
                <div className="pointer-events-none absolute inset-0 z-[2]">
                    <DeviceFrameArtwork
                        preset={mobilePreviewPreset}
                        chrome={chrome}
                        screenWidth={layout.width}
                        screenHeight={layout.height}
                    />
                </div>
            </div>
        </div>
    );
}
