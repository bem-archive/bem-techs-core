'use strict';

var dbg = 1;
var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    ymPath = require.resolve('ym'),
    Deps = require('bem/lib/techs/v2/deps.js').Deps;

exports.baseTechName = 'vanilla.js';

exports.techMixin = {

    getWeakBuildSuffixesMap:function(){
        return { 'js' : ['vanilla.js', 'browser.js', 'js'] };
    },

    getBuildSuffixesMap:function(){
        return { 'js' : ['browser.js', 'js'] };
    },
    
    getCreateSuffixes : function() {
        return ['browser.js'];
    },

    transformBuildDecl: function(decl) {
        var                 _this = this;

        return decl.then(function(decl){
            
            var depsGraph = new Deps().parseDepsDecl(decl);

            var includeTechs = {
                'browser.js': true,
                'vanilla.js': true
            };

            var                 uniq = {
                'browser.js':{},
                'vanilla.js':{},
                '':{}
            };
            var items = [];
            
            depsGraph.walk(
                [depsGraph.rootItem],
                _predicate('browser.js'),
                _action('browser.js'));

            // depsGraph.walk(
            //     [depsGraph.rootItem],
            //     _predicate(_this.getTechName()),
            //     _action(_this.getTechName()));

            function _predicate(buildTech){
                return function(item, ctx){
                    var key = item.buildKey();
                    if(!uniq[buildTech][key]) {
//console.log('(dep',ctx.buildKey(),'->\t',key,')');
                        var itemTech = item.item.tech;
                        uniq[buildTech][key] = 1;
                        if(!itemTech){
                            // regular, non-tech dependency
                            if(true){
                                // check if there's unvisited tech
                                // item in graph, and include it's
                                // deps first
                                var item1 = item.clone();
                                delete item1.key
                                item1.item.tech = buildTech;
                                var key1 = item1.buildKey();
                                if(depsGraph.items[key1]){
                                    depsGraph.walk([item1], _predicate(buildTech), _action(buildTech));
                                }
                            }
                            return true;
                        } else {
                            // tech dependency
                            if(itemTech === buildTech){
                                return true;
                            } else if(itemTech in includeTechs){
                                // tech dependency that should be
                                // included in build
                                depsGraph.walk([item], _predicate(itemTech), _action(itemTech))
                                return false;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }
            }

            function _action(buildTech){
                return function(item, ctx){
                    var key = item.buildKey();
                    if(uniq[buildTech][key] === 1) {
                        uniq[buildTech][key] = 2;

                        // since every item becomes a tech item, we should
                        // normalize the item's key to be a tech key
                        // to not include tech and non-tech item twice
                        if(!item.item.tech){
                            item = item.clone();
                            delete item.key; // XXX: key is kind of
                            // private, but there's no way to unset it
                            // from the outside
                            item.item.tech = buildTech;
                            key = item.buildKey();
                        }
dbg && console.log('(include',key,')')
                        if(!uniq[''][key]){
                            uniq[''][key] = 1;
                            items.push(item.item);
                        }
                    }
                }
            }

dbg && console.log('================================================================')
dbg && console.log(items)
            return { deps: items };
            
        })
    },

    getYmChunk : function(output) {
        var outputDir = PATH.resolve(output, '..');
        var ymRelPath = PATH.relative(outputDir, ymPath);
        return this.getBuildResultChunk(ymRelPath, ymPath);
    },

    getBuildResult : function(files, suffix, output) {
        return Q.all([
                this.getYmChunk(output),
                this.__base.apply(this, arguments)
            ])
            .spread(function(ym, res) {
                return [ym].concat(res);
            });
    }

};
