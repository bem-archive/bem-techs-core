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
                'block.i18n': {
                    'all.js': '({"en": {"block": {"test": "test"}}})'
                },
                'block.browser.js': '//browser'
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
        .build('/block/block', decl)
        .notify(done);
    });

    it('builds browser.js with appended i18n keys', function(done) {
        tech.producesFile('/block/block.en.js')
        .withContent('/* ../ym/ym.js: begin */ /**/',
                     '//ym chunk;',
                     '/* ../ym/ym.js: end */ /**/',
                     '',
                     '/* block.browser.js: begin */ /**/',
                     '//browser;',
                     '/* block.browser.js: end */ /**/',
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
        tech.build('/block/block', decl)
            .notWritesToFile('block/block.en.js')
            .notify(done);
    });

    it('invlidates when i18n files changed', function(done) {
        tech.touchFile('block/block.i18n/all.js')
            .build('block/block', decl)
            .writesToFile('block/block.en.js')
            .notify(done);
    });

    it('invlidates when js files changed', function(done) {
        tech.touchFile('block/block.browser.js')
            .build('block/block', decl)
            .writesToFile('block/block.en.js')
            .notify(done);
    });
});
