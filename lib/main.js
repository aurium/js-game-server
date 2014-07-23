var chalk = require('chalk');
var cp = require('child_process');
var fs = require('fs');
var minimist = require('minimist');
var path = require('path');

// Process arguments
var argv = minimist(process.argv.slice(2));

var gamesDir = argv['games-dir'] || process.env.GAMES_DIR;
if (!gamesDir) {
  console.log(chalk.red("You must set the 'GAMES_DIR' environment variable or '--games-dir' parameter"));
  process.exit(0);
}

var entries;
try {
  entries = JSON.parse(fs.readFileSync(path.join(gamesDir, 'entries.json')));
} catch (err) {
  console.log(chalk.red("Cannot find 'entries.json'"));
  process.exit(0);
}

entries.forEach(function(entry, index) {
  launch(entry, index)
});

function launch(entry, index) {
  var child = cp.fork(path.join(__dirname, 'child'), [
    '--path', path.join(gamesDir, entry),
    '--port', 3001 + index,
  ]);

  // Errors are handled through message events
  child.on('message', function(err) {
    child.kill();
    // TODO(ooflorent): Relaunch the game
  });
}
