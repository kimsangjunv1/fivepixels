import type { ReactNode, SVGProps } from "react";
export type MaterialIconProps = {
    className?: string;
    fill?: string;
    children?: ReactNode;
} & Pick<SVGProps<SVGSVGElement>, "aria-hidden" | "aria-label">;
export declare function MaterialIcon({ className, fill, children, ...aria }: MaterialIconProps): import("react").JSX.Element;
//# sourceMappingURL=MaterialIcon.d.ts.map