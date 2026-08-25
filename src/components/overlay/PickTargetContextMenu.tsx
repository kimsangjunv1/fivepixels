import { useEffect } from "react";
import { DeleteIcon, EditIcon, MemoIcon, RevertIcon } from "@/components/icons/Icons.js";
import { STYLE_TOOLTIP_SURFACE_CLASS } from "@/components/ui/PointerFollowTooltip.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { MOTION } from "@/constants/motionClasses.js";

const MENU_SURFACE_CLASS = `pointer-events-auto fixed z-[1000004] min-w-[160px] ${STYLE_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn}`;
const MENU_ITEM_CLASS =
    "flex w-full items-center gap-[8px] rounded-[8px] py-[6px] text-left text-[14px] font-medium leading-[1.45] text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)]";
const MENU_DIVIDER_CLASS = "my-[4px] h-px bg-[var(--adaptive-border-subtle)]";
const MENU_ICON_CLASS = "h-[16px] w-[16px] shrink-0";

type PickTargetContextMenuProps = {
    clientX: number;
    clientY: number;
    showRevert: boolean;
};

export function PickTargetContextMenu({ clientX, clientY, showRevert }: PickTargetContextMenuProps) {
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
    const left = Math.min(clientX, Math.max(8, viewportWidth - 180));
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
                className={MENU_ITEM_CLASS}
            >
                <EditIcon
                    className={MENU_ICON_CLASS}
                    fill="currentColor"
                />
                {messages.pickTarget.contextEdit}
            </button>
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => handlePickTargetMemo()}
                className={MENU_ITEM_CLASS}
            >
                <MemoIcon
                    className={MENU_ICON_CLASS}
                    fill="currentColor"
                />
                {messages.pickTarget.contextAddMemo}
            </button>
            {showRevert ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={() => handlePickTargetRevert()}
                    className={MENU_ITEM_CLASS}
                >
                    <RevertIcon
                        className={MENU_ICON_CLASS}
                        fill="currentColor"
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
                    className={MENU_ICON_CLASS}
                    fill="currentColor"
                />
                {messages.pickTarget.contextDelete}
            </button>
        </div>
    );
}
