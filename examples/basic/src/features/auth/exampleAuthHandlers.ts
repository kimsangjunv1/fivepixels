import { ReportAuthError, type ReportApiLoginPayload, type ReportApiRegisterPayload, type ReportAuthUser } from "@fivepixels-js/react";

const STORAGE_KEY = "fivepixels-example:api-users:v1";

type ExampleApiUser = {
    id: string;
    loginId: string;
    password: string;
    email: string;
    username: string;
};

function readUsers(): ExampleApiUser[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as ExampleApiUser[]) : [];
    } catch {
        return [];
    }
}

function writeUsers(users: ExampleApiUser[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function exampleApiRegister(payload: ReportApiRegisterPayload): Promise<void> {
    const loginId = payload.loginId.trim();
    const email = payload.email.trim();
    const username = payload.username.trim();

    if (!loginId || !payload.password || !email || !username || payload.password !== payload.passwordConfirm || !isValidEmail(email)) {
        throw new ReportAuthError("invalid-registration", "400BAD_REQUEST", 400);
    }

    const users = readUsers();

    if (users.some((user) => user.loginId === loginId || user.email === email)) {
        throw new ReportAuthError("account-already-exists", "account-already-exists", 409);
    }

    users.push({
        id: `api-${Date.now()}`,
        loginId,
        password: payload.password,
        email,
        username,
    });
    writeUsers(users);
}

export async function exampleApiLogin(payload: ReportApiLoginPayload): Promise<ReportAuthUser> {
    const loginId = payload.loginId.trim();
    const user = readUsers().find((item) => item.loginId === loginId && item.password === payload.password);

    if (!user) {
        throw new ReportAuthError("unauthorized", "Login failed", 401);
    }

    return { id: user.id, name: user.username, email: user.email };
}

export async function exampleArtemisLogin(): Promise<ReportAuthUser> {
    return {
        id: "artemis-google-demo",
        name: "Artemis User",
        email: "artemis.user@example.com",
    };
}
