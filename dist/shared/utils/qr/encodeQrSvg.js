import { qrcodegen } from "../../../shared/vendor/nayuki/qrcodegen.js";
export function encodeQrModules(text, ecl = qrcodegen.QrCode.Ecc.MEDIUM) {
    const qr = qrcodegen.QrCode.encodeText(text, ecl);
    const modules = [];
    for (let y = 0; y < qr.size; y += 1) {
        const row = [];
        for (let x = 0; x < qr.size; x += 1) {
            row.push(qr.getModule(x, y));
        }
        modules.push(row);
    }
    return { size: qr.size, modules };
}
/** Compact SVG path for dark modules (quiet zone included). */
export function buildQrSvgPath(encoded, moduleSize = 4, quietZoneModules = 2) {
    const { size, modules } = encoded;
    const dimension = (size + quietZoneModules * 2) * moduleSize;
    const parts = [];
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
//# sourceMappingURL=encodeQrSvg.js.map