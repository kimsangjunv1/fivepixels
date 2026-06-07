import { PANEL_CORNERS, type PanelCorner } from "@/hooks/usePanelDock.js";

type PanelDockGuidesProps = {
    visible: boolean;
    activeCorner: PanelCorner | null;
};

export function PanelDockGuides({ visible, activeCorner }: PanelDockGuidesProps) {
    if (!visible) {
        return null;
    }

    return (
        <div className="stitchable-dock-guide-layer" aria-hidden="true">
            {PANEL_CORNERS.map((corner) => (
                <div
                    key={corner}
                    className={[
                        "stitchable-dock-guide",
                        `stitchable-dock-guide--${corner}`,
                        activeCorner === corner ? "stitchable-dock-guide--active" : undefined,
                    ]
                        .filter(Boolean)
                        .join(" ")}
                />
            ))}
        </div>
    );
}
