import { useEffect, useId, useRef, type CSSProperties, type ElementType } from "react";

export type TextShimmerProps = {
    children: string;
    as?: ElementType;
    className?: string;
    duration?: number;
    style?: CSSProperties;
    color?: {
        start: string;
        end: string;
    };
};

export function Shimmer({
    children,
    as: Component = "span",
    className = "",
    style = {},
    color = {
        start: "var(--color-brand-500)",
        end: "rgba(0,0,0,1)",
    },
    duration = 2,
}: TextShimmerProps) {
    const shimmerName = `text-shimmer-${useId().replace(/:/g, "")}`;
    const shimmerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const nodeRoot = shimmerRef.current?.getRootNode();
        const root = nodeRoot instanceof ShadowRoot ? nodeRoot : document.head;
        root.querySelector(`#${CSS.escape(shimmerName)}`)?.remove();

        const keyframes = `
      @keyframes ${shimmerName} {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
    `;

        const styleTag = document.createElement("style");
        styleTag.id = shimmerName;
        styleTag.textContent = keyframes;
        root.appendChild(styleTag);

        return () => {
            styleTag.remove();
        };
    }, [color.end, color.start, duration, shimmerName]);

    return (
        <Component
            ref={shimmerRef}
            className={`relative inline-block bg-clip-text text-transparent [background-size:400%_100%] ${className}`}
            style={{
                ...style,
                backgroundImage: `linear-gradient(90deg, ${color.start} 0%, ${color.end} 50%, ${color.start} 100%)`,
                backgroundSize: "400% 100%",
                backgroundRepeat: "repeat",
                backgroundPosition: "0% 0%",
                animation: `${shimmerName} ${duration}s linear infinite`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
            }}
        >
            {children}
        </Component>
    );
}
