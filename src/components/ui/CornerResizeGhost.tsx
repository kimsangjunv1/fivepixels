import type { Ref } from "react";

type CornerResizeGhostProps = {
    ghostRef: Ref<HTMLDivElement>;
    zIndexClassName?: string;
};

export function CornerResizeGhost({ ghostRef, zIndexClassName = "z-[1000002]" }: CornerResizeGhostProps) {
    return (
        <div
            ref={ghostRef}
            aria-hidden
            className={`pointer-events-none fixed ${zIndexClassName} rounded-[12px] border-2 border-[var(--adaptive-blue500)] bg-[color-mix(in_srgb,var(--adaptive-blue500)_18%,transparent)]`}
        />
    );
}
