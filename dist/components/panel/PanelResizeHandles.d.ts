import type { ResizeHandle } from "../../hooks/useGhostCornerResize.js";
import type { PanelResizeEdge } from "../../hooks/usePanelResize.js";
import type { ResizeCorner } from "../../hooks/useGhostCornerResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ReportMessages } from "../../i18n/types.js";
type PanelResizeHandlesProps = {
    edges: PanelResizeEdge[];
    corner: ResizeCorner;
    inactive?: boolean;
    messages: ReportMessages;
    createResizePointerDown: (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare function PanelResizeHandles({ edges, corner, inactive, messages, createResizePointerDown }: PanelResizeHandlesProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelResizeHandles.d.ts.map