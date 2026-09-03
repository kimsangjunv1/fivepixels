import type { ReactNode, SVGProps } from "react";

export type MaterialIconProps = {
    className?: string;
    fill?: string;
    children?: ReactNode;
} & Pick<SVGProps<SVGSVGElement>, "aria-hidden" | "aria-label">;

export function MaterialIcon({ className, fill = "currentColor", children, ...aria }: MaterialIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill={fill}
            className={className}
            aria-hidden={aria["aria-hidden"] ?? true}
            aria-label={aria["aria-label"]}
        >
            {children}
        </svg>
    );
}
