import type { ReactNode } from "react";
import type { ResolvedAppearance } from "@/types/report-ui.js";

type ThemeScopeProps = {
    appearance: ResolvedAppearance;
    children: ReactNode;
    className?: string;
};

export function ThemeScope({ appearance, children, className = "contents" }: ThemeScopeProps) {
    return (
        <div
            data-fivepixels-theme-scope=""
            data-fivepixels-theme={appearance}
            className={className}
        >
            {children}
        </div>
    );
}
