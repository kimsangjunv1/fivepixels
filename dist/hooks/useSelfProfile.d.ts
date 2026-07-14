export type SelfProfile = {
    name: string;
    authorId: string;
    completed: boolean;
};
export declare function readSelfProfile(projectId: string, environment: string | undefined): SelfProfile | null;
export declare function useSelfProfile(projectId: string, environment: string | undefined): {
    selfProfile: SelfProfile | null;
    saveSelfProfile: (profile: SelfProfile) => void;
    markOnboardingComplete: () => void;
};
//# sourceMappingURL=useSelfProfile.d.ts.map