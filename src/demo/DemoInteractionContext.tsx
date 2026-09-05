"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DemoInteraction } from "./types.js";

const DemoInteractionContext = createContext<DemoInteraction>("showcase");

export function DemoInteractionProvider({
    interaction,
    children,
}: {
    interaction: DemoInteraction;
    children: ReactNode;
}) {
    return <DemoInteractionContext.Provider value={interaction}>{children}</DemoInteractionContext.Provider>;
}

export function useDemoInteraction(): DemoInteraction {
    return useContext(DemoInteractionContext);
}

export function useDemoLocked(): boolean {
    return useDemoInteraction() === "showcase";
}
