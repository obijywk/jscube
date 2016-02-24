function awaitInitialized(module) {
  return function(done) {
    var checker = setInterval(() => {
      if (module.initialized) {
        clearInterval(checker);
        done();
      }
    }, 1);
  }
}
module.exports.awaitInitialized = awaitInitialized;
