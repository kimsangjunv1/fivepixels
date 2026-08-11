import type { ReactNode } from "react";
import type { DevicePreviewFrame, DevicePreviewPreset } from "@/constants/devicePreview.js";

type StatusBarAppearance = "light" | "dark";

type DeviceStatusBarProps = {
    preset: DevicePreviewPreset;
    width: number;
    scale?: number;
    appearance?: StatusBarAppearance;
};

const IOS_TIME = "9:41";
const ANDROID_TIME = "9:41";

function themeColors(appearance: StatusBarAppearance) {
    if (appearance === "dark") {
        return {
            background: "#000000",
            foreground: "#ffffff",
        };
    }

    return {
        background: "#F2F2F7",
        foreground: "#000000",
    };
}

function getStatusBarHeight(frame: DevicePreviewFrame, width: number) {
    switch (frame) {
        case "home-button":
            return Math.round(width * (20 / 375));
        case "notch":
            return Math.round(width * (47 / 390));
        case "island":
            return Math.round(width * (54 / 393));
        case "punch":
        case "punch-flat":
            return Math.round(width * (24 / 360));
        case "tablet":
        case "tablet-thin":
            return Math.round(width * (24 / 768));
        case "desktop":
            return 0;
        default:
            return Math.round(width * 0.06);
    }
}

/** Match DeviceFrameArtwork cutout sizes for the center column. */
function getCutoutSize(frame: DevicePreviewFrame, width: number) {
    if (frame === "notch") {
        return {
            width: Math.round(width * 0.34),
            height: Math.round(Math.max(28, width * 0.08)),
            kind: "notch" as const,
        };
    }

    if (frame === "island") {
        return {
            width: Math.round(Math.min(126, width * 0.32)),
            height: Math.round(Math.max(34, width * 0.085)),
            kind: "island" as const,
        };
    }

    if (frame === "punch" || frame === "punch-flat") {
        const hole = frame === "punch-flat" ? 11 : 12;
        return {
            width: hole * 2 + 8,
            height: hole * 2 + 8,
            kind: "punch" as const,
            hole,
        };
    }

    return null;
}

function CellularIcon({ color, height }: { color: string; height: number }) {
    const barW = height * 0.18;
    const gap = height * 0.1;
    const ratios = [0.3, 0.5, 0.72, 1];
    const w = barW * 4 + gap * 3;

    return (
        <svg
            width={w}
            height={height}
            viewBox={`0 0 ${w} ${height}`}
            aria-hidden
        >
            {ratios.map((ratio, index) => {
                const h = height * ratio;
                return (
                    <rect
                        key={index}
                        x={index * (barW + gap)}
                        y={height - h}
                        width={barW}
                        height={h}
                        rx={barW / 2}
                        fill={color}
                    />
                );
            })}
        </svg>
    );
}

function WifiIcon({ color, size }: { color: string; size: number }) {
    return (
        <svg
            width={size}
            height={size * 0.72}
            viewBox="0 0 16 11.5"
            aria-hidden
        >
            <circle
                cx="8"
                cy="10.15"
                r="1.2"
                fill={color}
            />
            <path
                d="M5.1 7.25c1.6-1.55 4.2-1.55 5.8 0"
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M2.75 4.85c2.9-2.85 7.6-2.85 10.5 0"
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M0.55 2.45c4.1-4 10.8-4 14.9 0"
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function BatteryIcon({ color, width }: { color: string; width: number }) {
    const h = width * 0.48;
    const bodyW = width * 0.82;
    const tipW = Math.max(1.5, width * 0.075);
    const inset = Math.max(1.15, h * 0.18);

    return (
        <svg
            width={width}
            height={h}
            viewBox={`0 0 ${width} ${h}`}
            aria-hidden
        >
            <rect
                x="0.7"
                y="0.7"
                width={bodyW - 1.4}
                height={h - 1.4}
                rx={h * 0.26}
                fill="none"
                stroke={color}
                strokeWidth="1.35"
                opacity="0.45"
            />
            <rect
                x={inset}
                y={inset}
                width={bodyW - inset * 2}
                height={h - inset * 2}
                rx={h * 0.14}
                fill={color}
            />
            <path
                d={`M ${bodyW - 0.2} ${h * 0.3}
                    h ${tipW * 0.35}
                    a ${tipW / 2} ${tipW / 2} 0 0 1 0 ${h * 0.4}
                    h ${-tipW * 0.35}
                    z`}
                fill={color}
                opacity="0.45"
            />
        </svg>
    );
}

function TrailingIcons({ color, iconH }: { color: string; iconH: number }) {
    return (
        <div
            className="flex items-center justify-center"
            style={{ gap: Math.max(4, iconH * 0.42), color }}
        >
            <CellularIcon
                color={color}
                height={iconH}
            />
            <WifiIcon
                color={color}
                size={iconH * 1.05}
            />
            <BatteryIcon
                color={color}
                width={iconH * 2.05}
            />
        </div>
    );
}

function CutoutCenter({ frame, width }: { frame: DevicePreviewFrame; width: number }) {
    const cutout = getCutoutSize(frame, width);
    if (!cutout) {
        return (
            <div
                className="h-full shrink-0"
                style={{ width: Math.max(8, width * 0.08) }}
            />
        );
    }

    if (cutout.kind === "notch") {
        return (
            <div
                className="flex shrink-0 items-end justify-center"
                style={{ width: cutout.width, height: "100%" }}
            >
                <div
                    style={{
                        width: cutout.width,
                        height: cutout.height,
                        background: "#000000",
                        borderBottomLeftRadius: cutout.height * 0.45,
                        borderBottomRightRadius: cutout.height * 0.45,
                    }}
                />
            </div>
        );
    }

    if (cutout.kind === "island") {
        return (
            <div
                className="flex shrink-0 items-center justify-center"
                style={{ width: cutout.width, height: "100%" }}
            >
                <div
                    style={{
                        width: cutout.width,
                        height: cutout.height,
                        borderRadius: 999,
                        background: "#000000",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)",
                    }}
                />
            </div>
        );
    }

    const hole = cutout.hole ?? 12;
    return (
        <div
            className="flex shrink-0 items-center justify-center"
            style={{ width: cutout.width, height: "100%" }}
        >
            <div
                style={{
                    width: hole * 2,
                    height: hole * 2,
                    borderRadius: 999,
                    background: "#000000",
                    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.3)",
                }}
            />
        </div>
    );
}

function TimeLabel({ color, children }: { color: string; children: string }) {
    return (
        <span
            style={{
                color,
                WebkitTextFillColor: color,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
            }}
        >
            {children}
        </span>
    );
}

function StatusRow({
    width,
    frame,
    color,
    fontFamily,
    fontSize,
    fontWeight,
    left,
    right,
    showCutout,
}: {
    width: number;
    frame: DevicePreviewFrame;
    color: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    left: ReactNode;
    right: ReactNode;
    showCutout: boolean;
}) {
    return (
        <div
            className="flex h-full w-full items-center"
            style={{
                color,
                WebkitTextFillColor: color,
                fontFamily,
                fontSize,
                fontWeight,
                letterSpacing: "-0.02em",
            }}
        >
            <div className="flex min-w-0 flex-1 items-center justify-center">{left}</div>
            {showCutout ? (
                <CutoutCenter
                    frame={frame}
                    width={width}
                />
            ) : (
                <div
                    className="h-full shrink-0"
                    style={{ width: Math.max(8, width * 0.08) }}
                />
            )}
            <div className="flex min-w-0 flex-1 items-center justify-center">{right}</div>
        </div>
    );
}

export function getDeviceStatusBarHeight(preset: DevicePreviewPreset, screenWidth: number, scale = 1) {
    return Math.max(0, Math.round(getStatusBarHeight(preset.frame, screenWidth) * scale));
}

export function DeviceStatusBar({
    preset,
    width,
    scale = 1,
    appearance = "light",
}: DeviceStatusBarProps) {
    if (preset.frame === "desktop") {
        return null;
    }

    const height = getDeviceStatusBarHeight(preset, width, scale);
    const { background, foreground } = themeColors(appearance);
    const iconH = Math.max(10, Math.min(14, width * 0.032));
    const iosFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
    const androidFont = 'Roboto, "Noto Sans", system-ui, sans-serif';

    let content: ReactNode = null;

    if (preset.frame === "home-button") {
        content = (
            <div
                className="flex h-full w-full items-center"
                style={{
                    color: foreground,
                    WebkitTextFillColor: foreground,
                    fontFamily: iosFont,
                    fontSize: Math.max(12, width * (12 / 375)),
                    fontWeight: 600,
                }}
            >
                <div
                    className="flex min-w-0 flex-1 items-center justify-center"
                    style={{ gap: 4 }}
                >
                    <TimeLabel color={foreground}>SKT</TimeLabel>
                    <CellularIcon
                        color={foreground}
                        height={iconH * 0.9}
                    />
                </div>
                <div className="flex shrink-0 items-center justify-center">
                    <TimeLabel color={foreground}>{IOS_TIME}</TimeLabel>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-center">
                    <TrailingIcons
                        color={foreground}
                        iconH={iconH}
                    />
                </div>
            </div>
        );
    } else if (preset.frame === "notch" || preset.frame === "island") {
        content = (
            <StatusRow
                width={width}
                frame={preset.frame}
                color={foreground}
                fontFamily={iosFont}
                fontSize={Math.max(15, width * (15 / 393))}
                fontWeight={600}
                showCutout
                left={<TimeLabel color={foreground}>{IOS_TIME}</TimeLabel>}
                right={
                    <TrailingIcons
                        color={foreground}
                        iconH={Math.max(11, width * (12 / 393))}
                    />
                }
            />
        );
    } else if (preset.frame === "punch" || preset.frame === "punch-flat") {
        content = (
            <StatusRow
                width={width}
                frame={preset.frame}
                color={foreground}
                fontFamily={androidFont}
                fontSize={Math.max(11, width * (12 / 360))}
                fontWeight={500}
                showCutout
                left={<TimeLabel color={foreground}>{ANDROID_TIME}</TimeLabel>}
                right={
                    <div
                        className="flex items-center justify-center"
                        style={{ gap: 6, color: foreground }}
                    >
                        <WifiIcon
                            color={foreground}
                            size={iconH}
                        />
                        <CellularIcon
                            color={foreground}
                            height={iconH * 0.95}
                        />
                        <BatteryIcon
                            color={foreground}
                            width={iconH * 2}
                        />
                    </div>
                }
            />
        );
    } else if (preset.frame === "tablet" || preset.frame === "tablet-thin") {
        content = (
            <StatusRow
                width={width}
                frame={preset.frame}
                color={foreground}
                fontFamily={iosFont}
                fontSize={Math.max(12, width * (13 / 768))}
                fontWeight={600}
                showCutout={false}
                left={<TimeLabel color={foreground}>{IOS_TIME}</TimeLabel>}
                right={
                    <TrailingIcons
                        color={foreground}
                        iconH={Math.max(10, height * 0.4)}
                    />
                }
            />
        );
    }

    if (!content) {
        return null;
    }

    return (
        <div
            className="pointer-events-none absolute left-0 right-0 top-0 overflow-hidden"
            style={{ height, background, color: foreground, WebkitTextFillColor: foreground }}
            data-fivepixels-device-status-bar={preset.frame}
            aria-hidden
        >
            {content}
        </div>
    );
}
