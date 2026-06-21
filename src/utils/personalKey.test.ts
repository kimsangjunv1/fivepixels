import { beforeEach, describe, expect, it } from "vitest";
import { getPersonalKeyStorageKey } from "@/constants/storageKeys.js";
import {
    createPersonalKey,
    parsePersonalKey,
    readPersonalKey,
    resolvePersonalKeyAuthor,
    savePersonalKey,
} from "./personalKey.js";

const identify = { id: "reviewer-1", name: "김담당" };
const authors = [identify, { id: "reviewer-2", name: "이담당" }];

describe("personalKey", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("creates a project-scoped key and resolves its reviewer", () => {
        const key = createPersonalKey("demo", "staging", identify.id);
        const payload = parsePersonalKey(key);

        expect(payload).toMatchObject({
            projectId: "demo",
            environment: "staging",
            authorId: identify.id,
        });
        expect(resolvePersonalKeyAuthor(payload!, identify, authors)).toEqual(identify);
    });

    it("stores and restores a valid key", async () => {
        const key = createPersonalKey("demo", undefined, identify.id);

        expect(await savePersonalKey("demo", undefined, key, identify, authors)).toBe(true);
        expect(await readPersonalKey("demo", undefined, identify, authors)).toBe(key);
    });

    it("rejects keys from another project or unknown reviewer", async () => {
        const otherProjectKey = createPersonalKey("other", undefined, identify.id);
        const unknownReviewerKey = createPersonalKey("demo", undefined, "unknown");

        expect(await savePersonalKey("demo", undefined, otherProjectKey, identify, authors)).toBe(false);
        expect(await savePersonalKey("demo", undefined, unknownReviewerKey, identify, authors)).toBe(false);
        expect(localStorage.getItem(getPersonalKeyStorageKey("demo"))).toBeNull();
    });

    it("removes a stored key when its hash is changed", async () => {
        const key = createPersonalKey("demo", undefined, identify.id);
        await savePersonalKey("demo", undefined, key, identify, authors);

        const storageKey = getPersonalKeyStorageKey("demo");
        const stored = JSON.parse(localStorage.getItem(storageKey)!);
        localStorage.setItem(storageKey, JSON.stringify({ ...stored, hash: "changed" }));

        expect(await readPersonalKey("demo", undefined, identify, authors)).toBeNull();
        expect(localStorage.getItem(storageKey)).toBeNull();
    });
});
