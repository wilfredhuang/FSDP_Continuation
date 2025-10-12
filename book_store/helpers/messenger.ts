import { Response } from "express";

export type FlashType = "success" | "error" | "info" | "danger";

const flashMessage = (
  res: Response,
  messageType: FlashType,
  message: string,
  icon: string,
  dismissable: boolean
): void => {
  let alert: any;
  switch (messageType) {
    case "success":
      alert = res.flashMessenger.success(message);
      break;
    case "error":
      alert = res.flashMessenger.error(message);
      break;
    case "info":
      alert = res.flashMessenger.info(message);
      break;
    case "danger":
      alert = res.flashMessenger.danger(message);
      break;
    default:
      alert = res.flashMessenger.info(message);
  }
  alert.titleIcon = icon;
  alert.canBeDismissed = dismissable;
};

export default flashMessage;
