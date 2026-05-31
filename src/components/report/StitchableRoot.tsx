import { useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { useReport } from "../../providers/reportContext.js";
import { ensureReportStyles } from "./ensureReportStyles.js";
import { createStitchableLayoutVars, STITCHABLE_ROOT_ATTR, STITCHABLE_THEME_ATTR } from "./parts.js";

type StitchableRootProps = {
    children: ReactNode;
    style?: CSSProperties;
};

export function StitchableRoot({ children, style }: StitchableRootProps) {
    const { resolvedAppearance, isMobileViewport } = useReport();

    useLayoutEffect(() => {
        ensureReportStyles();
    }, []);

    return (
        <div
            {...{
                [STITCHABLE_ROOT_ATTR]: "",
                [STITCHABLE_THEME_ATTR]: resolvedAppearance,
            }}
            style={{
                ...createStitchableLayoutVars(isMobileViewport),
                ...style,
            }}
        >
            {children}
        </div>
    );
}
