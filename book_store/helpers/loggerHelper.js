import chalk from 'chalk';

const logRed = (msg) => console.log(chalk.red(msg)); // Failure response / Extremely Important
const logGreen = (msg) => console.log(chalk.green(msg)); // Successful response
const logBlue = (msg) => console.log(chalk.blue(msg)); //  Comments
const logYellow = (msg) => console.log(chalk.yellow(msg)); // Warning
const logMagenta = (msg) => console.log(chalk.magenta(msg)); // Show Data
const logCyan = (msg) => console.log(chalk.cyan(msg)); // Start/End Loading Message

logGreen('[helpers/loggerHelper] Logger helper module loaded:'); // Debugging line

// loggerHelper Import
// import { logRed, logGreen, logBlue, logYellow, logMagenta, logCyan } from "../helpers/loggerHelper.js";

export { logRed, logGreen, logBlue, logYellow, logMagenta, logCyan };

