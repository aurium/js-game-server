var inspect = require('util').inspect;
var now = function() { return (new Date).toISOString() };

module.exports = function logFactory(source) {
  return function() { logFormater(source, arguments) };
};

var logFormater = module.exports.logFormater = function (source, origArgs) {
  var args = []; args.push.apply(args,origArgs);
  args.forEach(function(val, i){ args[i] = inspect(val,{colors:true}) });
  console.log(now()+' '+source+' >', args.join(' | ').replace(/\n/g,' '));
};
