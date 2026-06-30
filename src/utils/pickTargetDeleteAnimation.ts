import { getReportPortalRoot } from "./dom.js";

export const PICK_TARGET_DELETE_ANIMATION_MS = 550;

export function playPickTargetDeleteAnimation(rect: DOMRect): Promise<void> {
    return new Promise((resolve) => {
        const shell = document.createElement("div");
        shell.className = "fivepixels-pick-target-delete-overlay";
        shell.setAttribute("data-fivepixels-interactive", "");
        shell.style.left = `${rect.left}px`;
        shell.style.top = `${rect.top}px`;
        shell.style.width = `${Math.max(rect.width, 1)}px`;
        shell.style.height = `${Math.max(rect.height, 1)}px`;

        const wave = document.createElement("div");
        wave.className = "fivepixels-pick-target-delete-wave";
        shell.appendChild(wave);

        getReportPortalRoot().appendChild(shell);

        let settled = false;

        const finish = () => {
            if (settled) {
                return;
            }

            settled = true;
            shell.remove();
            resolve();
        };

        wave.addEventListener("animationend", finish, { once: true });
        window.setTimeout(finish, PICK_TARGET_DELETE_ANIMATION_MS + 80);
    });
}
