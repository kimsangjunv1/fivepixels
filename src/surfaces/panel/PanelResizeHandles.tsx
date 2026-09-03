import { ResizeHandle as ResizeHandleControl } from "@/surfaces/window/ResizeHandle.js";
import type { ResizeHandle } from "@/shared/hooks/useGhostCornerResize.js";
import type { PanelResizeEdge } from "@/shared/hooks/usePanelResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ReportMessages } from "@/shared/i18n/types.js";
import { isVerticalResizeEdge } from "@/shared/utils/panel/resizeHandles.js";

type PanelResizeHandlesProps = {
    edges: PanelResizeEdge[];
    inactive?: boolean;
    heightResizeEnabled?: boolean;
    messages: ReportMessages;
    createResizePointerDown: (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLElement>) => void;
};

const EDGE_ARIA_LABEL: Record<PanelResizeEdge, "resizeWidthAriaLabel" | "resizeHeightAriaLabel"> = {
    top: "resizeHeightAriaLabel",
    bottom: "resizeHeightAriaLabel",
    left: "resizeWidthAriaLabel",
    right: "resizeWidthAriaLabel",
};

export function PanelResizeHandles({ edges, inactive = false, heightResizeEnabled = true, messages, createResizePointerDown }: PanelResizeHandlesProps) {
    return (
        <>
            {edges.map((edge) => (
                <ResizeHandleControl
                    key={edge}
                    edge={edge}
                    ariaLabel={messages.panel[EDGE_ARIA_LABEL[edge]]}
                    inactive={inactive || (!heightResizeEnabled && isVerticalResizeEdge(edge))}
                    onPointerDown={createResizePointerDown({ kind: "edge", edge })}
                />
            ))}
        </>
    );
}
