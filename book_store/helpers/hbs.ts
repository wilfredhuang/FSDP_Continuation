import moment from "moment";
import { Request, Response } from "express";

export default {
  formatDate(date: string | Date | null, targetFormat: string): string {
    if (!date) return "Unavailable";
    return moment(date).format(targetFormat);
  },

  radioCheck(value: string, radioValue: string): string {
    return value === radioValue ? "checked" : "";
  },

  replaceCommas(value: string): string {
    if (!value) return "None";
    return value.replace(/,/g, " | ");
  },

  adminCheck(value: { isadmin?: boolean } | null): boolean {
    if (value?.isadmin) {
      console.log("Admin Account Detected");
      return true;
    } else if (value) {
      console.log("User Account Detected");
      return false;
    } else {
      console.log("Not logged in");
      return false;
    }
  },

  convertUpper(value: string): string {
    return value.toUpperCase();
  },

  loopNTimes(pages: number): number[] {
    const result: number[] = [];
    for (let i = 1; i <= pages; i++) result.push(i);
    return result;
  },

  checkPage(pageValue: number): boolean {
    return pageValue > 0;
  },

  formatDeliveryStatus(status: string): string {
    const map: Record<string, string> = {
      unknown: "Unknown",
      pre_transit: "Pre-transit",
      in_transit: "In-transit",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      return_to_sender: "Return to sender",
      failure: "Failure",
    };
    return map[status] ?? "Unknown";
  },

  async manualSessionSave(req: Request): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return reject(err);
        }
        resolve();
      });
    });
  },

  async manualSessionSaveNoCaching(req: Request, res: Response): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return reject(err);
        }
        resolve();
      });
    });
    res.set("Cache-Control", "no-store");
  },

  async saveSession(req: Request): Promise<string> {
    return new Promise((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) {
          console.log("Session failed to save");
          reject(err);
        } else {
          resolve("Saving session...");
        }
      });
    });
  },
};
