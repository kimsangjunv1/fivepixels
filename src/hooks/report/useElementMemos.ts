import { useCallback, useEffect, useState } from "react";
import type { ElementMemoMap } from "@/utils/memo/elementMemos.js";
import { computeMemoElementRatios } from "@/utils/memo/elementMemoMarkers.js";
import { deleteElementMemo, readElementMemos, saveElementMemo } from "@/utils/memo/elementMemos.js";

export type ElementMemoComposerState = {
    elementKey: string;
    clientX: number;
    clientY: number;
};

export function useElementMemos(projectId: string, pathname: string) {
    const [elementMemos, setElementMemos] = useState<ElementMemoMap>(() => readElementMemos(projectId, pathname));
    const [memoComposer, setMemoComposer] = useState<ElementMemoComposerState | null>(null);

    useEffect(() => {
        setElementMemos(readElementMemos(projectId, pathname));
        setMemoComposer(null);
    }, [pathname, projectId]);

    const openMemoComposer = useCallback((elementKey: string, clientX: number, clientY: number) => {
        setMemoComposer({ elementKey, clientX, clientY });
    }, []);

    const closeMemoComposer = useCallback(() => {
        setMemoComposer(null);
    }, []);

    const saveMemo = useCallback(
        (elementKey: string, text: string) => {
            const existing = elementMemos[elementKey];
            const position =
                existing?.elementXRatio !== undefined && existing?.elementYRatio !== undefined
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
        },
        [elementMemos, memoComposer, pathname, projectId],
    );

    const removeMemo = useCallback(
        (elementKey: string) => {
            const next = deleteElementMemo(projectId, pathname, elementKey);
            setElementMemos(next);
            setMemoComposer(null);
        },
        [pathname, projectId],
    );

    return {
        elementMemos,
        memoComposer,
        openMemoComposer,
        closeMemoComposer,
        saveElementMemo: saveMemo,
        deleteElementMemo: removeMemo,
    };
}
