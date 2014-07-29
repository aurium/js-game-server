'use strict';

exports.keys = function(obj) {
  var list = [];
  for (var k in obj) list.push(k);
  return list;
};
