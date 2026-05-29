type ClientFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

export type ApiResponse<T> = {
    result: T;
};

export async function clientFetch<T>(url: string, options: ClientFetchOptions = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers ?? {}),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body === undefined ? undefined : isFormData ? (options.body as FormData) : JSON.stringify(options.body),
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message ?? "API 요청에 실패했습니다.");
        }

        return data as T;
    } finally {
        // no-op: library mode does not depend on a global pending store
    }
}

export const clientApi = {
    get: <T>(url: string) => clientFetch<T>(url),
    post: <T>(url: string, body?: unknown, options?: ClientFetchOptions) => clientFetch<T>(url, { ...options, method: "POST", body }),
    patch: <T>(url: string, body?: unknown, options?: ClientFetchOptions) => clientFetch<T>(url, { ...options, method: "PATCH", body }),
    delete: <T>(url: string, options?: ClientFetchOptions) => clientFetch<T>(url, { ...options, method: "DELETE" }),
};
