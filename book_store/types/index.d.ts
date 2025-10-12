import "express";

declare module "express-serve-static-core" {
  interface Response {
    flashMessenger: {
      success: (message: string) => any;
      error: (message: string) => any;
      info: (message: string) => any;
      danger: (message: string) => any;
    };
  }
}
