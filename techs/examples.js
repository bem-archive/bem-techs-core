var PATH = require('path'),
    environ = require('bem-environ');

exports.baseTechPath = environ.getLibPath('bem-pr', 'bem/techs/examples.js');

exports.getBaseLevel = function() {
    return PATH.resolve(__dirname, '../levels/bundles.js');
};
