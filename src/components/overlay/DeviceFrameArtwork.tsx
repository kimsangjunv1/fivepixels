import type { DeviceChromeSpec, DevicePreviewPreset } from "@/constants/devicePreview.js";

type DeviceFrameArtworkProps = {
    preset: DevicePreviewPreset;
    chrome: DeviceChromeSpec;
    screenWidth: number;
    screenHeight: number;
};

const FRAME_FILL = "#000000";
const FRAME_STROKE = "#1a1a1a";
const DETAIL_FILL = "#0a0a0a";
const DETAIL_STROKE = "#2a2a2a";
const BUTTON_FILL = "#1a1a1a";

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
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

function HardwareButtons({
    chrome,
    frameHeight,
}: {
    chrome: DeviceChromeSpec;
    frameHeight: number;
}) {
    const left = chrome.buttons?.left ?? [];
    const right = chrome.buttons?.right ?? [];

    return (
        <>
            {left.map((button, index) => (
                <div
                    key={`left-${index}`}
                    className="absolute rounded-l-[2px]"
                    style={{
                        left: -3,
                        width: 3,
                        top: frameHeight * button.topRatio,
                        height: button.height,
                        background: BUTTON_FILL,
                    }}
                />
            ))}
            {right.map((button, index) => (
                <div
                    key={`right-${index}`}
                    className="absolute rounded-r-[2px]"
                    style={{
                        right: -3,
                        width: 3,
                        top: frameHeight * button.topRatio,
                        height: button.height,
                        background: BUTTON_FILL,
                    }}
                />
            ))}
        </>
    );
}

function ShellWithScreenHole({
    frameWidth,
    frameHeight,
    frameRadius,
    screenX,
    screenY,
    screenWidth,
    screenHeight,
    screenRadius,
}: {
    frameWidth: number;
    frameHeight: number;
    frameRadius: number;
    screenX: number;
    screenY: number;
    screenWidth: number;
    screenHeight: number;
    screenRadius: number;
}) {
    const outer = roundedRectPath(0.5, 0.5, frameWidth - 1, frameHeight - 1, frameRadius);
    const inner = roundedRectPath(screenX, screenY, screenWidth, screenHeight, screenRadius);

    return (
        <path
            d={`${outer} ${inner}`}
            fill={FRAME_FILL}
            fillRule="evenodd"
            stroke={FRAME_STROKE}
            strokeWidth="1"
        />
    );
}

function HomeButtonFrame({ chrome, screenWidth, screenHeight }: DeviceFrameArtworkProps) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;
    const homeSize = Math.round(Math.min(bezel.bottom * 0.52, frameWidth * 0.145));
    const speakerWidth = Math.round(frameWidth * 0.18);
    const cameraSize = Math.round(frameWidth * 0.028);
    const speakerY = bezel.top * 0.42;
    const cameraCx = (frameWidth - speakerWidth) / 2 - cameraSize * 1.6;

    return (
        <div
            className="absolute overflow-visible"
            style={{ width: frameWidth, height: frameHeight }}
        >
            <svg
                width={frameWidth}
                height={frameHeight}
                viewBox={`0 0 ${frameWidth} ${frameHeight}`}
                className="absolute inset-0"
                aria-hidden
            >
                <ShellWithScreenHole
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    frameRadius={frameRadius}
                    screenX={bezel.left}
                    screenY={bezel.top}
                    screenWidth={screenWidth}
                    screenHeight={screenHeight}
                    screenRadius={screenRadius}
                />

                <rect
                    x={(frameWidth - speakerWidth) / 2}
                    y={speakerY}
                    width={speakerWidth}
                    height={Math.max(5, bezel.top * 0.055)}
                    rx={3}
                    fill={DETAIL_FILL}
                    stroke={DETAIL_STROKE}
                    strokeWidth="1"
                />
                <circle
                    cx={cameraCx}
                    cy={bezel.top * 0.45}
                    r={cameraSize / 2}
                    fill={DETAIL_FILL}
                    stroke={DETAIL_STROKE}
                    strokeWidth="1.2"
                />
                <circle
                    cx={cameraCx}
                    cy={bezel.top * 0.45}
                    r={cameraSize / 5}
                    fill="#1a1a1a"
                />

                <circle
                    cx={frameWidth / 2}
                    cy={bezel.top + screenHeight + bezel.bottom / 2}
                    r={homeSize / 2}
                    fill="none"
                    stroke={DETAIL_STROKE}
                    strokeWidth="2.5"
                />
                <circle
                    cx={frameWidth / 2}
                    cy={bezel.top + screenHeight + bezel.bottom / 2}
                    r={homeSize / 2 - 3}
                    fill={DETAIL_FILL}
                />
            </svg>
            <HardwareButtons
                chrome={chrome}
                frameHeight={frameHeight}
            />
        </div>
    );
}

function BezelShellFrame({
    chrome,
    screenWidth,
    screenHeight,
    showHomeIndicator,
}: {
    chrome: DeviceChromeSpec;
    screenWidth: number;
    screenHeight: number;
    showHomeIndicator?: boolean;
}) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;

    return (
        <div
            className="absolute overflow-visible"
            style={{ width: frameWidth, height: frameHeight }}
        >
            <svg
                width={frameWidth}
                height={frameHeight}
                viewBox={`0 0 ${frameWidth} ${frameHeight}`}
                className="absolute inset-0"
                aria-hidden
            >
                <ShellWithScreenHole
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    frameRadius={frameRadius}
                    screenX={bezel.left}
                    screenY={bezel.top}
                    screenWidth={screenWidth}
                    screenHeight={screenHeight}
                    screenRadius={screenRadius}
                />
            </svg>
            {showHomeIndicator ? (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85"
                    style={{
                        bottom: bezel.bottom + 8,
                        width: Math.min(148, screenWidth * 0.36),
                        height: 5,
                    }}
                />
            ) : null}
            <HardwareButtons
                chrome={chrome}
                frameHeight={frameHeight}
            />
        </div>
    );
}

function NotchFrame({ chrome, screenWidth, screenHeight }: DeviceFrameArtworkProps) {
    // Notch / camera cutout lives in DeviceStatusBar center column (same flex row).
    return (
        <BezelShellFrame
            chrome={chrome}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            showHomeIndicator
        />
    );
}

function IslandFrame({ chrome, screenWidth, screenHeight }: DeviceFrameArtworkProps) {
    // Dynamic Island lives in DeviceStatusBar center column (same flex row).
    return (
        <BezelShellFrame
            chrome={chrome}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            showHomeIndicator
        />
    );
}

function PunchFrame({ chrome, screenWidth, screenHeight }: DeviceFrameArtworkProps) {
    // Punch-hole camera lives in DeviceStatusBar center column (same flex row).
    return (
        <BezelShellFrame
            chrome={chrome}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
        />
    );
}

function TabletFrame({ chrome, screenWidth, screenHeight, preset }: DeviceFrameArtworkProps) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;

    return (
        <div
            className="absolute overflow-visible"
            style={{ width: frameWidth, height: frameHeight }}
        >
            <svg
                width={frameWidth}
                height={frameHeight}
                viewBox={`0 0 ${frameWidth} ${frameHeight}`}
                className="absolute inset-0"
                aria-hidden
            >
                <ShellWithScreenHole
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    frameRadius={frameRadius}
                    screenX={bezel.left}
                    screenY={bezel.top}
                    screenWidth={screenWidth}
                    screenHeight={screenHeight}
                    screenRadius={screenRadius}
                />
                <circle
                    cx={frameWidth / 2}
                    cy={bezel.top / 2}
                    r={preset.frame === "tablet-thin" ? 3.5 : 4.5}
                    fill={DETAIL_FILL}
                    stroke={DETAIL_STROKE}
                    strokeWidth="1"
                />
            </svg>
        </div>
    );
}

function DesktopFrame({ chrome, screenWidth, screenHeight }: DeviceFrameArtworkProps) {
    const { bezel, frameRadius, screenRadius } = chrome;
    const frameWidth = screenWidth + bezel.left + bezel.right;
    const frameHeight = screenHeight + bezel.top + bezel.bottom;

    return (
        <div
            className="absolute overflow-visible"
            style={{ width: frameWidth, height: frameHeight }}
        >
            <svg
                width={frameWidth}
                height={frameHeight}
                viewBox={`0 0 ${frameWidth} ${frameHeight}`}
                className="absolute inset-0"
                aria-hidden
            >
                <ShellWithScreenHole
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    frameRadius={frameRadius}
                    screenX={bezel.left}
                    screenY={bezel.top}
                    screenWidth={screenWidth}
                    screenHeight={screenHeight}
                    screenRadius={screenRadius}
                />
                <circle
                    cx={frameWidth / 2}
                    cy={bezel.top / 2}
                    r={4}
                    fill={DETAIL_FILL}
                />
                <rect
                    x={frameWidth * 0.28}
                    y={frameHeight - bezel.bottom * 0.55}
                    width={frameWidth * 0.44}
                    height={Math.max(8, bezel.bottom * 0.22)}
                    rx={4}
                    fill={DETAIL_FILL}
                />
            </svg>
        </div>
    );
}

export function DeviceFrameArtwork(props: DeviceFrameArtworkProps) {
    switch (props.preset.frame) {
        case "home-button":
            return <HomeButtonFrame {...props} />;
        case "notch":
            return <NotchFrame {...props} />;
        case "island":
            return <IslandFrame {...props} />;
        case "punch":
        case "punch-flat":
            return <PunchFrame {...props} />;
        case "tablet":
        case "tablet-thin":
            return <TabletFrame {...props} />;
        case "desktop":
            return <DesktopFrame {...props} />;
        default:
            return null;
    }
}
