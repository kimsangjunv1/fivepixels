import type { ElementMemoMap } from "../../utils/memo/elementMemos.js";
export type ElementMemoComposerState = {
    elementKey: string;
    clientX: number;
    clientY: number;
};
export declare function useElementMemos(projectId: string, pathname: string): {
    elementMemos: ElementMemoMap;
    memoComposer: ElementMemoComposerState | null;
    openMemoComposer: (elementKey: string, clientX: number, clientY: number) => void;
    closeMemoComposer: () => void;
    saveElementMemo: (elementKey: string, text: string) => void;
    deleteElementMemo: (elementKey: string) => void;
};
//# sourceMappingURL=useElementMemos.d.ts.map