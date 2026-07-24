import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ElementMention, ElementMentionCandidate } from "@/types/mention.js";
import { mentionPlainLabel, serializeMentionToken } from "@/types/mention.js";
import {
    findElementMentionCandidates,
    parseMentionMessage,
    replaceActiveMentionQuery,
    resolveActiveMentionQuery,
    toStoredMention,
} from "@/utils/mention/elementMentions.js";
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
const MENTION_CHIP_CLASS =
    "mx-[1px] inline-flex items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[1px] text-[13px] font-semibold text-[var(--adaptive-blue600)] align-baseline";

type MenuPlacement = {
    top: number;
    left: number;
    width: number;
    placeAbove: boolean;
};

function serializeEditor(root: HTMLElement, mentions: ElementMention[]) {
    const mentionById = new Map(mentions.map((item) => [item.id, item]));
    const used: ElementMention[] = [];
    let message = "";

    const visit = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            message += node.textContent ?? "";
            return;
        }

        if (!(node instanceof HTMLElement)) {
            return;
        }

        const mentionId = node.dataset.mentionId;

        if (mentionId) {
            const mention = mentionById.get(mentionId);

            if (mention) {
                message += serializeMentionToken(mention.id);
                used.push(mention);
            } else {
                message += node.textContent ?? "";
            }

            return;
        }

        if (node.tagName === "BR") {
            message += "\n";
            return;
        }

        for (const child of Array.from(node.childNodes)) {
            visit(child);
        }
    };

    for (const child of Array.from(root.childNodes)) {
        visit(child);
    }

    const uniqueUsed = Array.from(new Map(used.map((item) => [item.id, item])).values());

    return { message, mentions: uniqueUsed };
}

function renderEditorContent(root: HTMLElement, message: string, mentions: ElementMention[]) {
    root.replaceChildren();
    const parts = parseMentionMessage(message, mentions);

    for (const part of parts) {
        if (part.type === "text") {
            const lines = part.value.split("\n");

            lines.forEach((line, index) => {
                if (line) {
                    root.appendChild(document.createTextNode(line));
                }

                if (index < lines.length - 1) {
                    root.appendChild(document.createElement("br"));
                }
            });
            continue;
        }

        const chip = document.createElement("span");
        chip.contentEditable = "false";
        chip.dataset.mentionId = part.mention.id;
        chip.className = MENTION_CHIP_CLASS;
        chip.textContent = mentionPlainLabel(part.mention);
        root.appendChild(chip);
    }
}

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

function getTextBeforeCaret(root: HTMLElement) {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selection.anchorNode || !root.contains(selection.anchorNode)) {
        return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    range.selectNodeContents(root);
    range.setEnd(selection.getRangeAt(0).endContainer, selection.getRangeAt(0).endOffset);

    return range.toString();
}

function placeCaretAfterMention(editor: HTMLElement, mentionId: string) {
    const selection = window.getSelection();
    const chip = editor.querySelector(`[data-mention-id="${CSS.escape(mentionId)}"]`);

    if (!selection) {
        return;
    }

    const range = document.createRange();

    if (chip?.nextSibling) {
        range.setStart(chip.nextSibling, chip.nextSibling.nodeType === Node.TEXT_NODE ? (chip.nextSibling.textContent?.length ?? 0) : 0);
        range.collapse(true);
    } else if (chip) {
        range.setStartAfter(chip);
        range.collapse(true);
    } else {
        range.selectNodeContents(editor);
        range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
}

export function MentionComposerInput({
    value,
    mentions,
    onChange,
    placeholder,
    autoFocus = false,
    onSubmitShortcut,
    onMultilineChange,
    reserveInlineStart = 0,
}: MentionComposerInputProps) {
    const { messages } = useReportPreferences();
    const { setMentionHighlightTarget } = useReportSession();
    const editorRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const mentionsRef = useRef(mentions);
    const skipSyncRef = useRef(false);
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

        const serialized = serializeEditor(editor, mentionsRef.current).message;
        const textBeforeCaret = getTextBeforeCaret(editor);
        const resolved = resolveActiveMentionQuery({
            textBeforeCaret,
            // When Selection briefly leaves the editor (keyup / IME / portal), still detect `@query` from draft.
            serializedMessage: textBeforeCaret === null ? serialized : null,
        });

        setQuery(resolved ? resolved.query : null);
    }, []);

    useLayoutEffect(() => {
        const editor = editorRef.current;

        if (!editor || skipSyncRef.current) {
            skipSyncRef.current = false;
            syncHeight();
            return;
        }

        const serialized = serializeEditor(editor, mentionsRef.current);

        if (serialized.message === value) {
            syncHeight();
            return;
        }

        renderEditorContent(editor, value, mentions);
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

            if (!anchor) {
                return;
            }

            const rect = anchor.getBoundingClientRect();
            const width = Math.min(280, Math.max(200, rect.width));
            const spaceAbove = rect.top - 8;
            const placeAbove = spaceAbove >= 96;
            const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);

            setMenuPlacement({
                top: placeAbove ? Math.max(8, rect.top - MENU_GAP) : rect.bottom + MENU_GAP,
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
        const next = serializeEditor(editor, mentionsRef.current);
        onChange(next);
        syncHeight();
        refreshMentionQuery();
    };

    const insertCandidate = (candidate: ElementMentionCandidate) => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        const current = serializeEditor(editor, mentionsRef.current);
        const activeQuery =
            query ??
            resolveActiveMentionQuery({
                textBeforeCaret: getTextBeforeCaret(editor),
                serializedMessage: current.message,
            })?.query;

        if (activeQuery === null || activeQuery === undefined) {
            return;
        }

        const mention = toStoredMention(candidate);
        const nextMessage = replaceActiveMentionQuery(current.message, activeQuery, mention);

        if (!nextMessage) {
            return;
        }

        const nextMentions = [...current.mentions.filter((item) => item.id !== mention.id), mention];

        mentionsRef.current = nextMentions;
        setQuery(null);
        setMentionHighlightTarget(null);
        setMenuPlacement(null);

        renderEditorContent(editor, nextMessage, nextMentions);
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
                      className="fixed z-[1000002] max-h-[180px] overflow-y-auto rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
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
                                          "flex w-full flex-col gap-[2px] px-[12px] py-[8px] text-left " +
                                          (active ? "bg-[var(--adaptive-blue100)]" : "hover:bg-[var(--adaptive-black100)]")
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
            {showPlaceholder ? (
                <span
                    className="pointer-events-none absolute left-[4px] top-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-muted)]"
                    style={reserveInlineStart > 0 ? { left: reserveInlineStart + 4 } : undefined}
                >
                    {placeholder}
                </span>
            ) : null}

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
                onInput={() => emitFromEditor()}
                onKeyUp={() => refreshMentionQuery()}
                onClick={() => refreshMentionQuery()}
                onCompositionEnd={() => {
                    emitFromEditor();
                    refreshMentionQuery();
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
                            setMentionHighlightTarget(null);
                            return;
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
