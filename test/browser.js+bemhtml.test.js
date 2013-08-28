'use strict';

var BEMSmoke = require('bem-smoke');

describe('browser.js+bemhtml tech', function() {
    var tech;
    var decl = {
        deps: [
            {block: 'block'},
            {
                block: 'block',
                tech: 'js',
                shouldDeps: [
                    {block: 'block', tech: 'bemhtml'}
                ]
            }
        ]
    };

    beforeEach(function(done) {
        tech = BEMSmoke.testTech(require.resolve('../techs/browser.js+bemhtml.js'))
                       .withTechMap({
                           'bemhtml': require.resolve('../techs/bemhtml.js'),
                           'browser.js': require.resolve('../techs/browser.js.js'),
                           'vanilla.js': require.resolve('../techs/vanilla.js.js'),
                           'js': require.resolve('bem/lib/techs/v2/js.js')
                       })
                       .withMockedModulesResolves({
                           'ym': '/ym/ym.js'
                       })
                       .withMockedModules({
                           '../lib/bemhtml': {
                               translate: function(sources) {
                                   return 'compiled:\n' + sources;
                               }
                           }
                       })
                       .withSourceFiles({
                           'ym': {
                               'ym.js': '//ym chunk',
                           },
                           'block': {
                               'block.browser.js': '//js',
                               'block.bemhtml.xjst': 'bemhtml'
                           }
                        })
                       .build('/out', decl)
                       .notify(done);
    });

    it('produces concateneated js with ym chunk and appends compiled bemhtml to the bottom', function(done) {
        tech.producesFile('/out.js')
            .withContent('/* ym/ym.js: begin */ /**/',
                         '//ym chunk;',
                         '/* ym/ym.js: end */ /**/',
                         '',
                         '/* block/block.browser.js: begin */ /**/',
                         '//js;',
                         '/* block/block.browser.js: end */ /**/',
                         '',
                         'compiled:',
                         '',
                         '/* begin: block/block.bemhtml.xjst */',
                         'bemhtml',
                         '/* end: block/block.bemhtml.xjst */',
                         '',
                         '')
            .notify(done);
    });

    describe('build cache invalidation', function() {
        it('does not rebuilds out file when no sources changed', function(done) {
            tech.build('/out', decl)
                .notWritesToFile('/out.js')
                .notify(done);
        });

        it('rebuilds out file when browser.js source changed', function(done) {
            tech.touchFile('/block/block.browser.js')
                .build('/out', decl)
                .writesToFile('/out.js')
                .notify(done);
        });

        it('rebuilds out file when bemhtml source changed', function(done) {
            tech.touchFile('/block/block.bemhtml.xjst')
                .build('/out', decl)
                .writesToFile('/out.js')
                .notify(done);
        });
    });
});
