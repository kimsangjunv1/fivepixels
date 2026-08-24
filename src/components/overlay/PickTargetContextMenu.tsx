import { useEffect } from "react";
import { DeleteIcon, EditIcon, MemoIcon, RevertIcon } from "@/components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";

const MENU_SURFACE_CLASS =
    "pointer-events-auto fixed z-[1000004] min-w-[140px] overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-overlay)] py-[4px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const MENU_ITEM_CLASS =
    "flex w-full items-center gap-[8px] px-[12px] py-[8px] text-left text-[14px] font-medium hover:bg-[var(--adaptive-black100)]";
const MENU_DIVIDER_CLASS = "my-[4px] h-px bg-[var(--adaptive-border-subtle)]";

type PickTargetContextMenuProps = {
    clientX: number;
    clientY: number;
    showRevert: boolean;
    showMemo: boolean;
};

export function PickTargetContextMenu({ clientX, clientY, showRevert, showMemo }: PickTargetContextMenuProps) {
    const { messages } = useReportPreferences();
    const {
        closePickTargetContextMenu,
        handlePickTargetEdit,
        handlePickTargetDelete,
        handlePickTargetRevert,
        handlePickTargetMemo,
    } = useReportSession();

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
    const top = Math.min(clientY, Math.max(8, viewportHeight - (showRevert ? 176 : 144)));

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
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => handlePickTargetMemo()}
                className={`${MENU_ITEM_CLASS} text-[#1f1f1f]`}
            >
                <MemoIcon
                    className="h-[18px] w-[18px] shrink-0"
                    fill="#1f1f1f"
                />
                {showMemo ? messages.pickTarget.contextEditMemo : messages.pickTarget.contextAddMemo}
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
                className={`${MENU_ITEM_CLASS} text-[var(--adaptive-accent-red)] hover:bg-[color-mix(in_srgb,var(--adaptive-accent-red)_10%,transparent)]`}
            >
                <DeleteIcon
                    className="h-[18px] w-[18px] shrink-0"
                    fill="var(--adaptive-accent-red)"
                />
                {messages.pickTarget.contextDelete}
            </button>
        </div>
    );
}
