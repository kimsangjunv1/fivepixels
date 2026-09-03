import { useEffect, useState } from "react";

export function useIsMobileViewport() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const sync = () => setIsMobile(window.innerWidth <= 768);

        sync();
        window.addEventListener("resize", sync);
        return () => window.removeEventListener("resize", sync);
    }, []);

    return isMobile;
}
