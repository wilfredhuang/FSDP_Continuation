import { Response } from "express";
export type FlashType = "success" | "error" | "info" | "danger";
declare const flashMessage: (res: Response, messageType: FlashType, message: string, icon: string, dismissable: boolean) => void;
export default flashMessage;
//# sourceMappingURL=messenger.d.ts.map