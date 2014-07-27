exports.keys = function(obj) {
  var list = [];
  for ( k in obj ) list.push(k);
  return list;
}
