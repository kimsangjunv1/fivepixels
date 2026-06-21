import { useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "@/components/panel/PanelDropdownMenu.js";
import type { ReportAuthor } from "@/types/report.js";

type AuthorSelectorProps = {
    authors: ReportAuthor[];
    value: string;
    onChange: (value: string) => void;
};

export function AuthorSelector({ authors, value, onChange }: AuthorSelectorProps) {
    const { messages } = useReport();
    const [menuOpen, setMenuOpen] = useState(false);

    if (authors.length === 0) {
        return (
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={messages.author.placeholder}
                className="h-[24px] min-w-0 flex-1 rounded-full bg-[var(--adaptive-surface-muted)] px-[12px] py-[4px] text-[12px] text-[var(--adaptive-text-primary)] outline-none placeholder:text-[var(--adaptive-text-muted)]"
            />
        );
    }

    return (
        <PanelDropdownMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            align="left"
            menuClassName="min-w-full"
            trigger={
                <button
                    type="button"
                    onClick={() => setMenuOpen((current) => !current)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    aria-label={messages.author.selectAriaLabel}
                    className="flex h-[24px] w-full min-w-0 items-center justify-between rounded-full bg-[var(--adaptive-surface-muted)] py-[4px] pr-[10px] pl-[12px] text-[12px] outline-none"
                >
                    <span className={`text-[var(--adaptive-black500)]`}>{value || messages.author.selectPlaceholder}</span>

                    <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>
            }
        >
            {authors.map((author) => (
                <PanelDropdownMenuItem
                    key={author.id}
                    active={author.name === value}
                    onClick={() => {
                        onChange(author.name);
                        setMenuOpen(false);
                    }}
                >
                    {author.name}
                </PanelDropdownMenuItem>
            ))}
        </PanelDropdownMenu>
    );
}
