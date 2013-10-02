'use strict';

var BEM = require('bem'),
    Q = BEM.require('q'),
    Deps = require('bem/lib/techs/v2/deps.js').Deps;

exports.API_VER = 2;

exports.techMixin = {

    getWeakBuildSuffixesMap:function(){
        return { 'js' : ['browser.js', 'vanilla.js', 'js', 'bemhtml', 'bemhtml.xjst'] };
    },

    getBuildSuffixesMap:function(){
        return { 'js' : ['browser.js', 'js'] };
    },

    transformBuildDecl:function(decl_){
        var _this = this;
        
        return decl_.then(function(decl){
            var browserTech = _this.context.createTech('browser.js');
            var browserDeps_ = browserTech.transformBuildDecl(decl_, { 'bemhtml' : 1 });
            return browserDeps_.then(function(browserDeps){

                var bemhtmlItems = [];
                var uniq = {};
                var depsGraph = new Deps().parseDepsDecl(decl);

                var keys = browserDeps.adjacentRoots.bemhtml.map(function(item){return item.buildKey()})

                depsGraph._walk(keys, depsGraph.items[''], _predicate, _action);

                function _predicate(item, ctx) {
                    var key = item.buildKey();
                    if(!uniq[key]){
                        uniq[key] = 1;
                        if(item.item.tech === 'bemhtml'){
                            return true;
                        } else if(!item.item.tech){
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                
                function _action(item) {
                    var key = item.buildKey();
                    if(uniq[key] === 1){
                        uniq[key] = 2;

                        if(!item.item.tech){
                            item = item.clone();
                            delete item.key;
                            item.item.tech = 'bemhtml';
                            key = item.buildKey();

                            if(!uniq[key] || uniq[key] === 1){
                                uniq[key] = 2;
                                bemhtmlItems.push(item.item);
                            }
                            
                        } else {
                            bemhtmlItems.push(item.item)
                        }
                    }
                }
                var res = {
                    deps: browserDeps.deps.concat(bemhtmlItems),
                    browserDeps: browserDeps.deps,
                    bemhtmlDeps: bemhtmlItems
                };

                _this._decl = res;

                return res;
                
            });
            
        });
    },

    getBuildResult: function(files, destSuffix, output, opts) {
        var _this = this;
        var decl = _this._decl;
        var browserDeps = decl.browserDeps;
        var bemhtmlDeps = decl.bemhtmlDeps;
        var levels = this.context.getLevels();
        
        var bemhtmlTech = _this.context.createTech('bemhtml'),
            browserTech = _this.context.createTech('browser.js');

        if(!(browserTech.API_VER === 2 && bemhtmlTech.API_VER === 2)){
            return Q.reject(_this.getTechName() + ' can\'t use v1 techs to produce pieces of result');
        }

        var broDecl = {deps: decl.browserDeps};
        var bhDecl = {deps: decl.bemhtmlDeps};

        opts = Object.create(opts);
        opts.force = true;

        return Q.all([
            bemhtmlTech.getBuildResults(Q.when(bhDecl), levels, output, opts),
            browserTech.getBuildResults(Q.when(broDecl), levels, output, opts)
        ]).spread(function(bemhtml,browser){
            browser.js.push(bemhtml['bemhtml.js']+'\n')
            return browser.js;
        })
        
    }

};
