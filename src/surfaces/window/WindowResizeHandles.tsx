import { ResizeHandle as ResizeHandleControl } from "./ResizeHandle.js";
import type { ResizeEdge, ResizeHandle } from "@/shared/hooks/useGhostCornerResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";

export const ALL_WINDOW_RESIZE_EDGES: ResizeEdge[] = ["top", "bottom", "left", "right"];

type WindowResizeHandlesProps = {
    inactive?: boolean;
    resizeWidthAriaLabel: string;
    resizeHeightAriaLabel: string;
    createResizePointerDown: (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLElement>) => void;
};

const EDGE_ARIA_LABEL_KEY: Record<ResizeEdge, keyof Pick<WindowResizeHandlesProps, "resizeWidthAriaLabel" | "resizeHeightAriaLabel">> = {
    top: "resizeHeightAriaLabel",
    bottom: "resizeHeightAriaLabel",
    left: "resizeWidthAriaLabel",
    right: "resizeWidthAriaLabel",
};

export function WindowResizeHandles({ inactive = false, resizeWidthAriaLabel, resizeHeightAriaLabel, createResizePointerDown }: WindowResizeHandlesProps) {
    const ariaLabels = {
        resizeWidthAriaLabel,
        resizeHeightAriaLabel,
    };

    return (
        <>
            {ALL_WINDOW_RESIZE_EDGES.map((edge) => (
                <ResizeHandleControl
                    key={edge}
                    edge={edge}
                    ariaLabel={ariaLabels[EDGE_ARIA_LABEL_KEY[edge]]}
                    inactive={inactive}
                    onPointerDown={createResizePointerDown({ kind: "edge", edge })}
                />
            ))}
        </>
    );
}
