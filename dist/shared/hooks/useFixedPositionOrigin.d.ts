import { type ReactElement } from "react";
export type FixedPositionOrigin = {
    left: number;
    top: number;
};
/**
 * Measures where `position: fixed; left:0; top:0` actually lands.
 * In fullscreen report hosts this is ~(0,0). Inside embedded demo mounts it can
 * be offset from the viewport, so callers should subtract this origin when
 * applying viewport-based getBoundingClientRect values to fixed layers.
 */
export declare function useFixedPositionOrigin(): {
    origin: FixedPositionOrigin;
    originProbe: ReactElement<any, string | import("react").JSXElementConstructor<any>>;
};
export declare function toFixedLayerPosition(viewportLeft: number, viewportTop: number, origin: FixedPositionOrigin): {
    left: number;
    top: number;
};
//# sourceMappingURL=useFixedPositionOrigin.d.ts.map