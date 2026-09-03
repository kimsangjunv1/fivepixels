import { useState, type ReactNode } from "react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu.js";

export type AskAiCopyMenuItem = {
    id: string;
    label: string;
    onSelect: () => void | Promise<void>;
    disabled?: boolean;
};

type AskAiCopyDropdownProps = {
    items: AskAiCopyMenuItem[];
    trigger: (state: { open: boolean; copied: boolean; toggle: () => void }) => ReactNode;
    align?: "left" | "right";
    menuClassName?: string;
};

export function AskAiCopyDropdown({ items, trigger, align = "left", menuClassName }: AskAiCopyDropdownProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSelect = (item: AskAiCopyMenuItem) => {
        if (item.disabled) {
            return;
        }

        void Promise.resolve(item.onSelect())
            .then(() => {
                setCopied(true);
                setMenuOpen(false);
                window.setTimeout(() => setCopied(false), 1500);
            })
            .catch(() => {
                setCopied(false);
            });
    };

    return (
        <DropdownMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            align={align}
            menuClassName={menuClassName}
            trigger={trigger({
                open: menuOpen,
                copied,
                toggle: () => setMenuOpen((current) => !current),
            })}
        >
            {items.map((item) => (
                <DropdownMenuItem
                    key={item.id}
                    disabled={item.disabled}
                    onClick={() => handleSelect(item)}
                >
                    {item.label}
                </DropdownMenuItem>
            ))}
        </DropdownMenu>
    );
}
