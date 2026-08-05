import type { ReportAppearance } from "@/types/report.js";

export type ThemePreviewKind = "panel" | "tooltip";

type ThemePreviewSkeletonProps = {
    variant: ReportAppearance;
    kind?: ThemePreviewKind;
};

const GRAIN_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
    </svg>`,
)}")`;

const LIGHT_SHELL = {
    outer: "linear-gradient(145deg, #f8f8f9 0%, #ececee 42%, #f4f4f5 78%, #e8e8ea 100%)",
    grainOpacity: 0.28,
    card: "#ffffff",
    cardShadow: "0 4px 12px rgba(15, 23, 42, 0.14), 0 1px 2px rgba(15, 23, 42, 0.06)",
    ink: "#3f3f46",
    inkSoft: "#d4d4d8",
    inkMuted: "#a1a1aa",
};

const DARK_SHELL = {
    outer: "linear-gradient(145deg, #3a3a3c 0%, #1a1a1c 48%, #111113 100%)",
    grainOpacity: 0.4,
    card: "#2c2c2e",
    cardShadow: "0 4px 12px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35)",
    ink: "#f4f4f5",
    inkSoft: "#52525b",
    inkMuted: "#71717a",
};

type ShellPalette = typeof LIGHT_SHELL;

function GrainLayer({ opacity }: { opacity: number }) {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{
                opacity,
                backgroundImage: GRAIN_BACKGROUND,
                backgroundSize: "120px 120px",
            }}
        />
    );
}

function PanelCardContent({ ink, inkSoft, inkMuted }: Pick<ShellPalette, "ink" | "inkSoft" | "inkMuted">) {
    return (
        <div className="relative h-full w-full">
            <span
                className="absolute top-[12%] left-[12%] h-[9px] w-[9px] rounded-full"
                style={{ backgroundColor: ink }}
            />
            <span
                className="absolute top-[15%] right-[12%] h-[5px] w-[22%] rounded-full"
                style={{ backgroundColor: inkSoft }}
            />
            <span
                className="absolute top-[40%] left-[12%] h-[4px] w-[76%] rounded-full"
                style={{ backgroundColor: inkSoft }}
            />
            <span
                className="absolute top-[54%] left-[12%] h-[4px] w-[58%] rounded-full"
                style={{ backgroundColor: inkSoft }}
            />
            <span
                className="absolute top-[68%] left-[12%] h-[4px] w-[46%] rounded-full"
                style={{ backgroundColor: inkMuted }}
            />
            <span
                className="absolute right-[12%] bottom-[12%] h-[8px] w-[8px] rounded-full"
                style={{ backgroundColor: ink }}
            />
        </div>
    );
}

function PanelShell({ palette }: { palette: ShellPalette }) {
    return (
        <div className="relative h-full w-full overflow-hidden" style={{ background: palette.outer }}>
            <GrainLayer opacity={palette.grainOpacity} />
            <div
                className="absolute inset-[12%] overflow-hidden rounded-[8px]"
                style={{ backgroundColor: palette.card, boxShadow: palette.cardShadow }}
            >
                <PanelCardContent
                    ink={palette.ink}
                    inkSoft={palette.inkSoft}
                    inkMuted={palette.inkMuted}
                />
            </div>
        </div>
    );
}

function PanelSystemShell() {
    return (
        <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 flex">
                <div className="relative min-w-0 flex-1 overflow-hidden" style={{ background: DARK_SHELL.outer }}>
                    <GrainLayer opacity={DARK_SHELL.grainOpacity} />
                </div>
                <div className="relative min-w-0 flex-1 overflow-hidden" style={{ background: LIGHT_SHELL.outer }}>
                    <GrainLayer opacity={LIGHT_SHELL.grainOpacity} />
                </div>
            </div>
            <div
                className="absolute inset-[12%] overflow-hidden rounded-[8px]"
                style={{ boxShadow: "0 4px 12px rgba(15, 23, 42, 0.22), 0 1px 2px rgba(15, 23, 42, 0.08)" }}
            >
                <div className="absolute inset-0 flex">
                    <div className="min-w-0 flex-1" style={{ backgroundColor: DARK_SHELL.card }} />
                    <div className="min-w-0 flex-1" style={{ backgroundColor: LIGHT_SHELL.card }} />
                </div>
                <div className="relative h-full w-full">
                    <span
                        className="absolute top-[12%] left-[12%] h-[9px] w-[9px] rounded-full"
                        style={{ backgroundColor: DARK_SHELL.ink }}
                    />
                    <span
                        className="absolute top-[15%] right-[12%] h-[5px] w-[22%] rounded-full"
                        style={{ backgroundColor: LIGHT_SHELL.inkSoft }}
                    />
                    <div className="absolute top-[40%] right-[12%] left-[12%] flex h-[4px] overflow-hidden rounded-full">
                        <span className="h-full flex-1" style={{ backgroundColor: DARK_SHELL.inkSoft }} />
                        <span className="h-full flex-1" style={{ backgroundColor: LIGHT_SHELL.inkSoft }} />
                    </div>
                    <div className="absolute top-[54%] left-[12%] flex h-[4px] w-[58%] overflow-hidden rounded-full">
                        <span className="h-full w-1/2" style={{ backgroundColor: DARK_SHELL.inkSoft }} />
                        <span className="h-full w-1/2" style={{ backgroundColor: LIGHT_SHELL.inkSoft }} />
                    </div>
                    <div className="absolute top-[68%] left-[12%] flex h-[4px] w-[46%] overflow-hidden rounded-full">
                        <span className="h-full w-[55%]" style={{ backgroundColor: DARK_SHELL.inkMuted }} />
                        <span className="h-full flex-1" style={{ backgroundColor: LIGHT_SHELL.inkMuted }} />
                    </div>
                    <span
                        className="absolute right-[12%] bottom-[12%] h-[8px] w-[8px] rounded-full"
                        style={{ backgroundColor: LIGHT_SHELL.ink }}
                    />
                </div>
            </div>
        </div>
    );
}

function TooltipBubbleContent({ ink, inkSoft, inkMuted }: Pick<ShellPalette, "ink" | "inkSoft" | "inkMuted">) {
    return (
        <>
            <div className="mb-[8px] flex items-center gap-[6px]">
                <span className="block h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: ink }} />
                <span className="block h-[4px] flex-1 rounded-full" style={{ backgroundColor: inkSoft }} />
            </div>
            <div className="flex flex-col gap-[5px]">
                <span className="block h-[3px] w-full rounded-full" style={{ backgroundColor: inkSoft }} />
                <span className="block h-[3px] w-[82%] rounded-full" style={{ backgroundColor: inkSoft }} />
                <span className="block h-[3px] w-[58%] rounded-full" style={{ backgroundColor: inkMuted }} />
            </div>
        </>
    );
}

function TooltipShell({ palette }: { palette: ShellPalette }) {
    return (
        <div className="relative h-full w-full overflow-hidden" style={{ background: palette.outer }}>
            <GrainLayer opacity={palette.grainOpacity} />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[10%]">
                <div className="relative w-full max-w-[78%]">
                    <div
                        className="overflow-hidden rounded-[8px] px-[10px] py-[9px]"
                        style={{ backgroundColor: palette.card, boxShadow: palette.cardShadow }}
                    >
                        <TooltipBubbleContent
                            ink={palette.ink}
                            inkSoft={palette.inkSoft}
                            inkMuted={palette.inkMuted}
                        />
                    </div>
                    <span
                        aria-hidden
                        className="absolute top-full left-1/2 -mt-px h-[7px] w-[10px] -translate-x-1/2"
                        style={{
                            backgroundColor: palette.card,
                            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                            filter: "drop-shadow(0 1px 1px rgba(15, 23, 42, 0.12))",
                        }}
                    />
                </div>
                <span
                    className="mt-[10px] block h-[5px] w-[30%] rounded-full opacity-65"
                    style={{ backgroundColor: palette.inkMuted }}
                />
            </div>
        </div>
    );
}

function TooltipSystemShell() {
    return (
        <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 flex">
                <div className="relative min-w-0 flex-1 overflow-hidden" style={{ background: DARK_SHELL.outer }}>
                    <GrainLayer opacity={DARK_SHELL.grainOpacity} />
                </div>
                <div className="relative min-w-0 flex-1 overflow-hidden" style={{ background: LIGHT_SHELL.outer }}>
                    <GrainLayer opacity={LIGHT_SHELL.grainOpacity} />
                </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-[10%]">
                <div
                    className="relative w-full max-w-[78%] overflow-hidden rounded-[8px]"
                    style={{ boxShadow: "0 4px 12px rgba(15, 23, 42, 0.22)" }}
                >
                    <div className="flex">
                        <div className="min-w-0 flex-1 px-[10px] py-[9px]" style={{ backgroundColor: DARK_SHELL.card }}>
                            <div className="mb-[8px] flex items-center gap-[6px]">
                                <span className="block h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: DARK_SHELL.ink }} />
                                <span className="block h-[4px] flex-1 rounded-full" style={{ backgroundColor: DARK_SHELL.inkSoft }} />
                            </div>
                            <div className="flex flex-col gap-[5px]">
                                <span className="block h-[3px] w-full rounded-full" style={{ backgroundColor: DARK_SHELL.inkSoft }} />
                                <span className="block h-[3px] w-[82%] rounded-full" style={{ backgroundColor: DARK_SHELL.inkSoft }} />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1 px-[10px] py-[9px]" style={{ backgroundColor: LIGHT_SHELL.card }}>
                            <div className="mb-[8px] h-[7px]" />
                            <div className="flex flex-col gap-[5px]">
                                <span className="block h-[3px] w-full rounded-full" style={{ backgroundColor: LIGHT_SHELL.inkSoft }} />
                                <span className="block h-[3px] w-[58%] rounded-full" style={{ backgroundColor: LIGHT_SHELL.inkMuted }} />
                            </div>
                        </div>
                    </div>
                </div>
                <span className="mt-[10px] block h-[5px] w-[30%] rounded-full bg-[#71717a] opacity-65" />
            </div>
        </div>
    );
}

export function ThemePreviewSkeleton({ variant, kind = "panel" }: ThemePreviewSkeletonProps) {
    if (kind === "tooltip") {
        if (variant === "system") {
            return <TooltipSystemShell />;
        }

        return <TooltipShell palette={variant === "dark" ? DARK_SHELL : LIGHT_SHELL} />;
    }

    if (variant === "system") {
        return <PanelSystemShell />;
    }

    return <PanelShell palette={variant === "dark" ? DARK_SHELL : LIGHT_SHELL} />;
}
