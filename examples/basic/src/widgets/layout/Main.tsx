"use client";

import type { PropsWithChildren } from "react";

type MainProps = PropsWithChildren<{
    id?: string;
    className?: {
        container?: string;
        inner?: string;
    };
}>;

export default function Main({ children, id, className }: MainProps) {
    const pathname = typeof window === "undefined" ? "" : window.location.pathname;
    const containerClassName = [pathname ? "main-layout" : "", className?.container].filter(Boolean).join(" ");
    const innerClassName = [pathname ? "main-layout__inner" : "", className?.inner].filter(Boolean).join(" ");

    return (
        <div id={id} className={containerClassName}>
            <div className={innerClassName}>{children}</div>
        </div>
    );
}
