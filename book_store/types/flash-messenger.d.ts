// types/flash-messenger.d.ts
declare module "flash-messenger" {
  import { RequestHandler } from "express";

  interface FlashMessenger {
    middleware: RequestHandler;
  }

  const FlashMessenger: FlashMessenger;
  export default FlashMessenger;
}
