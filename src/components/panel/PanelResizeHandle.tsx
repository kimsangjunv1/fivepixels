import type { PanelResizeEdge } from "@/hooks/usePanelResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";

type PanelResizeHandleProps = {
    edge: PanelResizeEdge;
    ariaLabel: string;
    inactive?: boolean;
    active?: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};

export const PANEL_RESIZE_ACTIVE_COLOR = "#F6572E";

const EDGE_CLASS: Record<PanelResizeEdge, string> = {
    top: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
    bottom: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
    left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
};

const PILL_CLASS: Record<PanelResizeEdge, string> = {
    top: "h-[6px] w-[28px]",
    bottom: "h-[6px] w-[28px]",
    left: "h-[28px] w-[6px]",
    right: "h-[28px] w-[6px]",
};

const CURSOR_CLASS: Record<PanelResizeEdge, string> = {
    top: "cursor-ns-resize",
    bottom: "cursor-ns-resize",
    left: "cursor-ew-resize",
    right: "cursor-ew-resize",
};

export function PanelResizeHandle({ edge, ariaLabel, inactive = false, active = false, onPointerDown }: PanelResizeHandleProps) {
    const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (inactive) {
            return;
        }

        onPointerDown(event);
    };

    return (
        <div
            role="button"
            tabIndex={inactive ? -1 : 0}
            aria-label={ariaLabel}
            aria-disabled={inactive}
            onPointerDown={handlePointerDown}
            className={`absolute z-20 flex items-center justify-center outline-none ${EDGE_CLASS[edge]} ${inactive ? "pointer-events-none" : CURSOR_CLASS[edge]}`}
        >
            <span
                className={`rounded-full border shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-[opacity,background-color,border-color] ${PILL_CLASS[edge]} ${
                    inactive ? "opacity-30" : "opacity-100"
                } ${
                    active
                        ? "border-[#F6572E] bg-[#F6572E]"
                        : "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)]"
                }`}
            />
        </div>
    );
}
