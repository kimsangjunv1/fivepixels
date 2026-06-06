import { useState } from "react";
import { useReport } from "../../../providers/reportContext.js";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "../PanelDropdownMenu.js";
import type { ReportAuthor } from "../../../types/report.js";

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
                className="min-w-0 flex-1 rounded-full bg-[var(--adaptive-black800)] px-[12px] py-[4px] h-[24px] text-[12px] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)]"
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
                    className="flex w-full min-w-0 items-center justify-between rounded-full bg-[var(--adaptive-black800)] py-[4px] h-[24px] pr-[10px] pl-[12px] text-[12px] outline-none"
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
