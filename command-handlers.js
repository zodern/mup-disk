var Promise = require('bluebird');
var chalk = require('chalk');
var inquirer = require('inquirer');

function serverUsage(api, server) {
  console.log(chalk.blue(`======= ${server.host} =======`));
  console.log(chalk.cyan('=> Overview'));

  return api.runSSHCommand(server, 'df -h /')
    .then((result) => {
      console.log(result.output);
    })
    .then(() => {
      console.log(chalk.cyan('=> Apps, MongoDB, and Reverse Proxy'));
      return api.runSSHCommand(server, 'du -h --max-depth=2 /opt');
    })
    .then((result) => {
      console.log(result.output);
    })
    .then((result) => {
      console.log(chalk.cyan('=> Docker Usage'));
      return api.runSSHCommand(server, 'docker system df --verbose');
    })
    .then((result) => {
      console.log(result.output);
    })
    .catch(e => {
      console.log(e);
    })
}

function show(api, nodemiral) {
  const servers = api.getConfig().servers;
  Promise.each(Object.values(servers), (server) => {
    return serverUsage(api, server);
  });
}

function clean(api, nodemiral) {
  console.log(`
  This command will ${chalk.red('permenantly delete')} files and docker items, including:
  - unused docker images
  - stopped docker containers
  - files created by your app before the last deploy/start
  - unused docker volumes.
  `);

  inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Are you sure you want to continue?',
      default: false
    }
  ]).then(answer => {
    if (!answer.continue) {
      return
    }

    const servers = api.getConfig().servers;
    const appConfig = api.getConfig().app
    const appName = appConfig ? appConfig.name : undefined;
    const lastPath = `/opt/${appName}/last/bundle`;

    // Should never happen, but there have been several issues and 
    // comments on Github reporting it.
    const lastInCurrent = `/opt/${appName}/current/last`;

    Promise.each(Object.values(servers), (server) => {
      console.log(chalk.blue(`===== Cleaning ${server.host} =====`));
      console.log(chalk.cyan('=> Docker'));

      return api.runSSHCommand(server, 'docker system prune -af')
        .then((result) => {
          console.log(result.output);

          console.log(chalk.cyan('=> Files from previous deploy'));
          return api.runSSHCommand(server, `rm -rf ${lastPath}`);
        })
        .then((result) => {
          console.log(result.output);

          return api.runSSHCommand(server, `rm -rf ${lastInCurrent}`)
        })
        .then((result) => {
          console.log(result.output);
        })
        .catch(e => {
          console.log(e);
        })
    });
  });
}

module.exports = {
  show: show,
  clean: clean
};
