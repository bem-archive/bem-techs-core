var BEMSmoke = require('bem-smoke');

describe('md tech', function() {
    var tech;
    
    beforeEach(function() {
        tech = BEMSmoke.testTech(require.resolve('../techs/md'));
    });

    it('should create russian and english files by default', function(done) {
        tech.create({
            block: 'block'
        })
        .producesFile('/block/block.ru.md')
        .producesFile('/block/block.en.md')
        .notify(done);
    });

    it('should create files for languages in BEM_I18N_LANGS variable', function(done) {
        process.env.BEM_I18N_LANGS = 'klingon quenya';
        tech.create({
            block: 'block'
        })
        .producesFile('/block/block.klingon.md')
        .producesFile('/block/block.quenya.md')
        .notify(done);
    });
});
