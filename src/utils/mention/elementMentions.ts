import type { ElementMention, ElementMentionCandidate } from "@/types/mention.js";
import { createMentionId, MENTION_TOKEN_PATTERN, mentionPlainLabel, serializeMentionToken } from "@/types/mention.js";
import type { TargetSnapshot } from "@/types/report-ui.js";
import { TARGET_SELECTOR } from "@/constants/report.js";
import { isFeedbackTargetVisible, toPickSnapshot } from "@/utils/shared/dom.js";

const REPORT_HOST_ID = "fivepixels-root";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "SVG", "PATH"]);
const MAX_LABEL_LENGTH = 48;
const MAX_CANDIDATES = 12;

function normalizeSearch(text: string) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeLabel(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

function truncateLabel(text: string) {
    if (text.length <= MAX_LABEL_LENGTH) {
        return text;
    }

    return `${text.slice(0, MAX_LABEL_LENGTH - 1)}…`;
}

function isInsideFivePixelsHost(element: HTMLElement) {
    const host = document.getElementById(REPORT_HOST_ID);

    return Boolean(host && (host === element || host.contains(element)));
}

function isUsefulMentionElement(element: HTMLElement) {
    if (SKIP_TAGS.has(element.tagName)) {
        return false;
    }

    if (element.isContentEditable) {
        return false;
    }

    if (element.closest("[data-fivepixels-interactive], [data-fivepixels-host]")) {
        return false;
    }

    if (isInsideFivePixelsHost(element)) {
        return false;
    }

    if (!isFeedbackTargetVisible(element)) {
        return false;
    }

    return true;
}

function collectVisibleLabel(element: HTMLElement) {
    const directParts: string[] = [];

    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            const value = normalizeLabel(node.textContent ?? "");

            if (value) {
                directParts.push(value);
            }
        }
    }

    if (directParts.length > 0) {
        return truncateLabel(directParts.join(" "));
    }

    const aria = element.getAttribute("aria-label")?.trim();

    if (aria) {
        return truncateLabel(aria);
    }

    const title = element.getAttribute("title")?.trim();

    if (title) {
        return truncateLabel(title);
    }

    const inner = normalizeLabel(element.innerText || element.textContent || "");

    if (!inner) {
        return "";
    }

    // Prefer short leaf labels; skip huge containers.
    if (inner.length > MAX_LABEL_LENGTH * 2) {
        return "";
    }

    return truncateLabel(inner);
}

function matchesQuery(candidate: ElementMentionCandidate, normalizedQuery: string) {
    if (!normalizedQuery) {
        return true;
    }

    const haystacks = [candidate.label, candidate.reportId ?? "", candidate.suggestedReportId ?? "", candidate.element.tagName].map(normalizeSearch);

    return haystacks.some((value) => value.includes(normalizedQuery));
}

function candidateSortKey(candidate: ElementMentionCandidate, normalizedQuery: string) {
    const label = normalizeSearch(candidate.label);
    const reportId = normalizeSearch(candidate.reportId ?? "");
    const suggested = normalizeSearch(candidate.suggestedReportId ?? "");
    const taggedBoost = candidate.reportId ? 0 : 1;
    const startsBoost =
        normalizedQuery && (label.startsWith(normalizedQuery) || reportId.startsWith(normalizedQuery) || suggested.startsWith(normalizedQuery)) ? 0 : 1;

    return [taggedBoost, startsBoost, label.length] as const;
}

export function buildElementMentionFromElement(element: HTMLElement, labelOverride?: string): ElementMentionCandidate | null {
    if (!isUsefulMentionElement(element)) {
        return null;
    }

    const snapshot = toPickSnapshot(element);

    if (!snapshot) {
        return null;
    }

    const label = truncateLabel(labelOverride || collectVisibleLabel(element) || snapshot.suggestedReportId || snapshot.id);

    if (!label) {
        return null;
    }

    return {
        id: createMentionId(),
        label,
        targetSelector: snapshot.targetSelector ?? null,
        reportId: snapshot.isTagged ? snapshot.id : null,
        suggestedReportId: snapshot.suggestedReportId ?? null,
        element,
        snapshot,
    };
}

function pushCandidate(matches: ElementMentionCandidate[], seen: Set<string>, candidate: ElementMentionCandidate | null, normalizedQuery: string) {
    if (!candidate) {
        return;
    }

    const key = `${candidate.targetSelector ?? ""}::${candidate.reportId ?? ""}::${candidate.label}`;

    if (seen.has(key) || !matchesQuery(candidate, normalizedQuery)) {
        return;
    }

    seen.add(key);
    matches.push(candidate);
}

export function findElementMentionCandidates(query: string, limit = MAX_CANDIDATES): ElementMentionCandidate[] {
    const normalizedQuery = normalizeSearch(query);
    const matches: ElementMentionCandidate[] = [];
    const seen = new Set<string>();

    // Prioritize tagged feedback targets (data-report-id).
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR))) {
        const reportId = element.dataset.reportId?.trim() ?? "";
        const visibleLabel = collectVisibleLabel(element);
        const label = visibleLabel || reportId;
        pushCandidate(matches, seen, buildElementMentionFromElement(element, label), normalizedQuery);
    }

    // Also index visible text leaves for untagged UI copy.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();

    while (node) {
        const element = node as HTMLElement;

        if (!element.dataset.reportId) {
            const label = collectVisibleLabel(element);

            if (label) {
                pushCandidate(matches, seen, buildElementMentionFromElement(element, label), normalizedQuery);
            }
        }

        node = walker.nextNode();
    }

    return matches
        .sort((left, right) => {
            const leftKey = candidateSortKey(left, normalizedQuery);
            const rightKey = candidateSortKey(right, normalizedQuery);

            for (let index = 0; index < leftKey.length; index += 1) {
                if (leftKey[index] !== rightKey[index]) {
                    return leftKey[index]! - rightKey[index]!;
                }
            }

            return 0;
        })
        .slice(0, limit);
}

export function resolveMentionElement(mention: ElementMention): HTMLElement | null {
    if (mention.reportId) {
        try {
            const tagged = document.querySelector<HTMLElement>(`[data-report-id="${CSS.escape(mention.reportId)}"]`);

            if (tagged) {
                return tagged;
            }
        } catch {
            // ignore invalid selectors
        }
    }

    if (mention.targetSelector) {
        try {
            return document.querySelector<HTMLElement>(mention.targetSelector);
        } catch {
            return null;
        }
    }

    return null;
}

export function resolveMentionSnapshot(mention: ElementMention): TargetSnapshot | null {
    const element = resolveMentionElement(mention);

    if (!element) {
        return null;
    }

    return toPickSnapshot(element);
}

export type MentionMessagePart =
    | { type: "text"; value: string }
    | { type: "mention"; mention: ElementMention };

export function parseMentionMessage(message: string, mentions: ElementMention[] = []): MentionMessagePart[] {
    const mentionById = new Map(mentions.map((item) => [item.id, item]));
    const parts: MentionMessagePart[] = [];
    let lastIndex = 0;

    for (const match of message.matchAll(MENTION_TOKEN_PATTERN)) {
        const index = match.index ?? 0;
        const mentionId = match[1];
        const mention = mentionById.get(mentionId);

        if (index > lastIndex) {
            parts.push({ type: "text", value: message.slice(lastIndex, index) });
        }

        if (mention) {
            parts.push({ type: "mention", mention });
        } else {
            parts.push({ type: "text", value: match[0] });
        }

        lastIndex = index + match[0].length;
    }

    if (lastIndex < message.length) {
        parts.push({ type: "text", value: message.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: "text", value: message }];
}

export function mentionMessageToPlainText(message: string, mentions: ElementMention[] = []) {
    return parseMentionMessage(message, mentions)
        .map((part) => (part.type === "text" ? part.value : mentionPlainLabel(part.mention)))
        .join("");
}

export function stripMentionTokensForEmptyCheck(message: string, mentions: ElementMention[] = []) {
    return mentionMessageToPlainText(message, mentions).trim();
}

export function toStoredMention(candidate: ElementMentionCandidate): ElementMention {
    return {
        id: candidate.id,
        label: candidate.label,
        targetSelector: candidate.targetSelector,
        reportId: candidate.reportId,
        suggestedReportId: candidate.suggestedReportId,
    };
}

export function insertMentionToken(message: string, cursor: number, atStart: number, mention: ElementMention) {
    const token = serializeMentionToken(mention.id);
    const nextMessage = `${message.slice(0, atStart)}${token} ${message.slice(cursor)}`;

    return {
        message: nextMessage,
        cursor: atStart + token.length + 1,
    };
}

/** Detect an in-progress `@query` at the end of caret text or serialized draft. */
export function getAtQuery(textBeforeCursor: string) {
    const match = textBeforeCursor.match(/(^|[\s([{])@([^\s@{}]*)$/);

    if (!match) {
        return null;
    }

    return {
        query: match[2] ?? "",
        atOffsetInBefore: textBeforeCursor.length - (match[2]?.length ?? 0) - 1,
    };
}

/**
 * Resolve the active mention query using caret text when available,
 * otherwise fall back to the serialized editor message (safe with chips / shadow DOM).
 */
export function resolveActiveMentionQuery(options: { textBeforeCaret?: string | null; serializedMessage?: string | null }) {
    if (options.textBeforeCaret !== null && options.textBeforeCaret !== undefined) {
        return getAtQuery(options.textBeforeCaret);
    }

    if (options.serializedMessage !== null && options.serializedMessage !== undefined) {
        return getAtQuery(options.serializedMessage);
    }

    return null;
}

export function replaceActiveMentionQuery(message: string, query: string, mention: ElementMention, atOffsetInBefore?: number) {
    const needle = `@${query}`;
    const replaceAt = atOffsetInBefore ?? message.lastIndexOf(needle);

    if (replaceAt < 0 || message.slice(replaceAt, replaceAt + needle.length) !== needle) {
        return null;
    }

    // Avoid replacing the `@` inside an existing `@{id}` token when offset is omitted.
    if (atOffsetInBefore === undefined && message[replaceAt + 1] === "{") {
        return null;
    }

    const token = serializeMentionToken(mention.id);

    return `${message.slice(0, replaceAt)}${token} ${message.slice(replaceAt + needle.length)}`;
}
