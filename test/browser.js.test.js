var BEMSmoke = require('bem-smoke');

describe('browser.js tech', function() {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/browser.js.js'))
                       .withTechMap({
                           'vanilla.js': require.resolve('../techs/vanilla.js.js'),
                           'js': require.resolve('bem/lib/techs/v2/js.js')
                       });
    });

    it('builds js file with browser.js', function(done) {
        tech.withSourceFiles({
            'ym': {
                'ym.js': '//ym chunk'
            },
            'block': {
                'block.browser.js': '//browser'
            }
        })
        .withMockedModulesResolves({
            'ym': '/ym/ym.js'
        })
        .build('/out', {
            deps: [
                {block: 'block'}
            ]
        })
        .producesFile('/out.js')
        .withContent('/* ym/ym.js: begin */ /**/',
                     '//ym chunk;',
                     '/* ym/ym.js: end */ /**/',
                     '',
                     '/* block/block.browser.js: begin */ /**/',
                     '//browser;',
                     '/* block/block.browser.js: end */ /**/',
                     '',
                     '')
        .notify(done);
    });
});
