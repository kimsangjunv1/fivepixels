import type { ComponentType } from "react";
import { FoundErrorStatusIcon, SettingsIcon } from "@/components/icons/Icons.js";

type FieldTag = {
    key: string;
    label: string;
};

type IconProps = {
    className?: string;
    fill?: string;
};

function resolveFieldTagIcon(key: string): ComponentType<IconProps> {
    const normalized = key.toLowerCase();

    if (normalized.includes("bug")) {
        return FoundErrorStatusIcon;
    }

    return SettingsIcon;
}

type FeedbackFieldTagIconsProps = {
    tags: FieldTag[];
    className?: string;
};

export function FeedbackFieldTagIcons({ tags, className = "" }: FeedbackFieldTagIconsProps) {
    if (tags.length === 0) {
        return null;
    }

    return (
        <span className={`inline-flex items-center gap-[4px] ${className}`}>
            {tags.map((tag) => {
                const Icon = resolveFieldTagIcon(tag.key);

                return (
                    <span
                        key={tag.key}
                        title={tag.label}
                        aria-label={tag.label}
                        className="inline-flex h-[14px] w-[14px] items-center justify-center text-[var(--adaptive-black500)]"
                    >
                        <Icon className="h-[14px] w-[14px]" />
                    </span>
                );
            })}
        </span>
    );
}
