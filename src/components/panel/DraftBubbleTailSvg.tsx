import type { DraftPopoverTailCorner } from "../../utils/coordinates.js";

/** iMessage-style tail (bottom-left anchor on the bubble). */
const TAIL_PATH_BOTTOM_LEFT = "M17.5 16.5c-1.4 0-2.5-1.1-2.5-2.5V0h5c0 3.9 3.1 7 7 7v9.5H17.5z";

const TAIL_VIEWBOX = "0 0 22 17";

type DraftBubbleTailSvgProps = {
    corner: DraftPopoverTailCorner;
};

export function DraftBubbleTailSvg({ corner }: DraftBubbleTailSvgProps) {
    const transform =
        corner === "bottom-left"
            ? undefined
            : corner === "bottom-right"
              ? "scale(-1, 1) translate(-22, 0)"
              : corner === "top-left"
                ? "scale(1, -1) translate(0, -17)"
                : "scale(-1, -1) translate(-22, -17)";

    const positionClass =
        corner === "bottom-left"
            ? "bottom-[2px] left-0 -translate-x-[7px] translate-y-[1px]"
            : corner === "bottom-right"
              ? "bottom-0 right-0 translate-x-[7px] translate-y-[1px]"
              : corner === "top-left"
                ? "top-0 left-0 -translate-x-[7px] -translate-y-[1px]"
                : "top-0 right-0 translate-x-[7px] -translate-y-[1px]";

    return (
        <svg
            width="19"
            height="24"
            viewBox="0 0 19 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`pointer-events-none scale-x-[-1] absolute z-20 block shrink-0 ${positionClass}`}
            style={{
                transform: "scaleX(-1)",
            }}
        >
            <path
                d="M19 24C7.6 24 1.9 22 0 20C7.6 14 9.5 10 11.4 0C11.4 10 11.4 16 19 24Z"
                fill="#0074FB"
                // transform={transform}
            />
        </svg>

        // <svg
        //     aria-hidden
        //     width={22}
        //     height={17}
        //     viewBox={TAIL_VIEWBOX}
        //     className={`pointer-events-none absolute z-20 block shrink-0 ${positionClass}`}
        // >
        //     <path
        //         d={TAIL_PATH_BOTTOM_LEFT}
        //         fill="var(--adaptive-blue500, #3182f6)"
        //         transform={transform}
        //     />
        // </svg>
    );
}
