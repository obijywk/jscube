function errorThrower(err) {
  if (err) {
    throw err;
  }
}
module.exports.thrower = errorThrower;
