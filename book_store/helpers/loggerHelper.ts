import chalk from "chalk";

/**
 * Generic log function that accepts any number of values
 */
const log = (colorFn: (msg: string) => string, ...args: unknown[]): void => {
  // Join all arguments safely into one printable string
  const message = args.map(arg => {
    if (arg instanceof Error) return arg.stack || arg.message;
    if (typeof arg === "object") return JSON.stringify(arg, null, 2);
    return String(arg);
  }).join(" ");
  console.log(colorFn(message));
};

// Color-coded loggers
export const logRed = (...args: unknown[]): void => log(chalk.red, ...args);       // Failures
export const logGreen = (...args: unknown[]): void => log(chalk.green, ...args);   // Success
export const logBlue = (...args: unknown[]): void => log(chalk.blue, ...args);     // Comments
export const logYellow = (...args: unknown[]): void => log(chalk.yellow, ...args); // Warnings
export const logMagenta = (...args: unknown[]): void => log(chalk.magenta, ...args);// Data
export const logCyan = (...args: unknown[]): void => log(chalk.cyan, ...args);     // Status

// Optional: startup debug
logGreen("[helpers/loggerHelper] Logger helper module loaded:");
