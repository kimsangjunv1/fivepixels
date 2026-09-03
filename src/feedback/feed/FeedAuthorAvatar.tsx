function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    if (parts.length === 1) {
        const value = parts[0];
        // Prefer first two syllables/chars for Korean single names like "김민수" → "김민"
        return value.slice(0, 2);
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`;
}

type FeedAuthorAvatarProps = {
    name: string;
    size?: "sm" | "md";
    className?: string;
};

export function FeedAuthorAvatar({ name, size = "md", className = "" }: FeedAuthorAvatarProps) {
    const dimension = size === "sm" ? "h-[22px] w-[22px] text-[9px]" : "h-[26px] w-[26px] text-[10px]";

    return (
        <span
            aria-hidden
            className={`inline-flex shrink-0 items-center justify-center rounded-[8px] bg-[var(--adaptive-black300)] font-semibold leading-none text-[var(--adaptive-black700)] ${dimension} ${className}`}
            title={name}
        >
            {getInitials(name)}
        </span>
    );
}
