import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { serializeMentionToken, serializeUserMentionToken } from "../types/mention.js";
import { findElementMentionCandidates, getAtQuery, mentionQueryEndsWithSpace, replaceActiveMentionQuery, toStoredMention, } from "../utils/mention/elementMentions.js";
import { findUserMentionCandidates, toStoredUserMention } from "../utils/mention/userMentions.js";
import { deleteMentionChipBeforeCaret, getCaretClientRect, getEditorCaretPoint, placeCaretAfterMention, renderMentionEditorContent, serializeMentionEditor, serializeMentionEditorBeforeCaret, } from "../utils/mention/mentionComposerDom.js";
import { useReportPreferences, useReportSession } from "../providers/reportContext.js";
import { ensureReportTooltipLayer } from "../utils/shared/dom.js";
const EDITOR_MIN_HEIGHT = 32;
const EDITOR_MAX_HEIGHT = 200;
const MENU_GAP = 6;
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
export function MentionComposerInput({ value, mentions, userMentions = [], teamMembers = [], onChange, placeholder, autoFocus = false, onSubmitShortcut, onMultilineChange, }) {
    const { messages } = useReportPreferences();
    const { setMentionHighlightTarget } = useReportSession();
    const editorRef = useRef(null);
    const rootRef = useRef(null);
    const mentionsRef = useRef(mentions);
    const userMentionsRef = useRef(userMentions);
    const teamMembersRef = useRef(teamMembers);
    const skipSyncRef = useRef(false);
    const isComposingRef = useRef(false);
    const activeAtOffsetRef = useRef(null);
    /** Once dismissed (Esc / double-space), keep this `@` closed until it is removed. */
    const dismissedAtOffsetRef = useRef(null);
    const [query, setQuery] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [menuPlacement, setMenuPlacement] = useState(null);
    const [portalRoot, setPortalRoot] = useState(null);
    const lastMultilineRef = useRef(null);
    mentionsRef.current = mentions;
    userMentionsRef.current = userMentions;
    teamMembersRef.current = teamMembers;
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
    const dismissActiveMention = useCallback((atOffset) => {
        if (atOffset !== null) {
            dismissedAtOffsetRef.current = atOffset;
        }
        activeAtOffsetRef.current = null;
        setQuery(null);
        setMentionHighlightTarget(null);
        setMenuPlacement(null);
    }, [setMentionHighlightTarget]);
    const refreshMentionQuery = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }
        const caret = getEditorCaretPoint(editor);
        const before = serializeMentionEditorBeforeCaret(editor, mentionsRef.current, caret, userMentionsRef.current);
        const resolved = before
            ? getAtQuery(before.message)
            : getAtQuery(serializeMentionEditor(editor, mentionsRef.current, userMentionsRef.current).message);
        if (!resolved) {
            dismissedAtOffsetRef.current = null;
            activeAtOffsetRef.current = null;
            setQuery(null);
            return;
        }
        if (dismissedAtOffsetRef.current === resolved.atOffsetInBefore) {
            activeAtOffsetRef.current = null;
            setQuery(null);
            return;
        }
        dismissedAtOffsetRef.current = null;
        activeAtOffsetRef.current = resolved.atOffsetInBefore;
        setQuery(resolved.query);
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
        const serialized = serializeMentionEditor(editor, mentionsRef.current, userMentionsRef.current);
        if (serialized.message === value) {
            syncHeight();
            return;
        }
        renderMentionEditorContent(editor, value, mentions, userMentions);
        syncHeight();
    }, [value, mentions, userMentions, syncHeight]);
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
        const userCandidates = findUserMentionCandidates(query, teamMembersRef.current).map((candidate) => ({ kind: "user", candidate }));
        const elementCandidates = findElementMentionCandidates(query).map((candidate) => ({ kind: "element", candidate }));
        setCandidates([...userCandidates, ...elementCandidates]);
        setActiveIndex(0);
    }, [query, setMentionHighlightTarget, teamMembers]);
    useEffect(() => {
        if (query === null || !mentionQueryEndsWithSpace(query)) {
            return;
        }
        if (candidates.length > 0) {
            return;
        }
        dismissActiveMention(activeAtOffsetRef.current);
    }, [query, candidates.length, dismissActiveMention]);
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
        setMentionHighlightTarget(active?.kind === "element" ? active.candidate.snapshot : null);
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
        const next = serializeMentionEditor(editor, mentionsRef.current, userMentionsRef.current);
        mentionsRef.current = next.mentions;
        userMentionsRef.current = next.userMentions;
        onChange(next);
        syncHeight();
        refreshMentionQuery();
    };
    const insertCandidate = (item) => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }
        const current = serializeMentionEditor(editor, mentionsRef.current, userMentionsRef.current);
        const caret = getEditorCaretPoint(editor);
        const before = serializeMentionEditorBeforeCaret(editor, mentionsRef.current, caret, userMentionsRef.current);
        const resolved = (before ? getAtQuery(before.message) : null) ??
            (query !== null && activeAtOffsetRef.current !== null
                ? { query, atOffsetInBefore: activeAtOffsetRef.current }
                : getAtQuery(current.message));
        if (!resolved) {
            return;
        }
        if (item.kind === "user") {
            const mention = toStoredUserMention(item.candidate);
            const nextMessage = replaceActiveMentionQuery(current.message, resolved.query, serializeUserMentionToken(mention.id), resolved.atOffsetInBefore);
            if (!nextMessage) {
                return;
            }
            const nextUserMentions = [...current.userMentions.filter((entry) => entry.id !== mention.id), mention];
            mentionsRef.current = current.mentions;
            userMentionsRef.current = nextUserMentions;
            dismissedAtOffsetRef.current = null;
            activeAtOffsetRef.current = null;
            setQuery(null);
            setMentionHighlightTarget(null);
            setMenuPlacement(null);
            renderMentionEditorContent(editor, nextMessage, current.mentions, nextUserMentions);
            skipSyncRef.current = true;
            onChange({ message: nextMessage, mentions: current.mentions, userMentions: nextUserMentions });
            syncHeight();
            editor.focus();
            placeCaretAfterMention(editor, mention.id);
            return;
        }
        const mention = toStoredMention(item.candidate);
        const nextMessage = replaceActiveMentionQuery(current.message, resolved.query, serializeMentionToken(mention.id), resolved.atOffsetInBefore);
        if (!nextMessage) {
            return;
        }
        const nextMentions = [...current.mentions.filter((entry) => entry.id !== mention.id), mention];
        mentionsRef.current = nextMentions;
        userMentionsRef.current = current.userMentions;
        dismissedAtOffsetRef.current = null;
        activeAtOffsetRef.current = null;
        setQuery(null);
        setMentionHighlightTarget(null);
        setMenuPlacement(null);
        renderMentionEditorContent(editor, nextMessage, nextMentions, current.userMentions);
        skipSyncRef.current = true;
        onChange({ message: nextMessage, mentions: nextMentions, userMentions: current.userMentions });
        syncHeight();
        editor.focus();
        placeCaretAfterMention(editor, mention.id);
    };
    const showPlaceholder = useMemo(() => value.trim().length === 0 && query === null, [value, query]);
    const showMenu = query !== null && Boolean(portalRoot);
    const menu = showMenu && portalRoot
        ? createPortal(_jsx("div", { role: "listbox", "aria-label": messages.composer.mentionListAriaLabel, "data-fivepixels-interactive": "", className: "fixed z-[1000002] max-h-[180px] overflow-y-auto rounded-[12px] border border-[var(--adaptive-border-subtle)]  bg-[var(--adaptive-neutralTintOpacity500)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]", style: menuPlacement
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
                    bottom: 24,
                    left: 24,
                    width: 280,
                }, children: candidates.length === 0 ? (_jsx("p", { className: "px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]", children: messages.composer.mentionEmpty })) : (candidates.map((item, index) => {
                const active = index === activeIndex;
                if (item.kind === "user") {
                    return (_jsxs("button", { type: "button", role: "option", "aria-selected": active, "data-fivepixels-interactive": "", className: "flex w-full flex-col gap-[2px] px-[4px] py-[2px] text-left border-none " +
                            (active ? "bg-[var(--adaptive-blue100)]" : "hover:bg-[var(--adaptive-black100)]"), onMouseEnter: () => setActiveIndex(index), onMouseDown: (event) => {
                            event.preventDefault();
                            insertCandidate(item);
                        }, children: [_jsxs("span", { className: "truncate text-[12px] font-semibold text-[var(--adaptive-black900)]", children: ["@", item.candidate.name] }), _jsx("span", { className: "truncate text-[11px] text-[var(--adaptive-black500)]", children: messages.composer.userMentionHint })] }, `user-${item.candidate.id}-${index}`));
                }
                return (_jsxs("button", { type: "button", role: "option", "aria-selected": active, "data-fivepixels-interactive": "", className: "flex w-full flex-col gap-[2px] px-[4px] py-[2px] text-left border-none " +
                        (active ? "bg-[var(--adaptive-blue100)]" : "hover:bg-[var(--adaptive-black100)]"), onMouseEnter: () => setActiveIndex(index), onMouseDown: (event) => {
                        event.preventDefault();
                        insertCandidate(item);
                    }, children: [_jsx("span", { className: "truncate text-[12px] font-semibold text-[var(--adaptive-black900)]", children: item.candidate.label }), _jsx("span", { className: "truncate text-[11px] text-[var(--adaptive-black500)]", children: item.candidate.reportId ?? item.candidate.suggestedReportId ?? item.candidate.element.tagName.toLowerCase() })] }, `${item.candidate.targetSelector}-${item.candidate.label}-${index}`));
            })) }), portalRoot)
        : null;
    return (_jsxs("div", { ref: rootRef, className: "relative min-w-0 flex-1", children: [showPlaceholder ? _jsx("span", { className: "pointer-events-none absolute left-[4px] top-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-muted)]", children: placeholder }) : null, _jsx("div", { ref: editorRef, contentEditable: true, role: "textbox", "aria-multiline": "true", "aria-label": placeholder, "data-fivepixels-interactive": "", suppressContentEditableWarning: true, className: "max-h-[200px] w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-[4px] py-[6px] text-[14px] leading-[1.5] text-[var(--adaptive-text-primary)] outline-none", style: { minHeight: EDITOR_MIN_HEIGHT }, onInput: () => {
                    if (isComposingRef.current) {
                        refreshMentionQuery();
                        syncHeight();
                        return;
                    }
                    emitFromEditor();
                }, onKeyUp: () => refreshMentionQuery(), onClick: () => refreshMentionQuery(), onCompositionStart: () => {
                    isComposingRef.current = true;
                }, onCompositionUpdate: () => {
                    refreshMentionQuery();
                }, onCompositionEnd: () => {
                    isComposingRef.current = false;
                    emitFromEditor();
                }, onKeyDown: (event) => {
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
                        if (event.key === " " && !event.metaKey && !event.ctrlKey && !event.altKey) {
                            if (candidates.length === 0) {
                                dismissActiveMention(activeAtOffsetRef.current);
                                return;
                            }
                            if (!isComposingRef.current && mentionQueryEndsWithSpace(query)) {
                                event.preventDefault();
                                const active = candidates[activeIndex];
                                if (active) {
                                    insertCandidate(active);
                                }
                                return;
                            }
                        }
                        if (event.key === "Escape") {
                            event.preventDefault();
                            dismissActiveMention(activeAtOffsetRef.current);
                            return;
                        }
                    }
                    if (event.key === "Backspace" && !event.metaKey && !event.ctrlKey && !event.altKey) {
                        const editor = editorRef.current;
                        if (editor) {
                            const deleted = deleteMentionChipBeforeCaret(editor, mentionsRef.current, userMentionsRef.current);
                            if (deleted) {
                                event.preventDefault();
                                mentionsRef.current = deleted.mentions;
                                userMentionsRef.current = deleted.userMentions;
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
                } }), menu] }));
}
//# sourceMappingURL=MentionComposerInput.js.map