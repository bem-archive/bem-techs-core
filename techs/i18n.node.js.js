'use strict';
var BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-io/fs'),
    LangsMixin = require('./i18n').LangsMixin,
    I18NJS = require('../lib/i18n/i18n-js');



exports.baseTechName = 'node.js';

exports.techMixin = BEM.util.extend({}, LangsMixin, {

    getBaseTechSuffix: function() {
        return 'node.js';
    },

    getWeakBuildSuffixesMap: function() {
        var suffixes = {};

        this.getLangs()
            .map(this.getBuildSuffixForLang, this).concat([this.getBaseTechSuffix()])
            .forEach(function(s) {
                suffixes[s] = [this.getBaseTechSuffix(),'browser.js','vanilla.js'];
            }, this);

        return suffixes;
    },

    getBuildSuffixesMap: function() {
        var suffixes = {};

        this.getLangs()
            .map(this.getBuildSuffixForLang, this).concat([this.getBaseTechSuffix()])
            .forEach(function(s) {
                suffixes[s] = [this.getBaseTechSuffix(),'browser.js'];
            }, this);

        return suffixes;
    },

    getBuildSuffixForLang: function(lang) {
        return lang + '.' + this.getBaseTechSuffix();
    },

    getBuildResults: function(decl, levels, output, opts) {
        
        var _this = this,
            source = this.getPath(output, this.getSourceSuffix()),
            base = this.__base;

        this._allJSPath = source;
        return BEM.util.readJsonJs(source)
            .then(function(data) {
                _this._langData = data;
                return base.call(_this, decl, levels, output, opts);
            });
    },

    getBuildPaths: function(decl, levels) {
        var _this = this;
        return Q.all([this.__base(decl, levels), QFS.lastModified(this._allJSPath)])
                .spread(function(paths, allJSUpdate) {
                    Object.keys(paths).forEach(function(destSuffix) {
                        if (destSuffix !== _this.getBaseTechSuffix()) {
                            paths[destSuffix].push({
                                absPath: _this._allJSPath,
                                suffix: _this.getSourceSuffix(),
                                lastUpdated: allJSUpdate.getTime()
                            });
                        }
                    });
                    return paths;
                });
    },


    getBuildResult: function(files, suffix, output, opts) {
        if (suffix === this.getBaseTechSuffix()) {
            return Q.resolve(output);
        }

        this._lang = suffix.substr(0, 2);
        return this.__base(files, suffix, output, opts);

    },

    getBuildResultChunk: function (relPath, path, suffix) {
        if (path === this._allJSPath) {
            var dataLang = this.extendLangDecl({}, this._langData.all || {});

            dataLang = this.extendLangDecl(dataLang, this._langData[this._lang] || {});
            

            return (dataLang? this.serializeI18nData(dataLang, this._lang) : [])
                        .concat([this.serializeI18nInit(this._lang)])
                        .join('');
        }
        return this.__base(relPath, path, suffix);
    },

    serializeI18nInit: I18NJS.serializeInit,

    serializeI18nData: I18NJS.serializeData,

    storeBuildResult: function(path, suffix, res) {

        if (suffix === this.getBaseTechSuffix()) {
            return BEM.util.symbolicLink(
                path,
                this.getPath(
                    res,
                    this.getBuildSuffixForLang(this.getDefaultLang())),
                true);
        }

        return this.__base(path, suffix, res);

    },

    getDependencies: function() {
        return ['i18n'];
    }

});
