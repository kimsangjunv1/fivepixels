import { type PanelSettingsInitialCategory } from "./PanelSettings.js";
type PanelProps = {
    /** Render the production panel inside a bounded preview instead of docking it to the viewport. */
    embedded?: boolean;
    /** Initial settings section for embedded previews. */
    embeddedSettingsInitialCategory?: PanelSettingsInitialCategory | null;
};
export declare function Panel({ embedded, embeddedSettingsInitialCategory }?: PanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Panel.d.ts.map