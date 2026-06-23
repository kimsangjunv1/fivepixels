import { beforeEach, describe, expect, it } from "vitest";
import { getPersonalKeyStorageKey } from "@/constants/storageKeys.js";
import {
    createReviewerKeyPair,
    getPublicKeyFromPrivateKey,
    parsePrivateKeyBundle,
    readPersonalKey,
    resolvePersonalKeyAuthor,
    savePersonalKey,
    signReportPayload,
    verifyReportAuthProof,
} from "./personalKey.js";

const identify = { id: "reviewer-1", name: "김담당" };

describe("reviewer key signature", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("generates a key pair and matches only the configured reviewer public key", async () => {
        const issued = await createReviewerKeyPair("demo", "stage", identify.id);
        const bundle = parsePrivateKeyBundle(issued.privateKey)!;

        expect(getPublicKeyFromPrivateKey(issued.privateKey)).toBe(issued.publicKey);
        expect(resolvePersonalKeyAuthor(bundle, identify, [{ ...identify, publicKey: issued.publicKey }])).toEqual(identify);
        expect(resolvePersonalKeyAuthor(bundle, identify, [{ ...identify, publicKey: "stpub1.invalid" }])).toBeUndefined();
    });

    it("stores only a key scoped to the current project and environment", async () => {
        const issued = await createReviewerKeyPair("demo", "stage", identify.id);

        expect(savePersonalKey("demo", "stage", issued.privateKey)).toBe(true);
        expect(readPersonalKey("demo", "stage")).toBe(issued.privateKey);
        expect(savePersonalKey("other", "stage", issued.privateKey)).toBe(false);
        expect(localStorage.getItem(getPersonalKeyStorageKey("other", "stage"))).toBeNull();
    });

    it("signs a payload that can be verified with the registered public key", async () => {
        const issued = await createReviewerKeyPair("demo", undefined, identify.id);
        const payload = { message: "확인했습니다.", author_id: identify.id };
        const proof = await signReportPayload(issued.privateKey, {
            projectId: "demo",
            action: "feedback:create",
            payload,
        });

        expect(
            await verifyReportAuthProof({
                proof,
                publicKey: issued.publicKey,
                projectId: "demo",
                action: "feedback:create",
                payload: { ...payload, auth: proof },
            }),
        ).toBe(true);
        expect(
            await verifyReportAuthProof({
                proof,
                publicKey: issued.publicKey,
                projectId: "demo",
                action: "feedback:create",
                payload: { ...payload, message: "변조됨" },
            }),
        ).toBe(false);
    });
});
