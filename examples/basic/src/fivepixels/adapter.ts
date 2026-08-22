import type { FivePixelsAdapter } from "@fivepixels-js/react";

type CreateAdapterOptions = {
    baseUrl: string;
    projectId: string;
    getAccessToken?: () => string | null;
};

async function request<T>(baseUrl: string, path: string, init?: RequestInit, getAccessToken?: () => string | null): Promise<T> {
    const token = getAccessToken?.();

    const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers ?? {}),
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export function createFivepixelsAdapter({ baseUrl, projectId, getAccessToken }: CreateAdapterOptions): FivePixelsAdapter {
    const projectBase = `/projects/${projectId}`;
    const api = <T,>(path: string, init?: RequestInit) => request<T>(baseUrl, path, init, getAccessToken);

    return {
        auth: {
            login: (payload) => api("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
            signup: (payload) => api("/auth/register", { method: "POST", body: JSON.stringify(payload) }).then(() => undefined),
        },
        session: {
            getMe: () => api("/users/me"),
        },
        markers: {
            list: ({ pathname }) => api(`${projectBase}/feedback-markers?pathname=${encodeURIComponent(pathname)}`),
        },
        feedback: {
            create: (payload) => api(`${projectBase}/feedbacks`, { method: "POST", body: JSON.stringify(payload) }),
            get: (feedbackId) => api(`${projectBase}/feedbacks/${feedbackId}`),
            getForUi: (feedbackId) => api(`/ui${projectBase}/feedbacks/${feedbackId}`),
            update: (feedbackId, payload) =>
                api(`${projectBase}/feedbacks/${feedbackId}`, { method: "PATCH", body: JSON.stringify(payload) }),
            delete: (feedbackId) => api(`${projectBase}/feedbacks/${feedbackId}`, { method: "DELETE" }),
        },
        cases: {
            list: (feedbackId) => api(`${projectBase}/feedbacks/${feedbackId}/report-cases`),
            update: (feedbackId, caseId, payload) =>
                api(`${projectBase}/feedbacks/${feedbackId}/report-cases/${caseId}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                }),
            getTimeline: (feedbackId, caseId) =>
                api(`${projectBase}/feedbacks/${feedbackId}/report-cases/${caseId}/timeline`),
        },
        replies: {
            list: (feedbackId, caseId, params) =>
                api(
                    `${projectBase}/feedbacks/${feedbackId}/report-cases/${caseId}/replies?limit=${params?.limit ?? 20}${
                        params?.cursor ? `&cursor=${encodeURIComponent(params.cursor)}` : ""
                    }`,
                ),
            create: (feedbackId, caseId, payload) =>
                api(`${projectBase}/feedbacks/${feedbackId}/report-cases/${caseId}/replies`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                }),
        },
        members: {
            list: () => api(`${projectBase}/members`),
            create: (payload) => api(`${projectBase}/members`, { method: "POST", body: JSON.stringify(payload) }),
            update: (userId, payload) =>
                api(`${projectBase}/members/${userId}`, { method: "PATCH", body: JSON.stringify(payload) }),
        },
    };
}
