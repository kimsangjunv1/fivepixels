import type { ReportAppearance } from "@/types/report.js";

type ThemePreviewSkeletonProps = {
    variant: ReportAppearance;
};

const LIGHT = {
    surface: "#ffffff",
    sidebar: "#e8eaed",
    header: "#f1f3f4",
    line: "#dadce0",
    accent: "#4285f4",
};

const DARK = {
    surface: "#1f1f1f",
    sidebar: "#2d2d2d",
    header: "#292929",
    line: "#3c3c3c",
    accent: "#8ab4f8",
};

function MiniLayoutPreview({ palette }: { palette: typeof LIGHT }) {
    return (
        <div className="flex h-full w-full overflow-hidden rounded-[4px]" style={{ backgroundColor: palette.surface }}>
            <div className="w-[28%] shrink-0" style={{ backgroundColor: palette.sidebar }} />
            <div className="flex min-w-0 flex-1 flex-col p-[3px]">
                <div className="mb-[3px] h-[5px] rounded-[1px]" style={{ backgroundColor: palette.header }} />
                <div className="mb-[2px] h-[2px] w-[85%] rounded-[1px]" style={{ backgroundColor: palette.line }} />
                <div className="mb-[2px] h-[2px] w-[70%] rounded-[1px]" style={{ backgroundColor: palette.line }} />
                <div className="mt-[1px] h-[6px] w-[40%] rounded-[1px]" style={{ backgroundColor: palette.accent, opacity: 0.75 }} />
            </div>
        </div>
    );
}

export function ThemePreviewSkeleton({ variant }: ThemePreviewSkeletonProps) {
    if (variant === "system") {
        return (
            <div className="flex h-full w-full overflow-hidden rounded-[4px]">
                <div className="min-w-0 flex-1">
                    <MiniLayoutPreview palette={LIGHT} />
                </div>
                <div className="min-w-0 flex-1">
                    <MiniLayoutPreview palette={DARK} />
                </div>
            </div>
        );
    }

    return <MiniLayoutPreview palette={variant === "dark" ? DARK : LIGHT} />;
}
