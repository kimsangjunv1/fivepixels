import { qrcodegen } from "../../vendor/nayuki/qrcodegen.js";
export type EncodedQr = {
    size: number;
    /** Row-major dark modules (`true` = black). */
    modules: boolean[][];
};
export declare function encodeQrModules(text: string, ecl?: qrcodegen.QrCode.Ecc): EncodedQr;
/** Compact SVG path for dark modules (quiet zone included). */
export declare function buildQrSvgPath(encoded: EncodedQr, moduleSize?: number, quietZoneModules?: number): {
    path: string;
    dimension: number;
};
//# sourceMappingURL=encodeQrSvg.d.ts.map