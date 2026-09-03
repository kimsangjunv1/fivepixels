import { useEffect } from "react";
import { DeleteIcon, EditIcon, MemoIcon, RevertIcon } from "@/components/icons/Icons.js";
import {
    MENU_TOOLTIP_ICON_CLASS,
    MenuTooltipDivider,
    MenuTooltipItem,
    MenuTooltipSurface,
} from "@/tooltip/MenuTooltip.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";

type ContextMenuTooltipProps = {
    clientX: number;
    clientY: number;
    showRevert: boolean;
};

export function ContextMenuTooltip({ clientX, clientY, showRevert }: ContextMenuTooltipProps) {
    const { messages } = useReportPreferences();
    const {
        closeContextMenuTooltip,
        handlePickTargetEdit,
        handlePickTargetDelete,
        handlePickTargetRevert,
        handlePickTargetMemo,
    } = useReportSession();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeContextMenuTooltip();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeContextMenuTooltip]);

    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const left = Math.min(clientX, Math.max(8, viewportWidth - 180));
    const top = Math.min(clientY, Math.max(8, viewportHeight - (showRevert ? 176 : 144)));

    return (
        <MenuTooltipSurface
            positioning="fixed"
            style={{ left, top }}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            <MenuTooltipItem
                icon={
                    <EditIcon
                        className={MENU_TOOLTIP_ICON_CLASS}
                        fill="currentColor"
                    />
                }
                onClick={() => handlePickTargetEdit()}
            >
                {messages.pickTarget.contextEdit}
            </MenuTooltipItem>
            <MenuTooltipItem
                icon={
                    <MemoIcon
                        className={MENU_TOOLTIP_ICON_CLASS}
                        fill="currentColor"
                    />
                }
                onClick={() => handlePickTargetMemo()}
            >
                {messages.pickTarget.contextAddMemo}
            </MenuTooltipItem>
            {showRevert ? (
                <MenuTooltipItem
                    icon={
                        <RevertIcon
                            className={MENU_TOOLTIP_ICON_CLASS}
                            fill="currentColor"
                        />
                    }
                    onClick={() => handlePickTargetRevert()}
                >
                    {messages.pickTarget.contextRevert}
                </MenuTooltipItem>
            ) : null}
            <MenuTooltipDivider />
            <MenuTooltipItem
                danger
                icon={
                    <DeleteIcon
                        className={MENU_TOOLTIP_ICON_CLASS}
                        fill="currentColor"
                    />
                }
                onClick={() => handlePickTargetDelete()}
            >
                {messages.pickTarget.contextDelete}
            </MenuTooltipItem>
        </MenuTooltipSurface>
    );
}
