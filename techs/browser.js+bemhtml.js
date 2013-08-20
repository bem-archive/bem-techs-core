'use strict';

var BEM = require('bem'),
    Q = BEM.require('q');


exports.API_VER = 2;

exports.techMixin = {

    getBuildSuffixesMap: function() {
        return {
            'js': ['vanilla.js', 'js', 'browser.js', 'bemhtml', 'bemhtml.xjst']
        };
    },

    getTechBuildResults: function(techName, decl, output, opts) {
        opts = Object.create(opts);
        opts.force = true;
        var tech = this.context.createTech(techName);
        return tech.getBuildResults(decl, this.context.getLevels(), output, opts);

    },

    getBuildResult: function(files, suffix, output, opts) {
        var _this = this;
        return this.context.opts.declaration
            .then(function(decl) {
                var browserJsResults = _this.getTechBuildResults('browser.js', decl, output, opts);

                if (!decl.depsByTechs || ! decl.depsByTechs.js) {
                    return browserJsResults;
                }

                var bemhtmlDecl = {
                    deps: decl.depsByTechs.js.bemhtml
                };

                var bemhtmlResults = _this.getTechBuildResults('bemhtml', bemhtmlDecl, output, opts);

                return Q.all([browserJsResults, bemhtmlResults])
                    .spread(function(browserJs, bemhtml) {
                        return [
                            browserJs.js.join(''),
                            bemhtml['bemhtml.js']
                        ].join('\n');
                    });

            });
    }

};
