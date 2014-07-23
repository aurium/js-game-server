var chalk = require('chalk');
var fs = require('fs');
var path = require('path');

var Sandboxer = require('./lib');

// Load configuration
var config;
try {
  config = require('./config.json');
} catch (err) {
  config = require('./config.dist.json');
  console.log(chalk.yellow("Unable to load 'config.json'"));
  console.log(chalk.yellow("Using 'config.dist.json'"));
}

// Resolve config paths
config.games_directory = path.resolve(config.games_directory);

// Ensure games directory exists
if (!fs.existsSync(config.games_directory)) {
  console.log(chalk.red("Unable to read '" + config.games_directory + "'"));
  process.exit(1);
}

var sandboxer = new Sandboxer(config);
var directories = sandboxer.list();

directories.forEach(function(directory, index) {
  sandboxer.spawn(directory, 3001 + index);
});
