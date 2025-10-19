import { Request, Response } from "express";
declare const _default: {
    formatDate(date: string | Date | null, targetFormat: string): string;
    radioCheck(value: string, radioValue: string): string;
    replaceCommas(value: string): string;
    adminCheck(value: {
        isadmin?: boolean;
    } | null): boolean;
    convertUpper(value: string): string;
    loopNTimes(pages: number): number[];
    checkPage(pageValue: number): boolean;
    formatDeliveryStatus(status: string): string;
    manualSessionSave(req: Request): Promise<void>;
    manualSessionSaveNoCaching(req: Request, res: Response): Promise<void>;
    saveSession(req: Request): Promise<string>;
};
export default _default;
//# sourceMappingURL=hbs.d.ts.map