import { useEffect, useMemo, useState } from "react";
import { buildQrSvgPath, encodeQrModules } from "@/shared/utils/qr/encodeQrSvg.js";
import { resolveDevicePreviewQrUrl } from "@/shared/utils/qr/devicePreviewShareUrl.js";

const MANUAL_URL_STORAGE_KEY = "fivepixels:device-preview-qr-manual-url";

function readStoredManualUrl(): string {
    if (typeof window === "undefined") {
        return "";
    }

    try {
        return window.sessionStorage.getItem(MANUAL_URL_STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
}

function persistManualUrl(value: string) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (value.trim()) {
            window.sessionStorage.setItem(MANUAL_URL_STORAGE_KEY, value);
        } else {
            window.sessionStorage.removeItem(MANUAL_URL_STORAGE_KEY);
        }
    } catch {
        // ignore quota / private mode
    }
}

export type DevicePreviewQrPanelProps = {
    pageHref: string;
    title: string;
    hintLocalhost: string;
    urlInputLabel: string;
    urlInputPlaceholder: string;
    urlInputAriaLabel: string;
    invalidUrlMessage: string;
    emptyUrlMessage: string;
    copyLabel: string;
    copiedLabel: string;
    copyAriaLabel: string;
    qrAriaLabel: string;
    className?: string;
    width?: number;
};

export function DevicePreviewQrPanel({
    pageHref,
    title,
    hintLocalhost,
    urlInputLabel,
    urlInputPlaceholder,
    urlInputAriaLabel,
    invalidUrlMessage,
    emptyUrlMessage,
    copyLabel,
    copiedLabel,
    copyAriaLabel,
    qrAriaLabel,
    className = "",
    width = 220,
}: DevicePreviewQrPanelProps) {
    const [manualUrl, setManualUrl] = useState(readStoredManualUrl);
    const [copied, setCopied] = useState(false);

    const resolved = useMemo(
        () =>
            resolveDevicePreviewQrUrl({
                pageHref,
                manualUrl,
            }),
        [manualUrl, pageHref],
    );

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
        } catch {
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
        } catch {
            setCopied(false);
        }
    };

    return (
        <div
            data-fivepixels-interactive=""
            className={`pointer-events-auto flex flex-col gap-[4px] ${className}`.trim()}
            style={{ width }}
            role="region"
            aria-label={title}
        >
            {/* <div className="text-[14px] font-semibold text-[var(--adaptive-black700)] whitespace-break-spaces leading-[1.5]">{title}</div> */}

            <div className="overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-white">
                {qr ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={`0 0 ${qr.dimension} ${qr.dimension}`}
                        className="block aspect-square w-full"
                        role="img"
                        aria-label={qrAriaLabel}
                    >
                        <rect
                            width={qr.dimension}
                            height={qr.dimension}
                            fill="#ffffff"
                        />
                        <path
                            d={qr.path}
                            fill="#0f172a"
                        />
                    </svg>
                ) : (
                    <div
                        className="flex aspect-square w-full items-center justify-center border border-dashed border-[rgba(148,163,184,0.55)] bg-[rgba(248,250,252,0.92)] px-[10px] text-center text-[12px] font-medium leading-snug text-slate-500"
                        aria-hidden
                    >
                        QR
                    </div>
                )}
            </div>

            <section className="rounded-[12px] bg-[var(--adaptive-fillOpacity700)] overflow-hidden shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[10px]">
                {resolved.needsManualUrl ? (
                    <div className="flex gap-[4px] bg-[var(--adaptive-neutralTintOpacity900)]">
                        <label className="flex flex-col gap-[3px]">
                            <span className="sr-only">{urlInputLabel}</span>
                            <input
                                type="url"
                                value={manualUrl}
                                onChange={(event) => setManualUrl(event.target.value)}
                                placeholder={urlInputPlaceholder}
                                aria-label={urlInputAriaLabel}
                                className="h-[30px] w-full px-[10px] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)] focus:border-[var(--adaptive-blue500)]"
                            />
                        </label>

                        {/* {statusMessage ? <p className="text-[14px] leading-snug text-[var(--adaptive-red500)]">{statusMessage}</p> : null} */}
                        {resolved.url ? (
                            <div className="flex flex-col gap-[6px]">
                                <button
                                    type="button"
                                    onClick={() => void handleCopy()}
                                    aria-label={copyAriaLabel}
                                    className="h-[28px] rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] text-[12px] font-semibold text-[var(--adaptive-black900)] hover:bg-[var(--adaptive-black100)]"
                                >
                                    {copied ? copiedLabel : copyLabel}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <p className="text-[12px] text-[var(--adaptive-black500)] leading-[1.5] whitespace-break-spaces px-[10px] py-[6px]">{hintLocalhost}</p>
            </section>
        </div>
    );
}
