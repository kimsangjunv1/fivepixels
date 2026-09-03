type NativeHoverHandlers = {
    onEnter: () => void;
    onLeave: () => void;
};
export declare function useNativeHover<T extends HTMLElement>(handlers: NativeHoverHandlers): (element: T | null) => void;
export {};
//# sourceMappingURL=useNativeHover.d.ts.map