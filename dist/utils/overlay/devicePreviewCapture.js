export const DEVICE_PREVIEW_BUTTON_OUTSET = 3;
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
export async function defaultRasterizeElement(element, options) {
    const { toCanvas } = await import("html-to-image");
    const captureHeight = options.cropToViewport ? Math.max(options.height, Math.round(element.scrollHeight) || options.height) : options.height;
    const canvas = await toCanvas(element, {
        width: options.width,
        height: captureHeight,
        pixelRatio: 1,
        skipAutoScale: true,
        backgroundColor: options.backgroundColor ?? undefined,
        skipFonts: true,
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
            overflow: options.cropToViewport ? "visible" : "hidden",
            width: `${options.width}px`,
            height: `${captureHeight}px`,
        },
        filter: (node) => !(node instanceof Element) || !node.hasAttribute("data-fivepixels-skip-capture"),
    });
    if (!options.cropToViewport || (canvas.width === options.width && canvas.height === options.height && element.scrollTop <= 0 && element.scrollLeft <= 0)) {
        return canvas;
    }
    return cropCanvas(canvas, element.scrollLeft, element.scrollTop, options.width, options.height);
}
export async function captureDevicePreview(args) {
    const rasterize = args.rasterize ?? defaultRasterizeElement;
    const { layout } = args;
    const output = document.createElement("canvas");
    output.width = layout.canvasWidth;
    output.height = layout.canvasHeight;
    const context = output.getContext("2d");
    if (!context) {
        throw new Error("Canvas 2D context is unavailable.");
    }
    context.clearRect(0, 0, output.width, output.height);
    context.fillStyle = args.background;
    context.fillRect(layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight);
    const contentCanvas = await rasterize(args.contentRoot, {
        width: layout.screenWidth,
        height: layout.screenHeight,
        backgroundColor: args.background,
        cropToViewport: true,
    });
    context.drawImage(contentCanvas, layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight);
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
        return output;
    }
    if (args.statusBarEnabled && args.statusBarLayer) {
        const statusBarCanvas = await rasterize(args.statusBarLayer, {
            width: layout.screenWidth,
            height: layout.screenHeight,
            backgroundColor: null,
        });
        context.drawImage(statusBarCanvas, layout.screenX, layout.screenY, layout.screenWidth, layout.screenHeight);
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