var topolr=require("topolr-util");
var base=require("./cache");

var memoryCache=function (option) {
    base.call(this,topolr.extend({
        cycle:100
    },option));
    this._data={};
};
memoryCache.prototype=new base();
memoryCache.prototype.setCache=function (id,content) {
    this._data[id]={
        content:content,
        time:new Date().getTime()
    };
    return topolr.promise(function (a) {
        a();
    })
};
memoryCache.prototype.getCache=function (id) {
    var ths=this;
    return topolr.promise(function (a) {
        a(ths._data[id].content);
    });
};
memoryCache.prototype.removeCache=function (id) {
    var ths=this;
    return topolr.promise(function () {
        a(delete ths._data[id])
    });
};
memoryCache.prototype.checkCache=function (id) {
    var ab=this._data[id];
    if(ab){
        if(new Date().getTime()-this._data[id].time>this.option.cycle){
            ab=false;
        }
    }
    return topolr.promise(function (a) {
        a(ab);
    });
};
memoryCache.prototype.clean=function () {
    this._data={};
};
module.exports=memoryCache;