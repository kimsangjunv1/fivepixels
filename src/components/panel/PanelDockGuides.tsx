import type { DockEdge } from "@/types/pinnedFeedback.js";

type PanelDockGuidesProps = {
    visible: boolean;
    activeEdge: DockEdge | null;
};

export function PanelDockGuides({ visible, activeEdge }: PanelDockGuidesProps) {
    if (!visible) {
        return null;
    }

    return (
        <div
            className="fivepixels-dock-guide-layer"
            aria-hidden="true"
        >
            {(["left", "right"] as const).map((edge) => (
                <div
                    key={edge}
                    className={[
                        "fivepixels-dock-guide",
                        "fivepixels-dock-guide--edge-rail",
                        `fivepixels-dock-guide--edge-${edge}`,
                        activeEdge === edge ? "fivepixels-dock-guide--active" : undefined,
                    ]
                        .filter(Boolean)
                        .join(" ")}
                />
            ))}
        </div>
    );
}
