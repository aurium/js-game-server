#!/usr/bin/env node

var program = require('commander');
var Sandboxer = require('../lib');

// Usage
program
  .version(require('../package').version)
  .usage('<command> [<args> ...]');

program
  .command('install <bundle>')
  .description('install a bundle')
  .action(function(bundle) {
    console.log('install', bundle);
  });

program
  .command('uninstall <bundle>')
  .description('uninstall a bundle')
  .action(function(bundle) {
    console.log('uninstall', bundle);
  });

program
  .command('ls')
  .description('list installed bundles')
  .action(function() {
    console.log('ls');
  });

program
  .parse(process.argv);
