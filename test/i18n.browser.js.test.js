'use strict';
var BEMSmoke = require('bem-smoke');

var decl = {
    deps: [
        {block: 'block'}
    ]
};

describe('i18n.browser.js tech', function(done) {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/i18n.browser.js.js'));
        tech.withSourceFiles({
            'ym': {
                'ym.js': '//ym chunk'
            },
            'block': {
                'block.browser.js': '//browser'
            },
            'out.i18n': {
                'all.js': '({"en": {"block": {"test": "test"}}})'
            }
        })
        .withTechMap({
            'browser.js': require.resolve('../techs/browser.js.js'),
            'vanilla.js': require.resolve('../techs/vanilla.js.js'),
            'js': require.resolve('bem/lib/techs/v2/js.js')
        })
        .withMockedModulesResolves({
            'ym': '/ym/ym.js'
        })
        .build('/out', decl)
        .notify(done);
    });

    it('builds browser.js with appended i18n keys', function(done) {
        tech.producesFile('/out.en.js')
        .withContent('/* ym/ym.js: begin */ /**/',
                     '//ym chunk;',
                     '/* ym/ym.js: end */ /**/',
                     '',
                     '/* block/block.browser.js: begin */ /**/',
                     '//browser;',
                     '/* block/block.browser.js: end */ /**/',
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

    it('not invalidates when nothing changed', function(done) {
        tech.build('/out', decl)
            .notWritesToFile('out.en.js')
            .notify(done);
    });

    it.skip('invlidates when i18n files changed', function(done) {
        tech.touchFile('block/block.i18n/all.js')
            .build('/out', decl)
            .writesToFile('out.en.js')
            .notify(done);
    });

    it('invlidates when js files changed', function(done) {
        tech.touchFile('block/block.browser.js')
            .build('/out', decl)
            .writesToFile('out.en.js')
            .notify(done);
    });
});
