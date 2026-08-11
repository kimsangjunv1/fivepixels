import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const FRAME_FILL = "#000000";
const FRAME_STROKE = "#1a1a1a";
const DETAIL_FILL = "#0a0a0a";
const DETAIL_STROKE = "#2a2a2a";
const BUTTON_FILL = "#1a1a1a";
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
function HardwareButtons({ chrome, frameHeight, }) {
    const left = chrome.buttons?.left ?? [];
    const right = chrome.buttons?.right ?? [];
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
                } }, `right-${index}`)))] }));
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
    const homeSize = Math.round(Math.min(bezel.bottom * 0.52, frameWidth * 0.145));
    const speakerWidth = Math.round(frameWidth * 0.18);
    const cameraSize = Math.round(frameWidth * 0.028);
    const speakerY = bezel.top * 0.42;
    const cameraCx = (frameWidth - speakerWidth) / 2 - cameraSize * 1.6;
    return (_jsxs("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: [_jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("rect", { x: (frameWidth - speakerWidth) / 2, y: speakerY, width: speakerWidth, height: Math.max(5, bezel.top * 0.055), rx: 3, fill: DETAIL_FILL, stroke: DETAIL_STROKE, strokeWidth: "1" }), _jsx("circle", { cx: cameraCx, cy: bezel.top * 0.45, r: cameraSize / 2, fill: DETAIL_FILL, stroke: DETAIL_STROKE, strokeWidth: "1.2" }), _jsx("circle", { cx: cameraCx, cy: bezel.top * 0.45, r: cameraSize / 5, fill: "#1a1a1a" }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top + screenHeight + bezel.bottom / 2, r: homeSize / 2, fill: "none", stroke: DETAIL_STROKE, strokeWidth: "2.5" }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top + screenHeight + bezel.bottom / 2, r: homeSize / 2 - 3, fill: DETAIL_FILL })] }), _jsx(HardwareButtons, { chrome: chrome, frameHeight: frameHeight })] }));
}
function NotchFrame({ chrome, screenWidth, screenHeight }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    const notchWidth = Math.round(screenWidth * 0.34);
    const notchHeight = Math.round(Math.max(28, screenWidth * 0.08));
    const notchX = bezel.left + (screenWidth - notchWidth) / 2;
    return (_jsxs("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: [_jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("path", { d: `
                      M ${notchX} ${bezel.top}
                      h ${notchWidth}
                      v ${notchHeight * 0.55}
                      q 0 ${notchHeight * 0.45} ${-notchHeight * 0.45} ${notchHeight * 0.45}
                      h ${-(notchWidth - notchHeight * 0.9)}
                      q ${-notchHeight * 0.45} 0 ${-notchHeight * 0.45} ${-notchHeight * 0.45}
                      Z
                    `, fill: FRAME_FILL }), _jsx("circle", { cx: bezel.left + screenWidth / 2, cy: bezel.top + notchHeight * 0.42, r: 3.2, fill: DETAIL_FILL, stroke: DETAIL_STROKE, strokeWidth: "1" })] }), _jsx("div", { className: "absolute left-1/2 -translate-x-1/2 rounded-full bg-white/80", style: {
                    bottom: bezel.bottom + 8,
                    width: Math.min(140, screenWidth * 0.34),
                    height: 5,
                } }), _jsx(HardwareButtons, { chrome: chrome, frameHeight: frameHeight })] }));
}
function IslandFrame({ chrome, screenWidth, screenHeight }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    const islandWidth = Math.round(Math.min(126, screenWidth * 0.32));
    const islandHeight = Math.round(Math.max(34, screenWidth * 0.085));
    return (_jsxs("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: [_jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("rect", { x: bezel.left + (screenWidth - islandWidth) / 2, y: bezel.top + 10, width: islandWidth, height: islandHeight, rx: islandHeight / 2, ry: islandHeight / 2, fill: FRAME_FILL, stroke: "rgba(255,255,255,0.16)", strokeWidth: "1" }), _jsx("circle", { cx: bezel.left + (screenWidth + islandWidth) / 2 - 16, cy: bezel.top + 10 + islandHeight / 2, r: 4, fill: DETAIL_FILL, stroke: DETAIL_STROKE, strokeWidth: "1" })] }), _jsx("div", { className: "absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85", style: {
                    bottom: bezel.bottom + 8,
                    width: Math.min(148, screenWidth * 0.36),
                    height: 5,
                } }), _jsx(HardwareButtons, { chrome: chrome, frameHeight: frameHeight })] }));
}
function PunchFrame({ chrome, screenWidth, screenHeight, preset }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    const hole = preset.frame === "punch-flat" ? 11 : 12;
    return (_jsxs("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: [_jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("circle", { cx: bezel.left + screenWidth / 2, cy: bezel.top + 16, r: hole, fill: FRAME_FILL, stroke: "rgba(255,255,255,0.3)", strokeWidth: "2" }), _jsx("circle", { cx: bezel.left + screenWidth / 2, cy: bezel.top + 16, r: hole * 0.35, fill: DETAIL_FILL })] }), _jsx(HardwareButtons, { chrome: chrome, frameHeight: frameHeight })] }));
}
function TabletFrame({ chrome, screenWidth, screenHeight, preset }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    return (_jsx("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: _jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top / 2, r: preset.frame === "tablet-thin" ? 3.5 : 4.5, fill: DETAIL_FILL, stroke: DETAIL_STROKE, strokeWidth: "1" })] }) }));
}
function DesktopFrame({ chrome, screenWidth, screenHeight }) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    return (_jsx("div", { className: "absolute overflow-visible", style: { width: frameWidth, height: frameHeight }, children: _jsxs("svg", { width: frameWidth, height: frameHeight, viewBox: `0 0 ${frameWidth} ${frameHeight}`, className: "absolute inset-0", "aria-hidden": true, children: [_jsx(ShellWithScreenHole, { frameWidth: frameWidth, frameHeight: frameHeight, frameRadius: frameRadius, screenX: bezel.left, screenY: bezel.top, screenWidth: screenWidth, screenHeight: screenHeight, screenRadius: screenRadius }), _jsx("circle", { cx: frameWidth / 2, cy: bezel.top / 2, r: 4, fill: DETAIL_FILL }), _jsx("rect", { x: frameWidth * 0.28, y: frameHeight - bezel.bottom * 0.55, width: frameWidth * 0.44, height: Math.max(8, bezel.bottom * 0.22), rx: 4, fill: DETAIL_FILL })] }) }));
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