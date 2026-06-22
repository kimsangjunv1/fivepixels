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
        <div className="fivepixels-dock-guide-layer" aria-hidden="true">
            {PANEL_CORNERS.map((corner) => (
                <div
                    key={corner}
                    className={[
                        "fivepixels-dock-guide",
                        `fivepixels-dock-guide--${corner}`,
                        activeCorner === corner ? "fivepixels-dock-guide--active" : undefined,
                    ]
                        .filter(Boolean)
                        .join(" ")}
                />
            ))}
        </div>
    );
}
