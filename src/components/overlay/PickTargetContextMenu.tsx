import { useEffect } from "react";
import { DeleteIcon, EditIcon, RevertIcon } from "@/components/icons/Icons.js";
import { useReport } from "@/providers/reportContext.js";

const MENU_SURFACE_CLASS =
    "pointer-events-auto fixed z-[1000004] min-w-[140px] overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] py-[4px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const MENU_ITEM_CLASS =
    "flex w-full items-center gap-[8px] px-[12px] py-[8px] text-left text-[14px] font-medium hover:bg-[var(--adaptive-black100)]";
const MENU_DIVIDER_CLASS = "my-[4px] h-px bg-[var(--adaptive-border-subtle)]";

type PickTargetContextMenuProps = {
    clientX: number;
    clientY: number;
    showRevert: boolean;
};

export function PickTargetContextMenu({ clientX, clientY, showRevert }: PickTargetContextMenuProps) {
    const {
        messages,
        closePickTargetContextMenu,
        handlePickTargetEdit,
        handlePickTargetDelete,
        handlePickTargetRevert,
    } = useReport();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closePickTargetContextMenu();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closePickTargetContextMenu]);

    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const left = Math.min(clientX, Math.max(8, viewportWidth - 160));
    const top = Math.min(clientY, Math.max(8, viewportHeight - (showRevert ? 140 : 108)));

    return (
        <div
            data-fivepixels-interactive=""
            className={MENU_SURFACE_CLASS}
            style={{ left, top }}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => handlePickTargetEdit()}
                className={`${MENU_ITEM_CLASS} text-[#1f1f1f]`}
            >
                <EditIcon
                    className="h-[18px] w-[18px] shrink-0"
                    fill="#1f1f1f"
                />
                {messages.pickTarget.contextEdit}
            </button>
            {showRevert ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={() => handlePickTargetRevert()}
                    className={`${MENU_ITEM_CLASS} text-[#1f1f1f]`}
                >
                    <RevertIcon
                        className="h-[18px] w-[18px] shrink-0"
                        fill="#1f1f1f"
                    />
                    {messages.pickTarget.contextRevert}
                </button>
            ) : null}
            <div
                role="separator"
                aria-hidden="true"
                className={MENU_DIVIDER_CLASS}
            />
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => handlePickTargetDelete()}
                className={`${MENU_ITEM_CLASS} text-[#ff1861] hover:bg-[#ff18611a]`}
            >
                <DeleteIcon
                    className="h-[18px] w-[18px] shrink-0"
                    fill="#ff1861"
                />
                {messages.pickTarget.contextDelete}
            </button>
        </div>
    );
}
