import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ElementMention, ElementMentionCandidate } from "@/types/mention.js";
import { findElementMentionCandidates, getAtQuery, replaceActiveMentionQuery, toStoredMention } from "@/utils/mention/elementMentions.js";
import {
    deleteMentionChipBeforeCaret,
    getCaretClientRect,
    getEditorCaretPoint,
    placeCaretAfterMention,
    renderMentionEditorContent,
    serializeMentionEditor,
    serializeMentionEditorBeforeCaret,
} from "@/utils/mention/mentionComposerDom.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { ensureReportTooltipLayer } from "@/utils/shared/dom.js";

type MentionComposerInputProps = {
    value: string;
    mentions: ElementMention[];
    onChange: (next: { message: string; mentions: ElementMention[] }) => void;
    placeholder: string;
    autoFocus?: boolean;
    onSubmitShortcut?: () => void;
    onMultilineChange?: (isMultiline: boolean) => void;
    reserveInlineStart?: number;
};

const EDITOR_MIN_HEIGHT = 32;
const EDITOR_MAX_HEIGHT = 200;
const MENU_GAP = 6;

type MenuPlacement = {
    top: number;
    left: number;
    width: number;
    placeAbove: boolean;
};

function placeCaretAtEnd(element: HTMLElement) {
    const selection = window.getSelection();

    if (!selection) {
        return;
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

export function MentionComposerInput({ value, mentions, onChange, placeholder, autoFocus = false, onSubmitShortcut, onMultilineChange }: MentionComposerInputProps) {
    const { messages } = useReportPreferences();
    const { setMentionHighlightTarget } = useReportSession();
    const editorRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const mentionsRef = useRef(mentions);
    const skipSyncRef = useRef(false);
    const isComposingRef = useRef(false);
    const activeAtOffsetRef = useRef<number | null>(null);
    const [query, setQuery] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<ElementMentionCandidate[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [menuPlacement, setMenuPlacement] = useState<MenuPlacement | null>(null);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const lastMultilineRef = useRef<boolean | null>(null);

    mentionsRef.current = mentions;

    const syncHeight = useCallback(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        editor.style.height = "auto";
        const nextHeight = Math.min(Math.max(EDITOR_MIN_HEIGHT, editor.scrollHeight), EDITOR_MAX_HEIGHT);
        editor.style.height = `${nextHeight}px`;
        editor.style.overflowY = editor.scrollHeight > EDITOR_MAX_HEIGHT ? "auto" : "hidden";

        const isMultiline = (editor.textContent ?? "").includes("\n") || nextHeight > EDITOR_MIN_HEIGHT + 8;

        if (lastMultilineRef.current === isMultiline) {
            return;
        }

        lastMultilineRef.current = isMultiline;
        onMultilineChange?.(isMultiline);
    }, [onMultilineChange]);

    const refreshMentionQuery = useCallback(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        const caret = getEditorCaretPoint(editor);
        const before = serializeMentionEditorBeforeCaret(editor, mentionsRef.current, caret);
        const resolved = before ? getAtQuery(before.message) : getAtQuery(serializeMentionEditor(editor, mentionsRef.current).message);

        activeAtOffsetRef.current = resolved?.atOffsetInBefore ?? null;
        setQuery(resolved ? resolved.query : null);
    }, []);

    useLayoutEffect(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        if (skipSyncRef.current) {
            skipSyncRef.current = false;
            syncHeight();
            return;
        }

        if (isComposingRef.current) {
            syncHeight();
            return;
        }

        const serialized = serializeMentionEditor(editor, mentionsRef.current);

        if (serialized.message === value) {
            syncHeight();
            return;
        }

        renderMentionEditorContent(editor, value, mentions);
        syncHeight();
    }, [value, mentions, syncHeight]);

    useEffect(() => {
        if (!autoFocus) {
            return;
        }

        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        editor.focus();
        placeCaretAtEnd(editor);
    }, [autoFocus]);

    useEffect(() => {
        setPortalRoot(ensureReportTooltipLayer());
    }, []);

    useEffect(() => {
        if (query === null) {
            setCandidates([]);
            setMentionHighlightTarget(null);
            return;
        }

        const nextCandidates = findElementMentionCandidates(query);
        setCandidates(nextCandidates);
        setActiveIndex(0);
    }, [query, setMentionHighlightTarget]);

    useLayoutEffect(() => {
        if (query === null || !rootRef.current) {
            setMenuPlacement(null);
            return;
        }

        const updatePlacement = () => {
            const anchor = rootRef.current;
            const editor = editorRef.current;

            if (!anchor) {
                return;
            }

            const caretRect = editor ? getCaretClientRect(editor) : null;
            const rootRect = anchor.getBoundingClientRect();
            const width = Math.min(280, Math.max(200, rootRect.width));
            const anchorTop = caretRect?.top ?? rootRect.top;
            const anchorBottom = caretRect?.bottom ?? rootRect.bottom;
            const anchorLeft = caretRect?.left ?? rootRect.left;
            const spaceAbove = anchorTop - 8;
            const placeAbove = spaceAbove >= 96;
            const left = Math.min(Math.max(8, anchorLeft), window.innerWidth - width - 8);

            setMenuPlacement({
                top: placeAbove ? Math.max(8, anchorTop - MENU_GAP) : anchorBottom + MENU_GAP,
                left,
                width,
                placeAbove,
            });
        };

        updatePlacement();
        window.addEventListener("resize", updatePlacement);
        window.addEventListener("scroll", updatePlacement, true);

        return () => {
            window.removeEventListener("resize", updatePlacement);
            window.removeEventListener("scroll", updatePlacement, true);
        };
    }, [query, candidates.length]);

    useEffect(() => {
        if (query === null) {
            setMentionHighlightTarget(null);
            return;
        }

        const active = candidates[activeIndex];
        setMentionHighlightTarget(active?.snapshot ?? null);
    }, [activeIndex, candidates, query, setMentionHighlightTarget]);

    useEffect(() => {
        return () => {
            setMentionHighlightTarget(null);
        };
    }, [setMentionHighlightTarget]);

    const emitFromEditor = () => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        skipSyncRef.current = true;
        const next = serializeMentionEditor(editor, mentionsRef.current);
        onChange(next);
        syncHeight();
        refreshMentionQuery();
    };

    const insertCandidate = (candidate: ElementMentionCandidate) => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        const current = serializeMentionEditor(editor, mentionsRef.current);
        const caret = getEditorCaretPoint(editor);
        const before = serializeMentionEditorBeforeCaret(editor, mentionsRef.current, caret);
        const resolved =
            (before ? getAtQuery(before.message) : null) ??
            (query !== null && activeAtOffsetRef.current !== null ? { query, atOffsetInBefore: activeAtOffsetRef.current } : getAtQuery(current.message));

        if (!resolved) {
            return;
        }

        const mention = toStoredMention(candidate);
        const nextMessage = replaceActiveMentionQuery(current.message, resolved.query, mention, resolved.atOffsetInBefore);

        if (!nextMessage) {
            return;
        }

        const nextMentions = [...current.mentions.filter((item) => item.id !== mention.id), mention];

        mentionsRef.current = nextMentions;
        activeAtOffsetRef.current = null;
        setQuery(null);
        setMentionHighlightTarget(null);
        setMenuPlacement(null);

        renderMentionEditorContent(editor, nextMessage, nextMentions);
        skipSyncRef.current = true;
        onChange({ message: nextMessage, mentions: nextMentions });
        syncHeight();

        editor.focus();
        placeCaretAfterMention(editor, mention.id);
    };

    const showPlaceholder = useMemo(() => value.trim().length === 0 && query === null, [value, query]);
    const showMenu = query !== null && Boolean(portalRoot);

    const menu =
        showMenu && portalRoot
            ? createPortal(
                  <div
                      role="listbox"
                      aria-label={messages.composer.mentionListAriaLabel}
                      data-fivepixels-interactive=""
                      className="fixed z-[1000002] max-h-[180px] overflow-y-auto rounded-[12px] border border-[var(--adaptive-border-subtle)]  bg-[var(--adaptive-neutralTintOpacity500)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                      style={
                          menuPlacement
                              ? menuPlacement.placeAbove
                                  ? {
                                        bottom: window.innerHeight - menuPlacement.top,
                                        left: menuPlacement.left,
                                        width: menuPlacement.width,
                                    }
                                  : {
                                        top: menuPlacement.top,
                                        left: menuPlacement.left,
                                        width: menuPlacement.width,
                                    }
                              : {
                                    // Fallback before first layout measure so the menu never "fails to open".
                                    bottom: 24,
                                    left: 24,
                                    width: 280,
                                }
                      }
                  >
                      {candidates.length === 0 ? (
                          <p className="px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]">{messages.composer.mentionEmpty}</p>
                      ) : (
                          candidates.map((candidate, index) => {
                              const active = index === activeIndex;

                              return (
                                  <button
                                      key={`${candidate.targetSelector}-${candidate.label}-${index}`}
                                      type="button"
                                      role="option"
                                      aria-selected={active}
                                      data-fivepixels-interactive=""
                                      className={
                                          "flex w-full flex-col gap-[2px] px-[4px] py-[2px] text-left border-none " + (active ? "bg-[var(--adaptive-blue100)]" : "hover:bg-[var(--adaptive-black100)]")
                                      }
                                      onMouseEnter={() => setActiveIndex(index)}
                                      onMouseDown={(event) => {
                                          event.preventDefault();
                                          insertCandidate(candidate);
                                      }}
                                  >
                                      <span className="truncate text-[12px] font-semibold text-[var(--adaptive-black900)]">{candidate.label}</span>
                                      <span className="truncate text-[11px] text-[var(--adaptive-black500)]">
                                          {candidate.reportId ?? candidate.suggestedReportId ?? candidate.element.tagName.toLowerCase()}
                                      </span>
                                  </button>
                              );
                          })
                      )}
                  </div>,
                  portalRoot,
              )
            : null;

    return (
        <div
            ref={rootRef}
            className="relative min-w-0 flex-1"
        >
            {showPlaceholder ? <span className="pointer-events-none absolute left-[4px] top-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-muted)]">{placeholder}</span> : null}

            <div
                ref={editorRef}
                contentEditable
                role="textbox"
                aria-multiline="true"
                aria-label={placeholder}
                data-fivepixels-interactive=""
                suppressContentEditableWarning
                className="max-h-[200px] w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-[4px] py-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none"
                style={{ minHeight: EDITOR_MIN_HEIGHT }}
                onInput={() => {
                    if (isComposingRef.current) {
                        refreshMentionQuery();
                        syncHeight();
                        return;
                    }

                    emitFromEditor();
                }}
                onKeyUp={() => refreshMentionQuery()}
                onClick={() => refreshMentionQuery()}
                onCompositionStart={() => {
                    isComposingRef.current = true;
                }}
                onCompositionUpdate={() => {
                    refreshMentionQuery();
                }}
                onCompositionEnd={() => {
                    isComposingRef.current = false;
                    emitFromEditor();
                }}
                onKeyDown={(event) => {
                    if (query !== null) {
                        if (event.key === "ArrowDown" && candidates.length > 0) {
                            event.preventDefault();
                            setActiveIndex((current) => (current + 1) % candidates.length);
                            return;
                        }

                        if (event.key === "ArrowUp" && candidates.length > 0) {
                            event.preventDefault();
                            setActiveIndex((current) => (current - 1 + candidates.length) % candidates.length);
                            return;
                        }

                        if (event.key === "Enter" && !event.metaKey && !event.ctrlKey && candidates.length > 0) {
                            event.preventDefault();
                            const active = candidates[activeIndex];

                            if (active) {
                                insertCandidate(active);
                            }

                            return;
                        }

                        if (event.key === "Escape") {
                            event.preventDefault();
                            setQuery(null);
                            activeAtOffsetRef.current = null;
                            setMentionHighlightTarget(null);
                            return;
                        }
                    }

                    if (event.key === "Backspace" && !event.metaKey && !event.ctrlKey && !event.altKey) {
                        const editor = editorRef.current;

                        if (editor) {
                            const deleted = deleteMentionChipBeforeCaret(editor, mentionsRef.current);

                            if (deleted) {
                                event.preventDefault();
                                mentionsRef.current = deleted.mentions;
                                skipSyncRef.current = true;
                                onChange(deleted);
                                syncHeight();
                                refreshMentionQuery();
                                return;
                            }
                        }
                    }

                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        onSubmitShortcut?.();
                    }
                }}
            />

            {menu}
        </div>
    );
}
