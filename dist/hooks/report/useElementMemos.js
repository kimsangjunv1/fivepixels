import { useCallback, useEffect, useState } from "react";
import { computeMemoElementRatios } from "../../utils/memo/elementMemoMarkers.js";
import { deleteElementMemo, readElementMemos, saveElementMemo } from "../../utils/memo/elementMemos.js";
export function useElementMemos(projectId, pathname) {
    const [elementMemos, setElementMemos] = useState(() => readElementMemos(projectId, pathname));
    const [memoComposer, setMemoComposer] = useState(null);
    useEffect(() => {
        setElementMemos(readElementMemos(projectId, pathname));
        setMemoComposer(null);
    }, [pathname, projectId]);
    const openMemoComposer = useCallback((elementKey, clientX, clientY) => {
        setMemoComposer({ elementKey, clientX, clientY });
    }, []);
    const closeMemoComposer = useCallback(() => {
        setMemoComposer(null);
    }, []);
    const saveMemo = useCallback((elementKey, text) => {
        const existing = elementMemos[elementKey];
        const position = existing?.elementXRatio !== undefined && existing?.elementYRatio !== undefined
            ? {
                elementXRatio: existing.elementXRatio,
                elementYRatio: existing.elementYRatio,
            }
            : memoComposer?.elementKey === elementKey
                ? computeMemoElementRatios(elementKey, memoComposer.clientX, memoComposer.clientY)
                : undefined;
        const next = saveElementMemo(projectId, pathname, elementKey, text, position);
        setElementMemos(next);
        setMemoComposer(null);
    }, [elementMemos, memoComposer, pathname, projectId]);
    const removeMemo = useCallback((elementKey) => {
        const next = deleteElementMemo(projectId, pathname, elementKey);
        setElementMemos(next);
        setMemoComposer(null);
    }, [pathname, projectId]);
    return {
        elementMemos,
        memoComposer,
        openMemoComposer,
        closeMemoComposer,
        saveElementMemo: saveMemo,
        deleteElementMemo: removeMemo,
    };
}
//# sourceMappingURL=useElementMemos.js.map