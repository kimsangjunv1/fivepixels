"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
const DemoInteractionContext = createContext("showcase");
export function DemoInteractionProvider({ interaction, children, }) {
    return _jsx(DemoInteractionContext.Provider, { value: interaction, children: children });
}
export function useDemoInteraction() {
    return useContext(DemoInteractionContext);
}
export function useDemoLocked() {
    return useDemoInteraction() === "showcase";
}
//# sourceMappingURL=DemoInteractionContext.js.map