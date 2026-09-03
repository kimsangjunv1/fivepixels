import { qrcodegen } from "@/shared/vendor/nayuki/qrcodegen.js";

export type EncodedQr = {
    size: number;
    /** Row-major dark modules (`true` = black). */
    modules: boolean[][];
};

export function encodeQrModules(text: string, ecl: qrcodegen.QrCode.Ecc = qrcodegen.QrCode.Ecc.MEDIUM): EncodedQr {
    const qr = qrcodegen.QrCode.encodeText(text, ecl);
    const modules: boolean[][] = [];

    for (let y = 0; y < qr.size; y += 1) {
        const row: boolean[] = [];
        for (let x = 0; x < qr.size; x += 1) {
            row.push(qr.getModule(x, y));
        }
        modules.push(row);
    }

    return { size: qr.size, modules };
}

/** Compact SVG path for dark modules (quiet zone included). */
export function buildQrSvgPath(encoded: EncodedQr, moduleSize = 4, quietZoneModules = 2): { path: string; dimension: number } {
    const { size, modules } = encoded;
    const dimension = (size + quietZoneModules * 2) * moduleSize;
    const parts: string[] = [];

    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            if (!modules[y]?.[x]) {
                continue;
            }
            const px = (x + quietZoneModules) * moduleSize;
            const py = (y + quietZoneModules) * moduleSize;
            parts.push(`M${px},${py}h${moduleSize}v${moduleSize}h-${moduleSize}z`);
        }
    }

    return { path: parts.join(""), dimension };
}
