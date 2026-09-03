import type { ResizeHandle } from "../../shared/hooks/useGhostCornerResize.js";
import type { PanelResizeEdge } from "../../shared/hooks/usePanelResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ReportMessages } from "../../shared/i18n/types.js";
type PanelResizeHandlesProps = {
    edges: PanelResizeEdge[];
    inactive?: boolean;
    heightResizeEnabled?: boolean;
    messages: ReportMessages;
    createResizePointerDown: (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare function PanelResizeHandles({ edges, inactive, heightResizeEnabled, messages, createResizePointerDown }: PanelResizeHandlesProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelResizeHandles.d.ts.map