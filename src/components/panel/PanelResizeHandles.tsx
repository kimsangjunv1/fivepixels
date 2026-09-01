import { CornerResizeHandle } from "@/components/ui/CornerResizeHandle.js";
import { PanelResizeHandle } from "@/components/panel/PanelResizeHandle.js";
import type { ResizeHandle } from "@/hooks/useGhostCornerResize.js";
import type { PanelResizeEdge } from "@/hooks/usePanelResize.js";
import type { ResizeCorner } from "@/hooks/useGhostCornerResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ReportMessages } from "@/i18n/types.js";
import { isVerticalResizeEdge } from "@/utils/panel/resizeHandles.js";

type PanelResizeHandlesProps = {
    edges: PanelResizeEdge[];
    corner: ResizeCorner;
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

export function PanelResizeHandles({ edges, corner, inactive = false, heightResizeEnabled = true, messages, createResizePointerDown }: PanelResizeHandlesProps) {
    return (
        <>
            {edges.map((edge) => (
                <PanelResizeHandle
                    key={edge}
                    edge={edge}
                    ariaLabel={messages.panel[EDGE_ARIA_LABEL[edge]]}
                    inactive={inactive || (!heightResizeEnabled && isVerticalResizeEdge(edge))}
                    onPointerDown={createResizePointerDown({ kind: "edge", edge })}
                />
            ))}
            {/* <CornerResizeHandle
                corner={corner}
                ariaLabel={messages.panel.resizeAriaLabel}
                inactive={inactive}
                onPointerDown={createResizePointerDown({ kind: "corner", corner })}
            /> */}
        </>
    );
}
