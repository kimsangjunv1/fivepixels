import { type DevicePreviewQrPanelProps } from "./DevicePreviewQrPanel.js";
type DevicePreviewQrCardProps = Omit<DevicePreviewQrPanelProps, "pageHref" | "className" | "width"> & {
    left: number;
    maxWidth: number;
};
export declare function DevicePreviewQrCard({ left, maxWidth, ...panelProps }: DevicePreviewQrCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DevicePreviewQrCard.d.ts.map