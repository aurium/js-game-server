var fs = require('fs');
var path = require('path');
var vm = require('vm');
var merge = require('merge');
var resolve = require('./resolve');

var cache = {};

function Sandbox(root, base, options) {
  if (typeof base === 'object') {
    options = base;
    base = null;
  }

  this.root = root;
  this.base = base || root;

  this.options = merge({
    modules: [],
    shims: {},
    globals: {},
  }, options);

  this.resolve = resolve(this.base);
}

Sandbox.prototype.require = function(module) {
  // Sanctioned modules
  if (this.options.modules.indexOf(module) >= 0) {
    return require(module);
  }

  // Shimed modules
  if (this.options.shims.hasOwnProperty(module)) {
    return this.options.shims[module];
  }

  // Resolve the file
  var file = this.resolve(module);

  // Exclude non sanctioned modules
  if (file[0] !== '/') {
    throw new Error("Cannot find module '" + module + "'");
  }

  // Exclude files outside the sandbox
  var relative = path.relative(this.root, file);
  if (relative.indexOf('../') >= 0) {
    throw new Error("Cannot find module '" + module + "'");
  }

  // Do not proxify JSON
  if (/\.json$/.test(file)) {
    return require(file);
  }

  // Read from cache
  if (cache[file]) {
    return cache[file];
  }

  // Read the file
  var contents = fs.readFileSync(file).toString();

  // Create the context
  var mod = {exports: {}};
  var context = vm.createContext(merge({
    __filename: file,
    __dirname: path.dirname(file),
    module: mod,
    exports: mod.exports,
    require: this.requireFactory(file)
  }, this.options.globals));

  // Execute the module
  vm.runInContext(contents, context, {
    filename: relative,
    displayErrors: false,
  });

  // Return exports
  return ( cache[file] = mod.exports );
};

Sandbox.prototype.requireFactory = function(file) {
  // Create a new sandbox
  var sandbox = new Sandbox(this.root, path.dirname(file), this.options);
  var req;

  // Create require and require.resolve bindings
  req = sandbox.require.bind(sandbox);
  req.resolve = sandbox.resolve.bind(sandbox);

  return req;
};

module.exports = Sandbox;
