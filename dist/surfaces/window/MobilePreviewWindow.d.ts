import { type ReactNode } from "react";
type MobilePreviewWindowProps = {
    /** Render the production preview window inside a bounded preview instead of the viewport. */
    embedded?: boolean;
    /** Optional host content used in embedded demos instead of loading an iframe. */
    embeddedContent?: ReactNode;
};
export declare function MobilePreviewWindow({ embedded, embeddedContent }?: MobilePreviewWindowProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=MobilePreviewWindow.d.ts.map