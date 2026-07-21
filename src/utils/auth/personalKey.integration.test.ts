import { beforeEach, describe, expect, it } from "vitest";
import { getPersonalKeyStorageKey } from "@/constants/storageKeys.js";
import {
    createReviewerKeyPair,
    parsePrivateKeyBundle,
    publicKeysMatch,
    readPersonalKey,
    resolvePersonalKeyAuthor,
    savePersonalKey,
    serializePublicKey,
} from "./personalKey.js";

const PROJECT_ID = "fivepixels-basic-example";
const ENV = "STAGED";

describe("personalKey integration – full onboarding flow", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("new user key + matching team config authorizes correctly", async () => {
        const authorId = "7dd72d97-bc0d-46be-a5e8-87f13887f331";
        const issued = await createReviewerKeyPair(PROJECT_ID, ENV, authorId, "시발롬");

        savePersonalKey(PROJECT_ID, ENV, issued.privateKey);
        const stored = readPersonalKey(PROJECT_ID, ENV);
        expect(stored).toBe(issued.privateKey);

        const bundle = parsePrivateKeyBundle(issued.privateKey)!;
        const teamReviewers = [{ id: authorId, name: "시발롬", publicKey: issued.publicKey }];

        const author = resolvePersonalKeyAuthor(bundle, undefined, teamReviewers);
        expect(author).toEqual({ id: authorId, name: "시발롬", publicKey: issued.publicKey });
    });

    it("mismatched authorId in team blocks authorization", async () => {
        const issued = await createReviewerKeyPair(PROJECT_ID, ENV, "new-user-id", "시발롬");
        savePersonalKey(PROJECT_ID, ENV, issued.privateKey);

        const bundle = parsePrivateKeyBundle(issued.privateKey)!;
        const teamReviewers = [
            {
                id: "7dd72d97-bc0d-46be-a5e8-87f13887f331",
                name: "시발롬",
                publicKey: issued.publicKey,
            },
        ];

        expect(resolvePersonalKeyAuthor(bundle, undefined, teamReviewers)).toBeUndefined();
    });

    it("mismatched publicKey in team blocks authorization", async () => {
        const authorId = "7dd72d97-bc0d-46be-a5e8-87f13887f331";
        const issued = await createReviewerKeyPair(PROJECT_ID, ENV, authorId, "시발롬");
        savePersonalKey(PROJECT_ID, ENV, issued.privateKey);

        const bundle = parsePrivateKeyBundle(issued.privateKey)!;
        const teamReviewers = [
            {
                id: authorId,
                name: "시발롬",
                publicKey:
                    "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiMmlLdGZiclZuamdqVW9LTVdrdWNVSHRpY0lnUHZlZFVBWWpOREd6cjF6RSIsInkiOiJITzVCWlllN2dWU29WN1hOVnNlbzE0WkFQNXhaOHdaVU5hcEt3Z0twYlpFIn0",
            },
        ];

        expect(resolvePersonalKeyAuthor(bundle, undefined, teamReviewers)).toBeUndefined();
    });

    it("projectId mismatch wipes key on read", async () => {
        const issued = await createReviewerKeyPair("my-app", undefined, "user-1", "test");
        savePersonalKey("my-app", undefined, issued.privateKey);

        expect(readPersonalKey(PROJECT_ID, ENV)).toBeNull();
        expect(localStorage.getItem(getPersonalKeyStorageKey("my-app", undefined))).toBe(issued.privateKey);
    });

    it("environment mismatch blocks save and read", async () => {
        const issued = await createReviewerKeyPair(PROJECT_ID, ENV, "user-1", "test");

        expect(savePersonalKey(PROJECT_ID, undefined, issued.privateKey)).toBe(false);
        expect(savePersonalKey(PROJECT_ID, "PROD", issued.privateKey)).toBe(false);
        expect(savePersonalKey(PROJECT_ID, ENV, issued.privateKey)).toBe(true);
    });

    it("serializePublicKey is stable for round-trip comparison", async () => {
        const issued = await createReviewerKeyPair(PROJECT_ID, ENV, "user-1", "test");
        const bundle = parsePrivateKeyBundle(issued.privateKey)!;
        const reserialized = serializePublicKey(bundle.publicKey);

        expect(reserialized).toBe(issued.publicKey);
        expect(
            resolvePersonalKeyAuthor(bundle, undefined, [{ id: "user-1", name: "test", publicKey: reserialized }]),
        ).toBeDefined();
    });

    it("publicKeysMatch accepts equivalent JWK payloads with different key order", async () => {
        const issued = await createReviewerKeyPair(PROJECT_ID, ENV, "user-1", "test");
        const bundle = parsePrivateKeyBundle(issued.privateKey)!;
        const reordered = serializePublicKey({
            y: bundle.publicKey.y,
            x: bundle.publicKey.x,
            kty: bundle.publicKey.kty,
            crv: bundle.publicKey.crv,
            ext: bundle.publicKey.ext,
            key_ops: bundle.publicKey.key_ops,
        });

        expect(publicKeysMatch(issued.publicKey, reordered)).toBe(true);
    });

    it("authorizes the reported user key against the configured team publicKey", () => {
        const privateKey =
            "stpk2.eyJwcm9qZWN0SWQiOiJmaXZlcGl4ZWxzLWJhc2ljLWV4YW1wbGUiLCJlbnZpcm9ubWVudCI6IlNUQUdFRCIsImF1dGhvcklkIjoiYjA3YTkzMzktY2QwZS00OTAxLWI0YmEtNzgwMjlkMWFlY2I0IiwiYXV0aG9yTmFtZSI6Iu2FjOyKpO2KuCIsInByaXZhdGVLZXkiOnsiY3J2IjoiUC0yNTYiLCJkIjoiOEViY2NjNjhpQXVDRm9VbnJXWUN2RXZCTFY5Nnc4RS1iakhMLVhvcVZoOCIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJzaWduIl0sImt0eSI6IkVDIiwieCI6Ijgxb2ZXYXVBQ2xNV3Jfd1JTR1pXSkVLT2pCamx6Z0ZKdEJQdXVKNjJJeU0iLCJ5Ijoib2pqeHpZUXh3NzItcmpid3VCV20xZmJPZ1lWOGNpWXBGbE85eXFBcXVvVSJ9LCJwdWJsaWNLZXkiOnsiY3J2IjoiUC0yNTYiLCJleHQiOnRydWUsImtleV9vcHMiOlsidmVyaWZ5Il0sImt0eSI6IkVDIiwieCI6Ijgxb2ZXYXVBQ2xNV3Jfd1JTR1pXSkVLT2pCamx6Z0ZKdEJQdXVKNjJJeU0iLCJ5Ijoib2pqeHpZUXh3NzItcmpid3VCV20xZmJPZ1lWOGNpWXBGbE85eXFBcXVvVSJ9fQ";
        const teamPublicKey =
            "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiODFvZldhdUFDbE1Xcl93UlNHWldKRUtPakJqbHpnRkp0QlB1dUo2Mkl5TSIsInkiOiJvamp4ellReHc3Mi1yamJ3dUJXbTFmYk9nWVY4Y2lZcEZsTzl5cUFxdW9VIn0";
        const bundle = parsePrivateKeyBundle(privateKey)!;

        expect(savePersonalKey(PROJECT_ID, ENV, privateKey)).toBe(true);
        expect(
            resolvePersonalKeyAuthor(bundle, undefined, [
                { id: "b07a9339-cd0e-4901-b4ba-78029d1aecb4", name: "테스트", publicKey: teamPublicKey },
            ]),
        ).toEqual({
            id: "b07a9339-cd0e-4901-b4ba-78029d1aecb4",
            name: "테스트",
            publicKey: teamPublicKey,
        });
    });
});
