export const LOGIN_METHOD_VALUES = ["local", "api", "artemis"] as const;
export type LoginMethod = (typeof LOGIN_METHOD_VALUES)[number];

export function isRemoteLoginMethod(method: LoginMethod | null | undefined): method is "api" | "artemis" {
    return method === "api" || method === "artemis";
}
