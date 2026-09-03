import { DevicePreviewQrPanel, type DevicePreviewQrPanelProps } from "./DevicePreviewQrPanel.js";

type DevicePreviewQrCardProps = Omit<DevicePreviewQrPanelProps, "pageHref" | "className" | "width"> & {
    left: number;
    maxWidth: number;
};

export function DevicePreviewQrCard({
    left,
    maxWidth,
    ...panelProps
}: DevicePreviewQrCardProps) {
    const pageHref = typeof window !== "undefined" ? window.location.href : "";
    const width = Math.max(168, Math.min(220, maxWidth));

    return (
        <div
            className="pointer-events-auto fixed z-[1000001] top-[50%]"
            style={{
                left,
                width,
                maxWidth: Math.max(0, maxWidth),
                transform: "translateY(-50%)",
            }}
        >
            <DevicePreviewQrPanel
                {...panelProps}
                pageHref={pageHref}
                width={width}
            />
        </div>
    );
}
