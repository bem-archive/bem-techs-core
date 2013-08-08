var BEMSmoke = require('bem-smoke');

describe.skip('browser.js tech', function() {
    var tech;
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/browser.js.js'))
                       .withTechMap({
                           'vanilla.js': require.resolve('../lib/vanilla.js.js'),
                           'js': require.resolve('bem/lib/techs/v2/js.js')
                       });
    });

    it('builds js file with browser.js', function(done) {
        tech.withSourceFiles({
            'block': {
                'block.browser.js': '//browser'
            }
        })
        .build('/out', {
            deps: [
                {block: 'block'}
            ]
        })
        .producesFile('/out.browser.js')
        .withContent('')
        .notify(done);
    });
});
