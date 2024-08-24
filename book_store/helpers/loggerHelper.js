import chalk from 'chalk';

const logRed = (msg) => console.log(chalk.red(msg));
const logGreen = (msg) => console.log(chalk.green(msg));
const logBlue = (msg) => console.log(chalk.blue(msg));
const logMagenta = (msg) => console.log(chalk.magenta(msg));

// Usage
logRed('This is a red message');
logGreen('This is a green message');

