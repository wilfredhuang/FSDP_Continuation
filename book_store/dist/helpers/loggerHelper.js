import chalk from "chalk";
/**
 * Generic log function that accepts any number of values
 */
const log = (colorFn, ...args) => {
    // Join all arguments safely into one printable string
    const message = args.map(arg => {
        if (arg instanceof Error)
            return arg.stack || arg.message;
        if (typeof arg === "object")
            return JSON.stringify(arg, null, 2);
        return String(arg);
    }).join(" ");
    console.log(colorFn(message));
};
// Color-coded loggers
export const logRed = (...args) => log(chalk.red, ...args); // Failures
export const logGreen = (...args) => log(chalk.green, ...args); // Success
export const logBlue = (...args) => log(chalk.blue, ...args); // Comments
export const logYellow = (...args) => log(chalk.yellow, ...args); // Warnings
export const logMagenta = (...args) => log(chalk.magenta, ...args); // Data
export const logCyan = (...args) => log(chalk.cyan, ...args); // Status
// Optional: startup debug
logGreen("[helpers/loggerHelper] Logger helper module loaded:");
//# sourceMappingURL=loggerHelper.js.map