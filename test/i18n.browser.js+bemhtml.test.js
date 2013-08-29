'use strict';

var BEMSmoke = require('bem-smoke');

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

describe('i18n.browser.js+bemhtml.js tech', function() {
    var tech;

    beforeEach(function(done) {
        tech = BEMSmoke.testTech(require.resolve('../techs/i18n.browser.js+bemhtml.js'))
                       .withTechMap({
                           'browser.js+bemhtml': require.resolve('../techs/browser.js+bemhtml.js'),
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
                           },
                           'out.i18n': {
                                'all.js': '({"en": {"block": {"test": "test"}}})'
                           }
                        })
                       .build('/out', decl)
                       .notify(done);

    });

    it('produces file with concatenated browser.js, bemhtml and i18n keys', function(done) {
        tech.producesFile('/out.en.js')
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
                         '',
                         'BEM.I18N.decl("block", {"test": "test"}, {',
                         '"lang": "en"',
                         '});',
                         '',
                         'BEM.I18N.lang("en");',
                         '')
            .notify(done);
    });

    it('does not invalidates when nothing changed', function(done) {
        tech.build('/out', decl)
            .notWritesToFile('/out.en.js')
            .notify(done);
    });

    it('invalidates when browser.js source changed', function(done) {
        tech.touchFile('/block/block.browser.js')
            .build('/out', decl)
            .writesToFile('/out.en.js')
            .notify(done);
    });

    it('invalidates when bemhtml source changed', function(done) {
        tech.touchFile('/block/block.bemhtml.xjst')
            .build('/out', decl)
            .writesToFile('/out.en.js')
            .notify(done);
    });

    it.skip('invalidates when i18n source changed', function(done) {
        tech.touchFile('/out.i18n/all.js')
            .build('/out', decl)
            .writesToFile('/out.en.js')
            .notify(done);
    });
});
