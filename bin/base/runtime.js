var win = require("./window");
var topolr = require("topolr-util");

var runtime = function (option) {
    var window = win(option);
    try{
        window.console={
            log:function (str) {
                topolr.log("    (color:32=>cetus) (color:cyan=>{{str}})",{str:str});
            },
            error:function (str) {
                topolr.log("    (color:32=>cetus) (color:red=>{{str}})",{str:str});
            }
        };
        (new Function("window",
            "document","XMLHttpRequest","$",
            "FormData","Blob","File","console",
            topolr.file(topolr.cpath.getRelativePath(__dirname,"./../topolr/topolr.js")).readSync()))(window, window.document,window.XMLHttpRequest,window.topolr,window.FormData,window.Blob,window.File,window.console);
    }catch(e){
        console.error(e);
    }
    this._option=option;
    this._queue=topolr.dynamicQueue();
    this._window=window;
    this._init=false;
};
runtime.init=function () {
    if(!this._init) {
        var ths=this;
        var option=this._option;
        this._queue.add(function () {
            var queue = this;
            runtime.hook.call(ths,function () {
                ths._init = true;
                queue.next();
            });
            ths._window.App({
                sitePath: option.sitePath,
                basePath: option.basePath,
                title:option.title||"",
                description:option.description||"",
                keywords:option.keywords,
                map:option.map||{},
                boot:option.boot
            }).boot();
        });
    }
};
runtime.hook=function (fn) {
    var ths = this,m=false;
    var mt=setTimeout(function () {
        if (!m) {
            fn&&fn();
        }
    }, 2000);
    this._window.pageComplete = function () {
        m = true;
        ths.pageComplete = null;
        clearTimeout(mt);
        fn&&fn();
    };
};
runtime.prototype.isReady=function () {
    return this._init;
};
runtime.prototype.init=function () {
    var ths=this,option=this._option;
    return topolr.promise(function (a) {
        runtime.hook.call(ths,function () {
            ths._init = true;
            a();
        });
        ths._window.App({
            sitePath: option.sitePath,
            basePath: option.basePath,
            title:option.title||"",
            description:option.description||"",
            keywords:option.keywords,
            map:option.map||{}
        }).boot(option.root);
    });
};
runtime.prototype.getPageContent=function (url,fn) {
    var ths=this;
    runtime.init.call(this);
    this._queue.add(function (a,b) {
        var queue=this;
        runtime.hook.call(ths,function () {
            b.fn&&b.fn({
                body:ths._window.document.body.innerHTML,
                title:ths._window.app.option.title,
                keywords:ths._window.app.option.keywords,
                description:ths._window.app.description
            });
            queue.next();
        });
        ths._window.location.href=url;
    },null,{
        url:url,
        fn:fn
    });
    return this;
};
module.exports = function (option) {
    return new runtime(option);
};