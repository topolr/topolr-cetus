var Runtime=require("./base/runtime");
var topolr=require("topolr-util");
var Request=require("request");
var config=require("./config/config");
var cacheMap=config.cache;

var cetus=function (option) {
    this.option=topolr.extend({
        sitePath:"http://localhost/topolr-blog/",
        basePath:"front/src/",
        root:"option.root.blog",
        localhost:"localhost:8080",
        cache:{
            type:"memory",
            cycle:10000000000000
        }
    },option);
    if(this.option.sitePath[this.option.sitePath.length-1]!=="/"){
        this.option.sitePath=this.option.sitePath+"/";
    }
    this._runtime=Runtime(this.option);
    this._cache=new (cacheMap[this.option.cache.type]||cacheMap.memory)(this.option.cache);
};
cetus.prototype.getPageContent=function (url) {
    var id=topolr.hash.md5(url).substring(0,10),ths=this;
    return ths._cache.checkCache(id).then(function (nope) {
        if(nope) {
            return ths._cache.getCache(id);
        }else{
            var ps=topolr.promise();
            ths._runtime.getPageContent(url,function (info) {
                ths._cache.setCache(id,info).then(function () {
                    ps.resolve(info);
                });
            });
            return ps;
        }
    });
};
cetus.prototype.removeCache=function (url) {
    var id=topolr.hash.md5(url).substring(0,10);
    return ths._cache.removeCache(id);
};
cetus.prototype.cleanCache=function () {
    ths._cache.clean();
};
cetus.prototype.isReady=function () {
    return this._runtime.isReady();
};

module.exports=function (option) {
    return new cetus(option);
};