import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { mentionPlainLabel, serializeMentionToken } from "../../../types/mention.js";
import { findElementMentionCandidates, parseMentionMessage, toStoredMention, } from "../../../utils/mention/elementMentions.js";
import { useReportPreferences, useReportSession } from "../../../providers/reportContext.js";
const EDITOR_MIN_HEIGHT = 32;
const EDITOR_MAX_HEIGHT = 200;
const MENTION_CHIP_CLASS = "mx-[1px] inline-flex items-center rounded-[6px] bg-[var(--adaptive-blue100)] px-[6px] py-[1px] text-[13px] font-semibold text-[var(--adaptive-blue600)] align-baseline";
function getAtQuery(textBeforeCursor) {
    const match = textBeforeCursor.match(/(^|[\s([{])@([^\s@{}]*)$/);
    if (!match) {
        return null;
    }
    return {
        query: match[2] ?? "",
        atOffsetInBefore: textBeforeCursor.length - (match[2]?.length ?? 0) - 1,
    };
}
function serializeEditor(root, mentions) {
    const mentionById = new Map(mentions.map((item) => [item.id, item]));
    const used = [];
    let message = "";
    const visit = (node) => {
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
            }
            else {
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
function renderEditorContent(root, message, mentions) {
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
function placeCaretAtEnd(element) {
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
function getTextBeforeCaret(root) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return "";
    }
    const range = selection.getRangeAt(0).cloneRange();
    range.selectNodeContents(root);
    range.setEnd(selection.getRangeAt(0).endContainer, selection.getRangeAt(0).endOffset);
    return range.toString();
}
export function MentionComposerInput({ value, mentions, onChange, placeholder, autoFocus = false, onSubmitShortcut, onMultilineChange, reserveInlineStart = 0, }) {
    const { messages } = useReportPreferences();
    const { setMentionHighlightTarget } = useReportSession();
    const editorRef = useRef(null);
    const mentionsRef = useRef(mentions);
    const skipSyncRef = useRef(false);
    const [query, setQuery] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const lastMultilineRef = useRef(null);
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
        if (query === null) {
            setCandidates([]);
            setMentionHighlightTarget(null);
            return;
        }
        const nextCandidates = findElementMentionCandidates(query);
        setCandidates(nextCandidates);
        setActiveIndex(0);
    }, [query, setMentionHighlightTarget]);
    useEffect(() => {
        const active = candidates[activeIndex];
        setMentionHighlightTarget(active?.snapshot ?? null);
        return () => {
            setMentionHighlightTarget(null);
        };
    }, [activeIndex, candidates, setMentionHighlightTarget]);
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
        const before = getTextBeforeCaret(editor);
        const atQuery = getAtQuery(before);
        setQuery(atQuery ? atQuery.query : null);
    };
    const insertCandidate = (candidate) => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection || selection.rangeCount === 0) {
            return;
        }
        const before = getTextBeforeCaret(editor);
        const atQuery = getAtQuery(before);
        if (!atQuery) {
            return;
        }
        const range = selection.getRangeAt(0);
        const deleteCount = (atQuery.query?.length ?? 0) + 1;
        for (let index = 0; index < deleteCount; index += 1) {
            range.setStart(range.endContainer, Math.max(0, range.endOffset - 1));
            range.deleteContents();
        }
        const mention = toStoredMention(candidate);
        const chip = document.createElement("span");
        chip.contentEditable = "false";
        chip.dataset.mentionId = mention.id;
        chip.className = MENTION_CHIP_CLASS;
        chip.textContent = mentionPlainLabel(mention);
        range.insertNode(document.createTextNode(" "));
        range.insertNode(chip);
        const after = document.createRange();
        after.setStartAfter(chip.nextSibling ?? chip);
        after.collapse(true);
        selection.removeAllRanges();
        selection.addRange(after);
        mentionsRef.current = [...mentionsRef.current.filter((item) => item.id !== mention.id), mention];
        setQuery(null);
        setMentionHighlightTarget(null);
        emitFromEditor();
        editor.focus();
    };
    const showPlaceholder = useMemo(() => value.trim().length === 0 && query === null, [value, query]);
    return (_jsxs("div", { className: "relative min-w-0 flex-1", children: [showPlaceholder ? (_jsx("span", { className: "pointer-events-none absolute left-[4px] top-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-muted)]", style: reserveInlineStart > 0 ? { left: reserveInlineStart + 4 } : undefined, children: placeholder })) : null, _jsx("div", { ref: editorRef, contentEditable: true, role: "textbox", "aria-multiline": "true", "aria-label": placeholder, "data-fivepixels-interactive": "", suppressContentEditableWarning: true, className: "max-h-[200px] w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-[4px] py-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none", style: { minHeight: EDITOR_MIN_HEIGHT }, onInput: () => emitFromEditor(), onKeyDown: (event) => {
                    if (query !== null && candidates.length > 0) {
                        if (event.key === "ArrowDown") {
                            event.preventDefault();
                            setActiveIndex((current) => (current + 1) % candidates.length);
                            return;
                        }
                        if (event.key === "ArrowUp") {
                            event.preventDefault();
                            setActiveIndex((current) => (current - 1 + candidates.length) % candidates.length);
                            return;
                        }
                        if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
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
                } }), query !== null ? (_jsx("div", { role: "listbox", "aria-label": messages.composer.mentionListAriaLabel, className: "absolute bottom-full left-0 z-20 mb-[6px] max-h-[180px] w-[min(280px,100%)] overflow-y-auto rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]", children: candidates.length === 0 ? (_jsx("p", { className: "px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: messages.composer.mentionEmpty })) : (candidates.map((candidate, index) => {
                    const active = index === activeIndex;
                    return (_jsxs("button", { type: "button", role: "option", "aria-selected": active, "data-fivepixels-interactive": "", className: "flex w-full flex-col gap-[2px] px-[12px] py-[8px] text-left " +
                            (active ? "bg-[var(--adaptive-blue100)]" : "hover:bg-[var(--adaptive-black100)]"), onMouseEnter: () => setActiveIndex(index), onMouseDown: (event) => {
                            event.preventDefault();
                            insertCandidate(candidate);
                        }, children: [_jsx("span", { className: "truncate text-[12px] font-semibold text-[var(--adaptive-black900)]", children: candidate.label }), _jsx("span", { className: "truncate text-[11px] text-[var(--adaptive-black500)]", children: candidate.reportId ?? candidate.suggestedReportId ?? candidate.element.tagName.toLowerCase() })] }, `${candidate.targetSelector}-${candidate.label}-${index}`));
                })) })) : null] }));
}
//# sourceMappingURL=MentionComposerInput.js.map