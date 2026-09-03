import { Shimmer, type TextShimmerProps } from "./ui/Shimmer.js";

export type { TextShimmerProps };

export const Text = {
    Shimmer,
} satisfies {
    Shimmer: typeof Shimmer;
};
