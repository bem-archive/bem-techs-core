'use strict';

exports.resolveTech = function resolveTech(techName) {
    return require.resolve('./techs/' + techName);
};
