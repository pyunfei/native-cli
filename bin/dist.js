require('shelljs/global');
const fs = require('fs');
const Printer = require('@darkobits/lolcatjs');
const figlet = require('figlet');
const symbols = require('log-symbols')
const inquirer = require('inquirer');
const ora = require('ora');
const handlebar = require('handlebars')
const chalk = require('chalk');
const spawn = require('cross-spawn');
const execSync = require('child_process').execSync;

const download = require('download-git-repo');
const template = 'direct:https://github.com/pyunfei/macdown.git';
const spinner = ora("🚀 react cli玩命加载中...");

const parseArray = [
  {
    type: "text",
    message: "请输入项目名称",
    name: "name",
    validate(val) {
      if (!val) { // 验证一下输入是否正确
        return '请输入文件名';
      }
      if (fs.existsSync(val)) { // 判断文件是否存在
        return '❌ 该文件名已存在';
      } else {
        return true;
      };
    }
  },
  {
    type: "text",
    name: 'version',
    message: '请输入项目版本',
    default: '1.0.0'
  },
  {
    type: "text",
    name: 'description',
    message: '请输入项目描述信息',
    default: 'React'
  },
  {
    name: 'author',
    message: '请输入作者名称',
    default: ''
  },
  {
    type: "list",
    message: "请选择需要使用的基础模板",
    choices: ["➤ macDown", "➤ reactNative", "➤ flutter"],
    name: "kind"
  }
]

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

const installPackages = () => {
  console.log(chalk.white.bold('Installing Packages'));
  return new Promise((resolve, reject) => {
    let command;
    let args = ['install'];

    if (shouldUseYarn()) {
      command = 'yarn';
    } else {
      command = 'npm';
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`
        });
        return;
      }
      resolve();
    })
  })
}

const binParams = {
  init() {
    inquirer
      .prompt(parseArray)
      .then(answers => {
        let { name, version, description, author, kind } = answers;
        kind = kind.slice(1)
        spinner.start();
        spinner.color = 'green';
        downloadTemplate({ name, version, description, author, kind });
      })
  }
}

const downloadTemplate = ({ name, version, description, author, kind }) => {
  const parseTemplate = {
    macDown: 'direct:https://github.com/pyunfei/macdown.git',
    reactNative: 'direct:https://github.com/pyunfei/ReactNativeApp.git',
    flutter: 'direct:https://github.com/pyunfei/WeChat-DEV-.git',
  }
  let template = parseTemplate[kind.slice(1)]
  download(template, name, { clone: true }, function (err) {
    if (err) {
      spinner.fail();
      console.log(symbols.error, chalk.red(err))
    } else {
      spinner.succeed();
      const fileName = name + '/package.json'
      const meta = {
        name,
        version,
        description,
        author
      }
      if (fs.existsSync(fileName)) {
        const content = fs.readFileSync(fileName).toString()
        const resultContent = handlebar.compile(content)(meta)
        fs.writeFileSync(fileName, resultContent)

        figlet.text('React CLi', {
          font: 'Henry 3D'
        }, function (err, data) {
          if (err) {
            console.log(chalk.white.bold('React Cli Error'));
          } else {
            console.log(Printer.default.fromString(data));
          }

          console.log('----------------------------------------------------------');
          console.log(chalk.green.bold('Welcome to React Cli'));
          console.log('----------------------------------------------------------');
          cd(name);
          installPackages().then(() => {
            console.log(chalk.white.bold('Let\'s get started'));
            console.log(chalk.green('Step 1: cd into the newly created ' + name + ' directory'));
            console.log('----------------------------------------------------------');
            console.log(chalk.white.bold('For Web'));
            console.log(chalk.green('Step 1. npm run start'));
            console.log(chalk.black.bold('This compiles the JavaScript code and recompiles it whenever any files are changed.'))
            console.log(chalk.green('Step 2. Open index.html in your browser to view the result.'));
            console.log('----------------------------------------------------------');
            console.log(chalk.white.bold('For React Native'));
            console.log(chalk.green('Step 1. run npm run reverse'));
            console.log(chalk.black.bold('Connect next network.'));
            console.log(chalk.green('Step 2. run npm run start'));
            console.log(chalk.black.bold('This compiles the JavaScript code and recompiles it whenever any files are changed.'));
            console.log(chalk.green('Step 3. run npm start (ios/android)'));
            console.log(chalk.black.bold('This starts the React Native Packager (ios/android).'));
            console.log(chalk.white.bold('For Flutter'));
            console.log(chalk.green('Step 1. run flutter run'));
            console.log(chalk.black.bold('This compiles the Dart code and recompiles it whenever any files are changed.'));
            console.log('----------------------------------------------------------');
          })
            .catch(error => {
              console.log(chalk.red('An unexpected error occurred'))
              console.log(chalk.red(error));
            });
        })
      }
    }
  })
}


module.exports = { binParams }