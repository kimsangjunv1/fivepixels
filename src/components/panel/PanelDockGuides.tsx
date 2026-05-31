import { PANEL_CORNERS, type PanelCorner } from "../../hooks/usePanelDock.js";
import { stitchableClass, stitchablePartProps } from "../report/parts.js";

type PanelDockGuidesProps = {
    visible: boolean;
    activeCorner: PanelCorner | null;
};

export function PanelDockGuides({ visible, activeCorner }: PanelDockGuidesProps) {
    if (!visible) {
        return null;
    }

    return (
        <div {...stitchablePartProps("dock-guide-layer")} aria-hidden="true">
            {PANEL_CORNERS.map((corner) => (
                <div
                    key={corner}
                    {...stitchablePartProps("dock-guide", {
                        modifier: corner,
                        className: activeCorner === corner ? stitchableClass("dock-guide", "active") : undefined,
                    })}
                />
            ))}
        </div>
    );
}
