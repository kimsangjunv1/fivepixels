import { FIVEPIXELS_HOST_ID } from "../../constants/overlayChrome.js";
export const DEVICE_PREVIEW_BUTTON_OUTSET = 3;
const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
export function shouldCaptureDevicePreviewNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return true;
    }
    const element = node;
    if (element.hasAttribute("data-fivepixels-skip-capture")) {
        return false;
    }
    return element.id !== FIVEPIXELS_HOST_ID;
}
function isLikelyUnsafeCaptureNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }
    const tag = node.tagName;
    return tag === "CANVAS" || tag === "VIDEO" || tag === "IFRAME";
}
function readPositiveScroll(...values) {
    let max = 0;
    for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value) && value > max) {
            max = value;
        }
    }
    return Math.round(max);
}
function sanitizeFilenamePart(value) {
    return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "device";
}
function formatCaptureStamp(now) {
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
export function getDevicePreviewCaptureLayout(args) {
    const screenWidth = Math.max(1, Math.round(args.screenWidth));
    const screenHeight = Math.max(1, Math.round(args.screenHeight));
    const bezel = args.deviceImageEnabled
        ? {
            top: Math.max(0, Math.round(args.bezel.top)),
            right: Math.max(0, Math.round(args.bezel.right)),
            bottom: Math.max(0, Math.round(args.bezel.bottom)),
            left: Math.max(0, Math.round(args.bezel.left)),
        }
        : { top: 0, right: 0, bottom: 0, left: 0 };
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    const outset = args.deviceImageEnabled ? DEVICE_PREVIEW_BUTTON_OUTSET : 0;
    return {
        canvasWidth: frameWidth + outset * 2,
        canvasHeight: frameHeight + outset * 2,
        frameWidth,
        frameHeight,
        screenX: outset + bezel.left,
        screenY: outset + bezel.top,
        screenWidth,
        screenHeight,
        outset,
    };
}
export function buildDevicePreviewCaptureFilename(args) {
    const deviceId = sanitizeFilenamePart(args.deviceId);
    const width = Math.max(1, Math.round(args.width));
    const height = Math.max(1, Math.round(args.height));
    const stamp = formatCaptureStamp(args.now ?? new Date());
    return `fivepixels-preview-${deviceId}-${width}x${height}-${stamp}.png`;
}
/**
 * Resolve window / scrollingElement scroll for document roots.
 * Use Math.max — `window.scrollY ?? element.scrollTop` fails when scrollY is 0 but documentElement.scrollTop is not.
 */
export function resolveCaptureViewportScroll(element, guestWindow) {
    const doc = element.ownerDocument;
    const win = guestWindow ?? doc.defaultView;
    const scrolling = doc.scrollingElement ?? doc.documentElement;
    const isDocumentRoot = element === doc.documentElement || element === doc.body || element === scrolling;
    if (isDocumentRoot) {
        const scrollX = Math.max(0, readPositiveScroll(win?.scrollX, scrolling?.scrollLeft, element.scrollLeft));
        const scrollY = Math.max(0, readPositiveScroll(win?.scrollY, scrolling?.scrollTop, element.scrollTop));
        const viewportWidth = Math.max(0, Math.round(win?.innerWidth ?? scrolling?.clientWidth ?? element.clientWidth ?? 0));
        const viewportHeight = Math.max(0, Math.round(win?.innerHeight ?? scrolling?.clientHeight ?? element.clientHeight ?? 0));
        const scrollWidth = Math.max(scrolling?.scrollWidth ?? 0, element.scrollWidth, viewportWidth + scrollX);
        const scrollHeight = Math.max(scrolling?.scrollHeight ?? 0, element.scrollHeight, viewportHeight + scrollY);
        return {
            scrollX,
            scrollY,
            scrollWidth: Math.round(scrollWidth),
            scrollHeight: Math.round(scrollHeight),
        };
    }
    return {
        scrollX: Math.max(0, Math.round(element.scrollLeft)),
        scrollY: Math.max(0, Math.round(element.scrollTop)),
        scrollWidth: Math.max(0, Math.round(element.scrollWidth)),
        scrollHeight: Math.max(0, Math.round(element.scrollHeight)),
    };
}
function cropCanvas(source, sx, sy, width, height) {
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    const context = output.getContext("2d");
    if (!context) {
        throw new Error("Canvas 2D context is unavailable.");
    }
    const safeX = Math.max(0, Math.min(Math.round(sx), Math.max(0, source.width - width)));
    const safeY = Math.max(0, Math.min(Math.round(sy), Math.max(0, source.height - height)));
    context.drawImage(source, safeX, safeY, width, height, 0, 0, width, height);
    return output;
}
function resolveRasterizeScroll(element, options) {
    const fallback = resolveCaptureViewportScroll(element);
    const scrollX = Math.max(0, Math.round(options.scrollX ?? fallback.scrollX));
    const scrollY = Math.max(0, Math.round(options.scrollY ?? fallback.scrollY));
    const scrollWidth = Math.max(options.width + scrollX, Math.round(options.scrollWidth ?? fallback.scrollWidth), element.scrollWidth);
    const scrollHeight = Math.max(options.height + scrollY, Math.round(options.scrollHeight ?? fallback.scrollHeight), element.scrollHeight);
    return { scrollX, scrollY, scrollWidth, scrollHeight };
}
/**
 * Shift scroller children so the currently visible region sits at (0,0).
 * html-to-image clones reset scrollTop to 0; translating content makes the clone match the live viewport.
 */
export function applyCaptureScrollShift(element, scrollX, scrollY) {
    const offsetX = Math.round(scrollX);
    const offsetY = Math.round(scrollY);
    if (offsetX === 0 && offsetY === 0) {
        return () => undefined;
    }
    const restores = [];
    const previousOverflow = element.style.overflow;
    element.style.overflow = "hidden";
    restores.push(() => {
        element.style.overflow = previousOverflow;
    });
    const children = Array.from(element.children).filter((child) => child instanceof HTMLElement && child.tagName !== "HEAD");
    for (const child of children) {
        const previousTransform = child.style.transform;
        child.style.transform = `translate(${-offsetX}px, ${-offsetY}px)${previousTransform ? ` ${previousTransform}` : ""}`;
        restores.push(() => {
            child.style.transform = previousTransform;
        });
    }
    return () => {
        for (let index = restores.length - 1; index >= 0; index -= 1) {
            restores[index]?.();
        }
    };
}
/** Recreate every live scroll viewport while keeping the full page as the capture root. */
export function applyCaptureScrollShifts(root, rootScrollX, rootScrollY) {
    const restores = [];
    const rootOffsetX = Math.max(0, Math.round(rootScrollX));
    const rootOffsetY = Math.max(0, Math.round(rootScrollY));
    if (rootOffsetX > 0 || rootOffsetY > 0) {
        restores.push(applyCaptureScrollShift(root, rootOffsetX, rootOffsetY));
    }
    for (const element of Array.from(root.querySelectorAll("*"))) {
        const scrollX = Math.max(0, Math.round(element.scrollLeft));
        const scrollY = Math.max(0, Math.round(element.scrollTop));
        if (scrollX > 0 || scrollY > 0) {
            restores.push(applyCaptureScrollShift(element, scrollX, scrollY));
        }
    }
    return () => {
        for (let index = restores.length - 1; index >= 0; index -= 1) {
            restores[index]?.();
        }
    };
}
async function rasterizeNode(element, options) {
    const { toCanvas } = await import("html-to-image");
    const pixelRatio = options.pixelRatio && options.pixelRatio > 0 ? options.pixelRatio : 1;
    const rasterizeOptions = {
        width: options.captureWidth,
        height: options.captureHeight,
        pixelRatio,
        skipAutoScale: true,
        backgroundColor: options.backgroundColor ?? undefined,
        skipFonts: true,
        imagePlaceholder: TRANSPARENT_PIXEL,
        onImageErrorHandler: () => undefined,
        style: {
            transform: "none",
            transformOrigin: "top left",
            margin: "0px",
            marginLeft: "0px",
            marginTop: "0px",
            marginRight: "0px",
            marginBottom: "0px",
            left: "0px",
            top: "0px",
            right: "auto",
            bottom: "auto",
            position: "relative",
            overflow: "hidden",
            width: `${options.captureWidth}px`,
            height: `${options.captureHeight}px`,
        },
        filter: shouldCaptureDevicePreviewNode,
    };
    return toCanvas(element, rasterizeOptions).catch(() => toCanvas(element, {
        ...rasterizeOptions,
        filter: (node) => shouldCaptureDevicePreviewNode(node) && !isLikelyUnsafeCaptureNode(node),
    }));
}
export async function defaultRasterizeElement(element, options) {
    const { scrollX, scrollY } = resolveRasterizeScroll(element, options);
    const pixelRatio = options.pixelRatio && options.pixelRatio > 0 ? options.pixelRatio : 1;
    if (!options.cropToViewport) {
        return rasterizeNode(element, {
            ...options,
            captureWidth: options.width,
            captureHeight: options.height,
        });
    }
    // Translate live content into the viewport, then capture only the viewport box.
    // Do not expand-to-scrollHeight + crop: html-to-image often returns a short canvas and crop clamps to y=0.
    const restoreScrollShift = applyCaptureScrollShifts(element, scrollX, scrollY);
    try {
        const canvas = await rasterizeNode(element, {
            ...options,
            captureWidth: options.width,
            captureHeight: options.height,
        });
        if (canvas.width === options.width * pixelRatio && canvas.height === options.height * pixelRatio) {
            return canvas;
        }
        return cropCanvas(canvas, 0, 0, options.width * pixelRatio, options.height * pixelRatio);
    }
    finally {
        restoreScrollShift();
    }
}
/** Clip the screen region of a capture canvas to a rounded rectangle (visual CSS px). */
export function applyCaptureScreenCornerClip(source, layout, radius) {
    const safeRadius = Math.max(0, Math.min(Math.round(radius), Math.floor(layout.screenWidth / 2), Math.floor(layout.screenHeight / 2)));
    if (safeRadius <= 0) {
        return source;
    }
    const output = document.createElement("canvas");
    output.width = source.width;
    output.height = source.height;
    const context = output.getContext("2d");
    if (!context) {
        throw new Error("Canvas 2D context is unavailable.");
    }
    context.beginPath();
    context.roundRect(layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight, safeRadius);
    context.clip();
    context.drawImage(source, 0, 0);
    return output;
}
function resolveScreenCornerRadius(layout, radius) {
    return Math.max(0, Math.min(Math.round(radius ?? 0), Math.floor(layout.screenWidth / 2), Math.floor(layout.screenHeight / 2)));
}
export async function captureDevicePreview(args) {
    const rasterize = args.rasterize ?? defaultRasterizeElement;
    const { layout } = args;
    const cornerRadius = resolveScreenCornerRadius(layout, args.screenCornerRadius);
    const output = document.createElement("canvas");
    output.width = layout.canvasWidth;
    output.height = layout.canvasHeight;
    const context = output.getContext("2d");
    if (!context) {
        throw new Error("Canvas 2D context is unavailable.");
    }
    context.clearRect(0, 0, output.width, output.height);
    const contentCanvas = await rasterize(args.contentRoot, {
        width: layout.screenWidth,
        height: layout.screenHeight,
        backgroundColor: args.background,
        cropToViewport: true,
        scrollX: args.contentScrollX,
        scrollY: args.contentScrollY,
        scrollWidth: args.contentScrollWidth,
        scrollHeight: args.contentScrollHeight,
    });
    const statusBarCanvas = !args.deviceImageEnabled && args.statusBarEnabled && args.statusBarLayer
        ? await rasterize(args.statusBarLayer, {
            width: layout.screenWidth,
            height: layout.screenHeight,
            backgroundColor: null,
        })
        : null;
    const paintScreenLayers = () => {
        context.fillStyle = args.background;
        context.fillRect(layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight);
        context.drawImage(contentCanvas, layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight);
        if (statusBarCanvas) {
            context.drawImage(statusBarCanvas, layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight);
        }
    };
    // Clip screen content (and status bar when device image is off) to the display radius.
    // Device chrome is drawn after restore so the bezel is not cut away.
    if (cornerRadius > 0) {
        context.save();
        context.beginPath();
        context.roundRect(layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight, cornerRadius);
        context.clip();
        paintScreenLayers();
        context.restore();
    }
    else {
        paintScreenLayers();
    }
    if (args.deviceImageEnabled) {
        if (!args.chromeStage) {
            throw new Error("Device preview chrome is missing.");
        }
        const chromeCanvas = await rasterize(args.chromeStage, {
            width: layout.frameWidth,
            height: layout.frameHeight,
            backgroundColor: null,
        });
        context.drawImage(chromeCanvas, layout.outset, layout.outset, layout.frameWidth, layout.frameHeight);
    }
    return output;
}
export function downloadCanvasPng(canvas, filename) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Failed to encode the preview PNG."));
                return;
            }
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = filename;
            anchor.rel = "noopener";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            resolve();
        }, "image/png");
    });
}
//# sourceMappingURL=devicePreviewCapture.js.map