import type { ResizeCorner } from "@/hooks/useGhostCornerResize.js";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type CornerResizeHandleProps = {
    corner: ResizeCorner;
    ariaLabel: string;
    inactive?: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};

const POSITION_CLASS: Record<ResizeCorner, string> = {
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
};

const CURSOR_CLASS: Record<ResizeCorner, string> = {
    "bottom-right": "cursor-nwse-resize",
    "bottom-left": "cursor-nesw-resize",
    "top-right": "cursor-nesw-resize",
    "top-left": "cursor-nwse-resize",
};

/** Pin the SVG inner corner on the hit-area center (= panel corner). */
const ICON_STYLE: Record<ResizeCorner, CSSProperties> = {
    "bottom-right": {
        left: "50%",
        top: "50%",
    },
    "top-left": {
        left: "50%",
        top: "50%",
        transform: "translate(-100%, -100%) rotate(180deg)",
        transformOrigin: "100% 100%",
    },
    "top-right": {
        left: "50%",
        top: "50%",
        transform: "translate(0, -100%) scaleY(-1)",
        transformOrigin: "0% 100%",
    },
    "bottom-left": {
        left: "50%",
        top: "50%",
        transform: "translate(-100%, 0) scaleX(-1)",
        transformOrigin: "100% 0%",
    },
};

function CornerHandleIcon({ corner }: { corner: ResizeCorner }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="pointer-events-none absolute block drop-shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
            style={ICON_STYLE[corner]}
        >
            <path
                d="M2 14C2 7.82 7.82 2 14 2"
                stroke="var(--adaptive-surface-overlay)"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function CornerResizeHandle({ corner, ariaLabel, inactive = false, onPointerDown }: CornerResizeHandleProps) {
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
            className={`absolute z-20 h-[24px] w-[24px] outline-none ${POSITION_CLASS[corner]} ${
                inactive ? "pointer-events-none opacity-40" : CURSOR_CLASS[corner]
            }`}
        >
            <CornerHandleIcon corner={corner} />
        </div>
    );
}
