var topolr=require("topolr-util");
var base=require("./cache");

var filecache=function (option) {
    base.call(this,topolr.extend({
        path:"",
        cycle:100
    },option));
};
filecache.prototype=new base();
filecache.prototype.setCache=function (id,content) {
    return topolr.file(this.option.path+id+".cache").write(JSON.stringify(content));
};
filecache.prototype.getCache=function (id) {
    return topolr.file(this.option.path+id+".cache").read().then(function (a) {
        return JSON.parse(a);
    });
};
filecache.prototype.removeCache=function (id) {
    return topolr.file(this.option.path+id+".cache").remove();
};
filecache.prototype.checkCache=function (id) {
    var ths=this;
    var a=topolr.file(this.option.path+id+".cache").isExists();
    if(!a) {
        return topolr.promise(function (b) {
            b(a);
        });
    }else{
        var ps=topolr.promise();
        topolr.file(this.option.path+id+".cache").info().then(function (a) {
            if(new Date().getTime()-new Date(a.ctime).getTime()<ths.option.cycle){
                ps.resolve(true);
            }else{
                ps.resolve(false);
            }
        });
        return ps;
    }
};
filecache.prototype.clean=function () {
    topolr.file(this.option.path).remove();
};
module.exports=filecache;