import { createMentionId, MENTION_TOKEN_PATTERN, USER_MENTION_TOKEN_PATTERN, mentionPlainLabel, serializeMentionToken, serializeUserMentionToken, userMentionPlainLabel, } from "../../../shared/types/mention.js";
import { TARGET_SELECTOR } from "../../../shared/constants/report.js";
import { isFeedbackTargetVisible, toPickSnapshot } from "../../../shared/utils/shared/dom.js";
import { getPageDocument, isHtmlElement, queryPageSelector, queryPageSelectorAll } from "../../../shared/utils/overlay/pageDocumentBridge.js";
const REPORT_HOST_ID = "fivepixels-root";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "SVG", "PATH"]);
const MAX_LABEL_LENGTH = 48;
const MAX_CANDIDATES = 12;
function normalizeSearch(text) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
}
function normalizeLabel(text) {
    return text.replace(/\s+/g, " ").trim();
}
function truncateLabel(text) {
    if (text.length <= MAX_LABEL_LENGTH) {
        return text;
    }
    return `${text.slice(0, MAX_LABEL_LENGTH - 1)}…`;
}
function isInsideFivePixelsHost(element) {
    const host = document.getElementById(REPORT_HOST_ID);
    return Boolean(host && (host === element || host.contains(element)));
}
function isUsefulMentionElement(element) {
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
function collectVisibleLabel(element) {
    const directParts = [];
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
function matchesQuery(candidate, normalizedQuery) {
    if (!normalizedQuery) {
        return true;
    }
    const haystacks = [candidate.label, candidate.reportId ?? "", candidate.suggestedReportId ?? "", candidate.element.tagName].map(normalizeSearch);
    return haystacks.some((value) => value.includes(normalizedQuery));
}
function candidateSortKey(candidate, normalizedQuery) {
    const label = normalizeSearch(candidate.label);
    const reportId = normalizeSearch(candidate.reportId ?? "");
    const suggested = normalizeSearch(candidate.suggestedReportId ?? "");
    const taggedBoost = candidate.reportId ? 0 : 1;
    const startsBoost = normalizedQuery && (label.startsWith(normalizedQuery) || reportId.startsWith(normalizedQuery) || suggested.startsWith(normalizedQuery)) ? 0 : 1;
    return [taggedBoost, startsBoost, label.length];
}
export function buildElementMentionFromElement(element, labelOverride) {
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
function pushCandidate(matches, seen, candidate, normalizedQuery) {
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
export function findElementMentionCandidates(query, limit = MAX_CANDIDATES) {
    const normalizedQuery = normalizeSearch(query);
    const matches = [];
    const seen = new Set();
    // Prioritize tagged feedback targets (data-report-id).
    for (const element of queryPageSelectorAll(TARGET_SELECTOR).filter(isHtmlElement)) {
        const reportId = element.dataset.reportId?.trim() ?? "";
        const visibleLabel = collectVisibleLabel(element);
        const label = visibleLabel || reportId;
        pushCandidate(matches, seen, buildElementMentionFromElement(element, label), normalizedQuery);
    }
    // Also index visible text leaves for untagged UI copy.
    const pageDocument = getPageDocument();
    const walker = pageDocument.createTreeWalker(pageDocument.body ?? pageDocument.documentElement, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
        const element = node;
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
                return leftKey[index] - rightKey[index];
            }
        }
        return 0;
    })
        .slice(0, limit);
}
export function resolveMentionElement(mention) {
    if (mention.reportId) {
        const tagged = queryPageSelector(`[data-report-id="${CSS.escape(mention.reportId)}"]`);
        if (isHtmlElement(tagged)) {
            return tagged;
        }
    }
    if (mention.targetSelector) {
        const element = queryPageSelector(mention.targetSelector);
        return isHtmlElement(element) ? element : null;
    }
    return null;
}
export function resolveMentionSnapshot(mention) {
    const element = resolveMentionElement(mention);
    if (!element) {
        return null;
    }
    return toPickSnapshot(element);
}
function collectTokenMatches(message) {
    const matches = [];
    for (const match of message.matchAll(MENTION_TOKEN_PATTERN)) {
        matches.push({
            index: match.index ?? 0,
            length: match[0].length,
            kind: "element",
            id: match[1] ?? "",
            raw: match[0],
        });
    }
    for (const match of message.matchAll(USER_MENTION_TOKEN_PATTERN)) {
        matches.push({
            index: match.index ?? 0,
            length: match[0].length,
            kind: "user",
            id: match[1] ?? "",
            raw: match[0],
        });
    }
    return matches.sort((left, right) => left.index - right.index);
}
export function parseMentionMessage(message, mentions = [], userMentions = []) {
    const mentionById = new Map(mentions.map((item) => [item.id, item]));
    const userMentionById = new Map(userMentions.map((item) => [item.id, item]));
    const parts = [];
    let lastIndex = 0;
    for (const match of collectTokenMatches(message)) {
        if (match.index > lastIndex) {
            parts.push({ type: "text", value: message.slice(lastIndex, match.index) });
        }
        if (match.kind === "element") {
            const mention = mentionById.get(match.id);
            if (mention) {
                parts.push({ type: "mention", mention });
            }
            else {
                parts.push({ type: "text", value: match.raw });
            }
        }
        else {
            const mention = userMentionById.get(match.id);
            if (mention) {
                parts.push({ type: "user_mention", mention });
            }
            else {
                parts.push({ type: "text", value: match.raw });
            }
        }
        lastIndex = match.index + match.length;
    }
    if (lastIndex < message.length) {
        parts.push({ type: "text", value: message.slice(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: "text", value: message }];
}
export function mentionMessageToPlainText(message, mentions = [], userMentions = []) {
    return parseMentionMessage(message, mentions, userMentions)
        .map((part) => {
        if (part.type === "text") {
            return part.value;
        }
        if (part.type === "user_mention") {
            return userMentionPlainLabel(part.mention);
        }
        return mentionPlainLabel(part.mention);
    })
        .join("");
}
export function stripMentionTokensForEmptyCheck(message, mentions = [], userMentions = []) {
    return mentionMessageToPlainText(message, mentions, userMentions).trim();
}
export function toStoredMention(candidate) {
    return {
        id: candidate.id,
        label: candidate.label,
        targetSelector: candidate.targetSelector,
        reportId: candidate.reportId,
        suggestedReportId: candidate.suggestedReportId,
    };
}
export function insertMentionToken(message, cursor, atStart, mention) {
    const token = serializeMentionToken(mention.id);
    const nextMessage = `${message.slice(0, atStart)}${token} ${message.slice(cursor)}`;
    return {
        message: nextMessage,
        cursor: atStart + token.length + 1,
    };
}
/**
 * Detect an in-progress `@query` at the end of caret text or serialized draft.
 * Single spaces are allowed so multi-word labels (e.g. "Staged feedback") can be typed.
 * Two or more consecutive spaces end the mention query (caller should dismiss the menu).
 */
export function getAtQuery(textBeforeCursor) {
    const match = textBeforeCursor.match(/(^|[\s([{])@([^\n@{}]*)$/);
    if (!match) {
        return null;
    }
    const query = match[2] ?? "";
    // Double-space terminator: leave typed text as plain `@…` and close mention mode.
    if (/\s{2}/.test(query)) {
        return null;
    }
    return {
        query,
        atOffsetInBefore: textBeforeCursor.length - query.length - 1,
    };
}
/** True when the active query already ends with a space (next Space should dismiss). */
export function mentionQueryEndsWithSpace(query) {
    return /\s$/.test(query);
}
/**
 * Resolve the active mention query using caret text when available,
 * otherwise fall back to the serialized editor message (safe with chips / shadow DOM).
 */
export function resolveActiveMentionQuery(options) {
    if (options.textBeforeCaret !== null && options.textBeforeCaret !== undefined) {
        return getAtQuery(options.textBeforeCaret);
    }
    if (options.serializedMessage !== null && options.serializedMessage !== undefined) {
        return getAtQuery(options.serializedMessage);
    }
    return null;
}
export function replaceActiveMentionQuery(message, query, mentionOrToken, atOffsetInBefore) {
    const needle = `@${query}`;
    const replaceAt = atOffsetInBefore ?? message.lastIndexOf(needle);
    if (replaceAt < 0 || message.slice(replaceAt, replaceAt + needle.length) !== needle) {
        return null;
    }
    // Avoid replacing the `@` inside an existing `@{id}` / `@u{id}` token when offset is omitted.
    if (atOffsetInBefore === undefined && (message[replaceAt + 1] === "{" || message.slice(replaceAt + 1, replaceAt + 3) === "u{")) {
        return null;
    }
    const token = typeof mentionOrToken === "string" ? mentionOrToken : serializeMentionToken(mentionOrToken.id);
    return `${message.slice(0, replaceAt)}${token} ${message.slice(replaceAt + needle.length)}`;
}
export function replaceActiveUserMentionQuery(message, query, mention, atOffsetInBefore) {
    return replaceActiveMentionQuery(message, query, serializeUserMentionToken(mention.id), atOffsetInBefore);
}
//# sourceMappingURL=elementMentions.js.map