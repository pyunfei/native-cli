#!/usr/bin/env node

const program = require('commander');
const Printer = require('@darkobits/lolcatjs');
const chalk = require('chalk');

const { binParams } = require('./dist');

program
  .version(Printer.default.fromString('1.0.0'), "-v, --version")
  .usage("[cmd] <options>")
  .arguments("<cmd> [env]")
  .action((cmd, otherParams) => {
    const handler = binParams[cmd]
    if (typeof handler === "undefined") {
      console.log(`${chalk.yellow.bold("️ ❌ ")}sorry commander [${chalk.red(cmd)}] It's not defined 👽`);
      process.exit(1)
    } else {
      if (program.args.length < 1) {
        console.log(chalk.red('Please supply a name for your new React Cli app.'));
      } else {
        handler(otherParams)
      }
    }
  })
  .parse(process.argv)