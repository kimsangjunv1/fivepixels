import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { buildQrSvgPath, encodeQrModules } from "../../utils/qr/encodeQrSvg.js";
import { resolveDevicePreviewQrUrl } from "../../utils/qr/devicePreviewShareUrl.js";
const MANUAL_URL_STORAGE_KEY = "fivepixels:device-preview-qr-manual-url";
function readStoredManualUrl() {
    if (typeof window === "undefined") {
        return "";
    }
    try {
        return window.sessionStorage.getItem(MANUAL_URL_STORAGE_KEY) ?? "";
    }
    catch {
        return "";
    }
}
function persistManualUrl(value) {
    if (typeof window === "undefined") {
        return;
    }
    try {
        if (value.trim()) {
            window.sessionStorage.setItem(MANUAL_URL_STORAGE_KEY, value);
        }
        else {
            window.sessionStorage.removeItem(MANUAL_URL_STORAGE_KEY);
        }
    }
    catch {
        // ignore quota / private mode
    }
}
export function DevicePreviewQrPanel({ pageHref, title, hintLocalhost, urlInputLabel, urlInputPlaceholder, urlInputAriaLabel, invalidUrlMessage, emptyUrlMessage, copyLabel, copiedLabel, copyAriaLabel, qrAriaLabel, className = "", width = 220, }) {
    const [manualUrl, setManualUrl] = useState(readStoredManualUrl);
    const [copied, setCopied] = useState(false);
    const resolved = useMemo(() => resolveDevicePreviewQrUrl({
        pageHref,
        manualUrl,
    }), [manualUrl, pageHref]);
    useEffect(() => {
        if (resolved.needsManualUrl) {
            persistManualUrl(manualUrl);
        }
    }, [manualUrl, resolved.needsManualUrl]);
    const qr = useMemo(() => {
        if (!resolved.url) {
            return null;
        }
        try {
            const encoded = encodeQrModules(resolved.url);
            const { path, dimension } = buildQrSvgPath(encoded);
            return { path, dimension, url: resolved.url };
        }
        catch {
            return null;
        }
    }, [resolved.url]);
    const statusMessage = (() => {
        if (!resolved.needsManualUrl) {
            return null;
        }
        if (!manualUrl.trim()) {
            return emptyUrlMessage;
        }
        if (!resolved.url || !qr) {
            return invalidUrlMessage;
        }
        return null;
    })();
    const handleCopy = async () => {
        if (!resolved.url) {
            return;
        }
        try {
            await navigator.clipboard.writeText(resolved.url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }
        catch {
            setCopied(false);
        }
    };
    return (_jsxs("div", { "data-fivepixels-interactive": "", className: `pointer-events-auto flex flex-col gap-[4px] ${className}`.trim(), style: { width }, role: "region", "aria-label": title, children: [_jsx("div", { className: "text-[14px] font-semibold tracking-[0.01em] text-[var(--adaptive-black900)] whitespace-break-spaces leading-[1.5]", children: title }), _jsx("div", { className: "overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-white", children: qr ? (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${qr.dimension} ${qr.dimension}`, className: "block aspect-square w-full", role: "img", "aria-label": qrAriaLabel, children: [_jsx("rect", { width: qr.dimension, height: qr.dimension, fill: "#ffffff" }), _jsx("path", { d: qr.path, fill: "#0f172a" })] })) : (_jsx("div", { className: "flex aspect-square w-full items-center justify-center border border-dashed border-[rgba(148,163,184,0.55)] bg-[rgba(248,250,252,0.92)] px-[10px] text-center text-[10px] font-medium leading-snug text-slate-500", "aria-hidden": true, children: "QR" })) }), resolved.needsManualUrl ? (_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsxs("label", { className: "flex flex-col gap-[3px]", children: [_jsx("span", { className: "sr-only", children: urlInputLabel }), _jsx("input", { type: "url", value: manualUrl, onChange: (event) => setManualUrl(event.target.value), placeholder: urlInputPlaceholder, "aria-label": urlInputAriaLabel, className: "h-[30px] w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[11px] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)] focus:border-[var(--adaptive-blue500)]" })] }), statusMessage ? _jsx("p", { className: "text-[9px] leading-snug text-[var(--adaptive-red500)]", children: statusMessage }) : null] })) : null, resolved.url ? (_jsx("div", { className: "flex flex-col gap-[6px]", children: _jsx("button", { type: "button", onClick: () => void handleCopy(), "aria-label": copyAriaLabel, className: "h-[28px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[10px] font-semibold text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)]", children: copied ? copiedLabel : copyLabel }) })) : null, _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)] leading-[1.5] whitespace-break-spaces", children: hintLocalhost })] }));
}
//# sourceMappingURL=DevicePreviewQrPanel.js.map