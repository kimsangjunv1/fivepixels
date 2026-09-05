import { type CSSProperties, type ReactNode } from "react";
import type { ResolvedAppearance } from "../shared/types/report-ui.js";
import type { DemoInteraction } from "./types.js";
type DemoRootProps = {
    appearance: ResolvedAppearance;
    width: number;
    height: number;
    interaction: DemoInteraction;
    interactive: boolean;
    className: string;
    style?: CSSProperties;
    ariaLabel?: string;
    children: ReactNode;
};
export declare function DemoRoot({ appearance, width, height, interaction, interactive, className, style, ariaLabel, children }: DemoRootProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DemoRoot.d.ts.map