import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { DEVICE_CHROME_COLOR } from "../../shared/constants/devicePreview.js";
const FRAME_FILL = DEVICE_CHROME_COLOR;
const FRAME_STROKE = DEVICE_CHROME_COLOR;
const DETAIL_FILL = "var(--adaptive-tintOpacity300)";
const DETAIL_STROKE = "var(--adaptive-tintOpacity200)";
const BUTTON_FILL = DEVICE_CHROME_COLOR;
function roundedRectPath(x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    return [
        `M ${x + radius} ${y}`,
        `H ${x + w - radius}`,
        `A ${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`,
        `V ${y + h - radius}`,
        `A ${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`,
        `H ${x + radius}`,
        `A ${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`,
        `V ${y + radius}`,
        `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
        "Z",
    ].join(" ");
}
function HardwareButtons({ chrome, frameWidth, frameHeight, }) {
    const left = chrome.buttons?.left ?? [];
    const right = chrome.buttons?.right ?? [];
    const top = chrome.buttons?.top ?? [];
    const bottom = chrome.buttons?.bottom ?? [];
    return (_jsxs(_Fragment, { children: [left.map((button, index) => (_jsx("div", { className: "absolute rounded-l-[2px]", style: {
                    left: -3,
                    width: 3,
                    top: frameHeight * button.topRatio,
                    height: button.height,
                    background: BUTTON_FILL,
                } }, `left-${index}`))), right.map((button, index) => (_jsx("div", { className: "absolute rounded-r-[2px]", style: {
                    right: -3,
                    width: 3,
                    top: frameHeight * button.topRatio,
                    height: button.height,
                    background: BUTTON_FILL,
                } }, `right-${index}`))), top.map((button, index) => (_jsx("div", { className: "absolute rounded-t-[2px]", style: {
                    top: -3,
                    height: 3,
                    left: frameWidth * button.leftRatio,
                    width: button.width,
                    background: BUTTON_FILL,
                } }, `top-${index}`))), bottom.map((button, index) => (_jsx("div", { className: "absolute rounded-b-[2px]", style: {
                    bottom: -3,
                    height: 3,
                    left: frameWidth * button.leftRatio,
                    width: button.width,
                    background: BUTTON_FILL,
                } }, `bottom-${index}`)))] }));
}
function ShellWithScreenHole({ frameWidth, frameHeight, frameRadius, screenX, screenY, screenWidth, screenHeight, screenRadius, }) {
    const outer = roundedRectPath(0.5, 0.5, frameWidth - 1, frameHeight - 1, frameRadius);
    const inner = roundedRectPath(screenX, screenY, screenWidth, screenHeight, screenRadius);
    return (_jsx("path", { d: `${outer} ${inner}`, fill: FRAME_FILL, fillRule: "evenodd", stroke: FRAME_STROKE, strokeWidth: "1" }));
}
function HomeButtonFrame({ chrome, screenWidth, screenHeight }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    const homeSize = Math.round(Math.min(bezel.bottom * 0.58, frameWidth * 0.155));
    const speakerWidth = Math.round(frameWidth * 0.18);
    const cameraSize = Math.round(frameWidth * 0.028);
    const speakerY = bezel.top * 0.42;
    const cameraCx = (frameWidth - speakerWidth) / 2 - cameraSize * 1.6;
    return (_jsxs("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: [_jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("rect", { x: (frameWidth - speakerWidth) / 2, y: speakerY, width: speakerWidth, height: Math.max(5, bezel.top * 0.055), rx: 3, fill: DETAIL_FILL, stroke: DETAIL_STROKE, strokeWidth: "1" }), _jsx("circle", { cx: cameraCx, cy: bezel.top * 0.45, r: cameraSize / 2, fill: DEVICE_CHROME_COLOR }), _jsx("circle", { cx: cameraCx, cy: bezel.top * 0.45, r: cameraSize / 5, fill: DEVICE_CHROME_COLOR }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top + screenHeight + bezel.bottom / 2, r: homeSize / 2, fill: "none", stroke: DETAIL_STROKE, strokeWidth: "2.5" }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top + screenHeight + bezel.bottom / 2, r: homeSize / 2 - 3, fill: DETAIL_FILL })] }), _jsx(HardwareButtons, { chrome: chrome, frameWidth: frameWidth, frameHeight: frameHeight })] }));
}
function BezelShellFrame({ chrome, screenWidth, screenHeight, showHomeIndicator, orientation = "portrait", }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    return (_jsxs("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: [_jsx("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: _jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }) }), showHomeIndicator ? (orientation === "landscape" ? (_jsx("div", { className: "absolute rounded-full bg-[var(--adaptive-tintOpacity800)]", style: {
                    right: bezel.right + 8,
                    top: bezel.top + screenHeight / 2,
                    width: 5,
                    height: Math.min(148, screenHeight * 0.36),
                    transform: "translateY(-50%)",
                } })) : (_jsx("div", { className: "absolute rounded-full bg-[var(--adaptive-tintOpacity800)]", style: {
                    left: bezel.left + screenWidth / 2,
                    bottom: bezel.bottom + 8,
                    width: Math.min(148, screenWidth * 0.36),
                    height: 5,
                    transform: "translateX(-50%)",
                } }))) : null, _jsx(HardwareButtons, { chrome: chrome, frameWidth: frameWidth, frameHeight: frameHeight })] }));
}
function NotchFrame({ chrome, screenWidth, screenHeight, orientation = "portrait" }) {
    // Notch / camera cutout lives in DeviceStatusBar center column (same flex row).
    return (_jsx(BezelShellFrame, { chrome: chrome, screenWidth: screenWidth, screenHeight: screenHeight, showHomeIndicator: true, orientation: orientation }));
}
function IslandFrame({ chrome, screenWidth, screenHeight, orientation = "portrait" }) {
    // Dynamic Island lives in DeviceStatusBar center column (same flex row).
    return (_jsx(BezelShellFrame, { chrome: chrome, screenWidth: screenWidth, screenHeight: screenHeight, showHomeIndicator: true, orientation: orientation }));
}
function PunchFrame({ chrome, screenWidth, screenHeight, orientation = "portrait" }) {
    // Punch-hole camera lives in DeviceStatusBar center column (same flex row).
    return (_jsx(BezelShellFrame, { chrome: chrome, screenWidth: screenWidth, screenHeight: screenHeight, orientation: orientation }));
}
function TabletFrame({ chrome, screenWidth, screenHeight, preset }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    return (_jsx("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: _jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top / 2, r: preset.frame === "tablet-thin" ? 3.5 : 4.5, fill: DEVICE_CHROME_COLOR })] }) }));
}
function DesktopFrame({ chrome, screenWidth, screenHeight }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    return (_jsx("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: _jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top / 2, r: 4, fill: DEVICE_CHROME_COLOR }), _jsx("rect", { x: frameWidth * 0.28, y: frameHeight - bezel.bottom * 0.55, width: frameWidth * 0.44, height: Math.max(8, bezel.bottom * 0.22), rx: 4, fill: DETAIL_FILL })] }) }));
}
export function DeviceFrameArtwork(props) {
    switch (props.preset.frame) {
        case "home-button":
            return _jsx(HomeButtonFrame, { ...props });
        case "notch":
            return _jsx(NotchFrame, { ...props });
        case "island":
            return _jsx(IslandFrame, { ...props });
        case "punch":
        case "punch-flat":
            return _jsx(PunchFrame, { ...props });
        case "tablet":
        case "tablet-thin":
            return _jsx(TabletFrame, { ...props });
        case "desktop":
            return _jsx(DesktopFrame, { ...props });
        default:
            return null;
    }
}
//# sourceMappingURL=DeviceFrameArtwork.js.map