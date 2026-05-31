import type { PanelEdge } from "../../hooks/usePanelDock.js";
import { stitchableClass, stitchablePartProps } from "../report/parts.js";

type PanelDockGuidesProps = {
    visible: boolean;
    activeEdge: PanelEdge | null;
};

const EDGE_GUIDES: PanelEdge[] = ["top", "bottom", "left", "right"];

export function PanelDockGuides({ visible, activeEdge }: PanelDockGuidesProps) {
    if (!visible) {
        return null;
    }

    return (
        <div {...stitchablePartProps("dock-guide-layer")} aria-hidden="true">
            {EDGE_GUIDES.map((edge) => (
                <div
                    key={edge}
                    {...stitchablePartProps("dock-guide", {
                        modifier: edge,
                        className: activeEdge === edge ? stitchableClass("dock-guide", "active") : undefined,
                    })}
                />
            ))}
        </div>
    );
}
