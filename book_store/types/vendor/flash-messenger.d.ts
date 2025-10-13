declare module "flash-messenger" {
  import { RequestHandler, Response } from "express";

  interface FlashMessenger {
    (res: Response, type: string, message: string, icon?: string, toast?: boolean): void;
    middleware: RequestHandler;
  }

  const FlashMessenger: FlashMessenger;
  export default FlashMessenger;
}
