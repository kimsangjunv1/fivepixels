export type ElementMemoPosition = {
    elementXRatio: number;
    elementYRatio: number;
};
export type ElementMemoEntry = {
    text: string;
    updatedAt: string;
    elementXRatio?: number;
    elementYRatio?: number;
};
export type ElementMemoMap = Record<string, ElementMemoEntry>;
export declare function readElementMemos(projectId: string, pathname: string): ElementMemoMap;
export declare function saveElementMemo(projectId: string, pathname: string, elementKey: string, text: string, position?: ElementMemoPosition): ElementMemoMap;
export declare function deleteElementMemo(projectId: string, pathname: string, elementKey: string): ElementMemoMap;
//# sourceMappingURL=elementMemos.d.ts.map