var handlers = require('./command-handlers');

module.exports = {
  name: 'disk',
  description: 'View and clean disk usage',
  commands: {
    show: {
      description: 'Show disk usage on each server',
      handler: handlers.show
    },
    clean: {
      description: 'Remove unneeded and old files from previous deploys',
      handler: handlers.clean
    }
  }
}