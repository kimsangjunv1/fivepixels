import { type ReactNode } from "react";
import type { DemoInteraction } from "./types.js";
export declare function DemoInteractionProvider({ interaction, children, }: {
    interaction: DemoInteraction;
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useDemoInteraction(): DemoInteraction;
export declare function useDemoLocked(): boolean;
//# sourceMappingURL=DemoInteractionContext.d.ts.map